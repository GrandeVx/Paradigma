import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

interface UseMeasureTabLayoutProps {
  tabsLength: number;
  sidePadding?: number;
  gap?: number;
}

export const useMeasureTabLayout = ({
  tabsLength,
  sidePadding = 16,
  gap = 24,
}: UseMeasureTabLayoutProps) => {
  const tabWidths = useSharedValue<number[]>(new Array(tabsLength).fill(0));

  const tabOffsets = useDerivedValue(() => {
    return tabWidths.value.reduce<number[]>((acc, _width, index) => {
      const previousX = index === 0 ? sidePadding : acc[index - 1];
      const previousWidth = index === 0 ? 0 : tabWidths.value[index - 1];
      acc[index] = previousX + previousWidth + (index === 0 ? 0 : gap);
      return acc;
    }, []);
  });

  return {
    tabWidths,
    tabOffsets,
  };
}; 