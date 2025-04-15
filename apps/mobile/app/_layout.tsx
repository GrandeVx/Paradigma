import "../global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "@/components/useColorScheme";
import { SupabaseProvider } from "@/context/supabase-provider";
import { TRPCProvider } from "@/lib/api";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "@/i18n";

import { superwallService } from "@/services/superwall";
import { Platform } from "react-native";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      superwallService.initialize();
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <SupabaseProvider>
      {/* API System */}
      <TRPCProvider>
        {/* SafeAreaProvider */}
        <SafeAreaProvider>
          {/* light/dark mode */}
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <GestureHandlerRootView style={{ flex: 1 }}>
              {/* @ts-expect-error Expo Router Stack is not typed */}
              <Stack              >
                <Stack.Screen
                  name="(splash)"
                  options={{ headerShown: false, animation: "fade" }}
                />
                <Stack.Screen
                  name="(protected)"
                  options={{ headerShown: false, animation: "fade" }}
                />
                <Stack.Screen
                  name="(onboarding)"
                  options={{ headerShown: false, animation: "fade" }}
                />
                <Stack.Screen
                  name="(auth)"
                  options={{ headerShown: false, animation: "fade" }}
                />
              </Stack>
            </GestureHandlerRootView>
          </ThemeProvider>
        </SafeAreaProvider>
      </TRPCProvider>
    </SupabaseProvider>
  );
}
