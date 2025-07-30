import { useMemo } from 'react';

export interface FeatureFlags {
  requireSubscription: boolean;
  paywallEnabled: boolean;
}

/**
 * Hook for managing feature flags
 * This allows us to control features like subscription requirements during beta testing
 */
export function useFeatureFlags(): FeatureFlags {
  const flags = useMemo<FeatureFlags>(() => ({
    requireSubscription: process.env.EXPO_PUBLIC_REQUIRE_SUBSCRIPTION === 'true',
    paywallEnabled: process.env.EXPO_PUBLIC_PAYWALL_ENABLED === 'true',
  }), []);

  if (__DEV__) {
    console.log('[FeatureFlags] Current flags:', flags);
  }

  return flags;
}

/**
 * Hook specifically for subscription-related features
 */
export function useSubscriptionFeatures() {
  const { requireSubscription, paywallEnabled } = useFeatureFlags();

  return useMemo(() => ({
    shouldRequireSubscription: requireSubscription,
    shouldShowPaywall: paywallEnabled,
    isBetaMode: !requireSubscription, // When subscription is not required, we're in beta mode
  }), [requireSubscription, paywallEnabled]);
}