import React from 'react';
import { View, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import HeaderContainer from '@/components/layouts/_header';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface ListItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  value: string;
  icon: string;
  color: string;
}

interface ItemRowProps {
  item: ListItem;
  onPress: () => void;
}

const ItemRow: React.FC<ItemRowProps> = ({ item, onPress }) => {
  return (
    <Pressable 
      onPress={onPress} 
      className="flex-row items-center gap-3 py-3 px-4 border-b border-gray-100"
    >
      {/* Icon Badge */}
      <View
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: item.color }}
      >
        <Text className="text-white text-lg">{item.icon}</Text>
      </View>

      {/* Item Details */}
      <View className="flex-1">
        <Text className="text-gray-900 text-base font-medium">
          {item.title}
        </Text>
        <View className="flex-row items-center gap-2 mt-1">
          <Text className="text-gray-500 text-sm">
            {item.subtitle}
          </Text>
          <Text className="text-gray-400 text-xs">
            • {item.time}
          </Text>
        </View>
      </View>

      {/* Value */}
      <Text className="text-gray-700 text-base font-semibold">
        {item.value}
      </Text>
    </Pressable>
  );
};

export default function DateListScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();

  // Mock data for the selected date
  const mockItems: ListItem[] = [
    {
      id: '1',
      title: 'Morning Task',
      subtitle: 'Work',
      time: '09:00 AM',
      value: '$125.00',
      icon: '💼',
      color: '#3B82F6'
    },
    {
      id: '2',
      title: 'Lunch Meeting',
      subtitle: 'Personal',
      time: '12:30 PM',
      value: '$45.50',
      icon: '🍽️',
      color: '#10B981'
    },
    {
      id: '3',
      title: 'Afternoon Project',
      subtitle: 'Development',
      time: '02:00 PM',
      value: '$200.00',
      icon: '💻',
      color: '#8B5CF6'
    },
    {
      id: '4',
      title: 'Coffee Break',
      subtitle: 'Leisure',
      time: '04:00 PM',
      value: '$8.75',
      icon: '☕',
      color: '#F59E0B'
    },
    {
      id: '5',
      title: 'Evening Review',
      subtitle: 'Planning',
      time: '06:00 PM',
      value: '$0.00',
      icon: '📝',
      color: '#EF4444'
    }
  ];

  const handleItemPress = (item: ListItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    alert(`Selected: ${item.title}`);
  };

  const handleBack = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const totalValue = mockItems.reduce((sum, item) => {
    const value = parseFloat(item.value.replace('$', '').replace(',', ''));
    return sum + value;
  }, 0);

  return (
    <HeaderContainer 
      variant="secondary" 
      customTitle="Daily View"
      onBackPress={handleBack}
      tabBarHidden={true}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Date Header */}
        <View className="px-4 py-4 bg-gray-50 border-b border-gray-200">
          <Text className="text-gray-600 text-sm">Viewing items for</Text>
          <Text className="text-gray-900 text-lg font-semibold mt-1">
            {formatDate(date || new Date().toISOString())}
          </Text>
        </View>

        {/* Summary Card */}
        <View className="mx-4 mt-4 p-4 bg-primary-50 rounded-xl">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-primary-600 text-sm">Total for Day</Text>
              <Text className="text-primary-700 text-2xl font-bold mt-1">
                ${totalValue.toFixed(2)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-primary-600 text-sm">{mockItems.length} items</Text>
              <Text className="text-primary-500 text-xs mt-1">All categories</Text>
            </View>
          </View>
        </View>

        {/* Items List */}
        <ScrollView className="flex-1 mt-4">
          {mockItems.length > 0 ? (
            mockItems.map((item) => (
              <ItemRow 
                key={item.id} 
                item={item} 
                onPress={() => handleItemPress(item)} 
              />
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-gray-400 text-lg mb-2">No items for this date</Text>
              <Text className="text-gray-400 text-sm">Items will appear here when added</Text>
            </View>
          )}
        </ScrollView>

        {/* Placeholder message */}
        <View className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <Text className="text-gray-500 text-xs text-center">
            This is a template screen showing daily items
          </Text>
        </View>
      </SafeAreaView>
    </HeaderContainer>
  );
}