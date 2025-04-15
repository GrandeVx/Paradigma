import { typography } from "@paradigma/styles";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Black & White
        black: "hsl(var(--black))",
        white: "hsl(var(--white))",

        // Grey Scale
        grey: {
          50: "hsl(var(--grey-50))",
          100: "hsl(var(--grey-100))",
          200: "hsl(var(--grey-200))",
          300: "hsl(var(--grey-300))",
          400: "hsl(var(--grey-400))",
          500: "hsl(var(--grey-500))",
          600: "hsl(var(--grey-600))",
          700: "hsl(var(--grey-700))",
          800: "hsl(var(--grey-800))",
          900: "hsl(var(--grey-900))",
          950: "hsl(var(--grey-950))",
        },

        // Primary Colors
        primary: {
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          200: "hsl(var(--primary-200))",
          300: "hsl(var(--primary-300))",
          400: "hsl(var(--primary-400))",
          500: "hsl(var(--primary-500))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          800: "hsl(var(--primary-800))",
          900: "hsl(var(--primary-900))",
          950: "hsl(var(--primary-950))",
        },

        // Secondary Colors
        orange: {
          500: "hsl(var(--orange-500))",
        },
        lime: {
          500: "hsl(var(--lime-500))",
        },

        // State Colors
        success: {
          50: "hsl(var(--success-50))",
          500: "hsl(var(--success-500))",
        },
        error: {
          50: "hsl(var(--error-50))",
          500: "hsl(var(--error-500))",
        },
        attention: {
          50: "hsl(var(--attention-50))",
          500: "hsl(var(--attention-500))",
        },

        // Category Colors
        category: {
          orange: {
            50: "hsl(var(--orange-50))",
            500: "hsl(var(--orange-500))",
          },
          red: {
            50: "hsl(var(--red-50))",
            500: "hsl(var(--red-500))",
          },
          pink: {
            50: "hsl(var(--pink-50))",
            500: "hsl(var(--pink-500))",
          },
          sky: {
            50: "hsl(var(--sky-50))",
            500: "hsl(var(--sky-500))",
          },
          purple: {
            50: "hsl(var(--purple-50))",
            500: "hsl(var(--purple-500))",
          },
          green: {
            50: "hsl(var(--green-50))",
            500: "hsl(var(--green-500))",
          },
        },

        // System Colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      ...typography,
    },
  },
  plugins: [],
};