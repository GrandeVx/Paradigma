import React, { useRef, useCallback, RefObject, useState } from 'react';
import { View, SafeAreaView, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import HeaderContainer from '@/components/layouts/_header';
import * as Haptics from 'expo-haptics';
import BottomSheet, {
  BottomSheetBackdropProps,
  BottomSheetBackdrop
} from '@gorhom/bottom-sheet';
import { BudgetBottomSheet } from '@/components/bottom-sheets/budget-bottom-sheet';
import { useTabBar } from '@/context/TabBarContext';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { SvgIcon } from '@/components/ui/svg-icon';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Helper to get category color
const getCategoryColor = (name: string, type: string) => {
  if (type === 'INCOME') return '#66BD50';

  switch (name) {
    case 'Casa': return '#E81411';
    case 'Cibo & Bevande': return '#FDAD0C';
    case 'Benessere': return '#409FF8';
    case 'Finanze': return '#03965E';
    case 'Intrattenimento': return '#FA6B97';
    case 'Trasporti': return '#7E01FB';
    default: return '#6B7280';
  }
};

// Helper to get category background color
const getCategoryBackgroundColor = (name: string) => {
  switch (name) {
    case 'Casa': return '#FEF6F5';
    case 'Cibo & Bevande': return '#FFFCF5';
    case 'Benessere': return '#F5FAFF';
    case 'Finanze': return '#F5FFFB';
    case 'Intrattenimento': return '#FFF5F8';
    case 'Trasporti': return '#FAF5FF';
    default: return '#F9FAFB';
  }
};

export default function BudgetScreen() {
  // State for current month
  const [currentDate, setCurrentDate] = useState(new Date());
  // State for optional category filtering
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[] | undefined>(undefined);

  // Get API utils
  const utils = api.useContext();

  // API queries
  const {
    data: budgetSettings,
    isLoading: isLoadingBudgets,
    refetch: refetchBudgets,
    isRefetching: isRefetchingBudgets
  } = api.budget.getCurrentSettings.useQuery({});

  const { data: allCategories, refetch: refetchCategories } = api.category.list.useQuery({});

  // Extract macro categories
  const macroCategories = allCategories?.filter(cat => cat.type === 'INCOME' || cat.type === 'EXPENSE');

  // Get transaction data for the current month
  const {
    data: transactionData,
    refetch: refetchTransactions,
    isRefetching: isRefetchingTransactions
  } = api.transaction.getMonthlySpending.useQuery({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    // Pass selected categories if any, undefined means get all transactions
    macroCategoryIds: budgetSettings?.map(budget => budget.macroCategoryId),
  });

  // Check if we have budget data
  const hasBudgets = budgetSettings && budgetSettings.length > 0;

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetchBudgets();
    refetchCategories();
    refetchTransactions();
  }, [refetchBudgets, refetchCategories, refetchTransactions]);

  // Bottom sheet setup
  const snapPoints = ['80%'];
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { hideTabBar, showTabBar } = useTabBar();

  const handleOpenBottomSheet = () => {
    hideTabBar();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRef.current?.expand();
  };

  const handleCloseBottomSheet = () => {
    showTabBar();
    bottomSheetRef.current?.close();

    // Invalidate queries when bottom sheet is closed to refresh data
    utils.budget.getCurrentSettings.invalidate();
    utils.transaction.getMonthlySpending.invalidate({
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      // Use current selected categories or undefined for all
      macroCategoryIds: selectedCategoryIds
    });
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={() => {
          showTabBar();
        }}
        enableTouchThrough={false}
        pressBehavior="close"
        style={[
          { backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10 },
          props.style
        ]}
      />
    ),
    []
  );

  // Calculate budget summary data
  const calculateBudgetSummary = () => {
    if (!budgetSettings || !transactionData) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalBudget = budgetSettings.reduce((sum: number, budget: any) => {
      // Only include expense categories in the total budget
      const category = macroCategories?.find(cat => cat.id === budget.macroCategoryId);
      if (category && category.type === 'EXPENSE') {
        return sum + Number(budget.allocatedAmount);
      }
      return sum;
    }, 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalSpent = transactionData.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const remainingBudget = totalBudget - Math.abs(totalSpent);

    return {
      totalBudget,
      totalSpent: Math.abs(totalSpent),
      remainingBudget
    };
  };

  const budgetSummary = calculateBudgetSummary();

  // Calculate category spending
  const getCategorySpending = (categoryId: string) => {
    if (!transactionData) return 0;

    return transactionData
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((transaction: any) => transaction.subCategory?.macroCategoryId === categoryId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .reduce((sum: number, transaction: any) => sum + Math.abs(Number(transaction.amount)), 0);
  };

  // Handle month navigation
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // Format month name
  const formatMonthYear = (date: Date) => {
    return format(date, 'MMMM yyyy', { locale: it });
  };

  // Helper function to filter by specific categories (for future use)
  // Example: filterByCategories(['category-id-1', 'category-id-2'])
  const filterByCategories = (categoryIds: string[]) => {
    setSelectedCategoryIds(categoryIds);
  };

  // Helper function to clear category filter and show all transactions
  // Example: clearCategoryFilter()
  const clearCategoryFilter = () => {
    setSelectedCategoryIds(undefined);
  };

  // Suppress unused variable warnings - these are utility functions for future features
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unusedHelpers = { filterByCategories, clearCategoryFilter };

  // Determine if we're refreshing
  const isRefreshing = isRefetchingBudgets || isRefetchingTransactions;


  const rightActions = [
    {
      icon: <SvgIcon name="edit" color={"#005EFD"} size={20} />,
      onPress: () => handleOpenBottomSheet()
    },
  ];


  return (
    <>
      <HeaderContainer variant="secondary" customTitle="BUDGET" rightActions={rightActions}>
        <SafeAreaView className="flex-1 bg-white">
          {isLoadingBudgets || !hasBudgets ? (
            // Empty state - no budgets set
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              }
            >
              <View className="flex-1 relative">
                {/* Background emojis */}
                <Text className="text-[96px] text-gray-500 absolute top-[185px] right-[27px]">🎁</Text>
                <Text className="text-[48px] text-gray-500 absolute top-[418px] right-[20px]">🛒</Text>
                <Text className="text-[64px] text-gray-500 absolute top-[89px] left-[126px]">🏠</Text>
                <Text className="text-[40px] text-gray-500 absolute top-[196px] left-[19px]">🍽️</Text>
                <Text className="text-[64px] text-gray-500 absolute top-[447px] left-[59px]">🎬</Text>

                {/* Content container */}
                <View className="flex-1 justify-center items-center px-16">
                  <View className="items-center">
                    <Text className="text-3xl font-semibold text-black text-center mb-2">
                      Budget mensile
                    </Text>
                    <Text className="text-sm text-gray-500 text-center mb-6">
                      Imposta il tuo budget e tieni traccia delle spese per raggiungere i tuoi obiettivi
                    </Text>
                    <Button
                      variant="primary"
                      size="lg"
                      rounded="default"
                      className="w-40"
                      onPress={handleOpenBottomSheet}
                    >
                      <Text className="text-white font-semibold">Inizia</Text>
                    </Button>
                  </View>
                </View>
              </View>
            </ScrollView>
          ) : (
            // Budget view - when budgets exist
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 72 }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              }
            >
              <View className="flex-1 p-4 gap-y-4">
                {/* Budget Summary Card */}
                <View className="bg-gray-50 rounded-3xl p-4">
                  {/* Month selector */}
                  <View className="flex-row justify-between items-center mb-4">
                    <Pressable onPress={goToPreviousMonth} className="w-10 h-10 items-center justify-center">
                      <Text className="text-black">←</Text>
                    </Pressable>
                    <Text className="text-base font-normal text-black capitalize">
                      {formatMonthYear(currentDate)}
                    </Text>
                    <Pressable onPress={goToNextMonth} disabled={
                      // check if the next month is in the future
                      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1) > new Date()
                    } className={cn("w-10 h-10 items-center justify-center",
                      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1) > new Date() ? 'opacity-50' : ''
                    )

                    }>
                      <Text className="text-black">→</Text>
                    </Pressable>
                  </View>

                  {/* Budget amount */}
                  {budgetSummary && (
                    <View className="mb-4">
                      <View className="flex-row items-baseline justify-center">
                        <Text className="text-gray-500 text-2xl">€</Text>
                        <Text className="text-black text-5xl font-medium">
                          {Math.floor(budgetSummary.remainingBudget)}
                        </Text>
                        <Text className="text-black text-2xl font-normal">
                          ,{(budgetSummary.remainingBudget % 1).toFixed(2).substring(2)}
                        </Text>
                      </View>
                      <Text className="text-gray-500 text-sm text-center">
                        ancora a disposizione per questo mese
                      </Text>
                    </View>
                  )}

                  {/* Progress bar */}
                  {budgetSummary && (
                    <View className="mb-2">
                      <View className="h-3 bg-white rounded-full w-full overflow-hidden">
                        {/* Colored segments - would need to calculate width percentages based on category spending */}
                        {budgetSettings
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          .filter((budget: any) => {
                            const cat = macroCategories?.find(c => c.id === budget.macroCategoryId);
                            return cat && cat.type === 'EXPENSE';
                          })
                          // dobbiamo effetturare un sort per quanto in percentuale influisca sul totale
                          .sort((a, b) => {
                            const spentA = getCategorySpending(a.macroCategoryId);
                            const spentB = getCategorySpending(b.macroCategoryId);
                            return spentB - spentA;
                          })
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          .map((budget: any) => {
                            const category = macroCategories?.find(cat => cat.id === budget.macroCategoryId);
                            if (!category) return null;

                            const spent = getCategorySpending(budget.macroCategoryId);
                            const percentage = (spent / budgetSummary.totalBudget) * 100;

                            return (
                              <View
                                key={budget.id}
                                style={{
                                  position: 'absolute',
                                  width: `${percentage}%`,
                                  height: '100%',
                                  backgroundColor: getCategoryColor(category.name, category.type)
                                }}
                              />
                            );
                          })}
                      </View>
                      <Text className="text-gray-500 text-xs mt-2">
                        Hai speso {formatCurrency(budgetSummary.totalSpent)} su {formatCurrency(budgetSummary.totalBudget)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Budget Categories */}
                <View className="mt-4">
                  {budgetSettings
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .filter((budget: any) => {
                      const cat = macroCategories?.find(c => c.id === budget.macroCategoryId);
                      return cat && cat.type === 'EXPENSE';
                    })
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map((budget: any) => {
                      const category = macroCategories?.find(cat => cat.id === budget.macroCategoryId);
                      if (!category) return null;

                      const budgetAmount = Number(budget.allocatedAmount);
                      const spent = getCategorySpending(budget.macroCategoryId);
                      const remaining = budgetAmount - spent;
                      const percentage = Math.min(100, (spent / budgetAmount) * 100);

                      return (
                        <View key={budget.id} className="mb-4">
                          {/* Category header */}
                          <View className="items-center mb-2">
                            <View
                              style={{ backgroundColor: getCategoryBackgroundColor(category.name) }}
                              className="flex-row items-center py-1.5 px-3 rounded-xl"
                            >
                              <Text
                                className="text-base font-medium mr-2"
                                style={{ color: getCategoryColor(category.name, category.type) }}
                              >
                                {category.icon || '📊'}
                              </Text>
                              <Text
                                className="text-sm font-semibold uppercase"
                                style={{ color: getCategoryColor(category.name, category.type) }}
                              >
                                {category.name}
                              </Text>
                            </View>
                          </View>

                          {/* Progress bar */}
                          <View className="h-3 bg-gray-50 rounded-full w-full overflow-hidden mb-2">
                            <View
                              style={{
                                width: `${percentage}%`,
                                height: '100%',
                                backgroundColor: getCategoryColor(category.name, category.type)
                              }}
                            />
                          </View>

                          {/* Details */}
                          <View className="flex-row justify-between px-6">
                            <View className="items-center">
                              <Text className="text-gray-400 text-sm">Budget</Text>
                              <Text className="text-gray-700 text-base font-medium">
                                {formatCurrency(budgetAmount)}
                              </Text>
                            </View>
                            <View className="items-center">
                              <Text className="text-gray-400 text-sm">Speso già</Text>
                              <Text className="text-gray-700 text-base font-medium">
                                {formatCurrency(spent)}
                              </Text>
                            </View>
                            <View className="items-center">
                              <Text className="text-gray-400 text-sm">Rimanente</Text>
                              <Text
                                className="text-base font-medium"
                                style={{
                                  color: remaining < 0 ? '#DE4841' :
                                    remaining < budgetAmount * 0.2 ? '#EBAE46' : '#66BD50'
                                }}
                              >
                                {remaining < 0 ? '-' : ''}{formatCurrency(Math.abs(remaining))}
                              </Text>
                            </View>
                          </View>

                          {/* Divider */}
                          <View className="h-px bg-gray-200 w-full mt-4" />
                        </View>
                      );
                    })}
                </View>

              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </HeaderContainer>

      {/* Budget Bottom Sheet */}
      <BudgetBottomSheet
        bottomSheetRef={bottomSheetRef as RefObject<BottomSheet>}
        snapPoints={snapPoints}
        renderBackdrop={renderBackdrop}
        handleClosePress={handleCloseBottomSheet}
      />
    </>
  );
} 