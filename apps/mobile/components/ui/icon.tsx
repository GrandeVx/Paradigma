import * as React from "react";
import { Image, ImageProps, ImageSourcePropType, ImageStyle, Platform } from "react-native";
import { cn } from "@/lib/utils";

// Importa le icone SVG
import * as SvgIcons from "./svg-icons";
import { IconSvgProps } from "./svg-icons";

export interface IconProps extends Omit<ImageProps, "source"> {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

// Definizione del tipo per la mappa delle icone
export type IconMapType = {
  [key: string]: NodeRequire;
};


// Static mapping of icon names to their imports
// This is necessary because React Native doesn't support dynamic requires
const iconMap: IconMapType = {
  "add": require("@/public/icons/add.svg"),
  "ai": require("@/public/icons/ai.svg"),
  "at": require("@/public/icons/at.svg"),
  "bank": require("@/public/icons/bank.svg"),
  "bank-card": require("@/public/icons/bank-card.svg"),
  "box": require("@/public/icons/box.svg"),
  "calendar": require("@/public/icons/calendar.svg"),
  "cash": require("@/public/icons/cash.svg"),
  "chart-vertical": require("@/public/icons/chart-vertical.svg"),
  "checks": require("@/public/icons/checks.svg"),
  "close": require("@/public/icons/close.svg"),
  "delete": require("@/public/icons/delete.svg"),
  "delete-back": require("@/public/icons/delete-back.svg"),
  "document": require("@/public/icons/document.svg"),
  "down": require("@/public/icons/down.svg"),
  "edit": require("@/public/icons/edit.svg"),
  "eye": require("@/public/icons/eye.svg"),
  "eye-close": require("@/public/icons/eye-close.svg"),
  "left": require("@/public/icons/left.svg"),
  "link": require("@/public/icons/link.svg"),
  "minimize": require("@/public/icons/minimize.svg"),
  "next": require("@/public/icons/next.svg"),
  "previous": require("@/public/icons/previous.svg"),
  "pig-money": require("@/public/icons/pig-money.svg"),
  "refresh": require("@/public/icons/refresh.svg"),
  "right": require("@/public/icons/right.svg"),
  "schedule": require("@/public/icons/schedule.svg"),
  "target": require("@/public/icons/target.svg"),
  "up": require("@/public/icons/up.svg"),
  "wallet": require("@/public/icons/wallet.svg"),
};

export const Icon = React.forwardRef<React.ElementRef<typeof Image>, IconProps>(
  ({ name, size = 24, color = "currentColor", className, style, ...props }, ref) => {
    // Verifica se esiste un componente SVG per questa icona
    const iconName = `${name.split('-').map((part, i) =>
      i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
    ).join('')}Icon`;

    // Usa cast sicuro a record di componenti
    const svgIcons = SvgIcons as Record<string, React.ComponentType<IconSvgProps>>;
    const SvgIcon = svgIcons[iconName];

    // Se esiste un'icona SVG, utilizzala
    if (SvgIcon) {
      // In questo caso ignoriamo il ref perché è destinato a Image
      return <SvgIcon size={size} color={color} style={style} />;
    }

    // Se non esiste un componente SVG, crea il percorso per l'immagine
    const source = React.useMemo(() => {
      if (Platform.OS === 'web') {
        // Web platforms can use URI paths
        return { uri: `/icons/${name}.svg` };
      }

      // Use the pre-imported icon from our map
      if (iconMap[name]) {
        return iconMap[name];
      }

      // Fallback if icon not found
      console.warn(`Icon not found: ${name}`);
      return { uri: '' };
    }, [name]);

    // Render as Image
    return (
      <Image
        ref={ref}
        source={source as ImageSourcePropType}
        accessibilityLabel={`${name} icon`}
        className={cn("", className)}
        style={[
          {
            width: size,
            height: size,
            tintColor: color !== "currentColor" ? color : undefined,
          } as ImageStyle,
          style,
        ]}
        {...props}
      />
    );
  }
);

Icon.displayName = "Icon";