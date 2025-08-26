import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import { Post, PostItemProps } from './types';

export function PostItem({ post, onLike, onComment }: PostItemProps) {
  const handleLike = () => {
    onLike?.(post.id);
  };

  const handleComment = () => {
    onComment?.(post.id);
  };

  const getDisplayName = (author: Post['author']) => {
    return author.name || author.email.split('@')[0];
  };

  const getUsername = (author: Post['author']) => {
    return `@${author.email.split('@')[0]}`;
  };

  const formatDate = (date: Date | string) => {
    try {
      const parsedDate = typeof date === 'string' ? new Date(date) : date;

      // Check if the date is valid
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        return 'now';
      }

      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - parsedDate.getTime()) / (1000 * 60));
        return diffInMinutes <= 1 ? 'now' : `${diffInMinutes}m`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d`;
      }
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'now';
    }
  };

  return (
    <Pressable className="bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 px-4 py-3 active:bg-gray-50 dark:active:bg-gray-900 transition-colors">
      <View className="flex-row">
        {/* Avatar */}
        <View className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 items-center justify-center">
          <Text className="text-base font-semibold text-gray-600 dark:text-gray-300">
            {getDisplayName(post.author).charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Content */}
        <View className="flex-1 w-full">
          {/* Header with user info */}
          {post.group && (

            <View className="bg-gray-100 dark:bg-gray-800 py-0.5 rounded-full flex w-24 flex-row items-center justify-center mb-1">
              <Text className="text-sm text-gray-600 dark:text-gray-300 px-2">
                {post.group.name}
              </Text>
            </View>

          )}
          <View className="flex-row items-center mb-1">
            <Text className="text-base font-bold text-black dark:text-white mr-1">
              {getDisplayName(post.author)}
            </Text>
            <Text className="text-base text-gray-500 dark:text-gray-400 mr-1">
              {getUsername(post.author)}
            </Text>
            <Text className="text-base text-gray-500 dark:text-gray-400 mr-1">
              ·
            </Text>
            <Text className="text-base text-gray-500 dark:text-gray-400 mr-1">
              {formatDate(post.createdAt)}
            </Text>
          </View>

          {/* Post content */}
          <Text className="text-base text-black dark:text-white leading-5 mb-3">
            {post.content}
          </Text>

          {/* Action buttons */}
          <View className="flex-row items-center">
            <Pressable
              className="flex-row items-center mr-8 py-1 px-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors min-w-[44] min-h-[44] justify-center"
              onPress={handleComment}
            >
              <SvgIcon
                name="message-circle"
                width={18}
                height={18}
                color="#6B7280"
              />
              {post.commentCount > 0 && (
                <Text className="text-sm text-gray-500 dark:text-gray-400 ml-2 font-medium">
                  {post.commentCount}
                </Text>
              )}
            </Pressable>

            <Pressable
              className="flex-row items-center mr-8 py-1 px-2 rounded-full active:bg-red-50 dark:active:bg-red-900/20 transition-colors min-w-[44] min-h-[44] justify-center"
              onPress={handleLike}
            >
              <SvgIcon
                name="heart"
                width={18}
                height={18}
                color={post.isLiked ? "#EF4444" : "#6B7280"}
              />
              {post.likeCount > 0 && (
                <Text className={`text-sm ml-2 font-medium ${post.isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {post.likeCount}
                </Text>
              )}
            </Pressable>

            <Pressable className="flex-row items-center py-1 px-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors min-w-[44] min-h-[44] justify-center">
              <SvgIcon
                name="share"
                width={18}
                height={18}
                color="#6B7280"
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}