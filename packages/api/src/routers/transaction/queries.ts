import { protectedProcedure } from "../../trpc";
import { 
  getTransactionByIdSchema, 
  listTransactionsSchema,
  getMonthlySpendingSchema
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
}; 