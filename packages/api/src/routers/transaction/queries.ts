import { protectedProcedure } from "../../trpc";
import { 
  getTransactionByIdSchema, 
  listTransactionsSchema,
  getMonthlySpendingSchema,
  getCategoryBreakdownSchema,
  getMonthlySummarySchema,
  getSubCategoryBreakdownSchema,
  getDailySpendingSchema,
  getDailyTransactionsSchema,
  getCategoryTransactionsSchema,
  getBudgetInfoSchema,
  getFutureTransactionsSchema,
} from "../../schemas/transaction";

import { notFoundError } from "../../utils/errors";
import type { Prisma } from "@paradigma/db";
import { calculateNextOccurrenceDate } from "../../utils/dateCalculations";
import { CacheKeys, CacheTTL, formatCacheKeyParams } from "../../utils/cacheKeys";

export const queries = {
  list: protectedProcedure
    .input(listTransactionsSchema)
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 20;
      const { cursor, accountId, dateFrom, dateTo, subCategoryId, type } = input;
      
      const userId = ctx.session.user.id;
      
      const filters: Prisma.TransactionWhereInput = { userId };
      if (accountId) filters.moneyAccountId = accountId;
      if (subCategoryId) filters.subCategoryId = subCategoryId;
      
      // Date range filter
      if (dateFrom || dateTo) {
        filters.date = {};
        if (dateFrom) filters.date.gte = dateFrom;
        if (dateTo) filters.date.lte = dateTo;
      }
      
      // Transaction type filter
      if (type) {
        switch (type) {
          case "income":
            filters.amount = { gt: 0 };
            filters.transferId = null;
            break;
          case "expense":
            filters.amount = { lt: 0 };
            filters.transferId = null;
            break;
          case "transfer":
            filters.transferId = { not: null };
            break;
        }
      }
      
      // Get one more item than requested for cursor
      const transactions = await ctx.db.transaction.findMany({
        where: filters,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { date: "desc" },
        include: {
          subCategory: {
            include: {
              macroCategory: true,
            }
          },
          moneyAccount: true,
        }
      });
      
      let nextCursor: string | undefined = undefined;
      if (transactions.length > limit) {
        const nextItem = transactions.pop();
        nextCursor = nextItem?.id;
      }
      
      return {
        items: transactions,
        nextCursor,
      };
    }),
    
  getById: protectedProcedure
    .input(getTransactionByIdSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      const transaction = await ctx.db.transaction.findFirst({
        where: {
          id: input.transactionId,
          userId,
        },
        include: {
          subCategory: {
            include: {
              macroCategory: true,
            }
          },
          moneyAccount: true,
        }
      });
      
      if (!transaction) {
        throw notFoundError(ctx, 'transaction');
      }
      
      return transaction;
    }),

  getMonthlySpending: protectedProcedure
    .input(getMonthlySpendingSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { month, year, accountId, macroCategoryIds } = input;
      
      // Create date range for the specified month
      const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JS Date
      const endDate = new Date(year, month, 0); // Last day of the month
      
      // Create custom cache key for monthly spending
      const cacheKey = ctx.db.getKey({ 
        params: formatCacheKeyParams(
          CacheKeys.transaction.getMonthlySpending(userId, month, year, accountId, macroCategoryIds)
        )
      });
      
      // Build query filters
      const filters: Prisma.TransactionWhereInput = {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        // Exclude transfers from monthly spending but include ALL transactions (income + expense)
        transferId: null,
      };
      
      // Add account filter if specified
      if (accountId) {
        filters.moneyAccountId = accountId;
      }
      
      // Add macro category filter if specified
      if (macroCategoryIds && macroCategoryIds.length > 0) {
        filters.subCategory = {
          macroCategoryId: {
            in: macroCategoryIds
          }
        };
      }
      
      // Get ALL transactions for the month (income + expenses)
      const transactions = await ctx.db.transaction.findMany({
        where: filters,
        include: {
          subCategory: {
            include: {
              macroCategory: true,
            }
          },
          moneyAccount: true,
        },
        orderBy: {
          date: 'desc',
        },
        cache: { 
          ttl: CacheTTL.monthlySpending,
          key: cacheKey 
        }
      });
      
      return transactions;
    }),

  getCategoryBreakdown: protectedProcedure
    .input(getCategoryBreakdownSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { month, year, accountId, type } = input;
      
      // Create date range for the specified month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      // Create custom cache key for category breakdown
      const cacheKey = ctx.db.getKey({ 
        params: formatCacheKeyParams(
          CacheKeys.transaction.getCategoryBreakdown(userId, month, year, type, accountId)
        )
      });
      
      // Build query filters
      const filters: Prisma.TransactionWhereInput = {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        // Filter by transaction type
        amount: type === 'expense' ? { lt: 0 } : { gt: 0 },
        // Exclude transfers
        transferId: null,
      };
      
      // Add account filter if specified
      if (accountId) {
        filters.moneyAccountId = accountId;
      }
      
      // Get transactions grouped by macro category
      const transactions = await ctx.db.transaction.findMany({
        where: filters,
        include: {
          subCategory: {
            include: {
              macroCategory: true,
            }
          },
        },
        cache: { 
          ttl: CacheTTL.categoryBreakdown,
          key: cacheKey 
        }
      });
      
      // Group transactions by macro category and calculate totals
      const categoryMap = new Map<string, {
        id: string;
        name: string;
        color: string;
        icon: string;
        type: 'INCOME' | 'EXPENSE';
        amount: number;
        transactionCount: number;
      }>();
      
      let totalAmount = 0;
      
      transactions.forEach(transaction => {
        const macroCategory = transaction.subCategory?.macroCategory;
        if (!macroCategory) return;
        
        const amount = Math.abs(Number(transaction.amount));
        totalAmount += amount;
        
        const existing = categoryMap.get(macroCategory.id);
        if (existing) {
          existing.amount += amount;
          existing.transactionCount += 1;
        } else {
          categoryMap.set(macroCategory.id, {
            id: macroCategory.id,
            name: macroCategory.name,
            color: macroCategory.color,
            icon: macroCategory.icon,
            type: macroCategory.type,
            amount: amount,
            transactionCount: 1,
          });
        }
      });
      
      // Convert to array and calculate percentages
      const categories = Array.from(categoryMap.values()).map(category => ({
        id: category.id,
        name: category.name,
        amount: category.amount,
        percentage: totalAmount > 0 ? Number(((category.amount / totalAmount) * 100).toFixed(1)) : 0,
        color: category.color,
        icon: category.icon,
        type: category.type,
      }));
      
      // Sort by amount descending
      categories.sort((a, b) => b.amount - a.amount);
      
             return {
         month,
         year,
         type,
         totalAmount,
         categories,
       };
     }),

  getMonthlySummary: protectedProcedure
    .input(getMonthlySummarySchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { month, year, accountId } = input;
      
      // Create date range for the specified month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      // Create custom cache key for monthly summary
      const cacheKey = ctx.db.getKey({ 
        params: formatCacheKeyParams(
          CacheKeys.transaction.getMonthlySummary(userId, month, year, accountId)
        )
      });
      
      // Build base query filters
      const baseFilters: Prisma.TransactionWhereInput = {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        // Exclude transfers from summary
        transferId: null,
      };
      
      // Add account filter if specified
      if (accountId) {
        baseFilters.moneyAccountId = accountId;
      }
      
      // Get income transactions (positive amounts)
      const incomeTransactions = await ctx.db.transaction.findMany({
        where: {
          ...baseFilters,
          amount: { gt: 0 },
        },
        select: { amount: true },
        cache: { 
          ttl: CacheTTL.monthlySummary,
          key: `${cacheKey}:income` 
        }
      });
      
      // Get expense transactions (negative amounts)
      const expenseTransactions = await ctx.db.transaction.findMany({
        where: {
          ...baseFilters,
          amount: { lt: 0 },
        },
        select: { amount: true },
        cache: { 
          ttl: CacheTTL.monthlySummary,
          key: `${cacheKey}:expenses` 
        }
      });
      
      // Calculate totals
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpenses = Math.abs(expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0));
      const remaining = totalIncome - totalExpenses;
      
             return {
         month,
         year,
         income: totalIncome,
         expenses: totalExpenses,
         remaining,
         accountId,
       };
     }),

  getSubCategoryBreakdown: protectedProcedure
    .input(getSubCategoryBreakdownSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { month, year, macroCategoryId, accountId } = input;
      
      // Create date range for the specified month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      // Create custom cache key for sub-category breakdown
      const cacheKey = ctx.db.getKey({ 
        params: formatCacheKeyParams(
          CacheKeys.transaction.getSubCategoryBreakdown(userId, month, year, macroCategoryId, accountId)
        )
      });
      
      // Build query filters
      const filters: Prisma.TransactionWhereInput = {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        // Only expenses (negative amounts)
        amount: { lt: 0 },
        // Exclude transfers
        transferId: null,
        // Filter by macro category
        subCategory: {
          macroCategoryId: macroCategoryId
        }
      };
      
      // Add account filter if specified
      if (accountId) {
        filters.moneyAccountId = accountId;
      }
      
      // Get transactions grouped by sub category
      const transactions = await ctx.db.transaction.findMany({
        where: filters,
        include: {
          subCategory: {
            include: {
              macroCategory: true,
            }
          },
        },
        cache: { 
          ttl: CacheTTL.subCategoryBreakdown,
          key: cacheKey 
        }
      });
      
      // Group transactions by sub category and calculate totals
      const subCategoryMap = new Map<string, {
        id: string;
        name: string;
        icon: string;
        amount: number;
        transactionCount: number;
      }>();
      
      let totalAmount = 0;
      
      transactions.forEach(transaction => {
        const subCategory = transaction.subCategory;
        if (!subCategory) return;
        
        const amount = Math.abs(Number(transaction.amount));
        totalAmount += amount;
        
        const existing = subCategoryMap.get(subCategory.id);
        if (existing) {
          existing.amount += amount;
          existing.transactionCount += 1;
        } else {
          subCategoryMap.set(subCategory.id, {
            id: subCategory.id,
            name: subCategory.name,
            icon: subCategory.icon,
            amount: amount,
            transactionCount: 1,
          });
        }
      });
      
      // Convert to array and calculate percentages
      const subCategories = Array.from(subCategoryMap.values()).map(subCategory => ({
        id: subCategory.id,
        name: subCategory.name,
        amount: subCategory.amount,
        percentage: totalAmount > 0 ? Number(((subCategory.amount / totalAmount) * 100).toFixed(1)) : 0,
        icon: subCategory.icon,
        macroCategoryId: macroCategoryId,
      }));
      
      // Sort by amount descending
      subCategories.sort((a, b) => b.amount - a.amount);
      
             return {
         month,
         year,
         macroCategoryId,
         totalAmount,
         subCategories,
       };
     }),

  getDailySpending: protectedProcedure
    .input(getDailySpendingSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { month, year, accountId } = input;
      
      // Create date range for the specified month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      // Create custom cache key for daily spending
      const cacheKey = ctx.db.getKey({ 
        params: formatCacheKeyParams(
          CacheKeys.transaction.getDailySpending(userId, month, year, accountId)
        )
      });
      
      // Build query filters
      const filters: Prisma.TransactionWhereInput = {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        // Only expenses (negative amounts)
        amount: { lt: 0 },
        // Exclude transfers
        transferId: null,
      };
      
      // Add account filter if specified
      if (accountId) {
        filters.moneyAccountId = accountId;
      }
      
      // Get all expense transactions for the month
      const transactions = await ctx.db.transaction.findMany({
        where: filters,
        select: {
          amount: true,
          date: true,
        },
        cache: { 
          ttl: CacheTTL.dailySpending,
          key: cacheKey 
        }
      });
      
      // Group transactions by day and calculate daily totals
      const dailySpendingMap = new Map<string, number>();
      
      // Initialize all days of the month with 0
      const daysInMonth = endDate.getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        dailySpendingMap.set(dateKey, 0);
      }
      
      // Sum up expenses by day
      transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        const day = transactionDate.getDate();
        const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        const amount = Math.abs(Number(transaction.amount));
        const currentAmount = dailySpendingMap.get(dateKey) || 0;
        dailySpendingMap.set(dateKey, currentAmount + amount);
      });
      
      // Convert to array format with intensity calculation
      const dailySpending = Array.from(dailySpendingMap.entries()).map(([date, amount]) => {
        let intensity: 'none' | 'low' | 'medium' | 'high' = 'none';
        
        if (amount === 0) {
          intensity = 'none';
        } else if (amount <= 50) {
          intensity = 'low';
        } else if (amount <= 100) {
          intensity = 'medium';
        } else {
          intensity = 'high';
        }
        
        return {
          date,
          amount,
          intensity,
          transactionCount: transactions.filter(t => {
            const tDate = new Date(t.date);
            const tDay = tDate.getDate();
            const tDateKey = `${year}-${month.toString().padStart(2, '0')}-${tDay.toString().padStart(2, '0')}`;
            return tDateKey === date;
          }).length,
        };
      });
      
      // Sort by date
      dailySpending.sort((a, b) => a.date.localeCompare(b.date));
      
      return {
        month,
        year,
        dailySpending,
      };
    }),

  // NEW: Query to get future transactions based on recurring rules
  getFutureTransactions: protectedProcedure
    .input(getFutureTransactionsSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { month, year, accountId, macroCategoryIds } = input;
      
      // Create date range for the specified month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      
      // Create custom cache key for future transactions
      const cacheKey = ctx.db.getKey({ 
        params: formatCacheKeyParams(
          CacheKeys.recurringRule.getFutureTransactions(userId, month, year, accountId, macroCategoryIds)
        )
      });
      
      // Build filters for recurring rules
      const filters: Prisma.RecurringTransactionRuleWhereInput = {
        userId,
        isActive: true,
        // Only rules that haven't ended yet
        OR: [
          { endDate: null },
          { endDate: { gte: startDate } }
        ],
        // Only rules that have started before or during this month
        startDate: { lte: endDate }
      };
      
      // Add account filter if specified
      if (accountId) {
        filters.moneyAccountId = accountId;
      }
      
      // Add macro category filter if specified
      if (macroCategoryIds && macroCategoryIds.length > 0) {
        filters.subCategory = {
          macroCategoryId: {
            in: macroCategoryIds
          }
        };
      }
      
      // Get all active recurring rules
      const recurringRules = await ctx.db.recurringTransactionRule.findMany({
        where: filters,
        include: {
          subCategory: {
            include: {
              macroCategory: true,
            }
          },
          moneyAccount: true,
        },
        cache: { 
          ttl: CacheTTL.recurringRules,
          key: cacheKey 
        }
      });
      
      // Generate simulated transactions for the specified month
      const simulatedTransactions: Array<{
        id: string;
        description: string;
        amount: number;
        date: Date;
        subCategory?: {
          id: string;
          name: string;
          icon: string;
          macroCategory: {
            id: string;
            name: string;
            color: string;
            icon: string;
            type: 'INCOME' | 'EXPENSE';
          };
        } | null;
        moneyAccount?: {
          id: string;
          name: string;
          iconName?: string | null;
          color?: string | null;
          currency?: string | null;
        } | null;
        notes?: string | null;
        isRecurringInstance: boolean;
        recurringRuleId: string;
        transferId?: null;
        userId: string;
        moneyAccountId?: string | null;
        subCategoryId?: string | null;
      }> = [];
      
      for (const rule of recurringRules) {
        // Check if rule should be deactivated
        const shouldDeactivate = (
          (rule.endDate && new Date() > rule.endDate) ||
          (rule.isInstallment && rule.totalOccurrences && 
           rule.occurrencesGenerated >= rule.totalOccurrences)
        );
        
        if (shouldDeactivate) continue;
        
        // Calculate all occurrences for this month
        let currentDate = new Date(Math.max(rule.nextDueDate.getTime(), startDate.getTime()));
        let occurrenceCount = rule.occurrencesGenerated;
        
        while (currentDate <= endDate) {
          // Check if this occurrence should be generated
          const shouldGenerate = (
            (!rule.endDate || currentDate <= rule.endDate) &&
            (!rule.isInstallment || !rule.totalOccurrences || 
             occurrenceCount < rule.totalOccurrences)
          );
          
          if (shouldGenerate) {
            // Create simulated transaction
            const transactionAmount = rule.type === "EXPENSE" 
              ? -Math.abs(Number(rule.amount))
              : Math.abs(Number(rule.amount));
              
            // For installments, calculate individual amount
            const finalAmount = rule.isInstallment && rule.totalOccurrences
              ? transactionAmount / rule.totalOccurrences
              : transactionAmount;
            
            const description = rule.isInstallment && rule.totalOccurrences
              ? `${rule.description} (${occurrenceCount + 1}/${rule.totalOccurrences})`
              : rule.description;
            
            simulatedTransactions.push({
              id: `simulated-${rule.id}-${currentDate.getTime()}`,
              description,
              amount: finalAmount,
              date: new Date(currentDate),
              subCategory: rule.subCategory,
              moneyAccount: rule.moneyAccount,
              notes: rule.notes,
              isRecurringInstance: true,
              recurringRuleId: rule.id,
              transferId: null,
              userId: rule.userId,
              moneyAccountId: rule.moneyAccountId,
              subCategoryId: rule.subCategoryId,
            });
            
            occurrenceCount++;
          }
          
          // Calculate next occurrence date
          try {
            const nextDate = calculateNextOccurrenceDate(
              currentDate,
              rule.frequencyType,
              rule.frequencyInterval,
              rule.dayOfMonth,
              rule.dayOfWeek
            );
            
            // Prevent infinite loop
            if (nextDate.getTime() <= currentDate.getTime()) {
              break;
            }
            
            currentDate = nextDate;
          } catch (error) {
            // Break if date calculation fails
            break;
          }
        }
      }
      
      // Sort transactions by date descending (most recent first)
      simulatedTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      return simulatedTransactions;
    }),

}; 

