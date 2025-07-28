import { api } from './api';
import { InvalidationUtils } from './invalidation-utils';

export type InvalidationPriority = 'critical' | 'medium' | 'low';

export interface InvalidationTask {
  id: string;
  priority: InvalidationPriority;
  type: 'transaction' | 'account' | 'budget' | 'category' | 'charts' | 'home' | 'recurring';
  options?: any;
  retryCount: number;
  maxRetries: number;
  timestamp: number;
}

/**
 * Background service for handling cache invalidations asynchronously
 * to improve UI responsiveness and user experience.
 */
export class BackgroundInvalidationService {
  private static instance: BackgroundInvalidationService;
  private taskQueue: InvalidationTask[] = [];
  private isProcessing: boolean = false;
  private queryClient: ReturnType<typeof api.useContext> | null = null;

  private constructor() {}

  static getInstance(): BackgroundInvalidationService {
    if (!BackgroundInvalidationService.instance) {
      BackgroundInvalidationService.instance = new BackgroundInvalidationService();
    }
    return BackgroundInvalidationService.instance;
  }

  /**
   * Initialize the service with the query client
   */
  initialize(queryClient: ReturnType<typeof api.useContext>) {
    this.queryClient = queryClient;
  }

  /**
   * Add a new invalidation task to the queue
   */
  enqueue(task: Omit<InvalidationTask, 'id' | 'retryCount' | 'timestamp'>): void {
    const newTask: InvalidationTask = {
      ...task,
      id: `${task.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0,
      timestamp: Date.now(),
    };

    // Insert task based on priority
    const priorityOrder = { critical: 0, medium: 1, low: 2 };
    const insertIndex = this.taskQueue.findIndex(
      existingTask => priorityOrder[existingTask.priority] > priorityOrder[newTask.priority]
    );

    if (insertIndex === -1) {
      this.taskQueue.push(newTask);
    } else {
      this.taskQueue.splice(insertIndex, 0, newTask);
    }

    console.log(`📋 [BackgroundInvalidation] Enqueued task: ${newTask.type} (${newTask.priority} priority)`);

    // Start processing if not already running
    this.processQueue();
  }

  /**
   * Add multiple invalidation tasks for a transaction
   */
  enqueueTransactionInvalidations(options: {
    currentMonth: number;
    currentYear: number;
    categoryId?: string;
    accountId?: string;
    transactionType: 'expense' | 'income' | 'transfer';
  }): void {
    const { currentMonth, currentYear, categoryId, accountId, transactionType } = options;

    // Critical invalidations (execute immediately in background)
    this.enqueue({
      type: 'account',
      priority: 'critical',
      options: { accountId },
      maxRetries: 3,
    });

    this.enqueue({
      type: 'transaction',
      priority: 'critical',
      options: { currentMonth, currentYear, clearCache: true },
      maxRetries: 3,
    });

    // Medium priority invalidations
    this.enqueue({
      type: 'budget',
      priority: 'medium',
      options: { currentMonth, currentYear },
      maxRetries: 2,
    });

    this.enqueue({
      type: 'home',
      priority: 'medium',
      options: { currentMonth, currentYear },
      maxRetries: 2,
    });

    // Category-specific invalidations (if applicable)
    if (categoryId && transactionType !== 'transfer') {
      this.enqueue({
        type: 'category',
        priority: 'medium',
        options: { categoryId, currentMonth, currentYear },
        maxRetries: 2,
      });
    }

    // Low priority invalidations (charts with adjacent months)
    this.enqueue({
      type: 'charts',
      priority: 'low',
      options: { currentMonth, currentYear },
      maxRetries: 1,
    });
  }

  /**
   * Process the task queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0 || !this.queryClient) {
      return;
    }

    this.isProcessing = true;

    try {
      // Process critical tasks first, then medium, then low
      const criticalTasks = this.taskQueue.filter(task => task.priority === 'critical');
      const mediumTasks = this.taskQueue.filter(task => task.priority === 'medium');
      const lowTasks = this.taskQueue.filter(task => task.priority === 'low');

      // Process critical tasks immediately (but still in background)
      if (criticalTasks.length > 0) {
        await this.processBatch(criticalTasks, 0); // No delay for critical tasks
      }

      // Process medium tasks with slight delay
      if (mediumTasks.length > 0) {
        await this.processBatch(mediumTasks, 100);
      }

      // Process low priority tasks with longer delay
      if (lowTasks.length > 0) {
        await this.processBatch(lowTasks, 500);
      }

    } catch (error) {
      console.error('❌ [BackgroundInvalidation] Error processing queue:', error);
    } finally {
      this.isProcessing = false;

      // Check if there are more tasks to process (from retries or new additions)
      if (this.taskQueue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  /**
   * Process a batch of tasks with specified delay
   */
  private async processBatch(tasks: InvalidationTask[], delay: number): Promise<void> {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Process tasks in parallel within the same priority level
    const promises = tasks.map(task => this.processTask(task));
    await Promise.allSettled(promises);
  }

  /**
   * Process a single invalidation task
   */
  private async processTask(task: InvalidationTask): Promise<void> {
    if (!this.queryClient) {
      console.error('❌ [BackgroundInvalidation] Query client not initialized');
      return;
    }

    try {
      console.log(`🔄 [BackgroundInvalidation] Processing task: ${task.type} (attempt ${task.retryCount + 1})`);

      switch (task.type) {
        case 'transaction':
          await InvalidationUtils.invalidateTransactionRelatedQueries(this.queryClient, task.options);
          break;

        case 'account':
          await InvalidationUtils.invalidateAccountQueries(this.queryClient);
          break;

        case 'budget':
          await InvalidationUtils.invalidateBudgetQueries(this.queryClient, task.options);
          break;

        case 'category':
          await InvalidationUtils.invalidateCategoryQueries(this.queryClient, task.options);
          break;

        case 'charts':
          // For background processing, include adjacent months for comprehensive chart updates
          const chartOptions = { ...task.options, includeAdjacentMonths: true };
          await InvalidationUtils.invalidateChartsQueries(this.queryClient, chartOptions);
          break;

        case 'home':
          await InvalidationUtils.invalidateHomeSectionQueries(this.queryClient, task.options);
          break;

        case 'recurring':
          await InvalidationUtils.invalidateRecurringRuleQueries(this.queryClient);
          break;

        default:
          console.warn(`⚠️ [BackgroundInvalidation] Unknown task type: ${task.type}`);
      }

      // Remove completed task from queue
      this.taskQueue = this.taskQueue.filter(t => t.id !== task.id);
      console.log(`✅ [BackgroundInvalidation] Completed task: ${task.type}`);

    } catch (error) {
      console.error(`❌ [BackgroundInvalidation] Task failed: ${task.type}`, error);
      
      // Retry logic
      if (task.retryCount < task.maxRetries) {
        task.retryCount++;
        console.log(`🔄 [BackgroundInvalidation] Retrying task: ${task.type} (${task.retryCount}/${task.maxRetries})`);
      } else {
        // Remove failed task after max retries
        this.taskQueue = this.taskQueue.filter(t => t.id !== task.id);
        console.error(`💀 [BackgroundInvalidation] Task failed permanently: ${task.type}`);
      }
    }
  }

  /**
   * Get current queue status for debugging
   */
  getQueueStatus(): {
    totalTasks: number;
    criticalTasks: number;
    mediumTasks: number;
    lowTasks: number;
    isProcessing: boolean;
  } {
    return {
      totalTasks: this.taskQueue.length,
      criticalTasks: this.taskQueue.filter(t => t.priority === 'critical').length,
      mediumTasks: this.taskQueue.filter(t => t.priority === 'medium').length,
      lowTasks: this.taskQueue.filter(t => t.priority === 'low').length,
      isProcessing: this.isProcessing,
    };
  }

  /**
   * Clear all tasks from queue (for testing/debugging)
   */
  clearQueue(): void {
    this.taskQueue = [];
    console.log('🗑️ [BackgroundInvalidation] Queue cleared');
  }
}

// Export singleton instance
export const backgroundInvalidationService = BackgroundInvalidationService.getInstance();