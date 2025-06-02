import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function AuthLayout() {

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
          title: "accounts",
        }}
      />


    </Stack>
  );
}
