import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";

export default function GroupsLayout() {
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
          title: t("tab-bar.groups"),
        }}
      />

      <Stack.Screen
        name="group-management"
        options={{
          presentation: "card",
          animation: Platform.OS === "ios" ? "slide_from_bottom" : "fade_from_bottom",
          animationDuration: 300,
        }}
        initialParams={{
          title: "Group Management",
        }}
      />
    </Stack>
  );
}
