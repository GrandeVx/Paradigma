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

export default function EditAccountBalance() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [amount, setAmount] = useState('0');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDecimalActive, setIsDecimalActive] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [accountName, setAccountName] = useState('');
  const [accountIcon, setAccountIcon] = useState('bank-card');
  const [accountColor, setAccountColor] = useState('#409FF8');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const utils = api.useUtils();

  // Get account details
  const { data: accountData, isLoading: isLoadingAccount } = api.account.getById.useQuery(
    { accountId: id },
    { enabled: !!id }
  );

  // Get account balance
  const { data: balanceData, isLoading: isLoadingBalance } = api.account.listWithBalances.useQuery({});

  // Create transaction mutation for balance adjustments
  const { mutate: createIncomeMutation } = api.transaction.createIncome.useMutation({
    onSuccess: async () => {
      await utils.account.listWithBalances.invalidate();
      await utils.account.getById.invalidate({ accountId: id });
      await utils.transaction.list.invalidate({ accountId: id });
      setIsLoading(false);
      router.back();
    },
    onError: (error) => {
      setError(error.message || "Error updating account balance");
      setIsLoading(false);
    }
  });

  const { mutate: createExpenseMutation } = api.transaction.createExpense.useMutation({
    onSuccess: async () => {
      await utils.account.listWithBalances.invalidate();

      await utils.account.getById.invalidate({ accountId: id });
      await utils.transaction.list.invalidate({ accountId: id });
      setIsLoading(false);
      router.back();
    },
    onError: (error) => {
      setError(error.message || "Error updating account balance");
      setIsLoading(false);
    }
  });

  // Populate initial data when account data is loaded
  useEffect(() => {
    if (accountData) {
      setAccountName(accountData.name);
      setAccountIcon(accountData.iconName || 'bank-card');
      setAccountColor(accountData.color || '#409FF8');
    }
  }, [accountData]);

  // Find account balance from the accounts list
  useEffect(() => {
    if (balanceData && id) {
      const accountWithBalance = balanceData.find(item => item.account.id === id);
      if (accountWithBalance) {
        const balance = Number(accountWithBalance.balance);
        setCurrentBalance(balance);
        setAmount(balance.toString());
        // If balance has decimals, activate decimal mode
        if (balance.toString().includes('.')) {
          setIsDecimalActive(true);
        }
      }
    }
  }, [balanceData, id]);

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

  const handleSave = () => {
    setIsLoading(true);
    setError(null);

    try {
      const newBalance = parseFloat(amount);
      const difference = newBalance - currentBalance;

      if (difference === 0) {
        // No change in balance, just go back
        router.back();
        return;
      }

      if (difference > 0) {
        createIncomeMutation({
          amount: difference,
          description: t("account.balance_adjustment", "Aggiustamento del bilancio"),
          date: new Date(),
          accountId: id,
          subCategoryId: undefined,
          notes: t("account.manual_balance_update", "Aggiornamento manuale del bilancio"),
        });
      } else {
        createExpenseMutation({
          amount: Math.abs(difference),
          description: t("account.balance_adjustment", "Aggiustamento del bilancio"),
          date: new Date(),
          accountId: id,
          subCategoryId: undefined,
          notes: t("account.manual_balance_update", "Aggiornamento manuale del bilancio"),
        });
      }


    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating account balance");
      setIsLoading(false);
    }
  };

  // Format amount with currency symbol
  const formattedAmount = `${parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  if (isLoadingAccount || isLoadingBalance) {
    return (
      <HeaderContainer variant="secondary" customTitle={t("account.edit_balance.title", "MODIFICA BILANCIO")} tabBarHidden={true}>
        <View className="flex-1 bg-white items-center justify-center">
          <Text className="text-gray-500">{t("common.loading", "Caricamento...")}</Text>
        </View>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer variant="secondary" customTitle={t("account.edit_balance.title", "MODIFICA BILANCIO")} tabBarHidden={true}>
      <View className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-4">
          <View className="w-full justify-center text-center flex flex-row items-center gap-2 mb-2">
            <Text className="text-gray-500">{t("account.edit_balance.prompt", "Aggiorna il bilancio per")}</Text>
            <View className="flex-row items-center gap-2 justify-center">
              <SvgIcon name={accountIcon as IconName} width={16} height={16} color={accountColor} />
              <Text className="font-semibold font-sans" style={{ color: accountColor }}>{accountName.toUpperCase()}</Text>
            </View>
          </View>

          <View className="flex flex-row items-center gap-2 justify-center">
            <Text className="text-gray-400 text-5xl font-bold">€</Text>
            <View className={`flex flex-row items-center ${isAnimating ? 'scale-110' : 'scale-100'}`}>
              <Text className={`text-7xl font-bold ${formattedAmount.split('.')[0] === '0' ? 'text-gray-400' : 'text-black'}`}>
                {formattedAmount.split('.')[0]}
              </Text>
              <Text className={`text-4xl font-bold ${isDecimalActive ? (formattedAmount.split('.')[0] === '0' ? 'text-gray-400' : 'text-black') : 'text-gray-300'}`}>
                ,
              </Text>
              <Text className={`text-4xl font-bold ${isDecimalActive ? (formattedAmount.split('.')[0] === '0' ? 'text-gray-400' : 'text-black') : 'text-gray-300'}`}>
                {formattedAmount.split('.')[1]}
              </Text>
            </View>
          </View>

          {error && (
            <Text className="text-red-500 mt-4">{error}</Text>
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