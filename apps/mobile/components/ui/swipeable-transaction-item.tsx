import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import { useRouter } from 'expo-router';
import { useTabBar } from '@/context/TabBarContext';
import * as Haptics from 'expo-haptics';
import { useCurrency } from '@/hooks/use-currency';

const ACTION_WIDTH = 75;
const SWIPE_THRESHOLD = 60;
// New thresholds for better gesture detection
const HORIZONTAL_THRESHOLD = 15; // Minimum horizontal movement before capturing gesture
const VERTICAL_THRESHOLD = 30; // Maximum vertical movement to allow horizontal gesture

interface SwipeableTransactionItemProps {
  transaction: {
    id: string;
    amount: number;
    description: string;
    type: 'income' | 'expense';
    category?: {
      name: string;
      icon: string;
      color: string;
    };
    subCategory?: {
      name: string;
      icon: string;

    };
  };
  onDelete?: (id: string) => void;
  context?: 'home' | 'accounts' | 'budgets';
}

export const SwipeableTransactionItem: React.FC<SwipeableTransactionItemProps> = React.memo(({
  transaction,
  onDelete,
  context = 'home',
}) => {
  const router = useRouter();
  const { hideTabBar } = useTabBar();
  const { formatCurrency } = useCurrency();
  const panRef = useRef<PanGestureHandler>(null);

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const actionsOpacity = useSharedValue(0);

  // Cleanup animations to prevent memory leaks - PERFORMANCE OPTIMIZATION
  useEffect(() => {
    return () => {
      translateX.value = 0;
      opacity.value = 1;
      scale.value = 1;
      actionsOpacity.value = 0;
    };
  }, []);

  const isIncome = transaction.type === 'income';
  const categoryColor = transaction.category?.color || '#6B7280';
  const categoryEmoji = transaction.subCategory?.icon || '💰';

  const handleEdit = () => {
    // Reset position first
    translateX.value = withSpring(0);
    actionsOpacity.value = withTiming(0);

    // Navigate to edit based on context
    hideTabBar();
    const basePath = context === 'accounts' ? '/(protected)/(accounts)' : 
                     context === 'budgets' ? '/(protected)/(budgets)' : 
                     '/(protected)/(home)';
    router.push(`${basePath}/transaction-edit/${transaction.id}`);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Elimina Transazione',
      'Sei sicuro di voler eliminare questa transazione?',
      [
        {
          text: 'Annulla',
          style: 'cancel',
          onPress: () => {
            // Reset position
            translateX.value = withSpring(0);
            actionsOpacity.value = withTiming(0);
          },
        },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            // Animate out then call delete
            opacity.value = withTiming(0, { duration: 300 });
            scale.value = withTiming(0.8, { duration: 300 }, () => {
              if (onDelete) {
                runOnJS(onDelete)(transaction.id);
              }
            });
          },
        },
      ]
    );
  };

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    {
      startX: number;
      gestureStarted: boolean;
      isHorizontalGesture: boolean;
    }
  >({
    onStart: (_, context) => {
      context.startX = translateX.value;
      context.gestureStarted = false;
      context.isHorizontalGesture = false;
    },
    onActive: (event, context) => {
      // Only start processing after determining gesture direction
      if (!context.gestureStarted) {
        const absX = Math.abs(event.translationX);
        const absY = Math.abs(event.translationY);

        // Wait for sufficient movement to determine direction
        if (absX > HORIZONTAL_THRESHOLD || absY > VERTICAL_THRESHOLD) {
          context.gestureStarted = true;

          // Determine if this is primarily a horizontal gesture
          context.isHorizontalGesture = absX > absY && absX > HORIZONTAL_THRESHOLD;

          // If it's not a horizontal gesture, don't process further
          if (!context.isHorizontalGesture) {
            return;
          }
        } else {
          // Not enough movement yet, wait
          return;
        }
      }

      // Only process if this was determined to be a horizontal gesture
      if (!context.isHorizontalGesture) {
        return;
      }

      const newTranslateX = context.startX + event.translationX;

      // Only allow swipe to the left (negative values)
      if (newTranslateX <= 0) {
        translateX.value = newTranslateX;

        // Show actions when swiped enough
        const progress = Math.abs(newTranslateX) / (ACTION_WIDTH * 2);
        actionsOpacity.value = interpolate(
          progress,
          [0, 0.5, 1],
          [0, 0.7, 1],
          Extrapolate.CLAMP
        );

        // Haptic feedback when reaching threshold
        if (Math.abs(newTranslateX) > SWIPE_THRESHOLD && Math.abs(context.startX) <= SWIPE_THRESHOLD) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    },
    onEnd: (_, context) => {
      // Only snap if this was a horizontal gesture
      if (!context.isHorizontalGesture) {
        return;
      }

      const shouldSnap = Math.abs(translateX.value) > SWIPE_THRESHOLD;

      if (shouldSnap) {
        // Snap to show actions
        translateX.value = withSpring(-ACTION_WIDTH * 2);
        actionsOpacity.value = withTiming(1);
      } else {
        // Snap back to closed position
        translateX.value = withSpring(0);
        actionsOpacity.value = withTiming(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const actionsStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
  }));

  return (
    <View className="relative">
      {/* Action Buttons Background */}
      <Animated.View
        style={[actionsStyle]}
        className="absolute right-0 top-0 bottom-0 flex-row"
      >
        {/* Edit Button */}
        <TouchableOpacity
          onPress={handleEdit}
          className="w-[75px] bg-blue-500 items-center justify-center"
          activeOpacity={0.7}
        >
          <SvgIcon name="edit" color="white" size={20} />
          <Text className="text-white text-xs mt-1 font-medium">Edit</Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          onPress={handleDelete}
          className="w-[75px] bg-red-500 items-center justify-center"
          activeOpacity={0.7}
        >
          <SvgIcon name="delete" color="white" size={20} />
          <Text className="text-white text-xs mt-1 font-medium">Delete</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Transaction Item */}
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={gestureHandler}
        activeOffsetX={[-HORIZONTAL_THRESHOLD, HORIZONTAL_THRESHOLD]}
        failOffsetY={[-VERTICAL_THRESHOLD, VERTICAL_THRESHOLD]}
        shouldCancelWhenOutside={true}
      >
        <Animated.View style={animatedStyle} className="bg-white">
          <TouchableOpacity
            onPress={handleEdit}
            className="flex-row items-center py-3 px-0"
            activeOpacity={0.6}
          >
            <View className="flex-row items-center flex-1">
              <View
                className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: categoryColor }}
              >
                <Text className="text-base" style={{ fontFamily: 'DM Sans', fontSize: 16 }}>
                  {categoryEmoji}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="text-sm text-gray-900 font-medium" style={{ fontFamily: 'DM Sans', fontSize: 14 }}>
                  {transaction.description}
                </Text>
                {transaction.subCategory && (
                  <Text className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: 'DM Sans', fontSize: 12 }}>
                    {transaction.subCategory.name}
                  </Text>
                )}
              </View>
            </View>

            <Text
              className={`text-right font-medium ${isIncome ? 'text-green-600' : 'text-gray-500'
                }`}
              style={{ fontFamily: 'Apfel Grotezk', fontSize: 16 }}
            >
              {formatCurrency(transaction.amount, { showSign: isIncome })}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}); 