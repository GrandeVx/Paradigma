import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, Pressable, RefreshControl } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOutUp,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useLocalSearchParams } from 'expo-router';
import HeaderContainer from '@/components/layouts/_header';
import { api } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FlashList } from '@shopify/flash-list';
import { SwipeableTransactionItem } from '@/components/ui/swipeable-transaction-item';
import { InvalidationUtils } from '@/lib/invalidation-utils';
import * as Haptics from 'expo-haptics';
import { useCurrency } from '@/hooks/use-currency';

// Types
interface TransactionItem {
  id: string;
  amount: number;
  description: string;
  date: Date;
  notes?: string | null;
  transferId?: string | null;
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

interface TransactionGroup {
  date: string;
  dayName: string;
  transactions: TransactionItem[];
  dailyTotal: number;
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
      entering={FadeInDown.delay(item.groupIndex * 100).duration(500).springify()}
      exiting={FadeOutUp.duration(300)}
      layout={Layout.springify().damping(15).stiffness(100)}
      className="mb-1"
    >
      <View className="flex-row justify-between items-center py-1">
        <Text className="font-normal text-gray-500" style={{ fontFamily: 'DM Sans', fontSize: 14 }}>
          {item.dayName}
        </Text>
        <Text
          className={`font-medium ${isPositive ? 'text-gray-400' : 'text-gray-400'}`}
          style={{ fontFamily: 'ApfelGrotezk', fontSize: 16 }}
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
      className={item.isLast ? "border-b border-gray-200 pb-1" : ""}
    >
      <SwipeableTransactionItem
        transaction={item.data}
        onDelete={onDelete}
        context="accounts"
      />
    </Animated.View>
  );
};

// Filter tabs
const FILTER_TYPES = [
  { key: 'all', label: 'Tutte' },
  { key: 'income', label: 'Entrate' },
  { key: 'expense', label: 'Spese' },
  { key: 'transfer', label: 'Trasferimenti' }
] as const;

type FilterType = typeof FILTER_TYPES[number]['key'];

