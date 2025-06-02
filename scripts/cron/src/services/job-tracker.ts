import { logger } from '../config/logger.js';

interface JobExecution {
  id: string;
  jobName: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
  duration?: number;
}

class JobTracker {
  private executions: Map<string, JobExecution> = new Map();
  private jobHistory: JobExecution[] = [];
  private maxHistorySize = 100;

  startJob(jobName: string): string {
    const id = `${jobName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const execution: JobExecution = {
      id,
      jobName,
      startTime: new Date(),
      status: 'running'
    };

    this.executions.set(id, execution);
    logger.info(`Job started: ${jobName}`, { jobId: id });
    
    return id;
  }

  completeJob(id: string, result?: unknown): void {
    const execution = this.executions.get(id);
    if (!execution) {
      logger.warn(`Attempted to complete unknown job: ${id}`);
      return;
    }

    execution.endTime = new Date();
    execution.status = 'completed';
    execution.result = result;
    execution.duration = execution.endTime.getTime() - execution.startTime.getTime();

    this.addToHistory(execution);
    this.executions.delete(id);

    logger.info(`Job completed: ${execution.jobName}`, { 
      jobId: id, 
      duration: execution.duration,
      result 
    });
  }

  failJob(id: string, error: string | Error): void {
    const execution = this.executions.get(id);
    if (!execution) {
      logger.warn(`Attempted to fail unknown job: ${id}`);
      return;
    }

    execution.endTime = new Date();
    execution.status = 'failed';
    execution.error = error instanceof Error ? error.message : error;
    execution.duration = execution.endTime.getTime() - execution.startTime.getTime();

    this.addToHistory(execution);
    this.executions.delete(id);

    logger.error(`Job failed: ${execution.jobName}`, { 
      jobId: id, 
      duration: execution.duration,
      error: execution.error 
    });
  }

  private addToHistory(execution: JobExecution): void {
    this.jobHistory.unshift(execution);
    
    // Keep only the most recent executions
    if (this.jobHistory.length > this.maxHistorySize) {
      this.jobHistory = this.jobHistory.slice(0, this.maxHistorySize);
    }
  }

  getRunningJobs(): JobExecution[] {
    return Array.from(this.executions.values());
  }

  getJobHistory(jobName?: string, limit = 10): JobExecution[] {
    let history = this.jobHistory;
    
    if (jobName) {
      history = history.filter(exec => exec.jobName === jobName);
    }
    
    return history.slice(0, limit);
  }

  getJobStats(jobName?: string): {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageDuration: number;
    lastExecution?: JobExecution;
  } {
    let history = this.jobHistory;
    
    if (jobName) {
      history = history.filter(exec => exec.jobName === jobName);
    }

    const totalExecutions = history.length;
    const successfulExecutions = history.filter(exec => exec.status === 'completed').length;
    const failedExecutions = history.filter(exec => exec.status === 'failed').length;
    
    const durations = history
      .filter(exec => exec.duration !== undefined)
      .map(exec => exec.duration!);
    
    const averageDuration = durations.length > 0 
      ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length 
      : 0;

    const lastExecution = history[0];

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageDuration,
      lastExecution
    };
  }

  getStatus() {
    const runningJobs = this.getRunningJobs();
    const recentHistory = this.getJobHistory(undefined, 5);
    
    return {
      runningJobs: runningJobs.map(job => ({
        id: job.id,
        jobName: job.jobName,
        startTime: job.startTime,
        duration: Date.now() - job.startTime.getTime()
      })),
      recentExecutions: recentHistory.map(job => ({
        jobName: job.jobName,
        status: job.status,
        startTime: job.startTime,
        endTime: job.endTime,
        duration: job.duration,
        error: job.error
      })),
      stats: this.getJobStats()
    };
  }
}

export const jobTracker = new JobTracker(); 