import { CacheKeys, formatCacheKeyParams } from "./cacheKeys";
import { PrismaClient } from "@paradigma/db";

export interface TransactionData {
  date: Date;
  moneyAccountId?: string | null;
  subCategoryId?: string | null;
  macroCategoryId?: string | null;
  amount?: number;
}

export interface TransactionUpdateData {
  oldData: TransactionData;
  newData: TransactionData;
}

/**
 * Generate cache invalidation keys for transaction mutations
 */
export function getTransactionInvalidationKeys(
  db: typeof PrismaClient,
  userId: string,
  transaction: TransactionData
): string[] {
  const month = transaction.date.getMonth() + 1;
  const year = transaction.date.getFullYear();
  const dateStr = transaction.date.toISOString().split('T')[0]!;
  
  const keys: string[] = [];
  
  // Account balance caches
  keys.push(
    db.getKey({ params: formatCacheKeyParams(CacheKeys.account.listWithBalances(userId)) })
  );
  
  if (transaction.moneyAccountId) {
    keys.push(
      db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.findManyForBalance(transaction.moneyAccountId)) }),
      db.getKey({ params: formatCacheKeyParams(CacheKeys.account.getById(userId, transaction.moneyAccountId)) })
    );
  }
  
  // Monthly spending (all variations)
  keys.push(
    db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getMonthlySpending(userId, month, year)) }),
    db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getMonthlySpending(userId, month, year, undefined, undefined)) })
  );
  
  if (transaction.moneyAccountId) {
    keys.push(
      db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getMonthlySpending(userId, month, year, transaction.moneyAccountId)) }),
      db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getMonthlySpending(userId, month, year, transaction.moneyAccountId, undefined)) })
    );
  }
  
  // Monthly summary
  keys.push(
    db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getMonthlySummary(userId, month, year)) }),
    db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getMonthlySummary(userId, month, year, undefined)) })
  );
  
  if (transaction.moneyAccountId) {
    keys.push(
      db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getMonthlySummary(userId, month, year, transaction.moneyAccountId)) })
    );
  }
  
  // Category breakdown (both income and expense)
  // const transactionType = transaction.amount && transaction.amount < 0 ? 'expense' : 'income';
  keys.push(
    db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getCategoryBreakdown(userId, month, year, 'expense')) }),
    db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getCategoryBreakdown(userId, month, year, 'income')) }),
    db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getCategoryBreakdown(userId, month, year, 'expense', undefined)) }),
    db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getCategoryBreakdown(userId, month, year, 'income', undefined)) })
  );
  
  if (transaction.moneyAccountId) {
    keys.push(
      db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getCategoryBreakdown(userId, month, year, 'expense', transaction.moneyAccountId)) }),
      db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getCategoryBreakdown(userId, month, year, 'income', transaction.moneyAccountId)) })
    );
  }
  
  // Sub-category breakdown (if we have macro category)
  if (transaction.macroCategoryId) {
    keys.push(
      db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getSubCategoryBreakdown(userId, month, year, transaction.macroCategoryId)) }),
      db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getSubCategoryBreakdown(userId, month, year, transaction.macroCategoryId, undefined)) })
    );
    
    if (transaction.moneyAccountId) {
      keys.push(
        db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getSubCategoryBreakdown(userId, month, year, transaction.macroCategoryId, transaction.moneyAccountId)) })
      );
    }
  }
  
  // Daily spending
  keys.push(
    db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getDailySpending(userId, month, year)) }),
    db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getDailySpending(userId, month, year, undefined)) })
  );
  
  if (transaction.moneyAccountId) {
    keys.push(
      db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getDailySpending(userId, month, year, transaction.moneyAccountId)) })
    );
  }
  
  // Daily transactions
  keys.push(
    db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getDailyTransactions(userId, dateStr)) }),
    db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getDailyTransactions(userId, dateStr, undefined)) })
  );
  
  if (transaction.moneyAccountId) {
    keys.push(
      db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getDailyTransactions(userId, dateStr, transaction.moneyAccountId)) })
    );
  }
  
  // Category transactions (if we have macro category)
  if (transaction.macroCategoryId) {
    keys.push(
      db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getCategoryTransactions(userId, transaction.macroCategoryId, month, year)) }),
      db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getCategoryTransactions(userId, transaction.macroCategoryId, month, year, undefined)) })
    );
    
    if (transaction.moneyAccountId) {
      keys.push(
        db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getCategoryTransactions(userId, transaction.macroCategoryId, month, year, transaction.moneyAccountId)) })
      );
    }
    
    // Budget info
    keys.push(
      db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.getBudgetInfo(userId, transaction.macroCategoryId, month, year)) })
    );
  }
  
  // Budget settings (always invalidate when transactions change)
  keys.push(
    db.getKey({ params: formatCacheKeyParams(CacheKeys.budget.getCurrentSettings(userId)) })
  );
  
  return keys;
}

