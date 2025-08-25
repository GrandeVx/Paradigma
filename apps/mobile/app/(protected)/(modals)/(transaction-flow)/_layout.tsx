import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function PostCreationFlowLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === "ios" ? "slide_from_bottom" : "fade_from_bottom",
        animationDuration: 300,
        presentation: "modal",
      }}
      initialRouteName="value"
    >
      <Stack.Screen name="value" options={{
        presentation: "modal",
        gestureEnabled: true,
      }} />
    </Stack>
  );
}
