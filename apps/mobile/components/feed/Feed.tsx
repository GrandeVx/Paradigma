import React from 'react';
import { FlatList, View, RefreshControl } from 'react-native';
import { Text } from '@/components/ui/text';
import { PostItem } from './PostItem';
import { FeedSkeleton } from './FeedSkeleton';
import { FeedErrorBoundary } from './FeedErrorBoundary';
import { Post, FeedProps } from './types';
import { api } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '@/components/ui/svg-icon';

function FeedComponent({ onLikePost, onCommentPost, feedType = 'global', groupId }: FeedProps) {
  const { t } = useTranslation();

  // Use different query based on feed type
  const globalFeedQuery = api.posts.getFeedPosts.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      enabled: feedType === 'global',
    }
  );

  const groupFeedQuery = api.posts.getGroupPosts.useInfiniteQuery(
    {
      groupId: groupId!,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      enabled: feedType === 'group' && !!groupId,
    }
  );

  // Select the appropriate query result
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = feedType === 'group' ? groupFeedQuery : globalFeedQuery;

  // Flatten the pages into a single array of posts
  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostItem
      post={item}
      onLike={onLikePost}
      onComment={onCommentPost}
    />
  );

  const renderLoadingFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View className="py-6 items-center bg-white dark:bg-black">
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full mr-2 animate-pulse" />
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {t('common.loading', 'Loading...')}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8 bg-white dark:bg-black">
      <View className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-4">
        <SvgIcon
          name="message-circle"
          width={24}
          height={24}
          color="#6B7280"
        />
      </View>
      <Text className="text-2xl font-bold text-black dark:text-white mb-2 text-center">
        {t('feed.emptyTitle', 'No posts yet')}
      </Text>
      <Text className="text-base text-gray-500 dark:text-gray-400 text-center leading-6 max-w-xs">
        {feedType === 'group' 
          ? 'This group doesn\'t have any posts yet. Be the first to post!'
          : t('feed.emptySubtitle', 'Join some groups to see posts in your feed!')
        }
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 justify-center items-center px-8 bg-white dark:bg-black">
      <View className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full items-center justify-center mb-4">
        <SvgIcon
          name="close"
          width={24}
          height={24}
          color="#EF4444"
        />
      </View>
      <Text className="text-xl font-bold text-red-500 mb-2 text-center">
        {t('common.error', 'Something went wrong')}
      </Text>
      <Text className="text-base text-gray-500 dark:text-gray-400 text-center leading-6 max-w-xs">
        {error?.message || t('feed.errorMessage', 'Failed to load posts. Pull to retry.')}
      </Text>
    </View>
  );

  if (isLoading && posts.length === 0) {
    return <FeedSkeleton />;
  }

  if (isError) {
    return renderErrorState();
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderLoadingFooter}
      ListEmptyComponent={!isLoading ? renderEmptyState : null}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          colors={['#1DA1F2']}
          tintColor="#1DA1F2"
          progressBackgroundColor="#FFFFFF"
        />
      }
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-white dark:bg-black"
      contentContainerClassName={posts.length === 0 && !isLoading ? "flex-1" : ""}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={10}
      initialNumToRender={5}
      ItemSeparatorComponent={() => null}
      bounces={true}
      overScrollMode="auto"
    />
  );
}

// Wrapped component with error boundary
export function Feed(props: FeedProps) {
  return (
    <FeedErrorBoundary>
      <FeedComponent {...props} />
    </FeedErrorBoundary>
  );
}