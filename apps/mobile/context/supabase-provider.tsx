import { SplashScreen, useRouter, useSegments, useRootNavigation } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, AppState, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated";

import { authClient } from "@/lib/auth-client";
import { Session } from "better-auth/types";
import { User } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import { biometricUtils } from "@/lib/mmkv-storage";
import { BiometricAuthScreen } from "@/components/BiometricAuthScreen";


const STORAGE_KEY = "hasCompletedOnboarding";

SplashScreen.preventAutoHideAsync();

type SupabaseContextProps = {
  user: User | null;
  session: Session | null;
  initialized?: boolean;
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => Promise<void>;
  isLoading: boolean;

  // Auth
  signUp: (email: string, password: string) => Promise<string>;
  sendVerificationOtp: (email: string) => Promise<unknown>;
  signInWithVerificationOtp: (email: string, otp: string) => Promise<unknown>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<unknown>;
  signInWithGoogle: () => Promise<unknown>;
  signOut: () => Promise<void>;
  PasswordReset: () => Promise<void>;
  forceRouting: () => void;

  // Storage
  uploadAvatar: (file: string) => Promise<string>;
  getAvatarUrl: () => Promise<string>;
};

type SupabaseProviderProps = {
  children: React.ReactNode;
};

export const SupabaseContext = createContext<SupabaseContextProps>({
  user: null,
  session: null,
  initialized: false,
  isOnboarded: false,
  isLoading: true,
  setIsOnboarded: async () => { },
  signUp: async () => "",
  sendVerificationOtp: async () => { },
  signInWithVerificationOtp: async () => { },
  signInWithPassword: async () => { },
  signInWithApple: async () => { },
  signInWithGoogle: async () => { },
  signOut: async () => { },
  PasswordReset: async () => { },
  forceRouting: () => { },
  uploadAvatar: async () => "",
  getAvatarUrl: async () => "",
});

