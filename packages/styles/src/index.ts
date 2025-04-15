// Import theme configurations
import { colors } from "./theme/colors";
import { typography } from "./theme/typography";

// Export theme configurations
export * from "./theme/colors";
export * from "./theme/typography";

// Export the path to the global CSS file
export const globalCssPath = "./styles/global.css";

// Export a function to get the complete theme configuration
export const getTheme = () => {
  return {
    colors,
    typography,
  };
};

// Export types
export type Theme = ReturnType<typeof getTheme>;
