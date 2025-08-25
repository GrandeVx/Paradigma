import React, { useState, useCallback, useMemo } from 'react';
import { View, SafeAreaView, ScrollView, Pressable, RefreshControl, ActivityIndicator, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import HeaderContainer from '@/components/layouts/_header';
import * as Haptics from 'expo-haptics';
import { SvgIcon } from '@/components/ui/svg-icon';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';

// Group interface (matching web implementation)
interface Group {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  isPublic: boolean;
  createdAt: Date;
  owner: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  };
  memberCount: number;
  postCount: number;
}

// Mobile-optimized GroupCard Component
const GroupCard: React.FC<{
  group: Group;
  currentUserId?: string;
  onPress: (groupId: string) => void;
  onJoin: (groupId: string) => void;
  isJoining?: boolean;
}> = ({ group, currentUserId, onPress, onJoin, isJoining = false }) => {
  const isOwner = currentUserId === group.owner.id;

  return (
    <Pressable
      className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
      onPress={() => onPress(group.id)}
    >
      {/* Group header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center flex-1 min-w-0">
          {/* Group avatar */}
          <View className="w-12 h-12 bg-primary-100 rounded-xl items-center justify-center mr-3">
            {group.image ? (
              <View className="w-12 h-12 rounded-xl overflow-hidden">
                {/* Image would be rendered here if supported */}
                <Text className="text-primary-700 font-bold text-lg">
                  {group.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            ) : (
              <Text className="text-primary-700 font-bold text-lg">
                {group.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          
          <View className="flex-1 min-w-0">
            <Text className="font-semibold text-gray-800 text-lg mb-1" numberOfLines={1}>
              {group.name}
            </Text>
            <Text className="text-gray-500 text-sm" numberOfLines={1}>
              by {group.owner.name || "User"}
            </Text>
          </View>
        </View>
        
        {/* Public/Private badge */}
        <View className={`px-2 py-1 rounded-full ${group.isPublic ? 'bg-green-100' : 'bg-yellow-100'}`}>
          <Text className={`text-xs font-medium ${group.isPublic ? 'text-green-700' : 'text-yellow-700'}`}>
            {group.isPublic ? '🌐 Public' : '🔒 Private'}
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text className="text-gray-600 text-sm mb-4 leading-relaxed" numberOfLines={2}>
        {group.description || "No description provided for this community."}
      </Text>
      
      {/* Stats */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="flex-row items-center mr-4">
            <Text className="text-primary-700 mr-1">👥</Text>
            <Text className="text-gray-600 text-sm font-medium">
              {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-green-600 mr-1">💬</Text>
            <Text className="text-gray-600 text-sm font-medium">
              {group.postCount} {group.postCount === 1 ? "post" : "posts"}
            </Text>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-3">
        <Button
          variant="outline"
          size="sm"
          onPress={() => onPress(group.id)}
          className="flex-1"
        >
          <Text className="text-primary-700 font-medium">View Details</Text>
        </Button>
        
        {!isOwner && (
          <Button
            variant="primary"
            size="sm"
            onPress={() => onJoin(group.id)}
            disabled={isJoining}
            className="flex-1"
          >
            {isJoining ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-medium ml-2">Joining...</Text>
              </View>
            ) : (
              <Text className="text-white font-medium">Join Group</Text>
            )}
          </Button>
        )}
        
        {isOwner && (
          <Button variant="outline" size="sm" onPress={() => onPress(group.id)} className="flex-1">
            <Text className="text-primary-700 font-medium">Manage</Text>
          </Button>
        )}
      </View>
    </Pressable>
  );
};

export default function GroupsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyPublic, setShowOnlyPublic] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  // Get current user
  const { data: userInfo } = api.user.getUserInfo.useQuery();

  // Fetch groups with infinite scroll
  const {
    data: groupsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = api.groups.listGroups.useInfiniteQuery(
    {
      limit: 10,
      search: searchQuery || undefined,
      onlyPublic: showOnlyPublic,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    }
  );

  // Join group mutation
  const joinGroupMutation = api.groups.requestJoin.useMutation({
    onMutate: (variables) => {
      setJoiningGroupId(variables.groupId);
    },
    onSuccess: () => {
      // Show success message - for now just haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      refetch(); // Refresh the list
    },
    onError: (error) => {
      // Show error message - for now just haptic feedback  
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      console.log('Join group error:', error.message);
    },
    onSettled: () => {
      setJoiningGroupId(null);
    },
  });

  const allGroups = useMemo(() => {
    return groupsData?.pages.flatMap((page) => page.groups) ?? [];
  }, [groupsData]);

  // Refresh control
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Navigation handlers
  const handleCreateGroup = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to create group when implemented
    console.log('Navigate to create group');
  }, []);

  const handleGroupPress = useCallback((groupId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to group detail when implemented
    console.log('Navigate to group:', groupId);
  }, []);

  const handleJoinGroup = useCallback((groupId: string) => {
    if (!userInfo?.id) {
      console.log('Authentication required');
      return;
    }
    joinGroupMutation.mutate({ groupId });
  }, [userInfo?.id, joinGroupMutation]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Header actions
  const rightActions = [
    {
      icon: <SvgIcon name="add" color={"#005EFD"} size={20} />,
      onPress: handleCreateGroup
    },
  ];

  if (error) {
    return (
      <HeaderContainer variant="secondary" customTitle="Groups" rightActions={rightActions} modal>
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-6xl mb-4">⚠️</Text>
            <Text className="text-xl font-semibold text-gray-800 text-center mb-2">
              Error Loading Groups
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-6">
              {error.message || "Failed to load groups. Please try again."}
            </Text>
            <Button
              variant="primary"
              size="lg"
              onPress={() => refetch()}
            >
              <Text className="text-white font-semibold">Retry</Text>
            </Button>
          </View>
        </SafeAreaView>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer variant="secondary" customTitle="Groups" rightActions={rightActions} modal>
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Search and filters */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          {/* Search input */}
          <View className="bg-gray-100 rounded-xl px-4 py-3 mb-3">
            <TextInput
              placeholder="Search communities by name, description..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="text-gray-800 text-base"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          
          {/* Filter toggle */}
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 font-medium">Filters:</Text>
            <Pressable
              onPress={() => setShowOnlyPublic(!showOnlyPublic)}
              className={`px-4 py-2 rounded-lg ${
                showOnlyPublic ? 'bg-primary-700' : 'bg-gray-200'
              }`}
            >
              <Text className={`font-medium ${
                showOnlyPublic ? 'text-white' : 'text-gray-700'
              }`}>
                Public Only
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Groups list */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#005EFD" />
            <Text className="text-gray-500 mt-2">Loading groups...</Text>
          </View>
        ) : allGroups.length === 0 ? (
          // Empty state
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
          >
            <View className="flex-1 justify-center items-center px-6">
              <Text className="text-6xl mb-4">👥</Text>
              <Text className="text-2xl font-semibold text-gray-800 text-center mb-2">
                {searchQuery ? "No groups found" : "No groups yet"}
              </Text>
              <Text className="text-sm text-gray-500 text-center mb-6">
                {searchQuery
                  ? `We couldn't find any groups matching "${searchQuery}". Try a different search term.`
                  : "Be the first to create a community and start building connections."}
              </Text>
              <View className="flex-row gap-3">
                {searchQuery && (
                  <Button
                    variant="outline"
                    size="lg"
                    onPress={() => setSearchQuery("")}
                  >
                    <Text className="text-primary-700 font-semibold">Clear Search</Text>
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleCreateGroup}
                >
                  <Text className="text-white font-semibold">Create Group</Text>
                </Button>
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
          >
            {/* Groups list */}
            {allGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                currentUserId={userInfo?.id}
                onPress={handleGroupPress}
                onJoin={handleJoinGroup}
                isJoining={joiningGroupId === group.id}
              />
            ))}

            {/* Load more button */}
            {hasNextPage && (
              <View className="items-center mt-4">
                <Button
                  variant="outline"
                  size="lg"
                  onPress={handleLoadMore}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#005EFD" />
                      <Text className="text-primary-700 font-medium ml-2">Loading...</Text>
                    </View>
                  ) : (
                    <Text className="text-primary-700 font-semibold">Load More Groups</Text>
                  )}
                </Button>
              </View>
            )}

            {/* Stats summary */}
            {allGroups.length > 0 && (
              <View className="bg-white rounded-xl p-6 mt-6 border border-gray-200">
                <Text className="text-lg font-bold text-gray-800 mb-4">Community Overview</Text>
                <View className="flex-row justify-around">
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-primary-700 mb-1">
                      {allGroups.length}
                    </Text>
                    <Text className="text-gray-600 text-sm text-center">
                      Communities
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-green-600 mb-1">
                      {allGroups.filter(g => g.isPublic).length}
                    </Text>
                    <Text className="text-gray-600 text-sm text-center">
                      Public
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-orange-600 mb-1">
                      {allGroups.reduce((sum, g) => sum + g.memberCount, 0)}
                    </Text>
                    <Text className="text-gray-600 text-sm text-center">
                      Total Members
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </HeaderContainer>
  );
}