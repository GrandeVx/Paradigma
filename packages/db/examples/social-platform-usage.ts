/**
 * Social Platform Database Usage Examples
 * 
 * This file demonstrates how to use the new social platform features
 * with the Paradigma database schema.
 */

import { db } from '../index';
import type { 
  Group, 
  Post, 
  Like, 
  Comment, 
  GroupMember, 
  GroupJoinRequest,
  GroupRequestStatus 
} from '@prisma/client';

// Example 1: Create a new group
export async function createGroup(
  ownerId: string,
  name: string,
  description?: string,
  isPublic: boolean = true
) {
  return await db.group.create({
    data: {
      name,
      description,
      isPublic,
      ownerId,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          username: true,
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
}

// Example 2: Request to join a private group
export async function requestGroupAccess(userId: string, groupId: string, message?: string) {
  // First check if group exists and is not public
  const group = await db.group.findUnique({
    where: { id: groupId },
    select: { isPublic: true },
  });

  if (!group) {
    throw new Error('Group not found');
  }

  if (group.isPublic) {
    // For public groups, directly add member
    return await db.groupMember.create({
      data: {
        userId,
        groupId,
        role: 'member',
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, image: true },
        },
        group: {
          select: { id: true, name: true },
        },
      },
    });
  }

  // For private groups, create join request
  return await db.groupJoinRequest.create({
    data: {
      userId,
      groupId,
      message,
      status: 'PENDING',
    },
    include: {
      user: {
        select: { id: true, name: true, username: true, image: true },
      },
      group: {
        select: { id: true, name: true },
      },
    },
  });
}

// Example 3: Approve/reject group join request
export async function handleJoinRequest(
  requestId: string,
  ownerId: string,
  action: 'approve' | 'reject'
) {
  // First verify the request exists and user is group owner
  const request = await db.groupJoinRequest.findUnique({
    where: { id: requestId },
    include: {
      group: {
        select: { ownerId: true },
      },
    },
  });

  if (!request) {
    throw new Error('Join request not found');
  }

  if (request.group.ownerId !== ownerId) {
    throw new Error('Only group owner can approve requests');
  }

  if (action === 'approve') {
    // Use transaction to approve request and add member
    return await db.$transaction(async (tx) => {
      // Update request status
      await tx.groupJoinRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      });

      // Add user as group member
      return await tx.groupMember.create({
        data: {
          userId: request.userId,
          groupId: request.groupId,
          role: 'member',
        },
        include: {
          user: {
            select: { id: true, name: true, username: true, image: true },
          },
        },
      });
    });
  } else {
    // Reject request
    return await db.groupJoinRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });
  }
}

// Example 4: Create a post in a group (with membership verification)
export async function createPost(
  authorId: string,
  groupId: string,
  content: string
) {
  // Verify user is member of the group
  const membership = await db.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: authorId,
        groupId: groupId,
      },
    },
  });

  if (!membership || !membership.isActive) {
    throw new Error('User is not an active member of this group');
  }

  return await db.post.create({
    data: {
      content,
      authorId,
      groupId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
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
          comments: true,
        },
      },
    },
  });
}

// Example 5: Get posts feed with pagination
export async function getPostsFeed(
  userId?: string,
  cursor?: string,
  limit: number = 20,
  groupId?: string
) {
  const where = {
    isDeleted: false,
    ...(groupId && { groupId }),
  };

  const posts = await db.post.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
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
          comments: true,
        },
      },
      // Include user's like status if userId provided
      ...(userId && {
        likes: {
          where: { userId },
          select: { id: true },
        },
      }),
    },
  });

  let nextCursor: string | undefined = undefined;
  if (posts.length > limit) {
    const nextItem = posts.pop();
    nextCursor = nextItem!.id;
  }

  return {
    posts: posts.map(post => ({
      ...post,
      isLikedByUser: userId ? post.likes.length > 0 : false,
      likes: undefined, // Remove the likes array from response
    })),
    nextCursor,
    hasNextPage: !!nextCursor,
  };
}

// Example 6: Like/Unlike a post
export async function togglePostLike(userId: string, postId: string) {
  const existingLike = await db.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (existingLike) {
    // Unlike
    await db.like.delete({
      where: { id: existingLike.id },
    });
    return { action: 'unliked' };
  } else {
    // Like
    await db.like.create({
      data: {
        userId,
        postId,
      },
    });
    return { action: 'liked' };
  }
}

// Example 7: Add comment to post
export async function addComment(
  authorId: string,
  postId: string,
  content: string,
  parentId?: string
) {
  return await db.comment.create({
    data: {
      content,
      authorId,
      postId,
      parentId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });
}

// Example 8: Get comments for a post with threading
export async function getPostComments(
  postId: string,
  cursor?: string,
  limit: number = 20
) {
  return await db.comment.findMany({
    where: {
      postId,
      parentId: null, // Only top-level comments
      isDeleted: false,
    },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      replies: {
        take: 3, // Show first 3 replies
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });
}

// Example 9: Get user's groups
export async function getUserGroups(userId: string) {
  return await db.groupMember.findMany({
    where: {
      userId,
      isActive: true,
    },
    include: {
      group: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              username: true,
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
      },
    },
    orderBy: {
      joinedAt: 'desc',
    },
  });
}

// Example 10: Search groups
export async function searchGroups(
  query: string,
  isPublicOnly: boolean = true,
  limit: number = 20
) {
  return await db.group.findMany({
    where: {
      ...(isPublicOnly && { isPublic: true }),
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: limit,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          username: true,
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
    orderBy: [
      { isPublic: 'desc' }, // Public groups first
      { createdAt: 'desc' },
    ],
  });
}