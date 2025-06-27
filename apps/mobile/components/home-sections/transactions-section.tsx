import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
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
import { LeftIcon, RightIcon } from '@/components/ui/svg-icons';
import { api } from '@/lib/api';
import { transactionUtils } from '@/lib/mmkv-storage';
import { SwipeableTransactionItem } from '@/components/ui/swipeable-transaction-item';
import { InvalidationUtils } from '@/lib/invalidation-utils';
import * as Haptics from 'expo-haptics';
import { useCurrency } from '@/hooks/use-currency';
import { useMonth } from '@/context/month-context';
import { useTranslation } from 'react-i18next';

interface TransactionGroup {
  date: string;
  dayName: string;
  transactions: TransactionItem[];
  dailyTotal: number;
}

interface TransactionItem {
  id: string;
  amount: number;
  description: string;
  date: Date;
  category?: {
    name: string;
    icon: string;
    color: string;
  };
  subCategory?: {
    name: string;
  };
  type: 'income' | 'expense';
}

// FlatList item types
interface FlatListHeader {
  type: 'header';
  id: string;
  date: string;
  dayName: string;
  dailyTotal: number;
  groupIndex: number;
}

interface FlatListTransaction {
  type: 'transaction';
  id: string;
  data: TransactionItem;
  groupIndex: number;
  transactionIndex: number;
}

type FlatListItem = FlatListHeader | FlatListTransaction;

