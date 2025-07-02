import { api } from './api';
import { transactionUtils } from './mmkv-storage';

/**
 * Selective invalidation utility for when transaction data changes.
 * Optimized to only invalidate what's necessary to reduce performance impact.
 */
export class InvalidationUtils {
  /**
   * Invalidates only the essential queries related to transactions.
   * Use this when transactions are created, updated, or deleted.
   */
  static async invalidateTransactionRelatedQueries(
    utils: ReturnType<typeof api.useContext>,
    options?: {
      currentMonth?: number;
      currentYear?: number;
      clearCache?: boolean;
      accountId?: string; // Add specific account targeting
    }
  ) {
    const { currentMonth, currentYear, clearCache = false, accountId } = options || {};

    console.log('🔄 [InvalidationUtils] Starting selective query invalidation...');

    try {
      // === TRANSACTION QUERIES - SELECTIVE ===
      if (currentMonth && currentYear) {
        // Only invalidate current month transactions specifically
        await utils.transaction.getMonthlySpending.invalidate({
          month: currentMonth,
          year: currentYear,
        });
        await utils.transaction.getMonthlySummary.invalidate({
          month: currentMonth,
          year: currentYear,
        });
      } else {
        // Fallback: invalidate transaction queries but not all at once
        await utils.transaction.getMonthlySpending.invalidate();
        await utils.transaction.getMonthlySummary.invalidate();
      }
      
      // === ACCOUNT QUERIES - SELECTIVE ===
      if (accountId) {
        // Only invalidate specific account
        await utils.account.getById.invalidate({ accountId });
      } else {
        // Account balances change when transactions change
        await utils.account.listWithBalances.invalidate();
      }

      // === BUDGET QUERIES - SELECTIVE ===
      // Only invalidate budget if we're dealing with current month
      if (currentMonth && currentYear) {
        const currentDate = new Date();
        const isCurrentMonth = currentMonth === (currentDate.getMonth() + 1) && 
                              currentYear === currentDate.getFullYear();
        if (isCurrentMonth) {
          await utils.budget.getCurrentSettings.invalidate();
        }
      }

      // === CACHE CLEANUP ===
      if (clearCache && currentMonth && currentYear) {
        // Clear MMKV cache for transactions to ensure fresh data
        transactionUtils.setTransactionCacheData([], currentMonth, currentYear);
        
        // Clear adjacent months cache as well
        const monthsToClean = [
          { 
            month: currentMonth - 1 || 12, 
            year: currentMonth === 1 ? currentYear - 1 : currentYear 
          },
          { month: currentMonth, year: currentYear },
          { 
            month: currentMonth + 1 > 12 ? 1 : currentMonth + 1, 
            year: currentMonth === 12 ? currentYear + 1 : currentYear 
          }
        ];
        
        monthsToClean.forEach(({ month, year }) => {
          transactionUtils.setTransactionCacheData([], month, year);
        });
      }

      console.log('🫆 [InvalidationUtils] All queries invalidated successfully');
    } catch (error) {
      console.error('❌ [InvalidationUtils] Error during query invalidation:', error);
      throw error;
    }
  }

  /**
   * Invalidates only account-related queries.
   * Use this for account-specific operations.
   */
  static async invalidateAccountQueries(utils: ReturnType<typeof api.useContext>) {
    await utils.account.listWithBalances.invalidate();
    await utils.account.getById.invalidate();
  }

  /**
   * Invalidates only budget-related queries.
   * Use this for budget-specific operations.
   */
  static async invalidateBudgetQueries(utils: ReturnType<typeof api.useContext>) {
    await utils.budget.getCurrentSettings.invalidate();
  }

