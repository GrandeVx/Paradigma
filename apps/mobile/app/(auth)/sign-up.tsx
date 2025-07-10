import React, { useState } from "react";
import { Platform, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

import HeaderContainer from "@/components/layouts/_header";
import { Input } from "@/components/ui/input";
import { KeyboardAvoidingView } from "react-native"
import { useSupabase } from "@/context/supabase-provider";




export default function AuthIndex() {
  const { t } = useTranslation();
  const router = useRouter();
  const { sendVerificationOtp, signInWithGoogle, signInWithApple } = useSupabase();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const canSignUp = email && z.string().email().safeParse(email).success;

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      await sendVerificationOtp(email);
      router.push({
        pathname: "/(auth)/sign-in-verify",
        params: {
          email: email,
          fromLogin: "true",
        },
      });
    } catch (error) {
      console.error("Error sending verification OTP:", error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Navigation will be handled automatically by the provider
    } catch (error) {
      console.error("Google Sign-In error:", error);
      // You might want to show an error toast here
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    try {
      await signInWithApple();
      // Navigation will be handled automatically by the provider
    } catch (error) {
      console.error("Apple Sign-In error:", error);
      // You might want to show an error toast here
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <HeaderContainer variant="secondary">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 170 : 0}
      >
        <View className="flex-1 bg-white px-6" >
          <View className="flex-1 justify-center gap-10 ">
            <View className="flex-col items-start justify-center w-full gap-10">
              <Text className="text-[56px] font-semibold  text-black text-left font-sans leading-[64px] -tracking-wider">
                {t("auth.sign-up.title")}
              </Text>
              <View className="w-full flex-col gap-2 items-start justify-center text-gray-500">
                <Text className="text-black text-base font-sans font-semibold">
                  {t("auth.sign-up.email-label")}
                </Text>
                <Input
                  placeholder={t("auth.sign-up.email-placeholder")}
                  className="text-black w-full bg-gray-50 !h-14 rounded-lg border-0"
                  value={email}
                  keyboardType="email-address"

                  autoCapitalize="none"
                  autoComplete="email"
                  onChangeText={setEmail}
                />
              </View>
            </View>
            <View className="justify-end mt-2 flex-col gap-8 ">
              <Button
                isLoading={isLoading}
                variant="primary"
                size="sm"
                textClassName="text-[16px] font-sans font-semibold"
                disabled={!canSignUp}
                onPress={handleSignUp}
              >
                <Text>
                  {t("auth.sign-up.button")}
                </Text>
              </Button>
              <View className="flex-row gap-2 justify-center items-center">
                <View className="flex-1 h-[1px] bg-gray-200" />
                <Text className="text-gray-500 text-sm font-sans font-normal">
                  {t("auth.actions.or")}
                </Text>
                <View className="flex-1 h-[1px] bg-gray-200" />
              </View>
              <View className="justify-center">
                <View className="flex-row gap-2 w-full">
                  <Button
                    variant="primary"
                    size="lg"
                    textClassName="text-[16px] font-sans font-semibold text-black"
                    className="flex-1 bg-gray-50"
                    isLoading={isGoogleLoading}
                    disabled={isLoading || isAppleLoading}
                    onPress={handleGoogleSignIn}
                  >
                    <Text>
                      Google
                    </Text>
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    textClassName="text-[16px] font-sans font-semibold text-black"
                    className="flex-1 bg-gray-50"
                    isLoading={isAppleLoading}
                    disabled={isLoading || isGoogleLoading}
                    onPress={handleAppleSignIn}
                  >
                    <Text>
                      Apple
                    </Text>
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </HeaderContainer>


  );
}

