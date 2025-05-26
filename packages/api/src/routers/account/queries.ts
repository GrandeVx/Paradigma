import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import { getAccountByIdSchema, listAccountsSchema } from "../../schemas/account";

export const queries = {
  listWithBalances: protectedProcedure
    .input(listAccountsSchema)
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      // Get all accounts for the user
      const accounts = await ctx.db.moneyAccount.findMany({
        where: {
          userId,
        },
        orderBy: {
          name: "asc",
        },
      });
      
      // For each account, calculate balance by summing all transactions
      const accountsWithBalances = await Promise.all(
        accounts.map(async (account) => {
          const transactions = await ctx.db.transaction.findMany({
            where: {
              moneyAccountId: account.id,
            },
            select: {
              amount: true,
            },
          });
          
          // Sum the transaction amounts and add the initial account balance
          const transactionSum = transactions.reduce(
            (sum, transaction) => sum + Number(transaction.amount), 
            0
          );
          
          const balance = Number(account.initialBalance) + transactionSum;
          
          return {
            account,
            balance,
          };
        })
      );
      
      return accountsWithBalances;
    }),
    
  getById: protectedProcedure
    .input(getAccountByIdSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      const account = await ctx.db.moneyAccount.findFirst({
        where: {
          id: input.accountId,
          userId,
        },
      });
      
      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found"
        });
      }
      
      return account;
    }),
}; 