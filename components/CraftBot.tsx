"use client";

import React from "react";
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
  // Animation variants for floating effect
  const floatAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  // Antenna glow color based on state
  const antennaColors = {
    welcome: "#667EEA",
    encouraging: "#F97316",
    celebrating: "#EC4899",
    thinking: "#A855F7",
    guiding: "#22C55E",
    calm: "#14B8A6",
  };

  return (
    <motion.div
      className={className}
      animate={floatAnimation}
      style={{ width: size, height: size }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Antenna */}
        <line
          x1="100"
          y1="30"
          x2="100"
          y2="10"
          stroke="url(#body-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Antenna orb with glow */}
        <circle cx="100" cy="10" r="6" fill={antennaColors[state]}>
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="100"
          cy="10"
          r="10"
          fill={antennaColors[state]}
          opacity="0.3"
        >
          <animate
            attributeName="r"
            values="10;14;10"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Head */}
        <rect
          x="60"
          y="30"
          width="80"
          height="70"
          rx="20"
          fill="url(#body-gradient)"
        />

        {/* Eyes */}
        {state === "celebrating" ? (
          // Star eyes for celebrating
          <>
            <path
              d="M80 60 L82 66 L88 66 L83 70 L85 76 L80 72 L75 76 L77 70 L72 66 L78 66 Z"
              fill="white"
            />
            <path
              d="M120 60 L122 66 L128 66 L123 70 L125 76 L120 72 L115 76 L117 70 L112 66 L118 66 Z"
              fill="white"
            />
          </>
        ) : state === "thinking" ? (
          // Closed eyes for thinking
          <>
            <line
              x1="75"
              y1="65"
              x2="85"
              y2="65"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="115"
              y1="65"
              x2="125"
              y2="65"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        ) : (
          // Normal round eyes
          <>
            <circle cx="80" cy="65" r="8" fill="white" />
            <circle cx="120" cy="65" r="8" fill="white" />
            <circle cx="82" cy="63" r="4" fill="#1F2937" />
            <circle cx="122" cy="63" r="4" fill="#1F2937" />
            {/* Sparkle */}
            <circle cx="84" cy="61" r="1.5" fill="white" />
            <circle cx="124" cy="61" r="1.5" fill="white" />
          </>
        )}

        {/* Body */}
        <rect
          x="70"
          y="100"
          width="60"
          height="65"
          rx="15"
          fill="url(#body-gradient)"
        />

        {/* Chest core with glow */}
        <circle cx="100" cy="130" r="15" fill="url(#core-gradient)">
          <animate
            attributeName="opacity"
            values="0.8;1;0.8"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="100" cy="130" r="10" fill="#fff" opacity="0.6" />

        {/* Panel details */}
        <rect
          x="80"
          y="115"
          width="8"
          height="3"
          rx="1.5"
          fill="#F97316"
          opacity="0.8"
        />
        <rect
          x="112"
          y="115"
          width="8"
          height="3"
          rx="1.5"
          fill="#F97316"
          opacity="0.8"
        />

        {/* Arms */}
        {state === "welcome" || state === "guiding" ? (
          // Waving or pointing arm
          <>
            <rect
              x="40"
              y="110"
              width="30"
              height="15"
              rx="7.5"
              fill="url(#body-gradient)"
              transform="rotate(-30 55 117.5)"
            />
            <circle cx="38" cy="107" r="8" fill="url(#body-gradient)" />
            <rect
              x="130"
              y="120"
              width="30"
              height="15"
              rx="7.5"
              fill="url(#body-gradient)"
            />
            <circle cx="162" cy="127.5" r="8" fill="url(#body-gradient)" />
          </>
        ) : state === "celebrating" ? (
          // Arms raised
          <>
            <rect
              x="40"
              y="95"
              width="30"
              height="15"
              rx="7.5"
              fill="url(#body-gradient)"
              transform="rotate(-60 55 102.5)"
            />
            <circle cx="43" cy="92" r="8" fill="url(#body-gradient)" />
            <rect
              x="130"
              y="95"
              width="30"
              height="15"
              rx="7.5"
              fill="url(#body-gradient)"
              transform="rotate(60 145 102.5)"
            />
            <circle cx="157" cy="92" r="8" fill="url(#body-gradient)" />
          </>
        ) : (
          // Normal arms
          <>
            <rect
              x="40"
              y="120"
              width="30"
              height="15"
              rx="7.5"
              fill="url(#body-gradient)"
            />
            <circle cx="38" cy="127.5" r="8" fill="url(#body-gradient)" />
            <rect
              x="130"
              y="120"
              width="30"
              height="15"
              rx="7.5"
              fill="url(#body-gradient)"
            />
            <circle cx="162" cy="127.5" r="8" fill="url(#body-gradient)" />
          </>
        )}

        {/* Base/Legs */}
        <ellipse
          cx="85"
          cy="175"
          rx="12"
          ry="15"
          fill="url(#body-gradient)"
        />
        <ellipse
          cx="115"
          cy="175"
          rx="12"
          ry="15"
          fill="url(#body-gradient)"
        />

        {/* Confetti for celebrating state */}
        {state === "celebrating" && (
          <>
            <rect x="50" y="50" width="6" height="6" fill="#667EEA" rx="1">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; -10 40; -20 80"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </rect>
            <circle cx="150" cy="60" r="3" fill="#F97316">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 15 35; 30 70"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
            <rect x="130" y="45" width="5" height="5" fill="#22C55E" rx="1">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 8 45; 16 90"
                dur="1.6s"
                repeatCount="indefinite"
              />
            </rect>
            <circle cx="70" cy="55" r="3" fill="#EC4899">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; -12 38; -24 76"
                dur="1.4s"
                repeatCount="indefinite"
              />
            </circle>
          </>
        )}

        {/* Thinking symbols */}
        {state === "thinking" && (
          <>
            <text
              x="140"
              y="75"
              fill="#A855F7"
              fontSize="20"
              fontFamily="monospace"
              opacity="0.7"
            >
              {"</>"}
            </text>
            <text
              x="145"
              y="100"
              fill="#667EEA"
              fontSize="16"
              fontFamily="monospace"
              opacity="0.6"
            >
              {"{}"}
            </text>
          </>
        )}

        {/* Gradients */}
        <defs>
          <linearGradient
            id="body-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#667EEA" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <linearGradient
            id="core-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
