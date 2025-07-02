import React from "react";
import { View, ImageBackground, Image } from "react-native";
import { Text } from "@/components/ui/text";
import { Link, useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";



export default function AuthIndex() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      className="flex-1"
      imageClassName="transform"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 px-6">
        <View className="flex-1 justify-between">
          {/* Logo Section - Centered */}
          <View className="flex-1 justify-center items-center">
            <View className="items-center">
              <Image
                source={require("@/assets/images/icon.png")}
                className="w-20 h-20 rounded-xl"
                resizeMode="contain"
              />
              <Image
                source={require("@/assets/images/logo.png")}
                className="w-screen h-32"
                resizeMode="contain"
              />
              <Text className="text-base font-sans font-semibold text-white text-center">
                {t("auth.start.description")}
              </Text>
            </View>
          </View>

          {/* Content Section - Bottom */}
          <View className="gap-8 pb-8">


            <View className="gap-4">
              <Button
                variant="primary"
                size="lg"
                textClassName="text-[16px] font-sans font-semibold"
                onPress={() => router.push("/(auth)/sign-in")}
              >
                <Text>
                  {t("auth.start.button")}
                </Text>
              </Button>
              <View className="justify-center items-center flex-row gap-1">
                <Text className="text-base font-sans font-semibold text-gray-400">
                  {t("auth.start.subtitle")}
                </Text>
                <Link href="/(auth)/sign-up">
                  <Text className="text-base font-sans font-semibold text-white">
                    {t("auth.start.link")}
                  </Text>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

