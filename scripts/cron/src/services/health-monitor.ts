import { logger } from '../config/logger.js';
import { getDatabase } from '../config/database.js';
import { jobTracker } from './job-tracker.js';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  lastChecked: Date;
  responseTime?: number;
  details?: Record<string, unknown>;
}

interface SystemHealth {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  checks: HealthCheck[];
  uptime: number;
  timestamp: Date;
  version: string;
}

class HealthMonitor {
  private checks: Map<string, HealthCheck> = new Map();
  private readonly version = process.env.npm_package_version || '1.0.0';

  async performDatabaseCheck(): Promise<HealthCheck> {
    const startTime = Date.now();
    const check: HealthCheck = {
      name: 'database',
      status: 'healthy',
      lastChecked: new Date(),
      responseTime: 0
    };

    try {
      const db = getDatabase();
      
      // Simple connectivity test
      await db.$queryRaw`SELECT 1 as test`;
      
      // Check if we can read from main tables
      const userCount = await db.user.count();
      const accountCount = await db.moneyAccount.count();
      const ruleCount = await db.recurringTransactionRule.count();
      
      check.responseTime = Date.now() - startTime;
      check.details = {
        userCount,
        accountCount,
        recurringRulesCount: ruleCount,
        connectionPool: 'active'
      };

      if (check.responseTime > 5000) {
        check.status = 'degraded';
        check.message = 'Database response time is slow';
      }

    } catch (error) {
      check.status = 'unhealthy';
      check.message = error instanceof Error ? error.message : 'Database connection failed';
      check.responseTime = Date.now() - startTime;
      
      logger.error('Database health check failed', { error });
    }

    this.checks.set('database', check);
    return check;
  }

  async performJobSystemCheck(): Promise<HealthCheck> {
    const check: HealthCheck = {
      name: 'job_system',
      status: 'healthy',
      lastChecked: new Date()
    };

    try {
      const stats = jobTracker.getJobStats('recurring-transactions');
      const runningJobs = jobTracker.getRunningJobs();
      
      // Check if there are any long-running jobs (> 30 minutes)
      const longRunningJobs = runningJobs.filter(job => 
        Date.now() - job.startTime.getTime() > 30 * 60 * 1000
      );

      // Check recent failure rate
      const recentFailureRate = stats.totalExecutions > 0 
        ? stats.failedExecutions / stats.totalExecutions 
        : 0;

      check.details = {
        totalExecutions: stats.totalExecutions,
        successfulExecutions: stats.successfulExecutions,
        failedExecutions: stats.failedExecutions,
        failureRate: recentFailureRate,
        averageDuration: stats.averageDuration,
        runningJobs: runningJobs.length,
        longRunningJobs: longRunningJobs.length,
        lastExecution: stats.lastExecution?.startTime
      };

      if (longRunningJobs.length > 0) {
        check.status = 'degraded';
        check.message = `${longRunningJobs.length} long-running jobs detected`;
      } else if (recentFailureRate > 0.5) {
        check.status = 'degraded';
        check.message = `High failure rate: ${(recentFailureRate * 100).toFixed(1)}%`;
      }

    } catch (error) {
      check.status = 'unhealthy';
      check.message = error instanceof Error ? error.message : 'Job system check failed';
      
      logger.error('Job system health check failed', { error });
    }

    this.checks.set('job_system', check);
    return check;
  }

  async performMemoryCheck(): Promise<HealthCheck> {
    const check: HealthCheck = {
      name: 'memory',
      status: 'healthy',
      lastChecked: new Date()
    };

    try {
      const memUsage = process.memoryUsage();
      const totalMemory = memUsage.heapTotal;
      const usedMemory = memUsage.heapUsed;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;

      check.details = {
        heapUsed: Math.round(usedMemory / 1024 / 1024), // MB
        heapTotal: Math.round(totalMemory / 1024 / 1024), // MB
        usagePercent: Math.round(memoryUsagePercent),
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        rss: Math.round(memUsage.rss / 1024 / 1024) // MB
      };

      if (memoryUsagePercent > 90) {
        check.status = 'unhealthy';
        check.message = 'Memory usage critically high';
      } else if (memoryUsagePercent > 75) {
        check.status = 'degraded';
        check.message = 'Memory usage high';
      }

    } catch (error) {
      check.status = 'unhealthy';
      check.message = error instanceof Error ? error.message : 'Memory check failed';
      
      logger.error('Memory health check failed', { error });
    }

    this.checks.set('memory', check);
    return check;
  }

  async performDiskCheck(): Promise<HealthCheck> {
    const check: HealthCheck = {
      name: 'disk',
      status: 'healthy',
      lastChecked: new Date()
    };

    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Check if logs directory is writable
      const logsDir = path.join(process.cwd(), 'logs');
      
      try {
        await fs.access(logsDir);
      } catch {
        await fs.mkdir(logsDir, { recursive: true });
      }

      // Test write capability
      const testFile = path.join(logsDir, '.health-check');
      await fs.writeFile(testFile, 'health check test');
      await fs.unlink(testFile);

      check.details = {
        logsDirectory: logsDir,
        writable: true
      };

    } catch (error) {
      check.status = 'unhealthy';
      check.message = error instanceof Error ? error.message : 'Disk check failed';
      
      logger.error('Disk health check failed', { error });
    }

    this.checks.set('disk', check);
    return check;
  }

  async performAllChecks(): Promise<SystemHealth> {
    logger.debug('Performing health checks');

    const checks = await Promise.all([
      this.performDatabaseCheck(),
      this.performJobSystemCheck(),
      this.performMemoryCheck(),
      this.performDiskCheck()
    ]);

    // Determine overall health
    let overall: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (checks.some(check => check.status === 'unhealthy')) {
      overall = 'unhealthy';
    } else if (checks.some(check => check.status === 'degraded')) {
      overall = 'degraded';
    }

    const health: SystemHealth = {
      overall,
      checks,
      uptime: process.uptime(),
      timestamp: new Date(),
      version: this.version
    };

    if (overall !== 'healthy') {
      logger.warn('System health degraded', { health });
    }

    return health;
  }

  getLastChecks(): HealthCheck[] {
    return Array.from(this.checks.values());
  }

  async getQuickHealth(): Promise<{ status: string; uptime: number; timestamp: Date }> {
    return {
      status: 'healthy', // Quick check, assume healthy
      uptime: process.uptime(),
      timestamp: new Date()
    };
  }
}

export const healthMonitor = new HealthMonitor(); 