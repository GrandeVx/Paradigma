import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Animated } from 'react-native';

interface TabBarContextType {
  isTabBarVisible: boolean;
  hideTabBar: () => void;
  showTabBar: () => void;
  toggleTabBar: () => void;
  tabBarAnimation: Animated.Value;
}

const TabBarContext = createContext<TabBarContextType | undefined>(undefined);

interface TabBarProviderProps {
  children: ReactNode;
}

export const TabBarProvider: React.FC<TabBarProviderProps> = ({ children }) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const tabBarAnimation = React.useRef(new Animated.Value(1)).current;

  const hideTabBar = useCallback(() => {
    Animated.timing(tabBarAnimation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setIsTabBarVisible(false);
    });
  }, [tabBarAnimation]);

  const showTabBar = useCallback(() => {
    setIsTabBarVisible(true);
    Animated.timing(tabBarAnimation, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [tabBarAnimation]);

  const toggleTabBar = useCallback(() => {
    if (isTabBarVisible) {
      hideTabBar();
    } else {
      showTabBar();
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