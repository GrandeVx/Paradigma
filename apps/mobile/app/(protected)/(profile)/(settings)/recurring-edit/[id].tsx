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
import { RecurrencePickerBottomSheet, RecurrenceOption } from "@/components/bottom-sheets/recurrence-picker-bottom-sheet";

import { api } from "@/lib/api";
import { IconName } from "@/components/ui/icons";
import { useTranslation } from 'react-i18next';
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

export default function RecurringEditScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const queryClient = api.useContext();
  const recurringId = params.id;

  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<Date>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [amount, setAmount] = useState<string>('0');
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [recurrenceOption, setRecurrenceOption] = useState<RecurrenceOption>({
    id: 'monthly-1',
    label: 'Ogni mese',
    value: 1,
    days: 0,
    type: 'monthly'
  });

  // Queries
  const { data: recurring, isLoading: isLoadingRecurring, error: recurringError } = api.recurringRule.getById.useQuery({
    ruleId: recurringId!
  }, {
    enabled: !!recurringId,
  });

  const { data: categories } = api.category.list.useQuery({
    type: transactionType === "income" ? "INCOME" : "EXPENSE"
  });
  const { data: moneyAccounts } = api.account.listWithBalances.useQuery({});

  // Mutations
  const updateMutation = api.recurringRule.update.useMutation({
    onSuccess: async () => {
      console.log('✏️ [UpdateMutation] Recurring updated, invalidating cache...');
      
      await InvalidationUtils.invalidateTransactionRelatedQueries(queryClient, { clearCache: true });
      await InvalidationUtils.invalidateChartsQueries(queryClient);
      await InvalidationUtils.invalidateBudgetQueries(queryClient);
      await InvalidationUtils.invalidateRecurringRuleQueries(queryClient);
      
      router.back();
    }
  });

  const deleteMutation = api.recurringRule.delete.useMutation({
    onSuccess: async () => {
      console.log('🗑️ [DeleteMutation] Recurring deleted, navigating away...');
      
      // Navigate away first to avoid query refetch errors
      router.back();
      
      // Then invalidate cache to update other pages
      await InvalidationUtils.invalidateTransactionRelatedQueries(queryClient, { clearCache: true });
      await InvalidationUtils.invalidateChartsQueries(queryClient);
      await InvalidationUtils.invalidateBudgetQueries(queryClient);
      await InvalidationUtils.invalidateRecurringRuleQueries(queryClient);
    }
  });

  // Pre-populate fields when recurring data is loaded
  useEffect(() => {
    if (recurring) {
      setAmount(Math.abs(Number(recurring.amount)).toString());
      setDescription(recurring.description);
      setNote(recurring.notes || '');
      setSelectedStartDate(new Date(recurring.startDate));
      setSelectedAccountId(recurring.moneyAccountId);
      setSelectedCategoryId(recurring.subCategoryId);
      
      // Set end date if exists
      if (recurring.endDate) {
        setSelectedEndDate(new Date(recurring.endDate));
        setHasEndDate(true);
      } else {
        setSelectedEndDate(null);
        setHasEndDate(false);
      }
      
      // Set transaction type
      setTransactionType(recurring.type === 'INCOME' ? 'income' : 'expense');
      
      // Set recurrence option
      setRecurrenceOption(getRecurrenceOptionFromFrequency(
        recurring.frequencyType,
        recurring.frequencyInterval
      ));
    }
  }, [recurring]);

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

  const snapPointsStartDate = useMemo(() => ["55%"], []);
  const bottomSheetStartDateRef = useRef<BottomSheet>(null);
  const handleOpenStartDateBottomSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetStartDateRef.current?.expand();
  };
  const handleCloseStartDateBottomSheet = () => bottomSheetStartDateRef.current?.close();

  const snapPointsEndDate = useMemo(() => ["55%"], []);
  const bottomSheetEndDateRef = useRef<BottomSheet>(null);
  const handleOpenEndDateBottomSheet = () => {
    if (!hasEndDate) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetEndDateRef.current?.expand();
  };
  const handleCloseEndDateBottomSheet = () => bottomSheetEndDateRef.current?.close();

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

  const handleRecurrenceChange = (option: RecurrenceOption) => {
    setRecurrenceOption(option);
  };

  const toggleEndDate = () => {
    setHasEndDate(!hasEndDate);
    if (!hasEndDate) {
      // Set default end date to 1 year from start date
      const defaultEndDate = new Date(selectedStartDate);
      defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 1);
      setSelectedEndDate(defaultEndDate);
    } else {
      setSelectedEndDate(null);
    }
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

      if (parseFloat(amount) <= 0) {
        throw new Error("L'importo deve essere maggiore di zero");
      }

      // Validate end date if set
      if (hasEndDate && selectedEndDate && selectedEndDate <= selectedStartDate) {
        throw new Error("La data di fine deve essere successiva alla data di inizio");
      }

      const finalDescription = description || note || 
        (transactionType === 'expense' ? "Spesa ricorrente" : "Entrata ricorrente");
      
      const { frequencyType, frequencyInterval } = getFrequencyFromRecurrenceOption(recurrenceOption);

      // Update recurring transaction
      await updateMutation.mutateAsync({
        ruleId: recurringId!,
        accountId: selectedAccountId,
        description: finalDescription,
        amount: parseFloat(amount),
        type: transactionType === 'income' ? 'INCOME' : 'EXPENSE',
        subCategoryId: selectedCategoryId,
        startDate: selectedStartDate,
        frequencyType,
        frequencyInterval,
        endDate: hasEndDate ? selectedEndDate : null,
        isInstallment: false,
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
        errorMessage = "Si è verificato un errore nel salvataggio della ricorrenza";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Elimina ricorrenza",
      "Sei sicuro di voler eliminare questa ricorrenza? Questa azione non può essere annullata.",
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
                ruleId: recurringId!,
                deleteFutureTransactions: true
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert("Errore", "Si è verificato un errore durante l'eliminazione della ricorrenza");
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

  const canSaveRecurring = () => !!(selectedAccountId && selectedCategoryId && selectedStartDate && amount);

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

  const formattedAmount = parseFloat(amount).toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [integerPart, decimalPartInput] = formattedAmount.split(',');
  const decimalPart = decimalPartInput ? `,${decimalPartInput}` : ',00';

  if (isLoadingRecurring) {
    return (
      <HeaderContainer variant="secondary" customTitle="Modifica Ricorrenza" tabBarHidden={true}>
        <SafeAreaView className="flex-1 bg-white w-screen">
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-gray-500">Caricamento...</Text>
          </View>
        </SafeAreaView>
      </HeaderContainer>
    );
  }

  if (recurringError || !recurring) {
    return (
      <HeaderContainer variant="secondary" customTitle="Modifica Ricorrenza" tabBarHidden={true}>
        <SafeAreaView className="flex-1 bg-white w-screen">
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-red-500">Errore nel caricamento della ricorrenza</Text>
          </View>
        </SafeAreaView>
      </HeaderContainer>
    );
  }

  return (
    <>
      <HeaderContainer
        variant="secondary"
        customTitle="Modifica Ricorrenza"
        tabBarHidden={true}
        rightActions={[{
          icon: <SvgIcon name="delete" size={20} color="#DE4841" />,
          onPress: handleDelete
        }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
        >
          <SafeAreaView className="flex-1 bg-white w-screen">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.push(`/(protected)/(profile)/(settings)/recurring-edit/edit-amount/${recurringId}`)} className="px-4 py-2">
            <View className="flex-row justify-between items-center">
              <View className="flex-col">
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-gray-400 text-2xl font-bold">€</Text>
                  <View className="flex-row items-baseline">
                    <Text className="text-primary-700 text-5xl font-bold">{integerPart}</Text>
                    <Text className="text-primary-700 text-2xl font-bold">{decimalPart}</Text>
                  </View>
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                <View className={`rounded-full px-3 py-2 ${getTransactionTypeColor()}`}>
                  <Text className="text-white text-sm font-sans font-medium">{getTransactionTypeText().toUpperCase()}</Text>
                </View>
                <SvgIcon name="edit" size={16} color="gray" />
              </View>
            </View>
          </Pressable>

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

              <View className="border-b border-gray-200 py-4">
                <View className="flex-row justify-between pr-2 items-center">
                  <Pressable onPress={handleOpenStartDateBottomSheet} className="flex-row gap-8 items-center py-2">
                    <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>Data inizio</Text>
                    <View className="flex-row items-center gap-4">
                      <SvgIcon name="calendar" size={16} color="black" />
                      <Text className="text-black text-base">{getDateText(selectedStartDate)}</Text>
                    </View>
                  </Pressable>
                  <View className="flex-row gap-12">
                    <Pressable onPress={() => setSelectedStartDate(new Date(selectedStartDate.getTime() - 24 * 60 * 60 * 1000))}>
                      <SvgIcon name="left" size={14} color="black" />
                    </Pressable>
                    <Pressable onPress={() => setSelectedStartDate(new Date(selectedStartDate.getTime() + 24 * 60 * 60 * 1000))}>
                      <SvgIcon name="right" size={14} color="black" />
                    </Pressable>
                  </View>
                </View>
              </View>

              <View className="border-b border-gray-200 py-4">
                <View className="flex-row gap-8 items-center py-2">
                  <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>Data fine</Text>
                  <Pressable onPress={toggleEndDate} className="flex-row items-center gap-3">
                    <View className={`w-5 h-5 rounded border-2 ${hasEndDate ? 'bg-blue-500 border-blue-500' : 'border-gray-300'} items-center justify-center`}>
                      {hasEndDate && <SvgIcon name="checks" size={12} color="white" />}
                    </View>
                    <Text className="text-black text-base">
                      {hasEndDate && selectedEndDate ? getDateText(selectedEndDate) : 'Nessuna scadenza'}
                    </Text>
                  </Pressable>
                  {hasEndDate && selectedEndDate && (
                    <Pressable onPress={handleOpenEndDateBottomSheet} className="ml-auto">
                      <SvgIcon name="calendar" size={16} color="black" />
                    </Pressable>
                  )}
                </View>
              </View>

              <View className="border-b border-gray-200 py-4">
                <View className="flex-row gap-8 items-center py-2">
                  <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>Frequenza</Text>
                  <Pressable onPress={handleOpenRecurrenceBottomSheet} style={{ flex: 1 }}>
                    <View className="flex-row items-center gap-4 w-full">
                      <SvgIcon name="schedule" size={16} color="black" />
                      <View className="flex-row justify-between items-center pr-4" style={{ flex: 1 }}>
                        <Text className="text-black text-base">
                          {recurrenceOption.label}
                        </Text>
                        <SvgIcon name="refresh" size={16} color="black" />
                      </View>
                    </View>
                  </Pressable>
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
              disabled={!canSaveRecurring()}
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
        bottomSheetRef={bottomSheetStartDateRef as RefObject<BottomSheet>}
        snapPoints={snapPointsStartDate}
        renderBackdrop={renderBackdrop}
        handleClosePress={handleCloseStartDateBottomSheet}
        selectedDate={selectedStartDate}
        setSelectedDate={setSelectedStartDate}
        limited={true}
      />

      {hasEndDate && selectedEndDate && (
        <DateBottomSheet
          bottomSheetRef={bottomSheetEndDateRef as RefObject<BottomSheet>}
          snapPoints={snapPointsEndDate}
          renderBackdrop={renderBackdrop}
          handleClosePress={handleCloseEndDateBottomSheet}
          selectedDate={selectedEndDate}
          setSelectedDate={setSelectedEndDate}
          limited={true}
        />
      )}

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