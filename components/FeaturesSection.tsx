"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  Target,
  Globe,
  Briefcase,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

const features = [
  {
    title: "Turn Code into Stories",
    description:
      "AI analyzes your repos and generates professional STAR stories for interviews. No more struggling to explain your projects.",
    icon: MessageSquare,
    gradient: "linear-gradient(135deg, #667EEA 0%, #A855F7 100%)",
    color: "#667EEA",
    size: "large",
  },
  {
    title: "Practice Makes Perfect",
    description:
      "Mock interviews tailored to your projects. Build confidence before the real thing.",
    icon: Briefcase,
    gradient: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
    color: "#F97316",
    size: "tall",
  },
  {
    title: "Identify Skill Gaps",
    description:
      "See what's missing and get a personalized roadmap to level up your skills.",
    icon: Target,
    gradient: "linear-gradient(135deg, #22C55E 0%, #14B8A6 100%)",
    color: "#22C55E",
    size: "small",
  },
  {
    title: "Beautiful Portfolio",
    description:
      "Auto-generated portfolio site ready to share. Deployed in seconds.",
    icon: Globe,
    gradient: "linear-gradient(135deg, #14B8A6 0%, #667EEA 100%)",
    color: "#14B8A6",
    size: "small",
  },
  {
    title: "Match to Real Jobs",
    description:
      "Compare your skills against actual job descriptions and see where you stand.",
    icon: TrendingUp,
    gradient: "linear-gradient(135deg, #A855F7 0%, #EC4899 100%)",
    color: "#A855F7",
    size: "small",
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative rounded-3xl overflow-hidden cursor-pointer group ${sizeClasses[feature.size as keyof typeof sizeClasses]} min-h-[280px]`}
    >
      {/* Card background with gradient border effect */}
      <div
        className="absolute inset-0 rounded-3xl p-[2px]"
        style={{
          background: isHovered ? feature.gradient : "transparent",
          transition: "all 0.3s ease",
        }}
      >
        <div className="w-full h-full bg-white rounded-3xl" />
      </div>

      {/* Content container */}
      <div className="relative h-full flex flex-col p-8 z-10">
        {/* Icon with gradient background */}
        <motion.div
          className="mb-6 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: feature.gradient,
            boxShadow: `0 8px 24px -8px ${feature.color}60`,
          }}
          animate={{
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 5 : 0,
          }}
          transition={{ duration: 0.3, type: "spring", bounce: 0.6 }}
        >
          <Icon size={32} style={{ color: "white" }} strokeWidth={2} />
        </motion.div>

        {/* Title */}
        <h3
          className="text-2xl font-bold font-display mb-3"
          style={{
            color: "oklch(0.21 0.007 240)",
          }}
        >
          {feature.title}
        </h3>

        {/* Description */}
        <p
          className="text-base leading-relaxed"
          style={{
            color: "oklch(0.56 0.014 240)",
          }}
        >
          {feature.description}
        </p>

        {/* Hover sparkle effect */}
        <motion.div
          className="absolute top-4 right-4"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          <Sparkles size={20} style={{ color: feature.color }} />
        </motion.div>

        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${feature.color} 1.5px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 px-6 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "oklch(0.99 0.002 240)",
        }}
      />

      {/* Subtle gradient orbs in background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "oklch(0.63 0.24 240)" }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "oklch(0.64 0.26 290)" }} />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{
              background: "oklch(1 0 0 / 0.8)",
              border: "1.5px solid oklch(0.64 0.26 290 / 0.2)",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Sparkles size={16} style={{ color: "oklch(0.64 0.26 290)" }} />
            <span
              className="text-sm font-semibold"
              style={{ color: "oklch(0.54 0.24 240)" }}
            >
              Powerful Features
            </span>
          </motion.div>

          <h2
            className="text-5xl lg:text-6xl font-bold font-display mb-6"
            style={{
              color: "oklch(0.21 0.007 240)",
            }}
          >
            Everything you need to{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.63 0.24 240) 0%, oklch(0.64 0.26 290) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              stand out
            </span>
          </h2>
          <p
            className="text-xl max-w-[700px] mx-auto"
            style={{
              color: "oklch(0.56 0.014 240)",
              lineHeight: "1.6",
            }}
          >
            Turn your GitHub into your greatest career asset with AI-powered
            tools designed for developers
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
