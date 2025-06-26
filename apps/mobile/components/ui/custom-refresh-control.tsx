import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import * as Haptics from 'expo-haptics';

interface CustomRefreshControlProps {
  refreshing: boolean;
  pullDistance?: number;
  refreshThreshold?: number;
}

export const CustomRefreshControl: React.FC<CustomRefreshControlProps> = ({
  refreshing,
  pullDistance = 0,
  refreshThreshold = 80,
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const loadingRotation = useSharedValue(0);

  // Handle pull-to-refresh states
  useEffect(() => {
    if (refreshing) {
      // Start loading animation
      scale.value = withSpring(1);
      opacity.value = withTiming(1);

      // Continuous rotation during loading
      loadingRotation.value = withSequence(
        withTiming(360, { duration: 1000 }),
        withTiming(720, { duration: 1000 }),
        withTiming(1080, { duration: 1000 })
      );

      // Haptic feedback for start refresh
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      // Reset animation
      scale.value = withSpring(0);
      opacity.value = withTiming(0);
      loadingRotation.value = 0;
    }
  }, [refreshing]);

  // Handle pull distance changes
  useEffect(() => {
    if (!refreshing) {
      const progress = Math.min(pullDistance / refreshThreshold, 1);

      // Scale and opacity based on pull distance
      scale.value = withSpring(progress * 0.8);
      opacity.value = withTiming(progress);

      // Rotation effect during pull
      rotation.value = withSpring(progress * 180);

      // Haptic feedback when reaching threshold
      if (pullDistance >= refreshThreshold && pullDistance < refreshThreshold + 5) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [pullDistance, refreshThreshold, refreshing]);

  const animatedStyle = useAnimatedStyle(() => {
    const currentRotation = refreshing ? loadingRotation.value : rotation.value;

    return {
      transform: [
        { scale: scale.value },
        { rotate: `${currentRotation}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    const height = refreshing ? 60 : interpolate(
      pullDistance,
      [0, refreshThreshold],
      [0, 60],
      Extrapolate.CLAMP
    );

    return {
      height,
      marginTop: refreshing ? 0 : -60,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const textOpacity = refreshing ? 1 : interpolate(
      pullDistance,
      [refreshThreshold * 0.5, refreshThreshold],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity: textOpacity,
    };
  });

  return (
    <Animated.View
      style={[containerStyle]}
      className="items-center justify-center bg-transparent"
    >
      <View className="items-center justify-center">
        {/* Loading Indicator */}
        <Animated.View
          style={[animatedStyle]}
          className="w-8 h-8 items-center justify-center"
        >
          <View className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full" />
        </Animated.View>

        {/* Status Text */}
        <Animated.View style={textStyle} className="mt-2">
          <Text className="text-xs text-gray-500 font-medium">
            {refreshing
              ? 'Aggiornamento...'
              : pullDistance >= refreshThreshold
                ? 'Rilascia per aggiornare'
                : 'Tira per aggiornare'
            }
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

// Enhanced RefreshControl Hook
export const useCustomRefreshControl = (onRefresh: () => void) => {
  const refreshing = useSharedValue(false);
  const pullDistance = useSharedValue(0);

  const handleRefresh = async () => {
    refreshing.value = true;

    try {
      await onRefresh();
    } finally {
      refreshing.value = false;
      pullDistance.value = 0;
    }
  };

  return {
    refreshing: refreshing.value,
    pullDistance: pullDistance.value,
    onRefresh: handleRefresh,
    setPullDistance: (distance: number) => {
      pullDistance.value = distance;
    },
  };
}; 