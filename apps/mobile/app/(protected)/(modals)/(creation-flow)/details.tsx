import React, { useState, useCallback } from "react";
import { View, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function FormDetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [details, setDetails] = useState("");

  const params = useLocalSearchParams<{ name?: string }>();

  // Reset state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setDetails("");
      return () => {};
    }, [])
  );

  const handleContinue = () => {
    router.push({
      pathname: "/(protected)/(creation-flow)/summary",
      params: { 
        name: params.name,
        details: details
      }
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <HeaderContainer 
      variant="secondary" 
      customTitle="Add Details"
      onBackPress={handleBack}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView className="flex-1 bg-white">
          <View className="p-6">
            
            {/* Item Name Display */}
            <View className="bg-gray-50 rounded-xl p-4 mb-6">
              <Text className="text-gray-600 text-sm mb-1">Creating:</Text>
              <Text className="text-lg font-semibold text-gray-800">
                {params.name || 'Unnamed Item'}
              </Text>
            </View>

            {/* Details Input */}
            <View className="mb-8">
              <Text className="text-base font-semibold text-gray-800 mb-3">
                Description (Optional)
              </Text>
              
              <TextInput
                className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
                style={{ fontSize: 16, textAlignVertical: 'top' }}
                placeholder="Add any additional details..."
                placeholderTextColor="#9CA3AF"
                value={details}
                onChangeText={setDetails}
                multiline={true}
                numberOfLines={6}
                maxLength={500}
              />
              
              <Text className="text-gray-400 text-xs mt-2 text-right">
                {details.length}/500 characters
              </Text>
            </View>

            {/* Helper text */}
            <View className="mb-8">
              <Text className="text-gray-500 text-sm text-center">
                Provide additional context or notes about this item
              </Text>
            </View>

            {/* Progress indicator */}
            <View className="items-center mb-8">
              <View className="flex-row gap-2">
                <View className="w-8 h-2 bg-primary-500 rounded-full" />
                <View className="w-8 h-2 bg-primary-500 rounded-full" />
                <View className="w-8 h-2 bg-gray-200 rounded-full" />
              </View>
              <Text className="text-gray-400 text-xs mt-2">Step 2 of 3</Text>
            </View>

            {/* Continue Button */}
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <Button
                variant="primary"
                size="lg"
                onPress={handleContinue}
                className="mb-8"
              >
                <Text className="text-white font-semibold text-base">
                  Continue
                </Text>
              </Button>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </HeaderContainer>
  );
}