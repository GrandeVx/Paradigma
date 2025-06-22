import React, { useMemo } from 'react';
import { View, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import { IconName } from '@/components/ui/icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import HeaderContainer from '@/components/layouts/_header';
import { FontAwesome5 } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { Decimal } from 'decimal.js';
import { useTabBar } from '@/context/TabBarContext';


// Format currency helper
const formatCurrency = (amount: number) => {
  const [integer, decimal] = amount.toFixed(2).split('.');

  // Format with dot as thousand separator and comma as decimal separator (Italian format)
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

// Unified Account interface with integrated goal functionality
interface UnifiedAccount {
  id: string;
  name: string;
  icon: string;
  color: string;
  balance: number;
  isGoalAccount: boolean;
  targetAmount?: number;
  progress?: number;
  includeInTotal: boolean;
}

// Account Card Component
const AccountCard: React.FC<{
  account: UnifiedAccount;
  onPress: (id: string) => void;
}> = ({ account, onPress }) => {
  const { integer, decimal } = formatCurrency(account.balance);

  // Savings account with progress display
  if (account.isGoalAccount && account.targetAmount && account.progress !== undefined) {
    const remaining = account.targetAmount - account.balance;
    const { integer: targetInteger, decimal: targetDecimal } = formatCurrency(account.targetAmount);
    const { integer: remainingInteger, decimal: remainingDecimal } = formatCurrency(remaining);

    return (
      <Pressable
        className="w-full rounded-3xl bg-transparent mb-5"
        onPress={() => onPress(account.id)}
      >
        <View className="w-full rounded-3xl p-6" style={{ backgroundColor: account.color }}>
          <View className="flex-row justify-between items-center w-full">
            <View className="flex-row items-center gap-2 py-2">
              <SvgIcon name={account.icon as IconName} width={24} height={24} color="#FFFFFF" />
              <Text className="text-white font-semibold text-base">{account.name}</Text>
            </View>

            <View className="flex-row items-baseline gap-2">
              <Text className="text-white text-base font-normal">€</Text>
              <View className="flex-row items-baseline">
                <Text className="text-white text-2xl font-medium">{integer}</Text>
                <Text className="text-white text-base font-normal">,{decimal}</Text>
              </View>
            </View>
          </View>

          <View className="mt-4 w-full">
            <View className="h-2 w-full rounded-full overflow-hidden mb-1" style={{ backgroundColor: '#750B49' }}>
              <View
                className="h-full rounded-full"
                style={{
                  backgroundColor: '#FFFFFF',
                  width: `${account.progress}%`
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
  }

  // Regular account card
  return (
    <Pressable
      className="w-full rounded-t-3xl mb-[-20px]"
      style={{ backgroundColor: account.color }}
      onPress={() => onPress(account.id)}
    >
      <View className="flex-row justify-between items-center p-6 pb-12">
        <View className="flex-row items-center gap-2 py-2">
          <SvgIcon name={account.icon as IconName} width={24} height={24} color="#FFFFFF" />
          <Text className="text-white font-semibold text-base">{account.name}</Text>
        </View>

        <View className="flex-row items-baseline gap-2">
          <Text className="text-white text-base font-normal">€</Text>
          <View className="flex-row items-baseline">
            <Text className="text-white text-2xl font-medium">{integer}</Text>
            <Text className="text-white text-base font-normal">,{decimal}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default function AccountsScreen() {
  const router = useRouter();
  const { hideTabBar } = useTabBar();
  // Fetch accounts data
  const { data: accountsData, isLoading, refetch: refetchAccounts } = api.account.listWithBalances.useQuery({});

  // Process accounts data with integrated goal functionality
  const { accounts, totalBalance } = useMemo(() => {
    if (!accountsData) {
      return { accounts: [], totalBalance: 0 };
    }

    // Track total balance across all accounts
    let total = 0;

    // Create unified accounts with integrated goal functionality
    const unifiedAccounts: UnifiedAccount[] = accountsData.map(item => {
      const accountBalance = Number(item.balance);
      if (item.account.includeInTotal) {
        total += accountBalance;
      }

      // Treat account as MoneyAccountWithGoal to access goal fields
      const account = item.account as unknown as MoneyAccountWithGoal;

      // If it's a goal account, calculate progress
      let progress;
      if (account.isGoalAccount && account.targetAmount) {
        const targetAmount = Number(account.targetAmount);
        // Calculate progress as percentage
        progress = Math.min(100, (accountBalance / targetAmount) * 100);
      }

      return {
        id: account.id,
        name: account.name,
        icon: account.iconName || 'card',
        color: account.color || '#409FF8',
        balance: accountBalance,
        isGoalAccount: account.isGoalAccount || false,
        targetAmount: account.targetAmount ? Number(account.targetAmount) : undefined,
        progress,
        includeInTotal: account.includeInTotal || true,
      };
    });

    // Sort accounts - normal accounts first, then savings accounts
    unifiedAccounts.sort((a, b) => {
      if (a.isGoalAccount === b.isGoalAccount) {
        return b.balance - a.balance; // Secondary sort by balance (highest first)
      }
      return a.isGoalAccount ? 1 : -1; // Normal accounts first
    });

    return {
      accounts: unifiedAccounts,
      totalBalance: total
    };
  }, [accountsData]);

  const { integer, decimal } = formatCurrency(totalBalance);

  const handleAccountPress = (id: string) => {
    hideTabBar();
    // Navigate to account details using the id parameter
    router.push({
      pathname: "/(protected)/(accounts)/[id]",
      params: { id }
    });
  };

  const handleBudgetForecastPress = () => {
    alert("Coming soon");
  };

  const rightActions = [
    {
      icon: <FontAwesome5 name="cog" size={24} color="black" />,
      onPress: () => router.push("/(protected)/(accounts)"),
    },
  ];

  const handleRefresh = () => {
    refetchAccounts();
  };

  return (
    <HeaderContainer variant="secondary" rightActions={rightActions} hideBackButton={true}>
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />

        {/* Top Section with Balance */}
        <View className=" pb-10 items-center justify-center px-6">
          <View className="flex-row items-baseline justify-center gap-2 w-full">
            <Text className="text-gray-400 text-3xl font-normal">€</Text>
            <View className="flex-row items-baseline">
              <Text className="text-black text-6xl font-medium">{isLoading ? '...' : integer}</Text>
              <Text className="text-gray-400 text-3xl font-normal">{isLoading ? '' : `,${decimal}`}</Text>
            </View>
          </View>

          {/* Budget Forecast Button */}
          <Pressable
            className="mt-2 px-4 py-2 rounded-lg flex-row items-center gap-2 bg-gray-800"
            onPress={handleBudgetForecastPress}
          >
            <Text className="text-white text-sm font-semibold">Il tuo budget tra 90gg?</Text>
            <Text className="text-green-500 text-sm font-semibold">+2.5%</Text>
          </Pressable>
        </View>

        {/* Accounts List */}
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
            />
          }
        >
          {accounts.length === 0 ? (
            <View className="items-center justify-center py-8">
              <Text className="text-gray-500">Nessun conto trovato</Text>
            </View>
          ) : (
            accounts.map(account => (
              <AccountCard
                key={account.id}
                account={account}
                onPress={handleAccountPress}
              />
            ))
          )}
        </ScrollView>
      </View>
    </HeaderContainer>
  );
} 