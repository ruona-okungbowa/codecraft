/**
 * CodeCraft Design System - Badge Component
 *
 * Small labels for status, categories, and highlights
 */

"use client";

import { ReactNode } from "react";

type BadgeVariant =
  | "primary"
  | "growth"
  | "energy"
  | "joy"
  | "neutral"
  | "outline";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-primary-100 text-primary-700 border-primary-200",
  growth: "bg-growth-100 text-growth-700 border-growth-200",
  energy: "bg-energy-100 text-energy-700 border-energy-200",
  joy: "bg-joy-100 text-joy-700 border-joy-200",
  neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
  outline: "bg-transparent text-neutral-700 border-neutral-300",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export default function Badge({
  variant = "neutral",
  size = "md",
  children,
  className = "",
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`
            w-1.5 h-1.5 rounded-full
            ${variant === "primary" ? "bg-primary-500" : ""}
            ${variant === "growth" ? "bg-growth-500" : ""}
            ${variant === "energy" ? "bg-energy-500" : ""}
            ${variant === "joy" ? "bg-joy-500" : ""}
            ${variant === "neutral" ? "bg-neutral-500" : ""}
          `}
        />
      )}
      {children}
    </span>
  );
}
