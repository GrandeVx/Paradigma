import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Pressable, TextInput, ScrollView, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import HeaderContainer from '@/components/layouts/_header';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/api';
import { budgetUtils } from '@/lib/mmkv-storage';
import { cn } from '@/lib/utils';
import { SvgIcon } from '@/components/ui/svg-icon';
import { router } from 'expo-router';
import { useLocalizedCategories } from '@/hooks/useLocalizedCategories';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated';

export default function BudgetManagementScreen() {
  const { translations } = useLocalizedCategories();
  const { t } = useTranslation();

  // States
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingIncome, setEditingIncome] = useState<boolean>(false);
  const [budgetAmounts, setBudgetAmounts] = useState<Record<string, number>>({});
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Animation values
  const contentOpacity = useSharedValue(0);

  // Get API utils for cache invalidation
  const utils = api.useContext();

  // API Queries and Mutations
  const {
    data: budgetSettings,
    isLoading: isLoadingBudgets,
    refetch: refetchBudgets,
    isRefetching: isRefetchingBudgets
  } = api.budget.getCurrentSettings.useQuery({});

  const setBudgetMutation = api.budget.setAmount.useMutation({
    onSuccess: () => {
      // Invalidate relevant queries after successful mutation
      utils.budget.getCurrentSettings.invalidate();

      // Also invalidate transaction data for the current month
      const currentDate = new Date();
      utils.transaction.getMonthlySpending.invalidate({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        // Invalidate all category combinations
        macroCategoryIds: undefined
      });
    }
  });

  // Fetch categories (only expense categories for budget allocation)
  const {
    data: allCategories,
    refetch: refetchCategories,
    isRefetching: isRefetchingCategories
  } = api.category.list.useQuery({}, {
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 60 * 24 * 7, // 1 week
    refetchOnWindowFocus: false,
  });

  // Extract only expense categories for budget allocation - memoized
  const expenseCategories = useMemo(() =>
    allCategories?.filter(cat => cat.type === 'EXPENSE') || [],
    [allCategories]
  );

  // Initialize budget amounts from API data and income from MMKV
  useEffect(() => {
    if (budgetSettings) {
      const initialBudgets: Record<string, number> = {};
      budgetSettings.forEach(budget => {
        initialBudgets[budget.macroCategoryId] = Number(budget.allocatedAmount);
      });
      setBudgetAmounts(initialBudgets);
      setHasUnsavedChanges(false);
    }

    // Initialize income from MMKV - start at 0 if not defined
    const storedIncome = budgetUtils.getMonthlyTotalBudget();
    setMonthlyIncome(storedIncome || 0);
  }, [budgetSettings]);

  // Animate content when data loads
  useEffect(() => {
    if (!isLoadingBudgets && expenseCategories.length > 0) {
      contentOpacity.value = withTiming(1, { duration: 400 });
    }
  }, [isLoadingBudgets, expenseCategories.length]);

  // Calculate remaining amount - memoized
  const remainingAmount = useMemo(() => {
    const totalAllocated = Object.values(budgetAmounts).reduce((sum, amount) => sum + amount, 0);
    return monthlyIncome - totalAllocated;
  }, [budgetAmounts, monthlyIncome]);

  // Handle category amount change
  const handleAmountChange = useCallback((id: string, value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    setBudgetAmounts(prev => ({
      ...prev,
      [id]: numValue
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Handle income change
  const handleIncomeChange = useCallback((value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    setMonthlyIncome(numValue);
    setHasUnsavedChanges(true);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetchBudgets();
    refetchCategories();
  }, [refetchBudgets, refetchCategories]);

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      setIsLoading(true);

      // Save income to MMKV (we can store it as monthly total budget)
      budgetUtils.setMonthlyTotalBudget(monthlyIncome);

      // Save each expense category budget amount to database
      const savePromises = Object.entries(budgetAmounts)
        .filter(([macroCategoryId]) => {
          // Only save expense categories
          const category = expenseCategories.find(cat => cat.id === macroCategoryId);
          return category && category.type === 'EXPENSE';
        })
        .map(([macroCategoryId, allocatedAmount]) => {
          return setBudgetMutation.mutateAsync({
            macroCategoryId,
            allocatedAmount
          });
        });

      await Promise.all(savePromises);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setHasUnsavedChanges(false);

      // Navigate back to budget index
      router.back();
    } catch (error) {
      console.error('Error saving budget:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Errore', 'Si è verificato un errore durante il salvataggio del budget.');
    } finally {
      setIsLoading(false);
    }
  }, [monthlyIncome, budgetAmounts, expenseCategories, setBudgetMutation]);

  // Handle back navigation with unsaved changes warning
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Modifiche non salvate',
        'Hai delle modifiche non salvate. Vuoi salvarle prima di uscire?',
        [
          {
            text: 'Annulla',
            style: 'cancel',
          },
          {
            text: 'Esci senza salvare',
            style: 'destructive',
            onPress: () => router.back(),
          },
          {
            text: 'Salva ed esci',
            onPress: handleSave,
          },
        ]
      );
    } else {
      router.back();
    }
  }, [hasUnsavedChanges, handleSave]);

  // Header actions
  const leftActions = useMemo(() => [
    {
      icon: <SvgIcon name="left" color="#111827" size={24} />,
      onPress: handleBack
    },
  ], [handleBack]);

  // Animated styles
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const isRefreshing = isRefetchingBudgets || isRefetchingCategories;

  if (isLoadingBudgets || !expenseCategories.length) {
    return (
      <HeaderContainer variant="secondary" customTitle="IL TUO BUDGET MENSILE" onBackPress={handleBack}>
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500" style={{ fontSize: 16 }}>{t('common.loading')}</Text>
          </View>
        </SafeAreaView>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer
      variant="secondary"
      customTitle="IL TUO BUDGET MENSILE"
      leftActions={leftActions}
      tabBarHidden={true}
    >
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        >
          <Animated.View
            style={contentStyle}
            className="flex-1 p-4 gap-y-4"
          >
            {/* Income Section */}
            <Animated.View
              entering={FadeInDown.duration(400).springify()}
              className="bg-gray-50 rounded-3xl p-3"
            >
              <Pressable
                className="flex-row items-center justify-between py-3 px-4"
                onPress={() => setEditingIncome(true)}
              >
                <View className="flex-row items-center gap-x-2">
                  <Text className="text-green-600 font-medium" style={{ fontSize: 16 }}>💰</Text>
                  <Text className="text-green-600 font-medium" style={{ fontSize: 16 }}>Entrate</Text>
                </View>
                {editingIncome ? (
                  <TextInput
                    className="text-black font-medium text-right"
                    style={{ fontSize: 16, fontFamily: 'ApfelGrotezkMittel' }}
                    keyboardType="numeric"
                    value={monthlyIncome.toString()}
                    onChangeText={handleIncomeChange}
                    autoFocus
                    onBlur={() => setEditingIncome(false)}
                    placeholder="0"
                  />
                ) : (
                  <Text className="text-black font-medium" style={{ fontSize: 16, fontFamily: 'ApfelGrotezkMittel' }}>
                    € {monthlyIncome.toFixed(2).replace('.', ',')}
                  </Text>
                )}
              </Pressable>
            </Animated.View>

            {/* Divider */}
            <View className="h-px bg-gray-200 w-full" />

            {/* Categories Section */}
            <View className="gap-y-2">
              {monthlyIncome === 0 ? (
                /* No Income Message */
                <Animated.View
                  entering={FadeInDown.delay(100).duration(400).springify()}
                  className="flex-row items-center justify-center py-4 px-4"
                >
                  <Text className="text-gray-400 font-medium text-center" style={{ fontSize: 14 }}>
                    Imposta prima le tue entrate mensili per allocare il budget
                  </Text>
                </Animated.View>
              ) : (
                /* Remaining Amount */
                <Animated.View
                  entering={FadeInDown.delay(100).duration(400).springify()}
                  className="flex-row items-center justify-between py-0 px-4"
                >
                  <Text className="text-gray-500 font-medium" style={{ fontSize: 14 }}>
                    Hai ancora a disposizione
                  </Text>
                  <Text
                    className={`font-medium ${remainingAmount < 0 ? 'text-red-500' : 'text-gray-500'}`}
                    style={{ fontSize: 14 }}
                  >
                    € {Math.abs(remainingAmount).toFixed(2).replace('.', ',')}
                  </Text>
                </Animated.View>
              )}

              {/* Expense Categories */}
              {expenseCategories.map((category, index) => {
                // Get localized category name
                const localizedName = category.key && translations.macro[category.key]
                  ? translations.macro[category.key]
                  : category.name;

                const categoryBudget = budgetAmounts[category.id] || 0;

                return (
                  <Animated.View
                    key={category.id}
                    entering={FadeInDown.delay((index + 2) * 50).duration(400).springify()}
                    className={`bg-gray-50 rounded-3xl p-3 ${monthlyIncome === 0 ? 'opacity-50' : ''
                      }`}
                  >
                    <Pressable
                      className={`flex-row items-center justify-between py-3 px-4 ${monthlyIncome === 0 ? 'opacity-50' : ''
                        }`}
                      onPress={() => monthlyIncome > 0 && setEditingCategory(category.id)}
                      disabled={isLoading || monthlyIncome === 0}
                    >
                      <View className="flex-row items-center gap-x-2">
                        <Text
                          className="font-medium"
                          style={{ color: category.color, fontSize: 16 }}
                        >
                          {category.icon || '📊'}
                        </Text>
                        <Text
                          className="font-medium"
                          style={{ color: category.color, fontSize: 16 }}
                        >
                          {localizedName}
                        </Text>
                      </View>

                      {editingCategory === category.id ? (
                        <TextInput
                          className="text-black font-medium text-right"
                          style={{ fontSize: 16, fontFamily: 'ApfelGrotezkMittel' }}
                          keyboardType="numeric"
                          value={budgetAmounts[category.id]?.toString() || '0'}
                          onChangeText={(value) => handleAmountChange(category.id, value)}
                          autoFocus
                          onBlur={() => setEditingCategory(null)}
                          placeholder="0"
                        />
                      ) : (
                        <Text className="text-black font-medium" style={{ fontSize: 16, fontFamily: 'ApfelGrotezkMittel' }}>
                          € {categoryBudget.toFixed(2).replace('.', ',')}
                        </Text>
                      )}
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Floating Save Button */}
        <Animated.View
          entering={FadeIn.delay(800).duration(400)}
          className="absolute bottom-0 left-0 right-0 p-4 pb-9 bg-white border-t border-gray-200"
        >
          <Button
            variant="primary"
            size="lg"
            rounded="default"
            className={cn("w-full", {
              "opacity-75": !hasUnsavedChanges || monthlyIncome === 0
            })}
            onPress={handleSave}
            isLoading={isLoading}
            disabled={isLoading || !hasUnsavedChanges || monthlyIncome === 0}
          >
            <Text className="text-white font-semibold" style={{ fontSize: 16 }}>
              Save
            </Text>
          </Button>
        </Animated.View>
      </SafeAreaView>
    </HeaderContainer>
  );
}