import React, { useState, useCallback } from "react";
import { View, Pressable } from "react-native";
import HeaderContainer from "@/components/layouts/_header";
import { TabBar } from "@/components/tab-navigation/tab-bar";
import { getHomeTabs, type HomeTab } from "@/types/tabs";
import { useTranslation } from 'react-i18next';
import { Text } from "@/components/ui/text";
import { useRouter } from 'expo-router';
import { Button } from "@/components/ui/button";

// Simple placeholder section component
const PlaceholderSection: React.FC<{
  title: string;
  description: string;
  icon: string;
  color: string;
}> = ({ title, description, icon, color }) => {
  return (
    <View className="flex-1 justify-center items-center px-8">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: `${color}20` }}
      >
        <Text className="text-4xl">{icon}</Text>
      </View>
      <Text className="text-2xl font-bold text-gray-800 text-center mb-3">
        {title}
      </Text>
      <Text className="text-gray-600 text-center text-base mb-6">
        {description}
      </Text>
      <View className="bg-gray-100 rounded-lg px-4 py-3">
        <Text className="text-gray-500 text-sm text-center">
          Placeholder content area
        </Text>
      </View>
    </View>
  );
};

// Static tab content components
const FirstTabSection = () => {
  const router = useRouter();

  const handleOpenDailyView = () => {
    const today = new Date().toISOString().split('T')[0];
    router.push(`/(protected)/(home)/(daily-transactions)/${today}`);
  };

  return (
    <View className="flex-1 justify-center items-center px-8">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: `#3B82F620` }}
      >
        <Text className="text-4xl">📋</Text>
      </View>
      <Text className="text-2xl font-bold text-gray-800 text-center mb-3">
        Main Content
      </Text>
      <Text className="text-gray-600 text-center text-base mb-6">
        This would be your primary content area
      </Text>

      {/* Demo button to access daily-transactions template */}
      <Button
        variant="primary"
        size="default"
        onPress={handleOpenDailyView}
        className="mb-4"
      >
        <Text className="text-white font-semibold">View Daily Template</Text>
      </Button>

      <View className="bg-gray-100 rounded-lg px-4 py-3">
        <Text className="text-gray-500 text-sm text-center">
          Tap button above to see the Date List template
        </Text>
      </View>
    </View>
  );
};

const SecondTabSection = () => (
  <PlaceholderSection
    title="Secondary View"
    description="This would show alternative content or data"
    icon="📊"
    color="#10B981"
  />
);

const ThirdTabSection = () => (
  <PlaceholderSection
    title="Additional Features"
    description="This would contain extra functionality"
    icon="🎯"
    color="#F59E0B"
  />
);

export default function TabNavigationTemplate() {
  const { t } = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Get tabs with translations
  const homeTabs = getHomeTabs(t);

  // Simple tab press handler
  const handleTabPress = useCallback((tab: HomeTab, index: number) => {
    setActiveTabIndex(index);
    console.log(`[Tab Navigation] Switched to tab: ${tab.title}`);
  }, []);

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTabIndex) {
      case 0:
        return <FirstTabSection />;
      case 1:
        return <SecondTabSection />;
      case 2:
        return <ThirdTabSection />;
      default:
        return <FirstTabSection />;
    }
  };

  return (
    <HeaderContainer variant="secondary" customTitle="Dashboard">
      <View className="flex-1">
        {/* Tab Navigation */}
        <TabBar
          tabs={homeTabs}
          activeIndex={activeTabIndex}
          onTabPress={handleTabPress}
        />

        {/* Active Tab Content */}
        <View className="flex-1">
          {renderTabContent()}
        </View>
      </View>
    </HeaderContainer>
  );
}