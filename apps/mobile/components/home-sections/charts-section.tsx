import React, { useState } from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { LeftIcon, RightIcon, DownIcon, UpIcon } from '@/components/ui/svg-icons';
import { DonutChart, HeatmapCalendar } from '@/components/charts';
import type { CategoryData, SubCategoryBreakdown, CalendarDay } from '@/types/charts';
import { api } from '@/lib/api';
import { useRouter } from 'expo-router';



const MonthSelector: React.FC<{
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}> = ({ currentMonth, currentYear, onMonthChange }) => {
  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
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

  const lastMonth = new Date().getMonth() + 1;

  return (
    <View className="flex-row items-center justify-between">
      <View
        onTouchEnd={goToPreviousMonth}
        className="w-10 h-10 items-center justify-center"
      >
        <LeftIcon size={14} className="text-black" />
      </View>

      <Text className="text-sm font-normal text-center" style={{ fontFamily: 'DM Sans' }}>
        {monthNames[currentMonth - 1]} {currentYear}
      </Text>

      <Pressable
        onPress={goToNextMonth}
        disabled={currentMonth === lastMonth}
        className={`w-10 h-10 items-center justify-center ${currentMonth === lastMonth ? 'opacity-50' : ''}`}
      >
        <RightIcon size={14} className={`text-black ${currentMonth === lastMonth ? 'text-gray-400' : 'text-black'}`} />
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
}> = ({ income, expenses, remaining, currentMonth, currentYear, onMonthChange }) => {
  return (
    <View className="bg-gray-50 rounded-3xl p-4 mb-4">
      <MonthSelector
        currentMonth={currentMonth}
        currentYear={currentYear}
        onMonthChange={onMonthChange}
      />

      <View className="flex-row justify-between mt-2">
        <View className="flex-1 items-center">
          <Text className="text-sm font-medium text-gray-500" style={{ fontFamily: 'DM Sans' }}>
            Entrate
          </Text>
          <Text className="text-base font-medium text-gray-700" style={{ fontFamily: 'Apfel Grotezk' }}>
            € {income.toFixed(2)}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="text-sm font-medium text-gray-500" style={{ fontFamily: 'DM Sans' }}>
            Uscite
          </Text>
          <Text className="text-base font-medium text-gray-700" style={{ fontFamily: 'Apfel Grotezk' }}>
            € {expenses.toFixed(2)}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="text-sm font-medium text-gray-500" style={{ fontFamily: 'DM Sans' }}>
            Rimanente
          </Text>
          <Text className="text-base font-medium text-black" style={{ fontFamily: 'Apfel Grotezk' }}>
            € {remaining.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const SubCategoryItem: React.FC<{ subCategory: SubCategoryBreakdown }> = ({ subCategory }) => {
  return (
    <View className="flex-row items-center justify-between py-2 pl-6 pr-4">
      {/* Sub-category info */}
      <View className="flex-row items-center flex-1 gap-3">
        <Text
          className="text-sm font-normal text-gray-600"
          style={{ fontFamily: 'DM Sans' }}
        >
          {subCategory.icon} {subCategory.name}
        </Text>
      </View>

      {/* Amount and percentage */}
      <View className="flex-row items-center gap-4">
        <Text
          className="text-gray-500 text-sm"
          style={{ fontFamily: 'Apfel Grotezk' }}
        >
          {subCategory.percentage}%
        </Text>

        <Text
          className="text-gray-600 text-sm"
          style={{ fontFamily: 'Apfel Grotezk' }}
        >
          € {subCategory.amount.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const CategoryLegendItem: React.FC<{
  category: CategoryData;
  isExpanded: boolean;
  subCategories?: SubCategoryBreakdown[];
  isLoadingSubCategories?: boolean;
  onToggleExpand: () => void;
  onCategoryPress: (categoryId: string) => void;
}> = ({ category, isExpanded, subCategories, isLoadingSubCategories, onToggleExpand, onCategoryPress }) => {
  return (
    <View className="flex-col">
      {/* Main category row */}
      <View className="flex-row items-center justify-between py-2">
        {/* Clickable area for navigation (most of the row) */}
        <TouchableOpacity
          onPress={() => onCategoryPress(category.id)}
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
              className="text-sm font-semibold"
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
            className="text-gray-500 text-base"
            style={{ fontFamily: 'Apfel Grotezk' }}
          >
            {category.percentage}%
          </Text>

          <Text
            className="text-black text-base font-medium"
            style={{ fontFamily: 'Apfel Grotezk' }}
          >
            € {category.amount.toFixed(2)}
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
        <View className="flex-col">
          {isLoadingSubCategories ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#6B7280" />
            </View>
          ) : subCategories && subCategories.length > 0 ? (
            <>
              {subCategories.map((subCategory) => (
                <SubCategoryItem
                  key={subCategory.id}
                  subCategory={subCategory}
                />
              ))}
              {/* Separator line */}
              <View className="h-px bg-gray-200 mx-4 mt-2 mb-2" />
            </>
          ) : (
            <View className="py-4 pl-6">
              <Text className="text-gray-400 text-sm" style={{ fontFamily: 'DM Sans' }}>
                Nessuna sottocategoria trovata
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export const ChartsSection: React.FC = () => {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

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

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
    setExpandedCategoryId(null); // Reset expansion when month changes
  };

  const handleToggleExpand = (categoryId: string) => {
    setExpandedCategoryId(expandedCategoryId === categoryId ? null : categoryId);
  };

  const handleDayPress = (day: CalendarDay) => {
    const dateString = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.day.toString().padStart(2, '0')}`;
    router.push(`/(protected)/(home)/(daily-transactions)/${dateString}`);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/(protected)/(home)/(category-transactions)/${categoryId}`);
  };

  // Show loading state (only for critical data)
  if (isSummaryLoading || isCategoryLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-2 text-gray-500" style={{ fontFamily: 'DM Sans' }}>
          Caricamento dati...
        </Text>
      </View>
    );
  }

  // Handle no data case
  const summary = summaryData || { income: 0, expenses: 0, remaining: 0 };
  const categories: CategoryData[] = categoryData?.categories || [];
  const totalExpenses = categoryData?.totalAmount || 0;


  return (
    <ScrollView className="flex-1 p-4 pb-24 bg-white" showsVerticalScrollIndicator={false}>
      {/* Summary Container */}
      <SummaryContainer
        income={summary.income}
        expenses={summary.expenses}
        remaining={summary.remaining}
        currentMonth={currentMonth}
        currentYear={currentYear}
        onMonthChange={handleMonthChange}
      />

      {/* Charts & Analysis Section */}
      <View className="flex-col gap-10">
        {/* Chart and Legend Row */}
        <View className="flex-col gap-4">
          {/* Donut Chart */}
          <View className="items-center">
            <DonutChart
              data={categories}
              totalAmount={totalExpenses}
              size={350}
              strokeWidth={50}
              showLabels={false}
            />
          </View>

          {/* Category Legend */}
          <View className="flex-col gap-1">
            {categories.length > 0 ? (
              categories.map((category) => (
                <CategoryLegendItem
                  key={category.id}
                  category={category}
                  isExpanded={expandedCategoryId === category.id}
                  subCategories={expandedCategoryId === category.id ? subCategoryData?.subCategories : undefined}
                  isLoadingSubCategories={expandedCategoryId === category.id ? isSubCategoryLoading : false}
                  onToggleExpand={() => handleToggleExpand(category.id)}
                  onCategoryPress={handleCategoryPress}
                />
              ))
            ) : (
              <View className="py-8 items-center">
                <Text className="text-gray-500" style={{ fontFamily: 'DM Sans' }}>
                  Nessuna spesa registrata questo mese
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Heatmap Calendar */}
        <View className="bg-gray-50 rounded-xl p-4">
          {isDailySpendingLoading ? (
            <View className="h-40 items-center justify-center">
              <ActivityIndicator size="small" color="#6B7280" />
              <Text className="mt-2 text-gray-500" style={{ fontFamily: 'DM Sans' }}>
                Caricamento calendario...
              </Text>
            </View>
          ) : (
            <HeatmapCalendar
              data={dailySpendingData?.dailySpending || []}
              month={currentMonth}
              year={currentYear}
              onDayPress={handleDayPress}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}; 