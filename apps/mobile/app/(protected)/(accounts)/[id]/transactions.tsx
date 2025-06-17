import React, { useState, useMemo } from 'react';
import { View, ScrollView, Pressable, RefreshControl } from 'react-native';
import { FlatList } from 'react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { SvgIcon } from '@/components/ui/svg-icon';
import { useLocalSearchParams } from 'expo-router';
import HeaderContainer from '@/components/layouts/_header';
import { api } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Decimal } from '@paradigma/db';

// Types
type Transaction = {
  id: string;
  amount: Decimal;
  date: Date;
  description: string;
  notes?: string | null;
  transferId?: string | null;
  subCategory?: {
    name: string;
    icon?: string;
    macroCategory?: {
      name: string;
      icon: string;
    };
  } | null;
};

type GroupedTransaction = {
  date: string;
  transactions: Transaction[];
};

// Format currency helper
const formatCurrency = (amount: number) => {
  const [integer, decimal] = Math.abs(amount).toFixed(2).split('.');
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return {
    integer: formattedInteger,
    decimal: decimal
  };
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

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Get account details for the header
  const { data: accountData } = api.account.getById.useQuery(
    { accountId: id },
    { enabled: !!id }
  );

  // Get transactions with infinite scroll
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
    }
  );

  // Flatten all transactions from all pages
  const allTransactions = useMemo(() => {
    return data?.pages.flatMap(page => page.items) ?? [];
  }, [data]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};

    allTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const dateKey = date.toLocaleDateString('it-IT', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });

    return Object.entries(groups).map(([date, transactions]) => ({
      date,
      transactions
    }));
  }, [allTransactions]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Load more transactions
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Render transaction item
  const renderTransaction = (transaction: Transaction) => {
    const amount = parseFloat(transaction.amount.toString());
    const isNegative = amount < 0;
    const { integer, decimal } = formatCurrency(amount);
    const transactionDate = new Date(transaction.date);

    return (
      <Pressable
        key={transaction.id}
        className="bg-white mx-4 mb-3 p-4 rounded-xl"
        onPress={() => {
          // Navigate to transaction details if needed
          console.log('Navigate to transaction:', transaction.id);
        }}
      >
        <View className="flex-row items-center">
          {/* Transaction Icon */}
          <View className="w-12 h-12 rounded-lg bg-gray-100 items-center justify-center mr-4">
            {transaction.subCategory?.icon ? (
              <Text className="text-lg">{transaction.subCategory.icon}</Text>
            ) : (
              <SvgIcon name="box" width={24} height={24} color="#6B7280" />
            )}
          </View>

          {/* Transaction Details */}
          <View className="flex-1 mr-4">
            <Text className="text-base font-semibold text-black mb-1">
              {transaction.description}
            </Text>
            <Text className="text-sm text-gray-500 mb-1">
              {transactionDate.toLocaleDateString('it-IT', {
                day: '2-digit',
                month: 'short'
              })}
            </Text>
            {transaction.subCategory && (
              <Text className="text-xs text-gray-400">
                {transaction.subCategory.macroCategory?.name} • {transaction.subCategory.name}
              </Text>
            )}
            {transaction.notes && (
              <Text className="text-xs text-gray-400 mt-1">
                {transaction.notes}
              </Text>
            )}
          </View>

          {/* Transaction Amount */}
          <View className="items-end">
            <View className="flex-row items-baseline">
              <Text className={`text-sm font-normal ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
                {isNegative ? '-' : '+'}€
              </Text>
              <Text className={`text-xl font-semibold ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
                {integer}
              </Text>
              <Text className={`text-lg font-normal ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
                ,{decimal}
              </Text>
            </View>
            {transaction.transferId && (
              <Text className="text-xs text-gray-400 mt-1">
                {t("transaction.transfer", "Trasferimento")}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  // Render grouped section
  const renderGroupedSection = ({ item }: { item: GroupedTransaction }) => (
    <View className="mb-6">
      {/* Date Header */}
      <View className="px-4 py-2">
        <Text className="text-lg font-semibold text-black capitalize">
          {item.date}
        </Text>
      </View>

      {/* Transactions for this date */}
      <View>
        {item.transactions.map(transaction => renderTransaction(transaction))}
      </View>
    </View>
  );

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
    <View className="flex-1 items-center justify-center py-16">
      <SvgIcon name="box" width={64} height={64} color="#D1D5DB" />
      <Text className="text-lg font-medium text-gray-400 mt-4 mb-2">
        {t("transaction.list.empty_title", "Nessuna transazione")}
      </Text>
      <Text className="text-sm text-gray-400 text-center px-8">
        {activeFilter === 'all'
          ? t("transaction.list.empty_desc", "Non ci sono ancora transazioni per questo conto")
          : t("transaction.list.empty_filtered", "Nessuna transazione trovata per il filtro selezionato")
        }
      </Text>
    </View>
  );

  if (isLoading && allTransactions.length === 0) {
    return (
      <HeaderContainer
        variant="secondary"
        customTitle={accountData?.name || t("transaction.list.title", "Transazioni")}
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
    >
      <View className="flex-1 bg-gray-100">
        {/* Filter Tabs */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 0 }}
          >
            <View className="flex-row space-x-2">
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

        {/* Transaction List */}
        {groupedTransactions.length > 0 ? (
          <FlatList
            data={groupedTransactions}
            renderItem={renderGroupedSection}
            keyExtractor={(item) => item.date}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#6B7280"
              />
            }
            showsVerticalScrollIndicator={false}
          />
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
      </View>
    </HeaderContainer>
  );
} 