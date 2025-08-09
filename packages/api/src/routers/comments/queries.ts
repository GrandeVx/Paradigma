import { publicProcedure } from "../../trpc";
import {
  getCommentSchema,
  getPostCommentsSchema,
  getCommentRepliesSchema,
  getCommentThreadSchema,
} from "../../schemas/comments";
import { notFoundError, notAuthorizedError } from "../../utils/errors";

export const queries = {
  // Get single comment with details
  getComment: publicProcedure
    .input(getCommentSchema)
    .query(async ({ ctx, input }) => {
      const comment = await ctx.db.comment.findFirst({
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
          post: {
            include: {
              group: {
                select: {
                  id: true,
                  name: true,
                  isPublic: true,
                  ownerId: true,
                },
              },
            },
          },
          parent: {
            select: {
              id: true,
              content: true,
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!comment) {
        throw notFoundError(ctx, 'comment' as any);
      }

      // Check if user can view this comment (based on post/group visibility)
      if (!comment.post.isPublic || !comment.post.group.isPublic) {
        if (!ctx.session?.user) {
          throw notAuthorizedError(ctx);
        }

        // Check if user is group member or group owner
        const membership = await ctx.db.groupMember.findUnique({
          where: {
            userId_groupId: {
              userId: ctx.session.user.id,
              groupId: comment.post.groupId,
            },
          },
        });

        if (!membership && comment.post.group.ownerId !== ctx.session.user.id) {
          throw notAuthorizedError(ctx);
        }
      }

      return {
        ...comment,
        replyCount: 0,
      };
    }),

  // Get post comments (with pagination and optional replies)
  getPostComments: publicProcedure
    .input(getPostCommentsSchema)
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

      const where: any = {
        postId: input.postId,
        isDeleted: false,
        parentId: null, // Only top-level comments
      };

      const comments = await ctx.db.comment.findMany({
        where,
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
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
      if (comments.length > input.limit) {
        const nextItem = comments.pop();
        nextCursor = nextItem!.id;
      }

      return {
        comments: comments.map((comment) => ({
          ...comment,
          replyCount: 0,
          replies: undefined,
        })),
        nextCursor,
      };
    }),

  // Get replies to a comment
  getCommentReplies: publicProcedure
    .input(getCommentRepliesSchema)
    .query(async ({ ctx, input }) => {
      // Check if parent comment exists and user can view it
      const parentComment = await ctx.db.comment.findFirst({
        where: {
          id: input.commentId,
          isDeleted: false,
        },
        include: {
          post: {
            include: {
              group: {
                select: {
                  id: true,
                  isPublic: true,
                  ownerId: true,
                },
              },
            },
          },
        },
      });

      if (!parentComment) {
        throw notFoundError(ctx, 'comment' as any);
      }

      // Check if user can view this comment (based on post/group visibility)
      if (!parentComment.post.isPublic || !parentComment.post.group.isPublic) {
        if (!ctx.session?.user) {
          throw notAuthorizedError(ctx);
        }

        // Check if user is group member or group owner
        const membership = await ctx.db.groupMember.findUnique({
          where: {
            userId_groupId: {
              userId: ctx.session.user.id,
              groupId: parentComment.post.groupId,
            },
          },
        });

        if (!membership && parentComment.post.group.ownerId !== ctx.session.user.id) {
          throw notAuthorizedError(ctx);
        }
      }

      const replies = await ctx.db.comment.findMany({
        where: {
          parentId: input.commentId,
          isDeleted: false,
        },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
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
      if (replies.length > input.limit) {
        const nextItem = replies.pop();
        nextCursor = nextItem!.id;
      }

      return {
        replies: replies.map((reply) => ({
          ...reply,
          replyCount: 0,
        })),
        nextCursor,
      };
    }),

  // Get comment thread (full conversation tree)
  getCommentThread: publicProcedure
    .input(getCommentThreadSchema)
    .query(async ({ ctx, input }) => {
      // First, get the root comment and check permissions
      const rootComment = await ctx.db.comment.findFirst({
        where: {
          id: input.commentId,
          isDeleted: false,
        },
        include: {
          post: {
            include: {
              group: {
                select: {
                  id: true,
                  isPublic: true,
                  ownerId: true,
                },
              },
            },
          },
        },
      });

      if (!rootComment) {
        throw notFoundError(ctx, 'comment' as any);
      }

      // Check if user can view this comment
      if (!rootComment.post.isPublic || !rootComment.post.group.isPublic) {
        if (!ctx.session?.user) {
          throw notAuthorizedError(ctx);
        }

        const membership = await ctx.db.groupMember.findUnique({
          where: {
            userId_groupId: {
              userId: ctx.session.user.id,
              groupId: rootComment.post.groupId,
            },
          },
        });

        if (!membership && rootComment.post.group.ownerId !== ctx.session.user.id) {
          throw notAuthorizedError(ctx);
        }
      }

      // Find the root of the thread (in case the input comment is a reply)
      let threadRootId = input.commentId;
      if (rootComment.parentId) {
        // Find the root comment of this thread
        const rootOfThread = await ctx.db.comment.findFirst({
          where: {
            id: rootComment.parentId,
            parentId: null,
            isDeleted: false,
          },
          select: { id: true },
        });
        if (rootOfThread) {
          threadRootId = rootOfThread.id;
        }
      }

      // Recursively get the thread
      const getCommentWithReplies = async (commentId: string, depth = 0): Promise<any> => {
        if (depth > 10) return null; // Prevent infinite recursion

        const comment = await ctx.db.comment.findFirst({
          where: {
            id: commentId,
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
            replies: {
              where: { isDeleted: false },
              orderBy: { createdAt: 'asc' },
              take: input.limit,
            },
          },
        });

        if (!comment) return null;

        const replies = await Promise.all(
          comment.replies.map((reply) => getCommentWithReplies(reply.id, depth + 1))
        );

        return {
          ...comment,
          replies: replies.filter(Boolean),
        };
      };

      const thread = await getCommentWithReplies(threadRootId);

      return { thread };
    }),
};