import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderColor: {
        input: "hsl(var(--input))",
      },
      backgroundColor: {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
      },
      textColor: {
        "primary-foreground": "hsl(var(--primary-foreground))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        "muted-foreground": "hsl(var(--muted-foreground))",
      },
      ringColor: {
        ring: "hsl(var(--ring))",
      },
    },
  },
  plugins: [],
};
export default config;
