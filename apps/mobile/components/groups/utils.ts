import { Group, GroupMembershipState, GroupMembershipInfo } from './types';

/**
 * Determines the user's membership state and capabilities for a group
 */
export function getGroupMembershipInfo(group: Group, currentUserId?: string): GroupMembershipInfo {
  // If no user is logged in
  if (!currentUserId) {
    return {
      state: 'not-member',
      canJoin: group.isPublic,
      canLeave: false,
    };
  }

  // If user is the owner
  if (group.ownerId === currentUserId) {
    return {
      state: 'owner',
      role: 'admin', // Owners are automatically admins
      canJoin: false,
      canLeave: false, // Owners cannot leave their own group
    };
  }

  // If user is a member
  if (group.userMembership) {
    return {
      state: 'member',
      role: group.userMembership.role,
      canJoin: false,
      canLeave: true,
    };
  }

  // If user has a pending join request
  if (group.userJoinRequest && group.userJoinRequest.status === 'PENDING') {
    return {
      state: 'requested',
      joinRequestId: group.userJoinRequest.id,
      canJoin: false,
      canLeave: false,
    };
  }

  // If user can join (public group or private group without restrictions)
  if (group.isPublic) {
    return {
      state: 'can-join',
      canJoin: true,
      canLeave: false,
    };
  }

  // Private group that user is not a member of and has no pending request
  return {
    state: 'not-member',
    canJoin: true, // Can request to join private groups
    canLeave: false,
  };
}

/**
 * Gets the appropriate button text and style for a group action
 */
export function getGroupActionButtonInfo(membershipInfo: GroupMembershipInfo, group: Group) {
  const { state, canJoin, canLeave } = membershipInfo;

  switch (state) {
    case 'owner':
      return {
        text: 'Owner',
        variant: 'owner' as const,
        disabled: true,
        action: null,
      };

    case 'member':
      return {
        text: 'Following',
        variant: 'secondary' as const,
        disabled: false,
        action: 'leave' as const,
      };

    case 'requested':
      return {
        text: 'Requested',
        variant: 'requested' as const,
        disabled: false,
        action: 'cancel-request' as const,
      };

    case 'can-join':
      return {
        text: 'Follow',
        variant: 'primary' as const,
        disabled: false,
        action: 'join' as const,
      };

    case 'not-member':
      if (group.isPublic) {
        return {
          text: 'Follow',
          variant: 'primary' as const,
          disabled: false,
          action: 'join' as const,
        };
      } else {
        return {
          text: 'Request',
          variant: 'primary' as const,
          disabled: false,
          action: 'request' as const,
        };
      }

    default:
      return {
        text: 'Follow',
        variant: 'primary' as const,
        disabled: false,
        action: 'join' as const,
      };
  }
}