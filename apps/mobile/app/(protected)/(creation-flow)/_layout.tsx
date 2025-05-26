import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function CreationFlowLayout() {
  return (
    // @ts-expect-error - Stack is not typed
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === "ios" ? "slide_from_right" : "fade",
        animationDuration: 200,
      }}

      initialRouteName="name"
    >
      <Stack.Screen name="name" options={{

      }} />
      <Stack.Screen name="icon" options={{

      }} />
    </Stack>
  );
}
