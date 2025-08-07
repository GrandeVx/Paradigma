import React, { useState, useCallback, useMemo, useRef, RefObject } from "react";
import { View, Pressable } from "react-native";
import HeaderContainer from "@/components/layouts/_header";
import { TabBar } from "@/components/tab-navigation/tab-bar";
import { getHomeTabs, type HomeTab } from "@/types/tabs";
import { useTranslation } from 'react-i18next';
import { Text } from "@/components/ui/text";
import { useRouter } from 'expo-router';
import { Button } from "@/components/ui/button";
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { CategoryBottomSheet } from "@/components/bottom-sheets/category-bottom-sheet";
import { NotificationsBottomSheet } from "@/components/bottom-sheets/notifications-bottom-sheet";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";

const categoryBottomSheetRef = useRef<BottomSheet>(null);
const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);


const snapPointsCategory = useMemo(() => ["70%"], []);

const renderBackdrop = useCallback(
  (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
      enableTouchThrough={false}
      pressBehavior="close"
      style={[
        { backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10 },
        props.style
      ]}
    />
  ),
  []
);


const handleOpenCategoryBottomSheet = () => {
  categoryBottomSheetRef.current?.expand();
};

const handleCloseCategoryBottomSheet = () => {
  categoryBottomSheetRef.current?.close();
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

const SecondTabSection = () => {

  return (
    <>
      <View className="flex-1 justify-center items-center px-8">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: `#10B98120` }}
        >
          <Text className="text-4xl">📊</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-800 text-center mb-3">
          Bottom Sheets Demo
        </Text>
        <Text className="text-gray-600 text-center text-base mb-6">
          Test the interactive bottom sheet components
        </Text>

        {/* Demo buttons for bottom sheets */}
        <View className="space-y-3 w-full">
          <Button
            variant="outline"
            size="default"
            onPress={handleOpenCategoryBottomSheet}
            className="mb-3"
          >
            <Text className="text-primary-600 font-semibold">Select Category</Text>
          </Button>
        </View>

        {/* Show selected values */}
        <View className="bg-gray-100 rounded-lg px-4 py-3 w-full mt-6">
          <Text className="text-gray-500 text-sm text-center mb-2">
            Selected Category: {selectedCategoryId || 'None'}
          </Text>
        </View>
      </View>

    </>
  );
};

const ThirdTabSection = () => {


  return (
    <>
      <View className="flex-1 justify-center items-center px-8">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: `#F59E0B20` }}
        >
          <Text className="text-4xl">🎯</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-800 text-center mb-3">
          Settings Demo
        </Text>
        <Text className="text-gray-600 text-center text-base mb-6">
          Test notification settings bottom sheet
        </Text>


        <View className="bg-gray-100 rounded-lg px-4 py-3">
          <Text className="text-gray-500 text-sm text-center">
            Or access via Profile → Notifications
          </Text>
        </View>
      </View>
    </>
  );
};

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
    <>
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



      <CategoryBottomSheet
        bottomSheetRef={categoryBottomSheetRef as unknown as RefObject<BottomSheetMethods>}
        snapPoints={snapPointsCategory}
        renderBackdrop={renderBackdrop}
        handleClosePress={handleCloseCategoryBottomSheet}
        type="expense"
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
      />
    </>
  );
}