/**
 * Generate cache invalidation keys for transaction updates
 * Combines keys from both old and new transaction states
 */
export function getTransactionUpdateInvalidationKeys(
  db: typeof PrismaClient,
  userId: string,
  updateData: TransactionUpdateData
): string[] {
  const keys = new Set<string>();
  
  // Add keys for old transaction
  const oldKeys = getTransactionInvalidationKeys(db, userId, updateData.oldData);
  oldKeys.forEach(key => keys.add(key));
  
  // Add keys for new transaction
  const newKeys = getTransactionInvalidationKeys(db, userId, updateData.newData);
  newKeys.forEach(key => keys.add(key));
  
  return Array.from(keys);
}

/**
 * Generate cache invalidation keys for budget mutations
 */
export function getBudgetInvalidationKeys(
  db: typeof PrismaClient,
  userId: string,
  macroCategoryId: string
): string[] {
  return [
    db.getKey({ params: formatCacheKeyParams(CacheKeys.budget.getCurrentSettings(userId)) }),
    db.getKey({ params: formatCacheKeyParams(CacheKeys.budget.getBudgetByCategory(userId, macroCategoryId)) })
  ];
}

/**
 * Generate cache invalidation keys for account mutations
 */
export function getAccountInvalidationKeys(
  db: typeof PrismaClient,
  userId: string,
  accountId?: string
): string[] {
  const keys = [
    db.getKey({ params: formatCacheKeyParams(CacheKeys.account.listWithBalances(userId)) })
  ];
  
  if (accountId) {
    keys.push(
      db.getKey({ params: formatCacheKeyParams(CacheKeys.account.getById(userId, accountId)) }),
      db.getKey({ params: formatCacheKeyParams(CacheKeys.transaction.findManyForBalance(accountId)) })
    );
  }
  
  return keys;
}

/**
 * Generate cache invalidation keys for recurring rule mutations
 */
export function getRecurringRuleInvalidationKeys(
  db: typeof PrismaClient,
  userId: string,
  ruleId?: string,
  isInstallment?: boolean
): string[] {
  const keys = [
    db.getKey({ params: formatCacheKeyParams(CacheKeys.recurringRule.list(userId)) }),
  ];
  
  if (isInstallment !== undefined) {
    keys.push(
      db.getKey({ params: formatCacheKeyParams(CacheKeys.recurringRule.list(userId, true)) }),
      db.getKey({ params: formatCacheKeyParams(CacheKeys.recurringRule.list(userId, false)) })
    );
  }
  
  if (ruleId) {
    keys.push(
      db.getKey({ params: formatCacheKeyParams(CacheKeys.recurringRule.getById(userId, ruleId)) })
    );
  }
  
  return keys;
}

/**
 * Generate cache invalidation keys for goal mutations
 */
export function getGoalInvalidationKeys(
  db: typeof PrismaClient,
  userId: string,
  goalId?: string
): string[] {
  const keys = [
    db.getKey({ params: formatCacheKeyParams(CacheKeys.goal.list(userId)) })
  ];
  
  if (goalId) {
    keys.push(
      db.getKey({ params: formatCacheKeyParams(CacheKeys.goal.getByIdWithProgress(userId, goalId)) }),
      db.getKey({ params: formatCacheKeyParams(CacheKeys.goal.getTransactions(userId, goalId)) })
    );
  }
  
  return keys;
}

