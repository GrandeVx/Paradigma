import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import BottomSheet, { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { SvgIcon } from '../ui/svg-icon';

export type TransactionType = 'income' | 'expense' | 'transfer';

interface CategoryBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  snapPoints: string[];
  renderBackdrop: (props: BottomSheetBackdropProps) => React.ReactNode;
  handleClosePress: () => void;
  type: TransactionType;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (categoryId: string | null) => void;
}

interface SubCategory {
  id: string;
  name: string;
  icon: string;
  key?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: string;
  subCategories: SubCategory[];
}

// Mock categories data
const MOCK_EXPENSE_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Food & Dining',
    color: '#FF6B6B',
    icon: '🍽️',
    type: 'EXPENSE',
    subCategories: [
      { id: '1-1', name: 'Restaurants', icon: '🏪', key: 'restaurants' },
      { id: '1-2', name: 'Groceries', icon: '🛒', key: 'groceries' },
      { id: '1-3', name: 'Fast Food', icon: '🍔', key: 'fast_food' },
    ],
  },
  {
    id: '2',
    name: 'Transportation',
    color: '#4ECDC4',
    icon: '🚗',
    type: 'EXPENSE',
    subCategories: [
      { id: '2-1', name: 'Gas', icon: '⛽', key: 'gas' },
      { id: '2-2', name: 'Public Transit', icon: '🚌', key: 'public_transit' },
      { id: '2-3', name: 'Uber/Taxi', icon: '🚕', key: 'rideshare' },
    ],
  },
  {
    id: '3',
    name: 'Entertainment',
    color: '#45B7D1',
    icon: '🎬',
    type: 'EXPENSE',
    subCategories: [
      { id: '3-1', name: 'Movies', icon: '🍿', key: 'movies' },
      { id: '3-2', name: 'Games', icon: '🎮', key: 'games' },
      { id: '3-3', name: 'Events', icon: '🎪', key: 'events' },
    ],
  },
  {
    id: '4',
    name: 'Shopping',
    color: '#96CEB4',
    icon: '🛍️',
    type: 'EXPENSE',
    subCategories: [
      { id: '4-1', name: 'Clothing', icon: '👕', key: 'clothing' },
      { id: '4-2', name: 'Electronics', icon: '📱', key: 'electronics' },
      { id: '4-3', name: 'Home', icon: '🏠', key: 'home' },
    ],
  },
];

const MOCK_INCOME_CATEGORIES: Category[] = [
  {
    id: '5',
    name: 'Salary',
    color: '#6C7CE7',
    icon: '💼',
    type: 'INCOME',
    subCategories: [
      { id: '5-1', name: 'Primary Job', icon: '💰', key: 'salary_primary' },
      { id: '5-2', name: 'Bonus', icon: '🎁', key: 'bonus' },
      { id: '5-3', name: 'Overtime', icon: '⏰', key: 'overtime' },
    ],
  },
  {
    id: '6',
    name: 'Business',
    color: '#A8E6CF',
    icon: '📈',
    type: 'INCOME',
    subCategories: [
      { id: '6-1', name: 'Freelancing', icon: '💻', key: 'freelance' },
      { id: '6-2', name: 'Consulting', icon: '🤝', key: 'consulting' },
      { id: '6-3', name: 'Side Project', icon: '🚀', key: 'side_project' },
    ],
  },
  {
    id: '7',
    name: 'Investments',
    color: '#FFB74D',
    icon: '📊',
    type: 'INCOME',
    subCategories: [
      { id: '7-1', name: 'Dividends', icon: '💎', key: 'dividends' },
      { id: '7-2', name: 'Interest', icon: '🏦', key: 'interest' },
      { id: '7-3', name: 'Capital Gains', icon: '📈', key: 'capital_gains' },
    ],
  },
];

export const CategoryBottomSheet: React.FC<CategoryBottomSheetProps> = ({
  bottomSheetRef,
  snapPoints,
  renderBackdrop,
  handleClosePress,
  type,
  selectedCategoryId,
  setSelectedCategoryId,
}) => {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  const categories = type === 'income' ? MOCK_INCOME_CATEGORIES : MOCK_EXPENSE_CATEGORIES;

  const handleHexColorOpacity = (color: string) => {
    const rgb = color.match(/\\w\\w/g)?.map(hex => parseInt(hex, 16));
    if (!rgb) return color;
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.1)`;
  };

  const handleCategoryPress = (categoryId: string) => {
    setExpandedCategoryId(expandedCategoryId === categoryId ? null : categoryId);
  };

  const handleSubCategorySelect = (subCategoryId: string) => {
    setSelectedCategoryId(subCategoryId);
    handleClosePress();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      handleStyle={{
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#000",
        width: 40,
      }}
      containerStyle={{
        zIndex: 1000,
      }}
      backgroundStyle={{
        backgroundColor: "#FFFFFF"
      }}
    >
      <View className="w-full h-full pt-4 px-6">
        <View className="flex-row justify-between items-center w-full pb-4">
          <Text className="text-black text-center font-medium uppercase" style={{ fontSize: 14 }}>
            {type === 'income' ? 'Income Categories' : 'Expense Categories'}
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="space-y-2">
            {categories.map((category) => (
              <View key={category.id}>
                {/* Category Header */}
                <Pressable
                  className="flex-row items-center justify-between p-4 rounded-xl border border-gray-200"
                  style={{ backgroundColor: handleHexColorOpacity(category.color) }}
                  onPress={() => handleCategoryPress(category.id)}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="w-8 h-8 rounded-lg items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <Text className="text-white text-sm">{category.icon}</Text>
                    </View>
                    <Text className="text-gray-900 font-medium">{category.name}</Text>
                  </View>
                  
                  <SvgIcon
                    name={expandedCategoryId === category.id ? "up" : "down"}
                    size={16}
                    color="#6B7280"
                  />
                </Pressable>

                {/* Subcategories */}
                {expandedCategoryId === category.id && (
                  <View className="mt-2 ml-4 space-y-1">
                    {category.subCategories.map((subCategory) => (
                      <Pressable
                        key={subCategory.id}
                        className={cn(
                          "flex-row items-center gap-3 p-3 rounded-lg",
                          selectedCategoryId === subCategory.id
                            ? "bg-primary-100 border border-primary-300"
                            : "bg-gray-50"
                        )}
                        onPress={() => handleSubCategorySelect(subCategory.id)}
                      >
                        <Text className="text-base">{subCategory.icon}</Text>
                        <Text className="text-gray-800 font-medium">{subCategory.name}</Text>
                        
                        {selectedCategoryId === subCategory.id && (
                          <View className="ml-auto">
                            <SvgIcon name="check" size={16} color="#3B82F6" />
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        <View className="mt-4 p-3 bg-gray-50 rounded-xl">
          <Text className="text-gray-500 text-xs text-center">
            This is a template with placeholder categories
          </Text>
        </View>
      </View>
    </BottomSheet>
  );
};