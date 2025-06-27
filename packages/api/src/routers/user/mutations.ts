import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import { addUserSchema, updateProfileSchema } from "../../schemas/user";
export const mutations = {
  // Update user profile
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session?.user?.id;
      if (!currentUserId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update your profile",
        });
      }

      // Get current user data for audit log
      const currentUser = await ctx.db.user.findUnique({
        where: { id: currentUserId },
      });

      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check username uniqueness if being updated
      if (input.username && input.username !== currentUser.username) {
        const existingUser = await ctx.db.user.findUnique({
          where: { username: input.username },
        });

        if (existingUser) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Username already taken",
          });
        }
      }

      // Update user profile with cache invalidation
      const updatedUser = await ctx.db.user.update({
        where: { id: currentUserId },
        data: {
          ...input,
          notificationToken: input.notificationToken || null,
        },
        // Invalidate user cache when profile is updated
        uncache: {
          uncacheKeys: [
            // Invalidate the specific user cache
            `balanceapp:user:id:${currentUserId}`
          ]
        }
      });

      return updatedUser;
    }),

  // Delete user account (hard delete with complete data removal)
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const currentUserId = ctx.session?.user?.id;
    if (!currentUserId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to delete your account",
      });
    }

    console.log(`🗑️ [User] Starting complete account deletion for user: ${currentUserId}`);

    try {
      // Use Prisma transaction to ensure atomicity
      const result = await ctx.db.$transaction(async (prisma) => {
        console.log(`📊 [User] Step 1: Deleting user transactions...`);
        // Delete all user transactions
        const deletedTransactions = await prisma.transaction.deleteMany({
          where: {
            userId: currentUserId,
          },
        });
        console.log(`✅ [User] Deleted ${deletedTransactions.count} transactions`);

        console.log(`📈 [User] Step 2: Deleting user budgets...`);
        // Delete all user budgets
        const deletedBudgets = await prisma.budget.deleteMany({
          where: {
            userId: currentUserId,
          },
        });
        console.log(`✅ [User] Deleted ${deletedBudgets.count} budgets`);

        console.log(`🔄 [User] Step 3: Deleting recurring transaction rules...`);
        // Delete all user recurring transaction rules
        const deletedRecurringRules = await prisma.recurringTransactionRule.deleteMany({
          where: {
            userId: currentUserId,
          },
        });
        console.log(`✅ [User] Deleted ${deletedRecurringRules.count} recurring rules`);

        console.log(`🏦 [User] Step 4: Deleting money accounts...`);
        // Delete all user money accounts
        const deletedAccounts = await prisma.moneyAccount.deleteMany({
          where: {
            userId: currentUserId,
          },
        });
        console.log(`✅ [User] Deleted ${deletedAccounts.count} money accounts`);

        console.log(`👤 [User] Step 5: Deleting user profile...`);
        // Finally, delete the user (Sessions and OAuth Accounts will be cascade deleted)
        const deletedUser = await prisma.user.delete({
          where: {
            id: currentUserId,
          },
        });
        console.log(`✅ [User] User profile deleted successfully`);

        return {
          deletedUser,
          stats: {
            transactions: deletedTransactions.count,
            budgets: deletedBudgets.count,
            recurringRules: deletedRecurringRules.count,
            accounts: deletedAccounts.count,
          },
        };
      });

          console.log(`🎉 [User] Account deletion completed successfully:`, result.stats);
    
    // Note: Caches will be automatically invalidated when data is deleted
    return { success: true, deletedData: result.stats };

    } catch (error) {
      console.error(`❌ [User] Error during account deletion:`, error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete account completely. Please contact support.",
      });
    }
  }),

  addUser: protectedProcedure
    .input(addUserSchema)
    .mutation(async ({ ctx, input }) => {
      const currentUserId = input.id;
      if (!currentUserId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to add a user",
        });
      }

      const newUser = await ctx.db.user.create({
        data: {
          email: input.email,
          isDeleted: false,
          id: currentUserId,
        },
      });

      return newUser;
    }),
};