export default function AccountTransactionsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { formatCurrency } = useCurrency();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const contentOpacity = useSharedValue(0);

  // API utils for invalidation
  const utils = api.useContext();

  // Get account details for the header
  const { data: accountData } = api.account.getById.useQuery(
    { accountId: id },
    { enabled: !!id }
  );

  // Get transactions with infinite scroll - OPTIMIZED
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = api.transaction.list.useInfiniteQuery(
    {
      accountId: id,
      type: activeFilter === 'all' ? undefined : activeFilter,
      limit: 20
    },
    {
      enabled: !!id,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Keep in cache for 5 minutes
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
    }
  );

  // Flatten all transactions from all pages - MEMORY OPTIMIZED
  const allTransactions = useMemo(() => {
    const flattened = data?.pages.flatMap(page => page.items) ?? [];
    // Limit to max 100 transactions in memory to prevent RAM bloat
    return flattened.slice(0, 100);
  }, [data]);

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
    if (!allTransactions || allTransactions.length === 0) {
      return {
        summary: { income: 0, expenses: 0, remaining: 0 },
        flatListData: []
      };
    }

    // Filter out transactions with invalid dates
    const validTransactions = allTransactions.filter(transaction => {
      const isValid = transaction.date &&
        typeof transaction.date !== 'undefined' &&
        (transaction.date instanceof Date || typeof transaction.date === 'string' || typeof transaction.date === 'object');
      return isValid;
    });

    // Calculate summary
    const income = validTransactions
      .filter(t => Number(t.amount) > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = Math.abs(validTransactions
      .filter(t => Number(t.amount) < 0)
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0));

    const remaining = income - expenses;

    // Group by date
    const grouped = validTransactions.reduce((acc: Record<string, TransactionGroup>, transaction) => {
      let dateObj: Date;
      try {
        dateObj = new Date(transaction.date as string | number | Date);
        if (isNaN(dateObj.getTime())) {
          dateObj = new Date();
        }
      } catch {
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
        date: dateObj,
        notes: transaction.notes,
        transferId: transaction.transferId,
        type: amount > 0 ? 'income' : 'expense',
        category: transaction.subCategory?.macroCategory ? {
          name: transaction.subCategory.macroCategory.name,
          icon: transaction.subCategory.macroCategory.icon,
          color: transaction.subCategory.macroCategory.color,
        } : undefined,
        subCategory: transaction.subCategory ? {
          name: transaction.subCategory.name,
          icon: transaction.subCategory.icon,
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
  }, [allTransactions, formatDayName]);

  // Query for categories to map subcategories to macro categories for invalidation
  const { data: categories } = api.category.list.useQuery({}, {
    staleTime: 1000 * 60 * 30, // 30 minutes
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

  // Memoized delete handler
  const handleDeleteTransaction = useCallback(async (transactionId: string) => {
    try {
      // Find the transaction in our current data to get its date before deletion
      const transactionToDelete = allTransactions?.find(t => t.id === transactionId);
      if (transactionToDelete) {
        deleteMutation.mutate({
          transactionId,
        }, {
          onSuccess: async () => {
            console.log('🗑️ [AccountTransactions] Transaction deleted, starting comprehensive refresh...');

            // Haptic feedback for successful delete
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // Small delay to ensure server has processed the deletion
            await new Promise(resolve => setTimeout(resolve, 100));

            // Get the month/year of the deleted transaction for proper cache invalidation
            const transactionDate = new Date(transactionToDelete.date);
            const transactionMonth = transactionDate.getMonth() + 1;
            const transactionYear = transactionDate.getFullYear();

            console.log(`🗑️ [AccountTransactions] Invalidating cache for transaction date: ${transactionMonth}/${transactionYear}`);

            // Use comprehensive invalidation utility with forced refetch
            try {
              await InvalidationUtils.invalidateTransactionRelatedQueries(utils, {
                currentMonth: transactionMonth,
                currentYear: transactionYear,
                clearCache: true,
              });

              // Invalidate category-specific queries for the deleted transaction's category
              if (transactionToDelete.subCategoryId && categories) {
                const category = categories.find(cat =>
                  cat.subCategories.some(sub => sub.id === transactionToDelete.subCategoryId)
                );

                if (category) {
                  console.log(`🏷️ [AccountTransactions] Invalidating category queries for category: ${category.id}`);
                  await InvalidationUtils.invalidateCategoryQueries(utils, {
                    categoryId: category.id,
                    currentMonth: transactionMonth,
                    currentYear: transactionYear,
                  });
                }
              }

              await refetch();

            } catch (error) {
              // Fallback: force refetch our local query even if others fail
              try {
                await refetch();
              } catch (refetchError) {
                console.error('Fallback refetch failed:', refetchError);
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
  }, [deleteMutation, allTransactions, utils, refetch, categories]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Load more transactions
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

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

  // Animate content when data loads
  React.useEffect(() => {
    if (!isLoading) {
      contentOpacity.value = withTiming(1, { duration: 600 });
    }
  }, [isLoading, contentOpacity]);

  // Summary Container Component
  const SummaryContainer: React.FC<{
    income: number;
    expenses: number;
    remaining: number;
  }> = ({ income, expenses, remaining }) => {
    return (
      <View className="bg-gray-50 rounded-3xl p-4 mb-4">
        <View className="flex-row justify-between">
          <View className="flex-1 items-center">
            <Text className="font-medium text-gray-500" style={{ fontFamily: 'DM Sans', fontSize: 14 }}>
              {t('home.transactions.income')}
            </Text>
            <Text className="text-base font-medium text-gray-700" style={{ fontFamily: 'ApfelGrotezk', fontSize: 16 }}>
              {formatCurrency(income)}
            </Text>
          </View>

          <View className="flex-1 items-center">
            <Text className="font-medium text-gray-500" style={{ fontFamily: 'DM Sans', fontSize: 14 }}>
              {t('home.transactions.expenses')}
            </Text>
            <Text className="text-base font-medium text-gray-700" style={{ fontFamily: 'ApfelGrotezk', fontSize: 16 }}>
              {formatCurrency(expenses)}
            </Text>
          </View>

          <View className="flex-1 items-center">
            <Text className="font-medium text-gray-500" style={{ fontFamily: 'DM Sans', fontSize: 14 }}>
              {t('home.transactions.remaining')}
            </Text>
            <Text className="text-base font-medium text-black" style={{ fontFamily: 'ApfelGrotezk', fontSize: 16 }}>
              {formatCurrency(remaining)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render load more button
  const renderFooter = () => {
    if (!hasNextPage) {
      return (
        <View className="py-8 items-center">
          <Text className="text-sm text-gray-400">
            {allTransactions.length > 0
              ? t("transaction.list.end", "Hai visto tutte le transazioni")
              : t("transaction.list.empty", "Nessuna transazione trovata")
            }
          </Text>
        </View>
      );
    }

    return (
      <View className="py-4 px-4">
        <Button
          variant="secondary"
          size="lg"
          rounded="default"
          onPress={handleLoadMore}
          className="w-full"
          isLoading={isFetchingNextPage}
        >
          <Text className="text-black font-medium">
            {t("common.actions.load_more", "Carica altre")}
          </Text>
        </Button>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
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
          <Text className="text-3xl" style={{ fontFamily: 'ApfelGrotezk', fontSize: 32 }}>💳</Text>
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
          <Text className="text-3xl" style={{ fontFamily: 'ApfelGrotezk', fontSize: 32 }}>📊</Text>
        </View>
      </View>

      {/* Main Title */}
      <Text
        className="text-black text-center font-medium"
        style={{ fontFamily: 'DM Sans', fontSize: 16, lineHeight: 24 }}
      >
        {activeFilter === 'all'
          ? "Nessuna transazione per questo conto"
          : "Nessuna transazione per il filtro selezionato"}
      </Text>

      {/* Subtitle */}
      <Text
        className="text-gray-500 text-center"
        style={{ fontFamily: 'DM Sans', fontSize: 14, lineHeight: 20 }}
      >
        Le transazioni aggiunte a questo conto appariranno qui
      </Text>
    </Animated.View>
  );

  if (isLoading && allTransactions.length === 0) {
    return (
      <HeaderContainer
        variant="secondary"
        customTitle={accountData?.name || t("transaction.list.title", "Transazioni")}
        tabBarHidden={true}
      >
        <View className="flex-1 bg-gray-100 items-center justify-center">
          <Text className="text-gray-500">
            {t("common.loading", "Caricamento...")}
          </Text>
        </View>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer
      variant="secondary"
      customTitle={accountData?.name || t("transaction.list.title", "Transazioni")}
      tabBarHidden={true}
    >
      <Animated.View style={contentStyle} className="flex-1 bg-white">
        {/* Summary Container */}
        <View className="px-4 pt-4">
          <SummaryContainer
            income={summary.income}
            expenses={summary.expenses}
            remaining={summary.remaining}
          />
        </View>

        {/* Filter Tabs */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}

            contentContainerStyle={{ paddingHorizontal: 0, marginHorizontal: "auto" }}
          >
            <View className="flex-row w-full gap-1 justify-between">
              {FILTER_TYPES.map((filter) => (
                <Pressable
                  key={filter.key}
                  className={cn(
                    "px-4 py-2 rounded-full border",
                    activeFilter === filter.key
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white border-gray-300"
                  )}
                  onPress={() => setActiveFilter(filter.key)}
                >
                  <Text className={cn(
                    "text-sm font-medium",
                    activeFilter === filter.key
                      ? "text-white"
                      : "text-gray-700"
                  )}>
                    {filter.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Transaction List - VIRTUALIZED for performance */}
        {flatListData.length > 0 ? (
          <View className="flex-1 px-4">
            <FlashList
              data={flatListData}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
              ListFooterComponent={renderFooter}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#007AFF"
                />
              }
              showsVerticalScrollIndicator={false}
              // PERFORMANCE OPTIMIZATIONS
              removeClippedSubviews={true}
              estimatedItemSize={60}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#6B7280"
              />
            }
          >
            {renderEmptyState()}
          </ScrollView>
        )}
      </Animated.View>
    </HeaderContainer>
  );
} 