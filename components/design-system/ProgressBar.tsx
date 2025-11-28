/**
 * CodeCraft Design System - Progress Bar Component
 *
 * Growth-themed progress indicator with organic styling
 */

"use client";

import { motion } from "framer-motion";

type ProgressVariant = "primary" | "growth" | "energy" | "joy";
type ProgressSize = "sm" | "md" | "lg";

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const variantStyles: Record<ProgressVariant, { bg: string; fill: string }> = {
  primary: { bg: "bg-primary-100", fill: "bg-primary-500" },
  growth: { bg: "bg-growth-100", fill: "bg-growth-500" },
  energy: { bg: "bg-energy-100", fill: "bg-energy-500" },
  joy: { bg: "bg-joy-100", fill: "bg-joy-500" },
};

const sizeStyles: Record<ProgressSize, string> = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

export default function ProgressBar({
  value,
  max = 100,
  variant = "growth",
  size = "md",
  showLabel = false,
  label,
  animated = true,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const styles = variantStyles[variant];

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-neutral-700">
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-sm font-semibold text-neutral-900">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className={`w-full ${styles.bg} rounded-full overflow-hidden ${sizeStyles[size]}`}
      >
        <motion.div
          className={`${styles.fill} h-full rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 0.8 : 0,
            ease: [0.43, 0.13, 0.23, 0.96],
          }}
        />
      </div>
    </div>
  );
}
