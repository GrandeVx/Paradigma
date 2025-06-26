import React, { useState, useEffect, createContext, useContext } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from "react-native-reanimated";
import HeaderContainer from "@/components/layouts/_header";
import { TabBar } from "@/components/tab-navigation/tab-bar";
import { TransactionsSection } from "@/components/home-sections/transactions-section";
import { ChartsSection } from "@/components/home-sections/charts-section";
import { GoalsSection } from "@/components/home-sections/goals-section";
import { HOME_TABS, type HomeTab } from "@/types/tabs";
import { api } from "@/lib/api";

// Context to disable animations in inactive tabs
const TabVisibilityContext = createContext<{ isTabVisible: boolean }>({ isTabVisible: true });

export const useTabVisibility = () => useContext(TabVisibilityContext);

// Individual Tab Component with optimized mounting - REANIMATED WARNING FIX
const TabContent: React.FC<{
  isActive: boolean;
  children: React.ReactNode;
}> = ({ isActive, children }) => {
  const opacity = useSharedValue(isActive ? 1 : 0);
  const translateX = useSharedValue(isActive ? 0 : 20);

  useEffect(() => {
    if (isActive) {
      opacity.value = withTiming(1, { duration: 300 });
      translateX.value = withTiming(0, { duration: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateX.value = withTiming(20, { duration: 200 });
    }
  }, [isActive, opacity, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <TabVisibilityContext.Provider value={{ isTabVisible: isActive }}>
      {/* Wrapper View to prevent layout animation conflicts */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: isActive ? 10 : 1,
        }}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        {/* Inner Animated.View for transform animations only */}
        <Animated.View
          style={[
            animatedStyle,
            {
              flex: 1,
            }
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </TabVisibilityContext.Provider>
  );
};

export default function Home() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [mountedTabs, setMountedTabs] = useState<Set<number>>(new Set([0])); // Start with first tab mounted
  const [enablePrefetch, setEnablePrefetch] = useState(false);

  // Get current month and year for prefetching
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Prefetch data for all sections in background - but only after initial render
  const utils = api.useContext();

  // Only prefetch transactions data for active tab initially (most critical)
  api.transaction.getMonthlySpending.useQuery({
    month: currentMonth,
    year: currentYear,
  }, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled for active transactions
  });

  // Prefetch other data only after delay to avoid blocking initial navigation
  api.transaction.getMonthlySummary.useQuery({
    month: currentMonth,
    year: currentYear,
  }, {
    staleTime: 5 * 60 * 1000,
    enabled: enablePrefetch, // Delayed prefetch
  });

  api.transaction.getCategoryBreakdown.useQuery({
    month: currentMonth,
    year: currentYear,
    type: 'expense',
  }, {
    staleTime: 5 * 60 * 1000,
    enabled: enablePrefetch, // Delayed prefetch
  });

  api.account.listWithBalances.useQuery({}, {
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: enablePrefetch, // Delayed prefetch
  });

  // Enable progressive prefetching after initial render
  useEffect(() => {
    // Enable prefetching after a short delay to avoid blocking initial navigation
    const timer = setTimeout(() => {
      console.log('🚀 [Home] Enabling background prefetching...');
      setEnablePrefetch(true);

      // Use prefetch for non-critical queries to avoid blocking
      setTimeout(() => {
        console.log('📊 [Home] Prefetching additional data...');

        // Prefetch heatmap data for charts tab
        utils.transaction.getDailySpending.prefetch({
          month: currentMonth,
          year: currentYear,
        });
      }, 1000);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [utils, currentMonth, currentYear]);

  const handleTabPress = (tab: HomeTab, index: number) => {
    // Mount the new tab if not already mounted
    setMountedTabs(prev => new Set([...prev, index]));

    // Switch active tab
    setActiveTabIndex(index);

    // Prefetch related data when switching tabs (only if prefetch is enabled)
    if (enablePrefetch && index === 1) {
      // Charts tab - prefetch daily spending for heatmap
      utils.transaction.getDailySpending.prefetch({
        month: currentMonth,
        year: currentYear,
      });
    }
  };

  // Mount adjacent tabs after prefetch is enabled (more conservative approach)
  useEffect(() => {
    if (!enablePrefetch) return;

    const timer = setTimeout(() => {
      console.log('🏗️ [Home] Mounting adjacent tabs...');
      // Gradually mount adjacent tabs only after prefetch is ready
      setMountedTabs(prev => {
        const newSet = new Set(prev);
        if (activeTabIndex > 0) newSet.add(activeTabIndex - 1);
        if (activeTabIndex < HOME_TABS.length - 1) newSet.add(activeTabIndex + 1);
        return newSet;
      });
    }, 1000); // Mount after prefetch + 1 second

    return () => clearTimeout(timer);
  }, [activeTabIndex, enablePrefetch]);

  // Mount all tabs only after user shows engagement (more conservative)
  useEffect(() => {
    if (!enablePrefetch) return;

    const timer = setTimeout(() => {
      console.log('🏗️ [Home] Mounting all tabs...');
      setMountedTabs(new Set([0, 1, 2]));
    }, 2000); // Increased delay

    return () => clearTimeout(timer);
  }, [enablePrefetch]);

  return (
    <HeaderContainer variant="secondary">
      <View className="flex-1 bg-gray-50">
        {/* Animated Tab Navigation */}
        <TabBar
          tabs={HOME_TABS}
          activeIndex={activeTabIndex}
          onTabPress={handleTabPress}
        />

        {/* Tab Content - All tabs are mounted but only active one is visible */}
        <View className="flex-1 relative">
          {/* Transactions Tab */}
          {mountedTabs.has(0) && (
            <TabContent isActive={activeTabIndex === 0}>
              <TransactionsSection />
            </TabContent>
          )}

          {/* Charts Tab */}
          {mountedTabs.has(1) && (
            <TabContent isActive={activeTabIndex === 1}>
              <ChartsSection />
            </TabContent>
          )}

          {/* Goals Tab */}
          {mountedTabs.has(2) && (
            <TabContent isActive={activeTabIndex === 2}>
              <GoalsSection />
            </TabContent>
          )}
        </View>
      </View>
    </HeaderContainer>
  );
}
