import React, { useState, useCallback } from "react";
import { View, ScrollView, Pressable, SafeAreaView } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from 'react-i18next';

export default function ValueSummaryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const params = useLocalSearchParams<{ 
    value?: string,
    type?: string 
  }>();

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsLoading(false);
      alert(`Value ${params.value} saved successfully!`);
      router.push("/(protected)/(home)/");
    }, 1500);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <HeaderContainer 
      variant="secondary" 
      customTitle="Review Value"
      onBackPress={handleBack}
    >
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
          
          {/* Value Display */}
          <View className="bg-gray-50 rounded-2xl p-8 mb-8 items-center">
            <Text className="text-gray-600 text-base mb-2">Entered Value</Text>
            <Text className="text-4xl font-bold text-gray-800">
              {params.value || '0.00'}
            </Text>
            {params.type && (
              <Text className="text-gray-500 text-sm mt-2 capitalize">
                Type: {params.type}
              </Text>
            )}
          </View>

          {/* Summary Details */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Summary
            </Text>
            
            <View className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Value:</Text>
                <Text className="font-medium text-gray-800">
                  {params.value || '0.00'}
                </Text>
              </View>
            </View>

            <View className="bg-white border border-gray-200 rounded-xl p-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Date:</Text>
                <Text className="font-medium text-gray-800">
                  {new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Options */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Options
            </Text>
            
            <Pressable className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Save for later</Text>
                <View className="w-6 h-6 rounded border-2 border-gray-300" />
              </View>
            </Pressable>
            
            <Pressable className="bg-white border border-gray-200 rounded-xl p-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Set reminder</Text>
                <View className="w-6 h-6 rounded border-2 border-gray-300" />
              </View>
            </Pressable>
          </View>

          {/* Submit Button */}
          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text className="text-white font-semibold text-base">
              {isLoading ? 'Processing...' : 'Save Value'}
            </Text>
          </Button>
        </ScrollView>
      </SafeAreaView>
    </HeaderContainer>
  );
}