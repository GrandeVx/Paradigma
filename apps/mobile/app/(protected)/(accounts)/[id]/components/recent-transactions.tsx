import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import { useTranslation } from 'react-i18next';
import { Decimal } from 'decimal.js';

interface Transaction {
  id: string;
  amount: Decimal;
  date: Date;
  description: string;
  notes?: string | null;
  subCategory?: {
    name: string;
    icon?: string;
    macroCategory?: {
      name: string;
      icon: string;
    };
  } | null;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading: boolean;
  onSeeAllPress: () => void;
}

// Memoized RecentTransactions component for performance
export const RecentTransactions = React.memo<RecentTransactionsProps>(({
  transactions,
  isLoading,
  onSeeAllPress
}) => {
  const { t } = useTranslation();

  // Memoized transaction items to prevent unnecessary re-renders
  const TransactionItem = React.memo<{ transaction: Transaction }>(({ transaction }) => {
    const amount = parseFloat(transaction.amount.toString());
    const isNegative = amount < 0;

    // Memoized currency formatting
    const formattedAmount = React.useMemo(() => {
      const [integer, decimal] = Math.abs(amount).toFixed(2).split('.');
      const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return { integer: formattedInteger, decimal: decimal };
    }, [amount]);

    const transactionDate = React.useMemo(() => {
      return new Date(transaction.date).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short'
      });
    }, [transaction.date]);

    return (
      <View className="flex-row items-center py-3 border-b border-gray-100">
        {/* Transaction Icon */}
        <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center mr-3">
          {transaction.subCategory?.icon ? (
            <Text className="text-base">{transaction.subCategory.icon}</Text>
          ) : (
            <SvgIcon name="box" width={20} height={20} color="#6B7280" />
          )}
        </View>

        {/* Transaction Details */}
        <View className="flex-1 mr-3">
          <Text className="text-sm font-medium text-black mb-0.5" numberOfLines={1}>
            {transaction.description}
          </Text>
          <Text className="text-xs text-gray-500">
            {transactionDate}
          </Text>
          {transaction.subCategory && (
            <Text className="text-xs text-gray-400" numberOfLines={1}>
              {transaction.subCategory.macroCategory?.name} • {transaction.subCategory.name}
            </Text>
          )}
        </View>

        {/* Transaction Amount */}
        <View className="items-end">
          <View className="flex-row items-baseline">
            <Text className={`text-xs font-normal ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
              {isNegative ? '-' : '+'}€
            </Text>
            <Text className={`text-base font-medium ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
              {formattedAmount.integer}
            </Text>
            <Text className={`text-sm font-normal ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
              ,{formattedAmount.decimal}
            </Text>
          </View>
        </View>
      </View>
    );
  });

  return (
    <View className="mt-3 bg-white px-4 py-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-black text-lg font-semibold">
          {t("account.recent_transactions.title", "Transazioni recenti")}
        </Text>
        <Pressable onPress={onSeeAllPress}>
          <Text className="text-blue-500 text-sm font-medium">
            {t("common.actions.see_all", "Vedi tutte")}
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View className="py-8 items-center">
          <Text className="text-gray-500 text-sm">
            {t("common.loading", "Caricamento...")}
          </Text>
        </View>
      ) : transactions.length === 0 ? (
        <View className="py-8 items-center">
          <SvgIcon name="box" width={32} height={32} color="#D1D5DB" />
          <Text className="text-gray-400 text-sm mt-2">
            {t("account.recent_transactions.empty", "Nessuna transazione recente")}
          </Text>
        </View>
      ) : (
        <View>
          {transactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </View>
      )}
    </View>
  );
}); 