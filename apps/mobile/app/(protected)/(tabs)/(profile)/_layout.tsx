import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";

export default function AuthLayout() {
  const { t } = useTranslation();
  return (

    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === "ios" ? "slide_from_right" : "fade",
        animationDuration: 200,
      }}
      initialRouteName="index"
    >
      <Stack.Screen
        name="index"
        initialParams={{
          title: t("tab-bar.profile"),
        }}
      />

    </Stack>
  );
}
