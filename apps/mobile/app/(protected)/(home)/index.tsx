import React, { useState } from "react";
import { View } from "react-native";
import HeaderContainer from "@/components/layouts/_header";
import { TabBar } from "@/components/tab-navigation/tab-bar";
import { TransactionsSection } from "@/components/home-sections/transactions-section";
import { ChartsSection } from "@/components/home-sections/charts-section";
import { GoalsSection } from "@/components/home-sections/goals-section";
import { HOME_TABS, type HomeTab } from "@/types/tabs";

export default function Home() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);


  const handleTabPress = (tab: HomeTab, index: number) => {
    setActiveTabIndex(index);
  };

  const renderTabContent = () => {
    switch (activeTabIndex) {
      case 0:
        return <TransactionsSection />;
      case 1:
        return <ChartsSection />;
      case 2:
        return <GoalsSection />;
      default:
        return <TransactionsSection />;
    }
  };


  return (
    <HeaderContainer variant="secondary">
      <View className="flex-1 bg-gray-50">
        {/* Status indicator */}


        {/* Animated Tab Navigation */}
        <TabBar
          tabs={HOME_TABS}
          activeIndex={activeTabIndex}
          onTabPress={handleTabPress}
        />

        {/* Tab Content */}
        <View className="flex-1">
          {renderTabContent()}
        </View>
      </View>
    </HeaderContainer>
  );
}
