import React from 'react';
import { View, SafeAreaView, Pressable, FlatList } from 'react-native';
import { Text } from '@/components/ui/text';
import HeaderContainer from '@/components/layouts/_header';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { useTranslation } from 'react-i18next';

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
            {transaction.subCategory.macroCategory?.name}
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

export default function DailyTransactionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ date: string }>();
  const dateParam = params.date;

  const { data: dailyData, isLoading, error } = api.transaction.getDailyTransactions.useQuery({
    date: dateParam!
  }, {
    enabled: !!dateParam,
  });

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

    // Format as "DOM, 12 GEN"
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

  const handleTransactionPress = (transactionId: string) => {
    router.push(`/(protected)/(home)/transaction-edit/${transactionId}`);
  };

  if (isLoading) {
    return (
      <HeaderContainer variant="secondary" customTitle={t('transaction.list.title')} tabBarHidden={true}>
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-gray-500">Caricamento...</Text>
          </View>
        </SafeAreaView>
      </HeaderContainer>
    );
  }

  if (error || !dailyData) {
    return (
      <HeaderContainer variant="secondary" customTitle={t('transaction.list.title')} tabBarHidden={true}>
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
      customTitle={t('transaction.list.title')}
      tabBarHidden={true}
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1">
          {/* Date and Total Section */}
          <View className="bg-white px-4 py-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-400 text-sm font-normal leading-5">
                {formatDate(dailyData.date)}
              </Text>
              <Text className="text-gray-400 text-base font-medium leading-5">
                {formatAmount(dailyData.totalAmount)}
              </Text>
            </View>
          </View>

          {/* Transactions List */}
          <View className="flex-1 bg-white px-4">
            {dailyData.transactions.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500 text-center">
                  Nessuna transazione per questo giorno
                </Text>
              </View>
            ) : (
              <FlatList
                data={dailyData.transactions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TransactionItem
                    transaction={item}
                    onPress={() => handleTransactionPress(item.id)}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </HeaderContainer>
  );
} 