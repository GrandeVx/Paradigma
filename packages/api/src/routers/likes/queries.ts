import { publicProcedure, protectedProcedure } from "../../trpc";
import {
  getPostLikesSchema,
  getLikeStatusSchema,
  getPostLikesCountSchema,
} from "../../schemas/likes";
import { notFoundError, notAuthorizedError } from "../../utils/errors";

export const queries = {
  // Get post likes count
  getPostLikesCount: publicProcedure
    .input(getPostLikesCountSchema)
    .query(async ({ ctx, input }) => {
      // Check if post exists and user can view it
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

      // Check if user can view this post
      if (!post.isPublic || !post.group.isPublic) {
        if (!ctx.session?.user) {
          throw notAuthorizedError(ctx);
        }

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

      const count = await ctx.db.like.count({
        where: {
          postId: input.postId,
        },
      });

      return { count };
    }),

  // Check if user liked post
  getLikeStatus: protectedProcedure
    .input(getLikeStatusSchema)
    .query(async ({ ctx, input }) => {
      // Check if post exists
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.postId,
          isDeleted: false,
        },
        select: { id: true },
      });

      if (!post) {
        throw notFoundError(ctx, 'post' as any);
      }

      const like = await ctx.db.like.findUnique({
        where: {
          userId_postId: {
            userId: ctx.session.user.id,
            postId: input.postId,
          },
        },
      });

      return { isLiked: !!like };
    }),

  // Get users who liked post
  getPostLikes: publicProcedure
    .input(getPostLikesSchema)
    .query(async ({ ctx, input }) => {
      // Check if post exists and user can view it
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

      // Check if user can view this post
      if (!post.isPublic || !post.group.isPublic) {
        if (!ctx.session?.user) {
          throw notAuthorizedError(ctx);
        }

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

      const likes = await ctx.db.like.findMany({
        where: {
          postId: input.postId,
        },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (likes.length > input.limit) {
        const nextItem = likes.pop();
        nextCursor = nextItem!.id;
      }

      return {
        likes,
        nextCursor,
      };
    }),
};