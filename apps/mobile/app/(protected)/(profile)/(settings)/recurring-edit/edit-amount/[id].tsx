import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter } from "expo-router";
import { NumericKeyboard } from "@/components/primitives/NumericKeyboard";
import { SvgIcon } from "@/components/ui/svg-icon";
import { api } from "@/lib/api";
import { IconName } from "@/components/ui";
import * as Haptics from 'expo-haptics';
import { InvalidationUtils } from '@/lib/invalidation-utils';

export default function EditRecurringAmount() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [amount, setAmount] = useState('0');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDecimalActive, setIsDecimalActive] = useState(false);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [recurringDescription, setRecurringDescription] = useState('');
  const [recurringType, setRecurringType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryClient = api.useContext();

  // Get recurring transaction details
  const { data: recurringData, isLoading: isLoadingRecurring } = api.recurringRule.getById.useQuery(
    { ruleId: id! },
    { enabled: !!id }
  );

  // Update recurring rule mutation
  const updateMutation = api.recurringRule.update.useMutation({
    onSuccess: async () => {
      console.log('✏️ [UpdateAmountMutation] Recurring amount updated, invalidating cache...');
      
      // Invalidate the specific recurring rule query so the edit page reflects the new amount
      await queryClient.recurringRule.getById.invalidate({ ruleId: id! });
      
      // Invalidate the list of recurring rules
      await queryClient.recurringRule.list.invalidate();
      
      // Invalidate other related queries
      await InvalidationUtils.invalidateTransactionRelatedQueries(queryClient, { clearCache: true });
      await InvalidationUtils.invalidateChartsQueries(queryClient);
      await InvalidationUtils.invalidateBudgetQueries(queryClient);
      
      setIsLoading(false);
      router.back();
    },
    onError: (error) => {
      setError(error.message || "Errore nell'aggiornamento dell'importo");
      setIsLoading(false);
    }
  });

  // Populate initial data when recurring data is loaded
  useEffect(() => {
    if (recurringData) {
      const currentAmountValue = Math.abs(Number(recurringData.amount));
      setCurrentAmount(currentAmountValue);
      setAmount(currentAmountValue.toString());
      setRecurringDescription(recurringData.description);
      setRecurringType(recurringData.type);
      
      // If amount has decimals, activate decimal mode
      if (currentAmountValue.toString().includes('.')) {
        setIsDecimalActive(true);
      }
    }
  }, [recurringData]);

  // Trigger animation when amount changes
  useEffect(() => {
    if (amount !== '0') {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [amount]);

  const handleNumberPress = (number: string) => {
    if (amount === '0') {
      setAmount(number);
    } else {
      setAmount((prev) => prev + number);
    }
  };

  const handleDeletePress = () => {
    if (amount.length > 1) {
      const toRemove = amount[amount.length - 1];
      setAmount((prev) => prev.slice(0, -1));
      if (toRemove === '.') {
        setIsDecimalActive(false);
      }
    } else {
      setAmount('0');
    }
  };

  const handleCommaPress = () => {
    if (!amount.includes('.')) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setAmount((prev) => prev + '.');
      setIsDecimalActive(true);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newAmount = parseFloat(amount);
      
      if (newAmount <= 0) {
        throw new Error("L'importo deve essere maggiore di zero");
      }

      if (newAmount === currentAmount) {
        // No change in amount, just go back
        router.back();
        return;
      }

      if (!recurringData) {
        throw new Error("Dati della ricorrenza non disponibili");
      }

      // Update the recurring rule with new amount (keeping other fields the same)
      await updateMutation.mutateAsync({
        ruleId: id!,
        amount: newAmount,
        type: recurringType,
        frequencyType: recurringData.frequencyType,
        frequencyInterval: recurringData.frequencyInterval,
        accountId: recurringData.moneyAccountId!,
        description: recurringData.description,
        startDate: new Date(recurringData.startDate),
        subCategoryId: recurringData.subCategoryId,
        isInstallment: recurringData.isInstallment,
        endDate: recurringData.endDate ? new Date(recurringData.endDate) : null,
        notes: recurringData.notes
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nell'aggiornamento dell'importo");
      setIsLoading(false);
    }
  };

  // Format amount with currency symbol
  const formattedAmount = `${parseFloat(amount).toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const getTransactionTypeColor = () => {
    return recurringType === 'INCOME' ? '#66BD50' : '#DE4841';
  };

  const getTransactionTypeText = () => {
    return recurringType === 'INCOME' ? 'Entrata' : 'Uscita';
  };

  if (isLoadingRecurring) {
    return (
      <HeaderContainer variant="secondary" customTitle="Modifica Importo" tabBarHidden={true}>
        <View className="flex-1 bg-white items-center justify-center">
          <Text className="text-gray-500">Caricamento...</Text>
        </View>
      </HeaderContainer>
    );
  }

  if (!recurringData) {
    return (
      <HeaderContainer variant="secondary" customTitle="Modifica Importo" tabBarHidden={true}>
        <View className="flex-1 bg-white items-center justify-center">
          <Text className="text-red-500">Errore nel caricamento della ricorrenza</Text>
        </View>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer variant="secondary" customTitle="Modifica Importo" tabBarHidden={true}>
      <View className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-4">
          <View className="w-full justify-center text-center flex flex-col items-center gap-2 mb-4">
            <Text className="text-gray-500 text-center">Aggiorna l'importo per</Text>
            <View className="flex-row items-center gap-2 justify-center">
              <Text className="font-semibold font-sans text-lg">{recurringDescription}</Text>
            </View>
            <View 
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: getTransactionTypeColor() }}
            >
              <Text className="text-white text-sm font-medium">
                {getTransactionTypeText().toUpperCase()}
              </Text>
            </View>
          </View>

          <View className="flex flex-row items-center gap-2 justify-center">
            <Text className="text-gray-400 text-5xl font-bold">€</Text>
            <View className={`flex flex-row items-center ${isAnimating ? 'scale-110' : 'scale-100'}`}>
              <Text className={`text-7xl font-bold ${formattedAmount.split(',')[0] === '0' ? 'text-gray-400' : 'text-black'}`}>
                {formattedAmount.split(',')[0]}
              </Text>
              <Text className={`text-4xl font-bold ${isDecimalActive ? (formattedAmount.split(',')[0] === '0' ? 'text-gray-400' : 'text-black') : 'text-gray-300'}`}>
                ,
              </Text>
              <Text className={`text-4xl font-bold ${isDecimalActive ? (formattedAmount.split(',')[0] === '0' ? 'text-gray-400' : 'text-black') : 'text-gray-300'}`}>
                {formattedAmount.split(',')[1]}
              </Text>
            </View>
          </View>

          {error && (
            <Text className="text-red-500 mt-4 text-center">{error}</Text>
          )}
        </View>

        <NumericKeyboard
          onNumberPress={handleNumberPress}
          onDeletePress={handleDeletePress}
          onCommaPress={handleCommaPress}
          onContinuePress={handleSave}
          continueDisabled={false}
          continuePosition="top"
          disabled={isLoading}
        />
      </View>
    </HeaderContainer>
  );
}