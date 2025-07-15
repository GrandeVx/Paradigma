import React, { useMemo, useCallback } from 'react';
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
import { useCurrency } from '@/hooks/use-currency';
import { useTranslation } from 'react-i18next';
import { FlashList } from '@shopify/flash-list';

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

// Account Card Component - OPTIMIZED with memoization and custom comparison
const AccountCard: React.FC<{
  account: UnifiedAccount;
  onPress: (id: string) => void;
  formatCurrency: (amount: number | string, options?: { showSymbol?: boolean; showSign?: boolean; decimals?: number; }) => string;
  getCurrencySymbol: () => string;
  isLast: boolean;
  t: (key: string, options?: Record<string, string | number>) => string;
}> = React.memo(({ account, onPress, formatCurrency, getCurrencySymbol, isLast, t }) => {
  // Custom formatter for the display format used in this screen
  const formatDisplayCurrency = (amount: number) => {
    const [integer, decimal] = amount.toFixed(2).split('.');
    // Format with dot as thousand separator and comma as decimal separator (Italian format)
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return {
      integer: formattedInteger,
      decimal: decimal
    };
  };

  const { integer, decimal } = formatDisplayCurrency(account.balance);
  const currencySymbol = getCurrencySymbol();

  // Savings account with progress display
  if (account.isGoalAccount && account.targetAmount && account.progress !== undefined) {
    const remaining = account.targetAmount - account.balance;
    const { integer: targetInteger, decimal: targetDecimal } = formatDisplayCurrency(account.targetAmount);
    const remainingFormatted = formatCurrency(remaining, { showSign: false });

    return (
      <Pressable
        className={`w-full bg-transparent ${isLast ? '' : 'mb-[-15px]'}`}
        onPress={() => onPress(account.id)}
      >
        <View className={`w-full p-6 ${isLast ? 'rounded-3xl' : 'rounded-t-3xl'}`} style={{ backgroundColor: account.color }}>
          <View className="flex-row justify-between items-center w-full">
            <View className="flex-row items-center gap-2 py-2">
              <SvgIcon name={account.icon as IconName} width={24} height={24} color="#FFFFFF" />
              <Text className="text-white font-semibold text-base">{account.name}</Text>
            </View>

            <View className="flex-row items-baseline gap-2">
              <Text className="text-white text-base font-normal">{currencySymbol}</Text>
              <View className="flex-row items-baseline">
                <Text className="text-white text-2xl font-medium" style={{ fontFamily: 'Apfel Grotezk' }}>{integer}</Text>
                <Text className="text-white text-base font-normal" style={{ fontFamily: 'Apfel Grotezk' }}>,{decimal}</Text>
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
              {t('accounts.goalProgress', {
                amount: remainingFormatted,
                symbol: currencySymbol,
                target: `${targetInteger},${targetDecimal}`
              })}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  // Regular account card
  return (
    <Pressable
      className={`w-full ${isLast ? 'rounded-3xl' : 'rounded-t-3xl'} mb-[-20px]`}
      style={{ backgroundColor: account.color }}
      onPress={() => onPress(account.id)}
    >
      <View className={`flex-row justify-between items-center ${isLast ? 'py-6 px-6' : 'p-6 pb-12'}`}>
        <View className="flex-row items-center gap-2 py-2">
          <SvgIcon name={account.icon as IconName} width={24} height={24} color="#FFFFFF" />
          <Text className="text-white font-semibold text-base">{account.name}</Text>
        </View>

        <View className="flex-row items-baseline gap-2">
          <Text className="text-white text-base font-normal">{currencySymbol}</Text>
          <View className="flex-row items-baseline">
            <Text className="text-white text-2xl font-medium">{integer}</Text>
            <Text className="text-white text-base font-normal">,{decimal}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo optimization
  return (
    prevProps.account.id === nextProps.account.id &&
    prevProps.account.balance === nextProps.account.balance &&
    prevProps.account.name === nextProps.account.name &&
    prevProps.account.color === nextProps.account.color &&
    prevProps.account.progress === nextProps.account.progress &&
    prevProps.isLast === nextProps.isLast
    // Skip comparing functions as they should be stable
  );
});

export default function AccountsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // Currency hook
  const { formatCurrency, getCurrencySymbol } = useCurrency();

  // Fetch accounts data with controlled refetching - OPTIMIZED
  const { data: accountsData, isLoading, refetch: refetchAccounts } = api.account.listWithBalances.useQuery({}, {
    refetchOnWindowFocus: false, // Prevent automatic refetch on focus
    refetchOnMount: false, // Prevent automatic refetch on mount - rely on cache
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnReconnect: false, // Prevent refetch on network reconnect
    // Enable structural sharing for better performance
    structuralSharing: true,
    // Use query key for better deduplication
    enabled: true,
  });

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

  // Memoized formatter for the total balance display
  const formatDisplayCurrency = useMemo(() => (amount: number) => {
    const [integer, decimal] = amount.toFixed(2).split('.');
    // Format with dot as thousand separator and comma as decimal separator (Italian format)
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return {
      integer: formattedInteger,
      decimal: decimal
    };
  }, []);

  const { integer, decimal } = useMemo(() => formatDisplayCurrency(totalBalance), [formatDisplayCurrency, totalBalance]);
  const currencySymbol = useMemo(() => getCurrencySymbol(), [getCurrencySymbol]);

  // Memoized callback functions to prevent unnecessary re-renders
  const handleAccountPress = useCallback((id: string) => {
    // Navigate to account details using the id parameter
    router.push({
      pathname: "/(protected)/(accounts)/[id]",
      params: { id }
    });
  }, [router]);

  const handleBudgetForecastPress = useCallback(() => {
    alert(t('accounts.comingSoon'));
  }, [t]);

  const rightActions = useMemo(() => [
    {
      icon: <FontAwesome5 name="plus" size={16} color="black" />,
      onPress: () => router.push("/(protected)/(creation-flow)/name"),
    },
  ], [router]);

  const handleRefresh = useCallback(() => {
    refetchAccounts();
  }, [refetchAccounts]);

  return (
    <HeaderContainer variant="secondary" rightActions={rightActions} hideBackButton={true}>
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />

        {/* Top Section with Balance */}
        <View className="pb-10 items-center justify-center px-6">
          <View className="flex-row items-baseline justify-center w-full max-w-sm">
            <Text className="text-gray-400 text-3xl font-normal">{currencySymbol}</Text>
            <View className="flex-row items-baseline flex-shrink">
              <Text
                className="text-black font-medium flex-shrink-0"
                style={{ fontFamily: 'Apfel Grotezk Mittel', fontSize: 64 }}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.7}
              >
                {isLoading ? '...' : integer}
              </Text>
              <Text
                className="text-gray-400 font-normal flex-shrink-0"
                style={{ fontFamily: 'Apfel Grotezk', fontSize: 32 }}
                numberOfLines={1}
              >
                {isLoading ? '' : `,${decimal}`}
              </Text>
            </View>
          </View>

          {/* Budget Forecast Button */}
          <Pressable
            className="mt-2 px-4 py-2 rounded-lg flex-row items-center gap-2 bg-gray-800"
            onPress={handleBudgetForecastPress}
          >
            <Text className="text-white text-sm font-semibold">{t('accounts.budgetForecast')}</Text>
            <Text className="text-green-500 text-sm font-semibold">+2.5%</Text>
          </Pressable>
        </View>

        {/* Accounts List - Optimized with FlatList */}
        {accounts.length === 0 ? (
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
            <View className="items-center justify-center py-8">
              <Text className="text-gray-500">{t('accounts.noAccountsFound')}</Text>
            </View>
          </ScrollView>
        ) : (
          <FlashList
            data={accounts}
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 12 }}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
              />
            }
            keyExtractor={(item) => item.id}
            estimatedItemSize={80}
            removeClippedSubviews={true}
            renderItem={({ item, index }) => (
              <AccountCard
                account={item}
                onPress={handleAccountPress}
                formatCurrency={formatCurrency}
                getCurrencySymbol={getCurrencySymbol}
                isLast={index === accounts.length - 1}
                t={t}
              />
            )}
            ListFooterComponent={<View className="h-20" />}
          />
        )}
      </View>
    </HeaderContainer>
  );
} 