import React, { useMemo, useRef, useState, useCallback, RefObject, useEffect } from "react";
import { View, TextInput, Pressable, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
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
import { RecurrenceOption } from "@/components/bottom-sheets/recurrence-picker-bottom-sheet";
import { RecurringBottomSheet } from "@/components/bottom-sheets/recurring-bottom-sheet";

import { api } from "@/lib/api";
import { IconName } from "@/components/ui/icons";
import { InvalidationUtils } from '@/lib/invalidation-utils';

type TransactionType = 'income' | 'expense';

// Frequency type mapping
const getFrequencyFromRecurrenceOption = (option: RecurrenceOption): {
  frequencyType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  frequencyInterval: number;
} => {
  switch (option.type) {
    case 'daily':
      return { frequencyType: 'DAILY', frequencyInterval: option.value };
    case 'weekly':
      return { frequencyType: 'WEEKLY', frequencyInterval: option.value };
    case 'monthly':
      return { frequencyType: 'MONTHLY', frequencyInterval: option.value };
    case 'yearly':
      return { frequencyType: 'YEARLY', frequencyInterval: option.value };
    default:
      return { frequencyType: 'MONTHLY', frequencyInterval: 1 };
  }
};

const getRecurrenceOptionFromFrequency = (
  frequencyType: string,
  frequencyInterval: number
): RecurrenceOption => {
  const getLabel = (type: string, interval: number) => {
    switch (type) {
      case 'DAILY':
        return interval === 1 ? 'Ogni giorno' : `Ogni ${interval} giorni`;
      case 'WEEKLY':
        return interval === 1 ? 'Ogni settimana' : `Ogni ${interval} settimane`;
      case 'MONTHLY':
        return interval === 1 ? 'Ogni mese' : `Ogni ${interval} mesi`;
      case 'YEARLY':
        return interval === 1 ? 'Ogni anno' : `Ogni ${interval} anni`;
      default:
        return 'Ogni mese';
    }
  };

  const typeMapping = {
    'DAILY': 'daily',
    'WEEKLY': 'weekly',
    'MONTHLY': 'monthly',
    'YEARLY': 'yearly'
  } as const;

  return {
    id: `${frequencyType.toLowerCase()}-${frequencyInterval}`,
    label: getLabel(frequencyType, frequencyInterval),
    value: frequencyInterval,
    days: 0,
    type: typeMapping[frequencyType as keyof typeof typeMapping] || 'monthly'
  };
};

export default function InstallmentEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const queryClient = api.useContext();
  const installmentId = params.id;

  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [totalInstallments, setTotalInstallments] = useState<number>(12);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [frequencyDays, setFrequencyDays] = useState<number>(30);
  const [recurrenceOption, setRecurrenceOption] = useState<RecurrenceOption>({
    id: 'monthly-1',
    label: 'Ogni mese',
    value: 1,
    days: 0,
    type: 'monthly'
  });

  // Queries
  const { data: installment, isLoading: isLoadingInstallment, error: installmentError } = api.recurringRule.getById.useQuery({
    ruleId: installmentId!
  }, {
    enabled: !!installmentId,
  });

  const { data: categories } = api.category.list.useQuery({
    type: transactionType === "income" ? "INCOME" : "EXPENSE"
  });
  const { data: moneyAccounts } = api.account.listWithBalances.useQuery({});

  // Mutations
  const updateMutation = api.recurringRule.update.useMutation({
    onSuccess: async () => {
      console.log('✏️ [UpdateMutation] Installment updated, invalidating cache...');

      await InvalidationUtils.invalidateTransactionRelatedQueries(queryClient, { clearCache: true });
      await InvalidationUtils.invalidateChartsQueries(queryClient);
      await InvalidationUtils.invalidateBudgetQueries(queryClient);
      await InvalidationUtils.invalidateRecurringRuleQueries(queryClient);

      router.back();
    }
  });

  const deleteMutation = api.recurringRule.delete.useMutation({
    onSuccess: async () => {
      console.log('🗑️ [DeleteMutation] Installment deleted, invalidating cache...');

      await InvalidationUtils.invalidateTransactionRelatedQueries(queryClient, { clearCache: true });
      await InvalidationUtils.invalidateChartsQueries(queryClient);
      await InvalidationUtils.invalidateBudgetQueries(queryClient);
      await InvalidationUtils.invalidateRecurringRuleQueries(queryClient);

      router.back();
    }
  });

  // Pre-populate fields when installment data is loaded
  useEffect(() => {
    if (installment) {
      setDescription(installment.description);
      setNote(installment.notes || '');
      setSelectedDate(new Date(installment.startDate));
      setSelectedAccountId(installment.moneyAccountId);
      setSelectedCategoryId(installment.subCategoryId);
      setTotalInstallments(installment.totalOccurrences || 12);

      // Set transaction type
      setTransactionType(installment.type === 'INCOME' ? 'income' : 'expense');

      // Set recurrence option
      setRecurrenceOption(getRecurrenceOptionFromFrequency(
        installment.frequencyType,
        installment.frequencyInterval
      ));

      // Set frequency values for RecurringBottomSheet
      const frequencyTypeMapping = {
        'DAILY': 'daily' as const,
        'WEEKLY': 'weekly' as const,
        'MONTHLY': 'monthly' as const,
        'YEARLY': 'yearly' as const
      };

      setFrequency(frequencyTypeMapping[installment.frequencyType] || 'monthly');

      // Calculate days based on frequency type and interval
      let days = 30; // default
      switch (installment.frequencyType) {
        case 'DAILY':
          days = installment.frequencyInterval;
          break;
        case 'WEEKLY':
          days = installment.frequencyInterval * 7;
          break;
        case 'MONTHLY':
          days = installment.frequencyInterval * 30;
          break;
        case 'YEARLY':
          days = installment.frequencyInterval * 365;
          break;
      }
      setFrequencyDays(days);
    }
  }, [installment]);

  // Calculate installment amount and remaining info
  const installmentInfo = useMemo(() => {
    if (!installment) return null;

    const originalTotalAmount = Math.abs(Number(installment.amount));
    const totalOccurrences = totalInstallments || 0;
    const paidOccurrences = installment.occurrencesGenerated || 0;
    const remainingOccurrences = totalOccurrences - paidOccurrences;

    // Original installment amount
    const originalInstallmentAmount = installment.totalOccurrences
      ? originalTotalAmount / installment.totalOccurrences
      : originalTotalAmount;

    // Amount already paid
    const amountPaid = paidOccurrences * originalInstallmentAmount;

    // New installment amount for remaining payments (using original total amount)
    const newInstallmentAmount = remainingOccurrences > 0
      ? (originalTotalAmount - amountPaid) / remainingOccurrences
      : 0;

    return {
      total: originalTotalAmount,
      totalOccurrences,
      paidOccurrences,
      remainingOccurrences,
      amountPaid,
      newInstallmentAmount,
      originalInstallmentAmount
    };
  }, [totalInstallments, installment]);

  // Bottom Sheets
  const snapPointsMoneyAccount = useMemo(() => ["50%"], []);
  const bottomSheetMoneyAccountRef = useRef<BottomSheet>(null);
  const handleOpenMoneyAccountBottomSheet = () => bottomSheetMoneyAccountRef.current?.expand();
  const handleCloseMoneyAccountBottomSheet = () => bottomSheetMoneyAccountRef.current?.close();

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


  const snapPointsInstallments = useMemo(() => ["80%"], []);
  const bottomSheetInstallmentsRef = useRef<BottomSheet>(null);
  const handleOpenInstallmentsBottomSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetInstallmentsRef.current?.expand();
  };
  const handleCloseInstallmentsBottomSheet = () => bottomSheetInstallmentsRef.current?.close();

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


  const handleFrequencyChange = (freq: 'daily' | 'weekly' | 'monthly' | 'yearly', days: number) => {
    setFrequency(freq);
    setFrequencyDays(days);

    // Update recurrence option to match
    const getLabel = (type: string, dayCount: number) => {
      if (dayCount === 14) return 'Ogni 14 giorni';
      if (dayCount === 30) return 'Ogni 30 giorni';
      if (dayCount === 60) return 'Ogni 60 giorni';
      if (dayCount === 90) return 'Ogni 90 giorni';
      if (dayCount === 180) return 'Ogni 180 giorni';
      return `Ogni ${dayCount} giorni`;
    };

    setRecurrenceOption({
      id: `${freq}-${days}`,
      label: getLabel(freq, days),
      value: days,
      days: days,
      type: freq === 'daily' ? 'daily' : 'monthly'
    });
  };

  // Handlers
  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validation
      if (!selectedAccountId) {
        throw new Error("Seleziona un conto");
      }

      if (!selectedCategoryId) {
        throw new Error("Seleziona una categoria");
      }

      const originalAmount = Math.abs(Number(installment?.amount));
      if (originalAmount <= 0) {
        throw new Error("L'importo deve essere maggiore di zero");
      }

      if (totalInstallments <= 0) {
        throw new Error("Il numero di rate deve essere maggiore di zero");
      }

      // Validate that new total installments is not less than already paid ones
      const alreadyGenerated = installment?.occurrencesGenerated || 0;
      if (alreadyGenerated > totalInstallments) {
        throw new Error(`Non puoi ridurre le rate a ${totalInstallments} perché ne sono già state generate ${alreadyGenerated}. Il minimo consentito è ${alreadyGenerated}.`);
      }

      const finalDescription = description || note || "Rata";
      const { frequencyType, frequencyInterval } = getFrequencyFromRecurrenceOption(recurrenceOption);


      // Update installment with all required fields (including totalOccurrences)
      await updateMutation.mutateAsync({
        ruleId: installmentId!,
        accountId: selectedAccountId,
        description: finalDescription,
        amount: originalAmount,
        type: transactionType === 'income' ? 'INCOME' : 'EXPENSE',
        subCategoryId: selectedCategoryId,
        startDate: selectedDate,
        frequencyType,
        frequencyInterval,
        totalOccurrences: totalInstallments,
        isInstallment: true,
        endDate: null,
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
        errorMessage = "Si è verificato un errore nel salvataggio della rata";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Elimina rata",
      "Sei sicuro di voler eliminare questa rata? Questa azione non può essere annullata.",
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
                ruleId: installmentId!,
                deleteFutureTransactions: true
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert("Errore", "Si è verificato un errore durante l'eliminazione della rata");
            }
          }
        }
      ]
    );
  };

  // Utility functions
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
      default: return 'bg-error-500';
    }
  };

  const canSaveInstallment = () => !!(selectedAccountId && selectedCategoryId && selectedDate && currentAmount > 0 && totalInstallments > 0);

  const getTransactionTypeText = () => {
    switch (transactionType) {
      case 'income': return 'Entrata';
      case 'expense': return 'Uscita';
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

  const currentAmount = installment ? Math.abs(Number(installment.amount)) : 0;
  const formattedTotalAmount = currentAmount.toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [integerPart, decimalPartInput] = formattedTotalAmount.split(',');
  const decimalPart = decimalPartInput ? `,${decimalPartInput}` : ',00';

  if (isLoadingInstallment) {
    return (
      <HeaderContainer variant="secondary" customTitle="Modifica Rata" tabBarHidden={true}>
        <SafeAreaView className="flex-1 bg-white w-screen">
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-gray-500">Caricamento...</Text>
          </View>
        </SafeAreaView>
      </HeaderContainer>
    );
  }

  if (installmentError || !installment) {
    return (
      <HeaderContainer variant="secondary" customTitle="Modifica Rata" tabBarHidden={true}>
        <SafeAreaView className="flex-1 bg-white w-screen">
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-red-500">Errore nel caricamento della rata</Text>
          </View>
        </SafeAreaView>
      </HeaderContainer>
    );
  }

  return (
    <>
      <HeaderContainer
        variant="secondary"
        customTitle="Modifica Rata"
        tabBarHidden={true}
        rightActions={[{
          icon: <SvgIcon name="delete" size={20} color="#DE4841" />,
          onPress: handleDelete
        }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <SafeAreaView className="flex-1 bg-white w-screen">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View className="flex-row justify-between items-center px-4 py-2">
                <View className="flex-col">
                  <View className="flex-row items-baseline gap-1">
                    <Text className="text-gray-400 text-2xl font-bold">€</Text>
                    <View className="flex-row items-baseline">
                      <Text className="text-primary-700 text-5xl font-bold">{integerPart}</Text>
                      <Text className="text-primary-700 text-2xl font-bold">{decimalPart}</Text>
                    </View>
                  </View>
                  <Text className="text-gray-500 text-sm mt-1">Importo totale</Text>
                </View>
                <View className={`rounded-full px-3 py-2 ${getTransactionTypeColor()}`}>
                  <Text className="text-white text-sm font-sans font-medium">{getTransactionTypeText().toUpperCase()}</Text>
                </View>
              </View>

              <View className="flex-1 px-4">
                <View className="flex-col">
                  <Pressable onPress={handleOpenCategoryBottomSheet} className="border-b border-t border-gray-200 py-4">
                    <View className="flex-row gap-8 items-center py-2">
                      <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>Categoria</Text>
                      <View className="flex-row items-center">
                        <Text className="text-black text-base">{getCategoryName()}</Text>
                      </View>
                    </View>
                  </Pressable>

                  <Pressable onPress={handleOpenMoneyAccountBottomSheet} className="border-b border-gray-200 py-4">
                    <View className="flex-row gap-8 items-center py-2">
                      <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>Conto</Text>
                      <View className="flex-row items-center gap-3">
                        <SvgIcon name={getAccountIcon()} size={16} color="gray" />
                        <Text className="text-black text-base">{getAccountName()}</Text>
                      </View>
                    </View>
                  </Pressable>

                  <Pressable onPress={handleOpenInstallmentsBottomSheet} className="border-b border-gray-200 py-4">
                    <View className="flex-row gap-8 items-center py-2">
                      <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>Rate totali</Text>
                      <View className="flex-row items-center gap-3">
                        <Text className="text-black text-base">{totalInstallments} rate</Text>
                        <SvgIcon name="edit" size={16} color="gray" />
                      </View>
                    </View>
                  </Pressable>

                  {installmentInfo && (
                    <View className="border-b border-gray-200 py-4">
                      <View className="flex-col gap-2">
                        <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>Riepilogo Rate</Text>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-600 text-sm">Rate pagate:</Text>
                          <Text className="text-green-600 text-sm font-medium">{installmentInfo.paidOccurrences}/{installmentInfo.totalOccurrences}</Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-600 text-sm">Importo pagato:</Text>
                          <Text className="text-green-600 text-sm font-medium">€{Math.abs(installmentInfo.amountPaid).toFixed(2)}</Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-600 text-sm">Rata da pagare:</Text>
                          <Text className="text-blue-600 text-sm font-medium">€{installmentInfo.newInstallmentAmount.toFixed(2)}</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  <View className="border-b border-gray-200 py-4">
                    <View className="flex-row justify-between pr-2 items-center">
                      <Pressable onPress={handleOpenDateBottomSheet} className="flex-row gap-8 items-center py-2">
                        <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>Data inizio</Text>
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
            </ScrollView>

            <View className="px-4 pb-8 pt-2">
              <Button
                variant="primary"
                size="lg"
                rounded="default"
                onPress={handleSave}
                className="w-full"
                isLoading={isLoading}
                disabled={!canSaveInstallment()}
              >
                <Text className="text-white font-semibold text-lg">Salva modifiche</Text>
              </Button>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </HeaderContainer>

      <MoneyAccountBottomSheet
        bottomSheetRef={bottomSheetMoneyAccountRef as RefObject<BottomSheet>}
        snapPoints={snapPointsMoneyAccount}
        renderBackdrop={renderBackdrop}
        handleClosePress={handleCloseMoneyAccountBottomSheet}
        selectedAccountId={selectedAccountId}
        setSelectedAccountId={setSelectedAccountId}
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

      {/* <RecurrencePickerBottomSheet
        bottomSheetRef={bottomSheetRecurrenceRef as RefObject<BottomSheet>}
        snapPoints={snapPointsRecurrence}
        renderBackdrop={renderBackdrop}
        handleClosePress={handleCloseRecurrenceBottomSheet}
        selectedRecurrence={recurrenceOption}
        onRecurrenceChange={handleRecurrenceChange}
      /> */}

      <RecurringBottomSheet
        bottomSheetRef={bottomSheetInstallmentsRef as RefObject<BottomSheet>}
        snapPoints={snapPointsInstallments}
        renderBackdrop={renderBackdrop}
        handleClosePress={handleCloseInstallmentsBottomSheet}
        numInstallments={totalInstallments}
        setNumInstallments={setTotalInstallments}
        frequency={frequency}
        setFrequency={setFrequency}
        frequencyDays={frequencyDays}
        handleFrequencyChange={handleFrequencyChange}
      />
    </>
  );
}