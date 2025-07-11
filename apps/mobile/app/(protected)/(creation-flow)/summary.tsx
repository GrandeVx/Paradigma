import React, { useState, useCallback } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { api } from "@/lib/api";

// Import modular component for better performance
import { CreationSummaryForm } from './components/creation-summary-form';

export default function SummaryScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [defaultAccount, setDefaultAccount] = useState(false);
  const [savingsAccount, setSavingsAccount] = useState(false);
  const [savingTarget, setSavingTarget] = useState("750,00");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useLocalSearchParams<{ name: string, icon: string, color: string, value: string, firstAccount: string }>();

  // Reset state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset form settings to prevent old data from persisting
      setDefaultAccount(false);
      setSavingsAccount(false);
      setSavingTarget("750,00");
      setIsLoading(false);
      setError(null);
      return () => {
        // Cleanup if necessary
      };
    }, [])
  );

  const queryClient = api.useContext();

  // Account creation mutation - OPTIMIZED invalidation and navigation
  const { mutate: createAccount, isLoading: isCreatingAccount } = api.account.create.useMutation({
    onSuccess: async () => {
      // Only invalidate account list, no need for other queries
      await queryClient.account.listWithBalances.invalidate();
      // Navigate to home after successful account creation
      router.replace("/(protected)/(home)");
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    }
  });

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
          goalDescription: t("flow.summary.goalDescription", { name: params.name })
        })
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
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
          {/* Account Settings - MODULARIZED for performance */}
          <CreationSummaryForm
            defaultAccount={defaultAccount}
            savingsAccount={savingsAccount}
            savingTarget={savingTarget}
            onDefaultAccountChange={setDefaultAccount}
            onSavingsAccountChange={setSavingsAccount}
            onSavingTargetChange={setSavingTarget}
          />
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
                {t("common.actions.save")}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </HeaderContainer>
  );
} 