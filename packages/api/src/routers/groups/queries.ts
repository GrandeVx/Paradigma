import { z } from "zod";
import { publicProcedure, protectedProcedure } from "../../trpc";
import {
  getGroupSchema,
  getGroupMembersSchema,
  listGroupsSchema,
  getPendingRequestsSchema,
  getUserPendingRequestsSchema,
} from "../../schemas/groups";
import { notFoundError, notAuthorizedError } from "../../utils/errors";
import { formatCacheKeyParams } from "../../utils/cache";

export const queries = {
  // Get single group details with member count
  getGroup: publicProcedure
    .input(getGroupSchema)
    .query(async ({ ctx, input }) => {
      const groupId = input.id;
      const cacheKey = ctx.db.getKey({
        params: formatCacheKeyParams({
          prisma: 'Group',
          operation: 'getGroup',
          groupId
        })
      });

      const group = await ctx.db.group.findUnique({
        where: { id: input.id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
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
        cache: {
          ttl: 300,
          key: cacheKey
        }
      });

      if (!group) {
        throw notFoundError(ctx, 'group' as any);
      }

      // Check if user can view private group
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

      return {
        ...group,
        memberCount: group._count.members,
        postCount: group._count.posts,
      };
    }),

  // List all groups (public + user's private groups)
  listGroups: publicProcedure
    .input(listGroupsSchema)
    .query(async ({ ctx, input }) => {
      const where: any = {};

      // Handle search filter
      const searchFilter = input.search ? {
        OR: [
          { name: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
        ],
      } : {};

      // Handle visibility filter
      let visibilityFilter: any;
      if (ctx.session?.user && !input.onlyPublic) {
        // Authenticated user not requesting public only - show all accessible groups
        visibilityFilter = {
          OR: [
            { isPublic: true },
            { ownerId: ctx.session.user.id },
            {
              members: {
                some: {
                  userId: ctx.session.user.id,
                  isActive: true,
                },
              },
            },
          ],
        };
      } else {
        // Public only or unauthenticated user
        visibilityFilter = { isPublic: true };
      }

      // Combine filters
      if (input.search) {
        where.AND = [searchFilter, visibilityFilter];
      } else {
        Object.assign(where, visibilityFilter);
      }

      const groups = await ctx.db.group.findMany({
        where,
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
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

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (groups.length > input.limit) {
        const nextItem = groups.pop();
        nextCursor = nextItem!.id;
      }

      return {
        groups: groups.map(group => ({
          ...group,
          memberCount: group._count.members,
          postCount: group._count.posts,
        })),
        nextCursor,
      };
    }),

  // Get group members list
  getGroupMembers: publicProcedure
    .input(getGroupMembersSchema)
    .query(async ({ ctx, input }) => {
      // Check if group exists and user has permission
      const group = await ctx.db.group.findUnique({
        where: { id: input.groupId },
        select: { id: true, isPublic: true, ownerId: true },
      });

      if (!group) {
        throw notFoundError(ctx, 'group' as any);
      }

      // Check if user can view members
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

      const members = await ctx.db.groupMember.findMany({
        where: {
          groupId: input.groupId,
          isActive: true,
        },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
        orderBy: { joinedAt: 'asc' },
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
      if (members.length > input.limit) {
        const nextItem = members.pop();
        nextCursor = nextItem!.id;
      }

      return {
        members,
        nextCursor,
      };
    }),

  // List pending requests for group (creators/admins only)
  getPendingRequests: protectedProcedure
    .input(getPendingRequestsSchema)
    .query(async ({ ctx, input }) => {
      // Check if user is group owner/admin
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
              groupId: group.id,
            },
          },
          select: { role: true },
        });

        isAdmin = membership?.role === 'admin';
      }

      if (!isOwner && !isAdmin) {
        throw notAuthorizedError(ctx);
      }

      const requests = await ctx.db.groupJoinRequest.findMany({
        where: {
          groupId: input.groupId,
          status: 'PENDING',
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
      if (requests.length > input.limit) {
        const nextItem = requests.pop();
        nextCursor = nextItem!.id;
      }

      return {
        requests,
        nextCursor,
      };
    }),

  // Get user's pending requests
  getUserPendingRequests: protectedProcedure
    .input(getUserPendingRequestsSchema)
    .query(async ({ ctx, input }) => {
      const requests = await ctx.db.groupJoinRequest.findMany({
        where: {
          userId: ctx.session.user.id,
          status: 'PENDING',
        },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
        orderBy: { createdAt: 'desc' },
        include: {
          group: {
            select: {
              id: true,
              name: true,
              description: true,
              image: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (requests.length > input.limit) {
        const nextItem = requests.pop();
        nextCursor = nextItem!.id;
      }

      return {
        requests,
        nextCursor,
      };
    }),
};