import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { SubscriptionStatus } from "@superwall/react-native-superwall";
import { superwallService } from "@/services/superwall";

export function useSuperwall() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === "web") {
      setIsLoading(false);
      return;
    }

    const initializeAndCheck = async () => {
      await superwallService.initialize();
      await checkSubscription();
    };

    initializeAndCheck();
  }, []);

  const checkSubscription = async () => {
    try {
      const status = await superwallService.getSubscriptionStatus();
      setIsSubscribed(status === SubscriptionStatus.Active);
    } catch (error) {
      console.error("[Superwall] Hook subscription check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showPaywall = async (triggerId: string) => {
    if (isLoading || Platform.OS === "web") return;

    try {
      await superwallService.presentPaywall(triggerId);

      // Refresh subscription status after paywall interaction
      await checkSubscription();

      // Track paywall event
      superwallService.trackSubscriptionEvent('paywall_presented', { triggerId });
    } catch (error) {
      console.error("[Superwall] Hook failed to show paywall:", error);
    }
  };

  const showPaywallWithCallback = async (
    triggerId: string,
    onComplete: (completed: boolean, purchased: boolean) => void
  ) => {
    if (isLoading || Platform.OS === "web") {
      onComplete(false, false);
      return;
    }

    try {
      await superwallService.presentPaywallWithCallback(triggerId, async (completed, purchased) => {
        console.log(`[Superwall] Paywall completed: ${completed}, purchased: ${purchased}`);

        // Refresh subscription status after paywall interaction
        if (completed) {
          await checkSubscription();
        }

        // Track paywall event
        superwallService.trackSubscriptionEvent('paywall_completed', {
          triggerId,
          completed: completed.toString(),
          purchased: purchased.toString()
        });

        // Call the provided callback
        onComplete(completed, purchased);
      });

      // Track paywall presentation
      superwallService.trackSubscriptionEvent('paywall_presented', { triggerId });
    } catch (error) {
      console.error("[Superwall] Hook failed to show paywall with callback:", error);
      onComplete(false, false);
    }
  };

  const syncSubscriptionWithBackend = async (userId: string) => {
    if (Platform.OS === "web") return;

    try {
      await superwallService.syncSubscriptionStatus(userId);
    } catch (error) {
      console.error("[Superwall] Failed to sync subscription with backend:", error);
    }
  };

  return {
    isSubscribed,
    isLoading,
    showPaywall,
    showPaywallWithCallback,
    checkSubscription,
    syncSubscriptionWithBackend,
  };
}
