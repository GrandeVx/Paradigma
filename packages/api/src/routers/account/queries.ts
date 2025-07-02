import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import { getAccountByIdSchema, listAccountsSchema } from "../../schemas/account";
import { CacheKeys, CacheTTL, formatCacheKeyParams } from "../../utils/cacheKeys";

export const queries = {
  listWithBalances: protectedProcedure
    .input(listAccountsSchema)
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      // Create custom cache key for this user's account list
      const cacheKey = ctx.db.getKey({ 
        params: formatCacheKeyParams(
          CacheKeys.account.listWithBalances(userId)
        )
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
          ttl: CacheTTL.accountList,
          key: cacheKey 
        }
      });
      
      // For each account, calculate balance by summing all transactions
      const accountsWithBalances = await Promise.all(
        accounts.map(async (account) => {
          // Create custom cache key for transactions per account
          const transactionsCacheKey = ctx.db.getKey({ 
            params: formatCacheKeyParams(
              CacheKeys.transaction.findManyForBalance(account.id)
            )
          });
          
          const transactions = await ctx.db.transaction.findMany({
            where: {
              moneyAccountId: account.id,
            },
            select: {
              amount: true,
            },
            cache: { 
              ttl: CacheTTL.transactionAmounts,
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
        params: formatCacheKeyParams(
          CacheKeys.account.getById(userId, input.accountId)
        )
      });
      
      const account = await ctx.db.moneyAccount.findFirst({
        where: {
          id: input.accountId,
          userId,
        },
        cache: { 
          ttl: CacheTTL.individualAccount,
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