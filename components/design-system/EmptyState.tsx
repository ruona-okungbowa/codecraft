/**
 * CodeCraft Design System - Empty State Component
 *
 * Encouraging empty states with illustrations and CTAs
 */

"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { fadeInUp, staggerContainer } from "@/lib/design-system/animations";
import Button from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  illustration?: "plant" | "rocket" | "compass" | "sparkles";
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  illustration,
}: EmptyStateProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {/* Icon or Illustration */}
      <motion.div variants={fadeInUp} className="mb-6">
        {icon ? (
          <div className="w-24 h-24 flex items-center justify-center text-neutral-400">
            {icon}
          </div>
        ) : illustration ? (
          <IllustrationPlaceholder type={illustration} />
        ) : null}
      </motion.div>

      {/* Title */}
      <motion.h3
        variants={fadeInUp}
        className="text-2xl font-semibold text-neutral-900 mb-3 font-heading"
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        variants={fadeInUp}
        className="text-neutral-600 max-w-md mb-8 leading-relaxed"
      >
        {description}
      </motion.p>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap gap-3 justify-center"
        >
          {actionLabel && onAction && (
            <Button variant="primary" size="lg" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="lg" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// Placeholder for illustrations (to be replaced with actual SVGs)
function IllustrationPlaceholder({ type }: { type: string }) {
  const colors: Record<string, string> = {
    plant: "text-growth-400",
    rocket: "text-primary-400",
    compass: "text-energy-400",
    sparkles: "text-joy-400",
  };

  return (
    <div
      className={`w-32 h-32 rounded-full flex items-center justify-center ${colors[type] || "text-neutral-400"} bg-neutral-100`}
    >
      <span className="text-5xl">
        {type === "plant" && "🌱"}
        {type === "rocket" && "🚀"}
        {type === "compass" && "🧭"}
        {type === "sparkles" && "✨"}
      </span>
    </div>
  );
}
