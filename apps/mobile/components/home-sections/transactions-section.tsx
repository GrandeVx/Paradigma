import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { LeftIcon, RightIcon } from '@/components/ui/svg-icons';
import { api } from '@/lib/api';

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
    emoji: string;
    color: string;
  };
  subCategory?: {
    name: string;
  };
  type: 'income' | 'expense';
}

const categoryColors: Record<string, string> = {
  'Alimentari': '#FDAD0C',
  'Trasporti': '#7E01FB',
  'Arredamento': '#E81411',
  'Ristoranti': '#FDAD0C',
  'Regali': '#409FF8',
  'Abbonamenti': '#FA6B97',
  'Lavoro': '#03965E',
  'Costi bancari': '#03965E',
  'default': '#6B7280'
};

const categoryEmojis: Record<string, string> = {
  'Alimentari': '🛒',
  'Trasporti': '⛽',
  'Arredamento': '🛋️',
  'Ristoranti': '🍽️',
  'Regali': '🎁',
  'Abbonamenti': '🔖',
  'Lavoro': '💼',
  'Costi bancari': '🏦',
  'default': '💰'
};

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

const TransactionListItem: React.FC<{ transaction: TransactionItem }> = ({ transaction }) => {
  const isIncome = transaction.type === 'income';
  const categoryColor = transaction.category?.color || categoryColors.default;
  const categoryEmoji = transaction.category?.emoji || categoryEmojis.default;

  return (
    <View className="flex-row items-center py-2">
      <View className="flex-row items-center flex-1">
        <View
          className="w-8 h-6 rounded-lg items-center justify-center mr-2"
          style={{ backgroundColor: categoryColor }}
        >
          <Text className="text-base" style={{ fontFamily: 'DM Sans' }}>
            {categoryEmoji}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="text-sm text-gray-900" style={{ fontFamily: 'DM Sans' }}>
            {transaction.description}
          </Text>
          {transaction.subCategory && (
            <Text className="text-xs text-gray-500" style={{ fontFamily: 'DM Sans' }}>
              {transaction.subCategory.name}
            </Text>
          )}
        </View>
      </View>

      <Text
        className={`text-base text-right ${isIncome ? 'text-green-600' : 'text-gray-500'}`}
        style={{ fontFamily: 'Apfel Grotezk' }}
      >
        {isIncome ? '+ ' : ''}€ {Math.abs(transaction.amount).toFixed(2)}
      </Text>
    </View>
  );
};

const DailyTransactionGroup: React.FC<{ group: TransactionGroup }> = ({ group }) => {
  const isPositive = group.dailyTotal > 0;

  return (
    <View className="border-b border-gray-200 pb-1 mb-1">
      <View className="flex-row justify-between items-center py-1">
        <Text className="text-sm font-normal text-gray-500" style={{ fontFamily: 'DM Sans' }}>
          {group.dayName}
        </Text>
        <Text
          className={`text-base font-medium ${isPositive ? 'text-gray-500' : 'text-gray-500'}`}
          style={{ fontFamily: 'Apfel Grotezk' }}
        >
          {isPositive ? '+ ' : '- '}€ {Math.abs(group.dailyTotal).toFixed(2)}
        </Text>
      </View>

      {group.transactions.map(transaction => (
        <TransactionListItem key={transaction.id} transaction={transaction} />
      ))}
    </View>
  );
};

export const TransactionsSection: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  // Query for monthly transactions
  const { data: transactions, isLoading, error } = api.transaction.getMonthlySpending.useQuery({
    month: currentMonth,
    year: currentYear,
  });

  const formatDayName = (date: Date): string => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return 'OGGI';
    }

    const dayNames = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];
    const monthNames = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU',
      'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];

    return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
  };


  // Process and group transactions by day
  const { groupedTransactions, summary } = useMemo(() => {
    if (!transactions) {
      return { groupedTransactions: [], summary: { income: 0, expenses: 0, remaining: 0 } };
    }

    // Calculate summary - convert Decimal to number
    const income = transactions
      .filter(t => Number(t.amount) > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = Math.abs(transactions
      .filter(t => Number(t.amount) < 0)
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0));

    const remaining = income - expenses;

    // Group by date
    const grouped = transactions.reduce((acc, transaction) => {
      const date = transaction.date.toISOString().split('T')[0];

      if (!acc[date]) {
        acc[date] = {
          date,
          dayName: formatDayName(transaction.date),
          transactions: [],
          dailyTotal: 0,
        };
      }

      const amount = Number(transaction.amount);
      const transformedTransaction: TransactionItem = {
        id: transaction.id,
        amount: amount,
        description: transaction.description,
        date: transaction.date,
        type: amount > 0 ? 'income' : 'expense',
        category: transaction.subCategory?.macroCategory ? {
          name: transaction.subCategory.macroCategory.name,
          emoji: categoryEmojis[transaction.subCategory.macroCategory.name] || categoryEmojis.default,
          color: categoryColors[transaction.subCategory.macroCategory.name] || categoryColors.default,
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

    return {
      groupedTransactions: groupedArray,
      summary: { income, expenses, remaining }
    };
  }, [transactions]);


  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  if (isLoading) {
    return (
      <View className="flex-1 p-4">
        <Text className="text-center text-gray-500">Caricamento...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 p-4">
        <Text className="text-center text-red-500">Errore nel caricamento delle transazioni</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 px-4 pt-2 pb-6">
      <SummaryContainer
        income={summary.income}
        expenses={summary.expenses}
        remaining={summary.remaining}
        currentMonth={currentMonth}
        currentYear={currentYear}
        onMonthChange={handleMonthChange}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {groupedTransactions.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500 text-center" style={{ fontFamily: 'DM Sans' }}>
              Nessuna transazione per questo mese.
            </Text>
          </View>
        ) : (
          groupedTransactions.map((group) => (
            <DailyTransactionGroup key={group.date} group={group} />
          ))
        )}
      </ScrollView>
    </View>
  );
}; 