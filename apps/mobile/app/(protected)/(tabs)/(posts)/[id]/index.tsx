import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderContainer from '@/components/layouts/_header';
import { Button } from '@/components/ui/button';

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    alert('Edit functionality coming soon!');
  };

  return (
    <HeaderContainer
      variant="secondary"
      customTitle="Item Details"
      onBackPress={handleBack}
      tabBarHidden={true}
    >
      <ScrollView className="flex-1 bg-white">
        <View className="p-6">

          {/* Item Header */}
          <View className="bg-primary-500 rounded-2xl p-6 mb-6">
            <Text className="text-white text-xl font-semibold mb-2">
              Item #{id}
            </Text>
            <Text className="text-white opacity-80">
              Detailed view for selected item
            </Text>
          </View>

          {/* Details Section */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Information
            </Text>

            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <Text className="text-gray-600 text-sm mb-1">ID:</Text>
              <Text className="text-gray-800 font-medium">{id}</Text>
            </View>

            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <Text className="text-gray-600 text-sm mb-1">Status:</Text>
              <Text className="text-gray-800 font-medium">Active</Text>
            </View>

            <View className="bg-gray-50 rounded-xl p-4">
              <Text className="text-gray-600 text-sm mb-1">Created:</Text>
              <Text className="text-gray-800 font-medium">
                {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              onPress={handleEdit}
            >
              <Text className="text-white font-semibold">Edit Item</Text>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onPress={() => alert('More options coming soon!')}
            >
              <Text className="text-primary-500 font-semibold">More Options</Text>
            </Button>
          </View>

          {/* Placeholder Content */}
          <View className="mt-8 p-6 bg-gray-50 rounded-xl">
            <Text className="text-gray-600 text-center">
              This is a placeholder detail screen. In a real app, this would show
              specific information about the selected item.
            </Text>
          </View>
        </View>
      </ScrollView>
    </HeaderContainer>
  );
}