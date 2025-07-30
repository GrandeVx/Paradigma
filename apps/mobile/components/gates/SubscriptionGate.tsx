import React, { ReactNode } from 'react';
import { View, Alert } from 'react-native';
import { useSubscriptionFeatures } from '@/hooks/useFeatureFlags';
import { useSuperwall } from '@/components/useSuperwall';
import { useSupabase } from '@/context/supabase-provider';
import { SUPERWALL_TRIGGERS } from '@/config/superwall';

interface SubscriptionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  triggerPaywall?: boolean;
  requiredFeature?: string;
}

/**
 * SubscriptionGate component that conditionally renders children based on subscription status
 * 
 * @param children - Content to show if user has access
 * @param fallback - Optional fallback content for non-premium users
 * @param triggerPaywall - Whether to automatically show paywall if user doesn't have access
 * @param requiredFeature - Name of the feature being protected (for analytics)
 */
export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  children,
  fallback = null,
  triggerPaywall = false,
  requiredFeature = 'premium_feature'
}) => {
  const { shouldRequireSubscription, isBetaMode } = useSubscriptionFeatures();
  const { isSubscribed, isLoading, showPaywall } = useSuperwall();
  const { user } = useSupabase();

  // During beta mode, always allow access regardless of subscription status
  if (isBetaMode || !shouldRequireSubscription) {
    if (__DEV__) {
      console.log(`[SubscriptionGate] Beta mode active - allowing access to ${requiredFeature}`);
    }
    return <>{children}</>;
  }

  // Still loading subscription status
  if (isLoading) {
    return <View>{/* Could add a loading spinner here */}</View>;
  }

  // User is not logged in - this should be handled by auth flow
  if (!user) {
    if (__DEV__) {
      console.log('[SubscriptionGate] No user found - redirecting to auth');
    }
    return <>{fallback}</>;
  }

  // User is subscribed - allow access
  if (isSubscribed) {
    if (__DEV__) {
      console.log(`[SubscriptionGate] User is subscribed - allowing access to ${requiredFeature}`);
    }
    return <>{children}</>;
  }

  // User is not subscribed - handle paywall
  if (__DEV__) {
    console.log(`[SubscriptionGate] User not subscribed - blocking access to ${requiredFeature}`);
  }

  if (triggerPaywall) {
    // Auto-trigger paywall
    React.useEffect(() => {
      const showPaywallForFeature = () => {
        Alert.alert(
          'Premium Feature',
          `This feature requires a premium subscription. Would you like to upgrade?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Upgrade',
              onPress: () => showPaywall(SUPERWALL_TRIGGERS.FEATURE_UNLOCK),
            },
          ]
        );
      };

      showPaywallForFeature();
    }, []);
  }

  return <>{fallback}</>;
};

/**
 * Hook to check if a specific feature should be available to the current user
 */
export const useFeatureAccess = (featureName: string = 'premium_feature') => {
  const { shouldRequireSubscription, isBetaMode } = useSubscriptionFeatures();
  const { isSubscribed, isLoading } = useSuperwall();
  const { user } = useSupabase();

  const hasAccess = React.useMemo(() => {
    // Beta mode - always allow
    if (isBetaMode || !shouldRequireSubscription) {
      return true;
    }

    // No user - no access
    if (!user) {
      return false;
    }

    // Subscribed user - has access
    return isSubscribed;
  }, [isBetaMode, shouldRequireSubscription, user, isSubscribed]);

  const showPaywallForFeature = React.useCallback(() => {
    const { showPaywall } = useSuperwall();
    Alert.alert(
      'Premium Feature',
      `${featureName} requires a premium subscription.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Upgrade',
          onPress: () => showPaywall(SUPERWALL_TRIGGERS.FEATURE_UNLOCK),
        },
      ]
    );
  }, [featureName]);

  return {
    hasAccess,
    isLoading,
    showPaywallForFeature,
    isBetaMode,
    isSubscribed
  };
};