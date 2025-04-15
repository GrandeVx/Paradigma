// Define the application's color palette
// These colors can be used in both web and mobile applications
export const colors = {
  // Primary colors
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
    950: "#082f49",
  },
  // Neutral colors
  neutral: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },
  // Semantic colors
  success: {
    light: "#86efac",
    DEFAULT: "#22c55e",
    dark: "#15803d",
  },
  warning: {
    light: "#fde047",
    DEFAULT: "#eab308",
    dark: "#a16207",
  },
  error: {
    light: "#fca5a5",
    DEFAULT: "#ef4444",
    dark: "#b91c1c",
  },
  // Background colors
  background: {
    light: "#ffffff",
    dark: "#0f172a",
  },
  // Text colors
  text: {
    light: "#0f172a",
    dark: "#f8fafc",
  },
} as const;

// Type for our color palette
export type ColorPalette = typeof colors;

// Export individual color types
export type PrimaryColors = keyof typeof colors.primary;
export type NeutralColors = keyof typeof colors.neutral;
export type SemanticColors =
  | keyof typeof colors.success
  | keyof typeof colors.warning
  | keyof typeof colors.error;
export type BackgroundColors = keyof typeof colors.background;
export type TextColors = keyof typeof colors.text;
