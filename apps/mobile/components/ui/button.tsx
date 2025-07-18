import { cva } from "class-variance-authority";
import * as React from "react";
import { Pressable, PressableProps, View } from "react-native";

import { TextClassContext } from "./text";
import { IconName } from "./icons";
import { SvgIcon, SvgIconProps } from "./svg-icon";
import LottieView from 'lottie-react-native';

import { cn } from "@/lib/utils";
import { useRef } from "react";

const buttonVariants = cva(
  "group flex items-center justify-center web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        // Level variants
        primary: "bg-primary-700 web:hover:opacity-90 active:bg-primary-800",
        secondary: "border border-primary-700 bg-transparent web:hover:opacity-90 active:border-primary-800 group",
        tertiary: "bg-transparent web:hover:opacity-90 group",

        // Legacy variants for compatibility
        default: "bg-primary web:hover:opacity-90 active:bg-primary-active",
        destructive: "bg-destructive web:hover:opacity-90 active:opacity-90",
        outline:
          "border border-input bg-background web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent",
        ghost:
          "web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent",
        link: "web:underline-offset-4 web:hover:underline web:focus:underline",
      },
      size: {
        default: "h-12 px-4 py-2 native:h-[48px] native:px-3",
        sm: "h-9 px-3 native:h-[40px] native:px-3",
        lg: "h-11 px-8 native:h-14",
        icon: "h-10 w-10 native:h-12 native:w-12",
      },
      rounded: {
        default: "rounded-xl", // 12px
        sm: "rounded-lg", // 8px
        full: "rounded-full",
      },
      state: {
        default: "",
        active: "",
        disabled: "opacity-50 web:pointer-events-none",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      rounded: "default",
      state: "default",
    },
  }
);

const buttonTextVariants = cva(
  "web:whitespace-nowrap font-semibold web:transition-colors",
  {
    variants: {
      variant: {
        // Level variants
        primary: "text-white ",
        secondary: "text-primary-700 group-active:text-primary-800",
        tertiary: "text-primary-700 group-active:text-primary-800",

        // Legacy variants for compatibility
        default: "text-primary-foreground",
        destructive: "text-destructive-foreground",
        outline: "text-primary group-active:text-accent-foreground",
        ghost: "text-primary group-active:text-accent-foreground",
        link: "text-primary group-active:underline",
      },
      size: {
        default: "text-base font-sans font-semibold",
        sm: "text-sm font-sans font-semibold",
        lg: "text-lg font-sans font-semibold",
        icon: "text-lg font-sans font-semibold",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: "primary" | "secondary" | "tertiary" | "default" | "outline" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  rounded?: "default" | "sm" | "full";
  state?: "default" | "active" | "disabled";
  isLoading?: boolean;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftIconName?: IconName;
  rightIconName?: IconName;
  leftIconProps?: Omit<SvgIconProps, "name" | "size" | "color">;
  rightIconProps?: Omit<SvgIconProps, "name" | "size" | "color">;
  textClassName?: string;
  children?: React.ReactNode;
}

const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(({
  className,
  variant = "primary",
  size = "default",
  rounded = "default",
  state = "default",
  leftIcon,
  rightIcon,
  leftIconName,
  rightIconName,
  isLoading = false,
  leftIconProps = {},
  rightIconProps = {},
  textClassName,
  children,
  disabled,
  ...props
}, ref) => {
  // If disabled is true, set state to disabled
  const buttonState = disabled ? "disabled" : state;

  // Determine icon size based on button size
  const getIconSize = React.useCallback(() => {
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
  }, [size]);

  // Create icon elements from icon names
  const leftIconElement = React.useMemo(() => {
    if (leftIconName) {
      const iconSize = getIconSize();
      const iconColor = variant === "primary" ? "#FFF" : undefined;

      return (
        <SvgIcon
          name={leftIconName}
          size={iconSize}
          color={iconColor}
          {...leftIconProps}
        />
      );
    }
    return leftIcon;
  }, [leftIconName, leftIcon, getIconSize, variant, leftIconProps]);

  const rightIconElement = React.useMemo(() => {
    if (rightIconName) {
      const iconSize = getIconSize();
      const iconColor = variant === "primary" ? "#FFF" : undefined;

      return (
        <SvgIcon
          name={rightIconName}
          size={iconSize}
          color={iconColor}
          {...rightIconProps}
        />
      );
    }
    return rightIcon;
  }, [rightIconName, rightIcon, getIconSize, variant, rightIconProps]);

  // Function to render content
  const renderContent = () => {
    const animation = useRef<LottieView>(null);
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} className="transition-all duration-200">
        {leftIconElement && <View className="mr-2">{leftIconElement}</View>}
        {isLoading ? (
          <LottieView
            source={require('@/assets/lottie/loading.json')}
            autoPlay
            ref={animation}
            loop
            style={{ width: 120, height: 120 }}
          />
        ) : children}
        {rightIconElement && <View className="ml-2">{rightIconElement}</View>}
      </View>
    );
  };

  return (
    <Pressable
      ref={ref}
      disabled={buttonState === "disabled"}
      className={cn(
        buttonVariants({
          variant,
          size,
          rounded,
          state: buttonState
        }),
        className
      )}
      {...props}
    >
      <TextClassContext.Provider
        value={cn(
          buttonTextVariants({ variant, size }),
          textClassName
        )}
      >
        {renderContent()}
      </TextClassContext.Provider>
    </Pressable>
  );
});

Button.displayName = "Button";

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
