import { Prisma } from "@prisma/client";
import { protectedProcedure } from "../../trpc";
import { 
  getTransactionByIdSchema, 
  listTransactionsSchema 
} from "../../schemas/transaction";
import { notFoundError } from "../../utils/errors";

export const queries = {
  list: protectedProcedure
    .input(listTransactionsSchema)
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 20;
      const { cursor, accountId, dateFrom, dateTo, subCategoryId, goalId, type } = input;
      
      const userId = ctx.session.user.id;
      
      const filters: Prisma.TransactionWhereInput = { userId };
      
      if (accountId) filters.accountId = accountId;
      if (subCategoryId) filters.subCategoryId = subCategoryId;
      if (goalId) filters.goalId = goalId;
      
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
          MoneyAccount: true,
          goal: true,
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
          MoneyAccount: true,
          goal: true,
        }
      });
      
      if (!transaction) {
        throw notFoundError(ctx, 'transaction');
      }
      
      return transaction;
    }),
}; 