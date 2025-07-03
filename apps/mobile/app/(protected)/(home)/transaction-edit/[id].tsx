import React, { useMemo, useRef, useState, useCallback, RefObject, useEffect } from "react";
import { View, TextInput, Pressable, SafeAreaView, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter } from "expo-router";

import { SvgIcon } from "@/components/ui/svg-icon";
import * as Haptics from 'expo-haptics';

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

import { MoneyAccountBottomSheet } from "@/components/bottom-sheets/money-account-bottom-sheet";
import { CategoryBottomSheet } from "@/components/bottom-sheets/category-bottom-sheet";
import { DateBottomSheet } from "@/components/bottom-sheets/date-bottom-sheet";
import { RecurrencePickerBottomSheet, RecurrenceOption } from "@/components/bottom-sheets/recurrence-picker-bottom-sheet";

import { api } from "@/lib/api";
import { IconName } from "@/components/ui/icons";
import { useTranslation } from 'react-i18next';
import { InvalidationUtils } from '@/lib/invalidation-utils';

type TransactionType = 'income' | 'expense' | 'transfer';

// Default recurrence option (never repeat)
const defaultRecurrenceOption: RecurrenceOption = {
  id: 'none',
  label: 'Mai',
  value: 0,
  days: 0,
  type: 'none'
};

