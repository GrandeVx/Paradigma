import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Group } from './types';

interface GroupTabsProps {
  activeTab: 'posts' | 'members' | 'requests';
  onTabChange: (tab: 'posts' | 'members' | 'requests') => void;
  showRequests: boolean;
  group: Group;
}

export function GroupTabs({ activeTab, onTabChange, showRequests, group }: GroupTabsProps) {
  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const tabs = [
    {
      id: 'posts' as const,
      label: 'Posts',
      count: group.postCount,
    },
    {
      id: 'members' as const,
      label: 'Members',
      count: group.memberCount,
    },
    ...(showRequests ? [
      {
        id: 'requests' as const,
        label: 'Requests',
        count: 0, // Will be updated when we have the count
      }
    ] : []),
  ];

  return (
    <View className="bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800">
      <View className="flex-row">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            className="flex-1 py-4 px-4 relative"
            activeOpacity={0.7}
          >
            <View className="items-center">
              <View className="flex-row items-center">
                <Text 
                  className={`text-base font-semibold ${
                    activeTab === tab.id 
                      ? 'text-black dark:text-white' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {tab.label}
                </Text>
                
                {tab.count > 0 && (
                  <Text 
                    className={`text-sm ml-2 ${
                      activeTab === tab.id 
                        ? 'text-gray-600 dark:text-gray-300' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {formatCount(tab.count)}
                  </Text>
                )}
              </View>
            </View>
            
            {/* Active Tab Indicator - Twitter style underline */}
            {activeTab === tab.id && (
              <View 
                className="absolute bottom-0 w-16 h-1 bg-blue-500 rounded-full" 
                style={{
                  left: '50%',
                  marginLeft: -32, // Half of width (64px / 2)
                }}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}