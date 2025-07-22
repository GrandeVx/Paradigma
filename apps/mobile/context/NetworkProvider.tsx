import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import * as Network from 'expo-network';
import { AppState } from 'react-native';

export interface NetworkState {
  isConnected: boolean;
  isLoading: boolean;
  connectionType: string | null;
  isReconnecting: boolean;
  hasInitialConnection: boolean;
}

interface NetworkContextType extends NetworkState {
  checkConnection: () => Promise<void>;
  forceRetry: () => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: false,
    isLoading: true,
    connectionType: null,
    isReconnecting: false,
    hasInitialConnection: false,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 5;

  const checkConnection = async (): Promise<void> => {
    try {
      const networkStateInfo = await Network.getNetworkStateAsync();
      const isConnected = networkStateInfo.isConnected === true && networkStateInfo.isInternetReachable === true;
      
      setNetworkState(prev => ({
        ...prev,
        isConnected,
        connectionType: networkStateInfo.type || null,
        isLoading: false,
        hasInitialConnection: prev.hasInitialConnection || isConnected,
        isReconnecting: false,
      }));

      // Reset retry count on successful connection
      if (isConnected) {
        retryCountRef.current = 0;
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      }

    } catch (error) {
      console.error('Network check failed:', error);
      setNetworkState(prev => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        isReconnecting: false,
      }));
    }
  };

  const scheduleRetry = () => {
    if (retryCountRef.current >= maxRetries) {
      console.log('Max retries reached, switching to periodic checks');
      // Switch to slower periodic checks after max retries
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      checkIntervalRef.current = setInterval(checkConnection, 30000); // Check every 30 seconds
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000); // Exponential backoff, max 10s
    
    setNetworkState(prev => ({
      ...prev,
      isReconnecting: true,
    }));

    retryTimeoutRef.current = setTimeout(() => {
      retryCountRef.current++;
      checkConnection().then(() => {
        // Schedule next retry if still not connected
        if (!networkState.isConnected && retryCountRef.current < maxRetries) {
          scheduleRetry();
        }
      });
    }, delay);
  };

  const forceRetry = () => {
    // Clear existing timeouts/intervals
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    
    // Reset retry count and start fresh
    retryCountRef.current = 0;
    setNetworkState(prev => ({
      ...prev,
      isLoading: true,
    }));
    
    checkConnection();
  };

  // Initial connection check
  useEffect(() => {
    checkConnection();
  }, []);

  // Set up network state listener
  useEffect(() => {
    const subscription = Network.addNetworkStateListener((networkState) => {
      if (networkState.isConnected === false || networkState.isInternetReachable === false) {
        setNetworkState(prev => ({
          ...prev,
          isConnected: false,
          connectionType: networkState.type || null,
        }));
        
        // Start retry process after a brief delay
        setTimeout(() => {
          if (!networkState.isConnected) {
            scheduleRetry();
          }
        }, 2000);
      } else if (networkState.isConnected === true && networkState.isInternetReachable === true) {
        // Verify connection with a manual check
        checkConnection();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Check connection when app becomes active
        checkConnection();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription?.remove();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  const contextValue: NetworkContextType = {
    ...networkState,
    checkConnection,
    forceRetry,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkState = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetworkState must be used within a NetworkProvider');
  }
  return context;
};

// Hook per componenti che necessitano di connessione
export const useRequireConnection = () => {
  const { isConnected, isLoading, forceRetry } = useNetworkState();
  
  return {
    isOnline: isConnected && !isLoading,
    isOffline: !isConnected && !isLoading,
    isCheckingConnection: isLoading,
    retry: forceRetry,
  };
};