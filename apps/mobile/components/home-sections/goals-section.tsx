import React, { useMemo, useEffect, useState } from 'react';
import { View, ScrollView, Pressable, RefreshControl } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOutUp,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { Decimal } from 'decimal.js';
import { useTabBar } from '@/context/TabBarContext';
import { goalsUtils } from '@/lib/mmkv-storage';
import { useCurrency } from '@/hooks/use-currency';
import { FlashList } from '@shopify/flash-list';

// Loading skeleton for goals section
const GoalsLoadingSkeleton = ({ goalsCount = 3 }: { goalsCount?: number }) => {
  const shimmerOpacity = useSharedValue(0.3);

  useEffect(() => {
    const animate = () => {
      shimmerOpacity.value = withTiming(1, { duration: 800 }, () => {
        shimmerOpacity.value = withTiming(0.3, { duration: 800 }, () => {
          runOnJS(animate)();
        });
      });
    };
    animate();
  }, [shimmerOpacity]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  const skeletonGoals = Array.from({ length: Math.max(1, goalsCount) }, (_, index) => index);

  return (
    <ScrollView
      className="flex-1 px-2 pt-2"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {skeletonGoals.map((index) => (
        <Animated.View
          key={index}
          entering={FadeInDown.delay(index * 150).duration(500)}
          style={shimmerStyle}
          className="w-full rounded-3xl bg-gray-200 mb-2 h-32"
        />
      ))}
    </ScrollView>
  );
};

// Legacy format currency helper - now using global currency hook
// const formatCurrency = (amount: number) => {
//   const [integer, decimal] = amount.toFixed(2).split('.');
//   const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
//   return {
//     integer: formattedInteger,
//     decimal: decimal
//   };
// };

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

// Animated Goal Card Component
const AnimatedGoalCard: React.FC<{
  goal: GoalAccount;
  index: number;
  onPress: (id: string) => void;
  formatCurrency: (amount: number | string, options?: { showSymbol?: boolean; showSign?: boolean; decimals?: number; }) => string;
  getCurrencySymbol: () => string;
}> = ({ goal, index, onPress, formatCurrency, getCurrencySymbol }) => {
  const formattedBalance = formatCurrency(goal.balance);
  const remaining = goal.targetAmount - goal.balance;
  const formattedTarget = formatCurrency(goal.targetAmount);
  const formattedRemaining = formatCurrency(remaining);

  const progressWidth = useSharedValue(0);
  const cardScale = useSharedValue(1);

  useEffect(() => {
    progressWidth.value = withSpring(goal.progress, {
      damping: 15,
      stiffness: 100,
    });
  }, [goal.progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handlePressIn = () => {
    cardScale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    cardScale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 150).duration(500).springify()}
      exiting={FadeOutUp.duration(300)}
      layout={Layout.springify().damping(15).stiffness(100)}
      style={cardStyle}
      className="w-full rounded-3xl bg-transparent mb-2"
    >
      <Pressable
        onPress={() => onPress(goal.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View className="w-full rounded-3xl p-6" style={{ backgroundColor: goal.color }}>
          <View className="flex-row justify-between items-center w-full">
            <View className="flex-row items-center gap-2 py-2">
              <SvgIcon name="pig-money" width={20} height={20} color="#FFFFFF" />
              <Text className="text-white font-semibold text-base">{goal.name}</Text>
            </View>

            <View className="flex-row items-baseline gap-2">
              <Text className="text-white text-base font-normal" style={{ fontFamily: 'Apfel Grotezk' }}>{getCurrencySymbol()}</Text>
              <Text className="text-white font-medium" style={{ fontFamily: 'Apfel Grotezk', fontSize: 23 }}>
                {formattedBalance.replace(getCurrencySymbol(), '').trim()}
              </Text>
            </View>
          </View>

          <View className="mt-4 w-full">
            <View className="h-3 w-full rounded-full overflow-hidden mb-1" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <Animated.View
                style={[
                  progressStyle,
                  {
                    height: '100%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 6,
                  }
                ]}
              />
            </View>
            <Text className="text-white text-xs font-medium">
              Ancora {formattedRemaining} per completare l'obiettivo di {formattedTarget}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};



export const GoalsSection: React.FC = () => {
  const router = useRouter();
  const { hideTabBar } = useTabBar();
  const { formatCurrency, getCurrencySymbol } = useCurrency();

  // Cache state
  const [cachedGoalsCount, setCachedGoalsCount] = useState<number>(0);
  const [hasGoalsInCache, setHasGoalsInCache] = useState<boolean>(false);

  // Animation values
  const contentOpacity = useSharedValue(0);

  // Fetch accounts data - OPTIMIZED
  const { data: accountsData, isLoading, refetch: refetchAccounts } = api.account.listWithBalances.useQuery({}, {
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchOnMount: false, // Use cache first
    refetchOnWindowFocus: false,
    structuralSharing: true,
  });

  // Initialize cache data on component mount
  useEffect(() => {
    const cachedCount = goalsUtils.getGoalsCountFromCache();
    const hasCache = goalsUtils.hasGoalsInCache();

    setCachedGoalsCount(cachedCount);
    setHasGoalsInCache(hasCache);
  }, []);

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

  // Update cache when new data loads
  useEffect(() => {
    if (goalAccounts && goalAccounts.length > 0) {
      goalsUtils.setGoalsCacheData(goalAccounts);

      // Update local cache state
      const goalsCount = goalsUtils.getGoalsCountFromCache();
      setCachedGoalsCount(goalsCount);
      setHasGoalsInCache(true);
    }
  }, [goalAccounts]);

  // Animate content when data loads
  useEffect(() => {
    if (!isLoading) {
      contentOpacity.value = withTiming(1, { duration: 600 });
    }
  }, [isLoading, contentOpacity]);

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

  // Determine loading states
  const isInitialLoading = isLoading;
  const shouldShowSkeleton = isInitialLoading && hasGoalsInCache;
  // Simplified: show empty state when not loading and no data (regardless of cache)
  const shouldShowEmptyState = !isInitialLoading && goalAccounts.length === 0;

  if (shouldShowSkeleton) {
    return <GoalsLoadingSkeleton goalsCount={cachedGoalsCount} />;
  }

  if (shouldShowEmptyState) {
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 p-4 h-full"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ height: '100%' }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
            />
          }
        >
          <View className="items-center justify-center py-8 gap-4 " style={{ height: '80%' }}>
            {/* Emoji Cards */}
            <View className="flex-row items-center justify-center mb-2" style={{ height: 84 }}>
              <View
                className="absolute rounded-xl p-4 left-12"
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
                <Text className="text-3xl">🎯</Text>
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
                <Text className="text-3xl">💰</Text>
              </View>
              <View
                className="absolute rounded-xl p-4 right-12"
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
                <Text className="text-3xl">🏆</Text>
              </View>
            </View>

            {/* Main Title */}
            <Text
              className="text-black text-center font-medium text-lg"
              style={{ fontFamily: 'DM Sans', fontSize: 18, lineHeight: 24 }}
            >
              Nessun obiettivo impostato
            </Text>

            {/* Subtitle */}
            <Text
              className="text-gray-500 text-center mb-4"
              style={{ fontFamily: 'DM Sans', fontSize: 16, lineHeight: 20 }}
            >
              Crea il tuo primo obiettivo di risparmio
            </Text>

            <Pressable
              className="bg-blue-500 px-6 py-3 rounded-full"
              onPress={() => router.push('/(protected)/(creation-flow)/name')}
            >
              <Text className="text-white font-semibold">Inizia ora</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }

  // If loading, show loading state
  if (isInitialLoading) {
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <View className="items-center justify-center py-8">
            <Text className="text-gray-500">Caricamento obiettivi...</Text>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <Animated.View style={contentStyle} className="flex-1">
      <FlashList
        data={goalAccounts}
        className="flex-1 px-2 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
          />
        }
        keyExtractor={(item) => item.id}
        estimatedItemSize={140}
        removeClippedSubviews={true}
        renderItem={({ item, index }) => (
          <AnimatedGoalCard
            key={item.id}
            goal={item}
            index={index}
            onPress={handleGoalPress}
            formatCurrency={formatCurrency}
            getCurrencySymbol={getCurrencySymbol}
          />
        )}
      />
    </Animated.View>
  );
}; 