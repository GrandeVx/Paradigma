import React, { createContext, useState, useContext, ReactNode, useCallback, useRef } from 'react';
import { Animated } from 'react-native';

interface TabBarContextType {
  isTabBarVisible: boolean;
  hideTabBar: (source?: string) => void;
  showTabBar: (source?: string) => void;
  toggleTabBar: () => void;
  tabBarAnimation: Animated.Value;
  pushHideRequest: (source: string) => void;
  popHideRequest: (source: string) => void;
}

const TabBarContext = createContext<TabBarContextType | undefined>(undefined);

interface TabBarProviderProps {
  children: ReactNode;
}

export const TabBarProvider: React.FC<TabBarProviderProps> = ({ children }) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const tabBarAnimation = React.useRef(new Animated.Value(1)).current;
  
  // Stack to keep track of hide requests
  const hideRequestsStack = useRef<string[]>([]);

  const updateTabBarVisibility = useCallback((shouldBeVisible: boolean) => {
    if (shouldBeVisible === isTabBarVisible) return;

    if (shouldBeVisible) {
      setIsTabBarVisible(true);
      Animated.timing(tabBarAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(tabBarAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setIsTabBarVisible(false);
      });
    }
  }, [isTabBarVisible, tabBarAnimation]);

  const pushHideRequest = useCallback((source: string) => {
    if (!hideRequestsStack.current.includes(source)) {
      hideRequestsStack.current.push(source);
      updateTabBarVisibility(false);
    }
  }, [updateTabBarVisibility]);

  const popHideRequest = useCallback((source: string) => {
    const index = hideRequestsStack.current.indexOf(source);
    if (index > -1) {
      hideRequestsStack.current.splice(index, 1);
    }
    
    // Only show tab bar if no hide requests remain
    if (hideRequestsStack.current.length === 0) {
      updateTabBarVisibility(true);
    }
  }, [updateTabBarVisibility]);

  const hideTabBar = useCallback((source = 'unknown') => {
    pushHideRequest(source);
  }, [pushHideRequest]);

  const showTabBar = useCallback((source = 'unknown') => {
    popHideRequest(source);
  }, [popHideRequest]);

  const toggleTabBar = useCallback(() => {
    if (isTabBarVisible) {
      hideTabBar('manual-toggle');
    } else {
      showTabBar('manual-toggle');
    }
  }, [isTabBarVisible, hideTabBar, showTabBar]);

  return (
    <TabBarContext.Provider
      value={{
        isTabBarVisible,
        hideTabBar,
        showTabBar,
        toggleTabBar,
        tabBarAnimation,
        pushHideRequest,
        popHideRequest,
      }}
    >
      {children}
    </TabBarContext.Provider>
  );
};

export const useTabBar = (): TabBarContextType => {
  const context = useContext(TabBarContext);
  if (context === undefined) {
    throw new Error('useTabBar must be used within a TabBarProvider');
  }
  return context;
};

// Hook per gestire automaticamente la visibilità della tab bar per un componente
export const useHideTabBar = (source: string, shouldHide = true) => {
  const { pushHideRequest, popHideRequest } = useTabBar();

  React.useEffect(() => {
    if (shouldHide) {
      pushHideRequest(source);
      return () => {
        popHideRequest(source);
      };
    }
  }, [source, shouldHide, pushHideRequest, popHideRequest]);
}; 