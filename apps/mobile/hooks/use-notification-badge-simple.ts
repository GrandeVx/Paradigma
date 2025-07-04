import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * Simplified hook that only clears the local notification badge
 * This ensures that the badge count is reset when users open the app
 * without depending on API initialization
 */
export function useNotificationBadgeSimple() {
  useEffect(() => {
    // Clear badge immediately when the hook mounts (app starts)
    clearLocalBadge();

    // Set up AppState listener to clear badge when app becomes active
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Clear the badge when app becomes active (foreground)
        clearLocalBadge();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup subscription on unmount
    return () => {
      subscription?.remove();
    };
  }, []);

  const clearLocalBadge = async () => {
    try {
      // Set local badge count to 0 immediately
      await Notifications.setBadgeCountAsync(0);
      console.log('📱 Local notification badge cleared');
    } catch (error) {
      console.error('❌ Error clearing local notification badge:', error);
    }
  };

  return { clearLocalBadge };
}