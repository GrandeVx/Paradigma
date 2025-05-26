import * as React from "react";
import { IconProps } from "./icon";
import { Button, ButtonProps } from "./button";
import { IconName } from "./icons";
import * as Icons from "./icons";
import { View } from "react-native";

export interface IconButtonProps extends Omit<ButtonProps, "leftIcon" | "rightIcon"> {
  icon: IconName;
  iconProps?: Omit<IconProps, "name">;
  iconPosition?: "left" | "right";
}

export const IconButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  IconButtonProps
>(
  ({
    icon,
    iconProps = {},
    iconPosition = "left",
    size = "default",
    children,
    ...props
  }, ref) => {
    // Determine icon size based on button size
    const getIconSize = () => {
      switch (size) {
        case "sm":
          return 16;
        case "lg":
          return 24;
        case "icon":
          return 24;
        default:
          return 20;
      }
    };

    // Get the appropriate icon component
    const IconComponent = React.useMemo(() => {
      // Convert kebab-case to PascalCase and add 'Icon' suffix
      const pascalCase = icon
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
      const componentName = `${pascalCase}Icon`;

      // @ts-expect-error: We're accessing dynamically, but we know these components exist
      return Icons[componentName];
    }, [icon]);

    // Create the icon element with appropriate props
    const iconElement = (
      <View
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconComponent
          size={getIconSize()}
          color={"#FFFFFF"}
          {...iconProps}
        />
      </View>
    );

    return (
      <Button
        ref={ref}
        size={size}
        leftIcon={iconPosition === "left" ? iconElement : undefined}
        rightIcon={iconPosition === "right" ? iconElement : undefined}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton"; 