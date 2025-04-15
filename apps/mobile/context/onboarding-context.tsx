import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type OnboardingContextType = {
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

const STORAGE_KEY = "hasCompletedOnboarding";

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      setIsOnboarded(value === "true");
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setIsOnboarded(false);
    }
  };

  const handleSetIsOnboarded = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(value));
      setIsOnboarded(value);
    } catch (error) {
      console.error("Error setting onboarding status:", error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarded: isOnboarded ?? false,
        setIsOnboarded: handleSetIsOnboarded,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
