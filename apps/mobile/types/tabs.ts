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