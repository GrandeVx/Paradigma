import { Stack } from "expo-router";

export default function CreationFlowLayout() {
  return (

    <Stack
      screenOptions={{
        headerShown: false,

      }}

      initialRouteName="name"
    >
      <Stack.Screen name="name" options={{
        animation: "none",
        animationDuration: 0,
      }} />
      <Stack.Screen name="icon" options={{

      }} />
    </Stack>
  );
}
