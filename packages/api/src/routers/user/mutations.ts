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

  // Delete user account (soft delete)
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const currentUserId = ctx.session?.user?.id;
    if (!currentUserId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to delete your account",
      });
    }

    // Soft delete the user with cache invalidation
    const deletedUser = await ctx.db.user.update({
      where: { id: currentUserId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
      // Invalidate all user-related caches when account is deleted
      uncache: {
        uncacheKeys: [
          // Invalidate all data related to this user
          `balanceapp:*:user_id:${currentUserId}*`,
          // Invalidate user profile data
          `balanceapp:user:id:${currentUserId}*`
        ],
        hasPattern: true
      }
    });

    return deletedUser;
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
