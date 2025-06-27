import { SharedValue } from 'react-native-reanimated';

export interface HomeTab {
  key: string;
  title: string;
}

export interface TabBarProps {
  tabs: HomeTab[];
  activeIndex: number;
  onTabPress: (tab: HomeTab, index: number) => void;
}

export interface TabIndicatorProps {
  activeTabIndex: SharedValue<number>;
  tabOffsets: SharedValue<number[]>;
  tabWidths: SharedValue<number[]>;
  tabBarOffsetX: SharedValue<number>;
}

// Function to get translated home tabs
export const getHomeTabs = (t: (key: string) => string): HomeTab[] => [
  {
    key: 'transactions',
    title: t('home.tabs.transactions')
  },
  {
    key: 'charts', 
    title: t('home.tabs.charts')
  },
  {
    key: 'goals',
    title: t('home.tabs.goals')
  }
];

// Keep the old export for backward compatibility but mark as deprecated
/** @deprecated Use getHomeTabs(t) instead */
export const HOME_TABS: HomeTab[] = [
  {
    key: 'transactions',
    title: 'Transazioni'
  },
  {
    key: 'charts', 
    title: 'Grafici'
  },
  {
    key: 'goals',
    title: 'Obiettivi'
  }
]; 