  /**
   * Invalidates home section queries that aggregate data.
   * Use this when summary data needs to be refreshed.
   */
  static async invalidateHomeSectionQueries(
    utils: ReturnType<typeof api.useContext>,
    options?: {
      currentMonth?: number;
      currentYear?: number;
    }
  ) {
    if (options?.currentMonth && options?.currentYear) {
      const { currentMonth, currentYear } = options;
      
      // Invalidate with specific parameters
      await utils.transaction.getMonthlySummary.invalidate({
        month: currentMonth,
        year: currentYear,
      });
      await utils.transaction.getCategoryBreakdown.invalidate({
        month: currentMonth,
        year: currentYear,
        type: 'expense',
      });
      await utils.transaction.getCategoryBreakdown.invalidate({
        month: currentMonth,
        year: currentYear,
        type: 'income',
      });
      await utils.transaction.getDailySpending.invalidate({
        month: currentMonth,
        year: currentYear,
      });
      await utils.transaction.getMonthlySpending.invalidate({
        month: currentMonth,
        year: currentYear,
      });
    } else {
      // Fallback: invalidate all
      await utils.transaction.getMonthlySummary.invalidate();
      await utils.transaction.getCategoryBreakdown.invalidate();
      await utils.transaction.getSubCategoryBreakdown.invalidate();
      await utils.transaction.getDailySpending.invalidate();
      await utils.transaction.getMonthlySpending.invalidate();
    }
  }

  /**
   * Aggressively invalidates all chart-related queries with specific parameters.
   * Use this when transactions are deleted to ensure charts update correctly.
   */
  static async invalidateChartsQueries(
    utils: ReturnType<typeof api.useContext>,
    options?: {
      currentMonth?: number;
      currentYear?: number;
    }
  ) {
    console.log('📊 [InvalidationUtils] Aggressively invalidating all chart queries...');
    
    try {
      // Invalidate all transaction queries without month filters (broad)
      await utils.transaction.invalidate();
      
      // If we have specific month/year, invalidate those queries specifically
      if (options?.currentMonth && options?.currentYear) {
        const { currentMonth, currentYear } = options;
        
        console.log(`📊 [InvalidationUtils] Invalidating specific month queries: ${currentMonth}/${currentYear}`);
        
        // Invalidate exact queries used by ChartsSection
        await utils.transaction.getMonthlySummary.invalidate({
          month: currentMonth,
          year: currentYear,
        });
        
        await utils.transaction.getCategoryBreakdown.invalidate({
          month: currentMonth,
          year: currentYear,
          type: 'expense',
        });
        
        await utils.transaction.getCategoryBreakdown.invalidate({
          month: currentMonth,
          year: currentYear,
          type: 'income',
        });
        
        await utils.transaction.getDailySpending.invalidate({
          month: currentMonth,
          year: currentYear,
        });
        
        // Also invalidate adjacent months that might be cached
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        
        // Previous month
        await utils.transaction.getMonthlySummary.invalidate({
          month: prevMonth,
          year: prevYear,
        });
        await utils.transaction.getCategoryBreakdown.invalidate({
          month: prevMonth,
          year: prevYear,
          type: 'expense',
        });
        await utils.transaction.getDailySpending.invalidate({
          month: prevMonth,
          year: prevYear,
        });
        
        // Next month
        await utils.transaction.getMonthlySummary.invalidate({
          month: nextMonth,
          year: nextYear,
        });
        await utils.transaction.getCategoryBreakdown.invalidate({
          month: nextMonth,
          year: nextYear,
          type: 'expense',
        });
        await utils.transaction.getDailySpending.invalidate({
          month: nextMonth,
          year: nextYear,
        });
      } else {
        // Fallback: Force refetch of critical chart queries without parameters
        await utils.transaction.getMonthlySummary.invalidate();
        await utils.transaction.getCategoryBreakdown.invalidate();
        await utils.transaction.getSubCategoryBreakdown.invalidate();
        await utils.transaction.getDailySpending.invalidate();
      }
      
      console.log('✅ [InvalidationUtils] Chart queries invalidated successfully');
    } catch (error) {
      console.error('❌ [InvalidationUtils] Error invalidating chart queries:', error);
      throw error;
    }
  }
} 