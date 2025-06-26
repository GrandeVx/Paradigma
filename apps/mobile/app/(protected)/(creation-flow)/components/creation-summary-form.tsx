import React from 'react';
import { View, TextInput, Switch } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';

interface CreationSummaryFormProps {
  defaultAccount: boolean;
  savingsAccount: boolean;
  savingTarget: string;
  onDefaultAccountChange: (value: boolean) => void;
  onSavingsAccountChange: (value: boolean) => void;
  onSavingTargetChange: (value: string) => void;
}

// Memoized creation summary form component for performance
export const CreationSummaryForm = React.memo<CreationSummaryFormProps>(({
  defaultAccount,
  savingsAccount,
  savingTarget,
  onDefaultAccountChange,
  onSavingsAccountChange,
  onSavingTargetChange
}) => {
  const { t } = useTranslation();

  return (
    <View className="flex-col gap-4">
      {/* Default Account Toggle */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-10">
          <Text className="text-base font-semibold text-black">
            {t("flow.summary.default_account", "Conto predefinito")}
          </Text>
          <Text className="text-sm text-gray-500">
            {t("flow.summary.default_account_desc", "Imposta questo conto preselezionato quando crei una nuova transazione")}
          </Text>
        </View>
        <Switch
          value={defaultAccount}
          onValueChange={onDefaultAccountChange}
          trackColor={{ false: "#F3F4F6", true: "#005EFD" }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Savings Account Toggle */}
      <View className="flex-col gap-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-10">
            <Text className="text-base font-semibold text-black">
              {t("flow.summary.savings_account", "Conto di risparmio")}
            </Text>
            <Text className="text-sm text-gray-500">
              {t("flow.summary.savings_account_desc", "Abilitando questa impostazione potrai aggiungere un obiettivo di risparmio")}
            </Text>
          </View>
          <Switch
            value={savingsAccount}
            onValueChange={onSavingsAccountChange}
            trackColor={{ false: "#F3F4F6", true: "#005EFD" }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Saving Target Input - Only visible when savings is enabled */}
        {savingsAccount && (
          <View className="flex-row items-center justify-between bg-gray-50 px-4 py-4 rounded-xl">
            <Text className="text-base font-semibold text-gray-500">
              {t("flow.summary.saving_target", "Obiettivo di risparmio")}
            </Text>
            <View className="flex-row items-start justify-start gap-2 mx-4">
              <Text className="text-base font-sans font-semibold text-black leading-tight">€</Text>
              <TextInput
                value={savingTarget}
                onChangeText={onSavingTargetChange}
                keyboardType="numeric"
                className="text-base font-sans font-semibold text-black leading-tight"
                textAlign="center"
                placeholder="0,00"
                placeholderTextColor="#9CA3AF"
                multiline={false}
                numberOfLines={1}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}); 