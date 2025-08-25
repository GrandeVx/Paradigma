import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, View, RefreshControl, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { GroupItem } from './GroupItem';
import { SearchBar } from './SearchBar';
import { GroupsListSkeleton } from './GroupsListSkeleton';
import { GroupsErrorBoundary } from './GroupsErrorBoundary';
import { Group, GroupsListProps, GroupAction } from './types';
import { api } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '@/components/ui/svg-icon';
import { useAuth } from '@/context/auth-provider';

// Hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function GroupsListComponent({
  onGroupPress,
  onGroupJoin,
  onGroupLeave,
  showSearch = true,
  onlyPublic = false,
  loadingStates = {},
  currentUserId: propCurrentUserId
}: GroupsListProps) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Get current user ID (use prop if provided, otherwise from session)
  const currentUserId = propCurrentUserId || session?.user?.id;

  // Infinite query for groups list
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
  } = api.groups.listGroups.useInfiniteQuery(
    {
      limit: 20,
      search: debouncedSearch.length > 0 ? debouncedSearch : undefined,
      onlyPublic,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchOnWindowFocus: false,
    }
  );

  // Flatten the pages into a single array of groups
  const groups = useMemo(() => {
    return data?.pages.flatMap((page) => page.groups) ?? [];
  }, [data]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleGroupPress = useCallback((groupId: string) => {
    if (onGroupPress) {
      onGroupPress(groupId);
    }
  }, [onGroupPress]);

  const handleGroupJoin = useCallback((groupId: string, action: GroupAction) => {
    if (onGroupJoin) {
      onGroupJoin(groupId, action);
    }
  }, [onGroupJoin]);

  const handleGroupLeave = useCallback((groupId: string, action: GroupAction) => {
    if (onGroupLeave) {
      onGroupLeave(groupId, action);
    }
  }, [onGroupLeave]);

  const renderGroup = useCallback(({ item }: { item: Group }) => (
    <GroupItem
      group={item}
      onPress={handleGroupPress}
      onJoin={handleGroupJoin}
      onLeave={handleGroupLeave}
      currentUserId={currentUserId}
      isLoading={loadingStates[item.id] || false}
    />
  ), [handleGroupPress, handleGroupJoin, handleGroupLeave, currentUserId, loadingStates]);

  const renderLoadingFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;

    return (
      <View className="py-4 items-center bg-white dark:bg-black">
        <View className="flex-row items-center">
          <View className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full mr-2 animate-pulse" />
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            Loading more communities...
          </Text>
        </View>
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmptyState = useCallback(() => {
    if (debouncedSearch.length > 0) {
      // Empty search results
      return (
        <View className="flex-1 justify-center items-center px-8 bg-white dark:bg-black">
          <View className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full items-center justify-center mb-6">
            <SvgIcon
              name="at"
              width={28}
              height={28}
              color="#6B7280"
            />
          </View>
          <Text className="text-2xl font-bold text-black dark:text-white mb-2 text-center">
            No communities found
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 text-center leading-6 max-w-sm">
            Try searching with different keywords or discover new communities to join.
          </Text>
        </View>
      );
    }

    // No groups at all
    return (
      <View className="flex-1 justify-center items-center px-8 bg-white dark:bg-black">
        <View className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full items-center justify-center mb-6">
          <SvgIcon
            name="users"
            width={32}
            height={32}
            color="#6B7280"
          />
        </View>
        <Text className="text-3xl font-bold text-black dark:text-white mb-3 text-center">
          Find communities
        </Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center leading-6 max-w-sm">
          Discover and join communities that share your interests, or create your own to connect with others.
        </Text>
      </View>
    );
  }, [debouncedSearch.length]);

  const renderErrorState = useCallback(() => (
    <View className="flex-1 justify-center items-center px-8 bg-white dark:bg-black">
      <View className="w-16 h-16 bg-red-50 dark:bg-red-950/50 rounded-full items-center justify-center mb-6">
        <SvgIcon
          name="close"
          width={28}
          height={28}
          color="#EF4444"
        />
      </View>
      <Text className="text-2xl font-bold text-black dark:text-white mb-2 text-center">
        Something went wrong
      </Text>
      <Text className="text-base text-gray-500 dark:text-gray-400 text-center leading-6 max-w-sm">
        {error?.message || 'Failed to load communities. Pull down to try again.'}
      </Text>
    </View>
  ), [error?.message]);

  const keyExtractor = useCallback((item: Group) => item.id, []);

  // Show loading skeleton on initial load
  if (isLoading && groups.length === 0) {
    return <GroupsListSkeleton />;
  }

  // Show error state
  if (isError) {
    return renderErrorState();
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {showSearch && (
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          onClear={handleSearchClear}
          placeholder="Search communities"
        />
      )}

      <FlatList
        data={groups}
        renderItem={renderGroup}
        keyExtractor={keyExtractor}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderLoadingFooter}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={['#1DA1F2']}
            tintColor="#1DA1F2"
            progressBackgroundColor="#FFFFFF"
            titleColor="#1DA1F2"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerClassName={groups.length === 0 && !isLoading ? "flex-1" : ""}
        removeClippedSubviews={true}
        maxToRenderPerBatch={8}
        windowSize={12}
        initialNumToRender={8}
        getItemLayout={undefined}
        ItemSeparatorComponent={() => null}
        bounces={true}
        overScrollMode="auto"
        scrollEventThrottle={16}
      />
    </View>
  );
}

// Wrapped component with error boundary
export function GroupsList(props: GroupsListProps) {
  return (
    <GroupsErrorBoundary>
      <GroupsListComponent {...props} />
    </GroupsErrorBoundary>
  );
}