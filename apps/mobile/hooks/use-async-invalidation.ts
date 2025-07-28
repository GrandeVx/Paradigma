import { useEffect } from 'react';
import { api } from '@/lib/api';
import { backgroundInvalidationService } from '@/lib/background-invalidation-service';

/**
 * Hook to initialize and manage background invalidation service
 * for improved UI responsiveness during cache updates.
 */
export function useAsyncInvalidation() {
  const queryClient = api.useContext();

  useEffect(() => {
    // Initialize the background invalidation service with query client
    backgroundInvalidationService.initialize(queryClient);
    
    console.log('🎯 [useAsyncInvalidation] Background invalidation service initialized');

    // Cleanup function (optional, for component unmounting)
    return () => {
      // Could add cleanup logic here if needed
      console.log('🧹 [useAsyncInvalidation] Hook cleanup');
    };
  }, [queryClient]);

  /**
   * Schedule invalidations for a transaction in the background
   */
  const scheduleTransactionInvalidations = (options: {
    currentMonth: number;
    currentYear: number;
    categoryId?: string;
    accountId?: string;
    transactionType: 'expense' | 'income' | 'transfer';
  }) => {
    console.log('📅 [useAsyncInvalidation] Scheduling transaction invalidations:', options);
    backgroundInvalidationService.enqueueTransactionInvalidations(options);
  };

  /**
   * Schedule recurring rule invalidations in the background
   */
  const scheduleRecurringInvalidations = () => {
    console.log('🔁 [useAsyncInvalidation] Scheduling recurring rule invalidations');
    backgroundInvalidationService.enqueue({
      type: 'recurring',
      priority: 'medium',
      maxRetries: 2,
    });
  };

  /**
   * Get current queue status for debugging
   */
  const getQueueStatus = () => {
    return backgroundInvalidationService.getQueueStatus();
  };

  /**
   * Clear all pending invalidations (for testing/debugging)
   */
  const clearQueue = () => {
    backgroundInvalidationService.clearQueue();
  };

  return {
    scheduleTransactionInvalidations,
    scheduleRecurringInvalidations,
    getQueueStatus,
    clearQueue,
  };
}