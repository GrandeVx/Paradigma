// Groups API Types based on the tRPC schema
export interface Group {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  image: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  ownerId: string;
  owner: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  memberCount: number;
  postCount: number;
  // User's relationship to this group
  userMembership?: {
    role: 'member' | 'moderator' | 'admin';
    joinedAt: Date | string;
  } | null;
  userJoinRequest?: {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: Date | string;
  } | null;
}

export interface GroupsListResponse {
  groups: Group[];
  nextCursor: string | null;
}

export interface ListGroupsInput {
  limit: number;
  cursor?: string;
  search?: string;
  onlyPublic?: boolean;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: Date | string;
  isActive: boolean;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface GroupMembersResponse {
  members: GroupMember[];
  nextCursor: string | null;
}

export interface GroupJoinRequest {
  id: string;
  userId: string;
  groupId: string;
  message: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date | string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  group?: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
  };
}

export interface PendingRequestsResponse {
  requests: GroupJoinRequest[];
  nextCursor: string | null;
}

// Component Props Types
export interface GroupItemProps {
  group: Group;
  onPress?: (groupId: string) => void;
  onJoin?: (groupId: string, action: GroupAction) => void;
  onLeave?: (groupId: string, action: GroupAction) => void;
  currentUserId?: string;
  isLoading?: boolean;
}

export interface GroupsListProps {
  onGroupPress?: (groupId: string) => void;
  onGroupJoin?: (groupId: string, action: GroupAction) => void;
  onGroupLeave?: (groupId: string, action: GroupAction) => void;
  showSearch?: boolean;
  onlyPublic?: boolean;
  loadingStates?: Record<string, boolean>;
  currentUserId?: string;
}

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

// Error Types
export interface GroupsError {
  message: string;
  code?: string;
  statusCode?: number;
}

// Loading States
export type GroupsLoadingState = 'idle' | 'loading' | 'refetching' | 'loadingMore' | 'error';

// Mutation Status
export interface MutationStatus {
  isLoading: boolean;
  isError: boolean;
  error: GroupsError | null;
}

// Group Membership States
export type GroupMembershipState = 
  | 'not-member'      // User is not a member and has no pending request
  | 'member'          // User is an active member
  | 'owner'           // User owns the group
  | 'requested'       // User has pending join request for private group
  | 'can-join';       // User can join (public group, not a member)

export interface GroupMembershipInfo {
  state: GroupMembershipState;
  role?: 'member' | 'moderator' | 'admin';
  joinRequestId?: string;
  canLeave: boolean;
  canJoin: boolean;
}

// Group Action Types for mutations
export type GroupAction = 'join' | 'leave' | 'request' | 'cancel-request';