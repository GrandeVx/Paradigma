import { SplashScreen, useRouter, useSegments, useRootNavigation } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { Session } from "better-auth/types";
import { User } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";


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
      // Reset routing flag to trigger a new routing decision
      setIsInitialRoutingDone(false);
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
    // Reset routing flag to trigger a new routing decision
    setIsInitialRoutingDone(false);
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
      const { error, data } = await authClient.signIn.social({
        provider: "apple",
      });

      if (error) {
        console.error("Error signing in with Apple:", error);
        throw error;
      }

      if (!data) {
        throw new Error("No user data returned");
      }

      // Safe access with type checking
      if ('user' in data && 'token' in data) {
        setUser(data.user as unknown as User);
        setSession(data.token as unknown as Session);
      }

      setInitialized(true);
      // Reset routing flag to trigger a new routing decision
      setIsInitialRoutingDone(false);
      return data;
    } catch (error) {
      console.error("Error in signInWithApple:", error);
      throw error;
    }
  };

  /**
   * Signs in a user with the provided Google identity token.
   * @returns The user and session data.
   * @throws If there is an error during the sign-in process.
   */
  const signInWithGoogle = async () => {
    const { data, error } = await authClient.signIn.social({
      provider: "google",
    });

    if (error) throw error;

    // Safe access with type checking
    if ('user' in data && 'token' in data) {
      setUser(data.user as unknown as User);
      setSession(data.token as unknown as Session);
    }

    setInitialized(true);
    // Reset routing flag to trigger a new routing decision
    setIsInitialRoutingDone(false);
    return data;
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

    // Define our route sections for better type safety
    type AppSection = "(protected)" | "(onboarding)" | "(auth)" | "(splash)";

    // Helper function to check if we're in a specific section
    const isInSection = (section: AppSection) => {
      console.log("Checking if we're in section", section, segments[0], segments);
      return segments[0] === section;
    }

    // Helper function for redirecting with type safety
    const redirectTo = (path: string) => {
      console.log(`redirecting to ${path}`);
      router.replace(path as never);
    };

    // Only make routing decisions after loading is complete
    if (isLoading) {
      // If still loading, route to splash screen
      if (!isInSection("(splash)" as AppSection)) {
        redirectTo("/(splash)");
      }
      return;
    }

    // Don't continue if routing is already done
    if (isInitialRoutingDone) return;

    const handleRouting = async () => {
      const inProtectedGroup = isInSection("(protected)" as AppSection);
      const inOnboardingGroup = isInSection("(onboarding)" as AppSection);
      const inAuthGroup = isInSection("(auth)" as AppSection);
      const inSplashGroup = isInSection("(splash)" as AppSection);

      console.log("Routing decision:", {
        session: !!session,
        isOnboarded,
        inProtectedGroup,
        inOnboardingGroup,
        inAuthGroup,
        inSplashGroup
      });

      // Make a single routing decision based on current state
      if (session) {
        // User is authenticated
        if (isOnboarded) {
          // User is authenticated and onboarded
          if (!inProtectedGroup) {
            redirectTo("/(protected)");
          }
        } else if (!inOnboardingGroup) {
          // User is authenticated but not onboarded
          redirectTo("/(onboarding)");
        }
      } else {
        // User is not authenticated
        if (!isOnboarded && !inOnboardingGroup) {
          // User has not completed onboarding and is not in onboarding screen
          redirectTo("/(onboarding)");
        } else if (isOnboarded && !inAuthGroup) {
          // User has completed onboarding but is not authenticated
          redirectTo("/(auth)/");
        }
      }

      // Mark initial routing as done to prevent multiple redirects
      setIsInitialRoutingDone(true);

      // Hide splash screen after routing decisions are made
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 500); // Small delay to ensure routing completes
    };

    handleRouting();
  }, [isLoading, session, isOnboarded, segments, isInitialRoutingDone, rootNavigation]);

  // Reset routing flag when segments change
  useEffect(() => {
    if (!isLoading && isInitialRoutingDone && segments.length > 0) {
      // Allow a new routing decision when user navigates to a different section
      const currentSection = segments[0];
      if (
        (session && isOnboarded && currentSection !== "(protected)") ||
        (session && !isOnboarded && currentSection !== "(onboarding)") ||
        (!session && !isOnboarded && currentSection !== "(onboarding)") ||
        (!session && isOnboarded && currentSection !== "(auth)")
      ) {
        setIsInitialRoutingDone(false);
      }
    }
  }, [segments, session, isOnboarded, isLoading, isInitialRoutingDone]);

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
        // Stub implementations to satisfy the context contract (not yet implemented on mobile)
        PasswordReset: async () => { },
        uploadAvatar: async () => "",
        getAvatarUrl: async () => "",
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};
