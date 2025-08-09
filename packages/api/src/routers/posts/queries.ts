import { publicProcedure, protectedProcedure } from "../../trpc";
import {
  getPostSchema,
  getGroupPostsSchema,
  getUserPostsSchema,
  getFeedPostsSchema,
} from "../../schemas/posts";
import { notFoundError, notAuthorizedError } from "../../utils/errors";

export const queries = {
  // Get single post with details
  getPost: publicProcedure
    .input(getPostSchema)
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.id,
          isDeleted: false,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
              isPublic: true,
              ownerId: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: { where: { isDeleted: false } },
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

      // Check if current user liked the post
      let isLiked = false;
      if (ctx.session?.user) {
        const like = await ctx.db.like.findUnique({
          where: {
            userId_postId: {
              userId: ctx.session.user.id,
              postId: post.id,
            },
          },
        });
        isLiked = !!like;
      }

      return {
        ...post,
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        isLiked,
      };
    }),

  // Get posts for group (with pagination)
  getGroupPosts: publicProcedure
    .input(getGroupPostsSchema)
    .query(async ({ ctx, input }) => {
      // Check if group exists and user has permission
      const group = await ctx.db.group.findUnique({
        where: { id: input.groupId },
        select: { id: true, isPublic: true, ownerId: true },
      });

      if (!group) {
        throw notFoundError(ctx, 'group' as any);
      }

      // Check access to private group
      if (!group.isPublic && ctx.session?.user) {
        const membership = await ctx.db.groupMember.findUnique({
          where: {
            userId_groupId: {
              userId: ctx.session.user.id,
              groupId: group.id,
            },
          },
        });

        if (!membership && group.ownerId !== ctx.session.user.id) {
          throw notAuthorizedError(ctx);
        }
      } else if (!group.isPublic && !ctx.session?.user) {
        throw notAuthorizedError(ctx);
      }

      const where: any = {
        groupId: input.groupId,
        isDeleted: false,
      };

      // Filter by visibility if needed
      if (input.onlyPublic) {
        where.isPublic = true;
      }

      const posts = await ctx.db.post.findMany({
        where,
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
              isPublic: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: { where: { isDeleted: false } },
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > input.limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }

      // Check liked status for authenticated users
      const postsWithLikeStatus = await Promise.all(
        posts.map(async (post) => {
          let isLiked = false;
          if (ctx.session?.user) {
            const like = await ctx.db.like.findUnique({
              where: {
                userId_postId: {
                  userId: ctx.session.user.id,
                  postId: post.id,
                },
              },
            });
            isLiked = !!like;
          }

          return {
            ...post,
            likeCount: post._count.likes,
            commentCount: post._count.comments,
            isLiked,
          };
        })
      );

      return {
        posts: postsWithLikeStatus,
        nextCursor,
      };
    }),

  // Get posts by user
  getUserPosts: publicProcedure
    .input(getUserPostsSchema)
    .query(async ({ ctx, input }) => {
      const targetUserId = input.userId || ctx.session?.user?.id;

      if (!targetUserId) {
        throw notAuthorizedError(ctx);
      }

      // Check if user exists
      const user = await ctx.db.user.findUnique({
        where: { id: targetUserId },
        select: { id: true },
      });

      if (!user) {
        throw notFoundError(ctx, 'user' as any);
      }

      const where: any = {
        authorId: targetUserId,
        isDeleted: false,
        ...(input.groupId && { groupId: input.groupId }),
      };

      // If viewing another user's posts, only show public posts from public groups
      if (targetUserId !== ctx.session?.user?.id) {
        where.isPublic = true;
        where.group = { isPublic: true };
      }

      const posts = await ctx.db.post.findMany({
        where,
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
              isPublic: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: { where: { isDeleted: false } },
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > input.limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }

      // Check liked status for authenticated users
      const postsWithLikeStatus = await Promise.all(
        posts.map(async (post) => {
          let isLiked = false;
          if (ctx.session?.user) {
            const like = await ctx.db.like.findUnique({
              where: {
                userId_postId: {
                  userId: ctx.session.user.id,
                  postId: post.id,
                },
              },
            });
            isLiked = !!like;
          }

          return {
            ...post,
            likeCount: post._count.likes,
            commentCount: post._count.comments,
            isLiked,
          };
        })
      );

      return {
        posts: postsWithLikeStatus,
        nextCursor,
      };
    }),

  // Get feed posts (user's groups)
  getFeedPosts: protectedProcedure
    .input(getFeedPostsSchema)
    .query(async ({ ctx, input }) => {
      // Get user's groups
      const userGroups = await ctx.db.groupMember.findMany({
        where: {
          userId: ctx.session.user.id,
          isActive: true,
        },
        select: { groupId: true },
      });

      const groupIds = userGroups.map((membership) => membership.groupId);

      if (groupIds.length === 0) {
        return { posts: [], nextCursor: undefined };
      }

      const posts = await ctx.db.post.findMany({
        where: {
          groupId: { in: groupIds },
          isDeleted: false,
        },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
              isPublic: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: { where: { isDeleted: false } },
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > input.limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }

      // Check liked status
      const postsWithLikeStatus = await Promise.all(
        posts.map(async (post) => {
          const like = await ctx.db.like.findUnique({
            where: {
              userId_postId: {
                userId: ctx.session.user.id,
                postId: post.id,
              },
            },
          });

          return {
            ...post,
            likeCount: post._count.likes,
            commentCount: post._count.comments,
            isLiked: !!like,
          };
        })
      );

      return {
        posts: postsWithLikeStatus,
        nextCursor,
      };
    }),
};