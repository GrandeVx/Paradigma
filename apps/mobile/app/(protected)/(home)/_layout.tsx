import { Stack } from "expo-router";

export default function CreationFlowLayout() {
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

    </Stack>
  );
}
