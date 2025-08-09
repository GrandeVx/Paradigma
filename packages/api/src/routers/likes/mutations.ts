import { protectedProcedure } from "../../trpc";
import { toggleLikeSchema } from "../../schemas/likes";
import { notFoundError, notAuthorizedError } from "../../utils/errors";

export const mutations = {
  // Toggle like on post
  toggleLike: protectedProcedure
    .input(toggleLikeSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if post exists and user can interact with it
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.postId,
          isDeleted: false,
        },
        include: {
          group: {
            select: {
              isPublic: true,
              ownerId: true,
            },
          },
        },
      });

      if (!post) {
        throw notFoundError(ctx, 'post' as any);
      }

      // Check if user can view/interact with this post
      if (!post.isPublic || !post.group.isPublic) {
        // Check if user is group member or group owner
        const membership = await ctx.db.groupMember.findUnique({
          where: {
            userId_groupId: {
              userId: ctx.session.user.id,
              groupId: post.groupId,
            },
          },
        });

        if (!membership && post.group.ownerId !== ctx.session.user.id) {
          throw notAuthorizedError(ctx);
        }
      }

      // Check if like already exists
      const existingLike = await ctx.db.like.findUnique({
        where: {
          userId_postId: {
            userId: ctx.session.user.id,
            postId: input.postId,
          },
        },
      });

      let isLiked: boolean;
      let likeCount: number;

      if (existingLike) {
        // Remove like - use deleteMany to avoid error if already deleted
        const deletedCount = await ctx.db.like.deleteMany({
          where: {
            userId: ctx.session.user.id,
            postId: input.postId,
          },
        });
        isLiked = false;
      } else {
        // Add like - use upsert to avoid conflict if already created
        await ctx.db.like.upsert({
          where: {
            userId_postId: {
              userId: ctx.session.user.id,
              postId: input.postId,
            },
          },
          create: {
            userId: ctx.session.user.id,
            postId: input.postId,
          },
          update: {}, // No updates needed, just ensure it exists
        });
        isLiked = true;
      }

      // Get updated like count
      likeCount = await ctx.db.like.count({
        where: {
          postId: input.postId,
        },
      });

      return {
        isLiked,
        likeCount,
      };
    }),
};