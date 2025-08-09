import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import {
  createGroupSchema,
  updateGroupSchema,
  deleteGroupSchema,
  removeMemberSchema,
  updateMemberRoleSchema,
  requestJoinSchema,
  respondToRequestSchema,
  cancelRequestSchema,
} from "../../schemas/groups";
import { notFoundError, notAuthorizedError, badRequestError } from "../../utils/errors";

export const mutations = {
  // Create group
  createGroup: protectedProcedure
    .input(createGroupSchema)
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.db.group.create({
        data: {
          ...input,
          ownerId: ctx.session.user.id,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // Automatically add creator as admin member
      await ctx.db.groupMember.create({
        data: {
          userId: ctx.session.user.id,
          groupId: group.id,
          role: 'admin',
        },
      });

      return group;
    }),

  // Update group (creator only)
  updateGroup: protectedProcedure
    .input(updateGroupSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const group = await ctx.db.group.findUnique({
        where: { id },
        select: { id: true, ownerId: true },
      });

      if (!group) {
        throw notFoundError(ctx, 'group' as any);
      }

      if (group.ownerId !== ctx.session.user.id) {
        throw notAuthorizedError(ctx);
      }

      return await ctx.db.group.update({
        where: { id },
        data: updateData,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              members: true,
              posts: true,
            },
          },
        },
      });
    }),

  // Delete group (creator only)
  deleteGroup: protectedProcedure
    .input(deleteGroupSchema)
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.db.group.findUnique({
        where: { id: input.id },
        select: { id: true, ownerId: true },
      });

      if (!group) {
        throw notFoundError(ctx, 'group' as any);
      }

      if (group.ownerId !== ctx.session.user.id) {
        throw notAuthorizedError(ctx);
      }

      await ctx.db.group.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Remove member (admins/moderators only)
  removeMember: protectedProcedure
    .input(removeMemberSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if group exists and user has permission
      const group = await ctx.db.group.findUnique({
        where: { id: input.groupId },
        select: { id: true, ownerId: true },
      });

      if (!group) {
        throw notFoundError(ctx, 'group' as any);
      }

      const isOwner = group.ownerId === ctx.session.user.id;

      // Get current user's membership to check permissions
      let currentUserRole = null;
      if (!isOwner) {
        const membership = await ctx.db.groupMember.findUnique({
          where: {
            userId_groupId: {
              userId: ctx.session.user.id,
              groupId: input.groupId,
            },
          },
          select: { role: true },
        });

        currentUserRole = membership?.role;
      }

      // Check if user has permission to remove members
      const canRemove = isOwner || currentUserRole === 'admin' || currentUserRole === 'moderator';
      if (!canRemove) {
        throw notAuthorizedError(ctx);
      }

      // Get target member's role
      const targetMember = await ctx.db.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: input.userId,
            groupId: input.groupId,
          },
        },
        select: { role: true },
      });

      if (!targetMember) {
        throw notFoundError(ctx, 'member' as any);
      }

      // Can't remove owner
      if (group.ownerId === input.userId) {
        throw badRequestError(ctx);
      }

      // Only admins and owner can remove other admins
      if (targetMember.role === 'admin' && currentUserRole !== 'admin' && !isOwner) {
        throw notAuthorizedError(ctx);
      }

      await ctx.db.groupMember.delete({
        where: {
          userId_groupId: {
            userId: input.userId,
            groupId: input.groupId,
          },
        },
      });

      return { success: true };
    }),

  // Update member role (admins only)
  updateMemberRole: protectedProcedure
    .input(updateMemberRoleSchema)
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.db.group.findUnique({
        where: { id: input.groupId },
        select: { id: true, ownerId: true },
      });

      if (!group) {
        throw notFoundError(ctx, 'group' as any);
      }

      const isOwner = group.ownerId === ctx.session.user.id;
      let isAdmin = false;

      if (!isOwner) {
        const membership = await ctx.db.groupMember.findUnique({
          where: {
            userId_groupId: {
              userId: ctx.session.user.id,
              groupId: input.groupId,
            },
          },
          select: { role: true },
        });

        isAdmin = membership?.role === 'admin';
      }

      if (!isOwner && !isAdmin) {
        throw notAuthorizedError(ctx);
      }

      // Can't change owner role
      if (group.ownerId === input.userId) {
        throw badRequestError(ctx);
      }

      return await ctx.db.groupMember.update({
        where: {
          userId_groupId: {
            userId: input.userId,
            groupId: input.groupId,
          },
        },
        data: {
          role: input.role,
        },
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
    }),

  // Request to join private group
  requestJoin: protectedProcedure
    .input(requestJoinSchema)
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.db.group.findUnique({
        where: { id: input.groupId },
        select: { id: true, isPublic: true, ownerId: true },
      });

      if (!group) {
        throw notFoundError(ctx, 'group' as any);
      }

      // Can't join if already a member
      const existingMember = await ctx.db.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: ctx.session.user.id,
            groupId: input.groupId,
          },
        },
      });

      if (existingMember) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Already a member of this group',
        });
      }

      // If public group, join directly
      if (group.isPublic) {
        const member = await ctx.db.groupMember.create({
          data: {
            userId: ctx.session.user.id,
            groupId: input.groupId,
            role: 'member',
          },
          include: {
            user: {
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
              },
            },
          },
        });

        return { member, joined: true };
      }

      // Check for existing pending request
      const existingRequest = await ctx.db.groupJoinRequest.findUnique({
        where: {
          userId_groupId: {
            userId: ctx.session.user.id,
            groupId: input.groupId,
          },
        },
      });

      if (existingRequest && existingRequest.status === 'PENDING') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Join request already pending',
        });
      }

      // Create or update join request
      const request = await ctx.db.groupJoinRequest.upsert({
        where: {
          userId_groupId: {
            userId: ctx.session.user.id,
            groupId: input.groupId,
          },
        },
        update: {
          message: input.message,
          status: 'PENDING',
        },
        create: {
          userId: ctx.session.user.id,
          groupId: input.groupId,
          message: input.message,
          status: 'PENDING',
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { request, joined: false };
    }),

  // Approve/reject join request
  respondToRequest: protectedProcedure
    .input(respondToRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.groupJoinRequest.findUnique({
        where: { id: input.requestId },
        include: {
          group: {
            select: { id: true, ownerId: true },
          },
        },
      });

      if (!request) {
        throw notFoundError(ctx, 'request' as any);
      }

      const isOwner = request.group.ownerId === ctx.session.user.id;
      let isAdmin = false;

      if (!isOwner) {
        const membership = await ctx.db.groupMember.findUnique({
          where: {
            userId_groupId: {
              userId: ctx.session.user.id,
              groupId: request.groupId,
            },
          },
          select: { role: true },
        });

        isAdmin = membership?.role === 'admin';
      }

      if (!isOwner && !isAdmin) {
        throw notAuthorizedError(ctx);
      }

      if (request.status !== 'PENDING') {
        throw badRequestError(ctx);
      }

      // Update request status
      const updatedRequest = await ctx.db.groupJoinRequest.update({
        where: { id: input.requestId },
        data: {
          status: input.action === 'approve' ? 'APPROVED' : 'REJECTED',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // If approved, add user to group
      if (input.action === 'approve') {
        await ctx.db.groupMember.create({
          data: {
            userId: request.userId,
            groupId: request.groupId,
            role: 'member',
          },
        });
      }

      return updatedRequest;
    }),

  // Cancel own request
  cancelRequest: protectedProcedure
    .input(cancelRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.groupJoinRequest.findUnique({
        where: { id: input.requestId },
        select: { id: true, userId: true, status: true },
      });

      if (!request) {
        throw notFoundError(ctx, 'request' as any);
      }

      if (request.userId !== ctx.session.user.id) {
        throw notAuthorizedError(ctx);
      }

      if (request.status !== 'PENDING') {
        throw badRequestError(ctx);
      }

      await ctx.db.groupJoinRequest.delete({
        where: { id: input.requestId },
      });

      return { success: true };
    }),
};