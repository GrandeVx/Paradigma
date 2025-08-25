import React from 'react';
import { View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import { GroupMembersResponse, GroupMember } from './types';
import { InfiniteData } from '@tanstack/react-query';

interface MembersListProps {
  membersData: InfiniteData<GroupMembersResponse> | undefined;
  isLoading: boolean;
  onLoadMore: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  currentUserId?: string;
}

interface MemberItemProps {
  member: GroupMember;
  isCurrentUser: boolean;
}

function MemberItem({ member, isCurrentUser }: MemberItemProps) {
  const getDisplayName = (user: GroupMember['user']) => {
    return user.name || user.email.split('@')[0];
  };

  const getUsername = (user: GroupMember['user']) => {
    return `@${user.email.split('@')[0]}`;
  };

  const getRoleBadge = (role: GroupMember['role']) => {
    switch (role) {
      case 'admin':
        return (
          <View className="bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded-full">
            <Text className="text-xs font-semibold text-red-700 dark:text-red-300">
              Admin
            </Text>
          </View>
        );
      case 'moderator':
        return (
          <View className="bg-orange-100 dark:bg-orange-900/50 px-2 py-1 rounded-full">
            <Text className="text-xs font-semibold text-orange-700 dark:text-orange-300">
              Moderator
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const formatJoinDate = (date: Date | string) => {
    try {
      const parsedDate = typeof date === 'string' ? new Date(date) : date;
      return parsedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <TouchableOpacity
      className="bg-white dark:bg-black px-4 py-3 active:bg-gray-50 dark:active:bg-gray-950 border-b border-gray-100 dark:border-gray-900"
      activeOpacity={0.8}
    >
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className="mr-3">
          {member.user.image ? (
            <Image
              source={{ uri: member.user.image }}
              className="w-12 h-12 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center">
              <Text className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                {getDisplayName(member.user).charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* User Info */}
        <View className="flex-1 min-w-0">
          <View className="flex-row items-center mb-1">
            <Text 
              className="text-base font-bold text-black dark:text-white mr-2 flex-shrink"
              numberOfLines={1}
            >
              {getDisplayName(member.user)}
            </Text>
            
            {isCurrentUser && (
              <View className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                <Text className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  You
                </Text>
              </View>
            )}
          </View>
          
          <Text 
            className="text-sm text-gray-500 dark:text-gray-400 mb-1"
            numberOfLines={1}
          >
            {getUsername(member.user)}
          </Text>
          
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            Joined {formatJoinDate(member.joinedAt)}
          </Text>
        </View>

        {/* Role Badge and Actions */}
        <View className="items-end">
          {getRoleBadge(member.role)}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function MembersList({ 
  membersData, 
  isLoading, 
  onLoadMore, 
  hasNextPage, 
  isFetchingNextPage,
  currentUserId 
}: MembersListProps) {
  const allMembers = membersData?.pages.flatMap(page => page.members) || [];

  const renderMember = ({ item }: { item: GroupMember }) => (
    <MemberItem 
      member={item} 
      isCurrentUser={item.user.id === currentUserId}
    />
  );

  const renderFooter = () => {
    if (!hasNextPage && !isFetchingNextPage) return null;
    
    return (
      <View className="py-4 items-center">
        {isFetchingNextPage ? (
          <ActivityIndicator size="small" color="#6B7280" />
        ) : (
          <TouchableOpacity
            onPress={onLoadMore}
            className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600"
          >
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Load More
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-12">
      <SvgIcon 
        name="users" 
        width={48} 
        height={48} 
        color="#9CA3AF" 
      />
      <Text className="text-lg font-semibold text-gray-400 dark:text-gray-500 mt-4 mb-2">
        No Members Yet
      </Text>
      <Text className="text-gray-400 dark:text-gray-500 text-center px-8">
        This group doesn't have any members to display.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6B7280" />
        <Text className="text-gray-500 mt-4">Loading members...</Text>
      </View>
    );
  }

  if (allMembers.length === 0) {
    return renderEmpty();
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <FlatList
        data={allMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        onEndReached={hasNextPage ? onLoadMore : undefined}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={20}
      />
    </View>
  );
}