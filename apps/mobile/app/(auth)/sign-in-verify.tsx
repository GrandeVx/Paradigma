import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSupabase } from "@/context/supabase-provider";
import { api } from "@/lib/api";
import { z } from "zod";

export default function SignInVerify(
) {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ name: string, email: string, fromLogin: string }>();
  const { mutate: updateProfile } = api.user.updateProfile.useMutation();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const otpInputRef = useRef<TextInput>(null);
  const { signInWithVerificationOtp } = useSupabase();
  // Automatically focus the input field when the screen mounts
  useEffect(() => {
    otpInputRef.current?.focus();
  }, []);

  const handleContinue = async () => {
    console.log("[🚥 SignInVerify] Starting authentication process...");

    await signInWithVerificationOtp(params.email, otp);

    if (params.name) {
      await updateProfile({
        name: params.name,
      });
    }

    console.log("params.fromLogin", params.fromLogin);

    // Add a small delay to ensure the auth state is properly set
    await new Promise(resolve => setTimeout(resolve, 100));

    if (params.fromLogin === "true") {
      // Existing user login - go to home/accounts
      console.log("[🚥 SignInVerify] Existing user login - go to home/accounts");
      router.dismissTo({
        pathname: "/(protected)/(accounts)",
      });
    } else {
      // New user registration - start account creation flow from name step
      console.log("[🚥 SignInVerify] New user registration - start account creation flow from name step");
      router.dismissTo({
        pathname: "/(protected)/(creation-flow)/name",
        params: {
          firstAccount: "true",
        },
      });
    }
  };

  const canContinue = otp && z.string().length(6).safeParse(otp).success;
  const isButtonDisabled = !canContinue; // Basic check, enhance with validation

  return (
    <HeaderContainer variant="secondary" customTitle={t("auth.email.title", "LA TUA EMAIL")}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjust offset as needed
      >
        <View className="flex-1 justify-between p-4 bg-white gap-2">
          <View className="flex-1 justify-center items-center w-max ">
            <Pressable onPress={() => otpInputRef.current?.focus()}>
              <Text className="text-gray-600 text-base font-sans font-normal mb-2 text-center">
                {t("auth.verify.prompt", "Ti abbiamo inviato un codice di verifica")}
              </Text>
              <View className="relative w-max items-center">
                <TextInput
                  autoFocus={true}
                  ref={otpInputRef}
                  className="text-[34px] placeholder:font-medium font-sans text-black pb-2"
                  placeholder={t("auth.verify.placeholder", "XXX-XXX")}
                  placeholderTextColor="text-gray-400" // Use Tailwind class if possible or direct color
                  value={otp}
                  onChangeText={setOtp}
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