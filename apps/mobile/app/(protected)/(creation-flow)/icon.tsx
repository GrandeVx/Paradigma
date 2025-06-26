import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform, Pressable, FlatList } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SvgIcon } from "@/components/ui/svg-icon";
import { IconName } from "@/components/ui/icons";
import { AccountIcons } from "@/components/ui/icons";

export default function IconStepFlow(
) {
  const { t } = useTranslation();
  const router = useRouter();
  const [icon, setIcon] = useState<string>();
  const nameInputRef = useRef<TextInput>(null);
  const params = useLocalSearchParams<{ name: string, firstAccount: string }>();
  // Automatically focus the input field when the screen mounts
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleContinue = async () => {
    router.push({
      pathname: "/(protected)/(creation-flow)/color",
      params: {
        name: params.name,
        icon: icon,
        firstAccount: params.firstAccount,

      },
    });
  };

  const isButtonDisabled = !icon; // Basic check, enhance with validation

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
              <Text className="  text-gray-600 text-base font-sans font-normal mb-2 text-center">
                {t("flow.name.prompt", "Scegli un'icona per")} <Text className="font-semibold font-sans">{params.name.toUpperCase()}</Text>
              </Text>

              <View className="relative w-full items-center justify-center mt-4">
                <FlatList
                  data={Object.values(AccountIcons)}
                  numColumns={3}
                  columnWrapperStyle={{ justifyContent: 'space-evenly', gap: 20, marginBottom: 20 }}
                  renderItem={({ item }) => (
                    <Pressable onPress={() => setIcon(item.toString())}>
                      <View className={`w-20 h-20 border rounded-xl flex items-center justify-center ${icon === item.toString() ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}>
                        <SvgIcon
                          name={item as IconName}
                          width={24}
                          height={24}
                          color={icon === item.toString() ? "#3B82F6" : "#9CA3AF"}
                        />
                      </View>
                    </Pressable>
                  )}
                  keyExtractor={(item) => item}
                  removeClippedSubviews={true}
                  initialNumToRender={9}
                  maxToRenderPerBatch={6}
                  windowSize={5}
                  getItemLayout={(data, index) => ({
                    length: 100, // height + margin
                    offset: 100 * Math.floor(index / 3),
                    index,
                  })}
                />
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