import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  return (
    <SafeAreaProvider>
      {/* @ts-expect-error Expo Router Stack is not typed */}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          gestureEnabled: true,
          gestureDirection: "horizontal",
          animationDuration: 200,
          transitionSpec: {
            open: {
              animation: "spring",
              config: {
                stiffness: 1000,
                damping: 100,
                mass: 3,
                overshootClamping: false,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01,
              },
            },
            close: {
              animation: "spring",
              config: {
                stiffness: 1000,
                damping: 100,
                mass: 3,
                overshootClamping: false,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01,
              },
            },
          },
          cardStyle: {
            backgroundColor: "transparent",
          },
          presentation: "card",
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
            overlayStyle: {
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          }),
        }}
        initialRouteName="index"
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="problem" />
        <Stack.Screen name="solution" />
        <Stack.Screen name="features" />
        <Stack.Screen name="final" />
      </Stack>
    </SafeAreaProvider>
  );
}
