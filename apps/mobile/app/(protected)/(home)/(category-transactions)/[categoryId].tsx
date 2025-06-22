import React, { useState } from 'react';
import { View, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import HeaderContainer from '@/components/layouts/_header';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTabBar } from '@/context/TabBarContext';
import { SvgIcon } from '@/components/ui/svg-icon';
import { api } from '@/lib/api';

interface TransactionItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transaction: any;
  onPress: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  const categoryIcon = transaction.subCategory?.icon || '💰';
  const categoryColor = transaction.subCategory?.macroCategory?.color || '#6B7280';
  const amount = Math.abs(Number(transaction.amount));

  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-2 py-3">
      {/* Category Icon Badge */}
      <View
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: categoryColor }}
      >
        <Text className="text-white text-sm font-medium">{categoryIcon}</Text>
      </View>

      {/* Transaction Details */}
      <View className="flex-1 flex-col justify-center">
        <Text className="text-gray-900 text-sm font-normal leading-5">
          {transaction.description}
        </Text>
        {transaction.subCategory && (
          <Text className="text-gray-600 text-xs font-normal leading-4">
            {transaction.subCategory.name}
          </Text>
        )}
      </View>

      {/* Amount */}
      <Text className="text-gray-600 text-base font-normal leading-5">
        € {amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Text>
    </Pressable>
  );
};

interface DayGroupProps {
  dayGroup: {
    date: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transactions: any[];
    totalAmount: number;
  };
  onTransactionPress: (transactionId: string) => void;
}

const DayGroup: React.FC<DayGroupProps> = ({ dayGroup, onTransactionPress }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'OGGI';
    if (date.toDateString() === tomorrow.toDateString()) return 'DOMANI';
    if (date.toDateString() === yesterday.toDateString()) return 'IERI';

    // Format as "LUN, 8 GEN"
    const weekdays = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];
    const months = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];

    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];

    return `${weekday}, ${day} ${month}`;
  };

  const formatAmount = (amount: number) => {
    const isNegative = amount < 0;
    const absoluteAmount = Math.abs(amount);
    const formatted = absoluteAmount.toLocaleString('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return isNegative ? `- € ${formatted}` : `€ ${formatted}`;
  };

  return (
    <View className="border-b border-gray-200 pb-4 mb-4">
      {/* Day Header */}
      <View className="flex-row justify-between items-center mb-2 py-1">
        <Text className="text-gray-400 text-sm font-normal leading-5">
          {formatDate(dayGroup.date)}
        </Text>
        <Text className="text-gray-400 text-base font-medium leading-5">
          {formatAmount(dayGroup.totalAmount)}
        </Text>
      </View>

      {/* Transactions for this day */}
      {dayGroup.transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onPress={() => onTransactionPress(transaction.id)}
        />
      ))}
    </View>
  );
};

export default function CategoryTransactionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId: string }>();
  const { showTabBar, hideTabBar } = useTabBar();
  const categoryId = params.categoryId;

  // Get current month and year
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const { data: categoryData, isLoading: isLoadingCategory, error: categoryError } = api.transaction.getCategoryTransactions.useQuery({
    categoryId: categoryId!,
    month: currentMonth,
    year: currentYear,
  }, {
    enabled: !!categoryId,
  });

  const { data: budgetData, isLoading: isLoadingBudget } = api.transaction.getBudgetInfo.useQuery({
    categoryId: categoryId!,
    month: currentMonth,
    year: currentYear,
  }, {
    enabled: !!categoryId,
  });

  const handleTransactionPress = (transactionId: string) => {
    router.push(`/(protected)/(home)/transaction-edit/${transactionId}`);
    hideTabBar();

  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const formatMonthYear = () => {
    const months = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return `${months[currentMonth - 1]} ${currentYear}`;
  };

  if (isLoadingCategory) {
    return (
      <HeaderContainer variant="secondary" customTitle="ULTIME TRANSAZIONI">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-gray-500">Caricamento...</Text>
          </View>
        </SafeAreaView>
      </HeaderContainer>
    );
  }

  if (categoryError || !categoryData) {
    return (
      <HeaderContainer variant="secondary" customTitle="ULTIME TRANSAZIONI">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-red-500">Errore nel caricamento</Text>
          </View>
        </SafeAreaView>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer
      variant="secondary"
      customTitle="ULTIME TRANSAZIONI"
      onBackPress={() => {
        showTabBar();
      }}
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Budget Section - Only if budget exists */}
          {budgetData && !isLoadingBudget && (
            <View className="px-4 py-4">
              <View className="bg-gray-50 rounded-3xl p-4">
                {/* Month Selector */}
                <View className="flex-row items-center justify-between mb-2">
                  <Pressable
                    onPress={() => navigateMonth('prev')}
                    className="w-10 h-10 items-center justify-center"
                  >
                    <SvgIcon name="left" size={20} color="#000" />
                  </Pressable>

                  <Text className="text-black text-sm font-normal leading-5">
                    {formatMonthYear()}
                  </Text>

                  <Pressable
                    onPress={() => navigateMonth('next')}
                    className="w-10 h-10 items-center justify-center"
                  >
                    <SvgIcon name="right" size={20} color="#000" />
                  </Pressable>
                </View>

                {/* Category Header */}
                <View className="items-center mb-2">
                  <View
                    className="rounded-xl px-3 py-1.5 flex-row items-center gap-2"
                    style={{ backgroundColor: `${budgetData.macroCategory.color}60`, }}
                  >
                    <Text className="text-white text-base font-medium leading-5">
                      {budgetData.macroCategory.icon}
                    </Text>
                    <Text className="text-white text-sm font-semibold leading-5 uppercase">
                      {budgetData.macroCategory.name}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="w-full h-3 bg-white rounded-full mb-2 overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: budgetData.macroCategory.color,
                      width: `${Math.min(budgetData.progressPercentage, 100)}%`
                    }}
                  />
                </View>

                {/* Budget Details */}
                <View className="flex-row justify-between px-6">
                  <View className="items-center">
                    <Text className="text-gray-400 text-sm font-medium leading-5">Budget</Text>
                    <Text className="text-gray-700 text-base font-medium leading-5">
                      € {budgetData.budget.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-gray-400 text-sm font-medium leading-5">Speso già</Text>
                    <Text className="text-gray-700 text-base font-medium leading-5">
                      € {budgetData.spentAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-gray-400 text-sm font-medium leading-5">Rimanente</Text>
                    <Text className="text-yellow-600 text-base font-medium leading-5">
                      € {budgetData.remainingAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Transactions List */}
          <View className="bg-white px-4">
            {categoryData.dailyGroups.length === 0 ? (
              <View className="py-20 items-center justify-center">
                <Text className="text-gray-500 text-center">
                  Nessuna transazione per questa categoria
                </Text>
              </View>
            ) : (
              categoryData.dailyGroups.map((dayGroup) => (
                <DayGroup
                  key={dayGroup.date}
                  dayGroup={dayGroup}
                  onTransactionPress={handleTransactionPress}
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </HeaderContainer>
  );
} 