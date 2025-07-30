import React, { useRef, useEffect, useCallback } from 'react';
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
  cancelAnimation,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCurrency } from '@/hooks/use-currency';
import { useLocalizedSubCategory } from '@/hooks/useLocalizedCategories';

const ACTION_WIDTH = 80;
const SWIPE_THRESHOLD = 50; // Threshold to show delete background
const FULL_SWIPE_THRESHOLD = 200; // Threshold to trigger delete confirmation
// Minimized thresholds to reduce scroll conflict to minimum
const HORIZONTAL_ACTIVE_OFFSET = 3; // activeOffsetX - very small for minimal interference
const VERTICAL_FAIL_OFFSET = 2; // failOffsetY - very small to fail immediately on vertical gestures
// Legacy thresholds for gesture logic (if needed)
const HORIZONTAL_THRESHOLD = 10;
const VERTICAL_THRESHOLD = 15;

// Global state to manage active swipe instances - prevents multiple simultaneous swipes
let activeSwipeInstance: string | null = null;
const activeSwipeCallbacks = new Map<string, () => void>();

// Debug flag - set to true for gesture debugging
const DEBUG_GESTURES = __DEV__ && false;

// Global function to reset all other active swipes
const resetOtherSwipes = (currentId: string) => {
  if (DEBUG_GESTURES) {
    console.log(`[SwipeGesture] Resetting other swipes, activating: ${currentId}`);
  }

  activeSwipeCallbacks.forEach((resetCallback, id) => {
    if (id !== currentId) {
      if (DEBUG_GESTURES) {
        console.log(`[SwipeGesture] Resetting swipe: ${id}`);
      }
      resetCallback();
    }
  });
  activeSwipeInstance = currentId;
};

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

