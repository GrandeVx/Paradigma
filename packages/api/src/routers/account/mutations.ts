import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import { createAccountSchema, deleteAccountSchema, updateAccountSchema } from "../../schemas/account";

export const mutations = {
  create: protectedProcedure
    .input(createAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Check if account with same name already exists for this user
      const existingAccount = await ctx.db.moneyAccount.findFirst({
        where: {
          userId,
          name: input.name,
        },
      });
      
      if (existingAccount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "An account with this name already exists"
        });
      }
      
      const account = await ctx.db.moneyAccount.create({
        data: {
          ...input,
          userId,
        },
        // Precise cache invalidation using custom keys
        uncache: {
          uncacheKeys: [
            // Invalidate the user's account list cache
            ctx.db.getKey({ 
              params: [{ prisma: 'MoneyAccount' }, { operation: 'listWithBalances' }, { userId: userId }] 
            }),
          ],
          hasPattern: false
        }
      });
      
      return account;
    }),
    
  update: protectedProcedure
    .input(updateAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify account belongs to user
      const existingAccount = await ctx.db.moneyAccount.findFirst({
        where: {
          id: input.accountId,
          userId,
        },
      });
      
      if (!existingAccount) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found"
        });
      }
      
      // If updating name, check for name conflicts
      if (input.name && input.name !== existingAccount.name) {
        const nameConflict = await ctx.db.moneyAccount.findFirst({
          where: {
            userId,
            name: input.name,
            id: { not: input.accountId },
          },
        });
        
        if (nameConflict) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "An account with this name already exists"
          });
        }
      }
      
      // Handle making this account the default
      if (input.default === true) {
        // First, remove default status from any other accounts
        await ctx.db.moneyAccount.updateMany({
          where: {
            userId,
            default: true,
          },
          data: {
            default: false,
          },
          // Invalidate account list when changing default status
          uncache: {
            uncacheKeys: [
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'listWithBalances' }, { userId: userId }] 
              }),
            ],
            hasPattern: false
          }
        });
      }
      
      // Prepare update data
      const updateData: Record<string, unknown> = {};
      
      if (input.name) updateData.name = input.name;
      if ('iconName' in input) updateData.iconName = input.iconName;
      if ('color' in input) updateData.color = input.color;
      if ('default' in input) updateData.default = input.default;
      if ('isGoalAccount' in input) updateData.isGoalAccount = input.isGoalAccount;
      if ('targetAmount' in input) updateData.targetAmount = input.targetAmount;
      
      // Update account
      const updatedAccount = await ctx.db.moneyAccount.update({
        where: {
          id: input.accountId,
        },
        data: updateData,
        // Precise cache invalidation for both list and specific account
        uncache: {
          uncacheKeys: [
            // Invalidate the user's account list cache
            ctx.db.getKey({ 
              params: [{ prisma: 'MoneyAccount' }, { operation: 'listWithBalances' }, { userId: userId }] 
            }),
            // Invalidate specific account cache
            ctx.db.getKey({ 
              params: [{ prisma: 'MoneyAccount' }, { operation: 'getById' }, { userId: userId }, { accountId: input.accountId }] 
            }),
          ],
          hasPattern: false
        }
      });
      
      return updatedAccount;
    }),
    
  delete: protectedProcedure
    .input(deleteAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify account belongs to user
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
      
      // Check if this is the default account
      if (account.default) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete the default account"
        });
      }
      
      // Check if account has transactions
      const transactionCount = await ctx.db.transaction.count({
        where: {
          moneyAccountId: input.accountId,
        },
      });
      
      if (transactionCount > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete an account with transactions"
        });
      }
      
      // Delete account
      await ctx.db.moneyAccount.delete({
        where: {
          id: input.accountId,
        },
        // Precise invalidation for accounts and related transactions
        uncache: {
          uncacheKeys: [
            // Invalidate the user's account list cache
            ctx.db.getKey({ 
              params: [{ prisma: 'MoneyAccount' }, { operation: 'listWithBalances' }, { userId: userId }] 
            }),
            // Invalidate specific account cache
            ctx.db.getKey({ 
              params: [{ prisma: 'MoneyAccount' }, { operation: 'getById' }, { userId: userId }, { accountId: input.accountId }] 
            }),
            // Invalidate transaction cache for this account (balances will change)
            ctx.db.getKey({ 
              params: [{ prisma: 'Transaction' }, { operation: 'findManyForBalance' }, { accountId: input.accountId }] 
            }),
          ],
          hasPattern: false
        }
      });
      
      return { success: true };
    }),
};
