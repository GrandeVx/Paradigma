import { SvgProps } from "react-native-svg";

export interface IconSvgProps extends SvgProps {
  size?: number;
  color?: string;
}

// Funzione di utilità per convertire il colore "currentColor" in un colore effettivo
export const resolveColor = (color: string | undefined): string => {
  if (!color || color === "currentColor") {
    return "#000"; // Default color
  }
  return color;
}; 