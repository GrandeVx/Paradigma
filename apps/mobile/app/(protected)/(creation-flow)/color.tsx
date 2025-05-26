import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform, Pressable, FlatList } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SvgIcon } from "@/components/ui/svg-icon";
import { EyeCloseIcon, IconName } from "@/components/ui/icons";
import { AccountColors } from "@/components/ui/icons";



export default function ColorStepFlow(
) {
  const { t } = useTranslation();
  const router = useRouter();
  const [color, setColor] = useState<string>();
  const nameInputRef = useRef<TextInput>(null);
  const params = useLocalSearchParams<{ name: string, icon: string, firstAccount: string }>();
  // Automatically focus the input field when the screen mounts
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleContinue = async () => {
    router.push({
      pathname: "/(protected)/(creation-flow)/value",
      params: {
        name: params.name,
        icon: params.icon,
        color: color,
        firstAccount: params.firstAccount,
      },
    });
  };

  const isButtonDisabled = !color; // Basic check, enhance with validation

  return (
    <HeaderContainer variant="secondary" customTitle={t("auth.email.title", "NUOVO CONTO")}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjust offset as needed
      >
        <View className="flex-1 justify-between p-4 bg-white gap-2 w-full">
          <View className="flex-1 justify-center items-center w-full  ">
            <Pressable onPress={() => nameInputRef.current?.focus()}>
              <View className=" justify-center text-gray-600 text-base font-sans font-normal mb-2 text-center flex flex-row items-center gap-2">
                <Text>{t("flow.name.prompt", "Scegli un colore per")}</Text>
                <View className="flex-row items-center gap-2 justify-center">
                  <SvgIcon name={params.icon as IconName} width={16} height={16} color={color} />
                  <Text className="font-semibold font-sans" style={{ color: color }}>{params.name.toUpperCase()}</Text>
                </View>
              </View>

              <EyeCloseIcon width={24} height={24} color="#00000" />

              <View className="relative w-full items-center justify-center mt-4">
                <FlatList
                  data={Object.values(AccountColors)}
                  numColumns={3}
                  columnWrapperStyle={{ justifyContent: 'space-evenly', gap: 20, marginBottom: 20 }}
                  renderItem={({ item }) => (
                    <Pressable onPress={() => setColor(item.toString())}>
                      <View className="w-20 h-20 border border-gray-200 rounded-xl flex items-center justify-center">
                        <View className={`w-6 h-6 rounded-full`} style={{ backgroundColor: item.toString() }} />
                      </View>
                    </Pressable>
                  )}
                />

                {/* Optional: Add an animated cursor or indicator if needed */}
              </View>
            </Pressable>
          </View>

          {/* Floating Button at the bottom */}
          {/* @ts-expect-error - Known issue with Reanimated v3 types in certain contexts */}
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Button
              variant="primary"
              size="lg" // Or adjust size as needed

              onPress={handleContinue}
              disabled={isButtonDisabled}
              className="mb-8" // Add margin if needed
            >
              <Text className="text-[16px] font-sans font-semibold">
                {t("auth.actions.continue", "Continua")}
              </Text>
            </Button>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </HeaderContainer>
  );
} 