// Loading skeleton component for transactions
const TransactionLoadingSkeleton = ({ dailyGroupsCount = 3 }: { dailyGroupsCount?: number }) => {
  const shimmerOpacity = useSharedValue(0.3);

  useEffect(() => {
    const animate = () => {
      shimmerOpacity.value = withTiming(1, { duration: 1000 }, () => {
        shimmerOpacity.value = withTiming(0.3, { duration: 1000 }, () => {
          runOnJS(animate)();
        });
      });
    };
    animate();
  }, [shimmerOpacity]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  // Use cached count if available, otherwise use default
  const skeletonGroups = Array.from({
    length: Math.max(1, dailyGroupsCount || 3)
  }, (_, index) => index);

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="flex-1 px-4 pt-2 pb-6"
    >
      {/* Summary Card Skeleton */}
      <Animated.View
        entering={FadeInDown.duration(500)}
        className="bg-gray-50 rounded-3xl p-4 mb-4"
      >
        {/* Month selector skeleton */}
        <View className="flex-row items-center justify-between mb-2">
          <Animated.View style={shimmerStyle} className="bg-gray-200 rounded w-8 h-8" />
          <Animated.View style={shimmerStyle} className="bg-gray-200 rounded h-4 w-24" />
          <Animated.View style={shimmerStyle} className="bg-gray-200 rounded w-8 h-8" />
        </View>

        {/* Summary values skeleton */}
        <View className="flex-row justify-between mt-2">
          {[1, 2, 3].map((index) => (
            <View key={index} className="flex-1 items-center">
              <Animated.View style={shimmerStyle} className="bg-gray-200 rounded h-3 w-12 mb-1" />
              <Animated.View style={shimmerStyle} className="bg-gray-200 rounded h-4 w-16" />
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Daily Groups Skeleton */}
      {skeletonGroups.map((groupIndex) => (
        <Animated.View
          key={groupIndex}
          entering={FadeInDown.delay(groupIndex * 150 + 200).duration(500)}
          className="border-b border-gray-200 pb-1 mb-1"
        >
          {/* Day header skeleton */}
          <View className="flex-row justify-between items-center py-1 mb-2">
            <Animated.View style={shimmerStyle} className="bg-gray-200 rounded h-3 w-24" />
            <Animated.View style={shimmerStyle} className="bg-gray-200 rounded h-4 w-20" />
          </View>

          {/* Transaction items skeleton (2-4 per group for more realistic look) */}
          {Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, itemIndex) => (
            <Animated.View
              key={itemIndex}
              entering={FadeInDown.delay(groupIndex * 150 + itemIndex * 75 + 300).duration(400)}
              className="flex-row items-center py-2 gap-3"
            >
              {/* Category icon skeleton */}
              <Animated.View style={shimmerStyle} className="w-8 h-8 bg-gray-300 rounded-lg" />

              {/* Transaction details skeleton */}
              <View className="flex-1">
                <Animated.View
                  style={[shimmerStyle, { width: Math.floor(Math.random() * 100) + 120 }]}
                  className="bg-gray-300 rounded h-4 mb-1"
                />
                <Animated.View
                  style={[shimmerStyle, { width: Math.floor(Math.random() * 60) + 80 }]}
                  className="bg-gray-300 rounded h-3"
                />
              </View>

              {/* Amount skeleton */}
              <Animated.View
                style={[shimmerStyle, { width: Math.floor(Math.random() * 20) + 60 }]}
                className="bg-gray-300 rounded h-4"
              />
            </Animated.View>
          ))}
        </Animated.View>
      ))}

      {/* Show more skeleton groups to fill the screen */}
      <Animated.View
        entering={FadeInDown.delay(skeletonGroups.length * 150 + 400).duration(300)}
        className="pt-4"
      >
        <Animated.View style={shimmerStyle} className="bg-gray-200 rounded h-3 w-32 mx-auto" />
      </Animated.View>
    </Animated.View>
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

  const lastMonth = new Date().getMonth() + 1


  return (
    <View className="flex-row items-center justify-between">
      <TouchableOpacity
        onPress={goToPreviousMonth}
        className="w-10 h-10 items-center justify-center"
      >
        <LeftIcon size={14} className="text-black" />
      </TouchableOpacity>

      <Text className="text-sm font-normal text-center" style={{ fontFamily: 'DM Sans' }}>
        {monthNames[currentMonth - 1]} {currentYear}
      </Text>

      <TouchableOpacity
        onPress={goToNextMonth}
        disabled={currentMonth === lastMonth}
        className={`w-10 h-10 items-center justify-center ${currentMonth === lastMonth ? 'opacity-50' : ''}`}
      >
        <RightIcon size={14} className={`text-black ${currentMonth === lastMonth ? 'text-gray-400' : 'text-black'}`} />
      </TouchableOpacity>
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
          <Text className="text-sm font-medium text-gray-500" style={{ fontFamily: 'DM Sans' }}>
            {t('home.transactions.income')}
          </Text>
          <Text className="text-base font-medium text-gray-700" style={{ fontFamily: 'Apfel Grotezk' }}>
            {formatCurrency(income)}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="text-sm font-medium text-gray-500" style={{ fontFamily: 'DM Sans' }}>
            {t('home.transactions.expenses')}
          </Text>
          <Text className="text-base font-medium text-gray-700" style={{ fontFamily: 'Apfel Grotezk' }}>
            {formatCurrency(expenses)}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="text-sm font-medium text-gray-500" style={{ fontFamily: 'DM Sans' }}>
            {t('home.transactions.remaining')}
          </Text>
          <Text className="text-base font-medium text-black" style={{ fontFamily: 'Apfel Grotezk' }}>
            {formatCurrency(remaining)}
          </Text>
        </View>
      </View>
    </View>
  );
};





// Convert grouped transactions to flat list format
const convertToFlatListData = (groupedTransactions: TransactionGroup[]): FlatListItem[] => {
  const flatData: FlatListItem[] = [];

  groupedTransactions.forEach((group, groupIndex) => {
    // Add group header
    flatData.push({
      type: 'header',
      id: `header-${group.date}`,
      date: group.date,
      dayName: group.dayName,
      dailyTotal: group.dailyTotal,
      groupIndex,
    });

    // Add transactions
    group.transactions.forEach((transaction, transactionIndex) => {
      flatData.push({
        type: 'transaction',
        id: `transaction-${transaction.id}`,
        data: transaction,
        groupIndex,
        transactionIndex,
      });
    });
  });

  return flatData;
};

// Header component for FlatList
const FlatListHeaderComponent: React.FC<{
  item: FlatListHeader;
  formatCurrency: (amount: number | string, options?: { showSymbol?: boolean; showSign?: boolean; decimals?: number; }) => string;
}> = ({ item, formatCurrency }) => {
  const isPositive = item.dailyTotal > 0;

  return (
    <Animated.View
      entering={FadeInDown.delay(item.groupIndex * 100).duration(500).springify()}
      exiting={FadeOutUp.duration(300)}
      layout={Layout.springify().damping(15).stiffness(100)}
      className="border-b border-gray-200 pb-1 mb-1"
    >
      <View className="flex-row justify-between items-center py-1">
        <Text className="text-sm font-normal text-gray-500" style={{ fontFamily: 'DM Sans' }}>
          {item.dayName}
        </Text>
        <Text
          className={`text-base font-medium ${isPositive ? 'text-gray-500' : 'text-gray-500'}`}
          style={{ fontFamily: 'Apfel Grotezk' }}
        >
          {formatCurrency(item.dailyTotal, { showSign: true })}
        </Text>
      </View>
    </Animated.View>
  );
};

// Transaction component for FlatList
const FlatListTransactionComponent: React.FC<{
  item: FlatListTransaction;
  onDelete: (transactionId: string) => void;
}> = ({ item, onDelete }) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(item.groupIndex * 100 + item.transactionIndex * 50).duration(400).springify()}
      exiting={FadeOutUp.duration(300)}
      layout={Layout.springify().damping(15).stiffness(100)}
    >
      <SwipeableTransactionItem
        transaction={item.data}
        onDelete={onDelete}
      />
    </Animated.View>
  );
};



