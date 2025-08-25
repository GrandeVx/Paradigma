import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function PostCreationFlowLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === "ios" ? "slide_from_right" : "fade",
        animationDuration: 200,
        presentation: "modal",
      }}
      initialRouteName="value"
    >
      <Stack.Screen name="value" options={{
        presentation: "modal",
      }} />
      <Stack.Screen name="publish" options={{
        presentation: "modal",
      }} />
    </Stack>
  );
}
