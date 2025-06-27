import React from 'react';
import { View, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E5E5EA',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
            borderRadius,
            backgroundColor: '#E5E5EA',
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

// Predefined skeleton components for common use cases
export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[{ padding: 16, backgroundColor: 'white', borderRadius: 12 }, style]}>
    <Skeleton height={24} width="60%" style={{ marginBottom: 12 }} />
    <Skeleton height={16} width="100%" style={{ marginBottom: 8 }} />
    <Skeleton height={16} width="80%" />
  </View>
);

export const SkeletonTransaction: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center', padding: 16 }, style]}>
    <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
    <View style={{ flex: 1 }}>
      <Skeleton height={16} width="70%" style={{ marginBottom: 6 }} />
      <Skeleton height={14} width="40%" />
    </View>
    <Skeleton height={16} width={60} />
  </View>
);

export const SkeletonBudgetItem: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[{ padding: 16, backgroundColor: 'white', borderRadius: 12, marginBottom: 12 }, style]}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Skeleton width={24} height={24} borderRadius={12} style={{ marginRight: 8 }} />
        <Skeleton height={16} width={100} />
      </View>
      <Skeleton height={16} width={60} />
    </View>
    <Skeleton height={6} width="100%" borderRadius={3} style={{ marginBottom: 8 }} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Skeleton height={14} width={80} />
      <Skeleton height={14} width={80} />
    </View>
  </View>
);

// Skeleton for tab content
export const SkeletonTabContent: React.FC<{ type: 'home' | 'budgets' | 'accounts' | 'profile' }> = ({ type }) => {
  switch (type) {
    case 'home':
      return (
        <View style={{ padding: 16 }}>
          <SkeletonCard style={{ marginBottom: 16 }} />
          <SkeletonTransaction />
          <SkeletonTransaction />
          <SkeletonTransaction />
        </View>
      );

    case 'budgets':
      return (
        <View style={{ padding: 16 }}>
          <SkeletonBudgetItem />
          <SkeletonBudgetItem />
          <SkeletonBudgetItem />
        </View>
      );

    case 'accounts':
      return (
        <View style={{ padding: 16 }}>
          <SkeletonCard style={{ marginBottom: 16 }} />
          <SkeletonCard style={{ marginBottom: 16 }} />
          <SkeletonCard />
        </View>
      );

    case 'profile':
      return (
        <View style={{ padding: 16 }}>
          <Skeleton height={80} width={80} borderRadius={40} style={{ alignSelf: 'center', marginBottom: 16 }} />
          <Skeleton height={20} width="60%" style={{ alignSelf: 'center', marginBottom: 24 }} />
          <SkeletonCard />
        </View>
      );

    default:
      return <SkeletonCard />;
  }
}; 