export const useSupabase = () => useContext(SupabaseContext);
export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {

  const router = useRouter();
  const segments = useSegments();
  const rootNavigation = useRootNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState<boolean>(true);
  const [isOnboarded, setIsOnboardedState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialRoutingDone, setIsInitialRoutingDone] = useState<boolean>(false);
  const [shouldShowSplash, setShouldShowSplash] = useState<boolean>(true);
  const [skipAutoRouting, setSkipAutoRouting] = useState<boolean>(false);
  const [needsBiometricAuth, setNeedsBiometricAuth] = useState<boolean>(false);
  const [showBiometricScreen, setShowBiometricScreen] = useState<boolean>(false);

  // Check onboarding status from AsyncStorage
  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      return value === "true";
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      return false;
    }
  };

  // Set onboarding status in AsyncStorage
  const setIsOnboarded = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(value));
      setIsOnboardedState(value);
      // Only reset routing flag if we're changing from false to true
      if (value && !isOnboarded) {
        setIsInitialRoutingDone(false);
      }
    } catch (error) {
      console.error("Error setting onboarding status:", error);
    }
  };

  /**
   * Sends a password reset email to the user.
   */
  // const PasswordReset = async () => {
  //   const { error } = await supabase.auth.resetPasswordForEmail(
  //     user?.email as string,
  //     {
  //       // You Will redirect to the Web App (Next.js) to reset the password
  //       redirectTo: getBaseUrl() + "/auth/reset-password",
  //     }
  //   );
  //   if (error) {
  //     throw error;
  //   }
  // };


  const sendVerificationOtp = async (email: string) => {
    console.log("🚀 [Mobile Auth] Starting sendVerificationOtp for:", email);
    console.log("🔧 [Mobile Auth] Auth client config:", {
      baseURL: process.env.EXPO_PUBLIC_BACKEND_URL || 'unknown',
      hasEmailOtp: !!(authClient as unknown as { emailOtp?: unknown }).emailOtp,
      clientType: typeof authClient
    });

    try {
      console.log("📤 [Mobile Auth] Calling authClient.emailOtp.sendVerificationOtp...");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error, data } = await (authClient as any).emailOtp.sendVerificationOtp({
        email,
        type: "sign-in"
      });

      console.log("📥 [Mobile Auth] Response received:", {
        hasError: !!error,
        hasData: !!data,
        errorMessage: error?.message || null,
        errorCode: error?.code || null,
        dataKeys: data ? Object.keys(data) : null
      });

      if (error) {
        console.error("❌ [Mobile Auth] sendVerificationOtp error:", error);
        throw error;
      }

      console.log("✅ [Mobile Auth] sendVerificationOtp successful:", data);
      return data;
    } catch (networkError) {
      console.error("💥 [Mobile Auth] Network/unexpected error in sendVerificationOtp:", {
        message: networkError instanceof Error ? networkError.message : networkError,
        stack: networkError instanceof Error ? networkError.stack : null,
        name: networkError instanceof Error ? networkError.name : null
      });
      throw networkError;
    }
  };


  const signInWithVerificationOtp = async (email: string, otp: string) => {
    console.log("signing in with verification otp", email, otp);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error, data } = await (authClient.signIn as any).emailOtp({ email: email, otp: otp });
    if (error) {
      console.log("error", error);
      throw error;
    }
    setUser(data.user as unknown as User);
    setSession(data.token as unknown as Session);

    // Skip auto routing for 3 seconds to allow manual navigation to complete
    setSkipAutoRouting(true);
    setTimeout(() => {
      setSkipAutoRouting(false);
      setIsInitialRoutingDone(false);
    }, 3000);

    return data;
  };


  /**
   * Signs up a new user with the provided email and password.
   * @param email - The email of the new user.
   * @param password - The password of the new user.
   * @throws If there is an error during the sign-up process
   * @returns
   *
   */
  const signUp = async (email: string, password: string) => {
    const { error, data } = await authClient.signUp.email({
      email,
      password,
      name: email,
    });
    if (error) {
      throw error;
    }

    const userId = data.user.id;
    // Type cast to handle type incompatibility
    setUser(data.user as unknown as User);
    setSession(data.token as unknown as Session);
    setInitialized(true);
    // Reset routing flag to trigger a new routing decision
    setIsInitialRoutingDone(false);
    return userId;
  };

  /**
   * Signs in a user with the provided email and password.
   * @param email - The email of the user.
   * @param password - The password of the user.
   * @throws If there is an error during the sign-in process.
   */
  const signInWithPassword = async (email: string, password: string) => {
    const { error, data } = await authClient.signIn.email({
      email,
      password,
    });
    if (error) {
      throw error;
    }
    // Type cast to handle type incompatibility
    setUser(data.user as unknown as User);
    setSession(data.token as unknown as Session);
    // Reset routing flag to trigger a new routing decision
    setIsInitialRoutingDone(false);
  };

  /**
   * Signs in a user with the provided Apple identity token.
   * @returns The user and session data.
   * @throws If there is an error during the sign-in process.
   */
  const signInWithApple = async () => {
    try {
      console.log("🍎 Starting Apple Sign-In...");

      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error("Apple Authentication is not available on this device");
      }

      // Sign in with Apple
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log("✅ Apple Sign-In successful:", credential);

      if (!credential.identityToken) {
        throw new Error("No identity token received from Apple");
      }

      // Decode the identity token to debug
      try {
        const parts = credential.identityToken.split('.');
        const payload = JSON.parse(atob(parts[1]));
        console.log("🔍 Apple Identity Token payload:", payload);
      } catch (e) {
        console.log("Could not decode identity token");
      }

      // Use the identity token to authenticate with Better Auth
      // Better Auth expects idToken in a specific format
      const { error, data } = await authClient.signIn.social({
        provider: "apple",
        idToken: {
          token: credential.identityToken,

        },
      });

      if (error) {
        console.error("❌ Better Auth Apple Sign-In error:", error);
        throw error;
      }

      if (!data) {
        throw new Error("No user data returned from Better Auth");
      }

      // Safe access with type checking
      if ('user' in data && 'token' in data) {
        setUser(data.user as unknown as User);
        setSession(data.token as unknown as Session);
      }

      setInitialized(true);
      
      // Skip auto routing for OAuth to allow notifications modal to open
      setSkipAutoRouting(true);
      setTimeout(() => {
        setSkipAutoRouting(false);
        setIsInitialRoutingDone(false);
      }, 10000); // Give 10 seconds for the notifications modal to complete
      
      return data;
    } catch (error) {
      console.error("❌ Error in signInWithApple:", error);
      throw error;
    }
  };

  /**
   * Signs in a user with the provided Google identity token.
   * @returns The user and session data.
   * @throws If there is an error during the sign-in process.
   */
  const signInWithGoogle = async () => {
    try {
      console.log("🔑 Starting Google Sign-In...");

      // Check if Google Play Services are available (Android)
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      console.log("✅ Google Sign-In successful:", userInfo);

      // Get the ID token
      const tokens = await GoogleSignin.getTokens();
      console.log("🔐 Retrieved Google tokens");

      // Use the ID token to authenticate with Better Auth
      // Better Auth supports signing in with ID tokens directly
      const { data, error } = await authClient.signIn.social({
        provider: "google",
        idToken: {
          token: tokens.idToken,
          accessToken: tokens.accessToken,
        },
      });

      if (error) {
        console.error("❌ Better Auth Google Sign-In error:", error);
        throw error;
      }

      // Safe access with type checking
      if ('user' in data && 'token' in data) {
        setUser(data.user as unknown as User);
        setSession(data.token as unknown as Session);
      }

      setInitialized(true);
      
      // Skip auto routing for OAuth to allow notifications modal to open
      setSkipAutoRouting(true);
      setTimeout(() => {
        setSkipAutoRouting(false);
        setIsInitialRoutingDone(false);
      }, 10000); // Give 10 seconds for the notifications modal to complete
      
      return data;
    } catch (error) {
      console.error("❌ Error in signInWithGoogle:", error);
      throw error;
    }
  };

  /**
   * Signs out the current user.
   * @throws If there is an error during the sign-out process.
   */
  const signOut = async () => {
    await authClient.signOut()
      .then(() => {
        setUser(null);
        setSession(null);
        setInitialized(true);
        // Reset routing flag to trigger a new routing decision
        setIsInitialRoutingDone(false);
        console.log("signed out");
      })
      .catch((error) => {
        console.log("error", error);
        throw error;
      });
  };

  /**
   * Force routing when OAuth notifications modal is completed
   */
  const forceRouting = () => {
    console.log("[🚥 Provider] Force routing requested - stopping skipAutoRouting");
    setSkipAutoRouting(false);
    setIsInitialRoutingDone(false);
  };

  /**
   * Handle successful biometric authentication
   */
  const handleBiometricAuthSuccess = () => {
    console.log("[Biometric] Authentication successful, proceeding to app");
    setShowBiometricScreen(false);
    setNeedsBiometricAuth(false);
    biometricUtils.setNeedsBiometricAuth(false);
    biometricUtils.setLastAuthenticatedTime();
    setIsInitialRoutingDone(false); // Trigger routing to protected area
  };

  /**
   * Handle failed biometric authentication (user chose to exit)
   */
  const handleBiometricAuthFailure = () => {
    console.log("[Biometric] Authentication failed, signing out user");
    signOut();
    setShowBiometricScreen(false);
    setNeedsBiometricAuth(false);
  };

  /**
   * Uploads an avatar file to the Supabase storage.
   *
   * @param file - The avatar file to upload.
   * @returns The uploaded data path.
   * @throws If there is an error during the upload process.
   */
  // const uploadAvatar = async (file: string) => {
  //   const { data, error } = await supabase.storage
  //     .from("avatars")
  //     .upload(user?.id + "/" + "avatar", decode(file), {
  //       contentType: "image/png",
  //       cacheControl: "3600",
  //       upsert: false,
  //     });
  //   if (error) {
  //     throw error;
  //   }
  //   return data.path;
  // };

  /**
   * Retrieves the URL of the user's avatar from the Supabase storage.
   * @returns The URL of the user's avatar, or an empty string if the avatar is not found.
   */
  // const getAvatarUrl = async () => {
  //   const { data } = await supabase.storage
  //     .from("avatars")
  //     .getPublicUrl("avatar");

  //   if (!data) {
  //     return "";
  //   }

  //   const url =
  //     data.publicUrl.split("/").slice(0, -1).join("/") +
  //     "/" +
  //     user?.id +
  //     "/avatar";

  //   return url;
  // };

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = async () => {
      try {
        const webClientId = Constants.expoConfig?.extra?.googleSignIn?.webClientId;
        const iosClientId = Constants.expoConfig?.extra?.googleSignIn?.iosClientId;

        await GoogleSignin.configure({
          webClientId: webClientId,
          iosClientId: iosClientId,
        });
        console.log("✅ Google Sign-In configured successfully");
      } catch (error) {
        console.error("❌ Error configuring Google Sign-In:", error);
      }
    };

    initializeGoogleSignIn();
  }, []);

  // Initialize app state
  useEffect(() => {
    const initializeAppState = async () => {
      setIsLoading(true);
      try {
        // Check session first
        const { data } = await authClient.getSession();

        if (data) {
          // We have a session, user is logged in
          setSession(data.session as unknown as Session);
          setUser(data.user as unknown as User);
        } else {
          // No session, user is not logged in
          setSession(null);
          setUser(null);
        }

        // Check onboarding status
        const isOnboardedValue = await checkOnboardingStatus();
        setIsOnboardedState(isOnboardedValue);

        // All essential state is loaded, now we can make routing decisions
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing app state:", error);
        setIsLoading(false);
      }
    };

    if (initialized) {
      initializeAppState();
    }
  }, [initialized]);

  // Handle routing only after initial state is loaded
  useEffect(() => {
    // Wait until the root navigator is mounted and ready before making any redirects
    if (!(rootNavigation?.isReady && rootNavigation.isReady())) {
      return;
    }

    // Only make routing decisions after loading is complete
    if (isLoading) {
      return;
    }

    // Don't continue if routing is already done
    if (isInitialRoutingDone) {
      console.log("Routing already done, skipping...");
      return;
    }

    // Skip auto routing if manual navigation is in progress
    if (skipAutoRouting) {
      console.log("Skipping auto routing - manual navigation in progress...");
      return;
    }

    // Helper function for redirecting with type safety
    const redirectTo = (path: string) => {
      console.log(`redirecting to ${path}`);
      router.replace(path as never);
    };

    const handleRouting = async () => {
      console.log("Making single routing decision:", {
        session: !!session,
        isOnboarded,
        currentSegments: segments
      });

      // Add a small delay to allow manual navigation to complete first
      await new Promise(resolve => setTimeout(resolve, 200));

      // Determine expected section based on auth and onboarding status
      let expectedSection: string;

      if (session) {
        // User is authenticated
        if (isOnboarded) {
          // Check if biometric authentication is required
          const isBiometricEnabled = biometricUtils.getBiometricEnabled();
          const needsAuth = biometricUtils.getNeedsBiometricAuth();
          const shouldRequireAuth = biometricUtils.shouldRequireAuth();
          
          if (isBiometricEnabled && (needsAuth || shouldRequireAuth)) {
            // Show biometric authentication screen
            console.log("Biometric authentication required");
            setShowBiometricScreen(true);
            setNeedsBiometricAuth(true);
            
            // Mark initial routing as done and hide splash screen
            setIsInitialRoutingDone(true);
            setTimeout(() => {
              setShouldShowSplash(false);
              SplashScreen.hideAsync();
            }, 300);
            
            return; // Stop routing until biometric auth is complete
          }
          
          // User is authenticated and onboarded → go to app
          expectedSection = "(protected)";
        } else {
          // User is authenticated but not onboarded → complete onboarding
          expectedSection = "(onboarding)";
        }
      } else {
        // User is not authenticated
        if (isOnboarded) {
          // User completed onboarding but not authenticated → go to auth
          expectedSection = "(auth)";
        } else {
          // User never completed onboarding → start onboarding
          expectedSection = "(onboarding)";
        }
      }

      const currentSection = segments[0];

      console.log(`Expected section: ${expectedSection}, Current section: ${currentSection}`);

      // Only redirect if we're not already in the correct section
      if (currentSection !== expectedSection) {
        const finalDestination = expectedSection === "(auth)" ? "/(auth)/" : `/${expectedSection}`;
        console.log(`Redirecting to: ${finalDestination}`);
        redirectTo(finalDestination);
      } else {
        console.log("Already in correct section, no redirect needed");
      }

      // Mark initial routing as done
      setIsInitialRoutingDone(true);

      // Hide splash screen with smooth transition
      setTimeout(() => {
        setShouldShowSplash(false);
        SplashScreen.hideAsync();
      }, 300); // Smooth transition delay
    };

    handleRouting();
  }, [isLoading, session, isOnboarded, isInitialRoutingDone, rootNavigation?.isReady]);

  // Monitor AppState changes for auto-lock functionality
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      const isBiometricEnabled = biometricUtils.getBiometricEnabled();
      
      if (!isBiometricEnabled || !session || !isOnboarded) {
        return; // Don't monitor if biometric is disabled or user not authenticated
      }

      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App going to background, mark that we need auth when returning
        console.log("[Biometric] App going to background, requiring auth on return");
        biometricUtils.setNeedsBiometricAuth(true);
      } else if (nextAppState === 'active') {
        // App returning to foreground, check if we need to authenticate
        const needsAuth = biometricUtils.getNeedsBiometricAuth();
        const shouldRequireAuth = biometricUtils.shouldRequireAuth();
        
        if (needsAuth || shouldRequireAuth) {
          console.log("[Biometric] App returning to foreground, showing biometric auth");
          setShowBiometricScreen(true);
          setNeedsBiometricAuth(true);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [session, isOnboarded]);

  // Custom Loading Screen Component
  const LoadingScreen = () => {
    // Animation values for currency symbols - moved outside to optimize performance
    const dollarOpacity = useSharedValue(0);
    const euroOpacity = useSharedValue(0);
    const poundOpacity = useSharedValue(0);
    const yenOpacity = useSharedValue(0);

    // Smooth easing configuration
    const easeInOut = Easing.bezier(0.4, 0, 0.2, 1);
    const animationConfig = {
      duration: 1200,
      easing: easeInOut,
    };

    // Start smooth animations when component mounts
    useEffect(() => {
      const animateSymbols = () => {
        // Reset all symbols to 0 opacity
        dollarOpacity.value = 0;
        euroOpacity.value = 0;
        poundOpacity.value = 0;
        yenOpacity.value = 0;

        // Staggered smooth fade-in animations with longer visibility
        dollarOpacity.value = withDelay(
          0,
          withTiming(1, animationConfig, () => {
            // Stay visible for 2.5 seconds, then fade out
            dollarOpacity.value = withDelay(
              2500,
              withTiming(0, { duration: 800, easing: easeInOut })
            );
          })
        );

        euroOpacity.value = withDelay(
          400,
          withTiming(1, animationConfig, () => {
            euroOpacity.value = withDelay(
              2500,
              withTiming(0, { duration: 800, easing: easeInOut })
            );
          })
        );

        poundOpacity.value = withDelay(
          800,
          withTiming(1, animationConfig, () => {
            poundOpacity.value = withDelay(
              2500,
              withTiming(0, { duration: 800, easing: easeInOut })
            );
          })
        );

        yenOpacity.value = withDelay(
          1200,
          withTiming(1, animationConfig, () => {
            yenOpacity.value = withDelay(
              2500,
              withTiming(0, { duration: 800, easing: easeInOut })
            );
          })
        );
      };

      // Start initial animation immediately
      animateSymbols();
      
      // Repeat animation every 7 seconds for a more relaxed experience
      const interval = setInterval(animateSymbols, 7000);
      return () => clearInterval(interval);
    }, [dollarOpacity, euroOpacity, poundOpacity, yenOpacity]);

    // Animated styles for currency symbols
    const dollarStyle = useAnimatedStyle(() => ({
      opacity: dollarOpacity.value,
    }));

    const euroStyle = useAnimatedStyle(() => ({
      opacity: euroOpacity.value,
    }));

    const poundStyle = useAnimatedStyle(() => ({
      opacity: poundOpacity.value,
    }));

    const yenStyle = useAnimatedStyle(() => ({
      opacity: yenOpacity.value,
    }));

    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          {/* Logo in the center */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Animated currency symbols with smooth transitions */}
          <Animated.Text style={[styles.currencySymbol, styles.dollarSymbol, dollarStyle]}>
            $
          </Animated.Text>
          <Animated.Text style={[styles.currencySymbol, styles.euroSymbol, euroStyle]}>
            €
          </Animated.Text>
          <Animated.Text style={[styles.currencySymbol, styles.poundSymbol, poundStyle]}>
            £
          </Animated.Text>
          <Animated.Text style={[styles.currencySymbol, styles.yenSymbol, yenStyle]}>
            ¥
          </Animated.Text>
        </View>
      </SafeAreaView>
    );
  };

  // Show loading screen only when shouldShowSplash is true
  if (shouldShowSplash) {
    return (
      <SupabaseContext.Provider
        value={{
          user,
          session,
          initialized,
          isOnboarded,
          isLoading,
          setIsOnboarded,
          signUp,
          signInWithPassword,
          signInWithVerificationOtp,
          signInWithApple,
          signInWithGoogle,
          sendVerificationOtp,
          signOut,
          forceRouting,
          PasswordReset: async () => { },
          uploadAvatar: async () => "",
          getAvatarUrl: async () => "",
        }}
      >
        <LoadingScreen />
      </SupabaseContext.Provider>
    );
  }

  return (
    <SupabaseContext.Provider
      value={{
        user,
        session,
        initialized,
        isOnboarded,
        isLoading,
        setIsOnboarded,
        signUp,
        signInWithPassword,
        signInWithVerificationOtp,
        signInWithApple,
        signInWithGoogle,
        sendVerificationOtp,
        signOut,
        forceRouting,
        // Stub implementations to satisfy the context contract (not yet implemented on mobile)
        PasswordReset: async () => { },
        uploadAvatar: async () => "",
        getAvatarUrl: async () => "",
      }}
    >
      {showBiometricScreen ? (
        <BiometricAuthScreen
          onAuthSuccess={handleBiometricAuthSuccess}
          onAuthFailure={handleBiometricAuthFailure}
        />
      ) : (
        children
      )}
    </SupabaseContext.Provider>
  );
};

// Styles for the loading screen
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#005EFD", // Blue background to match Figma
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  logoImage: {
    width: 200,
    height: 100,
  },
  currencySymbol: {
    position: "absolute",
    fontSize: 146,
    fontWeight: "700",
    color: "#359AF8", // Blue color for symbols
    fontFamily: "System", // Will fallback to system font
    textAlign: "center",
  },
  dollarSymbol: {
    top: "18%",
    left: "15%",
  },
  euroSymbol: {
    top: "26%",
    right: "10%",
  },
  poundSymbol: {
    bottom: "35%",
    left: "-6%",
  },
  yenSymbol: {
    bottom: "20%",
    right: "20%",
  },
});
