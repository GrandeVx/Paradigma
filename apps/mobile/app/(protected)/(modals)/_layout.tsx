import { Stack } from "expo-router";

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="(creation-flow)" 
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen 
        name="(transaction-flow)" 
        options={{
          presentation: "modal",
        }}
      />
    </Stack>
  );
}