/**
 * CodeCraft Design System - Spacing & Layout
 *
 * Consistent spacing scale and layout utilities
 */

export const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  32: "8rem", // 128px
  40: "10rem", // 160px
  48: "12rem", // 192px
  56: "14rem", // 224px
  64: "16rem", // 256px
} as const;

export const borderRadius = {
  none: "0",
  sm: "0.25rem", // 4px
  base: "0.5rem", // 8px
  md: "0.75rem", // 12px
  lg: "1rem", // 16px
  xl: "1.5rem", // 24px
  "2xl": "2rem", // 32px
  "3xl": "3rem", // 48px
  full: "9999px",
} as const;

export const shadows = {
  // Subtle shadows
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",

  // Elevated shadows
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",

  // Colored shadows for emphasis
  primary: "0 10px 30px -5px rgba(102, 127, 234, 0.3)",
  growth: "0 10px 30px -5px rgba(34, 197, 94, 0.3)",
  energy: "0 10px 30px -5px rgba(249, 115, 22, 0.3)",
  joy: "0 10px 30px -5px rgba(217, 70, 239, 0.3)",

  // Inner shadow for depth
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",

  // No shadow
  none: "none",
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const containerSizes = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1400px",
  full: "100%",
} as const;
