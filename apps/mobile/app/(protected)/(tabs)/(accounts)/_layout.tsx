import { Stack } from "expo-router";


export default function AuthLayout() {

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
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
