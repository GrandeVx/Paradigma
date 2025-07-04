import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOutUp,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { LeftIcon, RightIcon, DownIcon, UpIcon } from '@/components/ui/svg-icons';
import { DonutChart, HeatmapCalendar } from '@/components/charts';
import type { CategoryData, SubCategoryBreakdown, CalendarDay } from '@/types/charts';
import { api } from '@/lib/api';
import { useRouter } from 'expo-router';
import { chartsUtils } from '@/lib/mmkv-storage';
import { useCurrency } from '@/hooks/use-currency';
import { useMonth } from '@/context/month-context';
import { useTranslation } from 'react-i18next';

// Loading skeleton for charts section
const ChartsLoadingSkeleton = ({ categoriesCount = 4 }: { categoriesCount?: number }) => {
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

  const skeletonCategories = Array.from({ length: Math.max(1, categoriesCount) }, (_, index) => index);

  return (
    <ScrollView className="flex-1 p-4 pb-48 bg-white" showsVerticalScrollIndicator={false}>
      {/* Summary skeleton */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={shimmerStyle}
        className="bg-gray-200 rounded-3xl h-24 mb-4"
      />

      {/* Chart skeleton */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        className="items-center mb-4"
      >
        <Animated.View
          style={shimmerStyle}
          className="w-80 h-80 bg-gray-200 rounded-full"
        />
      </Animated.View>

      {/* Categories skeleton */}
      <View className="flex-col gap-1">
        {skeletonCategories.map((index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(200 + index * 100).duration(400)}
            style={shimmerStyle}
            className="flex-row items-center justify-between py-3"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-2 h-2 bg-gray-300 rounded-full" />
              <View className="bg-gray-300 rounded h-4 w-20" />
            </View>
            <View className="flex-row items-center gap-4">
              <View className="bg-gray-300 rounded h-4 w-12" />
              <View className="bg-gray-300 rounded h-4 w-16" />
              <View className="w-8 h-8 bg-gray-300 rounded" />
            </View>
          </Animated.View>
        ))}
      </View>

      {/* Heatmap skeleton */}
      <Animated.View
        entering={FadeInDown.delay(600).duration(400)}
        className="bg-gray-50 rounded-xl p-4 mt-10"
      >
        <Animated.View
          style={shimmerStyle}
          className="bg-gray-200 rounded h-40 w-full"
        />
      </Animated.View>
    </ScrollView>
  );
};

const MonthSelector: React.FC<{
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}> = ({ currentMonth, currentYear, onMonthChange }) => {
  const { t } = useTranslation();

  const monthNames = [
    t('home.transactions.months.january'), t('home.transactions.months.february'),
    t('home.transactions.months.march'), t('home.transactions.months.april'),
    t('home.transactions.months.may'), t('home.transactions.months.june'),
    t('home.transactions.months.july'), t('home.transactions.months.august'),
    t('home.transactions.months.september'), t('home.transactions.months.october'),
    t('home.transactions.months.november'), t('home.transactions.months.december')
  ];

  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      onMonthChange(12, currentYear - 1);
    } else {
      onMonthChange(currentMonth - 1, currentYear);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      onMonthChange(1, currentYear + 1);
    } else {
      onMonthChange(currentMonth + 1, currentYear);
    }
  };

  return (
    <View className="flex-row items-center justify-between">
      <View
        onTouchEnd={goToPreviousMonth}
        className="w-10 h-10 items-center justify-center"
      >
        <LeftIcon size={14} className="text-black" />
      </View>

      <Text className="font-normal text-center" style={{ fontFamily: 'DM Sans', fontSize: 14 }}>
        {monthNames[currentMonth - 1]} {currentYear}
      </Text>

      <Pressable
        onPress={goToNextMonth}
        className="w-10 h-10 items-center justify-center"
      >
        <RightIcon size={14} className="text-black" />
      </Pressable>
    </View>
  );
};

