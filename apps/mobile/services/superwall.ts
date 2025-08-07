import { Platform } from "react-native";
import Superwall, {
  SubscriptionStatus,
  SuperwallDelegate,
  EventType,
  type SuperwallEventInfo,
} from "@superwall/react-native-superwall";
import { createSuperwallConfig } from "@/config/superwall";

// Custom Superwall Delegate to handle paywall events
class BalanceSuperwallDelegate extends SuperwallDelegate {
  private paywallCallbacks: Map<string, (completed: boolean, purchased: boolean) => void> = new Map();

  // Method to register callback for a specific trigger
  registerPaywallCallback(triggerId: string, callback: (completed: boolean, purchased: boolean) => void) {
    this.paywallCallbacks.set(triggerId, callback);
  }

  // Remove callback for a trigger
  unregisterPaywallCallback(triggerId: string) {
    this.paywallCallbacks.delete(triggerId);
  }

  handleSuperwallEvent(eventInfo: SuperwallEventInfo) {
    console.log(`[Superwall] Delegate event: ${eventInfo.event.type}`, eventInfo);

    switch (eventInfo.event.type) {
      case EventType.paywallOpen:
        console.log("✅ [Superwall] Paywall opened");
        break;

      case EventType.paywallClose:
        console.log("❌ [Superwall] Paywall closed");
        // Call registered callback when paywall closes
        const closeCallback = this.paywallCallbacks.get('current_trigger');
        if (closeCallback) {
          closeCallback(true, false); // completed: true, purchased: false (dismissed)
          this.paywallCallbacks.delete('current_trigger');
        }
        break;

      case EventType.transactionComplete:
        console.log("💰 [Superwall] Transaction completed");
        // Call registered callback when transaction completes
        const purchaseCallback = this.paywallCallbacks.get('current_trigger');
        if (purchaseCallback) {
          purchaseCallback(true, true); // completed: true, purchased: true
          this.paywallCallbacks.delete('current_trigger');
        }
        break;

      case EventType.transactionFail:
        console.log("❌ [Superwall] Transaction failed");
        const failCallback = this.paywallCallbacks.get('current_trigger');
        if (failCallback) {
          failCallback(true, false); // completed: true, purchased: false (failed)
          this.paywallCallbacks.delete('current_trigger');
        }
        break;

      case EventType.paywallPresentationRequest:
        console.log("📋 [Superwall] Paywall presentation request");
        const event = eventInfo.event as any; // Type assertion needed for accessing nested properties

        if (event.status?.type === "noPresentation") {
          console.warn("⚠️ [Superwall] Paywall cannot be presented:", event.reason?.type);
          console.warn("🔍 [Superwall] Status reason:", eventInfo.params?.status_reason);

          if (event.reason?.type === "placementNotFound" || eventInfo.params?.status_reason === "event_not_found") {
            console.error("❌ [Superwall] CONFIGURATION ERROR: Trigger not found in dashboard!");
            console.error("🔧 [Superwall] Please configure the trigger 'campaign_trigger' in your Superwall dashboard");

            // Call callback to unblock the onboarding flow
            const noShowCallback = this.paywallCallbacks.get('current_trigger');
            if (noShowCallback) {
              console.log("🔄 [Superwall] Calling callback due to configuration error");
              noShowCallback(true, false); // completed: true (so onboarding continues), purchased: false
              this.paywallCallbacks.delete('current_trigger');
            }
          }
        }
        break;

      default:
        console.log(`❓ [Superwall] Unhandled event: ${eventInfo.event.type}`);
        break;
    }
  }
}

class SuperwallService {
  private static instance: SuperwallService;
  private initialized = false;
  private delegate: BalanceSuperwallDelegate | null = null;

  private constructor() { }

  static getInstance(): SuperwallService {
    if (!SuperwallService.instance) {
      SuperwallService.instance = new SuperwallService();
    }
    return SuperwallService.instance;
  }

