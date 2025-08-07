import React, { useState } from 'react';
import { View, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import HeaderContainer from '@/components/layouts/_header';
import * as Haptics from 'expo-haptics';
import { SvgIcon } from '@/components/ui/svg-icon';
import { useTranslation } from 'react-i18next';

// Simple category item interface  
interface CategoryItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  progress: number; // Static percentage 0-100
}

// Simple Category Card Component
const CategoryCard: React.FC<{
  category: CategoryItem;
  onPress: (id: string) => void;
}> = ({ category, onPress }) => {
  return (
    <Pressable
      className="mb-6"
      onPress={() => onPress(category.id)}
    >
      {/* Category header */}
      <View className="items-center mb-3">
        <View
          style={{ backgroundColor: `${category.color}20` }}
          className="flex-row items-center py-2 px-4 rounded-xl"
        >
          <Text className="font-medium mr-2" style={{ color: category.color, fontSize: 16 }}>
            {category.icon}
          </Text>
          <Text
            className="font-semibold uppercase"
            style={{ color: category.color, fontSize: 14 }}
          >
            {category.name}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View className="h-4 bg-gray-100 rounded-full w-full overflow-hidden mb-3">
        <View
          className="h-full rounded-full"
          style={{
            backgroundColor: category.color,
            width: `${category.progress}%`
          }}
        />
      </View>

      {/* Simple stats */}
      <View className="flex-row justify-center">
        <Text className="text-gray-600 text-sm">
          {category.progress}% complete
        </Text>
      </View>
    </Pressable>
  );
};

export default function CategoryGridScreen() {
  const { t } = useTranslation();
  const [hasCategories] = useState(true);

  // Static placeholder categories - 4 simple items
  const placeholderCategories: CategoryItem[] = [
    {
      id: '1',
      name: 'Primary',
      color: '#F59E0B',
      icon: '🏠',
      progress: 75,
    },
    {
      id: '2', 
      name: 'Secondary',
      color: '#3B82F6',
      icon: '🚗',
      progress: 45,
    },
    {
      id: '3',
      name: 'Lifestyle',
      color: '#8B5CF6',
      icon: '🎯',
      progress: 60,
    },
    {
      id: '4',
      name: 'Extras',
      color: '#EC4899',
      icon: '🎮',
      progress: 30,
    },
  ];

  const handleCategoryPress = (categoryId: string) => {
    alert(`Category ${categoryId} details coming soon!`);
  };

  const handleManageCategories = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    alert('Category management coming soon!');
  };

  const rightActions = [
    {
      icon: <SvgIcon name="edit" color={"#005EFD"} size={20} />,
      onPress: handleManageCategories
    },
  ];

  return (
    <HeaderContainer variant="secondary" customTitle="Categories" rightActions={rightActions} modal>
      <SafeAreaView className="flex-1 bg-white">
        {!hasCategories ? (
          // Empty state
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1 justify-center items-center px-16">
              <Text className="text-6xl mb-4">📊</Text>
              <Text className="text-3xl font-semibold text-black text-center mb-2">
                No Categories Yet
              </Text>
              <Text className="text-sm text-gray-500 text-center mb-6">
                Create categories to organize your content
              </Text>
              <Button
                variant="primary"
                size="lg"
                rounded="default"
                onPress={handleManageCategories}
              >
                <Text className="text-white font-semibold">Get Started</Text>
              </Button>
            </View>
          </ScrollView>
        ) : (
          // Categories grid
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 72 }}
            className="px-6 pt-6"
          >
            {/* Summary header */}
            <View className="bg-gray-50 rounded-2xl p-4 mb-6">
              <Text className="text-center text-gray-600 text-sm mb-1">Overall Progress</Text>
              <Text className="text-center text-2xl font-bold text-gray-800">
                52% Complete
              </Text>
            </View>

            {/* Categories grid */}
            <View className="space-y-4">
              {placeholderCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onPress={handleCategoryPress}
                />
              ))}
            </View>

            {/* Add category placeholder */}
            <Pressable
              className="w-full rounded-2xl border-2 border-dashed border-gray-300 p-6 items-center justify-center mt-6"
              onPress={handleManageCategories}
            >
              <Text className="text-4xl mb-2">➕</Text>
              <Text className="text-gray-500">Add New Category</Text>
            </Pressable>
          </ScrollView>
        )}
      </SafeAreaView>
    </HeaderContainer>
  );
}