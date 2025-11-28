/**
 * CodeCraft Design System - Color Palette
 *
 * A vibrant, inclusive color system that balances professionalism with playfulness.
 * Inspired by growth, creativity, and empowerment.
 */

export const colors = {
  // Primary - Trust & GitHub Connection
  primary: {
    50: "#f0f4ff",
    100: "#e0e9ff",
    200: "#c7d7fe",
    300: "#a3b2f3",
    400: "#667fea",
    500: "#5568d3",
    600: "#4451b8",
    700: "#3a3f95",
    800: "#2f3478",
    900: "#252b5c",
  },

  // Growth - Achievement & Progress
  growth: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },

  // Energy - Warmth & Creativity
  energy: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
  },

  // Joy - Playful & Inclusive
  joy: {
    50: "#fdf4ff",
    100: "#fae8ff",
    200: "#f5d0fe",
    300: "#f0abfc",
    400: "#e879f9",
    500: "#d946ef",
    600: "#c026d3",
    700: "#a21caf",
    800: "#86198f",
    900: "#701a75",
  },

  // Coral - Warm accent for CTAs
  coral: {
    50: "#fff1f2",
    100: "#ffe4e6",
    200: "#fecdd3",
    300: "#fda4af",
    400: "#fb7185",
    500: "#f43f5e",
    600: "#e11d48",
    700: "#be123c",
    800: "#9f1239",
    900: "#881337",
  },

  // Neutrals - Warm grays for backgrounds
  neutral: {
    50: "#fafaf9",
    100: "#f5f5f4",
    200: "#e7e5e4",
    300: "#d6d3d1",
    400: "#a8a29e",
    500: "#78716c",
    600: "#57534e",
    700: "#44403c",
    800: "#292524",
    900: "#1c1917",
    950: "#0c0a09",
  },

  // Semantic colors
  success: "#22c55e",
  warning: "#f97316",
  error: "#ef4444",
  info: "#3b82f6",
} as const;

export type ColorScale = keyof typeof colors;
export type ColorShade =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950;
