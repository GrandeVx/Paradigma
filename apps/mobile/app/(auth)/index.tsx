import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Link, useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { SvgIcon } from "@/components/ui/svg-icon";
import { SafeAreaView } from "react-native-safe-area-context";



export default function AuthIndex() {
  const { t } = useTranslation();
  const router = useRouter();

  return (

    <SafeAreaView className="flex-1 bg-black px-6 ">
      <View className="flex-1 justify-end gap-52 ">
        <View className="flex-col items-start justify-end w-full gap-4">
          <View className="flex-row justify-start items-center h-20 w-full">
            <SvgIcon name="pig-money" size={40} color="#FFFFFF" />
          </View>
          <Text className="text-[56px] font-semibold  text-white text-left font-sans leading-[64px] -tracking-wider">
            {t("auth.start.title")}
          </Text>
          <Text className="text-base font-sans font-semibold text-white">
            {t("auth.start.description")}
          </Text>
        </View>

        <View className="justify-end mt-2 flex-col gap-8 ">
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
    </SafeAreaView>

  );
}

