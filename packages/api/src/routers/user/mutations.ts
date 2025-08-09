import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import { addUserSchema, updateProfileSchema, clearNotificationBadgeSchema } from "../../schemas/user";
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

      // Update user profile
      const updatedUser = await ctx.db.user.update({
        where: { id: currentUserId },
        data: {
          ...input,
          notificationToken: input.notificationToken || null,
        },
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
        console.log(`📱 [User] Step 1: Deleting user posts...`);
        // Delete all user posts (will cascade delete likes and comments)
        const deletedPosts = await prisma.post.deleteMany({
          where: {
            authorId: currentUserId,
          },
        });
        console.log(`✅ [User] Deleted ${deletedPosts.count} posts`);

        console.log(`👥 [User] Step 2: Deleting user group memberships...`);
        // Delete all user group memberships
        const deletedMemberships = await prisma.groupMember.deleteMany({
          where: {
            userId: currentUserId,
          },
        });
        console.log(`✅ [User] Deleted ${deletedMemberships.count} memberships`);

        console.log(`📝 [User] Step 3: Deleting user join requests...`);
        // Delete all user group join requests
        const deletedJoinRequests = await prisma.groupJoinRequest.deleteMany({
          where: {
            userId: currentUserId,
          },
        });
        console.log(`✅ [User] Deleted ${deletedJoinRequests.count} join requests`);

        console.log(`🏠 [User] Step 4: Deleting user owned groups...`);
        // Delete all user owned groups (will cascade delete members, posts, etc.)
        const deletedGroups = await prisma.group.deleteMany({
          where: {
            ownerId: currentUserId,
          },
        });
        console.log(`✅ [User] Deleted ${deletedGroups.count} owned groups`);

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
            posts: deletedPosts.count,
            memberships: deletedMemberships.count,
            joinRequests: deletedJoinRequests.count,
            groups: deletedGroups.count,
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

  // Clear notification badge
  clearNotificationBadge: protectedProcedure
    .input(clearNotificationBadgeSchema)
    .mutation(async ({ ctx }) => {
      const currentUserId = ctx.session?.user?.id;
      if (!currentUserId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to clear badge",
        });
      }

      // Get user's notification token
      const user = await ctx.db.user.findUnique({
        where: { id: currentUserId },
        select: { notificationToken: true },
      });

      // Note: Notification badge clearing has been removed as it's not part of the boilerplate
      // This endpoint now simply returns success for compatibility

      return { success: true, message: "Badge cleared successfully" };
    }),
};
