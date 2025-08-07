import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import { IconName } from '@/components/ui/icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import HeaderContainer from '@/components/layouts/_header';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Simple placeholder item interface
interface PlaceholderItem {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  color: string;
  value: string;
}

// Simple Item Card Component
const ItemCard: React.FC<{
  item: PlaceholderItem;
  onPress: (id: string) => void;
}> = ({ item, onPress }) => {
  return (
    <Pressable
      className="w-full rounded-2xl mb-4"
      style={{ backgroundColor: item.color }}
      onPress={() => onPress(item.id)}
    >
      <View className="flex-row justify-between items-center p-6">
        <View className="flex-row items-center gap-3">
          <SvgIcon name={item.icon} width={24} height={24} color="#FFFFFF" />
          <View>
            <Text className="text-white font-semibold text-base">{item.title}</Text>
            <Text className="text-white opacity-80 text-sm">{item.subtitle}</Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-white text-lg font-medium">{item.value}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default function GenericListScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  // Static placeholder data - 3 simple items
  const placeholderItems: PlaceholderItem[] = [
    {
      id: '1',
      title: 'Primary Item',
      subtitle: 'Main category',
      icon: 'card',
      color: '#3B82F6',
      value: '2,450.75',
    },
    {
      id: '2', 
      title: 'Secondary Item',
      subtitle: 'Alternative option',
      icon: 'piggy-bank',
      color: '#10B981',
      value: '1,250.00',
    },
    {
      id: '3',
      title: 'Special Item',
      subtitle: 'Featured content',
      icon: 'airplane',
      color: '#F59E0B',
      value: '850.25',
    },
  ];

  // Simple total calculation
  const total = placeholderItems.reduce((sum, item) => {
    const numValue = parseFloat(item.value.replace(',', ''));
    return sum + numValue;
  }, 0);

  const handleItemPress = useCallback((id: string) => {
    router.push({
      pathname: "/(protected)/(accounts)/[id]",
      params: { id }
    });
  }, [router]);

  const toggleVisibility = useCallback(() => {
    setIsBalanceVisible(prev => !prev);
  }, []);

  const rightActions = [
    {
      icon: <FontAwesome5 name="plus" size={16} color="black" />,
      onPress: () => router.push("/(protected)/(creation-flow)/name"),
    },
  ];

  return (
    <HeaderContainer variant="secondary" rightActions={rightActions} hideBackButton={true}>
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />

        {/* Top Section with Total */}
        <View className="pb-10 items-center justify-center px-6">
          <Pressable onPress={toggleVisibility} className="items-center">
            <Text className="text-gray-400 text-2xl">$</Text>
            <Text className="text-black text-5xl font-medium">
              {isBalanceVisible ? total.toFixed(2) : '••••••'}
            </Text>
            <Text className="text-gray-500 text-sm mt-2">Total Value</Text>
          </Pressable>

          {/* Simple action button */}
          <Pressable
            className="mt-4 px-4 py-2 rounded-lg bg-gray-800"
            onPress={() => alert('Feature placeholder')}
          >
            <Text className="text-white text-sm font-semibold">Quick Action</Text>
          </Pressable>
        </View>

        {/* Items List */}
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {placeholderItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onPress={handleItemPress}
            />
          ))}

          {/* Add new item placeholder */}
          <Pressable
            className="w-full rounded-2xl border-2 border-dashed border-gray-300 p-6 items-center justify-center"
            onPress={() => router.push("/(protected)/(creation-flow)/name")}
          >
            <FontAwesome5 name="plus" size={24} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2">Add New Item</Text>
          </Pressable>
        </ScrollView>
      </View>
    </HeaderContainer>
  );
}