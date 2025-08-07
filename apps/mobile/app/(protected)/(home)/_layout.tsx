import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="index"
    >
      <Stack.Screen name="index" options={{
        animation: "none",
        animationDuration: 0,
      }} />

      <Stack.Screen name="(daily-transactions)" options={{
        animation: "slide_from_right",
        presentation: "card",
      }} />
    </Stack>
  );
}
