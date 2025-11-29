/**
 * CodeCraft Design System - Typography
 *
 * Font scales and text styles for consistent, accessible typography
 */

export const typography = {
  // Font families
  fonts: {
    heading: "var(--font-newsreader)", // Elegant serif for headlines
    body: "var(--font-dm-sans)", // Clean, friendly sans-serif
    accent: "var(--font-caveat)", // Handwritten for playful elements
    mono: "var(--font-geist-mono)", // Code snippets
  },

  // Font sizes (mobile-first, responsive)
  sizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
    "7xl": "4.5rem", // 72px
    "8xl": "6rem", // 96px
  },

  // Line heights
  leading: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },

  // Font weights
  weights: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
} as const;

// Pre-defined text styles for common use cases
export const textStyles = {
  // Headings
  h1: "font-heading text-6xl md:text-7xl font-bold leading-tight",
  h2: "font-heading text-4xl md:text-5xl font-bold leading-tight",
  h3: "font-heading text-3xl md:text-4xl font-semibold leading-snug",
  h4: "font-body text-2xl md:text-3xl font-semibold leading-snug",
  h5: "font-body text-xl md:text-2xl font-semibold leading-normal",
  h6: "font-body text-lg md:text-xl font-semibold leading-normal",

  // Body text
  bodyLarge: "font-body text-lg leading-relaxed",
  body: "font-body text-base leading-normal",
  bodySmall: "font-body text-sm leading-normal",

  // Special
  accent: "font-accent text-2xl leading-relaxed",
  caption: "font-body text-xs leading-normal text-neutral-600",
  code: "font-mono text-sm",
} as const;
