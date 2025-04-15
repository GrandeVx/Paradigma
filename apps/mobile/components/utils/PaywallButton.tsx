import { StyleSheet } from "react-native";
import {
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native-gesture-handler";
import { useSuperwall } from "../useSuperwall";
import { SUPERWALL_TRIGGERS } from "@/config/superwall";
import { ReactNode } from "react";

interface PaywallOpenerProps extends TouchableOpacityProps {
  children: ReactNode;
  trigger?: keyof typeof SUPERWALL_TRIGGERS;
}

export function PaywallOpener({
  children,
  trigger = "ONBOARDING",
  style,
  ...props
}: PaywallOpenerProps) {
  const { showPaywall } = useSuperwall();

  const handlePress = () => {
    showPaywall(SUPERWALL_TRIGGERS[trigger]);
  };

  return (
    <TouchableOpacity
      style={[styles.wrapper, style]}
      onPress={handlePress}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // Default styles can be overridden by passing style prop
  },
});
