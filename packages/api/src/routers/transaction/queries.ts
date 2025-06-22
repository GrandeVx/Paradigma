import { protectedProcedure } from "../../trpc";
import { 
  getTransactionByIdSchema, 
  listTransactionsSchema,
  getMonthlySpendingSchema,
  getCategoryBreakdownSchema,
  getMonthlySummarySchema,
  getSubCategoryBreakdownSchema,
  getDailySpendingSchema
} from "../../schemas/transaction";
import { notFoundError } from "../../utils/errors";
import type { Prisma } from "@paradigma/db";

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
        params: [
          { prisma: 'Transaction' }, 
          { operation: 'getMonthlySpending' }, 
          { userId }, 
          { month: month.toString(), year: year.toString() },
          { accountId: accountId || 'all' },
          { macroCategoryIds: macroCategoryIds?.join(',') || 'all' }
        ] 
      });
      
      // Build query filters
      const filters: Prisma.TransactionWhereInput = {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        // Only include expenses (negative amounts)
        amount: { lt: 0 },
        // Exclude transfers
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
      
      // Get all expense transactions for the month
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
          ttl: 300, // 5 minutes TTL for monthly spending
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
      });
      
      // Get expense transactions (negative amounts)
      const expenseTransactions = await ctx.db.transaction.findMany({
        where: {
          ...baseFilters,
          amount: { lt: 0 },
        },
        select: { amount: true },
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
}; 