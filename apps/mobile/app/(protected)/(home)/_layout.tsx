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

      <Stack.Screen name="transaction-edit/[id]" options={{
        animation: "slide_from_right",
        presentation: "card",
      }} />

      <Stack.Screen name="(daily-transactions)" options={{
        animation: "slide_from_right",
        presentation: "card",
      }} />

      <Stack.Screen name="(category-transactions)" options={{
        animation: "slide_from_right",
        presentation: "card",
      }} />
    </Stack>
  );
}
