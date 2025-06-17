import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import { getAccountByIdSchema, listAccountsSchema } from "../../schemas/account";

export const queries = {
  listWithBalances: protectedProcedure
    .input(listAccountsSchema)
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      // Create custom cache key for this user's account list
      const cacheKey = ctx.db.getKey({ 
        params: [{ prisma: 'MoneyAccount' }, { operation: 'listWithBalances' }, { userId: userId }] 
      });
      
      // Get all accounts for the user with custom cache key
      const accounts = await ctx.db.moneyAccount.findMany({
        where: {
          userId,
        },
        orderBy: {
          name: "asc",
        },
        cache: { 
          ttl: 300, // 5 minutes TTL for account lists
          key: cacheKey 
        }
      });
      
      // For each account, calculate balance by summing all transactions
      const accountsWithBalances = await Promise.all(
        accounts.map(async (account) => {
          // Create custom cache key for transactions per account
          const transactionsCacheKey = ctx.db.getKey({ 
            params: [{ prisma: 'Transaction' }, { operation: 'findManyForBalance' }, { accountId: account.id }] 
          });
          
          const transactions = await ctx.db.transaction.findMany({
            where: {
              moneyAccountId: account.id,
            },
            select: {
              amount: true,
            },
            cache: { 
              ttl: 180, // 3 minutes TTL for transaction amounts
              key: transactionsCacheKey 
            }
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
      
      // Create custom cache key for specific account
      const cacheKey = ctx.db.getKey({ 
        params: [{ prisma: 'MoneyAccount' }, { operation: 'getById' }, { userId: userId }, { accountId: input.accountId }] 
      });
      
      const account = await ctx.db.moneyAccount.findFirst({
        where: {
          id: input.accountId,
          userId,
        },
        cache: { 
          ttl: 600, // 10 minutes TTL for individual accounts
          key: cacheKey 
        }
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