import { typography } from "@paradigma/styles";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    container: {
      center: true,
      padding: '0px',
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },

    extend: {
      colors: {
        // Black & White

        // Grey Scale
        grey: {
          50: "var(--grey-50)",
          100: "var(--grey-100)",
          200: "var(--grey-200)",
          300: "var(--grey-300)",
          400: "var(--grey-400)",
          500: "var(--grey-500)",
          600: "var(--grey-600)",
          700: "var(--grey-700)",
          800: "var(--grey-800)",
          900: "var(--grey-900)",
        },

        // Primary Colors
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
          950: "var(--primary-950)",
        },

        // Secondary Colors
        orange: {
          500: "var(--orange-500)",
        },
        lime: {
          500: "var(--lime-500)",
        },
        // State Colors
        success: {
          50: "var(--success-50)",
          500: "var(--success-500)",
        },
        error: {
          50: "var(--error-50)",
          500: "var(--error-500)",
        },
        attention: {
          50: "var(--attention-50)",
          500: "var(--attention-500)",
        },

        // Category Colors
        category: {
          orange: {
            50: "var(--orange-50)",
            500: "var(--orange-500)",
          },
          red: {
            50: "var(--red-50)",
            500: "var(--red-500)",
          },
          pink: {
            50: "var(--pink-50)",
            500: "var(--pink-500)",
          },
          sky: {
            50: "var(--sky-50)",
            500: "var(--sky-500)",
          },
          purple: {
            50: "var(--purple-50)",
            500: "var(--purple-500)",
          },
          green: {
            50: "var(--green-50)",
            500: "var(--green-500)",
          },
        },

        // System Colors
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      ...typography,
    },
  },
  plugins: [],
};