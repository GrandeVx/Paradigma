import { View, TouchableOpacity, RefreshControl, Pressable } from 'react-native';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Animated, {
  FadeIn,
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
import { FlashList } from '@shopify/flash-list';
import { useLocalizedCategories } from '@/hooks/useLocalizedCategories';

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
    icon: string;
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
  isLast: boolean;
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
        entering={FadeIn.duration(300).withInitialValues({ opacity: 0, transform: [{ translateY: 10 }] })}
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
          entering={FadeIn.delay(groupIndex * 50 + 100).duration(300).withInitialValues({ opacity: 0, transform: [{ translateY: 10 }] })}
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
              entering={FadeIn.delay(groupIndex * 50 + itemIndex * 20 + 150).duration(300).withInitialValues({ opacity: 0, transform: [{ translateY: 8 }] })}
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
        entering={FadeIn.delay(skeletonGroups.length * 50 + 200).duration(300).withInitialValues({ opacity: 0 })}
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

  return (
    <View className="flex-row items-center justify-between">
      <TouchableOpacity
        onPress={goToPreviousMonth}
        className="w-10 h-10 items-center justify-center"
      >
        <LeftIcon size={14} className="text-black" />
      </TouchableOpacity>

      <Text className="text-sm font-normal text-center" style={{ fontFamily: 'DM Sans', fontSize: 14 }}>
        {monthNames[currentMonth - 1]} {currentYear}
      </Text>

      <TouchableOpacity
        onPress={goToNextMonth}
        className="w-10 h-10 items-center justify-center"
      >
        <RightIcon size={14} className="text-black" />
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
          <Text className=" font-medium text-gray-500" style={{ fontFamily: 'DM Sans', fontSize: 14 }}>
            {t('home.transactions.income')}
          </Text>
          <Text className="text-base font-medium text-gray-700" style={{ fontFamily: 'ApfelGrotezkMittel', fontSize: 16 }}>
            {formatCurrency(income, { showSign: false })}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <Text className=" font-medium text-gray-500" style={{ fontFamily: 'DM Sans', fontSize: 14 }}>
            {t('home.transactions.expenses')}
          </Text>
          <Text className="text-base font-medium text-gray-700" style={{ fontFamily: 'ApfelGrotezkMittel', fontSize: 16 }}>
            {formatCurrency(expenses, { showSign: false })}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <Text className=" font-medium text-gray-500" style={{ fontFamily: 'DM Sans', fontSize: 14 }}>
            {t('home.transactions.remaining')}
          </Text>
          <Text className="text-base font-medium text-black" style={{ fontFamily: 'ApfelGrotezkMittel', fontSize: 16 }}>
            {formatCurrency(remaining, { showSign: remaining < 0 })}
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
        isLast: transactionIndex === group.transactions.length - 1,
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
      entering={FadeIn.delay(item.groupIndex * 50).duration(300).withInitialValues({ opacity: 0, transform: [{ translateY: 15 }] })}
      exiting={FadeOutUp.duration(200)}
      layout={Layout.duration(200)}
      className="mb-1"
    >
      <View className="flex-row justify-between items-center py-1">
        <Text className=" font-normal text-gray-500" style={{ fontFamily: 'DM Sans', fontSize: 14 }}>
          {item.dayName}
        </Text>
        <Text
          className={`font-medium ${isPositive ? 'text-gray-400' : 'text-gray-400'}`}
          style={{ fontFamily: 'ApfelGrotezkMittel', fontSize: 16, fontWeight: '800' }}
        >
          {formatCurrency(item.dailyTotal, { showSign: false })}
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
      entering={FadeIn.delay(item.groupIndex * 50 + item.transactionIndex * 20).duration(300).withInitialValues({ opacity: 0, transform: [{ translateY: 10 }] })}
      exiting={FadeOutUp.duration(200)}
      layout={Layout.duration(200)}
      className={item.isLast ? "border-b border-gray-200 pb-1" : ""}
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

  // Check if the current month is in the future
  const now = new Date();
  const currentActualMonth = now.getMonth() + 1;
  const currentActualYear = now.getFullYear();
  const isFutureMonth = currentYear > currentActualYear || (currentYear === currentActualYear && currentMonth > currentActualMonth);

  // Query for current/past months
  const { data: realTransactions, isLoading: isLoadingReal, error: errorReal, refetch: refetchReal } = api.transaction.getMonthlySpending.useQuery({
    month: currentMonth,
    year: currentYear,
  }, {
    enabled: !isFutureMonth, // Only fetch for current/past months
  });

  // Query for future months
  const { data: futureTransactions, isLoading: isLoadingFuture, error: errorFuture, refetch: refetchFuture } = api.transaction.getFutureTransactions.useQuery({
    month: currentMonth,
    year: currentYear,
  }, {
    enabled: isFutureMonth, // Only fetch for future months
  });

  // Combine loading states
  const isLoading = isFutureMonth ? isLoadingFuture : isLoadingReal;
  const error = isFutureMonth ? errorFuture : errorReal;
  const refetch = isFutureMonth ? refetchFuture : refetchReal;

  // Use appropriate data source
  const transactions = isFutureMonth ? futureTransactions : realTransactions;

  // Query for categories to map subcategories to macro categories for invalidation
  const { data: categories } = api.category.list.useQuery({}, {
    staleTime: 1000 * 60 * 30, // 30 minutes - categories change very rarely
    cacheTime: 1000 * 60 * 60 * 24 * 7, // 1 week
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Delete mutation with comprehensive invalidations
  const deleteMutation = api.transaction.delete.useMutation({
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
    // Only cache real transactions, not simulated ones
    if (!isFutureMonth && realTransactions && realTransactions.length > 0) {
      transactionUtils.setTransactionCacheData(realTransactions, currentMonth, currentYear);

      // Update local cache state
      const dailyGroupsCount = transactionUtils.getDailyGroupsCountFromCache(currentMonth, currentYear);
      setCachedDailyGroupsCount(dailyGroupsCount);
    }
  }, [realTransactions, currentMonth, currentYear, isFutureMonth]);

  // Animate content when data loads
  useEffect(() => {
    if (!isLoading) {
      contentOpacity.value = withTiming(1, { duration: 600 });
      summaryScale.value = withSpring(1, {
        damping: 20,
        stiffness: 80,
      });
    }
  }, [isLoading, contentOpacity, summaryScale]);

  // Memoized delete handler
  const handleDeleteTransaction = useCallback(async (transactionId: string) => {
    try {
      // Find the transaction in our current data to get its date before deletion
      const transactionToDelete = transactions?.find(t => t.id === transactionId);
      if (transactionToDelete) {
        // Store transaction data for use in onSuccess
        deleteMutation.mutate({
          transactionId,
          // Pass transaction data through context (we'll modify mutation to handle this)
        }, {
          onSuccess: async () => {
            console.log('🗑️ [TransactionsSection] Transaction deleted, starting comprehensive refresh...');

            // Haptic feedback for successful delete
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // Small delay to ensure server has processed the deletion
            await new Promise(resolve => setTimeout(resolve, 100));

            // Get the month/year of the deleted transaction for proper cache invalidation
            const transactionDate = new Date(transactionToDelete.date);
            const transactionMonth = transactionDate.getMonth() + 1;
            const transactionYear = transactionDate.getFullYear();

            console.log(`🗑️ [TransactionsSection] Invalidating cache for transaction date: ${transactionMonth}/${transactionYear}`);

            // Use comprehensive invalidation utility with forced refetch
            try {
              // Invalidate the month where the transaction was deleted
              await InvalidationUtils.invalidateTransactionRelatedQueries(utils, {
                currentMonth: transactionMonth,
                currentYear: transactionYear,
                clearCache: true,
              });

              // If the deleted transaction is from a different month than currently viewed,
              // also invalidate the current month to ensure consistency
              if (transactionMonth !== currentMonth || transactionYear !== currentYear) {
                console.log(`🔄 [TransactionsSection] Also invalidating current view month: ${currentMonth}/${currentYear}`);
                await InvalidationUtils.invalidateTransactionRelatedQueries(utils, {
                  currentMonth,
                  currentYear,
                  clearCache: true,
                });
              }

              // Additional aggressive invalidation for charts (invalidates both months)
              console.log('📊 [TransactionsSection] Aggressively invalidating chart queries...');
              await InvalidationUtils.invalidateChartsQueries(utils, {
                currentMonth: transactionMonth,
                currentYear: transactionYear,
              });

              // If different month, also invalidate charts for current month
              if (transactionMonth !== currentMonth || transactionYear !== currentYear) {
                await InvalidationUtils.invalidateChartsQueries(utils, {
                  currentMonth,
                  currentYear,
                });
              }

              // Invalidate category-specific queries for the deleted transaction's category
              if (transactionToDelete.subCategoryId && categories) {
                // Find the macro category ID from the subcategory
                const category = categories.find(cat =>
                  cat.subCategories.some(sub => sub.id === transactionToDelete.subCategoryId)
                );

                if (category) {
                  console.log(`🏷️ [TransactionsSection] Invalidating category queries for category: ${category.id}`);
                  await InvalidationUtils.invalidateCategoryQueries(utils, {
                    categoryId: category.id,
                    currentMonth: transactionMonth,
                    currentYear: transactionYear,
                  });

                  // If different month, also invalidate for current month
                  if (transactionMonth !== currentMonth || transactionYear !== currentYear) {
                    await InvalidationUtils.invalidateCategoryQueries(utils, {
                      categoryId: category.id,
                      currentMonth,
                      currentYear,
                    });
                  }
                }
              }

              await refetch();


              // Fire global event to notify other components (like ChartsSection)
              const transactionDeletedEvent = new CustomEvent('transactionDeleted');
              window.dispatchEvent(transactionDeletedEvent);

            } catch (error) {
              // Fallback: force refetch our local query even if others fail
              try {
                await refetch();
              } catch (refetchError) {
              }
            }
          }
        });
      } else {
        await deleteMutation.mutateAsync({ transactionId });
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  }, [deleteMutation, transactions, utils, currentMonth, currentYear, refetch]);

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

  // Get localization hook
  const { translations } = useLocalizedCategories();

  // Process and group transactions by day, then convert to FlatList format
  const { summary, flatListData } = useMemo(() => {
    if (!transactions) {
      return {
        summary: { income: 0, expenses: 0, remaining: 0 },
        flatListData: []
      };
    }

    // Filter out transactions with invalid dates and log issues for debugging
    const validTransactions = transactions.filter((transaction: typeof transactions[0]) => {
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
      .filter((t: typeof transactions[0]) => Number(t.amount) > 0)
      .reduce((sum: number, t: typeof transactions[0]) => sum + Number(t.amount), 0);

    const expenses = Math.abs(validTransactions
      .filter((t: typeof transactions[0]) => Number(t.amount) < 0)
      .reduce((sum: number, t: typeof transactions[0]) => sum + Math.abs(Number(t.amount)), 0));

    const remaining = income - expenses;

    // Group by date
    const grouped = validTransactions.reduce((acc: Record<string, TransactionGroup>, transaction: typeof transactions[0]) => {
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

      // Create date string directly without UTC conversion to avoid timezone issues
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const date = `${year}-${month}-${day}`;

      if (!acc[date]) {
        acc[date] = {
          date,
          dayName: '', // Will be set after grouping is complete
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
          name: transaction.subCategory.macroCategory.key && translations.macro[transaction.subCategory.macroCategory.key]
            ? translations.macro[transaction.subCategory.macroCategory.key]
            : transaction.subCategory.macroCategory.name,
          icon: transaction.subCategory.macroCategory.icon,
          color: transaction.subCategory.macroCategory.color,
        } : undefined,
        subCategory: transaction.subCategory ? {
          name: transaction.subCategory.key && translations.sub[transaction.subCategory.key]
            ? translations.sub[transaction.subCategory.key]
            : transaction.subCategory.name,
          icon: transaction.subCategory.icon,
        } : undefined,
      };

      acc[date].transactions.push(transformedTransaction);
      acc[date].dailyTotal += amount;

      return acc;
    }, {} as Record<string, TransactionGroup>);

    // After grouping is complete, set the dayName for each group based on the group's date key
    // This ensures consistent labeling regardless of transaction insertion order
    Object.values(grouped).forEach(group => {
      const groupDate = new Date(group.date + 'T00:00:00');
      group.dayName = formatDayName(groupDate);
    });

    // Convert to array and sort by date (newest first)
    const groupedArray = Object.values(grouped).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const flatListData = convertToFlatListData(groupedArray);

    return {
      summary: { income, expenses, remaining },
      flatListData
    };
  }, [transactions, formatDayName, translations]);

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

  // Memoized getItemType for better FlashList performance and gesture isolation
  const getItemType = useCallback((item: FlatListItem) => {
    return item.type === 'header' ? 'header' : 'transaction';
  }, []);

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
        <View className="flex-1 justify-center items-center">
          <Text className="text-center text-red-500" style={{ fontFamily: 'DM Sans', fontSize: 16 }}>{t('home.transactions.error')}</Text>
          <Pressable onPress={() => {
            refetch();
          }}>
            <Text className="text-center text-primary-500" style={{ fontFamily: 'DM Sans', fontSize: 16 }}>{t('home.transactions.retry')}</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  // Empty state - show loading state
  if (!shouldShowContent && !shouldShowEmptyState) {
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        className="flex-1 p-4 justify-center items-center"
      >
        <Text className="text-center text-gray-500" style={{ fontFamily: 'DM Sans', fontSize: 16 }}>{t('home.transactions.loading')}</Text>
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
          className="items-center justify-center flex-1 gap-4 pb-24 px-10"
        >
          {/* Emoji Cards */}
          <View className="flex-row items-center justify-center mb-2" style={{ height: 84 }}>
            <View
              className="absolute left-12 rounded-xl p-4"
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
              <Text className="text-3xl" style={{ fontFamily: 'ApfelGrotezk', fontSize: 32 }}>🏠</Text>
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
              <Text className="text-3xl" style={{ fontFamily: 'ApfelGrotezk', fontSize: 32 }}>☕</Text>
            </View>
            <View
              className="absolute right-12 rounded-xl p-4"
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
              <Text className="text-3xl" style={{ fontFamily: 'ApfelGrotezk', fontSize: 32 }}>👕</Text>
            </View>
          </View>

          {/* Main Title */}
          <Text
            className="text-black text-center font-medium"
            style={{ fontFamily: 'DM Sans', fontSize: 16, lineHeight: 24 }}
          >
            {t('home.transactions.emptyTitle')}
          </Text>

          {/* Subtitle */}
          <Text
            className="text-gray-500 text-center text-sm"
            style={{ fontFamily: 'DM Sans', lineHeight: 20 }}
          >
            {t('home.transactions.emptyDescription')}
          </Text>
        </Animated.View>
      ) : (
        <FlashList
          data={flatListData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemType={getItemType}
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
          estimatedItemSize={60}
          drawDistance={200}
          extraData={`${currentMonth}-${currentYear}`}
          overrideItemLayout={(layout, item) => {
            // Provide exact sizes for better recycling and gesture isolation
            if (item.type === 'header') {
              layout.size = 35; // Header height
            } else {
              layout.size = 60; // Transaction item height
            }
          }}
        />
      )}
    </Animated.View>
  );
}; 