  async initialize() {
    if (this.initialized) return;

    const apiKey = Platform.select({
      ios: process.env.EXPO_PUBLIC_SUPERWALL_API_KEY_IOS,
      android: process.env.EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID,
      default: undefined,
    });

    if (!apiKey) {
      console.warn("[Superwall] No API key found for platform:", Platform.OS);
      return;
    }

    try {
      console.log("🚀 [Superwall] Starting initialization...");
      console.log(`🔑 [Superwall] Using API key for ${Platform.OS}:`, apiKey ? `${apiKey.substring(0, 8)}...` : 'None');

      const options = createSuperwallConfig();
      Superwall.configure({
        apiKey,
        options,
      });
      console.log("✅ [Superwall] Configuration applied");

      // Set up delegate
      this.delegate = new BalanceSuperwallDelegate();
      await Superwall.shared.setDelegate(this.delegate);
      console.log("✅ [Superwall] Delegate set successfully");

      this.initialized = true;
      console.log("🎉 [Superwall] Initialization completed successfully");
    } catch (error) {
      console.error("❌ [Superwall] Initialization failed:", error);
      console.error("🔍 [Superwall] Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        platform: Platform.OS,
        hasApiKey: !!apiKey
      });
    }
  }

  async presentPaywall(triggerId: string): Promise<void> {
    try {
      console.log("[Superwall] Presenting paywall for trigger:", triggerId);
      await Superwall.shared.register({ placement: triggerId });
    } catch (error) {
      console.error("[Superwall] Failed to present paywall:", error);
      throw error;
    }
  }

  /**
   * Present paywall with callback for completion
   * @param triggerId The trigger ID for the paywall
   * @param onComplete Callback called when paywall is dismissed or purchase completes
   * @returns Promise that resolves when paywall is presented (not when completed)
   */
  async presentPaywallWithCallback(
    triggerId: string,
    onComplete: (completed: boolean, purchased: boolean) => void
  ): Promise<void> {
    try {
      console.log("🎯 [Superwall] Starting paywall presentation with callback...");
      console.log(`📋 [Superwall] Trigger ID: ${triggerId}`);
      console.log(`🔧 [Superwall] Initialized: ${this.initialized}`);
      console.log(`👥 [Superwall] Delegate available: ${!!this.delegate}`);

      if (!this.initialized) {
        throw new Error("Superwall not initialized. Call initialize() first.");
      }

      if (!this.delegate) {
        console.error("❌ [Superwall] Delegate not available");
        throw new Error("Superwall delegate not initialized");
      }

      console.log("✅ [Superwall] Pre-flight checks passed");

      // Register callback with delegate using 'current_trigger' as key
      // (we use a fixed key since we typically have one active paywall at a time)
      this.delegate.registerPaywallCallback('current_trigger', onComplete);
      console.log("📝 [Superwall] Callback registered with delegate");

      // Present the paywall
      console.log("🚀 [Superwall] Calling Superwall.shared.register()...");
      await Superwall.shared.register({ placement: triggerId });
      console.log("✅ [Superwall] Superwall.shared.register() completed");
    } catch (error) {
      console.error("❌ [Superwall] Failed to present paywall with callback:", error);
      console.error("🔍 [Superwall] Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        triggerId,
        initialized: this.initialized,
        hasDelegate: !!this.delegate
      });

      // Clean up callback on error
      if (this.delegate) {
        this.delegate.unregisterPaywallCallback('current_trigger');
        console.log("🧹 [Superwall] Cleaned up callback after error");
      }
      throw error;
    }
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const status = await Superwall.shared.getSubscriptionStatus();
      console.log("[Superwall] Subscription status:", status);
      return status;
    } catch (error) {
      console.error("[Superwall] Failed to get subscription status:", error);
      throw error;
    }
  }

  /**
   * Sync subscription status with backend
   * This should be called after successful purchases or subscription changes
   */
  async syncSubscriptionStatus(userId: string): Promise<void> {
    try {
      const status = await this.getSubscriptionStatus();
      const isActive = status.status === SubscriptionStatus.Active;

      console.log("[Superwall] Syncing subscription status:", { userId, status, isActive });

      // Map Superwall status to our backend enum
      let backendStatus: string;
      switch (status.status) {
        case SubscriptionStatus.Active:
          backendStatus = "ACTIVE";
          break;
        case SubscriptionStatus.Trial:
          backendStatus = "TRIAL";
          break;
        case SubscriptionStatus.Expired:
          backendStatus = "EXPIRED";
          break;
        case SubscriptionStatus.Cancelled:
          backendStatus = "CANCELLED";
          break;
        default:
          backendStatus = "FREE";
          break;
      }

      // Call our tRPC API to sync subscription status
      const { api } = await import("@/lib/api");

      await api.subscription.sync.useMutation({
        userId,
        status: backendStatus as any,
        isActive: isActive,
        // Add dates if available - you might need to get these from Superwall
        // subscriptionStartDate: ...,
        // subscriptionEndDate: ...,
        // trialEndDate: ...,
      });

      console.log("[Superwall] Subscription status synced successfully");
    } catch (error) {
      console.error("[Superwall] Failed to sync subscription status:", error);
      // Don't throw - sync failures shouldn't break the app flow
    }
  }

  /**
   * Set user attributes for Superwall targeting
   */
  async setUserAttributes(userId: string, attributes: Record<string, string>): Promise<void> {
    try {
      await Superwall.shared.setUserAttributes({
        userId,
        ...attributes,
      });
      console.log("[Superwall] User attributes set:", { userId, attributes });
    } catch (error) {
      console.error("[Superwall] Failed to set user attributes:", error);
    }
  }

  /**
   * Track subscription events for analytics
   */
  trackSubscriptionEvent(eventName: string, properties?: Record<string, string>): void {
    try {
      // This would typically integrate with your analytics service
      console.log("[Superwall] Tracking subscription event:", { eventName, properties });

      // Example: Track with Superwall's built-in analytics
      // Superwall.shared.track(eventName, properties);
    } catch (error) {
      console.error("[Superwall] Failed to track subscription event:", error);
    }
  }
}

export const superwallService = SuperwallService.getInstance();
