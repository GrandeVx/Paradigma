import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSupabase } from "@/context/supabase-provider";
import { useTranslation } from "react-i18next";

import { api } from "@/lib/api";
import { TRPCError } from "@trpc/server";

export default function SignUp() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { signUp } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: addUser } = api.user.addUser.useMutation({
    onSuccess: () => {
      setIsLoading(false);
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        Alert.alert(t("auth.passwordReset.error"), error.message);
      } else {
        Alert.alert(
          t("auth.passwordReset.error"),
          t("auth.passwordReset.genericError")
        );
      }
      setIsLoading(false);
    },
  });

  const handleSignUp = async () => {
    if (password !== confirmPassword || password.length < 8) {
      Alert.alert(
        t("auth.passwordReset.error"),
        t("auth.errors.passwordMismatch")
      );
      return;
    }

    setIsLoading(true);
    await signUp(email, password).then(async (session) => {
      addUser({
        email,
        id: session,
      });
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-black"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-1 justify-center">
          <Text
            className="text-4xl font-bold mb-12 text-white text-center"
            style={{ color: "white" }}
          >
            {t("auth.title")}
          </Text>
        </View>

        {/* Auth Buttons Container */}
        <View className="space-y-6 px-4 bg-zinc-900 rounded-t-3xl">
          <View className="mb-10 pt-7 flex gap-4">
            {/* @ts-expect-error - TODO: Fix this */}
            <Animated.View
              entering={FadeIn}
              exiting={FadeOut}
              className="gap-4"
            >
              <TextInput
                className="h-12 px-4 rounded-xl bg-zinc-800 text-white text-xl"
                placeholder={t("auth.placeholders.email")}
                placeholderTextColor="#71717a"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TextInput
                className="h-12 px-4 rounded-xl bg-zinc-800 text-white text-xl"
                placeholder={t("auth.placeholders.password")}
                placeholderTextColor="#71717a"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TextInput
                className="h-12 px-4 rounded-xl bg-zinc-800 text-white text-xl"
                placeholder={t("auth.placeholders.confirmPassword")}
                placeholderTextColor="#71717a"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <Button
                variant="default"
                className="flex-row items-center justify-center gap-2 bg-zinc-800 rounded-xl disabled:opacity-50"
                onPress={handleSignUp}
                disabled={isLoading || !email || !password || !confirmPassword}
              >
                <Text className="text-xl font-semibold text-white">
                  {isLoading
                    ? t("auth.actions.registering")
                    : t("auth.actions.register")}
                </Text>
              </Button>

              <Button
                variant="outline"
                className="flex-row items-center justify-center gap-2 bg-transparent rounded-xl border-zinc-700"
                onPress={() => router.replace("/(auth)/sign-in")}
              >
                <Text className="text-xl font-semibold text-white">
                  {t("auth.actions.back")}
                </Text>
              </Button>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
