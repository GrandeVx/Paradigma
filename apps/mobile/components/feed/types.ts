// Feed API Types based on the expected tRPC schema
export interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  group: {
    id: string;
    name: string;
  } | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

export interface FeedResponse {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface GetFeedPostsInput {
  limit: number;
  cursor?: string;
}

export interface LikePostInput {
  postId: string;
}

export interface LikePostResponse {
  success: boolean;
  likeCount: number;
  isLiked: boolean;
}

// Component Props Types
export interface PostItemProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export interface FeedProps {
  onLikePost?: (postId: string) => void;
  onCommentPost?: (postId: string) => void;
  feedType?: 'global' | 'group';
  groupId?: string;
}

// Error Types
export interface FeedError {
  message: string;
  code?: string;
  statusCode?: number;
}

// Loading States
export type FeedLoadingState = 'idle' | 'loading' | 'refetching' | 'loadingMore' | 'error';

// Mutation Status
export interface MutationStatus {
  isLoading: boolean;
  isError: boolean;
  error: FeedError | null;
}