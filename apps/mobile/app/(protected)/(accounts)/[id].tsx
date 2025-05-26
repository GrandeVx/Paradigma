import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TextInput, Switch, Pressable, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { SvgIcon } from '@/components/ui/svg-icon';
import { IconName } from '@/components/ui/icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderContainer from '@/components/layouts/_header';
import { api } from '@/lib/api';
import { useTranslation } from 'react-i18next';

// Format currency helper
const formatCurrency = (amount: number) => {
  const [integer, decimal] = amount.toFixed(2).split('.');
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return {
    integer: formattedInteger,
    decimal: decimal
  };
};

export default function AccountDetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isSaving, setIsSaving] = useState(false);
  const [isShowingDeleteConfirm, setIsShowingDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [accountName, setAccountName] = useState('');
  const [isDefaultAccount, setIsDefaultAccount] = useState(false);
  const [isSavingsAccount, setIsSavingsAccount] = useState(false);
  const [savingTarget, setSavingTarget] = useState('');
  const [accountColor, setAccountColor] = useState('#409FF8');
  const [accountIcon, setAccountIcon] = useState<IconName>('bank-card');
  const [balance, setBalance] = useState(0);
  const [includeInTotal, setIncludeInTotal] = useState(true);

  // Get account details
  const { data: accountData, isLoading: isLoadingAccount } = api.account.getById.useQuery(
    { accountId: id },
    { enabled: !!id }
  );

  // Get account balance
  const { data: balanceData, isLoading: isLoadingBalance } = api.account.listWithBalances.useQuery({});

  // Get transactions for this account - could be added in a future version
  // const { data: transactionsData, isLoading: isLoadingTransactions } = 
  //   api.transaction.listByAccount.useQuery({ accountId: id }, { enabled: !!id });

  const queryClient = api.useContext();

  // Update account mutation
  const { mutate: updateAccount, isLoading: isUpdating } = api.account.update.useMutation({
    onSuccess: async () => {
      await queryClient.account.listWithBalances.invalidate();
      await queryClient.account.getById.invalidate({ accountId: id });
      setIsSaving(false);
      router.back();
    },
    onError: (error) => {
      setError(error.message);
      setIsSaving(false);
    }
  });

  // Delete account mutation
  const { mutate: deleteAccount, isLoading: isDeleting } = api.account.delete.useMutation({
    onSuccess: async () => {
      await queryClient.account.listWithBalances.invalidate();
      setIsShowingDeleteConfirm(false);
      router.back();
    },
    onError: (error) => {
      setError(error.message);
      setIsShowingDeleteConfirm(false);
    }
  });

  // Find account balance from the accounts list
  useEffect(() => {
    if (balanceData && id) {
      const accountWithBalance = balanceData.find(item => item.account.id === id);
      if (accountWithBalance) {
        setBalance(Number(accountWithBalance.balance));
      }
    }
  }, [balanceData, id]);

  // Populate form data when account data is loaded
  useEffect(() => {
    if (accountData) {
      setAccountName(accountData.name);
      setIsDefaultAccount(accountData.default);
      setIsSavingsAccount(accountData.isGoalAccount || false);
      setSavingTarget(accountData.targetAmount ? formatCurrency(Number(accountData.targetAmount)).integer + ',' + formatCurrency(Number(accountData.targetAmount)).decimal : '');
      setAccountColor(accountData.color || '#409FF8');
      setAccountIcon(accountData.iconName as IconName || 'bank-card');
      setIncludeInTotal(true); // This could be a field in the account model
    }
  }, [accountData]);

  const handleSave = () => {
    setIsSaving(true);
    setError(null);

    try {
      updateAccount({
        accountId: id,
        name: accountName,
        default: isDefaultAccount,
        isGoalAccount: isSavingsAccount,
        targetAmount: isSavingsAccount ? parseFloat(savingTarget.replace(",", ".")) : null,
        color: accountColor,
        iconName: accountIcon,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating account");
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t("account.details.delete_confirm_title", "Eliminare questo conto?"),
      t("account.details.delete_confirm_msg", "Questa azione non può essere annullata. Tutte le transazioni associate a questo conto verranno mantenute."),
      [
        {
          text: t("common.actions.cancel", "Annulla"),
          style: "cancel"
        },
        {
          text: t("common.actions.delete", "Elimina"),
          onPress: () => {
            setIsShowingDeleteConfirm(true);
            deleteAccount({ accountId: id });
          },
          style: "destructive"
        }
      ]
    );
  };

  const { integer, decimal } = formatCurrency(balance);

  // If account has a savings goal, calculate progress
  const progress = useMemo(() => {
    if (isSavingsAccount && savingTarget) {
      const targetAmount = parseFloat(savingTarget.replace(",", "."));
      if (!isNaN(targetAmount) && targetAmount > 0) {
        return Math.min(100, (balance / targetAmount) * 100);
      }
    }
    return 0;
  }, [isSavingsAccount, savingTarget, balance]);

  // Calculate remaining amount
  const remaining = useMemo(() => {
    if (isSavingsAccount && savingTarget) {
      const targetAmount = parseFloat(savingTarget.replace(",", "."));
      if (!isNaN(targetAmount) && targetAmount > 0) {
        return Math.max(0, targetAmount - balance);
      }
    }
    return 0;
  }, [isSavingsAccount, savingTarget, balance]);

  const { integer: remainingInteger, decimal: remainingDecimal } = formatCurrency(remaining);

  // Color and icon selection options
  const colorOptions = [
    '#409FF8', // Blue
    '#4CAF50', // Green
    '#FF9800', // Orange
    '#9C27B0', // Purple
    '#F44336', // Red
    '#FA6B97', // Pink
    '#795548', // Brown
    '#607D8B', // Gray
  ];

  const iconOptions: IconName[] = [
    'bank-card',
    'bank',
    'cash',
    'pig-money',
    'schedule',
    'wallet',
    'calendar',
    'at',
  ];

  if (isLoadingAccount || isLoadingBalance) {
    return (
      <HeaderContainer variant="secondary" customTitle={t("account.details.title", "MODIFICA CONTO")}>
        <View className="flex-1 bg-white items-center justify-center">
          <Text className="text-gray-500">Caricamento dati...</Text>
        </View>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer variant="secondary" customTitle={t("account.details.title", "MODIFICA CONTO")}>
      <View className="flex-1 bg-white">
        {/* Main content in ScrollView */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }} // Extra padding for fixed button
          showsVerticalScrollIndicator={false}
        >
          {/* Account header with balance */}
          <View className="px-4 py-6 flex-row items-center" style={{ backgroundColor: accountColor }}>
            <View className="flex-1">
              <View className="flex-row items-center gap-2 py-2">
                <View className="w-12 h-12 rounded-full bg-black bg-opacity-10 items-center justify-center">
                  <SvgIcon name={accountIcon} width={24} height={24} color="#FFFFFF" />
                </View>
                <Text className="text-white font-semibold text-base">{accountName}</Text>
              </View>

              <View className="flex-row items-baseline gap-2 mt-4">
                <Text className="text-white text-base font-normal">€</Text>
                <View className="flex-row items-baseline">
                  <Text className="text-white text-4xl font-medium">{integer}</Text>
                  <Text className="text-white text-xl font-normal">,{decimal}</Text>
                </View>
              </View>
            </View>

            {/* Color selection on the right side of header */}
            <View className="gap-2">
              {colorOptions.slice(0, 4).map((color) => (
                <Pressable
                  key={color}
                  className="w-8 h-8 rounded-full items-center justify-center mb-1"
                  style={{ backgroundColor: color }}
                  onPress={() => setAccountColor(color)}
                >
                  {color === accountColor && (
                    <View className="w-4 h-4 rounded-full bg-white opacity-50" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Progress bar for savings accounts */}
          {isSavingsAccount && savingTarget && (
            <View className="px-4 py-4 bg-white">
              <View className="h-2 w-full rounded-full overflow-hidden mb-1" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                <View
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: accountColor,
                    width: `${progress}%`
                  }}
                />
              </View>
              <Text className="text-xs font-medium text-gray-500">
                {remaining > 0
                  ? `Ancora € ${remainingInteger},${remainingDecimal} per completare l'obiettivo`
                  : 'Obiettivo raggiunto!'}
              </Text>
            </View>
          )}

          {/* Account Settings Form */}
          <View className="px-4 py-6">
            {/* Section 1: Basic settings */}
            <View className="bg-white rounded-lg mb-6">
              {/* Include in total toggle */}
              <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
                <Text className="text-base font-semibold text-black">
                  {t("account.details.include_in_total", "Includi nel patrimonio totale")}
                </Text>
                <Switch
                  value={includeInTotal}
                  onValueChange={setIncludeInTotal}
                  trackColor={{ false: "#E5E7EB", true: "#005EFD" }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Default Account Toggle */}
              <View className="flex-row items-center justify-between py-4">
                <View className="flex-1 mr-4">
                  <Text className="text-base font-semibold text-black">
                    {t("account.details.default_account", "Conto predefinito")}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {t("account.details.default_account_desc", "Imposta questo conto come preselezionato quando crei una transazione")}
                  </Text>
                </View>
                <Switch
                  value={isDefaultAccount}
                  onValueChange={setIsDefaultAccount}
                  trackColor={{ false: "#E5E7EB", true: "#005EFD" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Section 2: Savings Settings */}
            <View className="bg-white rounded-lg mb-6">
              <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
                <View className="flex-1 mr-4">
                  <Text className="text-base font-semibold text-black">
                    {t("account.details.savings_account", "Conto di risparmio")}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {t("account.details.savings_account_desc", "Abilita per aggiungere un obiettivo di risparmio")}
                  </Text>
                </View>
                <Switch
                  value={isSavingsAccount}
                  onValueChange={setIsSavingsAccount}
                  trackColor={{ false: "#E5E7EB", true: "#005EFD" }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Saving Target Input - Only visible when savings is enabled */}
              {isSavingsAccount && (
                <View className="flex-row items-center justify-between py-4 px-4">
                  <Text className="text-base font-semibold text-gray-500">
                    {t("account.details.saving_target", "Obiettivo di risparmio")}
                  </Text>
                  <View className="flex-row items-start justify-start gap-2">
                    <Text className="text-base font-sans font-semibold text-black leading-tight">€</Text>
                    <TextInput
                      value={savingTarget}
                      onChangeText={setSavingTarget}
                      keyboardType="numeric"
                      className="text-base font-sans font-semibold text-black leading-tight"
                      textAlign="right"
                      style={{ minWidth: 80 }}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Section 3: Icon Selection */}
            <View className="bg-white rounded-lg mb-6">
              <Text className="text-base font-semibold text-black py-2">
                {t("account.details.icon", "Icona")}
              </Text>
              <View className="flex-row flex-wrap gap-3 py-3">
                {iconOptions.map((icon) => (
                  <Pressable
                    key={icon}
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: accountColor,
                      borderWidth: icon === accountIcon ? 2 : 0,
                      borderColor: 'white',
                    }}
                    onPress={() => setAccountIcon(icon)}
                  >
                    <SvgIcon name={icon} width={24} height={24} color="#FFFFFF" />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Section 4: Colors (Additional) */}
            <View className="bg-white rounded-lg mb-6">
              <Text className="text-base font-semibold text-black py-2">
                {t("account.details.color", "Colore")}
              </Text>
              <View className="flex-row flex-wrap gap-3 py-3">
                {colorOptions.map((color) => (
                  <Pressable
                    key={color}
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: color }}
                    onPress={() => setAccountColor(color)}
                  >
                    {color === accountColor && (
                      <View className="w-6 h-6 rounded-full bg-white opacity-50" />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Delete Account Button */}
            <Button
              variant="destructive"
              size="lg"
              rounded="default"
              onPress={handleDelete}
              className="w-full font-semibold font-sans mt-4"
              isLoading={isShowingDeleteConfirm || isDeleting}
            >
              <Text className="text-white font-semibold">
                {t("account.details.delete_account", "Elimina questo conto")}
              </Text>
            </Button>
          </View>
        </ScrollView>

        {/* Error message */}
        {error && (
          <View className="px-4 py-2 absolute bottom-20 left-0 right-0">
            <Text className="text-red-500">{error}</Text>
          </View>
        )}

        {/* Fixed Save Button at bottom */}
        <View className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-gray-200">
          <Button
            variant="primary"
            size="lg"
            rounded="default"
            onPress={handleSave}
            className="w-full font-semibold font-sans"
            isLoading={isSaving || isUpdating}
          >
            <Text className="text-white font-semibold">
              {t("common.actions.save", "Salva")}
            </Text>
          </Button>
        </View>
      </View>
    </HeaderContainer>
  );
} 