const SummaryContainer: React.FC<{
  income: number;
  expenses: number;
  remaining: number;
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
  formatCurrency: (amount: number | string, options?: { showSymbol?: boolean; showSign?: boolean; decimals?: number; }) => string;
}> = ({ income, expenses, remaining, currentMonth, currentYear, onMonthChange, formatCurrency }) => {
  const { t } = useTranslation();

  return (
    <View className="bg-gray-50 rounded-3xl p-4 mb-4">
      <MonthSelector
        currentMonth={currentMonth}
        currentYear={currentYear}
        onMonthChange={onMonthChange}
      />

      <View className="flex-row justify-between mt-2">
        <View className="flex-1 items-center">
          <Text className="font-medium text-gray-500" style={{ fontFamily: 'DM Sans', fontSize: 14 }}>
            {t('home.transactions.income')}
          </Text>
          <Text className="font-medium text-gray-700" style={{ fontFamily: 'Apfel Grotezk', fontSize: 16 }}>
            {formatCurrency(income)}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="font-medium text-gray-500" style={{ fontFamily: 'DM Sans', fontSize: 14 }}>
            {t('home.transactions.expenses')}
          </Text>
          <Text className="font-medium text-gray-700" style={{ fontFamily: 'Apfel Grotezk', fontSize: 16 }}>
            {formatCurrency(expenses)}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="font-medium text-gray-500" style={{ fontFamily: 'DM Sans', fontSize: 14 }}>
            {t('home.transactions.remaining')}
          </Text>
          <Text className="font-medium text-black" style={{ fontFamily: 'Apfel Grotezk', fontSize: 16 }}>
            {formatCurrency(remaining)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const SubCategoryItem: React.FC<{
  subCategory: SubCategoryBreakdown;
  formatCurrency: (amount: number | string, options?: { showSymbol?: boolean; showSign?: boolean; decimals?: number; }) => string;
}> = ({ subCategory, formatCurrency }) => {
  return (
    <View className="flex-row items-center justify-between py-2 pl-6 pr-4">
      {/* Sub-category info */}
      <View className="flex-row items-center flex-1 gap-3">
        <Text
          className="font-normal text-gray-600"
          style={{ fontFamily: 'DM Sans', fontSize: 14 }}
        >
          {subCategory.icon} {subCategory.name}
        </Text>
      </View>

      {/* Amount and percentage */}
      <View className="flex-row items-center gap-4">
        <Text
          className="text-gray-500"
          style={{ fontFamily: 'Apfel Grotezk', fontSize: 14 }}
        >
          {subCategory.percentage}%
        </Text>

        <Text
          className="text-gray-600"
          style={{ fontFamily: 'Apfel Grotezk', fontSize: 14 }}
        >
          {formatCurrency(subCategory.amount)}
        </Text>
      </View>
    </View>
  );
};

// Animated version of CategoryLegendItem
const AnimatedCategoryLegendItem: React.FC<{
  category: CategoryData;
  index: number;
  isExpanded: boolean;
  subCategories?: SubCategoryBreakdown[];
  isLoadingSubCategories?: boolean;
  onToggleExpand: () => void;
  onCategoryPress: (categoryId: string) => void;
  formatCurrency: (amount: number | string, options?: { showSymbol?: boolean; showSign?: boolean; decimals?: number; }) => string;
}> = ({ category, index, isExpanded, subCategories, isLoadingSubCategories, onToggleExpand, onCategoryPress, formatCurrency }) => {
  const { t } = useTranslation();
  const itemScale = useSharedValue(1);

  const handlePressIn = () => {
    itemScale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    itemScale.value = withSpring(1);
  };

  const itemStyle = useAnimatedStyle(() => ({
    transform: [{ scale: itemScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 100).duration(500).springify()}
      exiting={FadeOutUp.duration(300)}
      layout={Layout.springify().damping(15).stiffness(100)}
      style={itemStyle}
      className="flex-col"
    >
      {/* Main category row */}
      <View className="flex-row items-center justify-between py-2">
        {/* Clickable area for navigation (most of the row) */}
        <TouchableOpacity
          onPress={() => onCategoryPress(category.id)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="flex-row items-center flex-1 gap-3 pr-4"
          activeOpacity={0.7}
        >
          {/* Color indicator */}
          <View
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: category.color }}
          />

          {/* Category badge */}
          <View
            className="flex-row items-center rounded-xl px-2 py-1"
            style={{ backgroundColor: 'transparent' }}
          >
            <Text
              className="font-semibold"
              style={{
                fontFamily: 'DM Sans',
                color: category.color
              }}
            >
              {category.name}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Amount, percentage and arrow */}
        <View className="flex-row items-center gap-4">
          <Text
            className="text-gray-500"
            style={{ fontFamily: 'Apfel Grotezk', fontSize: 16 }}
          >
            {category.percentage}%
          </Text>

          <Text
            className="text-black font-medium"
            style={{ fontFamily: 'Apfel Grotezk', fontSize: 16 }}
          >
            {formatCurrency(category.amount)}
          </Text>

          {/* Expand/Collapse arrow - separate touchable area */}
          <TouchableOpacity
            onPress={onToggleExpand}
            className="w-8 h-8 items-center justify-center"
            activeOpacity={0.7}
          >
            {isExpanded ? (
              <UpIcon size={14} className="text-gray-500" />
            ) : (
              <DownIcon size={14} className="text-gray-500" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub-categories (when expanded) */}
      {isExpanded && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          exiting={FadeOutUp.duration(200)}
          className="flex-col"
        >
          {isLoadingSubCategories ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#6B7280" />
            </View>
          ) : subCategories && subCategories.length > 0 ? (
            <>
              {subCategories.map((subCategory, subIndex) => (
                <Animated.View
                  key={subCategory.id}
                  entering={FadeInDown.delay(subIndex * 50).duration(300)}
                >
                  <SubCategoryItem subCategory={subCategory} formatCurrency={formatCurrency} />
                </Animated.View>
              ))}
              {/* Separator line */}
              <View className="h-px bg-gray-200 mx-4 mt-2 mb-2" />
            </>
          ) : (
            <View className="py-4 pl-6">
              <Text className="text-gray-400" style={{ fontFamily: 'DM Sans', fontSize: 14 }}>
                {t('home.charts.noSubcategoriesFound')}
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
};

export const ChartsSection: React.FC = () => {
  const router = useRouter();
  const { formatCurrency } = useCurrency();

  // Use shared month context
  const { currentMonth, currentYear, handleMonthChange } = useMonth();

  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  // Cache state
  const [cachedCategoriesCount, setCachedCategoriesCount] = useState<number>(0);
  const [hasChartsInCache, setHasChartsInCache] = useState<boolean>(false);

  // Animation values
  const contentOpacity = useSharedValue(0);
  const summaryScale = useSharedValue(0.9);

  // Real API calls
  const {
    data: summaryData,
    isLoading: isSummaryLoading
  } = api.transaction.getMonthlySummary.useQuery({
    month: currentMonth,
    year: currentYear,
  });

  const {
    data: categoryData,
    isLoading: isCategoryLoading
  } = api.transaction.getCategoryBreakdown.useQuery({
    month: currentMonth,
    year: currentYear,
    type: 'expense',
  });

  // Sub-category query (only when a category is expanded)
  const {
    data: subCategoryData,
    isLoading: isSubCategoryLoading
  } = api.transaction.getSubCategoryBreakdown.useQuery({
    month: currentMonth,
    year: currentYear,
    macroCategoryId: expandedCategoryId!,
  }, {
    enabled: !!expandedCategoryId,
  });

  // Daily spending query for heatmap
  const {
    data: dailySpendingData,
    isLoading: isDailySpendingLoading
  } = api.transaction.getDailySpending.useQuery({
    month: currentMonth,
    year: currentYear,
  });

  // Initialize cache data on component mount
  useEffect(() => {
    const cachedCount = chartsUtils.getCategoriesCountFromCache(currentMonth, currentYear);
    const hasCache = chartsUtils.hasChartsInCache(currentMonth, currentYear);

    setCachedCategoriesCount(cachedCount);
    setHasChartsInCache(hasCache);
  }, [currentMonth, currentYear]);

  // Update cache when new data loads
  useEffect(() => {
    if (categoryData?.categories && categoryData.categories.length > 0) {
      chartsUtils.setChartsCacheData(
        categoryData.categories,
        !!(dailySpendingData?.dailySpending?.length),
        currentMonth,
        currentYear
      );

      // Update local cache state
      const categoriesCount = chartsUtils.getCategoriesCountFromCache(currentMonth, currentYear);
      setCachedCategoriesCount(categoriesCount);
      setHasChartsInCache(true);
    }
  }, [categoryData, dailySpendingData, currentMonth, currentYear]);

  // Animate content when data loads
  useEffect(() => {
    if (!isSummaryLoading && !isCategoryLoading) {
      contentOpacity.value = withTiming(1, { duration: 600 });
      summaryScale.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [isSummaryLoading, isCategoryLoading, contentOpacity, summaryScale]);

  // Reset expanded category when category data changes (e.g., after transaction deletion)
  useEffect(() => {
    if (expandedCategoryId && categoryData?.categories) {
      // Check if the expanded category still exists in the new data
      const categoryStillExists = categoryData.categories.some(cat => cat.id === expandedCategoryId);
      if (!categoryStillExists) {
        console.log('📊 [ChartsSection] Resetting expanded category after data refresh');
        setExpandedCategoryId(null);
      }
    }
  }, [categoryData, expandedCategoryId]);

  // Memoized month change handler with animation
  const handleMonthChangeWithAnimation = useCallback((month: number, year: number) => {
    // Use shared context handler with animation support
    handleMonthChange(month, year, summaryScale);
    setExpandedCategoryId(null); // Reset expansion when month changes
  }, [handleMonthChange, summaryScale]);

  const handleCategoryPress = useCallback((categoryId: string) => {
    router.push(`/(protected)/(home)/(category-transactions)/${categoryId}`);
  }, [router]);

  const handleToggleExpandMemoized = useCallback((categoryId: string) => {
    setExpandedCategoryId(expandedCategoryId === categoryId ? null : categoryId);
  }, [expandedCategoryId]);

  const handleDayPressMemoized = useCallback((day: CalendarDay) => {
    const dateString = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.day.toString().padStart(2, '0')}`;
    router.push(`/(protected)/(home)/(daily-transactions)/${dateString}`);
  }, [currentYear, currentMonth, router]);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RENDERING
  // This prevents the "Rendered fewer hooks than expected" error
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const summaryStyle = useAnimatedStyle(() => ({
    transform: [{ scale: summaryScale.value }],
  }));

  // Determine loading states
  const isInitialLoading = isSummaryLoading || isCategoryLoading;
  const shouldShowSkeleton = isInitialLoading && hasChartsInCache;
  // Simplified: show empty state when not loading and no data (regardless of cache)
  const shouldShowEmptyState = !isInitialLoading && (!categoryData?.categories || categoryData.categories.length === 0);

  // Handle no data case - prepare data
  const summary = summaryData || { income: 0, expenses: 0, remaining: 0 };
  const categories: CategoryData[] = categoryData?.categories || [];
  const totalExpenses = categoryData?.totalAmount || 0;

  // ALL CONDITIONAL RENDERING MOVED TO THE END AFTER ALL HOOKS
  if (shouldShowSkeleton) {
    return <ChartsLoadingSkeleton categoriesCount={cachedCategoriesCount} />;
  }

  if (shouldShowEmptyState) {
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        className="flex-1 p-4"
      >
        {/* Always show summary container for month navigation */}
        <Animated.View style={summaryStyle}>
          <SummaryContainer
            income={summary.income}
            expenses={summary.expenses}
            remaining={summary.remaining}
            currentMonth={currentMonth}
            currentYear={currentYear}
            onMonthChange={handleMonthChangeWithAnimation}
            formatCurrency={formatCurrency}
          />
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(300).duration(600)}
          className="items-center justify-center flex-1 gap-4 pb-24 px-10"
        >
          {/* Emoji Cards */}
          <View className="flex-row items-center justify-center mb-2" style={{ height: 84 }}>
            <View
              className="absolute right-12 rounded-xl p-4"
              style={{
                backgroundColor: '#FEF6F5',
                transform: [{ rotate: '-8deg' }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 24,
                elevation: 6,
                zIndex: 1
              }}
            >
              <Text className="text-3xl" style={{ fontFamily: 'Apfel Grotezk', fontSize: 32 }}>📊</Text>
            </View>
            <View
              className="rounded-xl p-4"
              style={{
                backgroundColor: '#FFFCF5',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 24,
                elevation: 6,
                zIndex: 3
              }}
            >
              <Text className="text-3xl" style={{ fontFamily: 'Apfel Grotezk', fontSize: 32 }}>📈</Text>
            </View>
            <View
              className="absolute left-12 rounded-xl p-4"
              style={{
                backgroundColor: '#F5FAFF',
                transform: [{ rotate: '8deg' }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 24,
                elevation: 6,
                zIndex: 2
              }}
            >
              <Text className="text-3xl" style={{ fontFamily: 'Apfel Grotezk', fontSize: 32 }}>💹</Text>
            </View>
          </View>

          {/* Main Title */}
          <Text
            className="text-black text-center font-medium"
            style={{ fontFamily: 'DM Sans', fontSize: 16, lineHeight: 24 }}
          >
            Nessun grafico da mostrare
          </Text>

          {/* Subtitle */}
          <Text
            className="text-gray-500 text-center"
            style={{ fontFamily: 'DM Sans', fontSize: 14, lineHeight: 20 }}
          >
            Inizia ad aggiungere spese per vedere i tuoi grafici
          </Text>
        </Animated.View>
      </Animated.View>
    );
  }

  // If loading, show loading state
  if (isInitialLoading) {
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        className="flex-1 items-center justify-center"
      >
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-2 text-gray-500" style={{ fontFamily: 'DM Sans', fontSize: 16 }}>
          Caricamento dati...
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={contentStyle} className="flex-1">
      <ScrollView className="flex-1 p-4  bg-white" showsVerticalScrollIndicator={false}>
        {/* Summary Container */}
        <Animated.View style={summaryStyle}>
          <SummaryContainer
            income={summary.income}
            expenses={summary.expenses}
            remaining={summary.remaining}
            currentMonth={currentMonth}
            currentYear={currentYear}
            onMonthChange={handleMonthChangeWithAnimation}
            formatCurrency={formatCurrency}
          />
        </Animated.View>

        {/* Charts & Analysis Section */}
        <View className="flex-col gap-10">
          {/* Chart and Legend Row */}
          <View className="flex-col gap-4">
            {/* Donut Chart */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(600).springify()}
              className="items-center"
            >
              <DonutChart
                data={categories}
                totalAmount={totalExpenses}
                size={350}
                strokeWidth={50}
                showLabels={false}
              />
            </Animated.View>

            {/* Category Legend */}
            <View className="flex-col gap-1">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <AnimatedCategoryLegendItem
                    key={category.id}
                    category={category}
                    index={index}
                    isExpanded={expandedCategoryId === category.id}
                    subCategories={expandedCategoryId === category.id ? subCategoryData?.subCategories : undefined}
                    isLoadingSubCategories={expandedCategoryId === category.id ? isSubCategoryLoading : false}
                    onToggleExpand={() => handleToggleExpandMemoized(category.id)}
                    onCategoryPress={handleCategoryPress}
                    formatCurrency={formatCurrency}
                  />
                ))
              ) : (
                <Animated.View
                  entering={FadeIn.delay(400).duration(600)}
                  className="py-8 items-center gap-4"
                >
                  {/* Emoji Cards */}
                  <View className="flex-row items-center justify-center mb-2" style={{ height: 70 }}>
                    <View
                      className="absolute rounded-xl p-3"
                      style={{
                        backgroundColor: '#FEF6F5',
                        transform: [{ rotate: '-8deg' }],
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 24,
                        elevation: 6,
                        zIndex: 1
                      }}
                    >
                      <Text className="text-2xl" style={{ fontFamily: 'Apfel Grotezk', fontSize: 32 }}>📊</Text>
                    </View>
                    <View
                      className="rounded-xl p-3"
                      style={{
                        backgroundColor: '#FFFCF5',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 24,
                        elevation: 6,
                        zIndex: 3
                      }}
                    >
                      <Text className="text-2xl" style={{ fontFamily: 'Apfel Grotezk', fontSize: 32 }}>📈</Text>
                    </View>
                    <View
                      className="absolute rounded-xl p-3"
                      style={{
                        backgroundColor: '#F5FAFF',
                        transform: [{ rotate: '8deg' }],
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 24,
                        elevation: 6,
                        zIndex: 2
                      }}
                    >
                      <Text className="text-2xl" style={{ fontFamily: 'Apfel Grotezk', fontSize: 32 }}>💹</Text>
                    </View>
                  </View>

                  <Text
                    className="text-gray-500 text-center"
                    style={{ fontFamily: 'DM Sans', fontSize: 16 }}
                  >
                    Nessuna spesa registrata questo mese
                  </Text>
                </Animated.View>
              )}
            </View>
          </View>

          {/* Heatmap Calendar */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(600).springify()}
            className="bg-gray-50 rounded-xl p-4"
          >
            {isDailySpendingLoading ? (
              <View className="h-40 items-center justify-center">
                <ActivityIndicator size="small" color="#6B7280" />
                <Text className="mt-2 text-gray-500" style={{ fontFamily: 'DM Sans', fontSize: 16 }}>
                  Caricamento calendario...
                </Text>
              </View>
            ) : (
              <HeatmapCalendar
                data={dailySpendingData?.dailySpending || []}
                month={currentMonth}
                year={currentYear}
                onDayPress={handleDayPressMemoized}
              />
            )}
          </Animated.View>
          <View className="h-24" />
        </View>
      </ScrollView>
    </Animated.View>
  );
}; 