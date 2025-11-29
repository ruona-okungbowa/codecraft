"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Card, Badge } from "@/components/design-system";
import { hoverLift } from "@/lib/design-system/animations";

type FeatureColor = "primary" | "growth" | "energy" | "joy";

interface InteractiveFeatureCardProps {
  icon: React.ReactNode;
  color: FeatureColor;
  title: string;
  description: string;
  badge?: string;
  imageSrc?: string;
}

export default function InteractiveFeatureCard({
  icon,
  color,
  title,
  description,
  badge,
  imageSrc,
}: InteractiveFeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const colorClasses = {
    primary: {
      bg: "bg-linear-to-br from-primary-200 to-primary-300",
      text: "text-primary-700",
      border: "border-primary-400",
      glow: "shadow-primary",
      badge: "primary" as const,
    },
    growth: {
      bg: "bg-linear-to-br from-growth-200 to-growth-300",
      text: "text-growth-700",
      border: "border-growth-400",
      glow: "shadow-growth",
      badge: "growth" as const,
    },
    energy: {
      bg: "bg-linear-to-br from-energy-200 to-energy-300",
      text: "text-energy-700",
      border: "border-energy-400",
      glow: "shadow-energy",
      badge: "energy" as const,
    },
    joy: {
      bg: "bg-linear-to-br from-joy-200 to-joy-300",
      text: "text-joy-700",
      border: "border-joy-400",
      glow: "shadow-joy",
      badge: "joy" as const,
    },
  };

  const styles = colorClasses[color];

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={hoverLift}
    >
      <Card
        padding="lg"
        className={`border-3 border-neutral-200 transition-all duration-300 ${
          isHovered ? styles.glow : ""
        }`}
      >
        {badge && (
          <Badge variant={styles.badge} size="sm" className="mb-4 shadow-md">
            {badge}
          </Badge>
        )}

        {/* Icon with hover animation */}
        <motion.div
          animate={
            isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.3 }}
          className={`w-16 h-16 rounded-2xl ${styles.bg} ${styles.text} flex items-center justify-center mb-4 shadow-lg border-2 ${styles.border}`}
        >
          {icon}
        </motion.div>

        <h3 className="font-bold text-xl mb-3">{title}</h3>
        <p className="text-neutral-600 leading-relaxed font-medium">
          {description}
        </p>

        {/* Optional preview image */}
        {imageSrc && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={
              isHovered
                ? { opacity: 1, height: "auto" }
                : { opacity: 0, height: 0 }
            }
            transition={{ duration: 0.3 }}
            className="mt-4 overflow-hidden rounded-xl"
          >
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-auto rounded-xl border-2 border-neutral-200"
            />
          </motion.div>
        )}

        {/* Hover indicator */}
        <motion.div
          initial={{ width: 0 }}
          animate={isHovered ? { width: "100%" } : { width: 0 }}
          transition={{ duration: 0.3 }}
          className={`h-1 ${styles.bg} rounded-full mt-4`}
        />
      </Card>
    </motion.div>
  );
}
