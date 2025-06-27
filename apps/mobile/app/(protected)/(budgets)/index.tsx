import React, { useRef, useCallback, RefObject, useState, useEffect, useMemo } from 'react';
import { View, SafeAreaView, ScrollView, Pressable, RefreshControl } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOutUp,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  runOnJS
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import HeaderContainer from '@/components/layouts/_header';
import * as Haptics from 'expo-haptics';
import BottomSheet, {
  BottomSheetBackdropProps,
  BottomSheetBackdrop
} from '@gorhom/bottom-sheet';
import { BudgetBottomSheet } from '@/components/bottom-sheets/budget-bottom-sheet';
import { useTabBar } from '@/context/TabBarContext';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { SvgIcon } from '@/components/ui/svg-icon';
import { budgetUtils } from '@/lib/mmkv-storage';
import { router } from 'expo-router';
import { useCurrency } from '@/hooks/use-currency';

// Legacy helper function to format currency - now using global currency hook in components
// const formatCurrency = (amount: number) => {
//   return new Intl.NumberFormat('it-IT', {
//     style: 'currency',
//     currency: 'EUR',
//     minimumFractionDigits: 2,
//   }).format(amount);
// };

// Helper to get category background color with opacity - memoized
const getCategoryBackgroundColor = (color: string) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, 0.1)`;
};

// Memoized loading skeleton component for better performance
const LoadingSkeleton = React.memo<{ budgetCount?: number }>(({ budgetCount = 3 }) => {
  const shimmerOpacity = useSharedValue(0.3);

  useEffect(() => {
    const animate = () => {
      shimmerOpacity.value = withTiming(1, { duration: 800 }, () => {
        shimmerOpacity.value = withTiming(0.3, { duration: 800 }, () => {
          runOnJS(animate)();
        });
      });
    };
    animate();
  }, [shimmerOpacity]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  // Memoize skeleton items
  const skeletonItems = useMemo(() =>
    Array.from({ length: Math.max(1, budgetCount) }, (_, index) => index + 1),
    [budgetCount]
  );

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="flex-1 p-4 gap-y-4"
    >
      {/* Summary Card Skeleton */}
      <Animated.View style={shimmerStyle} className="bg-gray-200 rounded-3xl h-48" />

      {/* Budget Items Skeleton - Dynamic count based on cache */}
      {skeletonItems.map((item) => (
        <Animated.View
          key={item}
          style={shimmerStyle}
          entering={FadeInDown.delay(item * 100).duration(400)}
          className="bg-gray-200 rounded-2xl h-32"
        />
      ))}
    </Animated.View>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Memoized Budget Item Component with simplified animations for better performance
const BudgetItem = React.memo<{
  budget: {
    id: string;
    allocatedAmount: string | number;
    macroCategoryId: string;
  };
  category: {
    id: string;
    name: string;
    color: string;
    icon?: string;
    type: string;
  };
  spending: number;
  onPress: () => void;
  index: number;
  formatCurrency: (amount: number | string, options?: { showSymbol?: boolean; showSign?: boolean; decimals?: number; }) => string;
}>(({
  budget,
  category,
  spending,
  onPress,
  index,
  formatCurrency
}) => {
  // Memoize calculations to avoid recalculation on every render
  const calculations = useMemo(() => {
    const budgetAmount = Number(budget.allocatedAmount);
    const spent = spending;
    const remaining = budgetAmount - spent;
    const percentage = Math.min(100, (spent / budgetAmount) * 100);

    return { budgetAmount, spent, remaining, percentage };
  }, [budget.allocatedAmount, spending]);

  const progressWidth = useSharedValue(0);
  const itemScale = useSharedValue(1);

  useEffect(() => {
    progressWidth.value = withDelay(
      index * 50, // Reduced delay for smoother feel
      withSpring(calculations.percentage, {
        damping: 20, // Increased damping for less bouncy animation
        stiffness: 120,
      })
    );
  }, [calculations.percentage, index]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const itemStyle = useAnimatedStyle(() => ({
    transform: [{ scale: itemScale.value }],
  }));

  const handlePressIn = useCallback(() => {
    itemScale.value = withSpring(0.98);
  }, [itemScale]);

  const handlePressOut = useCallback(() => {
    itemScale.value = withSpring(1);
  }, [itemScale]);

  // Memoize background color calculation
  const categoryBackgroundColor = useMemo(() =>
    getCategoryBackgroundColor(category.color),
    [category.color]
  );

  // Memoize remaining amount color
  const remainingAmountColor = useMemo(() => {
    if (calculations.remaining < 0) return '#DE4841';
    if (calculations.remaining < calculations.budgetAmount * 0.2) return '#EBAE46';
    return '#66BD50';
  }, [calculations.remaining, calculations.budgetAmount]);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400).springify()} // Reduced duration
      exiting={FadeOutUp.duration(300)}
      layout={Layout.springify().damping(20).stiffness(120)} // Adjusted for smoother animation
      style={itemStyle}
    >
      <Pressable
        className="mb-4"
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Category header */}
        <View className="items-center mb-2">
          <View
            style={{ backgroundColor: categoryBackgroundColor }}
            className="flex-row items-center py-1.5 px-3 rounded-xl"
          >
            <Text
              className="text-base font-medium mr-2"
              style={{ color: category.color }}
            >
              {category.icon || '📊'}
            </Text>
            <Text
              className="text-sm font-semibold uppercase"
              style={{ color: category.color }}
            >
              {category.name}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className="h-3 bg-gray-50 rounded-full w-full overflow-hidden mb-2">
          <Animated.View
            style={[
              progressStyle,
              {
                height: '100%',
                backgroundColor: category.color,
              }
            ]}
          />
        </View>

        {/* Details */}
        <View className="flex-row justify-between px-6">
          <View className="items-center">
            <Text className="text-gray-400 text-sm">Budget</Text>
            <Text className="text-gray-700 text-base font-medium">
              {formatCurrency(calculations.budgetAmount)}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-400 text-sm">Speso già</Text>
            <Text className="text-gray-700 text-base font-medium">
              {formatCurrency(calculations.spent)}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-400 text-sm">Rimanente</Text>
            <Text
              className="text-base font-medium"
              style={{ color: remainingAmountColor }}
            >
              {calculations.remaining < 0 ? '-' : ''}{formatCurrency(Math.abs(calculations.remaining))}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-200 w-full mt-4" />
      </Pressable>
    </Animated.View>
  );
});

BudgetItem.displayName = 'BudgetItem';

export default function BudgetScreen() {
  const { formatCurrency, getCurrencySymbol } = useCurrency();

  // State for current month
  const [currentDate, setCurrentDate] = useState(new Date());

  // State for monthly total budget from MMKV
  const [monthlyTotalBudget, setMonthlyTotalBudget] = useState<number>(0);

  // State for cached budget info
  const [cachedBudgetCount, setCachedBudgetCount] = useState<number>(0);
  const [hasBudgetsInCache, setHasBudgetsInCache] = useState<boolean>(false);

  // Animation values
  const contentOpacity = useSharedValue(0);
  const summaryScale = useSharedValue(0.9);

  // Get API utils
  const utils = api.useContext();

  // Memoize query parameters to avoid unnecessary refetches
  const queryParams = useMemo(() => ({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  }), [currentDate]);

  // API queries
  const {
    data: budgetSettings,
    isLoading: isLoadingBudgets,
    refetch: refetchBudgets,
    isRefetching: isRefetchingBudgets
  } = api.budget.getCurrentSettings.useQuery({});

  const { data: allCategories, refetch: refetchCategories } = api.category.list.useQuery({});

  // Extract macro categories - memoized
  const macroCategories = useMemo(() =>
    allCategories?.filter(cat => cat.type === 'INCOME' || cat.type === 'EXPENSE'),
    [allCategories]
  );

  // Get transaction data for the current month
  const {
    data: transactionData,
    refetch: refetchTransactions,
    isRefetching: isRefetchingTransactions
  } = api.transaction.getMonthlySpending.useQuery({
    ...queryParams,
    // Pass selected categories if any, undefined means get all transactions
    macroCategoryIds: budgetSettings?.map(budget => budget.macroCategoryId),
  });

  // Memoize loading and content states
  const contentStates = useMemo(() => {
    const isInitialLoading = isLoadingBudgets;
    const hasBudgets = budgetSettings && budgetSettings.length > 0;

    return {
      shouldShowSkeleton: isInitialLoading && hasBudgetsInCache,
      shouldShowEmptyState: !isInitialLoading && !hasBudgets && !hasBudgetsInCache,
      shouldShowBudgetView: !isInitialLoading && hasBudgets,
    };
  }, [isLoadingBudgets, budgetSettings, hasBudgetsInCache]);

  // Initialize monthly total budget and cache from MMKV
  useEffect(() => {
    const storedTotalBudget = budgetUtils.getMonthlyTotalBudget();
    setMonthlyTotalBudget(storedTotalBudget);

    // Initialize cache data
    const cachedBudgetCount = budgetUtils.getBudgetCountFromCache();
    const hasBudgetsFromCache = budgetUtils.hasBudgetsFromCache();

    setCachedBudgetCount(cachedBudgetCount);
    setHasBudgetsInCache(hasBudgetsFromCache);
  }, []);

  // Update cache when data loads successfully
  useEffect(() => {
    if (budgetSettings && allCategories && budgetSettings.length > 0) {
      // Update cache with fresh data
      budgetUtils.setBudgetCacheData(budgetSettings, allCategories);

      // Update local cache state
      const newBudgetCount = budgetSettings.filter(budget => {
        const category = allCategories.find(cat => cat.id === budget.macroCategoryId);
        return category && category.type === 'EXPENSE';
      }).length;

      setCachedBudgetCount(newBudgetCount);
      setHasBudgetsInCache(newBudgetCount > 0);
    }
  }, [budgetSettings, allCategories]);

  // Animate content when data loads
  useEffect(() => {
    if (!isLoadingBudgets) {
      contentOpacity.value = withTiming(1, { duration: 400 }); // Reduced duration
      summaryScale.value = withSpring(1, {
        damping: 20, // Increased damping for smoother animation
        stiffness: 120,
      });
    }
  }, [isLoadingBudgets, contentOpacity, summaryScale]);

  // Memoized refresh handler
  const handleRefresh = useCallback(() => {
    refetchBudgets();
    refetchCategories();
    refetchTransactions();
  }, [refetchBudgets, refetchCategories, refetchTransactions]);

  // Bottom sheet setup
  const snapPoints = ['80%'];
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { hideTabBar, showTabBar } = useTabBar();

  const handleOpenBottomSheet = useCallback(() => {
    hideTabBar();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRef.current?.expand();
  }, [hideTabBar]);

  const handleCloseBottomSheet = useCallback(() => {
    showTabBar();
    bottomSheetRef.current?.close();

    // Invalidate queries when bottom sheet is closed to refresh data
    utils.budget.getCurrentSettings.invalidate();
    utils.transaction.getMonthlySpending.invalidate({
      ...queryParams,
      // Use current selected categories or undefined for all
      macroCategoryIds: budgetSettings?.map(budget => budget.macroCategoryId),
    });
  }, [showTabBar, utils, queryParams, budgetSettings]);

  const handleBudgetClick = useCallback((budgetId: string) => {
    router.push(`/(protected)/(home)/(category-transactions)/${budgetId}?referrer=budgets`);
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={() => {
          showTabBar();
        }}
        enableTouchThrough={false}
        pressBehavior="close"
        style={[
          { backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10 },
          props.style
        ]}
      />
    ),
    [showTabBar]
  );

  // Memoized budget summary calculation
  const budgetSummary = useMemo(() => {
    if (!budgetSettings || !transactionData) return null;

    // Calculate total allocated budget from expense categories
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalAllocatedBudget = budgetSettings.reduce((sum: number, budget: any) => {
      // Only include expense categories in the allocated budget
      const category = macroCategories?.find(cat => cat.id === budget.macroCategoryId);
      if (category && category.type === 'EXPENSE') {
        return sum + Number(budget.allocatedAmount);
      }
      return sum;
    }, 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalSpent = transactionData.reduce((sum: number, item: any) => sum + Number(item.amount), 0);

    // Remaining budget is monthly total - allocated budget (not spent)
    // This shows how much of the monthly budget is still available to allocate
    const remainingBudget = monthlyTotalBudget - totalAllocatedBudget;

    return {
      totalBudget: totalAllocatedBudget, // This is the sum of allocated budgets
      monthlyTotalBudget, // This is the total monthly budget from MMKV
      totalSpent: Math.abs(totalSpent),
      remainingBudget // This is what's left to allocate
    };
  }, [budgetSettings, transactionData, macroCategories, monthlyTotalBudget]);

  // Memoized category spending calculation
  const getCategorySpending = useCallback((categoryId: string) => {
    if (!transactionData) return 0;

    return transactionData
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((transaction: any) => transaction.subCategory?.macroCategoryId === categoryId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .reduce((sum: number, transaction: any) => sum + Math.abs(Number(transaction.amount)), 0);
  }, [transactionData]);

  // Handle month navigation with animation - memoized
  const goToPreviousMonth = useCallback(() => {
    summaryScale.value = withSpring(0.95, { duration: 150 }, () => {
      summaryScale.value = withSpring(1, { duration: 200 });
    });

    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  }, [currentDate, summaryScale]);

  const goToNextMonth = useCallback(() => {
    summaryScale.value = withSpring(0.95, { duration: 150 }, () => {
      summaryScale.value = withSpring(1, { duration: 200 });
    });

    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  }, [currentDate, summaryScale]);

  // Memoized month formatting
  const formattedMonthYear = useMemo(() =>
    format(currentDate, 'MMMM yyyy', { locale: it }),
    [currentDate]
  );

  // Determine if we're refreshing
  const isRefreshing = isRefetchingBudgets || isRefetchingTransactions;

  const rightActions = useMemo(() => [
    {
      icon: <SvgIcon name="edit" color={"#005EFD"} size={20} />,
      onPress: handleOpenBottomSheet
    },
  ], [handleOpenBottomSheet]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const summaryStyle = useAnimatedStyle(() => ({
    transform: [{ scale: summaryScale.value }],
  }));

  return (
    <>
      <HeaderContainer variant="secondary" customTitle="BUDGET" rightActions={rightActions} modal>
        <SafeAreaView className="flex-1 bg-white">
          {contentStates.shouldShowSkeleton ? (
            <LoadingSkeleton budgetCount={cachedBudgetCount} />
          ) : contentStates.shouldShowEmptyState ? (
            // Empty state - no budgets set
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              }
            >
              <Animated.View
                style={contentStyle}
                className="flex-1 relative"
              >
                {/* Background emojis with staggered animations */}
                <Animated.Text
                  entering={FadeIn.delay(200).duration(800)}
                  className="absolute top-20 left-10 text-6xl opacity-5"
                >
                  💰
                </Animated.Text>
                <Animated.Text
                  entering={FadeIn.delay(400).duration(800)}
                  className="text-[48px] text-gray-500 absolute top-[418px] right-[20px]"
                >
                  🛒
                </Animated.Text>
                <Animated.Text
                  entering={FadeIn.delay(100).duration(800)}
                  className="text-[64px] text-gray-500 absolute top-[89px] left-[126px]"
                >
                  🏠
                </Animated.Text>
                <Animated.Text
                  entering={FadeIn.delay(300).duration(800)}
                  className="text-[40px] text-gray-500 absolute top-[196px] left-[19px]"
                >
                  🍽️
                </Animated.Text>
                <Animated.Text
                  entering={FadeIn.delay(500).duration(800)}
                  className="text-[64px] text-gray-500 absolute top-[447px] left-[59px]"
                >
                  🎬
                </Animated.Text>

                {/* Content container */}
                <View className="flex-1 justify-center items-center px-16">
                  <Animated.View
                    entering={FadeInDown.delay(600).duration(600).springify()}
                    className="items-center"
                  >
                    <Text className="text-3xl font-semibold text-black text-center mb-2">
                      Budget mensile
                    </Text>
                    <Text className="text-sm text-gray-500 text-center mb-6">
                      Imposta il tuo budget e tieni traccia delle spese per raggiungere i tuoi obiettivi
                    </Text>
                    <Button
                      variant="primary"
                      size="lg"
                      rounded="default"
                      className="w-40"
                      onPress={handleOpenBottomSheet}
                    >
                      <Text className="text-white font-semibold">Inizia</Text>
                    </Button>
                  </Animated.View>
                </View>
              </Animated.View>
            </ScrollView>
          ) : contentStates.shouldShowBudgetView ? (
            // Budget view - when budgets exist
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 72 }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              }
            >
              <Animated.View
                style={contentStyle}
                className="flex-1 p-4 gap-y-4"
              >
                {/* Budget Summary Card */}
                <Animated.View
                  style={summaryStyle}
                  entering={FadeInDown.duration(600).springify()}
                  layout={Layout.springify().damping(15).stiffness(100)}
                  className="bg-gray-50 rounded-3xl p-4"
                >
                  {/* Month selector */}
                  <View className="flex-row justify-between items-center mb-4">
                    <Pressable onPress={goToPreviousMonth} className="w-10 h-10 items-center justify-center">
                      <Text className="text-black">←</Text>
                    </Pressable>
                    <Text className="text-base font-normal text-black capitalize">
                      {formattedMonthYear}
                    </Text>
                    <Pressable onPress={goToNextMonth} disabled={
                      // check if the next month is in the future
                      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1) > new Date()
                    } className={cn("w-10 h-10 items-center justify-center",
                      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1) > new Date() ? 'opacity-50' : ''
                    )

                    }>
                      <Text className="text-black">→</Text>
                    </Pressable>
                  </View>

                  {/* Budget amount */}
                  {budgetSummary && (
                    <Animated.View
                      entering={FadeIn.delay(300).duration(600)}
                      className="mb-4"
                    >
                      <View className="flex-row items-baseline justify-center">
                        <Text className="text-gray-500 text-2xl">{getCurrencySymbol()}</Text>
                        <Text className="text-black text-5xl font-medium">
                          {Math.floor(
                            budgetSummary.totalBudget - budgetSummary.totalSpent > 0 ? budgetSummary.totalBudget - budgetSummary.totalSpent : 0
                          )}
                        </Text>
                        <Text className="text-black text-2xl font-normal">
                          ,{(budgetSummary.totalBudget - budgetSummary.totalSpent > 0 ? budgetSummary.totalBudget - budgetSummary.totalSpent : 0 % 1).toFixed(2).substring(2)}
                        </Text>
                      </View>
                      <Text className="text-gray-500 text-sm text-center">
                        ancora a disposizione per questo mese
                      </Text>
                    </Animated.View>
                  )}

                  {/* Progress bar */}
                  {budgetSummary && (
                    <Animated.View
                      entering={FadeIn.delay(400).duration(600)}
                      className="mb-2"
                    >
                      <View className="h-3 bg-white rounded-full w-full overflow-hidden">
                        {/* Colored segments - would need to calculate width percentages based on category spending */}
                        {budgetSettings &&
                          budgetSettings
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            .filter((budget: any) => {
                              const cat = macroCategories?.find(c => c.id === budget.macroCategoryId);
                              return cat && cat.type === 'EXPENSE';
                            })
                            // dobbiamo effetturare un sort per quanto in percentuale influisca sul totale
                            .sort((a, b) => {
                              const spentA = getCategorySpending(a.macroCategoryId);
                              const spentB = getCategorySpending(b.macroCategoryId);
                              return spentB - spentA;
                            })
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            .map((budget: any) => {
                              const category = macroCategories?.find(cat => cat.id === budget.macroCategoryId);
                              if (!category) return null;

                              const spent = getCategorySpending(budget.macroCategoryId);
                              const percentage = (spent / budgetSummary.totalBudget) * 100;

                              return (
                                <View
                                  key={budget.id}
                                  style={{
                                    position: 'absolute',
                                    width: `${percentage}%`,
                                    height: '100%',
                                    backgroundColor: category.color
                                  }}
                                />
                              );
                            })}
                      </View>
                      <Text className="text-gray-500 text-xs mt-2">
                        Hai speso {formatCurrency(budgetSummary.totalSpent)} su {formatCurrency(budgetSummary.totalBudget)}
                      </Text>
                    </Animated.View>
                  )}
                </Animated.View>

                {/* Budget Categories */}
                <View className="mt-4">
                  {budgetSettings &&
                    budgetSettings
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      .filter((budget: any) => {
                        const cat = macroCategories?.find(c => c.id === budget.macroCategoryId);
                        return cat && cat.type === 'EXPENSE';
                      })
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      .map((budget: any, index: number) => {
                        const category = macroCategories?.find(cat => cat.id === budget.macroCategoryId);
                        if (!category) return null;

                        const spending = getCategorySpending(budget.macroCategoryId);

                        return (
                          <BudgetItem
                            key={budget.id}
                            budget={budget}
                            category={category}
                            spending={spending}
                            onPress={() => handleBudgetClick(budget.macroCategoryId)}
                            index={index}
                            formatCurrency={formatCurrency}
                          />
                        );
                      })}
                </View>
              </Animated.View>
            </ScrollView>
          ) : (
            // Fallback state
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500">Caricamento...</Text>
            </View>
          )}
        </SafeAreaView>
      </HeaderContainer>

      {/* Budget Bottom Sheet */}
      <BudgetBottomSheet
        bottomSheetRef={bottomSheetRef as RefObject<BottomSheet>}
        snapPoints={snapPoints}
        renderBackdrop={renderBackdrop}
        handleClosePress={handleCloseBottomSheet}
      />
    </>
  );
} 