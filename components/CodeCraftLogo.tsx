"use client";

import React from "react";
import Image from "next/image";

interface CodeCraftLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "wordmark";
  className?: string;
}

export default function CodeCraftLogo({
  size = "md",
  variant = "full",
  className = "",
}: CodeCraftLogoProps) {
  const sizes = {
    sm: { height: 24, fontSize: "text-lg" },
    md: { height: 32, fontSize: "text-2xl" },
    lg: { height: 48, fontSize: "text-4xl" },
    xl: { height: 64, fontSize: "text-5xl" },
  };

  const { height, fontSize } = sizes[size];

  // Icon only - Using the generated logo
  const IconMark = () => (
    <div className={className} style={{ width: height, height: height }}>
      <Image
        src="/logo.jpg"
        alt="CodeCraft Logo"
        width={height}
        height={height}
        className="w-full h-full object-contain"
      />
    </div>
  );

  // Wordmark - Text only
  const Wordmark = () => (
    <div className={`flex items-center font-bold ${fontSize} ${className}`}>
      <span
        className="tracking-tight"
        style={{
          fontFamily: "var(--font-inter)",
          background: "linear-gradient(135deg, #667EEA 0%, #5A67D8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Code
      </span>
      <span
        className="tracking-tight"
        style={{
          fontFamily: "var(--font-outfit)",
          background: "linear-gradient(135deg, #A855F7 0%, #EC4899 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Craft
      </span>
    </div>
  );

  // Full logo - Icon + Wordmark
  const FullLogo = () => (
    <div className={`flex items-center gap-2 ${className}`}>
      <IconMark />
      <Wordmark />
    </div>
  );

  if (variant === "icon") return <IconMark />;
  if (variant === "wordmark") return <Wordmark />;
  return <FullLogo />;
}