// Daily transactions view
export const getDailyTransactions = protectedProcedure
  .input(getDailyTransactionsSchema)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    
    // Create custom cache key for daily transactions
    const cacheKey = ctx.db.getKey({ 
      params: formatCacheKeyParams(
        CacheKeys.transaction.getDailyTransactions(userId, input.date, input.accountId)
      )
    });
    
    const startDate = new Date(input.date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(input.date);
    endDate.setHours(23, 59, 59, 999);

    const filters: Prisma.TransactionWhereInput = {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (input.accountId) {
      filters.moneyAccountId = input.accountId;
    }

    const transactions = await ctx.db.transaction.findMany({
      where: filters,
      include: {
        subCategory: {
          include: {
            macroCategory: true,
          },
        },
        moneyAccount: true,
      },
      orderBy: {
        date: 'desc',
      },
      cache: { 
        ttl: CacheTTL.dailyTransactions,
        key: cacheKey 
      }
    });

    const totalAmount = transactions
      .filter(t => !t.transferId)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      transactions,
      totalAmount,
      date: input.date,
    };
  });

// Category transactions view
export const getCategoryTransactions = protectedProcedure
  .input(getCategoryTransactionsSchema)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    
    // Create custom cache key for category transactions
    const cacheKey = ctx.db.getKey({ 
      params: formatCacheKeyParams(
        CacheKeys.transaction.getCategoryTransactions(userId, input.categoryId, input.month, input.year, input.accountId)
      )
    });
    
    const startDate = new Date(input.year, input.month - 1, 1);
    const endDate = new Date(input.year, input.month, 0, 23, 59, 59, 999);

    // Find the macro category first
    const macroCategory = await ctx.db.macroCategory.findFirst({
      where: {
        id: input.categoryId,
      },
      include: {
        subCategories: true,
      },
      cache: { 
        ttl: CacheTTL.categories,
        key: `${cacheKey}:macroCategory` 
      }
    });

    if (!macroCategory) {
      throw notFoundError(ctx, 'category');
    }

    const subCategoryIds = macroCategory.subCategories.map(sc => sc.id);

    const filters: Prisma.TransactionWhereInput = {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      subCategoryId: {
        in: subCategoryIds,
      },
    };

    if (input.accountId) {
      filters.moneyAccountId = input.accountId;
    }

    const transactions = await ctx.db.transaction.findMany({
      where: filters,
      include: {
        subCategory: {
          include: {
            macroCategory: true,
          },
        },
        moneyAccount: true,
      },
      orderBy: {
        date: 'desc',
      },
      cache: { 
        ttl: CacheTTL.categoryTransactions,
        key: `${cacheKey}:transactions` 
      }
    });

    // Group transactions by day
    const groupedByDay: Record<string, { date: string; transactions: typeof transactions; totalAmount: number }> = {};
    
    transactions.forEach((transaction) => {
      const date = transaction.date.toISOString().split('T')[0]!;
      if (!groupedByDay[date]) {
        groupedByDay[date] = {
          date,
          transactions: [],
          totalAmount: 0,
        };
      }
      groupedByDay[date]!.transactions.push(transaction);
      groupedByDay[date]!.totalAmount += Number(transaction.amount);
    });

    const dailyGroups = Object.values(groupedByDay).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const totalAmount = Math.abs(transactions.reduce((sum, t) => sum + Number(t.amount), 0));

    return {
      macroCategory,
      dailyGroups,
      totalAmount,
      month: input.month,
      year: input.year,
    };
  });

