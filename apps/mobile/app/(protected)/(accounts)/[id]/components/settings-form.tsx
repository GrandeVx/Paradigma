import React from 'react';
import { View, Switch, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface SettingsFormProps {
  includeInTotal: boolean;
  setIncludeInTotal: (value: boolean) => void;
  isDefaultAccount: boolean;
  setIsDefaultAccount: (value: boolean) => void;
  isSavingsAccount: boolean;
  setIsSavingsAccount: (value: boolean) => void;
  savingTarget: string;
  setSavingTarget: (value: string) => void;
}

// Memoized SettingsForm component for performance
export const SettingsForm = React.memo<SettingsFormProps>(({
  includeInTotal,
  setIncludeInTotal,
  isDefaultAccount,
  setIsDefaultAccount,
  isSavingsAccount,
  setIsSavingsAccount,
  savingTarget,
  setSavingTarget,
}) => {
  const { t } = useTranslation();

  return (
    <View className="mt-3">
      {/* Section 1: Basic settings */}
      <View className="bg-white py-4 px-4">
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

        <View className="bg-white rounded-lg mb-6">
          <View className="flex-row items-center justify-between py-4 border-gray-100">
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
          <View className={cn("flex-row items-center justify-between py-4 px-4 bg-gray-100 rounded-xl",
            isSavingsAccount ? "opacity-100" : "opacity-20"
          )}>
            <Text className="text-base font-semibold text-gray-500">
              {t("account.details.saving_target", "Obiettivo di risparmio")}
            </Text>
            <View className="flex-row items-start justify-start gap-2">
              <Text className={cn("text-base font-sans font-semibold text-black leading-tight",
                savingTarget != "" ? "opacity-100" : "opacity-0"
              )}>€</Text>
              <TextInput
                value={savingTarget}
                editable={isSavingsAccount}
                onChangeText={setSavingTarget}
                keyboardType="numeric"
                className="text-base font-sans font-semibold text-black leading-tight"
                textAlign="right"
                style={{ minWidth: 80 }}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}); 