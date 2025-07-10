import React, { useState } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useSupabase } from "@/context/supabase-provider";



export default function SignUp() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useSupabase();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

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
      <View className="flex-1 bg-white px-6">
        <View className="flex-1 justify-center">
          <Text className="text-[56px] font-semibold mb-12 text-black text-left font-sans leading-[64px] -tracking-wider">
            {t("auth.title")}
          </Text>


          <View className="justify-center mt-2 flex-col gap-8">
            <Button
              variant="primary"
              size="sm"
              leftIconName="at"
              textClassName="text-[16px] font-sans font-semibold"
              onPress={() => router.push("/(auth)/sign-in-name")}
            >
              <Text>
                {t("auth.actions.use-email")}
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
                  disabled={isAppleLoading}
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
                  disabled={isGoogleLoading}
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
    </HeaderContainer>
  );
}


/*

    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-black"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >

<View className="flex-1 justify-center">
  <Text
    className="text-4xl font-bold mb-12 text-white text-center"
    style={{ color: "white" }}
  >
    {t("auth.title")}
  </Text>
</View>


<View className="space-y-6 px-4 bg-zinc-900 rounded-t-3xl">
  <View className="mb-10 pt-7 flex gap-4">
    {!showLogin ? (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        className="gap-4"
      >

        <Button
          variant="outline"
          className="flex-row items-center justify-center gap-2 bg-white rounded-xl"
        >
          <Ionicons name="logo-apple" size={18} color="black" />
          <Text className="text-xl font-medium ">
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
      </ScrollView >


  < Modal
visible = { showResetModal }
transparent
animationType = "fade"
onRequestClose = {() => setShowResetModal(false)}
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
      </Modal >
    </KeyboardAvoidingView >

*/