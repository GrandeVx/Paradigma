/**
 * Centralized cache key management for Balance App
 * 
 * This file defines all cache keys used in the application in a standardized format.
 * Each key follows the pattern: balanceapp:model:operation:param1:value1:param2:value2...
 * 
 * IMPORTANT: When updating cache keys, ensure to update the corresponding invalidations in mutations
 */

type CacheKeyParams = Record<string, string | number | boolean | undefined>;

export const CacheKeys = {
  // Transaction Queries
  transaction: {
    getMonthlySpending: (
      userId: string,
      month: number,
      year: number,
      accountId?: string,
      macroCategoryIds?: string[]
    ) => ({
      prisma: 'Transaction',
      operation: 'getMonthlySpending',
      userId,
      month: month.toString(),
      year: year.toString(),
      accountId: accountId || 'all',
      macroCategoryIds: macroCategoryIds?.join(',') || 'all'
    }),

    getMonthlySummary: (
      userId: string,
      month: number,
      year: number,
      accountId?: string
    ) => ({
      prisma: 'Transaction',
      operation: 'getMonthlySummary',
      userId,
      month: month.toString(),
      year: year.toString(),
      accountId: accountId || 'all'
    }),

    getCategoryBreakdown: (
      userId: string,
      month: number,
      year: number,
      type: 'income' | 'expense',
      accountId?: string
    ) => ({
      prisma: 'Transaction',
      operation: 'getCategoryBreakdown',
      userId,
      month: month.toString(),
      year: year.toString(),
      type,
      accountId: accountId || 'all'
    }),

    getSubCategoryBreakdown: (
      userId: string,
      month: number,
      year: number,
      macroCategoryId: string,
      accountId?: string
    ) => ({
      prisma: 'Transaction',
      operation: 'getSubCategoryBreakdown',
      userId,
      month: month.toString(),
      year: year.toString(),
      macroCategoryId,
      accountId: accountId || 'all'
    }),

    getDailySpending: (
      userId: string,
      month: number,
      year: number,
      accountId?: string
    ) => ({
      prisma: 'Transaction',
      operation: 'getDailySpending',
      userId,
      month: month.toString(),
      year: year.toString(),
      accountId: accountId || 'all'
    }),

    getDailyTransactions: (
      userId: string,
      date: string,
      accountId?: string
    ) => ({
      prisma: 'Transaction',
      operation: 'getDailyTransactions',
      userId,
      date,
      accountId: accountId || 'all'
    }),

    getCategoryTransactions: (
      userId: string,
      categoryId: string,
      month: number,
      year: number,
      accountId?: string
    ) => ({
      prisma: 'Transaction',
      operation: 'getCategoryTransactions',
      userId,
      categoryId,
      month: month.toString(),
      year: year.toString(),
      accountId: accountId || 'all'
    }),

    getBudgetInfo: (
      userId: string,
      categoryId: string,
      month: number,
      year: number
    ) => ({
      prisma: 'Transaction',
      operation: 'getBudgetInfo',
      userId,
      categoryId,
      month: month.toString(),
      year: year.toString()
    }),

    findManyForBalance: (accountId: string) => ({
      prisma: 'Transaction',
      operation: 'findManyForBalance',
      accountId
    })
  },

  // Account Queries
  account: {
    listWithBalances: (userId: string) => ({
      prisma: 'MoneyAccount',
      operation: 'listWithBalances',
      userId
    }),

    getById: (userId: string, accountId: string) => ({
      prisma: 'MoneyAccount',
      operation: 'getById',
      userId,
      accountId
    })
  },

  // Budget Queries
  budget: {
    getCurrentSettings: (userId: string) => ({
      prisma: 'Budget',
      operation: 'getCurrentSettings',
      userId
    }),

    getBudgetByCategory: (userId: string, macroCategoryId: string) => ({
      prisma: 'Budget',
      operation: 'getBudgetByCategory',
      userId,
      macroCategoryId
    })
  },

  // Category Queries
  category: {
    list: (type?: 'INCOME' | 'EXPENSE') => ({
      prisma: 'MacroCategory',
      operation: 'list',
      type: type || 'all'
    }),

    getById: (categoryId: string) => ({
      prisma: 'MacroCategory',
      operation: 'getById',
      categoryId
    })
  },

  // Recurring Rule Queries
  recurringRule: {
    list: (userId: string, isInstallment?: boolean) => ({
      prisma: 'RecurringTransactionRule',
      operation: 'list',
      userId,
      ...(isInstallment !== undefined && { isInstallment: isInstallment.toString() })
    }),

    getById: (userId: string, ruleId: string) => ({
      prisma: 'RecurringTransactionRule',
      operation: 'getById',
      userId,
      ruleId
    }),

    getFutureTransactions: (
      userId: string,
      month: number,
      year: number,
      accountId?: string,
      macroCategoryIds?: string[]
    ) => ({
      prisma: 'RecurringTransactionRule',
      operation: 'getFutureTransactions',
      userId,
      month: month.toString(),
      year: year.toString(),
      accountId: accountId || 'all',
      macroCategoryIds: macroCategoryIds?.join(',') || 'all'
    })
  },

  // Goal Queries
  goal: {
    list: (userId: string) => ({
      prisma: 'Goal',
      operation: 'list',
      userId
    }),

    getByIdWithProgress: (userId: string, goalId: string) => ({
      prisma: 'Goal',
      operation: 'getByIdWithProgress',
      userId,
      goalId
    }),

    getTransactions: (userId: string, goalId: string) => ({
      prisma: 'Transaction',
      operation: 'getGoalTransactions',
      userId,
      goalId
    })
  }
};

