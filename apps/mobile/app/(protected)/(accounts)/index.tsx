import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import HeaderContainer from '@/components/layouts/_header';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { api, type RouterOutputs } from '@/lib/api';

// Post type from tRPC API
type Post = RouterOutputs['posts']['getFeedPosts']['posts'][0];

// Post Card Component
const PostCard: React.FC<{
  post: Post;
  currentUserId?: string;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
}> = React.memo(({ post, currentUserId, onPress, onLike, onComment }) => {
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      if (hours < 1) return 'now';
      return `${hours}h`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d`;
    }
  };

  const authorName = post.author.name || 'User';
  const initials = getInitials(post.author.name, post.author.email);
  const formattedTime = formatDate(new Date(post.createdAt));
  const isLiked = post.isLiked || false;
  const likeCount = post.likeCount || 0;
  const commentCount = post.commentCount || 0;

  return (
    <Pressable
      className="w-full bg-white rounded-2xl mb-4 p-4"
      style={{ 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 3,
        elevation: 2 
      }}
      onPress={onPress}
    >
      {/* Header with author info */}
      <View className="flex-row items-start mb-3">
        <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
          <Text className="text-gray-600 font-medium text-sm">{initials}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="font-semibold text-base text-gray-900" style={{ fontFamily: 'ApfelGrotezkMittel' }}>
              {authorName}
            </Text>
            <Text className="text-gray-500 text-sm ml-2">•</Text>
            <Text className="text-gray-500 text-sm ml-2">{formattedTime}</Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Text className="text-sm text-gray-600">in </Text>
            <View className="bg-blue-100 px-2 py-1 rounded-full">
              <Text className="text-blue-700 text-xs font-medium">{post.group.name}</Text>
            </View>
            {!post.group.isPublic && (
              <View className="bg-gray-100 px-2 py-1 rounded-full ml-2">
                <Text className="text-gray-600 text-xs">Private</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="mb-3">
        <Text className="text-gray-900 text-base leading-relaxed">
          {post.content}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          <Pressable
            className={`flex-row items-center px-3 py-2 rounded-full ${
              isLiked ? 'bg-red-50' : 'bg-gray-50'
            }`}
            onPress={onLike}
          >
            <FontAwesome5 
              name="heart" 
              size={14} 
              color={isLiked ? '#ef4444' : '#6b7280'}
              solid={isLiked}
            />
            <Text className={`ml-2 text-sm font-medium ${
              isLiked ? 'text-red-500' : 'text-gray-600'
            }`}>
              {likeCount}
            </Text>
          </Pressable>
          
          <Pressable
            className="flex-row items-center px-3 py-2 rounded-full bg-gray-50 ml-3"
            onPress={onComment}
          >
            <FontAwesome5 name="comment" size={14} color="#6b7280" />
            <Text className="ml-2 text-sm font-medium text-gray-600">
              {commentCount}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
});

PostCard.displayName = 'PostCard';

export default function PostsFeedScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  // Get current user info
  const { data: userInfo } = api.user.getUserInfo.useQuery();

  // Get user's groups for context
  const { data: groupsData } = api.groups.listGroups.useQuery({
    limit: 50,
    onlyPublic: false,
  });

  // Get posts feed with infinite query
  const {
    data: postsData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = api.posts.getFeedPosts.useInfiniteQuery(
    {
      limit: 10,
      onlyFollowedGroups: false,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      keepPreviousData: true,
    }
  );

  const allPosts = postsData?.pages.flatMap((page) => page.posts) ?? [];
  const totalGroups = groupsData?.groups?.length ?? 0;

  // Handle post actions
  const handlePostPress = useCallback((postId: string) => {
    // Navigate to post details - prepare for future implementation
    console.log('Navigate to post:', postId);
  }, []);

  const handleLike = useCallback((postId: string) => {
    // TODO: Implement like functionality
    console.log('Like post:', postId);
  }, []);

  const handleComment = useCallback((postId: string) => {
    // TODO: Implement comment functionality
    console.log('Comment on post:', postId);
  }, []);

  const handleCreatePost = useCallback(() => {
    // Navigate to create post screen
    router.push("/(protected)/(creation-flow)/name");
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const rightActions = [
    {
      icon: <FontAwesome5 name="plus" size={16} color="black" />,
      onPress: handleCreatePost,
    },
  ];

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <View className="px-4 py-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} className="bg-white rounded-2xl mb-4 p-4">
          <View className="flex-row items-start mb-3">
            <View className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
            <View className="flex-1">
              <View className="h-4 bg-gray-200 rounded mb-2 w-24" />
              <View className="h-3 bg-gray-200 rounded w-16" />
            </View>
          </View>
          <View className="mb-3">
            <View className="h-4 bg-gray-200 rounded mb-2 w-full" />
            <View className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
            <View className="h-4 bg-gray-200 rounded w-1/2" />
          </View>
        </View>
      ))}
    </View>
  );

  // Empty state component
  const EmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <FontAwesome5 name="comments" size={64} color="#d1d5db" />
      <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2" style={{ fontFamily: 'ApfelGrotezkMittel' }}>
        No Posts Yet
      </Text>
      <Text className="text-gray-500 text-center mb-6 leading-relaxed">
        {totalGroups === 0
          ? "Join some groups to see posts in your feed"
          : "No recent posts from your communities. Be the first to post!"}
      </Text>
      <Pressable
        className="bg-blue-600 px-6 py-3 rounded-full"
        onPress={handleCreatePost}
      >
        <View className="flex-row items-center">
          <FontAwesome5 name="plus" size={16} color="white" />
          <Text className="text-white font-semibold ml-2">Create Post</Text>
        </View>
      </Pressable>
    </View>
  );

  // Error state component
  const ErrorState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <FontAwesome5 name="exclamation-triangle" size={64} color="#f59e0b" />
      <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2" style={{ fontFamily: 'ApfelGrotezkMittel' }}>
        Something went wrong
      </Text>
      <Text className="text-gray-500 text-center mb-6">
        Unable to load posts. Please try again.
      </Text>
      <Pressable
        className="bg-blue-600 px-6 py-3 rounded-full"
        onPress={handleRefresh}
      >
        <Text className="text-white font-semibold">Try Again</Text>
      </Pressable>
    </View>
  );

  return (
    <HeaderContainer variant="secondary" rightActions={rightActions} hideBackButton={true}>
      <View className="flex-1 bg-gray-50">
        <StatusBar style="dark" />

        {/* Header Stats */}
        <View className="bg-white border-b border-gray-100 px-4 py-4">
          <Text className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'ApfelGrotezkMittel' }}>
            Posts
          </Text>
          <View className="flex-row items-center">
            <Text className="text-gray-600 text-sm">
              {totalGroups} groups • {allPosts.length} posts
            </Text>
          </View>
        </View>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorState />
        ) : allPosts.length === 0 ? (
          <EmptyState />
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
          >
            <View className="px-4">
              {allPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={userInfo?.id}
                  onPress={() => handlePostPress(post.id)}
                  onLike={() => handleLike(post.id)}
                  onComment={() => handleComment(post.id)}
                />
              ))}
              
              {/* Load more button */}
              {hasNextPage && (
                <View className="items-center mt-4 mb-8">
                  <Pressable
                    className="bg-white border border-gray-200 px-6 py-3 rounded-full"
                    onPress={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="#6b7280" />
                        <Text className="text-gray-600 ml-2">Loading...</Text>
                      </View>
                    ) : (
                      <Text className="text-gray-600 font-medium">Load More</Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </HeaderContainer>
  );
}