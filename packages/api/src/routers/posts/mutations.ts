import { protectedProcedure } from "../../trpc";
import {
  createPostSchema,
  updatePostSchema,
  deletePostSchema,
} from "../../schemas/posts";
import { notFoundError, notAuthorizedError } from "../../utils/errors";

export const mutations = {
  // Create post in group (members only)
  createPost: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if group exists
      const group = await ctx.db.group.findUnique({
        where: { id: input.groupId },
        select: { id: true, isPublic: true, ownerId: true },
      });

      if (!group) {
        throw notFoundError(ctx, 'group' as any);
      }

      // Check if user is group member or owner
      const isOwner = group.ownerId === ctx.session.user.id;
      let isMember = false;

      if (!isOwner) {
        const membership = await ctx.db.groupMember.findUnique({
          where: {
            userId_groupId: {
              userId: ctx.session.user.id,
              groupId: input.groupId,
            },
          },
          select: { isActive: true },
        });

        isMember = membership?.isActive || false;
      }

      if (!isOwner && !isMember) {
        throw notAuthorizedError(ctx);
      }

      const post = await ctx.db.post.create({
        data: {
          content: input.content,
          isPublic: input.isPublic,
          authorId: ctx.session.user.id,
          groupId: input.groupId,
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

      return {
        ...post,
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        isLiked: false,
      };
    }),

  // Update post (author only)
  updatePost: protectedProcedure
    .input(updatePostSchema)
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.id,
          isDeleted: false,
        },
        select: {
          id: true,
          authorId: true,
          groupId: true,
        },
      });

      if (!post) {
        throw notFoundError(ctx, 'post' as any);
      }

      if (post.authorId !== ctx.session.user.id) {
        throw notAuthorizedError(ctx);
      }

      const updatedPost = await ctx.db.post.update({
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

      // Check if user liked the post
      const like = await ctx.db.like.findUnique({
        where: {
          userId_postId: {
            userId: ctx.session.user.id,
            postId: updatedPost.id,
          },
        },
      });

      return {
        ...updatedPost,
        likeCount: updatedPost._count.likes,
        commentCount: updatedPost._count.comments,
        isLiked: !!like,
      };
    }),

  // Delete post (author or group admins)
  deletePost: protectedProcedure
    .input(deletePostSchema)
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.id,
          isDeleted: false,
        },
        select: {
          id: true,
          authorId: true,
          groupId: true,
          group: {
            select: {
              ownerId: true,
            },
          },
        },
      });

      if (!post) {
        throw notFoundError(ctx, 'post' as any);
      }

      const isAuthor = post.authorId === ctx.session.user.id;
      const isGroupOwner = post.group.ownerId === ctx.session.user.id;
      
      // Check if user is group admin
      let isGroupAdmin = false;
      if (!isAuthor && !isGroupOwner) {
        const membership = await ctx.db.groupMember.findUnique({
          where: {
            userId_groupId: {
              userId: ctx.session.user.id,
              groupId: post.groupId,
            },
          },
          select: { role: true },
        });

        isGroupAdmin = membership?.role === 'admin';
      }

      if (!isAuthor && !isGroupOwner && !isGroupAdmin) {
        throw notAuthorizedError(ctx);
      }

      // Soft delete the post
      await ctx.db.post.update({
        where: { id: input.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      return { success: true };
    }),
};