/**
 * CodeCraft Design System - Mascot Component
 *
 * Friendly guide character that appears throughout the app
 * Placeholder for custom illustration - can be replaced with SVG
 */

"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type MascotMood =
  | "happy"
  | "excited"
  | "thinking"
  | "celebrating"
  | "encouraging";
type MascotSize = "sm" | "md" | "lg" | "xl";

interface MascotProps {
  mood?: MascotMood;
  size?: MascotSize;
  message?: string;
  showSpeechBubble?: boolean;
  className?: string;
}

const sizeStyles: Record<MascotSize, { container: string; emoji: string }> = {
  sm: { container: "w-12 h-12", emoji: "text-2xl" },
  md: { container: "w-16 h-16", emoji: "text-3xl" },
  lg: { container: "w-24 h-24", emoji: "text-5xl" },
  xl: { container: "w-32 h-32", emoji: "text-6xl" },
};

const moodEmojis: Record<MascotMood, string> = {
  happy: "🌱",
  excited: "🌿",
  thinking: "🤔",
  celebrating: "🎉",
  encouraging: "💪",
};

export default function Mascot({
  mood = "happy",
  size = "md",
  message,
  showSpeechBubble = false,
  className = "",
}: MascotProps) {
  const styles = sizeStyles[size];

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Speech Bubble */}
      {showSpeechBubble && message && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-white rounded-2xl shadow-lg border-2 border-neutral-200 whitespace-nowrap"
        >
          <p className="text-sm font-medium text-neutral-800 font-accent">
            {message}
          </p>
          {/* Speech bubble tail */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="w-3 h-3 bg-white border-r-2 border-b-2 border-neutral-200 rotate-45" />
          </div>
        </motion.div>
      )}

      {/* Mascot */}
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`
          ${styles.container}
          rounded-full bg-linear-to-br from-growth-100 to-primary-100
          flex items-center justify-center
          border-3 border-white shadow-lg
        `}
      >
        <span className={styles.emoji}>{moodEmojis[mood]}</span>
      </motion.div>
    </div>
  );
}

// Mascot with tooltip/message
export function MascotWithMessage({
  mood = "happy",
  size = "md",
  children,
}: {
  mood?: MascotMood;
  size?: MascotSize;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <Mascot mood={mood} size={size} />
      <div className="flex-1 bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
        <div className="text-neutral-700 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
