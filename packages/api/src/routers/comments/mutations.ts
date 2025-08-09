import { protectedProcedure } from "../../trpc";
import {
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
} from "../../schemas/comments";
import { notFoundError, notAuthorizedError } from "../../utils/errors";

export const mutations = {
  // Add comment to post or reply to comment
  createComment: protectedProcedure
    .input(createCommentSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if post exists and user can comment
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.postId,
          isDeleted: false,
        },
        include: {
          group: {
            select: {
              id: true,
              isPublic: true,
              ownerId: true,
            },
          },
        },
      });

      if (!post) {
        throw notFoundError(ctx, 'post' as any);
      }

      // Check if user can interact with this post
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

      // If replying to a comment, verify it exists and belongs to the same post
      if (input.parentId) {
        const parentComment = await ctx.db.comment.findFirst({
          where: {
            id: input.parentId,
            postId: input.postId,
            isDeleted: false,
          },
        });

        if (!parentComment) {
          throw notFoundError(ctx, 'comment' as any);
        }
      }

      const comment = await ctx.db.comment.create({
        data: {
          content: input.content,
          authorId: ctx.session.user.id,
          postId: input.postId,
          parentId: input.parentId,
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
          parent: input.parentId ? {
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
          } : undefined,
          _count: {
            select: {
              replies: { where: { isDeleted: false } },
            },
          },
        },
      });

      return {
        ...comment,
        replyCount: comment._count.replies,
      };
    }),

  // Update comment (author only)
  updateComment: protectedProcedure
    .input(updateCommentSchema)
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.comment.findFirst({
        where: {
          id: input.id,
          isDeleted: false,
        },
        select: {
          id: true,
          authorId: true,
          postId: true,
        },
      });

      if (!comment) {
        throw notFoundError(ctx, 'comment' as any);
      }

      if (comment.authorId !== ctx.session.user.id) {
        throw notAuthorizedError(ctx);
      }

      const updatedComment = await ctx.db.comment.update({
        where: { id: input.id },
        data: {
          content: input.content,
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
          _count: {
            select: {
              replies: { where: { isDeleted: false } },
            },
          },
        },
      });

      return {
        ...updatedComment,
        replyCount: updatedComment._count.replies,
      };
    }),

  // Delete comment (author or group admins)
  deleteComment: protectedProcedure
    .input(deleteCommentSchema)
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.comment.findFirst({
        where: {
          id: input.id,
          isDeleted: false,
        },
        include: {
          post: {
            include: {
              group: {
                select: {
                  ownerId: true,
                },
              },
            },
          },
        },
      });

      if (!comment) {
        throw notFoundError(ctx, 'comment' as any);
      }

      const isAuthor = comment.authorId === ctx.session.user.id;
      const isGroupOwner = comment.post.group.ownerId === ctx.session.user.id;
      
      // Check if user is group admin
      let isGroupAdmin = false;
      if (!isAuthor && !isGroupOwner) {
        const membership = await ctx.db.groupMember.findUnique({
          where: {
            userId_groupId: {
              userId: ctx.session.user.id,
              groupId: comment.post.groupId,
            },
          },
          select: { role: true },
        });

        isGroupAdmin = membership?.role === 'admin';
      }

      if (!isAuthor && !isGroupOwner && !isGroupAdmin) {
        throw notAuthorizedError(ctx);
      }

      // Soft delete the comment
      await ctx.db.comment.update({
        where: { id: input.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      return { success: true };
    }),
};