import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from "react";
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
import { MonthProvider } from "@/context/month-context";

// Context to disable animations in inactive tabs
const TabVisibilityContext = createContext<{ isTabVisible: boolean }>({ isTabVisible: true });

export const useTabVisibility = () => useContext(TabVisibilityContext);

// Memoized TabContent with simplified animations for better performance
const TabContent = React.memo<{
  isActive: boolean;
  children: React.ReactNode;
}>(({ isActive, children }) => {
  const opacity = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    // Simplified animation for better performance
    opacity.value = withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <TabVisibilityContext.Provider value={{ isTabVisible: isActive }}>
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
        <Animated.View style={[animatedStyle, { flex: 1 }]}>
          {children}
        </Animated.View>
      </View>
    </TabVisibilityContext.Provider>
  );
});

TabContent.displayName = 'TabContent';

export default function Home() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [mountedTabs, setMountedTabs] = useState<Set<number>>(new Set([0])); // Start with first tab mounted

  // Memoize current date to avoid recalculations
  const currentDate = useMemo(() => new Date(), []);
  const currentMonth = useMemo(() => currentDate.getMonth() + 1, [currentDate]);
  const currentYear = useMemo(() => currentDate.getFullYear(), [currentDate]);

  // Get API utils
  const utils = api.useContext();

  // Only load the most critical query immediately (active tab)
  api.transaction.getMonthlySpending.useQuery({
    month: currentMonth,
    year: currentYear,
  }, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled for active transactions
  });

  // Delay other queries to avoid blocking initial navigation
  const [enableBackgroundQueries, setEnableBackgroundQueries] = useState(false);

  // Background queries - only enabled after delay
  api.transaction.getMonthlySummary.useQuery({
    month: currentMonth,
    year: currentYear,
  }, {
    staleTime: 5 * 60 * 1000,
    enabled: enableBackgroundQueries,
  });

  api.transaction.getCategoryBreakdown.useQuery({
    month: currentMonth,
    year: currentYear,
    type: 'expense',
  }, {
    staleTime: 5 * 60 * 1000,
    enabled: enableBackgroundQueries,
  });

  api.account.listWithBalances.useQuery({}, {
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: enableBackgroundQueries,
  });

  // Simplified progressive loading strategy
  useEffect(() => {
    // Enable background queries after initial render
    const timer = setTimeout(() => {
      setEnableBackgroundQueries(true);
    }, 300); // Reduced delay

    return () => clearTimeout(timer);
  }, []);

  // Mount adjacent tabs after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setMountedTabs(prev => {
        const newSet = new Set(prev);
        if (activeTabIndex > 0) newSet.add(activeTabIndex - 1);
        if (activeTabIndex < HOME_TABS.length - 1) newSet.add(activeTabIndex + 1);
        return newSet;
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [activeTabIndex]);

  // Mount all tabs after everything is loaded
  useEffect(() => {
    if (enableBackgroundQueries) {
      const timer = setTimeout(() => {
        setMountedTabs(new Set([0, 1, 2]));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [enableBackgroundQueries]);

  // Memoized tab press handler
  const handleTabPress = useCallback((tab: HomeTab, index: number) => {
    // Mount the new tab if not already mounted
    setMountedTabs(prev => new Set([...prev, index]));

    // Switch active tab
    setActiveTabIndex(index);

    // Prefetch specific data only when needed
    if (enableBackgroundQueries && index === 1) {
      // Charts tab - prefetch daily spending for heatmap
      utils.transaction.getDailySpending.prefetch({
        month: currentMonth,
        year: currentYear,
      });
    }
  }, [enableBackgroundQueries, utils, currentMonth, currentYear]);

  return (
    <HeaderContainer variant="secondary">
      <MonthProvider>
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
      </MonthProvider>
    </HeaderContainer>
  );
}
