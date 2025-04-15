import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Switch({ checked, onCheckedChange }: SwitchProps) {
  const toggleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(checked ? 20 : 0, {
          damping: 15,
          stiffness: 120,
        }),
      },
    ],
    backgroundColor: withTiming(checked ? "#704F38" : "#D1D5DB"),
  }));

  return (
    <Pressable onPress={() => onCheckedChange(!checked)} className="relative">
      <View className="w-12 h-6 rounded-full bg-gray-300" />
      <Animated.View
        style={[toggleStyle]}
        className="absolute top-1 left-1 w-4 h-4 rounded-full"
      />
    </Pressable>
  );
}
