import { api } from './api';
import { transactionUtils } from './mmkv-storage';

/**
 * Comprehensive invalidation utility for when transaction data changes.
 * This ensures all related queries are updated across the entire app.
 */
export class InvalidationUtils {
  /**
   * Invalidates all queries related to transactions.
   * Use this when transactions are created, updated, or deleted.
   */
  static async invalidateTransactionRelatedQueries(
    utils: ReturnType<typeof api.useContext>,
    options?: {
      currentMonth?: number;
      currentYear?: number;
      clearCache?: boolean;
      forceRefetch?: boolean;
    }
  ) {
    const { currentMonth, currentYear, clearCache = true, forceRefetch = true } = options || {};

    console.log('🔄 [InvalidationUtils] Starting comprehensive query invalidation...');

    try {
      // === TRANSACTION QUERIES ===
      if (currentMonth && currentYear) {
        // Invalidate AND refetch current month transactions specifically
        await utils.transaction.getMonthlySpending.invalidate({
          month: currentMonth,
          year: currentYear,
        });
        
        if (forceRefetch) {
          console.log('🔄 [InvalidationUtils] Force refetching current month transactions...');
          await utils.transaction.getMonthlySpending.refetch({
            month: currentMonth,
            year: currentYear,
          });
        }
      }
      
      // Invalidate all transaction queries
      await utils.transaction.invalidate();
      
      // Refetch critical transaction summaries
      if (forceRefetch) {
        console.log('🔄 [InvalidationUtils] Force refetching transaction summaries...');
        await utils.transaction.getMonthlySummary.refetch();
        await utils.transaction.getCategoryBreakdown.refetch();
      }
      
      // === ACCOUNT QUERIES ===
      // Account balances change when transactions change
      await utils.account.listWithBalances.invalidate();
      if (forceRefetch) {
        await utils.account.listWithBalances.refetch();
      }
      
      await utils.account.getById.invalidate();

      // === BUDGET QUERIES ===
      // Budget spending totals change
      await utils.budget.getCurrentSettings.invalidate();
      if (forceRefetch) {
        await utils.budget.getCurrentSettings.refetch();
      }
      
      // === CATEGORY QUERIES ===
      // Category statistics change
      await utils.category.list.invalidate();
      if (forceRefetch) {
        await utils.category.list.refetch();
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
  static async invalidateHomeSectionQueries(utils: ReturnType<typeof api.useContext>) {
    await utils.transaction.getMonthlySummary.invalidate();
    await utils.transaction.getCategoryBreakdown.invalidate();
    await utils.transaction.getMonthlySpending.invalidate();
  }
} 