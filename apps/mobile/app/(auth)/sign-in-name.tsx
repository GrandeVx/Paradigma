import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { z } from "zod";


export default function SignInNameStep(
) {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState("");
  const nameInputRef = useRef<TextInput>(null);

  // Automatically focus the input field when the screen mounts
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleContinue = async () => {
    router.push({
      pathname: "/(auth)/sign-in-email",
      params: {
        name: name,
      },
    });
  };

  const canContinue = name && z.string().min(1).safeParse(name).success;


  return (
    <HeaderContainer variant="secondary" customTitle={t("auth.name.title", "IL TUO NOME")}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjust offset as needed
      >
        <View className="flex-1 justify-between p-4 bg-white gap-2">
          <View className="flex-1 justify-center items-center w-max ">
            <Pressable onPress={() => nameInputRef.current?.focus()}>
              <Text className="text-gray-600 text-base font-sans font-normal mb-2 text-center">
                {t("auth.verify.name", "Come ti chiami?")}
              </Text>
              <View className="relative w-max items-center">
                <TextInput
                  autoFocus={true}
                  ref={nameInputRef}
                  className="text-[34px] placeholder:font-medium font-sans text-black pb-2"
                  placeholder={t("flow.name.placeholder", "Nome")}
                  placeholderTextColor="text-gray-400" // Use Tailwind class if possible or direct color
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next" // Or "done" if this is the last step initially
                  onSubmitEditing={handleContinue} // Submit on pressing return/next
                  autoComplete="email"
                  spellCheck={false}
                  style={{ fontSize: 34 }} // Ensure font size prevents iOS zoom
                  blurOnSubmit={false} // Keep keyboard open
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
              disabled={!canContinue}
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