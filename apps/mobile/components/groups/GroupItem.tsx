import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import { GroupItemProps } from './types';
import { getGroupMembershipInfo, getGroupActionButtonInfo } from './utils';

export function GroupItem({ 
  group, 
  onPress, 
  onJoin, 
  onLeave,
  currentUserId,
  isLoading = false
}: GroupItemProps) {

  const handlePress = () => {
    if (onPress) {
      onPress(group.id);
    }
  };

  // Get membership info for this group
  const membershipInfo = getGroupMembershipInfo(group, currentUserId);
  const buttonInfo = getGroupActionButtonInfo(membershipInfo, group);

  const handleActionPress = (event: any) => {
    event.stopPropagation();
    
    if (isLoading || !buttonInfo.action) return;
    
    switch (buttonInfo.action) {
      case 'join':
      case 'request':
        if (onJoin) {
          onJoin(group.id, buttonInfo.action);
        }
        break;
      case 'leave':
      case 'cancel-request':
        if (onLeave) {
          onLeave(group.id, buttonInfo.action);
        }
        break;
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
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

  // Helper function to get spinner color based on button variant
  const getSpinnerColor = (variant: string) => {
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'requested':
        return '#3B82F6';
      case 'owner':
        return '#059669';
      case 'secondary':
      default:
        return '#000000';
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
    <TouchableOpacity
      onPress={handlePress}
      className="bg-white dark:bg-black px-4 py-3 active:bg-gray-50 dark:active:bg-gray-950 border-b border-gray-100 dark:border-gray-900"
      activeOpacity={0.98}
    >
      <View className="flex-row items-start">
        {/* Group Avatar */}
        <View className="mr-3 mt-0.5">
          {group.image ? (
            <Image
              source={{ uri: group.image }}
              className="w-10 h-10 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center">
              <SvgIcon 
                name="users" 
                width={16} 
                height={16} 
                color="#6B7280" 
              />
            </View>
          )}
        </View>

        {/* Content Area */}
        <View className="flex-1 min-h-0">
          {/* Header Row */}
          <View className="flex-row items-center justify-between mb-0.5">
            <View className="flex-row items-center flex-1 min-w-0">
              <Text 
                className="text-base font-bold text-black dark:text-white mr-1 flex-shrink"
                numberOfLines={1}
              >
                {group.name}
              </Text>
              
              {!group.isPublic && (
                <View className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded ml-1">
                  <SvgIcon 
                    name="eye-close" 
                    width={10} 
                    height={10} 
                    color="#6B7280" 
                  />
                </View>
              )}
            </View>

            {/* Action Button */}
            <View className="ml-3">
              {(onJoin || onLeave) && buttonInfo.action && (
                <TouchableOpacity
                  onPress={handleActionPress}
                  disabled={buttonInfo.disabled || isLoading}
                  className={`px-4 py-1.5 rounded-full ${getButtonClassName(buttonInfo.variant, buttonInfo.disabled || isLoading)}`}
                  activeOpacity={buttonInfo.disabled || isLoading ? 1 : 0.8}
                >
                  {isLoading ? (
                    <View className="flex-row items-center">
                      <View className="w-3 h-3 rounded-full mr-1.5 animate-spin">
                        <SvgIcon 
                          name="loader" 
                          width={12} 
                          height={12} 
                          color={getSpinnerColor(buttonInfo.variant)}
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

          {/* Description */}
          {group.description && (
            <Text 
              className="text-gray-700 dark:text-gray-300 text-sm leading-5 mb-2"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {group.description}
            </Text>
          )}

          {/* Metadata Row */}
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-500 dark:text-gray-500 text-sm mr-3">
              {formatCount(group.memberCount)} member{group.memberCount !== 1 ? 's' : ''}
            </Text>
            
            <Text className="text-gray-500 dark:text-gray-500 text-sm mr-3">
              {formatCount(group.postCount)} post{group.postCount !== 1 ? 's' : ''}
            </Text>
            
            <Text className="text-gray-500 dark:text-gray-500 text-sm">
              by @{group.owner.name || group.owner.email.split('@')[0]}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}