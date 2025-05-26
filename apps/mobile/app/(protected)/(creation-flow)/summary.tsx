import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, Switch } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/lib/api";

export default function SummaryScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [defaultAccount, setDefaultAccount] = useState(false);
  const [savingsAccount, setSavingsAccount] = useState(false);
  const [savingTarget, setSavingTarget] = useState("750,00");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameInputRef = useRef<TextInput>(null);
  const params = useLocalSearchParams<{ name: string, icon: string, color: string, value: string, firstAccount: string }>();

  const queryClient = api.useContext();

  // Account creation mutation
  const { mutate: createAccount, isLoading: isCreatingAccount } = api.account.create.useMutation({
    onSuccess: async () => {
      await queryClient.account.listWithBalances.invalidate();
      router.dismissAll();
      router.navigate("/(protected)");
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    }
  });

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create account with integrated goal functionality if savings is enabled
      await createAccount({
        name: params.name,
        iconName: params.icon,
        color: params.color,
        initialBalance: parseFloat(params.value.replace(",", ".")),
        default: defaultAccount,
        isGoalAccount: savingsAccount,
        // Include goal-related fields only if it's a savings account
        ...(savingsAccount && {
          targetAmount: parseFloat(savingTarget.replace(",", ".")),
          goalDescription: `Obiettivo di risparmio per il conto ${params.name}`
        })
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante la creazione del conto");
      setIsLoading(false);
    }
  };

  const canSave = () => {
    // If savings account is enabled, target amount is required and must be a number
    if (savingsAccount) {
      try {
        const targetAmount = parseFloat(savingTarget.replace(",", "."));
        return !isNaN(targetAmount) && targetAmount > 0;
      } catch {
        return false;
      }
    }
    // If savings account is not enabled, target amount is not required
    return true;
  };

  return (
    <HeaderContainer variant="secondary" customTitle={t("flow.summary.title", "NUOVO CONTO")}>
      <View className="flex-1 bg-white">
        <View className="flex-1 px-4 pt-4 pb-0">
          {/* Account Settings */}
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
                onValueChange={setDefaultAccount}
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
                  onValueChange={setSavingsAccount}
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
                      onChangeText={setSavingTarget}
                      keyboardType="numeric"
                      className="text-base font-sans font-semibold text-black leading-tight"
                      textAlign="center"
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Error message */}
        {error && (
          <View className="px-4 py-2">
            <Text className="text-red-500">{error}</Text>
          </View>
        )}

        {/* Bottom Action Buttons */}
        <View className="px-4 pb-8 pt-2 border-t border-gray-200">
          <View className="flex-row gap-2">
            <Button
              variant="primary"
              size="lg"
              rounded="default"
              onPress={handleSave}
              disabled={!canSave()}
              className="flex-1 font-semibold font-sans"
              isLoading={isLoading || isCreatingAccount}
            >
              <Text className="text-white font-semibold">
                {t("common.actions.save", "Salva")}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </HeaderContainer>
  );
} 