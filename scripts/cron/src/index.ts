import 'dotenv/config';
import express from 'express';
import cron from 'node-cron';
import { logger } from './config/logger.js';
import { initializeDatabase, disconnectDatabase } from './config/database.js';
import { processRecurringTransactions } from './services/recurring-processor.js';
import { jobTracker } from './services/job-tracker.js';
import { healthMonitor } from './services/health-monitor.js';

const app = express();
const port = process.env.CRON_PORT || 3001;

// Middleware
app.use(express.json());

// Quick health check endpoint (fast response)
app.get('/health', async (_req, res) => {
  try {
    const quickHealth = await healthMonitor.getQuickHealth();
    res.json({ 
      status: 'healthy', 
      service: 'cron-service',
      timestamp: quickHealth.timestamp,
      uptime: quickHealth.uptime
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'cron-service',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Detailed health check endpoint
app.get('/health/detailed', async (_req, res) => {
  try {
    const health = await healthMonitor.performAllChecks();
    
    const statusCode = health.overall === 'healthy' ? 200 : 
                      health.overall === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      overall: 'unhealthy',
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date()
    });
  }
});

// Job status endpoint
app.get('/jobs/status', (_req, res) => {
  const status = jobTracker.getStatus();
  res.json(status);
});

// Job history endpoint
app.get('/jobs/history/:jobName?', (req, res) => {
  const { jobName } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const history = jobTracker.getJobHistory(jobName, limit);
  res.json({ history });
});

// Job stats endpoint
app.get('/jobs/stats/:jobName?', (req, res) => {
  const { jobName } = req.params;
  const stats = jobTracker.getJobStats(jobName);
  res.json(stats);
});

// Manual trigger endpoint for testing
app.post('/jobs/trigger/recurring-transactions', async (_req, res) => {
  const jobId = jobTracker.startJob('recurring-transactions-manual');
  
  try {
    const result = await processRecurringTransactions();
    jobTracker.completeJob(jobId, result);
    
    res.json({ 
      success: true, 
      jobId,
      result 
    });
  } catch (error) {
    jobTracker.failJob(jobId, error as Error);
    
    res.status(500).json({ 
      success: false, 
      jobId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Metrics endpoint for monitoring systems
app.get('/metrics', async (_req, res) => {
  try {
    const health = await healthMonitor.performAllChecks();
    const jobStats = jobTracker.getJobStats();
    
    // Simple text format for monitoring systems
    const metrics = [
      `# HELP cron_service_up Whether the service is up`,
      `# TYPE cron_service_up gauge`,
      `cron_service_up{service="cron-service"} ${health.overall === 'unhealthy' ? 0 : 1}`,
      ``,
      `# HELP cron_service_uptime_seconds Service uptime in seconds`,
      `# TYPE cron_service_uptime_seconds counter`,
      `cron_service_uptime_seconds{service="cron-service"} ${health.uptime}`,
      ``,
      `# HELP cron_jobs_total Total number of job executions`,
      `# TYPE cron_jobs_total counter`,
      `cron_jobs_total{service="cron-service"} ${jobStats.totalExecutions}`,
      ``,
      `# HELP cron_jobs_failed_total Total number of failed job executions`,
      `# TYPE cron_jobs_failed_total counter`,
      `cron_jobs_failed_total{service="cron-service"} ${jobStats.failedExecutions}`,
      ``,
      `# HELP cron_jobs_duration_avg Average job duration in milliseconds`,
      `# TYPE cron_jobs_duration_avg gauge`,
      `cron_jobs_duration_avg{service="cron-service"} ${jobStats.averageDuration}`,
    ].join('\n');
    
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    res.status(500).send('# Error generating metrics');
  }
});

async function startCronService() {
  try {
    // Initialize database
    await initializeDatabase();
    logger.info('Cron service starting...');

    // Schedule recurring transaction processing
    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      const jobId = jobTracker.startJob('recurring-transactions');
      
      try {
        const result = await processRecurringTransactions();
        jobTracker.completeJob(jobId, result);
      } catch (error) {
        jobTracker.failJob(jobId, error as Error);
      }
    }, {
      scheduled: true,
      timezone: 'Europe/Rome' // Adjust timezone as needed
    });

    // Optional: Add a more frequent job for testing (every 5 minutes)
    if (process.env.NODE_ENV === 'development') {
      logger.info('Development mode: Added 5-minute recurring job for testing');
      cron.schedule('*/5 * * * *', async () => {
        const jobId = jobTracker.startJob('recurring-transactions-dev');
        
        try {
          const result = await processRecurringTransactions();
          jobTracker.completeJob(jobId, result);
        } catch (error) {
          jobTracker.failJob(jobId, error as Error);
        }
      }, {
        scheduled: true,
        timezone: 'Europe/Rome'
      });
      
      logger.info('Development mode: Added 5-minute recurring job for testing');
    }

    // Schedule periodic health checks (every 5 minutes)
    cron.schedule('*/5 * * * *', async () => {
      try {
        const health = await healthMonitor.performAllChecks();
        if (health.overall !== 'healthy') {
          logger.warn('Periodic health check detected issues', { 
            overall: health.overall,
            issues: health.checks.filter(c => c.status !== 'healthy')
          });
        }
      } catch (error) {
        logger.error('Periodic health check failed', { error });
      }
    }, {
      scheduled: true,
      timezone: 'Europe/Rome'
    });

    // Start HTTP server for health checks
    app.listen(port, () => {
      logger.info(`Cron service health server listening on port ${port}`);
    });

    logger.info('Cron service started successfully');

  } catch (error) {
    logger.error('Failed to start cron service', { error });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await disconnectDatabase();
  process.exit(0);
});

// Start the service
startCronService(); 