/**
 * TTL (Time To Live) values for different cache types in seconds
 */
export const CacheTTL = {
  // Rarely changes
  categories: 86400, // 1 day
  
  // Changes occasionally
  budgetSettings: 600, // 10 minutes
  recurringRules: 600, // 10 minutes
  individualAccount: 600, // 10 minutes
  goals: 600, // 10 minutes
  
  // Changes frequently
  monthlySpending: 300, // 5 minutes
  monthlySummary: 300, // 5 minutes
  categoryBreakdown: 300, // 5 minutes
  subCategoryBreakdown: 300, // 5 minutes
  dailySpending: 300, // 5 minutes
  accountList: 300, // 5 minutes
  budgetList: 300, // 5 minutes
  categoryTransactions: 300, // 5 minutes
  budgetInfo: 300, // 5 minutes
  
  // Changes very frequently
  dailyTransactions: 180, // 3 minutes
  transactionAmounts: 180, // 3 minutes
};

/**
 * Helper function to format cache key params for use with ctx.db.getKey()
 */
export function formatCacheKeyParams(params: CacheKeyParams): Array<Record<string, string>> {
  return Object.entries(params).map(([key, value]) => ({
    [key]: value?.toString() || ''
  }));
}

/**
 * Cache invalidation patterns for mutations
 * Maps mutation types to the cache keys that should be invalidated
 */
