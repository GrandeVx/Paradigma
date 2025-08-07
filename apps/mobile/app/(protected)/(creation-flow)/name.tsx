import React, { useState, useRef, useCallback } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useRouter, useFocusEffect } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function FormInputScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState("");
  const nameInputRef = useRef<TextInput>(null);

  // Reset state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setName("");
      return () => {};
    }, [])
  );

  const handleContinue = () => {
    router.push({
      pathname: "/(protected)/(creation-flow)/details",
      params: { name }
    });
  };

  const isButtonDisabled = !name.trim();

  return (
    <HeaderContainer variant="secondary" customTitle="Create New Item">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <View className="flex-1 justify-between p-4 bg-white gap-2 w-full">
          
          {/* Input Section */}
          <View className="flex-1 justify-center items-center w-full">
            <Pressable 
              onPress={() => nameInputRef.current?.focus()} 
              className="w-full flex flex-col items-center justify-center"
            >
              <Text className="text-gray-600 text-base font-normal mb-4 text-center">
                What would you like to name it?
              </Text>
              
              <View className="relative w-full h-fit items-center justify-center">
                <TextInput
                  autoFocus
                  ref={nameInputRef}
                  className="font-sans text-black text-center w-full border-b-2 border-gray-200 pb-2"
                  style={{ fontSize: 24 }}
                  placeholder="Enter name here"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  keyboardType="default"
                  returnKeyType="next"
                  onSubmitEditing={handleContinue}
                  spellCheck={false}
                  multiline={false}
                  numberOfLines={1}
                />
              </View>
            </Pressable>

            {/* Helper text */}
            <View className="mt-8 px-4">
              <Text className="text-gray-500 text-sm text-center">
                Choose a descriptive name that will help you identify this item
              </Text>
            </View>

            {/* Progress indicator */}
            <View className="mt-6 flex-row gap-2">
              <View className="w-8 h-2 bg-primary-500 rounded-full" />
              <View className="w-8 h-2 bg-gray-200 rounded-full" />
              <View className="w-8 h-2 bg-gray-200 rounded-full" />
            </View>
            <Text className="text-gray-400 text-xs mt-2">Step 1 of 3</Text>
          </View>

          {/* Continue Button */}
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Button
              variant="primary"
              size="lg"
              onPress={handleContinue}
              disabled={isButtonDisabled}
              className="mb-8"
            >
              <Text className="text-[16px] font-semibold">
                Continue
              </Text>
            </Button>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </HeaderContainer>
  );
}