// Budget info for category
export const getBudgetInfo = protectedProcedure
  .input(getBudgetInfoSchema)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Create custom cache key for budget info
    const cacheKey = ctx.db.getKey({ 
      params: formatCacheKeyParams(
        CacheKeys.transaction.getBudgetInfo(userId, input.categoryId, input.month, input.year)
      )
    });

    // Check if budget exists for this category and month
    const budget = await ctx.db.budget.findFirst({
      where: {
        userId: userId,
        macroCategoryId: input.categoryId,
      },
      cache: { 
        ttl: CacheTTL.budgetSettings,
        key: `${cacheKey}:budget` 
      }
    });

    if (!budget) {
      return null;
    }

    // Get the macro category details
    const macroCategory = await ctx.db.macroCategory.findFirst({
      where: {
        id: input.categoryId,
      },
      include: {
        subCategories: true,
      },
      cache: { 
        ttl: CacheTTL.categories,
        key: `${cacheKey}:macroCategory` 
      }
    });

    if (!macroCategory) {
      return null;
    }

    // Calculate spent amount for this category in this month
    const startDate = new Date(input.year, input.month - 1, 1);
    const endDate = new Date(input.year, input.month, 0, 23, 59, 59, 999);

    const subCategoryIds = macroCategory.subCategories.map(sc => sc.id);

    const spentTransactions = await ctx.db.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        subCategoryId: {
          in: subCategoryIds,
        },
        amount: {
          lt: 0, // Only expenses
        },
      },
      cache: { 
        ttl: CacheTTL.budgetInfo,
        key: `${cacheKey}:spentTransactions` 
      }
    });

    const spentAmount = Math.abs(
      spentTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
    );
    
    const budgetAmount = Number(budget.allocatedAmount);
    const remainingAmount = budgetAmount - spentAmount;
    const progressPercentage = Math.min((spentAmount / budgetAmount) * 100, 100);

    return {
      budget: {
        ...budget,
        amount: budgetAmount,
      },
      spentAmount,
      remainingAmount,
      progressPercentage,
      macroCategory,
    };
  }); 