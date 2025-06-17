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

  // Fetch categories
  const { data: allCategories } = api.category.list.useQuery({});

  // Extract macro categories from the category data
  const macroCategories = allCategories?.filter(cat => cat.type === 'INCOME' || cat.type === 'EXPENSE');

  // Initialize budget amounts from API data
  useEffect(() => {
    if (budgetSettings) {
      const initialBudgets: Record<string, number> = {};
      budgetSettings.forEach(budget => {
        initialBudgets[budget.macroCategoryId] = Number(budget.allocatedAmount);
      });
      setBudgetAmounts(initialBudgets);
    }
  }, [budgetSettings]);

  // Calculate total budget and remaining amount
  const totalAllocated = Object.values(budgetAmounts).reduce((sum, amount) => sum + amount, 0);
  const incomeCategory = macroCategories?.find(cat => cat.type === 'INCOME');
  const incomeAmount = incomeCategory ? (budgetAmounts[incomeCategory.id] || 0) : 0;
  const remainingAmount = incomeAmount - totalAllocated;

  // Handle category amount change
  const handleAmountChange = (id: string, value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    setBudgetAmounts(prev => ({
      ...prev,
      [id]: numValue
    }));
  };

  // Handle save
  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Save each budget amount
      const savePromises = Object.entries(budgetAmounts).map(([macroCategoryId, allocatedAmount]) => {
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

  // Get category color based on type
  const getCategoryColor = (type: string, name: string) => {
    if (type === 'INCOME') return '#66BD50'; // Green for income

    // Colors for expense categories based on name
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
          showTabBar();
        } else {
          hideTabBar();
        }
      }}
    >
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-2">
          <View className="flex-1">
            <Text className="text-black text-center font-medium text-xs uppercase">
              IL TUO PIANO MENSILE
            </Text>
          </View>
          <Pressable onPress={handleClosePress} className="p-2">
            <View className="w-6 h-6 items-center justify-center">
              <Text className="text-black text-xl">×</Text>
            </View>
          </Pressable>
        </View>

        {isLoadingBudgets || !macroCategories ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Caricamento...</Text>
          </View>
        ) : (
          <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 120 }}>
            <View className="px-4 gap-y-4">
              {/* Income Section */}
              {macroCategories.filter(cat => cat.type === 'INCOME').map((category) => (
                <Pressable
                  key={category.id}
                  className="flex-row justify-between items-center bg-gray-50 p-4 rounded-xl"
                  onPress={() => setEditingCategory(category.id)}
                >
                  <View className="flex-row items-center gap-x-2">
                    <Text className="text-base font-medium text-green-500">{category.icon || '💰'}</Text>
                    <Text className="text-base font-medium text-green-500">{category.name}</Text>
                  </View>
                  {editingCategory === category.id ? (
                    <TextInput
                      className="text-base font-medium text-black text-right"
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

              {/* Divider */}
              <View className="h-px bg-gray-200 w-full" />

              {/* Remaining Amount */}
              <View className="flex-row justify-between items-center px-4">
                <Text className="text-sm font-medium text-gray-500">
                  Hai ancora a disposizione
                </Text>
                <Text className="text-sm font-medium text-gray-500">
                  {formatCurrency(remainingAmount)}
                </Text>
              </View>

              {/* Expense Categories */}
              {macroCategories.filter(cat => cat.type === 'EXPENSE').map((category) => (
                <Pressable
                  key={category.id}
                  className="flex-row justify-between items-center bg-gray-50 p-4 rounded-xl"
                  onPress={() => setEditingCategory(category.id)}
                >
                  <View className="flex-row items-center gap-x-2">
                    <Text
                      className="text-base font-medium"
                      style={{ color: getCategoryColor('EXPENSE', category.name) }}
                    >
                      {category.icon || '📊'}
                    </Text>
                    <Text
                      className="text-base font-medium"
                      style={{ color: getCategoryColor('EXPENSE', category.name) }}
                    >
                      {category.name}
                    </Text>
                  </View>
                  {editingCategory === category.id ? (
                    <TextInput
                      className="text-base font-medium text-black text-right"
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
          </BottomSheetScrollView>
        )}

        {/* Save Button */}
        <View className="absolute bottom-0 left-0 right-0 p-4 pb-9 bg-white border-t border-gray-200">
          <Button
            variant="primary"
            size="lg"
            rounded="default"
            className="w-full"
            onPress={handleSave}
            isLoading={isLoading}
            disabled={isLoadingBudgets || !macroCategories}
          >
            <Text className="text-white font-semibold">Salva</Text>
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}; 