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
  static async invalidateBudgetQueries(
    utils: ReturnType<typeof api.useContext>,
    options?: {
      currentMonth?: number;
      currentYear?: number;
      budgetSettings?: any[];
    }
  ) {
    console.log('💰 [InvalidationUtils] Invalidating budget-related queries...');
    
    try {
      // Always invalidate budget settings
      await utils.budget.getCurrentSettings.invalidate();
      
      // Invalidate transaction spending data that budgets depend on
      if (options?.currentMonth && options?.currentYear) {
        const { currentMonth, currentYear, budgetSettings } = options;
        
        // Invalidate monthly spending with category filtering if budget settings available
        if (budgetSettings && budgetSettings.length > 0) {
          await utils.transaction.getMonthlySpending.invalidate({
            month: currentMonth,
            year: currentYear,
            macroCategoryIds: budgetSettings.map(budget => budget.macroCategoryId),
          });
        } else {
          // Fallback: invalidate without category filtering
          await utils.transaction.getMonthlySpending.invalidate({
            month: currentMonth,
            year: currentYear,
          });
        }
      } else {
        // Fallback: broad invalidation
        await utils.transaction.getMonthlySpending.invalidate();
      }
      
      console.log('✅ [InvalidationUtils] Budget queries invalidated successfully');
    } catch (error) {
      console.error('❌ [InvalidationUtils] Error invalidating budget queries:', error);
      throw error;
    }
  }

  /**
   * Invalidates category-specific transaction queries.
   * Use this when transactions are modified to update category transaction views.
   */
  static async invalidateCategoryQueries(
    utils: ReturnType<typeof api.useContext>,
    options: {
      categoryId: string;
      currentMonth?: number;
      currentYear?: number;
    }
  ) {
    const { categoryId, currentMonth, currentYear } = options;
    
    console.log(`🏷️ [InvalidationUtils] Invalidating category queries for categoryId: ${categoryId}...`);
    
    try {
      if (currentMonth && currentYear) {
        // Invalidate specific month/year for the category
        await utils.transaction.getCategoryTransactions.invalidate({
          categoryId,
          month: currentMonth,
          year: currentYear,
        });
        
        await utils.transaction.getBudgetInfo.invalidate({
          categoryId,
          month: currentMonth,
          year: currentYear,
        });
        
        console.log(`✅ [InvalidationUtils] Category queries invalidated for ${categoryId} - ${currentMonth}/${currentYear}`);
      } else {
        // Fallback: broad invalidation for all months
        await utils.transaction.getCategoryTransactions.invalidate();
        await utils.transaction.getBudgetInfo.invalidate();
        
        console.log(`✅ [InvalidationUtils] Category queries invalidated broadly for ${categoryId}`);
      }
    } catch (error) {
      console.error(`❌ [InvalidationUtils] Error invalidating category queries for ${categoryId}:`, error);
      throw error;
    }
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
   * Invalidates recurring rule queries (both recurring and installment lists).
   * Use this when recurring rules are created, updated, or deleted.
   */
  static async invalidateRecurringRuleQueries(
    utils: ReturnType<typeof api.useContext>
  ) {
    console.log('🔄 [InvalidationUtils] Invalidating recurring rule queries...');
    
    try {
      // Invalidate both recurring and installment lists
      await utils.recurringRule.list.invalidate({ isInstallment: false });
      await utils.recurringRule.list.invalidate({ isInstallment: true });
      
      // Also invalidate the getById queries (broad invalidation)
      await utils.recurringRule.getById.invalidate();
      
      console.log('✅ [InvalidationUtils] Recurring rule queries invalidated successfully');
    } catch (error) {
      console.error('❌ [InvalidationUtils] Error invalidating recurring rule queries:', error);
      throw error;
    }
  }

  /**
   * Optimized chart queries invalidation.
   * Only invalidates current month by default to improve performance.
   * Adjacent months are invalidated only when specifically requested.
   */
  static async invalidateChartsQueries(
    utils: ReturnType<typeof api.useContext>,
    options?: {
      currentMonth?: number;
      currentYear?: number;
      includeAdjacentMonths?: boolean; // New option to control adjacent month invalidation
    }
  ) {
    console.log('📊 [InvalidationUtils] Optimized chart queries invalidation...');
    
    try {
      if (options?.currentMonth && options?.currentYear) {
        const { currentMonth, currentYear, includeAdjacentMonths = false } = options;
        
        console.log(`📊 [InvalidationUtils] Invalidating specific month queries: ${currentMonth}/${currentYear}`);
        
        // Invalidate current month queries
        const currentMonthPromises = [
          utils.transaction.getMonthlySummary.invalidate({
            month: currentMonth,
            year: currentYear,
          }),
          utils.transaction.getCategoryBreakdown.invalidate({
            month: currentMonth,
            year: currentYear,
            type: 'expense',
          }),
          utils.transaction.getCategoryBreakdown.invalidate({
            month: currentMonth,
            year: currentYear,
            type: 'income',
          }),
          utils.transaction.getDailySpending.invalidate({
            month: currentMonth,
            year: currentYear,
          }),
        ];

        // Execute current month invalidations in parallel
        await Promise.all(currentMonthPromises);
        
        // Only invalidate adjacent months if explicitly requested (for background processing)
        if (includeAdjacentMonths) {
          console.log('📊 [InvalidationUtils] Including adjacent months in invalidation...');
          
          const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
          const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
          const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
          const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
          
          // Invalidate adjacent months in parallel
          const adjacentMonthPromises = [
            // Previous month
            utils.transaction.getMonthlySummary.invalidate({ month: prevMonth, year: prevYear }),
            utils.transaction.getCategoryBreakdown.invalidate({ month: prevMonth, year: prevYear, type: 'expense' }),
            utils.transaction.getDailySpending.invalidate({ month: prevMonth, year: prevYear }),
            
            // Next month
            utils.transaction.getMonthlySummary.invalidate({ month: nextMonth, year: nextYear }),
            utils.transaction.getCategoryBreakdown.invalidate({ month: nextMonth, year: nextYear, type: 'expense' }),
            utils.transaction.getDailySpending.invalidate({ month: nextMonth, year: nextYear }),
          ];

          await Promise.all(adjacentMonthPromises);
        }
      } else {
        // Fallback: Only invalidate critical chart queries without broad transaction invalidation
        const fallbackPromises = [
          utils.transaction.getMonthlySummary.invalidate(),
          utils.transaction.getCategoryBreakdown.invalidate(),
          utils.transaction.getDailySpending.invalidate(),
        ];

        await Promise.all(fallbackPromises);
      }
      
      console.log('✅ [InvalidationUtils] Chart queries invalidated successfully');
    } catch (error) {
      console.error('❌ [InvalidationUtils] Error invalidating chart queries:', error);
      throw error;
    }
  }

  /**
   * Lightweight chart invalidation for immediate UI updates.
   * Only invalidates current month essential queries.
   */
  static async invalidateChartsQueriesLight(
    utils: ReturnType<typeof api.useContext>,
    options: {
      currentMonth: number;
      currentYear: number;
    }
  ) {
    console.log(`📊 [InvalidationUtils] Light chart invalidation: ${options.currentMonth}/${options.currentYear}`);
    
    try {
      // Only invalidate essential chart queries for current month
      const promises = [
        utils.transaction.getMonthlySummary.invalidate({
          month: options.currentMonth,
          year: options.currentYear,
        }),
        utils.transaction.getDailySpending.invalidate({
          month: options.currentMonth,
          year: options.currentYear,
        }),
      ];

      await Promise.all(promises);
      console.log('✅ [InvalidationUtils] Light chart invalidation completed');
    } catch (error) {
      console.error('❌ [InvalidationUtils] Error in light chart invalidation:', error);
      throw error;
    }
  }
} 