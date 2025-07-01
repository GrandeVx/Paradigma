import React, { useMemo, useRef, useState, useCallback, RefObject } from "react";
import { View, TextInput, Pressable, Switch, SafeAreaView } from "react-native";
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
import { RecurringBottomSheet } from "@/components/bottom-sheets/recurring-bottom-sheet";
import { RecurrencePickerBottomSheet, RecurrenceOption } from "@/components/bottom-sheets/recurrence-picker-bottom-sheet";

import { api } from "@/lib/api";
import { IconName } from "@/components/ui/icons";
import { useCurrency } from '@/hooks/use-currency';
import { useTranslation } from 'react-i18next';
import { InvalidationUtils } from '@/lib/invalidation-utils';
// Removed StackActions import - using normal router navigation instead

type TransactionType = 'income' | 'expense' | 'transfer';

// Default recurrence option (never repeat)
const defaultRecurrenceOption: RecurrenceOption = {
  id: 'none',
  label: 'Mai',
  value: 0,
  days: 0,
  type: 'none'
};

export default function SummaryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ amount: string, type: TransactionType }>();
  const queryClient = api.useContext();
  const { getCurrencySymbol } = useCurrency();

  const amount = params.amount || '0';
  const transactionType = params.type as TransactionType || 'expense';

  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedTransferAccountId, setSelectedTransferAccountId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Replace recurringDate with recurrenceOption
  const [recurrenceOption, setRecurrenceOption] = useState<RecurrenceOption>(defaultRecurrenceOption);

  const [isRecurring, setIsRecurring] = useState(false);
  const [numInstallments, setNumInstallments] = useState(3);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [frequencyDays, setFrequencyDays] = useState<number>(30);

  /*
    * Queries
  */
  const { data: categories } = api.category.list.useQuery({
    type: transactionType === "income" ? "INCOME" : "EXPENSE"
  });
  const { data: moneyAccounts } = api.account.listWithBalances.useQuery({});

  /*
    * Mutations
  */
  const expenseMutation = api.transaction.createExpense.useMutation({
    onSuccess: async (data) => {
      await InvalidationUtils.invalidateTransactionRelatedQueries(queryClient, {
        currentMonth: data.date.getMonth() + 1,
        currentYear: data.date.getFullYear(),
        clearCache: true,
      });
      router.replace("/(protected)/(home)");
    }
  });
  const incomeMutation = api.transaction.createIncome.useMutation({
    onSuccess: async (data) => {
      await InvalidationUtils.invalidateTransactionRelatedQueries(queryClient, {
        currentMonth: data.date.getMonth() + 1,
        currentYear: data.date.getFullYear(),
        clearCache: true,
      }).then(() => {
        router.replace("/(protected)/(home)");
      });
    }
  });
  const transferMutation = api.transaction.createTransfer.useMutation({
    onSuccess: async (data) => {
      await InvalidationUtils.invalidateTransactionRelatedQueries(queryClient, {
        currentMonth: data.outflowTransaction.date.getMonth() + 1,
        currentYear: data.outflowTransaction.date.getFullYear(),
        clearCache: true,
      }).then(() => {
        router.replace("/(protected)/(home)");
      });
    }
  });
  const recurringRuleMutation = api.recurringRule.create.useMutation({
    onSuccess: async () => {
      await InvalidationUtils.invalidateTransactionRelatedQueries(queryClient, {
        clearCache: true,
      }).then(() => {
        router.replace("/(protected)/(home)");
      });
    }
  });
  const convertFrequencyMutation = api.recurringRule.convertFrequency.useMutation();

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

  const snapPointsRecurring = useMemo(() => ["80%"], []);
  const bottomSheetRecurringRef = useRef<BottomSheet>(null);
  const handleOpenRecurringBottomSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRecurringRef.current?.expand();
  };
  const handleCloseRecurringBottomSheet = () => bottomSheetRecurringRef.current?.close();

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
        throw new Error(t("transaction.errors.selectAccount"));
      }

      // Verify that the selected account actually exists in the loaded accounts
      const sourceAccount = moneyAccounts?.find(item => item.account.id === selectedAccountId);
      if (!sourceAccount) {
        throw new Error(t("transaction.errors.accountNotAvailable"));
      }

      if (transactionType !== 'transfer' && !selectedCategoryId) {
        throw new Error(t("transaction.errors.selectCategory"));
      }

      if (transactionType === 'transfer') {
        if (!selectedTransferAccountId) {
          throw new Error(t("transaction.errors.selectTransferAccount"));
        }

        // Verify destination account exists
        const destAccount = moneyAccounts?.find(item => item.account.id === selectedTransferAccountId);
        if (!destAccount) {
          throw new Error(t("transaction.errors.transferAccountNotAvailable"));
        }

        if (selectedAccountId === selectedTransferAccountId) {
          throw new Error(t("transaction.errors.sameAccount"));
        }
      }

      if (parseFloat(amount) <= 0) {
        throw new Error(t("transaction.errors.amountMustBePositive"));
      }

      const description = note ? note :
        transactionType === 'expense' ? t("transaction.descriptions.expense") :
          transactionType === 'income' ? t("transaction.descriptions.income") :
            t("transaction.descriptions.transfer");

      // Handle recurring rule if isRecurring is true
      if (isRecurring) {
        try {
          // Convert UI frequency to API frequency type and interval
          const { frequencyType, frequencyInterval } = await convertFrequencyMutation.mutateAsync({
            frequencyDays
          });

          // First, create the immediate transaction for the first installment
          const singleInstallmentAmount = parseFloat(amount) / numInstallments;

          switch (transactionType) {
            case 'expense':
              await expenseMutation.mutateAsync({
                accountId: selectedAccountId,
                description: `${description} (1/${numInstallments})`,
                amount: singleInstallmentAmount,
                date: selectedDate,
                subCategoryId: selectedCategoryId || undefined,
                notes: note ? `${note} - ${t("transaction.descriptions.firstInstallmentNote")}` : t("transaction.descriptions.firstInstallment", { count: numInstallments })
              });
              break;

            case 'income':
              await incomeMutation.mutateAsync({
                accountId: selectedAccountId,
                description: `${description} (1/${numInstallments})`,
                amount: singleInstallmentAmount,
                date: selectedDate,
                subCategoryId: selectedCategoryId || undefined,
                notes: note ? `${note} - ${t("transaction.descriptions.firstInstallmentNote")}` : t("transaction.descriptions.firstInstallment", { count: numInstallments })
              });
              break;

            case 'transfer':
              if (!selectedTransferAccountId) {
                throw new Error(t("transaction.errors.selectTransferAccountError"));
              }
              await transferMutation.mutateAsync({
                fromAccountId: selectedAccountId,
                toAccountId: selectedTransferAccountId,
                amount: singleInstallmentAmount,
                date: selectedDate,
                description: `${description} (1/${numInstallments})`,
                notes: note ? `${note} - ${t("transaction.descriptions.firstInstallmentNote")}` : t("transaction.descriptions.firstInstallment", { count: numInstallments })
              });
              break;

            default:
              throw new Error(t("transaction.errors.unsupportedTransactionType"));
          }

          // Then create the recurring rule for the remaining installments (if more than 1)
          if (numInstallments > 1) {
            // Calculate next occurrence date
            const nextOccurrenceDate = new Date(selectedDate);
            nextOccurrenceDate.setDate(nextOccurrenceDate.getDate() + frequencyDays);

            // Skip recurring rules for transfers as they require special handling
            if (transactionType !== 'transfer') {
              await recurringRuleMutation.mutateAsync({
                accountId: selectedAccountId,
                description: `${description} (${t("transaction.descriptions.remainingInstallments")})`,
                amount: singleInstallmentAmount,
                type: transactionType === "income" ? "INCOME" : "EXPENSE",
                subCategoryId: selectedCategoryId || undefined,
                startDate: nextOccurrenceDate,
                frequencyType: frequencyType as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
                frequencyInterval,
                isInstallment: true,
                totalOccurrences: numInstallments - 1, // Minus the first one we already created
                notes: note ? `${note} - ${t("transaction.descriptions.remainingInstallments")}` : t("transaction.descriptions.remainingInstallmentsNote", { count: numInstallments - 1 })
              });
            } else {
              // For transfers, we show a warning that only the first installment was created
              console.warn('Le rate automatiche per i trasferimenti non sono ancora supportate. È stata creata solo la prima rata.');
            }
          }

        } catch (apiError) {
          throw new Error(t("transaction.errors.createInstallmentError"));
        }
      } else {
        // Handle single transactions
        try {
          switch (transactionType) {
            case 'expense':

              // Get full account object to verify it exists
              const expenseAccount = moneyAccounts?.find(item => item.account.id === selectedAccountId);
              if (!expenseAccount) {
                throw new Error(t("transaction.errors.accountNotAvailable"));
              }

              try {
                await expenseMutation.mutateAsync({
                  accountId: expenseAccount.account.id, // Use the account id directly from the account object
                  description,
                  amount: parseFloat(amount),
                  date: selectedDate,
                  subCategoryId: selectedCategoryId || undefined,
                  notes: note || undefined
                });
              } catch (error) {
                throw new Error(t("transaction.errors.createExpenseError", { error: error instanceof Error ? error.message : String(error) }));
              }
              break;

            case 'income':

              // Get full account object to verify it exists
              const incomeAccount = moneyAccounts?.find(item => item.account.id === selectedAccountId);
              if (!incomeAccount) {
                throw new Error(t("transaction.errors.accountNotAvailable"));
              }

              try {
                await incomeMutation.mutateAsync({
                  accountId: incomeAccount.account.id, // Use the account id directly from the account object
                  description,
                  amount: parseFloat(amount),
                  date: selectedDate,
                  subCategoryId: selectedCategoryId || undefined,
                  notes: note || undefined
                });
              } catch (error) {
                throw new Error(t("transaction.errors.createIncomeError", { error: error instanceof Error ? error.message : String(error) }));
              }
              break;

            case 'transfer':

              // Get full account objects to verify they exist
              const fromAccount = moneyAccounts?.find(item => item.account.id === selectedAccountId);
              const toAccount = moneyAccounts?.find(item => item.account.id === selectedTransferAccountId);

              if (!fromAccount) {
                throw new Error(t("transaction.errors.fromAccountNotAvailable"));
              }

              if (!toAccount) {
                throw new Error(t("transaction.errors.toAccountNotAvailable"));
              }


              try {
                await transferMutation.mutateAsync({
                  fromAccountId: fromAccount.account.id,
                  toAccountId: toAccount.account.id,
                  amount: parseFloat(amount),
                  date: selectedDate,
                  description,
                  notes: note || undefined
                });
              } catch (error) {
                throw new Error(t("transaction.errors.createTransferError", { error: error instanceof Error ? error.message : String(error) }));
              }
              break;
          }

        } catch (apiError) {
          const type = transactionType === 'expense' ? t('transaction.types.expense') :
            transactionType === 'income' ? t('transaction.types.income') :
              t('transaction.types.transfer');
          throw new Error(t("transaction.errors.createTransactionError", { type }));
        }
      }

      // Add recurring rule if recurrence is selected
      if (recurrenceOption.id !== 'none' && !isRecurring) {
        try {
          // Use the recurrence option to determine frequency type and interval
          const { frequencyType, frequencyInterval } = await convertFrequencyMutation.mutateAsync({
            frequencyDays: recurrenceOption.days
          });

          // Create a recurring rule (not an installment)
          await recurringRuleMutation.mutateAsync({
            accountId: selectedAccountId,
            description,
            amount: parseFloat(amount),
            currency: "EUR",
            type: transactionType === "income" ? "INCOME" : "EXPENSE",
            subCategoryId: selectedCategoryId || undefined,
            startDate: selectedDate, // Use selected date as start date
            frequencyType: frequencyType as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
            frequencyInterval,
            isInstallment: false, // Not an installment, but a recurring transaction
            notes: note ? `${note} (${recurrenceOption.label.toLowerCase()})` : t("transaction.descriptions.recurringNote", { frequency: recurrenceOption.label.toLowerCase() })
          });

        } catch (apiError) {
          throw new Error(t("transaction.errors.createRecurringError"));
        }
      }

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);



      // Navigation happens in the onSuccess handlers of the mutations
      // No need to navigate here as it would create a duplicate navigation
    } catch (err) {
      // Error feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String((err as { message: unknown }).message);
      } else {
        errorMessage = t("transaction.errors.saveTransactionError");
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getDateText = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return t('transaction.dates.today');
    if (date.toDateString() === tomorrow.toDateString()) return t('transaction.dates.tomorrow');
    if (date.toDateString() === yesterday.toDateString()) return t('transaction.dates.yesterday');
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
      case 'income': return t('transaction.types.income');
      case 'expense': return t('transaction.types.expense');
      case 'transfer': return t('transaction.types.transfer');
      default: return t('transaction.types.expense');
    }
  };

  const getCategoryName = () => {
    if (selectedCategoryId) {
      const subCategory = categories?.flatMap(cat => cat.subCategories).find(sc => sc.id === selectedCategoryId);
      return subCategory ? `${subCategory.icon} ${subCategory.name}` : t('transaction.placeholders.selectCategory');
    }
    return t('transaction.placeholders.selectCategory');
  };

  const getAccountName = () => {
    if (selectedAccountId) {
      const accountData = moneyAccounts?.find(item => item.account.id === selectedAccountId);
      return accountData ? accountData.account.name : t('transaction.placeholders.selectAccount');
    }
    return t('transaction.placeholders.selectAccount');
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
      return accountData ? accountData.account.name : t('transaction.placeholders.selectAccount');
    }
    return t('transaction.placeholders.selectAccount');
  };

  const formattedAmount = parseFloat(amount).toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [integerPart, decimalPartInput] = formattedAmount.split(',');
  const decimalPart = decimalPartInput ? `,${decimalPartInput}` : ',00';

  // Calculate monthly installment amount
  const calculateMonthlyAmount = () => {
    const totalAmount = parseFloat(amount);
    const monthlyAmount = totalAmount / numInstallments;
    return monthlyAmount.toLocaleString('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formattedMonthlyAmount = calculateMonthlyAmount();
  const [monthlyIntegerPart, monthlyDecimalPartInput] = formattedMonthlyAmount.split(',');
  const monthlyDecimalPart = monthlyDecimalPartInput ? `,${monthlyDecimalPartInput}` : ',00';

  const handleFrequencyChange = (newFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly', newDays: number) => {
    setFrequency(newFrequency);
    setFrequencyDays(newDays);
  };



  return (
    <>
      <HeaderContainer variant="secondary" customTitle={t('transaction.new.title')}>
        <SafeAreaView className="flex-1 bg-white w-screen">
          <View className="flex-row justify-between items-center px-4 py-2">
            <View className="flex-col">
              <View className="flex-row items-baseline gap-1">
                <Text className="text-gray-400 text-2xl font-bold">{getCurrencySymbol()}</Text>
                <View className="flex-row items-baseline">
                  <Text className="text-primary-700 text-5xl font-bold">{integerPart}</Text>
                  <Text className="text-primary-700 text-2xl font-bold">{decimalPart}</Text>
                </View>
              </View>

              {isRecurring && (
                <View className="flex-row items-baseline gap-1 ">
                  <Text className="text-gray-400 text-sm font-normal">{getCurrencySymbol()}</Text>
                  <View className="flex-row items-baseline">
                    <Text className="text-gray-500 text-xl font-medium">{monthlyIntegerPart}</Text>
                    <Text className="text-gray-500 text-sm font-normal">{monthlyDecimalPart}</Text>
                  </View>
                  <Text className="text-gray-400 text-sm font-normal">x{numInstallments}</Text>
                </View>
              )}
            </View>
            <View className={`rounded-full px-3 py-2 ${getTransactionTypeColor()}`}>
              <Text className="text-white text-sm font-sans font-medium">{getTransactionTypeText().toUpperCase()}</Text>
            </View>
          </View>

          <View className="flex-1 px-4">
            <View className="flex-col">
              <Pressable disabled={transactionType === 'transfer'} onPress={handleOpenCategoryBottomSheet} className="border-b border-t border-gray-200 py-4">
                <View className="flex-row gap-8 items-center py-2">
                  <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>{t('transaction.fields.category')}</Text>
                  <View className="flex-row items-center">
                    {transactionType === 'transfer' ? (
                      <View className="flex-row items-center gap-3">
                        <SvgIcon name="target" size={16} color="gray" />
                        <Text className="text-gray-400" style={{ fontSize: 16, fontWeight: 'regular' }}>{t('transaction.types.transfer')}</Text>
                      </View>
                    ) : (
                      <Text className="text-black text-base">{getCategoryName()}</Text>
                    )}
                  </View>
                </View>
              </Pressable>

              <Pressable onPress={handleOpenMoneyAccountBottomSheet} className="border-b border-gray-200 py-4">
                <View className="flex-row gap-8 items-center py-2">
                  <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>{transactionType === 'transfer' ? t('transaction.fields.fromAccount') : t('transaction.fields.account')}</Text>
                  <View className="flex-row items-center gap-3">
                    <SvgIcon name={getAccountIcon()} size={16} color="gray" />
                    <Text className="text-black text-base">{getAccountName()}</Text>
                  </View>
                </View>
              </Pressable>

              {transactionType === 'transfer' && (
                <Pressable onPress={handleOpenTransferAccountBottomSheet} className="border-b border-gray-200 py-4">
                  <View className="flex-row gap-8 items-center py-2">
                    <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>{t('transaction.fields.toAccount')}</Text>
                    <View className="flex-row items-center">
                      <Text className="text-black text-base">{getTransferAccountName()}</Text>
                    </View>
                  </View>
                </Pressable>
              )}

              <View className="border-b border-gray-200 py-4">
                <View className="flex-row justify-between pr-2 items-center">
                  <Pressable onPress={handleOpenDateBottomSheet} className="flex-row gap-8 items-center py-2">
                    <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>{t('transaction.fields.date')}</Text>
                    <View className="flex-row items-center gap-4">
                      <SvgIcon name="calendar" size={16} color="black" />
                      <Text className="text-black text-base">{getDateText(selectedDate)}</Text>
                    </View>
                  </Pressable>
                  <View className="flex-row gap-12">
                    <Pressable onPress={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}>
                      <SvgIcon name="left" size={14} color="black" />
                    </Pressable>
                    <Pressable disabled={new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) > new Date()} onPress={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}>
                      <SvgIcon name="right" size={14} color={new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) > new Date() ? 'gray' : 'black'} />
                    </Pressable>
                  </View>
                </View>
              </View>

              {
                (transactionType === 'expense' || transactionType === 'income') && (
                  <View className="border-b border-gray-200 py-4">
                    <View className="flex-row gap-8 items-center py-2">
                      <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>{t('transaction.fields.installments')}</Text>
                      <Pressable
                        onPress={() => {
                          if (isRecurring) {
                            handleOpenRecurringBottomSheet();
                          }
                        }}
                        className="flex flex-row justify-between items-center"
                        style={{ flex: 1 }}
                      >
                        <View className="flex-row items-center gap-4">
                          <SvgIcon name="link" size={16} color="black" />
                          {isRecurring ? (
                            <View className="flex-col">
                              <Text className="text-black text-base font-normal">{t('transaction.installments.multiple', { count: numInstallments })}</Text>
                              <Text className="text-gray-600 text-xs font-normal">
                                {frequency === 'daily' && frequencyDays === 14 && t('transaction.installments.every14Days')}
                                {frequency === 'monthly' && frequencyDays === 30 && t('transaction.installments.every30Days')}
                                {frequency === 'monthly' && frequencyDays === 60 && t('transaction.installments.every60Days')}
                                {frequency === 'monthly' && frequencyDays === 90 && t('transaction.installments.every90Days')}
                                {frequency === 'monthly' && frequencyDays === 180 && t('transaction.installments.every180Days')}
                                {!(['daily', 'monthly'].includes(frequency) && [14, 30, 60, 90, 180].includes(frequencyDays)) && frequency}
                              </Text>
                            </View>
                          ) : (
                            <Text className="text-black text-base">{t('transaction.installments.single')}</Text>
                          )}
                        </View>
                        <Switch
                          value={isRecurring}
                          onValueChange={(value) => {
                            setIsRecurring(value);
                            if (value) {
                              handleOpenRecurringBottomSheet();
                            }
                          }}
                          trackColor={{ false: "#F3F4F6", true: "#005EFD" }}
                          thumbColor="#FFFFFF"
                          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                      </Pressable>
                    </View>
                  </View>
                )
              }

              {!isRecurring && (
                <View className="border-b border-gray-200 py-4">
                  <View className="flex-row gap-8 items-center py-2">
                    <Text className="text-gray-400 font-medium" style={{ fontSize: 16 }}>{t('transaction.fields.repeat')}</Text>
                    <Pressable onPress={handleOpenRecurrenceBottomSheet} style={{ flex: 1 }}>
                      <View className="flex-row items-center gap-4 w-full">
                        <SvgIcon name="schedule" size={16} color="black" />
                        <View className="flex-row justify-between items-center pr-4" style={{ flex: 1 }}>
                          <Text className="text-black text-base">
                            {recurrenceOption.id !== 'none' ? recurrenceOption.label : t('transaction.recurrence.never')}
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
                  <Text className="text-gray-400 font-medium" style={{ fontSize: 16, marginRight: 18 }}>{t('transaction.fields.notes')}</Text>
                  <SvgIcon name="schedule" size={16} color="black" />
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder={t('transaction.placeholders.addNote')}
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
              <Text className="text-white font-semibold text-lg">{t('auth.actions.continue')}</Text>
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

      <RecurringBottomSheet
        bottomSheetRef={bottomSheetRecurringRef as RefObject<BottomSheet>}
        snapPoints={snapPointsRecurring}
        renderBackdrop={renderBackdrop}
        handleClosePress={handleCloseRecurringBottomSheet}
        numInstallments={numInstallments}
        setNumInstallments={setNumInstallments}
        frequency={frequency}
        setFrequency={setFrequency}
        frequencyDays={frequencyDays}
        handleFrequencyChange={handleFrequencyChange}
      />
    </>
  );
} 