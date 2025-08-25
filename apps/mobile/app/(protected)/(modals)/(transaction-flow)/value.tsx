import { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import HeaderContainer from '@/components/layouts/_header';

const MAX_CONTENT_LENGTH = 2000;

export default function PostContentScreen() {
  const [content, setContent] = useState('');
  const router = useRouter();

  // Reset state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setContent('');
      return () => {};
    }, [])
  );

  const handleContinuePress = () => {
    // Navigate to publish step with post content
    router.push({
      pathname: '/(protected)/(transaction-flow)/publish',
      params: { content }
    });
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/(home)/");
    }
  };

  const remainingChars = MAX_CONTENT_LENGTH - content.length;
  const isContentValid = content.trim().length > 0 && content.length <= MAX_CONTENT_LENGTH;

  return (
    <HeaderContainer
      variant="secondary"
      customTitle="Create Post"
      onBackPress={handleBackPress}
      hideBackButton={false}
    >
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 px-6 py-4">
          
          {/* Post Content Input */}
          <View className="flex-1 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              What's on your mind?
            </Text>
            
            <Input
              multiline
              numberOfLines={12}
              value={content}
              onChangeText={setContent}
              placeholder="Share your thoughts..."
              className="flex-1 text-base leading-6 min-h-[200px] p-4"
              style={{
                textAlignVertical: 'top',
                minHeight: 200,
              }}
              maxLength={MAX_CONTENT_LENGTH}
            />
            
            {/* Character Counter */}
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-sm text-gray-500">
                Be authentic and respectful
              </Text>
              <Text 
                className={`text-sm ${
                  remainingChars < 100 
                    ? remainingChars < 0 
                      ? 'text-red-500' 
                      : 'text-orange-500'
                    : 'text-gray-500'
                }`}
              >
                {remainingChars} characters remaining
              </Text>
            </View>
          </View>

          {/* Helper Text */}
          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <View className="flex-row items-start">
              <Text className="text-blue-500 text-lg mr-3">💡</Text>
              <View className="flex-1">
                <Text className="text-blue-800 font-medium mb-1">
                  Tip for great posts
                </Text>
                <Text className="text-blue-700 text-sm">
                  Share insights, ask questions, or start meaningful conversations with your group members.
                </Text>
              </View>
            </View>
          </View>

          {/* Continue Button */}
          <Button
            variant="primary"
            size="lg"
            onPress={handleContinuePress}
            disabled={!isContentValid}
            className="mb-4"
          >
            <Text className="text-white font-semibold text-base">
              Continue
            </Text>
          </Button>
        </View>
      </ScrollView>
    </HeaderContainer>
  );
}