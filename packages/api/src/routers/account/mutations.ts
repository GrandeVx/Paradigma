import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import { createAccountSchema, deleteAccountSchema, updateAccountSchema } from "../../schemas/account";
import { getAccountInvalidationKeys } from "../../utils/cacheInvalidation";

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
          uncacheKeys: getAccountInvalidationKeys(ctx.db, userId)
        }
      });
      
      return account;
    }),
    
  update: protectedProcedure
    .input(updateAccountSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(`🏦 [Account] Starting update mutation`);
      console.log(`📥 [Account] Input:`, input);
      
      const userId = ctx.session.user.id;
      console.log(`👤 [Account] User ID: ${userId}`);
      
      try {
        console.log(`🔍 [Account] Verifying account ownership for ID: ${input.accountId}`);
        
        // Verify account belongs to user
        const existingAccount = await ctx.db.moneyAccount.findFirst({
          where: {
            id: input.accountId,
            userId,
          },
        });
        
        if (!existingAccount) {
          console.log(`❌ [Account] Account not found or doesn't belong to user`);
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Account not found"
          });
        }
        
        console.log(`✅ [Account] Account found:`, existingAccount);
        
        // If updating name, check for name conflicts
        if (input.name && input.name !== existingAccount.name) {
          console.log(`🔍 [Account] Checking name conflict for: ${input.name}`);
          
          const nameConflict = await ctx.db.moneyAccount.findFirst({
            where: {
              userId,
              name: input.name,
              id: { not: input.accountId },
            },
          });
          
          if (nameConflict) {
            console.log(`❌ [Account] Name conflict found:`, nameConflict);
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "An account with this name already exists"
            });
          }
          
          console.log(`✅ [Account] No name conflict found`);
        }
        
        // Handle making this account the default
        if (input.default === true) {
          console.log(`🔄 [Account] Making account default, removing default from others`);
          
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
              uncacheKeys: getAccountInvalidationKeys(ctx.db, userId)
            }
          });
          
          console.log(`✅ [Account] Removed default status from other accounts`);
        }
        
        // Prepare update data
        const updateData: Record<string, unknown> = {};
        
        if (input.name) updateData.name = input.name;
        if ('iconName' in input) updateData.iconName = input.iconName;
        if ('color' in input) updateData.color = input.color;
        if ('default' in input) updateData.default = input.default;
        if ('isGoalAccount' in input) updateData.isGoalAccount = input.isGoalAccount;
        if ('targetAmount' in input) updateData.targetAmount = input.targetAmount;
        if ('includeInTotal' in input) updateData.includeInTotal = input.includeInTotal;
        console.log(`📝 [Account] Update data prepared:`, updateData);
        console.log(`💾 [Account] Executing database update`);
        
        const startTime = Date.now();
        
        // Update account
        const updatedAccount = await ctx.db.moneyAccount.update({
          where: {
            id: input.accountId,
          },
          data: updateData,
          // Precise cache invalidation for both list and specific account
          uncache: {
            uncacheKeys: getAccountInvalidationKeys(ctx.db, userId, input.accountId)
          }
        });
        
        const dbTime = Date.now() - startTime;
        console.log(`✅ [Account] Database update completed in ${dbTime}ms`);
        console.log(`📤 [Account] Updated account:`, updatedAccount);
        
        return updatedAccount;
      } catch (error) {
        console.error(`❌ [Account] Error in update mutation:`, error);
        throw error;
      }
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
      
      // Use transaction to ensure atomicity when deleting account with recurring rules
      await ctx.db.$transaction(async (tx) => {
        // Delete all recurring transaction rules associated with this account
        await tx.recurringTransactionRule.deleteMany({
          where: {
            moneyAccountId: input.accountId,
          },
        });
        
        // Delete the account
        await tx.moneyAccount.delete({
          where: {
            id: input.accountId,
          },
          // Precise invalidation for accounts and related transactions
          uncache: {
            uncacheKeys: getAccountInvalidationKeys(ctx.db, userId, input.accountId)
          }
        });
      });
      
      return { success: true };
    }),
};
