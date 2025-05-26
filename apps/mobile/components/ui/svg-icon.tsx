import * as React from "react";
import { View, ViewStyle } from "react-native";
import { IconName } from "./icons";
import * as SvgIcons from "./svg-icons";
import { IconSvgProps } from "./svg-icons/base-icon";

// Type for SVG icon components
export type SvgIconComponents = Record<string, React.ComponentType<IconSvgProps>>;

export interface SvgIconProps extends Omit<IconSvgProps, "size" | "color"> {
  name: IconName;
  size?: number;
  color?: string;
  containerStyle?: ViewStyle;
}

/**
 * Standalone component for rendering SVG icons
 */
export const SvgIcon = React.forwardRef<React.ElementRef<typeof View>, SvgIconProps>(
  ({ name, size = 24, color, containerStyle, ...props }, ref) => {
    // Convert icon name to component name (e.g., "bank-card" -> "BankCardIcon")
    const getSvgIconName = React.useCallback((iconName: string) => {
      return `${iconName.split('-').map((part, i) =>
        i === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part.charAt(0).toUpperCase() + part.slice(1)
      ).join('')}Icon`;
    }, []);

    // Find the SVG component
    const iconComponentName = getSvgIconName(name);
    const SvgIconComponent = (SvgIcons as SvgIconComponents)[iconComponentName];

    if (!SvgIconComponent) {
      console.warn(`SVG Icon not found: ${name}`);
      return null;
    }

    return (
      <View
        ref={ref}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...containerStyle,
        }}
      >
        <SvgIconComponent
          size={size}
          color={color}
          {...props}
        />
      </View>
    );
  }
);

SvgIcon.displayName = "SvgIcon"; 