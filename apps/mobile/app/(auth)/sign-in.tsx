import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useSupabase } from "@/context/supabase-provider";
import { Button } from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";


export default function SignIn() {
  const router = useRouter();
  const { t } = useTranslation();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const { signInWithPassword, PasswordReset } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);


    await signInWithPassword(email, password)
      .finally(() => setIsLoading(false))
      .catch((error) => {
        Alert.alert(t("auth.passwordReset.error"), error.message);
      });
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      Alert.alert(
        t("auth.passwordReset.error"),
        t("auth.passwordReset.emailRequired")
      );
      return;
    }

    setIsResetting(true);
    try {
      await PasswordReset(resetEmail);
      Alert.alert(
        t("auth.passwordReset.success"),
        t("auth.passwordReset.successMessage")
      );
      setShowResetModal(false);
      setResetEmail("");
    } catch (error) {
      Alert.alert(
        t("auth.passwordReset.error"),
        t("auth.passwordReset.genericError")
      );
    } finally {
      setIsResetting(false);
    }
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
            {!showLogin ? (
              <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                className="gap-4"
              >
                {/* Social Auth Buttons */}
                <Button
                  variant="outline"
                  className="flex-row items-center justify-center gap-2 bg-white rounded-xl"
                >
                  <Ionicons name="logo-apple" size={18} color="black" />
                  <Text className="text-xl font-medium">
                    {t("auth.social.apple")}
                  </Text>
                </Button>

                <Button
                  variant="default"
                  className="flex-row items-center justify-center gap-2 bg-zinc-800 rounded-xl"
                >
                  <Ionicons name="logo-google" size={18} color="white" />
                  <Text className="text-xl font-semibold text-white">
                    {t("auth.social.google")}
                  </Text>
                </Button>

                {/* Register/Login Buttons */}
                <Button
                  variant="default"
                  className="flex-row items-center justify-center gap-2 bg-zinc-800 rounded-xl"
                  onPress={() => router.replace("/(auth)/sign-up")}
                >
                  <Text className="text-xl font-semibold text-white">
                    {t("auth.actions.register")}
                  </Text>
                </Button>

                <Button
                  variant="outline"
                  className="flex-row items-center justify-center gap-2 bg-transparent rounded-xl border-zinc-700"
                  onPress={() => setShowLogin(true)}
                >
                  <Text className="text-xl font-semibold text-white">
                    {t("auth.actions.login")}
                  </Text>
                </Button>
              </Animated.View>
            ) : (
              <Animated.View
                entering={SlideInDown}
                exiting={SlideOutDown}
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

                <Pressable onPress={() => setShowResetModal(true)}>
                  <Text className="text-zinc-400 text-right text-base mb-2">
                    {t("auth.passwordReset.forgotPassword")}
                  </Text>
                </Pressable>

                <Button
                  variant="default"
                  className="flex-row items-center justify-center gap-2 bg-zinc-800 rounded-xl"
                  onPress={handleSignIn}
                  disabled={isLoading}
                >
                  <Text className="text-xl font-semibold text-white">
                    {isLoading
                      ? t("auth.actions.loading")
                      : t("auth.actions.login")}
                  </Text>
                </Button>

                <Button
                  variant="outline"
                  className="flex-row items-center justify-center gap-2 bg-transparent rounded-xl border-zinc-700"
                  onPress={() => setShowLogin(false)}
                >
                  <Text className="text-xl font-semibold text-white">
                    {t("auth.actions.back")}
                  </Text>
                </Button>
              </Animated.View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Password Reset Modal */}
      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-zinc-900 p-6 rounded-2xl w-[90%] max-w-[350px]">
            <Text className="text-xl font-semibold text-white text-center mb-6">
              {t("auth.passwordReset.title")}
            </Text>
            <Text className="text-base text-zinc-400 mb-6">
              {t("auth.passwordReset.description")}
            </Text>

            <TextInput
              className="h-12 px-4 rounded-xl bg-zinc-800 text-white text-base mb-6"
              placeholder={t("auth.placeholders.email")}
              placeholderTextColor="#71717a"
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View className="flex-row justify-between gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent border-zinc-700"
                onPress={() => {
                  setShowResetModal(false);
                  setResetEmail("");
                }}
              >
                <Text className="text-white font-medium">
                  {t("auth.actions.cancel")}
                </Text>
              </Button>
              <Button
                variant="default"
                className="flex-1 bg-zinc-800"
                onPress={handlePasswordReset}
                disabled={isResetting}
              >
                <Text className="text-white font-medium">
                  {isResetting
                    ? t("auth.actions.sending")
                    : t("auth.actions.send")}
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
