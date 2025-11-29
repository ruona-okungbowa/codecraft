"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  hover?: boolean;
}

export default function AnimatedCard({
  children,
  delay = 0,
  className = "",
  hover = true,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`glass-card noise-texture rounded-lg shadow-md ${className}`}
    >
      {children}
    </motion.div>
  );
}
