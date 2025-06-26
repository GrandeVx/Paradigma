import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { api } from "@/lib/api";

export default function EditAccountName() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<TextInput>(null);

  const queryClient = api.useContext();

  // Get account details
  const { data: accountData, isLoading: isLoadingAccount } = api.account.getById.useQuery(
    { accountId: id },
    { enabled: !!id }
  );

  // Update account mutation
  const { mutate: updateAccount } = api.account.update.useMutation({
    onSuccess: async () => {
      await queryClient.account.listWithBalances.invalidate();
      await queryClient.account.getById.invalidate({ accountId: id });
      setIsLoading(false);
      router.back();
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    }
  });

  // Populate initial name when account data is loaded
  useEffect(() => {
    if (accountData) {
      setName(accountData.name);
    }
  }, [accountData]);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      updateAccount({
        accountId: id,
        name: name.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating account name");
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !name || isLoading;

  if (isLoadingAccount) {
    return (
      <HeaderContainer variant="secondary" customTitle={t("account.edit_name.title", "MODIFICA NOME")} tabBarHidden={true}>
        <View className="flex-1 bg-white items-center justify-center">
          <Text className="text-gray-500">{t("common.loading", "Caricamento...")}</Text>
        </View>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer variant="secondary" customTitle={t("account.edit_name.title", "MODIFICA NOME")} tabBarHidden={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
      >
        <View className="flex-1 justify-between p-4 bg-white gap-2 w-full">
          <View className="flex-1 justify-center items-center w-full">
            <Pressable onPress={() => nameInputRef.current?.focus()} className="w-full flex flex-col items-center justify-center">
              <Text className="text-gray-600 text-base font-sans font-normal mb-2">
                {t("account.edit_name.prompt", "Modifica il nome del tuo conto")}
              </Text>
              <View className="relative w-full h-fit items-center justify-center">
                <TextInput
                  autoFocus={true}
                  ref={nameInputRef}
                  className="font-sans text-black text-center"
                  style={{ fontSize: 34 }}
                  placeholder={t("account.edit_name.placeholder", "Nome del conto")}
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="none"
                  keyboardType="default"
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                  spellCheck={false}
                />
              </View>

              {error && (
                <Text className="text-red-500 mt-2">{error}</Text>
              )}
            </Pressable>
          </View>

          {/* Save Button at the bottom */}
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Button
              variant="primary"
              size="lg"
              onPress={handleSave}
              disabled={isButtonDisabled}
              isLoading={isLoading}
              className="mb-8"
            >
              <Text className="text-[16px] font-sans font-semibold text-white">
                {t("common.actions.save", "Salva")}
              </Text>
            </Button>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </HeaderContainer>
  );
} 