import React, { useMemo } from 'react';
import { View, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { Decimal } from 'decimal.js';
import { useTabBar } from '@/context/TabBarContext';

// Format currency helper (Italian format)
const formatCurrency = (amount: number) => {
  const [integer, decimal] = amount.toFixed(2).split('.');
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return {
    integer: formattedInteger,
    decimal: decimal
  };
};

// Extended interface for MoneyAccount with goal fields
interface MoneyAccountWithGoal {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  color: string | null;
  iconName: string | null;
  initialBalance: Decimal;
  default: boolean;
  isGoalAccount: boolean;
  targetAmount?: Decimal | null;
  targetDate?: Date | null;
  goalDescription?: string | null;
  includeInTotal: boolean;
}

// Goal Account interface
interface GoalAccount {
  id: string;
  name: string;
  icon: string;
  color: string;
  balance: number;
  targetAmount: number;
  progress: number;
}

// Goal Card Component
const GoalCard: React.FC<{
  goal: GoalAccount;
  onPress: (id: string) => void;
}> = ({ goal, onPress }) => {
  const { integer, decimal } = formatCurrency(goal.balance);
  const remaining = goal.targetAmount - goal.balance;
  const { integer: targetInteger, decimal: targetDecimal } = formatCurrency(goal.targetAmount);
  const { integer: remainingInteger, decimal: remainingDecimal } = formatCurrency(remaining);

  return (
    <Pressable
      className="w-full rounded-3xl bg-transparent mb-2"
      onPress={() => onPress(goal.id)}
    >
      <View className="w-full rounded-3xl p-6" style={{ backgroundColor: goal.color }}>
        <View className="flex-row justify-between items-center w-full">
          <View className="flex-row items-center gap-2 py-2">
            <SvgIcon name="pig-money" width={20} height={20} color="#FFFFFF" />
            <Text className="text-white font-semibold text-base">{goal.name}</Text>
          </View>

          <View className="flex-row items-baseline gap-2">
            <Text className="text-white text-base font-normal" style={{ fontFamily: 'Apfel Grotezk' }}>€</Text>
            <View className="flex-row items-baseline">
              <Text className="text-white font-medium" style={{ fontFamily: 'Apfel Grotezk', fontSize: 23 }}>{integer}</Text>
              <Text className="text-white text-base font-normal" style={{ fontFamily: 'Apfel Grotezk' }}>,{decimal}</Text>
            </View>
          </View>
        </View>

        <View className="mt-4 w-full">
          <View className="h-3 w-full rounded-full overflow-hidden mb-1" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <View
              className="h-full rounded-full"
              style={{
                backgroundColor: '#FFFFFF',
                width: `${goal.progress}%`
              }}
            />
          </View>
          <Text className="text-white text-xs font-medium">
            Ancora € {remainingInteger},{remainingDecimal} per completare l'obiettivo di € {targetInteger},{targetDecimal}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export const GoalsSection: React.FC = () => {
  const router = useRouter();
  const { hideTabBar } = useTabBar();

  // Fetch accounts data
  const { data: accountsData, isLoading, refetch: refetchAccounts } = api.account.listWithBalances.useQuery({});

  // Process goal accounts data
  const goalAccounts = useMemo(() => {
    if (!accountsData) {
      return [];
    }

    // Filter and process goal accounts
    const goals: GoalAccount[] = accountsData
      .filter(item => {
        const account = item.account as unknown as MoneyAccountWithGoal;
        return account.isGoalAccount && account.targetAmount;
      })
      .map(item => {
        const account = item.account as unknown as MoneyAccountWithGoal;
        const accountBalance = Number(item.balance);
        const targetAmount = Number(account.targetAmount);

        // Calculate progress as percentage
        const progress = Math.min(100, (accountBalance / targetAmount) * 100);

        return {
          id: account.id,
          name: account.name,
          icon: account.iconName || 'pig-money',
          color: account.color || '#FA6B97',
          balance: accountBalance,
          targetAmount,
          progress,
        };
      })
      // Sort by progress (highest first)
      .sort((a, b) => b.progress - a.progress);

    return goals;
  }, [accountsData]);

  const handleGoalPress = (id: string) => {
    hideTabBar();
    // Navigate to goal account details
    router.push({
      pathname: "/(protected)/(accounts)/[id]",
      params: { id }
    });
  };

  const handleRefresh = () => {
    refetchAccounts();
  };

  if (isLoading) {
    return (
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="items-center justify-center py-8">
          <Text className="text-gray-500">Caricamento obiettivi...</Text>
        </View>
      </ScrollView>
    );
  }

  if (goalAccounts.length === 0) {
    return (
      <ScrollView
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
          />
        }
      >
        <View className="items-center justify-center py-8">
          <Text className="text-gray-500 text-center mb-4">Nessun obiettivo di risparmio trovato</Text>
          <Pressable
            className="bg-blue-500 px-6 py-3 rounded-full"
            onPress={() => router.push('/(protected)/(creation-flow)/name')}
          >
            <Text className="text-white font-semibold">Crea il tuo primo obiettivo</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 px-2 pt-2"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
        />
      }
    >
      {goalAccounts.map(goal => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onPress={handleGoalPress}
        />
      ))}
    </ScrollView>
  );
}; 