const SwipeableTransactionItemComponent: React.FC<SwipeableTransactionItemProps> = ({
  transaction,
  onDelete,
  context = 'home',
}) => {
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const panRef = useRef<PanGestureHandler>(null);

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const actionsOpacity = useSharedValue(0);

  // Reset function to close this swipe instance
  const resetSwipe = useCallback(() => {
    'worklet';
    cancelAnimation(translateX);
    cancelAnimation(actionsOpacity);
    translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
    actionsOpacity.value = withTiming(0, { duration: 200 });
  }, [translateX, actionsOpacity]);

  // Register/unregister this instance for global coordination
  useEffect(() => {
    const instanceId = transaction.id;
    activeSwipeCallbacks.set(instanceId, resetSwipe);

    if (DEBUG_GESTURES) {
      console.log(`[SwipeGesture] Registered instance: ${instanceId}`);
    }

    return () => {
      activeSwipeCallbacks.delete(instanceId);
      if (activeSwipeInstance === instanceId) {
        activeSwipeInstance = null;
      }

      if (DEBUG_GESTURES) {
        console.log(`[SwipeGesture] Unregistered instance: ${instanceId}`);
      }
    };
  }, [transaction.id, resetSwipe]);

  // Force reset when transaction ID changes (FlashList recycling)
  useEffect(() => {
    resetSwipe();
  }, [transaction.id, resetSwipe]);

  // Cleanup animations to prevent memory leaks - PERFORMANCE OPTIMIZATION
  useEffect(() => {
    return () => {
      cancelAnimation(translateX);
      cancelAnimation(opacity);
      cancelAnimation(scale);
      cancelAnimation(actionsOpacity);
      translateX.value = 0;
      opacity.value = 1;
      scale.value = 1;
      actionsOpacity.value = 0;
    };
  }, []);

  const isIncome = transaction.type === 'income';
  const categoryColor = transaction.category?.color || '#6B7280';
  const categoryEmoji = transaction.subCategory?.icon || '💰';

  // Get localized subcategory name
  const localizedSubCategory = useLocalizedSubCategory(transaction.subCategory);

  const handleEdit = () => {
    // Navigate to edit based on context
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
      instanceId: string;
    }
  >({
    onStart: (_, context) => {
      context.startX = translateX.value;
      context.instanceId = transaction.id;

      // Reset other swipes immediately when this gesture starts
      // The native activeOffsetX/failOffsetY handles direction detection
      if (activeSwipeInstance !== context.instanceId) {
        runOnJS(resetOtherSwipes)(context.instanceId);
      }
    },
    onActive: (event, context) => {
      // Simplified logic - native gesture handler already confirmed this is horizontal
      const newTranslateX = context.startX + event.translationX;

      // Only allow swipe to the left (negative values)
      if (newTranslateX <= 0) {
        translateX.value = newTranslateX;

        // Progressive opacity based on swipe distance
        const absTranslateX = Math.abs(newTranslateX);

        if (absTranslateX < SWIPE_THRESHOLD) {
          actionsOpacity.value = 0;
        } else if (absTranslateX < FULL_SWIPE_THRESHOLD) {
          const progress = (absTranslateX - SWIPE_THRESHOLD) / (FULL_SWIPE_THRESHOLD - SWIPE_THRESHOLD);
          actionsOpacity.value = interpolate(
            progress,
            [0, 1],
            [0.3, 1],
            Extrapolate.CLAMP
          );
        } else {
          actionsOpacity.value = 1;
        }

        // Haptic feedback at different thresholds
        if (absTranslateX > SWIPE_THRESHOLD && Math.abs(context.startX) <= SWIPE_THRESHOLD) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        }

        if (absTranslateX > FULL_SWIPE_THRESHOLD && Math.abs(context.startX) <= FULL_SWIPE_THRESHOLD) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    },
    onEnd: (_, context) => {
      // Native gesture handler ensures we only get here for confirmed horizontal gestures
      const currentTranslateX = Math.abs(translateX.value);

      if (currentTranslateX >= FULL_SWIPE_THRESHOLD) {
        // Full swipe detected - trigger delete confirmation
        translateX.value = withSpring(0);
        actionsOpacity.value = withTiming(0);
        runOnJS(handleDelete)();
      } else {
        // Always snap back to closed position if not fully swiped
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
        actionsOpacity.value = withTiming(0, { duration: 200 });
      }

      // Clear active instance when gesture ends
      if (activeSwipeInstance === context.instanceId) {
        activeSwipeInstance = null;
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
    width: Math.abs(translateX.value),
  }));

  const deleteIconScale = useAnimatedStyle(() => {
    const progress = Math.abs(translateX.value) / FULL_SWIPE_THRESHOLD;
    return {
      transform: [{
        scale: interpolate(
          progress,
          [0, 0.5, 1],
          [0.8, 1, 1.2],
          Extrapolate.CLAMP
        )
      }],
    };
  });

  return (
    <View className="relative">
      {/* Delete Action Background */}
      <Animated.View
        style={[actionsStyle]}
        className="absolute right-0 top-0 bottom-0 bg-red-500 flex items-center justify-center"
      >
        <Animated.View style={[deleteIconScale]} className="items-center">
          <SvgIcon name="delete" color="white" size={24} />
          <Text className="text-white text-xs mt-1 font-medium">Elimina</Text>
        </Animated.View>
      </Animated.View>

      {/* Transaction Item */}
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={gestureHandler}
        activeOffsetX={[-HORIZONTAL_ACTIVE_OFFSET, HORIZONTAL_ACTIVE_OFFSET]}
        failOffsetY={[-VERTICAL_FAIL_OFFSET, VERTICAL_FAIL_OFFSET]}
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
                {
                  transaction.description && (
                    <Text className="text-sm text-gray-900 font-medium" style={{ fontFamily: 'DM Sans', fontSize: 14 }}>
                      {transaction.description}
                    </Text>
                  )
                }
                {localizedSubCategory && (
                  <Text className="text-xs text-gray-500" style={{ fontFamily: 'DM Sans', fontSize: 12 }}>
                    {localizedSubCategory.localizedName}
                  </Text>
                )}
              </View>
            </View>

            <Text
              className={`text-right font-medium ${isIncome ? 'text-green-600' : 'text-gray-500'
                }`}
              style={{ fontFamily: 'ApfelGrotezk', fontSize: 16 }}
            >
              {formatCurrency(transaction.amount, { showSign: isIncome })}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

// Custom comparison function for React.memo to prevent unnecessary re-renders
const arePropsEqual = (prevProps: SwipeableTransactionItemProps, nextProps: SwipeableTransactionItemProps) => {
  // Compare transaction data
  if (prevProps.transaction.id !== nextProps.transaction.id) return false;
  if (prevProps.transaction.amount !== nextProps.transaction.amount) return false;
  if (prevProps.transaction.description !== nextProps.transaction.description) return false;
  if (prevProps.transaction.type !== nextProps.transaction.type) return false;

  // Compare context
  if (prevProps.context !== nextProps.context) return false;

  // Compare category data (shallow comparison)
  const prevCategory = prevProps.transaction.category;
  const nextCategory = nextProps.transaction.category;
  if (prevCategory?.name !== nextCategory?.name ||
    prevCategory?.icon !== nextCategory?.icon ||
    prevCategory?.color !== nextCategory?.color) return false;

  // Compare subcategory data
  const prevSubCategory = prevProps.transaction.subCategory;
  const nextSubCategory = nextProps.transaction.subCategory;
  if (prevSubCategory?.name !== nextSubCategory?.name ||
    prevSubCategory?.icon !== nextSubCategory?.icon) return false;

  // Don't compare onDelete function reference - it may change but functionality remains the same
  return true;
};

export const SwipeableTransactionItem = React.memo(SwipeableTransactionItemComponent, arePropsEqual);