import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function TransactionFlowLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === "ios" ? "slide_from_right" : "fade",
        animationDuration: 200,
      }}
      initialRouteName="value"
    >
      <Stack.Screen name="value" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