export const CacheInvalidationPatterns = {
  transaction: {
    create: (userId: string, transaction: {
      moneyAccountId?: string | null;
      subCategoryId?: string | null;
      date: Date;
    }) => {
      const month = transaction.date.getMonth() + 1;
      const year = transaction.date.getFullYear();
      const dateStr = transaction.date.toISOString().split('T')[0]!;
      
      const patterns = [
        // Account balances
        CacheKeys.account.listWithBalances(userId),
        ...(transaction.moneyAccountId ? [
          CacheKeys.transaction.findManyForBalance(transaction.moneyAccountId),
          CacheKeys.account.getById(userId, transaction.moneyAccountId)
        ] : []),
        
        // Monthly spending (all variations)
        CacheKeys.transaction.getMonthlySpending(userId, month, year),
        ...(transaction.moneyAccountId ? [
          CacheKeys.transaction.getMonthlySpending(userId, month, year, transaction.moneyAccountId)
        ] : []),
        
        // Monthly summary
        CacheKeys.transaction.getMonthlySummary(userId, month, year),
        ...(transaction.moneyAccountId ? [
          CacheKeys.transaction.getMonthlySummary(userId, month, year, transaction.moneyAccountId)
        ] : []),
        
        // Daily spending
        CacheKeys.transaction.getDailySpending(userId, month, year),
        ...(transaction.moneyAccountId ? [
          CacheKeys.transaction.getDailySpending(userId, month, year, transaction.moneyAccountId)
        ] : []),
        
        // Daily transactions
        CacheKeys.transaction.getDailyTransactions(userId, dateStr),
        ...(transaction.moneyAccountId ? [
          CacheKeys.transaction.getDailyTransactions(userId, dateStr, transaction.moneyAccountId)
        ] : []),
      ];
      
      // Category-specific invalidations
      if (transaction.subCategoryId) {
        // Note: We need the macroCategoryId to properly invalidate category-specific caches
        // This should be passed from the mutation context
        patterns.push(
          CacheKeys.transaction.getCategoryBreakdown(userId, month, year, 'expense'),
          CacheKeys.transaction.getCategoryBreakdown(userId, month, year, 'income'),
          ...(transaction.moneyAccountId ? [
            CacheKeys.transaction.getCategoryBreakdown(userId, month, year, 'expense', transaction.moneyAccountId),
            CacheKeys.transaction.getCategoryBreakdown(userId, month, year, 'income', transaction.moneyAccountId)
          ] : [])
        );
      }
      
      return patterns;
    },
    
    update: (userId: string, oldTransaction: any, newTransaction: any) => {
      // Combine patterns from both old and new transaction states
      const patterns = new Set<any>();
      
      // Add patterns for old transaction
      const oldPatterns = CacheInvalidationPatterns.transaction.create(userId, oldTransaction);
      oldPatterns.forEach(p => patterns.add(JSON.stringify(p)));
      
      // Add patterns for new transaction
      const newPatterns = CacheInvalidationPatterns.transaction.create(userId, newTransaction);
      newPatterns.forEach(p => patterns.add(JSON.stringify(p)));
      
      return Array.from(patterns).map(p => JSON.parse(p));
    },
    
    delete: (userId: string, transaction: any) => {
      return CacheInvalidationPatterns.transaction.create(userId, transaction);
    }
  },
  
  account: {
    create: (userId: string) => [
      CacheKeys.account.listWithBalances(userId)
    ],
    
    update: (userId: string, accountId: string) => [
      CacheKeys.account.listWithBalances(userId),
      CacheKeys.account.getById(userId, accountId),
      CacheKeys.transaction.findManyForBalance(accountId)
    ],
    
    delete: (userId: string, accountId: string) => [
      CacheKeys.account.listWithBalances(userId),
      CacheKeys.account.getById(userId, accountId)
    ]
  },
  
  budget: {
    create: (userId: string, macroCategoryId: string) => [
      CacheKeys.budget.getCurrentSettings(userId),
      CacheKeys.budget.getBudgetByCategory(userId, macroCategoryId)
    ],
    
    update: (userId: string, macroCategoryId: string) => [
      CacheKeys.budget.getCurrentSettings(userId),
      CacheKeys.budget.getBudgetByCategory(userId, macroCategoryId)
    ],
    
    delete: (userId: string, macroCategoryId: string) => [
      CacheKeys.budget.getCurrentSettings(userId),
      CacheKeys.budget.getBudgetByCategory(userId, macroCategoryId)
    ]
  },
  
  recurringRule: {
    create: (userId: string) => [
      CacheKeys.recurringRule.list(userId),
      CacheKeys.recurringRule.list(userId, true),
      CacheKeys.recurringRule.list(userId, false)
    ],
    
    update: (userId: string, ruleId: string, isInstallment?: boolean) => [
      CacheKeys.recurringRule.list(userId),
      CacheKeys.recurringRule.list(userId, true),
      CacheKeys.recurringRule.list(userId, false),
      CacheKeys.recurringRule.getById(userId, ruleId),
      ...(isInstallment !== undefined ? [
        CacheKeys.recurringRule.list(userId, isInstallment)
      ] : [])
    ],
    
    delete: (userId: string, ruleId: string) => [
      CacheKeys.recurringRule.list(userId),
      CacheKeys.recurringRule.list(userId, true),
      CacheKeys.recurringRule.list(userId, false),
      CacheKeys.recurringRule.getById(userId, ruleId)
    ]
  },
  
  goal: {
    create: (userId: string) => [
      CacheKeys.goal.list(userId)
    ],
    
    update: (userId: string, goalId: string) => [
      CacheKeys.goal.list(userId),
      CacheKeys.goal.getByIdWithProgress(userId, goalId)
    ],
    
    delete: (userId: string, goalId: string) => [
      CacheKeys.goal.list(userId),
      CacheKeys.goal.getByIdWithProgress(userId, goalId)
    ]
  }
};