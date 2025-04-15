// Define the application's typography system
export const typography = {
  // Font families
  fontFamily: {
    sans: ["DM Sans", "sans-serif"],
    mono: ["JetBrains Mono", "monospace"],
  },
  // Font sizes with their respective line heights
  fontSize: {
    // Extra Small - 12px
    xs: ["0.75rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
    // Small - 14px
    sm: ["0.875rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
    // Base - 16px
    base: ["1rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
    // Large - 18px
    lg: ["1.125rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
    // Extra Large - 20px
    xl: ["1.25rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
    // 2XL - 24px
    "2xl": ["1.5rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
    // 3XL - 32px
    "3xl": ["2rem", { lineHeight: "1.5", letterSpacing: "-0.02em" }],
    "4xl": ["2.5rem", { lineHeight: "1.5", letterSpacing: "-0.02em" }],
    "5xl": ["3rem", { lineHeight: "1.5", letterSpacing: "-0.02em" }],
    "6xl": ["3.5rem", { lineHeight: "1.5", letterSpacing: "-0.02em" }],
    "7xl": ["4rem", { lineHeight: "1.5", letterSpacing: "-0.02em" }],
    "8xl": ["4.5rem", { lineHeight: "1.5", letterSpacing: "-0.02em" }],
    "9xl": ["5rem", { lineHeight: "1.5", letterSpacing: "-0.02em" }],
  },
  // Font weights
  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },
  // Line heights
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },
  // Letter spacing
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
};

// Export types for our typography system
export type Typography = typeof typography;
export type FontFamily = keyof typeof typography.fontFamily;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type LineHeight = keyof typeof typography.lineHeight;
export type LetterSpacing = keyof typeof typography.letterSpacing;
