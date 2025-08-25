import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import { Group, GroupAction } from './types';
import { getGroupMembershipInfo, getGroupActionButtonInfo } from './utils';

interface GroupHeaderProps {
  group: Group;
  currentUserId?: string;
  onAction: (action: GroupAction) => void;
  isLoading?: boolean;
}

export function GroupHeader({ group, currentUserId, onAction, isLoading = false }: GroupHeaderProps) {
  const membershipInfo = getGroupMembershipInfo(group, currentUserId);
  const buttonInfo = getGroupActionButtonInfo(membershipInfo, group);

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleActionPress = () => {
    if (isLoading || !buttonInfo.action) return;
    onAction(buttonInfo.action);
  };

  // Helper function to get loading text based on action
  const getLoadingText = (action: string | null) => {
    switch (action) {
      case 'join':
        return 'Following...';
      case 'request':
        return 'Requesting...';
      case 'leave':
        return 'Leaving...';
      case 'cancel-request':
        return 'Canceling...';
      default:
        return 'Loading...';
    }
  };

  // Helper function to get button className based on variant
  const getButtonClassName = (variant: string, disabled: boolean) => {
    if (disabled) {
      return 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
    }

    switch (variant) {
      case 'primary':
        return 'bg-black dark:bg-white active:bg-gray-800 dark:active:bg-gray-200';
      case 'secondary':
        return 'border border-gray-300 dark:border-gray-600 active:bg-red-50 dark:active:bg-red-950';
      case 'requested':
        return 'border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/50 active:bg-blue-100 dark:active:bg-blue-900';
      case 'owner':
        return 'bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800';
      default:
        return 'bg-black dark:bg-white active:bg-gray-800 dark:active:bg-gray-200';
    }
  };

  // Helper function to get button text className based on variant
  const getButtonTextClassName = (variant: string, disabled: boolean) => {
    if (disabled) {
      return 'text-gray-400 dark:text-gray-500 text-sm font-bold';
    }

    switch (variant) {
      case 'primary':
        return 'text-white dark:text-black text-sm font-bold';
      case 'secondary':
        return 'text-black dark:text-white text-sm font-bold';
      case 'requested':
        return 'text-blue-600 dark:text-blue-400 text-sm font-bold';
      case 'owner':
        return 'text-green-600 dark:text-green-400 text-sm font-bold';
      default:
        return 'text-white dark:text-black text-sm font-bold';
    }
  };

  return (
    <View className="bg-white dark:bg-black border-b border-gray-100 dark:border-gray-900">
      {/* Cover Image Section - Twitter style */}
      <View className="relative">
        <View className="h-48 bg-gradient-to-r from-blue-400 to-purple-500">
          {/* Cover image placeholder - can be replaced with actual cover image */}
          <View className="absolute inset-0 bg-gray-300 dark:bg-gray-700" />
        </View>

        {/* Profile Avatar - Positioned over cover */}
        <View className="absolute -bottom-16 left-4">
          {group.image ? (
            <View className="w-32 h-32 rounded-full border-4 border-white dark:border-black">
              <Image
                source={{ uri: group.image }}
                className="w-full h-full rounded-full"
                resizeMode="cover"
              />
            </View>
          ) : (
            <View className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full border-4 border-white dark:border-black items-center justify-center">
              <SvgIcon
                name="users"
                width={48}
                height={48}
                color="#6B7280"
              />
            </View>
          )}
        </View>

        {/* Action Button - Positioned in top right of cover */}
        <View className="absolute top-4 right-4">
          {buttonInfo.action && (
            <TouchableOpacity
              onPress={handleActionPress}
              disabled={buttonInfo.disabled || isLoading}
              className={`px-6 py-2 rounded-full ${getButtonClassName(buttonInfo.variant, buttonInfo.disabled || isLoading)}`}
              activeOpacity={buttonInfo.disabled || isLoading ? 1 : 0.8}
            >
              {isLoading ? (
                <View className="flex-row items-center">
                  <View className="w-4 h-4 rounded-full mr-2 animate-spin">
                    <SvgIcon
                      name="refresh"
                      width={16}
                      height={16}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text className={getButtonTextClassName(buttonInfo.variant, buttonInfo.disabled || isLoading)}>
                    {getLoadingText(buttonInfo.action)}
                  </Text>
                </View>
              ) : (
                <Text className={getButtonTextClassName(buttonInfo.variant, buttonInfo.disabled || isLoading)}>
                  {buttonInfo.text}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Group Info Section */}
      <View className="px-4 pt-20 pb-4">
        {/* Group Name and Privacy Indicator */}
        <View className="flex-row items-center mb-2">
          <Text className="text-2xl font-bold text-black dark:text-white mr-2 flex-shrink">
            {group.name}
          </Text>

          {!group.isPublic && (
            <View className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              <SvgIcon
                name="eye-close"
                width={12}
                height={12}
                color="#6B7280"
              />
            </View>
          )}
        </View>

        {/* Description */}
        {group.description && (
          <Text className="text-gray-700 dark:text-gray-300 text-base leading-6 mb-3">
            {group.description}
          </Text>
        )}

        {/* Owner Info */}
        <View className="flex-row items-center mb-3">
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            Created by{' '}
          </Text>
          <Text className="text-black dark:text-white text-sm font-medium">
            @{group.owner.name || group.owner.email.split('@')[0]}
          </Text>
        </View>

        {/* Stats Row - Twitter style */}
        <View className="flex-row items-center space-x-6 gap-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-bold text-black dark:text-white mr-1">
              {formatCount(group.memberCount)}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              Following
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-bold text-black dark:text-white mr-1">
              {formatCount(group.postCount)}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              Posts
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}