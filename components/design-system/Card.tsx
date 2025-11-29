/**
 * CodeCraft Design System - Card Component
 *
 * Flexible card with hand-drawn aesthetic and growth animations
 */

"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { hoverLift } from "@/lib/design-system/animations";

type CardVariant = "default" | "elevated" | "outlined";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: CardVariant;
  padding?: CardPadding;
  children: ReactNode;
  hoverable?: boolean;
  glowColor?: "primary" | "growth" | "energy" | "joy" | "none";
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-white border border-neutral-200 shadow-md",
  elevated: "bg-white shadow-xl",
  outlined: "bg-transparent border-2 border-neutral-300",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const glowStyles: Record<string, string> = {
  primary: "hover:shadow-primary",
  growth: "hover:shadow-growth",
  energy: "hover:shadow-energy",
  joy: "hover:shadow-joy",
  none: "",
};

export default function Card({
  variant = "default",
  padding = "md",
  children,
  hoverable = false,
  glowColor = "none",
  className = "",
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hoverable ? hoverLift : undefined}
      className={`
        rounded-2xl transition-all duration-300
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hoverable ? glowStyles[glowColor] : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
