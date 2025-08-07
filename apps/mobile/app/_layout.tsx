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
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "@/components/useColorScheme";
import { AuthProvider } from "@/context/auth-provider";
import { TRPCProvider } from "@/lib/api";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "@/i18n";

import { superwallService } from "@/services/superwall";
import { Platform } from "react-native";

import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import { TabBarProvider } from "@/context/TabBarContext";

// Import per Expo Updates
import { useExpoUpdates } from "@/hooks/use-expo-updates";
import { UpdateModal } from "@/components/ui/update-modal";
import { useNotificationBadge } from "@/hooks/use-notification-badge";
import { LoadingScreen } from "@/components/LoadingScreen";
import { NetworkProvider, useNetworkState } from "@/context/NetworkProvider";

import * as Notifications from 'expo-notifications';

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default (this is a workaround to avoid the error)
});

// Configure notifications to show alerts in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
    ApfelGrotezk: require("../assets/fonts/ApfelGrotezk-Regular.otf"),
    ApfelGrotezkMittel: require("../assets/fonts/ApfelGrotezk-Mittel.otf"),
    DMSans: require("../assets/fonts/DMSans.ttf"),
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

  return <AppWithNetworkAwareLayout />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // Integrazione Expo Updates
  const { updateInfo, downloadAndRestart, dismissUpdate } = useExpoUpdates();

  // Clear notification badge when app becomes active
  useNotificationBadge();

  return (
    <>
      <AuthProvider>
        {/* API System */}
        <TRPCProvider>
          {/* SafeAreaProvider */}
          <SafeAreaProvider>
            {/* light/dark mode */}
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <GestureHandlerRootView style={{ flex: 1 }} className="container grid grid-cols-4 grid-rows-8 gap-4">
                <TabBarProvider>
                  <AppWithNetworkState />
                </TabBarProvider>
              </GestureHandlerRootView>

              {/* Update Modal - Outside GestureHandler for proper z-index */}
              <UpdateModal
                visible={updateInfo.isAvailable}
                updateInfo={updateInfo}
                onUpdatePress={downloadAndRestart}
                onDismiss={dismissUpdate}
                onCancel={dismissUpdate}
              />
            </ThemeProvider>
          </SafeAreaProvider>
        </TRPCProvider>
      </AuthProvider>
    </>
  );
}

function AppWithNetworkState() {
  const { isConnected, isLoading, hasInitialConnection, isReconnecting } = useNetworkState();
  const [appIsReady, setAppIsReady] = useState(false);
  const [minLoadTimeCompleted, setMinLoadTimeCompleted] = useState(false);

  // Ensure app shows loading screen for at least 2 seconds for smooth UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadTimeCompleted(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Track when app initialization is complete
  useEffect(() => {
    // App is ready when we have initial connection status (regardless of connected/disconnected)
    if (!isLoading && hasInitialConnection) {
      setAppIsReady(true);
    }
  }, [isLoading, hasInitialConnection]);

  // Show loading screen if:
  // 1. App is not ready (still initializing)
  // 2. Minimum load time hasn't completed 
  // 3. No internet connection available
  // 4. Currently reconnecting
  const shouldShowLoading = !appIsReady || !minLoadTimeCompleted || !isConnected || isReconnecting;

  return (
    <>
      <Stack>
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

      {/* Network-aware Loading Screen */}
      <LoadingScreen
        isVisible={shouldShowLoading}
        networkState={{
          isConnected,
          isLoading,
          isReconnecting,
          hasInitialConnection
        }}
      />
    </>
  );
}

function AppWithNetworkAwareLayout() {
  return (
    <NetworkProvider>
      <RootLayoutNav />
    </NetworkProvider>
  );
}
