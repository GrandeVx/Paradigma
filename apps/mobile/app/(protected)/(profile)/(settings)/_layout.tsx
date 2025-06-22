import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === "ios" ? "slide_from_right" : "fade",
        animationDuration: 200,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Ricorrenti",
        }}
      />
      <Stack.Screen
        name="installments"
        options={{
          title: "Rate",
        }}
      />
    </Stack>
  );
} 