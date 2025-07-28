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
import * as Haptics from 'expo-haptics';
import { useCurrency } from '@/hooks/use-currency';
import { useLocalizedSubCategory } from '@/hooks/useLocalizedCategories';

const ACTION_WIDTH = 80;
const SWIPE_THRESHOLD = 50; // Threshold to show delete background
const FULL_SWIPE_THRESHOLD = 200; // Threshold to trigger delete confirmation
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

        // Progressive opacity based on swipe distance
        const absTranslateX = Math.abs(newTranslateX);
        
        if (absTranslateX < SWIPE_THRESHOLD) {
          // Before threshold - no background
          actionsOpacity.value = 0;
        } else if (absTranslateX < FULL_SWIPE_THRESHOLD) {
          // Between thresholds - progressive opacity
          const progress = (absTranslateX - SWIPE_THRESHOLD) / (FULL_SWIPE_THRESHOLD - SWIPE_THRESHOLD);
          actionsOpacity.value = interpolate(
            progress,
            [0, 1],
            [0.3, 1],
            Extrapolate.CLAMP
          );
        } else {
          // Beyond full swipe - full opacity
          actionsOpacity.value = 1;
        }

        // Haptic feedback at different thresholds
        if (Math.abs(newTranslateX) > SWIPE_THRESHOLD && Math.abs(context.startX) <= SWIPE_THRESHOLD) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        }
        
        // Stronger feedback when reaching full swipe
        if (Math.abs(newTranslateX) > FULL_SWIPE_THRESHOLD && Math.abs(context.startX) <= FULL_SWIPE_THRESHOLD) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    },
    onEnd: (_, context) => {
      // Only process if this was a horizontal gesture
      if (!context.isHorizontalGesture) {
        return;
      }

      const currentTranslateX = Math.abs(translateX.value);

      if (currentTranslateX >= FULL_SWIPE_THRESHOLD) {
        // Full swipe detected - trigger delete confirmation
        translateX.value = withSpring(0);
        actionsOpacity.value = withTiming(0);
        runOnJS(handleDelete)();
      } else {
        // Always snap back to closed position if not fully swiped
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
                {localizedSubCategory && (
                  <Text className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: 'DM Sans', fontSize: 12 }}>
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
}); 