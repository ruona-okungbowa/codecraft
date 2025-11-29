/**
 * CodeCraft Design System - Animations
 *
 * Balanced, purposeful animations that enhance UX without overwhelming
 */

import { Variants } from "framer-motion";

// Timing functions
export const easings = {
  // Smooth, natural easing
  smooth: [0.43, 0.13, 0.23, 0.96],
  // Bouncy, playful easing
  bounce: [0.68, -0.55, 0.265, 1.55],
  // Quick and snappy
  snappy: [0.25, 0.46, 0.45, 0.94],
} as const;

// Duration presets (in seconds)
export const durations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
} as const;

// Common animation variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.normal, ease: easings.smooth },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.normal, ease: easings.smooth },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.normal, ease: easings.smooth },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.normal, ease: easings.smooth },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.normal, ease: easings.smooth },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.normal, ease: easings.smooth },
  },
};

// Growth-themed animations
export const growIn: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: durations.slow,
      ease: easings.bounce,
    },
  },
};

export const bloom: Variants = {
  hidden: { opacity: 0, scale: 0, rotate: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: durations.slower,
      ease: easings.bounce,
    },
  },
};

// Stagger children animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerFastContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Hover animations (for whileHover)
export const hoverLift = {
  y: -4,
  transition: { duration: durations.fast, ease: easings.snappy },
};

export const hoverScale = {
  scale: 1.05,
  transition: { duration: durations.fast, ease: easings.snappy },
};

export const hoverGlow = {
  boxShadow: "0 8px 30px rgba(102, 127, 234, 0.3)",
  transition: { duration: durations.fast },
};

// Tap animations (for whileTap)
export const tapScale = {
  scale: 0.95,
  transition: { duration: durations.fast },
};

// Loading animations
export const pulse: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const spin: Variants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Path drawing animation (for SVG paths)
export const drawPath = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 2, ease: "easeInOut" },
      opacity: { duration: 0.3 },
    },
  },
};