export const TransactionsSection: React.FC = () => {
  // Use shared month context
  const { currentMonth, currentYear, handleMonthChange } = useMonth();

  // Currency hook
  const { formatCurrency } = useCurrency();

  // Translation hook
  const { t } = useTranslation();

  // Cache state
  const [cachedDailyGroupsCount, setCachedDailyGroupsCount] = useState<number>(0);

  // Animation values
  const contentOpacity = useSharedValue(0);
  const summaryScale = useSharedValue(0.9);

  // API utils for invalidation
  const utils = api.useContext();

  // Query for monthly transactions
  const { data: transactions, isLoading, error, refetch } = api.transaction.getMonthlySpending.useQuery({
    month: currentMonth,
    year: currentYear,
  });

  // Delete mutation with comprehensive invalidations
  const deleteMutation = api.transaction.delete.useMutation({
    onSuccess: async () => {
      console.log('🗑️ [TransactionsSection] Transaction deleted, starting comprehensive refresh...');

      // Haptic feedback for successful delete
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Small delay to ensure server has processed the deletion
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use comprehensive invalidation utility with forced refetch
      try {
        await InvalidationUtils.invalidateTransactionRelatedQueries(utils, {
          currentMonth,
          currentYear,
          clearCache: true,
          forceRefetch: true,
        });

        // Additional explicit refetch of current component's query
        console.log('🔄 [TransactionsSection] Explicitly refetching component query...');
        await refetch();

        console.log('✅ [TransactionsSection] All refresh operations completed');

      } catch (error) {
        console.warn('❌ [TransactionsSection] Some queries failed to invalidate:', error);
        // Fallback: force refetch our local query even if others fail
        try {
          console.log('🔄 [TransactionsSection] Attempting fallback refetch...');
          await refetch();
        } catch (refetchError) {
          console.error('❌ [TransactionsSection] Even local refetch failed:', refetchError);
        }
      }
    },
    onError: (error) => {
      console.error('❌ Failed to delete transaction:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  // Initialize cache data on component mount
  useEffect(() => {
    const cachedCount = transactionUtils.getDailyGroupsCountFromCache(currentMonth, currentYear);
    setCachedDailyGroupsCount(cachedCount);
  }, [currentMonth, currentYear]);

  // Update cache when new data loads
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      transactionUtils.setTransactionCacheData(transactions, currentMonth, currentYear);

      // Update local cache state
      const dailyGroupsCount = transactionUtils.getDailyGroupsCountFromCache(currentMonth, currentYear);
      setCachedDailyGroupsCount(dailyGroupsCount);
    }
  }, [transactions, currentMonth, currentYear]);

  // Animate content when data loads
  useEffect(() => {
    if (!isLoading) {
      contentOpacity.value = withTiming(1, { duration: 600 });
      summaryScale.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [isLoading, contentOpacity, summaryScale]);

  // Memoized delete handler
  const handleDeleteTransaction = useCallback(async (transactionId: string) => {
    try {
      await deleteMutation.mutateAsync({ transactionId });
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  }, [deleteMutation]);

  // Memoized refresh handler
  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
  }, [refetch]);

  // Memoized format day name function
  const formatDayName = useCallback((date: Date): string => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return t('home.transactions.today');
    }

    const dayNames = [
      t('home.transactions.days.sun'), t('home.transactions.days.mon'),
      t('home.transactions.days.tue'), t('home.transactions.days.wed'),
      t('home.transactions.days.thu'), t('home.transactions.days.fri'),
      t('home.transactions.days.sat')
    ];
    const monthNames = [
      t('home.transactions.monthsAbbr.jan'), t('home.transactions.monthsAbbr.feb'),
      t('home.transactions.monthsAbbr.mar'), t('home.transactions.monthsAbbr.apr'),
      t('home.transactions.monthsAbbr.may'), t('home.transactions.monthsAbbr.jun'),
      t('home.transactions.monthsAbbr.jul'), t('home.transactions.monthsAbbr.aug'),
      t('home.transactions.monthsAbbr.sep'), t('home.transactions.monthsAbbr.oct'),
      t('home.transactions.monthsAbbr.nov'), t('home.transactions.monthsAbbr.dec')
    ];

    return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
  }, [t]);

  // Process and group transactions by day, then convert to FlatList format
  const { summary, flatListData } = useMemo(() => {
    if (!transactions) {
      return {
        summary: { income: 0, expenses: 0, remaining: 0 },
        flatListData: []
      };
    }

    // Filter out transactions with invalid dates and log issues for debugging
    const validTransactions = transactions.filter(transaction => {
      const isValid = transaction.date &&
        typeof transaction.date !== 'undefined' &&
        (transaction.date instanceof Date || typeof transaction.date === 'string' || typeof transaction.date === 'object');

      if (!isValid) {
        console.warn('Transaction with invalid date found:', {
          id: transaction.id,
          date: transaction.date,
          description: transaction.description
        });
      }

      return isValid;
    });

    // Calculate summary - convert Decimal to number
    const income = validTransactions
      .filter(t => Number(t.amount) > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = Math.abs(validTransactions
      .filter(t => Number(t.amount) < 0)
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0));

    const remaining = income - expenses;

    // Group by date
    const grouped = validTransactions.reduce((acc, transaction) => {
      // Safely convert date to Date object
      let dateObj: Date;
      try {
        // Simple approach: try to create a Date from whatever we have
        dateObj = new Date(transaction.date as string | number | Date);

        // Validate the date is actually valid
        if (isNaN(dateObj.getTime())) {
          // If invalid, fallback to current date
          dateObj = new Date();
        }
      } catch {
        // If any error occurs during conversion, fallback to current date
        dateObj = new Date();
      }

      const date = dateObj.toISOString().split('T')[0];

      if (!acc[date]) {
        acc[date] = {
          date,
          dayName: formatDayName(dateObj),
          transactions: [],
          dailyTotal: 0,
        };
      }

      const amount = Number(transaction.amount);
      const transformedTransaction: TransactionItem = {
        id: transaction.id,
        amount: amount,
        description: transaction.description,
        date: dateObj, // Use the safely converted date object
        type: amount > 0 ? 'income' : 'expense',
        category: transaction.subCategory?.macroCategory ? {
          name: transaction.subCategory.macroCategory.name,
          icon: transaction.subCategory.macroCategory.icon,
          color: transaction.subCategory.macroCategory.color,
        } : undefined,
        subCategory: transaction.subCategory ? {
          name: transaction.subCategory.name,
        } : undefined,
      };

      acc[date].transactions.push(transformedTransaction);
      acc[date].dailyTotal += amount;

      return acc;
    }, {} as Record<string, TransactionGroup>);

    // Convert to array and sort by date (newest first)
    const groupedArray = Object.values(grouped).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const flatListData = convertToFlatListData(groupedArray);

    return {
      summary: { income, expenses, remaining },
      flatListData
    };
  }, [transactions, formatDayName]);

  // Memoized month change handler with animation
  const handleMonthChangeWithAnimation = useCallback((month: number, year: number) => {
    // Use shared context handler with animation support
    handleMonthChange(month, year, summaryScale);
  }, [handleMonthChange, summaryScale]);

  // Memoized FlatList render item function
  const renderItem = useCallback(({ item }: { item: FlatListItem }) => {
    if (item.type === 'header') {
      return <FlatListHeaderComponent item={item} formatCurrency={formatCurrency} />;
    } else {
      return <FlatListTransactionComponent item={item} onDelete={handleDeleteTransaction} />;
    }
  }, [formatCurrency, handleDeleteTransaction]);

  // Memoized FlatList key extractor
  const keyExtractor = useCallback((item: FlatListItem) => item.id, []);

  // Memoized animated styles
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const summaryStyle = useAnimatedStyle(() => ({
    transform: [{ scale: summaryScale.value }],
  }));

  // Determine loading states - Always show skeleton during loading for immediate feedback
  const isInitialLoading = isLoading;
  const shouldShowSkeleton = isInitialLoading;
  const shouldShowEmptyState = !isInitialLoading && (!transactions || transactions.length === 0);
  const shouldShowContent = !isInitialLoading && transactions && transactions.length > 0;

  // ALL CONDITIONAL RENDERING MOVED TO THE END AFTER ALL HOOKS
  // This prevents the "Rendered fewer hooks than expected" error

  if (shouldShowSkeleton) {
    return <TransactionLoadingSkeleton dailyGroupsCount={cachedDailyGroupsCount} />;
  }

  if (error) {
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        className="flex-1 p-4"
      >
        <Text className="text-center text-red-500">Errore nel caricamento delle transazioni</Text>
      </Animated.View>
    );
  }

  if (!shouldShowContent && !shouldShowEmptyState) {
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        className="flex-1 p-4 justify-center items-center"
      >
        <Text className="text-center text-gray-500">Caricamento...</Text>
      </Animated.View>
    );
  }

  // Always show the main layout with SummaryContainer (includes MonthSelector)
  // This ensures month navigation is always available, even when no transactions exist
  return (
    <Animated.View style={contentStyle} className="flex-1 px-4 pt-2 pb-6">
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

      {shouldShowEmptyState || flatListData.length === 0 ? (
        <Animated.View
          entering={FadeIn.delay(300).duration(600)}
          className="items-center justify-center py-12 flex-1"
        >
          <Text className="text-gray-500 text-center" style={{ fontFamily: 'DM Sans' }}>
            Nessuna transazione per questo mese.
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={flatListData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 96 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor="#007AFF"
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
          getItemLayout={(data, index) => ({
            length: 60, // Approximate item height
            offset: 60 * index,
            index,
          })}
        />
      )}
    </Animated.View>
  );
}; 