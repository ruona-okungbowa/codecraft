"use client";

import React from "react";

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

  // Icon only - Simple sprout growing from brackets
  const IconMark = () => (
    <svg
      width={height}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left bracket - Code (Blue) */}
      <path
        d="M18 12L10 24L18 36"
        stroke="url(#blue-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right bracket - Code (Blue) */}
      <path
        d="M30 12L38 24L30 36"
        stroke="url(#blue-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Plant sprout - Craft (Green to Purple) */}
      <path
        d="M24 28 Q24 20, 20 16 M24 28 Q24 18, 28 14"
        stroke="url(#growth-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Seed/base */}
      <circle cx="24" cy="30" r="3" fill="url(#growth-gradient)" />

      {/* Gradients */}
      <defs>
        <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667EEA" />
          <stop offset="100%" stopColor="#5A67D8" />
        </linearGradient>
        <linearGradient
          id="growth-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
    </svg>
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
