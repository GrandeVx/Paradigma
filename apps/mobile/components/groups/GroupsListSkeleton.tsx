import React from 'react';
import { View } from 'react-native';

const GroupItemSkeleton = () => (
  <View className="bg-white dark:bg-black px-4 py-3 border-b border-gray-100 dark:border-gray-900">
    <View className="flex-row items-start">
      {/* Group Avatar Skeleton */}
      <View className="mr-3 mt-0.5">
        <View className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
      </View>

      {/* Content Area Skeleton */}
      <View className="flex-1 min-h-0">
        {/* Header Row */}
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center flex-1 min-w-0">
            {/* Group Name */}
            <View className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 mr-2 animate-pulse" />
            {/* Privacy Badge */}
            <View className="w-4 h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </View>
          
          {/* Action Button */}
          <View className="w-16 h-7 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
        </View>

        {/* Description Lines */}
        <View className="mb-2">
          <View className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded mb-1.5 animate-pulse" />
          <View className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-4/5 animate-pulse" />
        </View>

        {/* Metadata Row */}
        <View className="flex-row items-center mt-1">
          {/* Member Count */}
          <View className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16 mr-3 animate-pulse" />
          {/* Post Count */}
          <View className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-14 mr-3 animate-pulse" />
          {/* Owner */}
          <View className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20 animate-pulse" />
        </View>
      </View>
    </View>
  </View>
);

export function GroupsListSkeleton() {
  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Search Bar Skeleton */}
      <View className="px-4 py-2">
        <View className="h-11 bg-gray-100 dark:bg-gray-900 rounded-full animate-pulse" />
      </View>

      {/* Group Items Skeleton */}
      {Array.from({ length: 8 }).map((_, index) => (
        <GroupItemSkeleton key={index} />
      ))}
    </View>
  );
}