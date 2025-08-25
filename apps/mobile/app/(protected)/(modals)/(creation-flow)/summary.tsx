import React, { useState, useCallback } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";

export default function FormSummaryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const params = useLocalSearchParams<{ 
    name?: string, 
    value?: string,
    details?: string 
  }>();

  // Reset state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setIsLoading(false);
      return () => {};
    }, [])
  );

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false);
      alert('Item created successfully!');
      // Navigate back to list or home
      router.push("/(protected)/(accounts)/");
    }, 1500);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <HeaderContainer 
      variant="secondary" 
      customTitle="Review & Create"
      onBackPress={handleBack}
    >
      <ScrollView className="flex-1 bg-white">
        <View className="p-6">
          
          {/* Summary Card */}
          <View className="bg-gray-50 rounded-2xl p-6 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Summary
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Name:</Text>
                <Text className="font-medium text-gray-800">
                  {params.name || 'Unnamed Item'}
                </Text>
              </View>
              
              {params.value && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Value:</Text>
                  <Text className="font-medium text-gray-800">
                    {params.value}
                  </Text>
                </View>
              )}
              
              {params.details && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Details:</Text>
                  <Text className="font-medium text-gray-800">
                    {params.details}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Settings Options */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Options
            </Text>
            
            <Pressable className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Set as default</Text>
                <View className="w-6 h-6 rounded border-2 border-gray-300" />
              </View>
            </Pressable>
            
            <Pressable className="bg-white border border-gray-200 rounded-xl p-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Enable notifications</Text>
                <View className="w-6 h-6 rounded border-2 border-gray-300" />
              </View>
            </Pressable>
          </View>

          {/* Progress indicator */}
          <View className="items-center mb-8">
            <View className="flex-row gap-2">
              <View className="w-8 h-2 bg-primary-500 rounded-full" />
              <View className="w-8 h-2 bg-primary-500 rounded-full" />
              <View className="w-8 h-2 bg-primary-500 rounded-full" />
            </View>
            <Text className="text-gray-400 text-xs mt-2">Step 3 of 3</Text>
          </View>

          {/* Create Button */}
          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            disabled={isLoading}
            className="mb-8"
          >
            <Text className="text-white font-semibold text-base">
              {isLoading ? 'Creating...' : 'Create Item'}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </HeaderContainer>
  );
}