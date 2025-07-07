import React, { useState, useEffect } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import BottomSheet, {
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useTabBar } from '@/context/TabBarContext';
import { api } from '@/lib/api';
import { budgetUtils } from '@/lib/mmkv-storage';
import { cn } from '@/lib/utils';


interface BudgetBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  snapPoints: string[];
  renderBackdrop: (props: BottomSheetBackdropProps) => React.ReactElement;
  handleClosePress: () => void;
}

export const BudgetBottomSheet: React.FC<BudgetBottomSheetProps> = ({
  bottomSheetRef,
  snapPoints,
  renderBackdrop,
  handleClosePress,
}) => {
  // States
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [budgetAmounts, setBudgetAmounts] = useState<Record<string, number>>({});
  const [monthlyTotalBudget, setMonthlyTotalBudget] = useState<number>(0);
  const [editingTotalBudget, setEditingTotalBudget] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  // Tab bar context
  const { hideTabBar, showTabBar } = useTabBar();

  // Get API utils for cache invalidation
  const utils = api.useContext();

  // API Queries and Mutations
  const { data: budgetSettings, isLoading: isLoadingBudgets } = api.budget.getCurrentSettings.useQuery({});
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
  const { data: allCategories } = api.category.list.useQuery({});

  // Extract only expense categories for budget allocation
  const expenseCategories = allCategories?.filter(cat => cat.type === 'EXPENSE');

  // Initialize budget amounts from API data and total budget from MMKV
  useEffect(() => {
    // Initialize expense budget amounts from API
    if (budgetSettings) {
      const initialBudgets: Record<string, number> = {};
      budgetSettings.forEach(budget => {
        initialBudgets[budget.macroCategoryId] = Number(budget.allocatedAmount);
      });
      setBudgetAmounts(initialBudgets);
    }

    // Initialize total budget from MMKV
    const storedTotalBudget = budgetUtils.getMonthlyTotalBudget();
    setMonthlyTotalBudget(storedTotalBudget);
  }, [budgetSettings]);

  // Calculate total allocated budget and remaining amount
  const totalAllocated = Object.values(budgetAmounts).reduce((sum, amount) => sum + amount, 0);
  const remainingAmount = monthlyTotalBudget - totalAllocated;

  // Handle category amount change
  const handleAmountChange = (id: string, value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    setBudgetAmounts(prev => ({
      ...prev,
      [id]: numValue
    }));
  };

  // Handle total budget change
  const handleTotalBudgetChange = (value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    setMonthlyTotalBudget(numValue);
  };

  // Handle save
  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Save total budget to MMKV
      budgetUtils.setMonthlyTotalBudget(monthlyTotalBudget);

      // Save each expense category budget amount to database
      const savePromises = Object.entries(budgetAmounts)
        .filter(([macroCategoryId]) => {
          // Only save expense categories
          const category = expenseCategories?.find(cat => cat.id === macroCategoryId);
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
      handleClosePress();
    } catch (error) {
      console.error('Error saving budget:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    });
  };



  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#B6B6B6', width: 36, height: 5 }}
      handleStyle={{
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
      }}
      containerStyle={{
        zIndex: 1000,
      }}
      backgroundStyle={{
        backgroundColor: "#FFFFFF"
      }}
      onChange={(index) => {
        if (index === -1) {
          showTabBar('budget-bottom-sheet');
        } else {
          hideTabBar('budget-bottom-sheet');
        }
      }}
    >
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-2 w-full ">
          <View className="">
            <Text className="text-black text-center font-medium uppercase" style={{ fontSize: 14 }}>
              IL TUO PIANO MENSILE
            </Text>
          </View>
          <Text onPress={handleClosePress} className="text-black text-4xl">×</Text>
        </View>

        {isLoadingBudgets || !expenseCategories ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500" style={{ fontSize: 16 }}>Caricamento...</Text>
          </View>
        ) : (
          <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 120 }}>
            <View className="px-4 gap-y-4">
              {/* Monthly Total Budget Section */}
              <Pressable
                className="flex-row justify-between items-center bg-green-50 p-4 rounded-xl"
                onPress={() => setEditingTotalBudget(true)}
              >
                <View className="flex-row items-center gap-x-2">
                  <Text className="font-medium text-green-600" style={{ fontSize: 16 }}>💰</Text>
                  <Text className="font-medium text-green-600" style={{ fontSize: 16 }}>Budget Mensile</Text>
                </View>
                {editingTotalBudget ? (
                  <TextInput
                    className="font-medium text-black text-right"
                    style={{ fontSize: 16 }}
                    keyboardType="numeric"
                    value={monthlyTotalBudget.toString()}
                    onChangeText={handleTotalBudgetChange}
                    autoFocus
                    onBlur={() => setEditingTotalBudget(false)}
                  />
                ) : (
                  <Text className="font-medium text-black" style={{ fontSize: 16 }}>
                    {formatCurrency(monthlyTotalBudget)}
                  </Text>
                )}
              </Pressable>

              {/* Divider */}
              <View className="h-px bg-gray-200 w-full" />

              {/* Remaining Amount */}
              <View className="flex-row justify-between items-center px-4">
                <Text className="font-medium text-gray-500" style={{ fontSize: 14 }}>
                  Hai ancora a disposizione
                </Text>
                <Text className={`font-medium ${remainingAmount < 0 ? 'text-red-500' : 'text-gray-500'}`} style={{ fontSize: 16 }}>
                  {formatCurrency(remainingAmount)}
                </Text>
              </View>

              {/* Expense Categories */}
              <View className={cn("flex-col gap-y-2", {
                "opacity-50": isLoadingBudgets || monthlyTotalBudget === 0
              })}>
                {expenseCategories.map((category) => (
                  <Pressable
                    key={category.id}
                    className="flex-row justify-between items-center bg-gray-50 p-4 rounded-xl"
                    onPress={() => setEditingCategory(category.id)}
                    disabled={isLoadingBudgets || monthlyTotalBudget === 0}
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
                        {category.name}
                      </Text>
                    </View>
                    {editingCategory === category.id ? (
                      <TextInput
                        className="font-medium text-black text-right"
                        style={{ fontSize: 16 }}
                        keyboardType="numeric"
                        value={budgetAmounts[category.id]?.toString() || '0'}
                        onChangeText={(value) => handleAmountChange(category.id, value)}
                        autoFocus
                        onBlur={() => setEditingCategory(null)}
                      />
                    ) : (
                      <Text className="text-base font-medium text-black">
                        {formatCurrency(budgetAmounts[category.id] || 0)}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </BottomSheetScrollView>
        )
        }

        {/* Save Button */}
        <View className="absolute bottom-0 left-0 right-0 p-4 pb-9 bg-white border-t border-gray-200">
          <Button
            variant="primary"
            size="lg"
            rounded="default"
            className="w-full"
            onPress={handleSave}
            isLoading={isLoading}
            disabled={isLoadingBudgets || !expenseCategories}
          >
            <Text className="text-white font-semibold" style={{ fontSize: 16 }}>Salva</Text>
          </Button>
        </View>
      </View >
    </BottomSheet >
  );
}; 