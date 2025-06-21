import { View } from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { TabIndicatorProps } from '@/types/tabs';

export const TabIndicator: React.FC<TabIndicatorProps> = ({
  activeTabIndex,
  tabOffsets,
  tabWidths,
  tabBarOffsetX,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const left = interpolate(
      activeTabIndex.value,
      Object.keys(tabOffsets.value).map(Number),
      tabOffsets.value
    );

    const width = interpolate(
      activeTabIndex.value,
      Object.keys(tabWidths.value).map(Number),
      tabWidths.value
    );

    return {
      left,
      width,
      transform: [
        {
          translateX: -tabBarOffsetX.value,
        },
      ],
    };
  });

  return (
    <View className="absolute bottom-0 left-0 h-[2.5px] bg-primary-500">
      <Animated.View
        className="h-full w-full bg-primary-500 rounded-full"
        style={animatedStyle}
      />
    </View>
  );
}; 