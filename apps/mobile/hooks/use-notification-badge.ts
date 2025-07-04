import { useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * Hook that automatically clears the notification badge when the app becomes active
 * This ensures that the badge count is reset when users open the app
 */
export function useNotificationBadge() {
  // Moved API call to be optional and lazy-loaded
  const clearBadgeServerSide = useCallback(async () => {
    try {
      const { api } = await import('@/lib/api');
      const mutation = api.user.clearNotificationBadge.useMutation();
      
      mutation.mutate({}, {
        onSuccess: () => {
          console.log('🌐 Server badge cleared successfully');
        },
        onError: (error) => {
          console.error('❌ Error clearing server badge:', error);
        },
      });
    } catch (error) {
      console.error('❌ Error loading API client:', error);
    }
  }, []);

  useEffect(() => {
    // Small delay to ensure API client is initialized
    const timer = setTimeout(() => {
      clearBadge();
    }, 1000);

    // Set up AppState listener to clear badge when app becomes active
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Clear the badge when app becomes active (foreground)
        clearBadge();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup subscription on unmount
    return () => {
      clearTimeout(timer);
      subscription?.remove();
    };
  }, []);

  const clearBadge = async () => {
    try {
      // Set local badge count to 0 immediately
      await Notifications.setBadgeCountAsync(0);
      console.log('📱 Local notification badge cleared');

      // Optional: try to clear server-side badge (don't block if it fails)
      clearBadgeServerSide().catch(error => {
        console.log('⚠️ Server badge clear failed, continuing anyway:', error);
      });
    } catch (error) {
      console.error('❌ Error clearing local notification badge:', error);
    }
  };

  return { clearBadge };
}