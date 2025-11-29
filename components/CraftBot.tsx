"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface CraftBotProps {
  state?: "welcome" | "encouraging" | "celebrating" | "thinking" | "guiding" | "calm";
  size?: number;
  className?: string;
}

export default function CraftBot({
  state = "welcome",
  size = 200,
  className = "",
}: CraftBotProps) {
  // Map states to mascot images
  const mascotImages = {
    welcome: "/crafty.jpg",
    encouraging: "/crafty.jpg", // Using default for now
    celebrating: "/celebration.jpg",
    thinking: "/crafty2.jpg", // Alternative pose
    guiding: "/crafty.jpg", // Using default for now
    calm: "/crafty.jpg", // Using default for now
  };

  // Animation variants for floating effect
  const floatAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <motion.div
      className={className}
      animate={floatAnimation}
      style={{ width: size, height: size }}
    >
      <Image
        src={mascotImages[state]}
        alt={`Craft Bot ${state}`}
        width={size}
        height={size}
        className="w-full h-full object-contain"
        priority
      />
    </motion.div>
  );
}
