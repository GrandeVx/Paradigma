import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

interface SkeletonProps {
  width: number | string;
  height: number;
  className?: string;
}

function Skeleton({ width, height, className = "" }: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={{
        width,
        height,
        opacity,
      }}
      className={`bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
}

function PostItemSkeleton() {
  return (
    <View className="bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-4 py-3">
      <View className="flex-row">
        {/* Avatar Skeleton */}
        <Skeleton 
          width={48} 
          height={48} 
          className="rounded-full mr-3" 
        />
        
        {/* Content Skeleton */}
        <View className="flex-1">
          {/* User info skeleton */}
          <View className="flex-row items-center mb-1">
            <Skeleton width={80} height={16} className="mr-2" />
            <Skeleton width={60} height={16} className="mr-2" />
            <Skeleton width={20} height={16} />
          </View>
          
          {/* Post content skeleton */}
          <View className="mb-3">
            <Skeleton width="100%" height={16} className="mb-2" />
            <Skeleton width="85%" height={16} className="mb-2" />
            <Skeleton width="60%" height={16} />
          </View>
          
          {/* Actions skeleton */}
          <View className="flex-row items-center">
            <View className="flex-row items-center mr-8">
              <Skeleton width={18} height={18} className="rounded mr-2" />
              <Skeleton width={20} height={14} />
            </View>
            <View className="flex-row items-center mr-8">
              <Skeleton width={18} height={18} className="rounded mr-2" />
              <Skeleton width={20} height={14} />
            </View>
            <View className="flex-row items-center">
              <Skeleton width={18} height={18} className="rounded" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export function FeedSkeleton() {
  return (
    <View className="flex-1 bg-white dark:bg-black">
      {Array.from({ length: 8 }).map((_, index) => (
        <PostItemSkeleton key={`skeleton-${index}`} />
      ))}
    </View>
  );
}