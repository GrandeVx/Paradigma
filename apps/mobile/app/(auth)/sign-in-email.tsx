import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useAuth } from "@/context/auth-provider";
import { z } from "zod";

export default function SignInEmail() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ name: string, email: string }>();
  const [email, setEmail] = useState("");
  const emailInputRef = useRef<TextInput>(null);
  const { sendVerificationOtp } = useAuth();
  // Automatically focus the input field when the screen mounts
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);


  const canSignIn = email && z.string().email().safeParse(email).success;

  const handleContinue = async () => {
    await sendVerificationOtp(email);

    router.push({
      pathname: "/(auth)/sign-in-verify",
      params: {
        email: email,
        name: params.name,
      },
    });
  };



  return (
    <HeaderContainer variant="secondary" customTitle={t("auth.email.title", "LA TUA EMAIL")}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjust offset as needed
      >
        <View className="flex-1 justify-between p-4 bg-white gap-2">
          <View className="flex-1 justify-center items-center w-max ">
            <Pressable onPress={() => emailInputRef.current?.focus()}>
              <Text className="text-gray-600 text-base font-sans font-normal mb-2 text-center">
                {t("auth.email.prompt", "Inserisci la tua email")}
              </Text>
              <View className="relative w-max items-center">
                <TextInput
                  ref={emailInputRef}
                  className="text-[34px] text-center w-full placeholder:font-medium font-sans text-black pb-2"
                  placeholder={t("auth.email.placeholder", "Email")}
                  placeholderTextColor="text-gray-400" // Use Tailwind class if possible or direct color
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next" // Or "done" if this is the last step initially
                  onSubmitEditing={handleContinue} // Submit on pressing return/next
                  autoComplete="email"
                  spellCheck={false}
                  style={{ fontSize: 24 }} // Ensure font size prevents iOS zoom
                  blurOnSubmit={false} // Keep keyboard open
                />
                {/* Optional: Add an animated cursor or indicator if needed */}
              </View>
            </Pressable>
          </View>

          {/* Floating Button at the bottom */}
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Button
              variant="primary"
              size="lg" // Or adjust size as needed
              onPress={handleContinue}
              disabled={!canSignIn}
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