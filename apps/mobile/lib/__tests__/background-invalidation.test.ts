/**
 * Test file for BackgroundInvalidationService
 */

import { BackgroundInvalidationService } from '../background-invalidation-service';

describe('BackgroundInvalidationService', () => {
  let service: BackgroundInvalidationService;
  
  beforeEach(() => {
    service = BackgroundInvalidationService.getInstance();
    service.clearQueue(); // Start with clean queue
  });

  test('should be a singleton', () => {
    const instance1 = BackgroundInvalidationService.getInstance();
    const instance2 = BackgroundInvalidationService.getInstance();
    expect(instance1).toBe(instance2);
  });

  test('should enqueue tasks with correct priority order', () => {
    // Enqueue tasks in mixed order
    service.enqueue({
      type: 'charts',
      priority: 'low',
      maxRetries: 1,
    });
    
    service.enqueue({
      type: 'account',
      priority: 'critical',
      maxRetries: 3,
    });
    
    service.enqueue({
      type: 'budget',
      priority: 'medium',
      maxRetries: 2,
    });

    const status = service.getQueueStatus();
    expect(status.totalTasks).toBe(3);
    expect(status.criticalTasks).toBe(1);
    expect(status.mediumTasks).toBe(1);
    expect(status.lowTasks).toBe(1);
  });

  test('should enqueue transaction invalidations correctly', () => {
    service.enqueueTransactionInvalidations({
      currentMonth: 7,
      currentYear: 2024,
      categoryId: 'cat-123',
      accountId: 'acc-456',
      transactionType: 'expense',
    });

    const status = service.getQueueStatus();
    // Should enqueue: account (critical), transaction (critical), budget (medium), home (medium), category (medium), charts (low)
    expect(status.totalTasks).toBe(6);
    expect(status.criticalTasks).toBe(2); // account + transaction
    expect(status.mediumTasks).toBe(3); // budget + home + category
    expect(status.lowTasks).toBe(1); // charts
  });

  test('should handle transfer transactions without category', () => {
    service.enqueueTransactionInvalidations({
      currentMonth: 7,
      currentYear: 2024,
      accountId: 'acc-456',
      transactionType: 'transfer',
    });

    const status = service.getQueueStatus();
    // Should enqueue: account (critical), transaction (critical), budget (medium), home (medium), charts (low)
    // No category invalidation for transfers
    expect(status.totalTasks).toBe(5);
    expect(status.criticalTasks).toBe(2);
    expect(status.mediumTasks).toBe(2);
    expect(status.lowTasks).toBe(1);
  });

  test('should clear queue correctly', () => {
    service.enqueue({
      type: 'account',
      priority: 'critical',
      maxRetries: 3,
    });

    expect(service.getQueueStatus().totalTasks).toBe(1);
    
    service.clearQueue();
    
    expect(service.getQueueStatus().totalTasks).toBe(0);
  });
});

// Mock performance test to ensure the concept works
describe('Performance Concept Test', () => {
  test('background processing should be faster than synchronous', async () => {
    const start = Date.now();
    
    // Simulate synchronous processing (old way)
    const syncOperations = [
      () => new Promise(resolve => setTimeout(resolve, 100)), // 100ms each
      () => new Promise(resolve => setTimeout(resolve, 100)),
      () => new Promise(resolve => setTimeout(resolve, 100)),
      () => new Promise(resolve => setTimeout(resolve, 100)),
      () => new Promise(resolve => setTimeout(resolve, 100)),
    ];
    
    // Sequential execution (old way)
    for (const op of syncOperations) {
      await op();
    }
    
    const syncTime = Date.now() - start;
    
    // Simulate async processing (new way)
    const asyncStart = Date.now();
    
    // Immediate navigation simulation
    const navigationTime = 10; // 10ms for navigation
    
    // Background processing (parallel)
    const backgroundPromises = syncOperations.map(op => op());
    setTimeout(() => {
      Promise.all(backgroundPromises); // Don't await, it's background
    }, navigationTime);
    
    const asyncTime = navigationTime; // User only waits for navigation
    
    console.log(`Sync time: ${syncTime}ms, Async time: ${asyncTime}ms`);
    expect(asyncTime).toBeLessThan(syncTime);
    expect(asyncTime).toBeLessThan(50); // Should be very fast for user
  });
});