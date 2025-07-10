import React, { useState, useRef } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";


export default function NameStepFlow(
) {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState("");
  const nameInputRef = useRef<TextInput>(null);
  const params = useLocalSearchParams<{ firstAccount: string }>();
  // Automatically focus the input field when the screen mounts


  const handleContinue = async () => {
    router.push({
      pathname: "/(protected)/(creation-flow)/icon",
      params: {
        name: name,
        firstAccount: params.firstAccount,
      },
    });
  };

  const isButtonDisabled = !name; // Basic check, enhance with validation

  return (
    <HeaderContainer variant="secondary" customTitle={t(params.firstAccount === "true" ? "flow.name.firstAccount" : "flow.name.title")}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0} // Adjust offset as needed
      >
        <View className="flex-1 justify-between p-4 bg-white gap-2 w-full">
          <View className="flex-1 justify-center items-center w-full ">
            <Pressable onPress={() => nameInputRef.current?.focus()} className="w-full flex flex-col items-center justify-center" >
              <Text className="text-gray-600 text-base font-sans font-normal mb-2">
                {t("flow.name.prompt")}
              </Text>
              <View className="relative w-full h-fit items-center justify-center">
                <TextInput
                  autoFocus
                  ref={nameInputRef}
                  className="font-sans text-black text-center"
                  style={{ fontSize: 34 }}
                  placeholder={t("flow.name.placeholder")}
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  keyboardType="default"
                  returnKeyType="next"
                  onSubmitEditing={handleContinue}
                  autoComplete="name"
                  spellCheck={false}
                  multiline={false}
                  numberOfLines={1}
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
                {t("auth.actions.continue")}
              </Text>
            </Button>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </HeaderContainer>
  );
} 