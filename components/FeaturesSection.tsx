"use client";

import { motion } from "framer-motion";
import { MessageSquare, Target, Globe, Briefcase } from "lucide-react";
import { Newsreader, Sansation } from "next/font/google";
import { useState } from "react";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

const features = [
  {
    title: "Turn Code into Stories",
    description:
      "AI analyzes your repos and generates professional STAR stories for interviews.",
    icon: MessageSquare,
    color: "#667eea",
    size: "large", // 2x2 - Top left
  },
  {
    title: "Practice & Land Offers",
    description: "Mock interviews tailored to your projects.",
    icon: Briefcase,
    color: "#f97316",
    size: "tall", // 1x2 - Top right
  },
  {
    title: "See What's Missing",
    description: "Identify skill gaps and get a roadmap to stand out.",
    icon: Target,
    color: "#22c55e",
    size: "small", // 1x1 - Bottom left
  },
  {
    title: "Build Your Portfolio",
    description: "Auto-generated portfolio site deployed to GitHub Pages.",
    icon: Globe,
    color: "#14b8a6",
    size: "small", // 1x1 - Bottom middle
  },
  {
    title: "Match to Jobs",
    description: "Compare your portfolio against real job descriptions.",
    icon: Target,
    color: "#8b5cf6",
    size: "small", // 1x1 - Bottom right
  },
];

function FeatureCard({ feature }: { feature: (typeof features)[0] }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = feature.icon;

  const sizeClasses = {
    large: "md:col-span-2 md:row-span-2",
    tall: "md:col-span-1 md:row-span-2",
    wide: "md:col-span-2 md:row-span-1",
    small: "md:col-span-1 md:row-span-1",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative rounded-3xl overflow-hidden cursor-pointer group ${sizeClasses[feature.size as keyof typeof sizeClasses]} min-h-[280px] border-2 transition-all duration-300 bg-white`}
      style={{
        borderColor: isHovered ? `${feature.color}60` : "#e5e7eb",
        boxShadow: isHovered
          ? `0 20px 40px ${feature.color}40, 0 0 0 1px ${feature.color}30`
          : "0 4px 6px rgba(0,0,0,0.05)",
      }}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${feature.color} 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Icon/Visual Content */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <motion.div
          animate={{
            scale: isHovered ? 1.15 : 1,
            rotate: isHovered ? 8 : 0,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Icon
            size={feature.size === "large" ? 120 : 80}
            style={{ color: feature.color }}
            strokeWidth={1.5}
          />
        </motion.div>
      </div>

      {/* Hover Overlay - Slide from bottom */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: isHovered ? 0 : "100%" }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
        style={{
          background: `linear-gradient(135deg, ${feature.color}f8 0%, ${feature.color}ea 100%)`,
        }}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3
            className={`text-2xl font-bold text-white mb-3 ${newsreader.className}`}
          >
            {feature.title}
          </h3>
          <p className={`text-white/95 text-base ${sansation.className}`}>
            {feature.description}
          </p>
        </motion.div>
      </motion.div>

      {/* Bottom Label with frosted glass effect */}
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: isHovered ? 0 : 1, y: isHovered ? 10 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 p-6 backdrop-blur-sm"
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0.6), transparent)",
        }}
      >
        <h3
          className={`text-xl font-bold text-gray-900 ${newsreader.className}`}
        >
          {feature.title}
        </h3>
      </motion.div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24 px-6"
      style={{ backgroundColor: "#e0e7ff" }}
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className={`text-5xl font-extrabold text-gray-900 mb-4 ${newsreader.className}`}
          >
            Features
          </h2>
          <p
            className={`text-xl text-gray-700 max-w-[700px] mx-auto ${sansation.className}`}
          >
            Everything you need to turn your GitHub into your greatest career
            asset
          </p>
        </div>

        {/* Bento Grid - Better balanced layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
