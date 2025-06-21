import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { TabBarProps, HomeTab } from '@/types/tabs';

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeIndex, onTabPress }) => {
  const handleTabPress = (tab: HomeTab, index: number) => {
    onTabPress(tab, index);
  };

  return (
    <View className="flex-row justify-center items-center gap-2 px-6 py-2">
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => handleTabPress(tab, index)}
          className={`flex-row justify-center items-center px-3 py-1.5 rounded-full ${activeIndex === index
            ? 'bg-[#1E94FF]'
            : 'bg-transparent'
            }`}
          style={{
            minHeight: 32, // Ensures consistent height
          }}
        >
          <Text
            className={`text-sm font-normal text-center ${activeIndex === index
              ? 'text-white'
              : 'text-[#4B5563]'
              }`}
            style={{
              fontFamily: 'DM Sans',
              fontSize: 14,
              fontWeight: '400',
              lineHeight: 20, // 1.4285714285714286em ≈ 20px for 14px font
              letterSpacing: -0.14, // -1% of 14px
            }}
          >
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}; 