export default function TransactionEditScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const queryClient = api.useContext();
  const transactionId = params.id;

  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedTransferAccountId, setSelectedTransferAccountId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState<string>('0');
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');

  // Replace recurringDate with recurrenceOption
  const [recurrenceOption, setRecurrenceOption] = useState<RecurrenceOption>(defaultRecurrenceOption);

  /*
    * Queries
  */
  const { data: transaction, isLoading: isLoadingTransaction, error: transactionError } = api.transaction.getById.useQuery({
    transactionId: transactionId!
  }, {
    enabled: !!transactionId,
  });

  const { data: categories } = api.category.list.useQuery({
    type: transactionType === "income" ? "INCOME" : "EXPENSE"
  });
  const { data: moneyAccounts } = api.account.listWithBalances.useQuery({});

  /*
    * Mutations
  */
  const updateMutation = api.transaction.update.useMutation({
    onSuccess: async (updatedTransaction) => {
      console.log('✏️ [UpdateMutation] Transaction updated, invalidating cache...');
      
      if (!transaction) {
        console.warn('⚠️ [UpdateMutation] Original transaction not available, using broad invalidation');
        await InvalidationUtils.invalidateTransactionRelatedQueries(queryClient, { clearCache: true });
        await InvalidationUtils.invalidateChartsQueries(queryClient);
        await InvalidationUtils.invalidateBudgetQueries(queryClient);
        router.back();
        return;
      }

      // Get original and new dates
      const originalDate = new Date(transaction.date);
      const newDate = new Date(updatedTransaction.date);
      
      const originalMonth = originalDate.getMonth() + 1;
      const originalYear = originalDate.getFullYear();
      const newMonth = newDate.getMonth() + 1;
      const newYear = newDate.getFullYear();
      
      console.log(`✏️ [UpdateMutation] Original date: ${originalMonth}/${originalYear}, New date: ${newMonth}/${newYear}`);

      // Always invalidate the new transaction's month
      await InvalidationUtils.invalidateTransactionRelatedQueries(queryClient, {
        currentMonth: newMonth,
        currentYear: newYear,
        clearCache: true,
      });
      
      await InvalidationUtils.invalidateChartsQueries(queryClient, {
        currentMonth: newMonth,
        currentYear: newYear,
      });
      
      // Invalidate budget-related queries for the new month
      await InvalidationUtils.invalidateBudgetQueries(queryClient, {
        currentMonth: newMonth,
        currentYear: newYear,
      });

      // Invalidate category-specific queries for the new transaction's category
      if (updatedTransaction.subCategoryId) {
        // Find the macro category ID from the subcategory
        const category = categories?.find(cat => 
          cat.subCategories.some(sub => sub.id === updatedTransaction.subCategoryId)
        );
        
        if (category) {
          await InvalidationUtils.invalidateCategoryQueries(queryClient, {
            categoryId: category.id,
            currentMonth: newMonth,
            currentYear: newYear,
          });
        }
      }

      // Check if category changed and invalidate original category if different
      const originalCategoryId = transaction.subCategoryId;
      const newCategoryId = updatedTransaction.subCategoryId;
      
      if (originalCategoryId && originalCategoryId !== newCategoryId) {
        // Find original category to invalidate
        const originalCategory = categories?.find(cat => 
          cat.subCategories.some(sub => sub.id === originalCategoryId)
        );
        
        if (originalCategory) {
          await InvalidationUtils.invalidateCategoryQueries(queryClient, {
            categoryId: originalCategory.id,
            currentMonth: originalMonth,
            currentYear: originalYear,
          });
        }
      }

      // If the date changed to a different month, also invalidate the original month
      if (originalMonth !== newMonth || originalYear !== newYear) {
        console.log(`🔄 [UpdateMutation] Date changed between months, also invalidating original month: ${originalMonth}/${originalYear}`);
        
        await InvalidationUtils.invalidateTransactionRelatedQueries(queryClient, {
          currentMonth: originalMonth,
          currentYear: originalYear,
          clearCache: true,
        });
        
        await InvalidationUtils.invalidateChartsQueries(queryClient, {
          currentMonth: originalMonth,
          currentYear: originalYear,
        });
        
        // Also invalidate budgets for the original month
        await InvalidationUtils.invalidateBudgetQueries(queryClient, {
          currentMonth: originalMonth,
          currentYear: originalYear,
        });

        // If category didn't change but date did, invalidate same category for original month
        if (originalCategoryId === newCategoryId && updatedTransaction.subCategoryId) {
          const category = categories?.find(cat => 
            cat.subCategories.some(sub => sub.id === updatedTransaction.subCategoryId)
          );
          
          if (category) {
            await InvalidationUtils.invalidateCategoryQueries(queryClient, {
              categoryId: category.id,
              currentMonth: originalMonth,
              currentYear: originalYear,
            });
          }
        }
      }
      
      router.back();
    }
  });

  const deleteMutation = api.transaction.delete.useMutation({
    onSuccess: async () => {
      console.log('🗑️ [DeleteMutation] Transaction deleted, invalidating cache...');
      
      if (!transaction) {
        console.warn('⚠️ [DeleteMutation] Original transaction not available, using broad invalidation');
        await InvalidationUtils.invalidateTransactionRelatedQueries(queryClient, { clearCache: true });
        await InvalidationUtils.invalidateChartsQueries(queryClient);
        await InvalidationUtils.invalidateBudgetQueries(queryClient);
        router.back();
        return;
      }

      // Get the month/year of the deleted transaction for proper cache invalidation
      const transactionDate = new Date(transaction.date);
      const transactionMonth = transactionDate.getMonth() + 1;
      const transactionYear = transactionDate.getFullYear();

      console.log(`🗑️ [DeleteMutation] Invalidating cache for transaction date: ${transactionMonth}/${transactionYear}`);

      await InvalidationUtils.invalidateTransactionRelatedQueries(queryClient, {
        currentMonth: transactionMonth,
        currentYear: transactionYear,
        clearCache: true,
      });
      
      await InvalidationUtils.invalidateChartsQueries(queryClient, {
        currentMonth: transactionMonth,
        currentYear: transactionYear,
      });
      
      // Invalidate budget-related queries for real-time budget updates
      await InvalidationUtils.invalidateBudgetQueries(queryClient, {
        currentMonth: transactionMonth,
        currentYear: transactionYear,
      });

      // Invalidate category-specific queries for the deleted transaction's category
      if (transaction.subCategoryId) {
        // Find the macro category ID from the subcategory
        const category = categories?.find(cat => 
          cat.subCategories.some(sub => sub.id === transaction.subCategoryId)
        );
        
        if (category) {
          await InvalidationUtils.invalidateCategoryQueries(queryClient, {
            categoryId: category.id,
            currentMonth: transactionMonth,
            currentYear: transactionYear,
          });
        }
      }
      
      router.back();
    }
  });

  // Pre-populate fields when transaction data is loaded
  useEffect(() => {
    if (transaction) {
      setAmount(Math.abs(Number(transaction.amount)).toString());
      setDescription(transaction.description);
      setNote(transaction.notes || '');
      setSelectedDate(new Date(transaction.date));
      setSelectedAccountId(transaction.moneyAccountId);
      setSelectedCategoryId(transaction.subCategoryId);

      // Determine transaction type
      if (transaction.transferId) {
        setTransactionType('transfer');
        // For transfers, we need to find the other transaction to determine the target account
        // This is a simplified approach - in a real app you might want to fetch the other transaction
      } else if (Number(transaction.amount) > 0) {
        setTransactionType('income');
      } else {
        setTransactionType('expense');
      }
    }
  }, [transaction]);

  /*
    * Bottom Sheets
  */
  const snapPointsMoneyAccount = useMemo(() => ["50%"], []);
  const bottomSheetMoneyAccountRef = useRef<BottomSheet>(null);
  const handleOpenMoneyAccountBottomSheet = () => bottomSheetMoneyAccountRef.current?.expand();
  const handleCloseMoneyAccountBottomSheet = () => bottomSheetMoneyAccountRef.current?.close();

  const snapPointsTransferAccount = useMemo(() => ["50%"], []);
  const bottomSheetTransferAccountRef = useRef<BottomSheet>(null);
  const handleOpenTransferAccountBottomSheet = () => bottomSheetTransferAccountRef.current?.expand();
  const handleCloseTransferAccountBottomSheet = () => bottomSheetTransferAccountRef.current?.close();

  const snapPointsCategory = useMemo(() => ["70%"], []);
  const bottomSheetCategoryRef = useRef<BottomSheet>(null);
  const handleOpenCategoryBottomSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetCategoryRef.current?.expand();
  };
  const handleCloseCategoryBottomSheet = () => bottomSheetCategoryRef.current?.close();

  const snapPointsDate = useMemo(() => ["55%"], []);
  const bottomSheetDateRef = useRef<BottomSheet>(null);
  const handleOpenDateBottomSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetDateRef.current?.expand();
  };
  const handleCloseDateBottomSheet = () => bottomSheetDateRef.current?.close();

  // New RecurrencePickerBottomSheet ref and handlers
  const snapPointsRecurrence = useMemo(() => ["55%"], []);
  const bottomSheetRecurrenceRef = useRef<BottomSheet>(null);
  const handleOpenRecurrenceBottomSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRecurrenceRef.current?.expand();
  };
  const handleCloseRecurrenceBottomSheet = () => bottomSheetRecurrenceRef.current?.close();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
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



  // Handle recurrence option change
  const handleRecurrenceChange = (option: RecurrenceOption) => {
    setRecurrenceOption(option);
  };

  /*
    * Handlers
  */
  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Enhanced validation
      if (!selectedAccountId) {
        throw new Error("Seleziona un conto");
      }

      // Verify that the selected account actually exists in the loaded accounts
      const sourceAccount = moneyAccounts?.find(item => item.account.id === selectedAccountId);
      if (!sourceAccount) {
        throw new Error("Conto selezionato non disponibile. Riprova o seleziona un altro conto.");
      }

      if (transactionType !== 'transfer' && !selectedCategoryId) {
        throw new Error("Seleziona una categoria");
      }

      if (parseFloat(amount) <= 0) {
        throw new Error("L'importo deve essere maggiore di zero");
      }

      const finalDescription = description || note ||
        (transactionType === 'expense' ? "Spesa" :
          transactionType === 'income' ? "Entrata" :
            "Trasferimento");

      // Update transaction
      await updateMutation.mutateAsync({
        transactionId: transactionId!,
        accountId: selectedAccountId,
        description: finalDescription,
        amount: parseFloat(amount),
        date: selectedDate,
        subCategoryId: selectedCategoryId || null,
        notes: note || null
      });

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (err) {
      // Error feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String((err as { message: unknown }).message);
      } else {
        errorMessage = "Si è verificato un errore nel salvataggio della transazione";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Elimina transazione",
      "Sei sicuro di voler eliminare questa transazione? Questa azione non può essere annullata.",
      [
        {
          text: "Annulla",
          style: "cancel"
        },
        {
          text: "Elimina",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync({
                transactionId: transactionId!
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert("Errore", "Si è verificato un errore durante l'eliminazione della transazione");
            }
          }
        }
      ]
    );
  };

  const getDateText = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Oggi';
    if (date.toDateString() === tomorrow.toDateString()) return 'Domani';
    if (date.toDateString() === yesterday.toDateString()) return 'Ieri';
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getTransactionTypeColor = () => {
    switch (transactionType) {
      case 'income': return 'bg-success-500';
      case 'expense': return 'bg-error-500';
      case 'transfer': return 'bg-gray-400';
      default: return 'bg-error-500';
    }
  };

  const canSaveTransaction = () => !!(selectedAccountId && (selectedCategoryId || (transactionType === 'transfer' && selectedTransferAccountId)) && selectedDate);

  const getTransactionTypeText = () => {
    switch (transactionType) {
      case 'income': return 'Entrata';
      case 'expense': return 'Uscita';
      case 'transfer': return 'Trasferimento';
      default: return 'Uscita';
    }
  };

  const getCategoryName = () => {
    if (selectedCategoryId) {
      const subCategory = categories?.flatMap(cat => cat.subCategories).find(sc => sc.id === selectedCategoryId);
      return subCategory ? `${subCategory.icon} ${subCategory.name}` : 'Seleziona categoria';
    }
    return 'Seleziona una categoria';
  };

  const getAccountName = () => {
    if (selectedAccountId) {
      const accountData = moneyAccounts?.find(item => item.account.id === selectedAccountId);
      return accountData ? accountData.account.name : 'Seleziona un conto';
    }
    return 'Seleziona un conto';
  };

  const getAccountIcon = () => {
    if (selectedAccountId) {
      const accountData = moneyAccounts?.find(item => item.account.id === selectedAccountId);
      return accountData ? (accountData.account.iconName ?? 'pig-money') as IconName : 'pig-money' as IconName;
    }
    return 'pig-money' as IconName;
  };

  const getTransferAccountName = () => {
    if (selectedTransferAccountId) {
      const accountData = moneyAccounts?.find(item => item.account.id === selectedTransferAccountId);
      return accountData ? accountData.account.name : 'Seleziona un conto';
    }
    return 'Seleziona un conto';
  };

  const formattedAmount = parseFloat(amount).toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [integerPart, decimalPartInput] = formattedAmount.split(',');
  const decimalPart = decimalPartInput ? `,${decimalPartInput}` : ',00';

  if (isLoadingTransaction) {
    return (
      <HeaderContainer variant="secondary" customTitle={t('transaction.edit.title')} tabBarHidden={true}>
        <SafeAreaView className="flex-1 bg-white w-screen">
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-gray-500">Caricamento...</Text>
          </View>
        </SafeAreaView>
      </HeaderContainer>
    );
  }

  if (transactionError || !transaction) {
    return (
      <HeaderContainer variant="secondary" customTitle={t('transaction.edit.title')} tabBarHidden={true}>
        <SafeAreaView className="flex-1 bg-white w-screen">
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-red-500">Errore nel caricamento della transazione</Text>
          </View>
        </SafeAreaView>
      </HeaderContainer>
    );
  }

  return (
    <>
      <HeaderContainer
        variant="secondary"
        customTitle={t('transaction.edit.title')}
        tabBarHidden={true}
        rightActions={[{
          icon: <SvgIcon name="delete" size={20} color="#DE4841" />,
          onPress: handleDelete
        }]}
      >
        <SafeAreaView className="flex-1 bg-white w-screen">
          <View className="flex-row justify-between items-center px-4 py-2">
            <View className="flex-col">
              <View className="flex-row items-baseline gap-1">
                <Text className="text-gray-400 text-2xl font-bold">€</Text>
                <View className="flex-row items-baseline">
                  <Text className="text-primary-700 text-5xl font-bold">{integerPart}</Text>
                  <Text className="text-primary-700 text-2xl font-bold">{decimalPart}</Text>
                </View>
              </View>
            </View>
            <View className={`rounded-full px-3 py-2 ${getTransactionTypeColor()}`}>
              <Text className="text-white text-sm font-sans font-medium">{getTransactionTypeText().toUpperCase()}</Text>
            </View>
          </View>

          <View className="flex-1 px-4">
            <View className="flex-col">
              <Pressable disabled={transactionType === 'transfer'} onPress={handleOpenCategoryBottomSheet} className="border-b border-t border-gray-200 py-4">
                <View className="flex-row gap-8 items-center py-2">
                  <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>Categoria</Text>
                  <View className="flex-row items-center">
                    {transactionType === 'transfer' ? (
                      <View className="flex-row items-center gap-3">
                        <SvgIcon name="target" size={16} color="gray" />
                        <Text className="text-gray-400" style={{ fontSize: 16, fontWeight: 'regular' }}>Trasferimento</Text>
                      </View>
                    ) : (
                      <Text className="text-black text-base">{getCategoryName()}</Text>
                    )}
                  </View>
                </View>
              </Pressable>

              <Pressable onPress={handleOpenMoneyAccountBottomSheet} className="border-b border-gray-200 py-4">
                <View className="flex-row gap-8 items-center py-2">
                  <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>{transactionType === 'transfer' ? 'Da conto' : 'Conto'}</Text>
                  <View className="flex-row items-center gap-3">
                    <SvgIcon name={getAccountIcon()} size={16} color="gray" />
                    <Text className="text-black text-base">{getAccountName()}</Text>
                  </View>
                </View>
              </Pressable>

              {transactionType === 'transfer' && (
                <Pressable onPress={handleOpenTransferAccountBottomSheet} className="border-b border-gray-200 py-4">
                  <View className="flex-row gap-8 items-center py-2">
                    <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>Al conto</Text>
                    <View className="flex-row items-center">
                      <Text className="text-black text-base">{getTransferAccountName()}</Text>
                    </View>
                  </View>
                </Pressable>
              )}

              <View className="border-b border-gray-200 py-4">
                <View className="flex-row justify-between pr-2 items-center">
                  <Pressable onPress={handleOpenDateBottomSheet} className="flex-row gap-8 items-center py-2">
                    <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>Data</Text>
                    <View className="flex-row items-center gap-4">
                      <SvgIcon name="calendar" size={16} color="black" />
                      <Text className="text-black text-base">{getDateText(selectedDate)}</Text>
                    </View>
                  </Pressable>
                  <View className="flex-row gap-12">
                    <Pressable onPress={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}>
                      <SvgIcon name="left" size={14} color="black" />
                    </Pressable>
                    <Pressable onPress={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}>
                      <SvgIcon name="right" size={14} color="black" />
                    </Pressable>
                  </View>
                </View>
              </View>

              {!transaction.transferId && (
                <View className="border-b border-gray-200 py-4">
                  <View className="flex-row gap-8 items-center py-2">
                    <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>Ripeti</Text>
                    <Pressable onPress={handleOpenRecurrenceBottomSheet} style={{ flex: 1 }}>
                      <View className="flex-row items-center gap-4 w-full">
                        <SvgIcon name="schedule" size={16} color="black" />
                        <View className="flex-row justify-between items-center pr-4" style={{ flex: 1 }}>
                          <Text className="text-black text-base">
                            {recurrenceOption.id !== 'none' ? recurrenceOption.label : 'Mai'}
                          </Text>
                          <SvgIcon name="refresh" size={16} color="black" />
                        </View>
                      </View>
                    </Pressable>
                  </View>
                </View>
              )}

              <View className="border-b border-gray-200 py-4">
                <View className="flex-row gap-x-4 items-center py-2">
                  <Text className="text-gray-400 font-medium" style={{ fontSize: 16, marginRight: 18 }}>Note</Text>
                  <SvgIcon name="schedule" size={16} color="black" />
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="Aggiungi una nota"
                    className="text-black text-base flex-1 text-left"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>
          </View>

          {error && (
            <View className="px-4 py-2 mb-4">
              <Text className="text-error-500">{error}</Text>
            </View>
          )}

          <View className="px-4 pb-8 pt-2">
            <Button
              variant="primary"
              size="lg"
              rounded="default"
              onPress={handleSave}
              className="w-full"
              isLoading={isLoading}
              disabled={!canSaveTransaction()}
            >
              <Text className="text-white font-semibold text-lg">Salva modifiche</Text>
            </Button>
          </View>
        </SafeAreaView>
      </HeaderContainer>

      <MoneyAccountBottomSheet
        bottomSheetRef={bottomSheetMoneyAccountRef as RefObject<BottomSheet>}
        snapPoints={snapPointsMoneyAccount}
        renderBackdrop={renderBackdrop}
        handleClosePress={handleCloseMoneyAccountBottomSheet}
        selectedAccountId={selectedAccountId}
        setSelectedAccountId={setSelectedAccountId}
        accountToFilter={transactionType === 'transfer' ? [selectedTransferAccountId || ''] : undefined}
      />

      <MoneyAccountBottomSheet
        bottomSheetRef={bottomSheetTransferAccountRef as RefObject<BottomSheet>}
        snapPoints={snapPointsTransferAccount}
        renderBackdrop={renderBackdrop}
        handleClosePress={handleCloseTransferAccountBottomSheet}
        selectedAccountId={selectedTransferAccountId}
        setSelectedAccountId={setSelectedTransferAccountId}
        accountToFilter={[selectedAccountId || '']}
      />

      <CategoryBottomSheet
        bottomSheetRef={bottomSheetCategoryRef as RefObject<BottomSheet>}
        snapPoints={snapPointsCategory}
        renderBackdrop={renderBackdrop}
        handleClosePress={handleCloseCategoryBottomSheet}
        type={transactionType}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
      />

      <DateBottomSheet
        bottomSheetRef={bottomSheetDateRef as RefObject<BottomSheet>}
        snapPoints={snapPointsDate}
        renderBackdrop={renderBackdrop}
        handleClosePress={handleCloseDateBottomSheet}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        limited={true}
      />

      <RecurrencePickerBottomSheet
        bottomSheetRef={bottomSheetRecurrenceRef as RefObject<BottomSheet>}
        snapPoints={snapPointsRecurrence}
        renderBackdrop={renderBackdrop}
        handleClosePress={handleCloseRecurrenceBottomSheet}
        selectedRecurrence={recurrenceOption}
        onRecurrenceChange={handleRecurrenceChange}
      />
    </>
  );
} 