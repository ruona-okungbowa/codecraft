"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  title = "Every big idea starts small",
  description = "Your journey begins here. Start building something amazing!",
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-16 px-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Illustration */}
      <motion.div
        className="mb-8 max-w-md w-full"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          src="/empty.jpg"
          alt="Empty state illustration - robot watering a plant"
          width={400}
          height={400}
          className="w-full h-auto rounded-2xl"
          priority
        />
      </motion.div>

      {/* Content */}
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h3
          className="text-2xl lg:text-3xl font-bold font-display mb-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.63 0.24 240) 0%, oklch(0.64 0.26 290) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </h3>
        <p
          className="text-lg mb-6"
          style={{
            color: "oklch(0.56 0.014 240)",
            lineHeight: "1.6",
          }}
        >
          {description}
        </p>

        {/* Optional Action Button */}
        {actionLabel && onAction && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAction}
            className="px-8 py-4 rounded-xl text-white font-semibold text-lg"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.63 0.24 240) 0%, oklch(0.64 0.26 290) 100%)",
              boxShadow: "0 10px 40px -10px oklch(0.54 0.24 240 / 0.4)",
            }}
          >
            {actionLabel}
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
