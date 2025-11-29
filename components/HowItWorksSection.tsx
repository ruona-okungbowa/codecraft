"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon, Sparkles, BarChart3, Rocket } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import CraftBot from "./CraftBot";

const steps = [
  {
    number: 1,
    title: "Connect Your GitHub",
    description:
      "One click, zero manual entry. We securely connect to your GitHub account and pull in all your public repositories. No forms to fill out, no copy-pasting required.",
    icon: LinkIcon,
    color: "oklch(0.63 0.24 240)", // Primary Blue
    screenshot: "/landing-image.png",
  },
  {
    number: 2,
    title: "AI Analyzes Your Work",
    description:
      "Our AI reviews your repos, commit history, tech stack, and project complexity. We identify patterns, extract key achievements, and understand what makes your work valuable.",
    icon: Sparkles,
    color: "oklch(0.64 0.26 290)", // Craft Purple
    screenshot: "/landing-image.png",
  },
  {
    number: 3,
    title: "Get Portfolio & Insights",
    description:
      "Receive a professional portfolio website, skill gap analysis, AI-generated resume content, and personalized project recommendations. Everything you need in one place.",
    icon: BarChart3,
    color: "oklch(0.63 0.23 150)", // Growth Green
    screenshot: "/landing-image.png",
  },
  {
    number: 4,
    title: "Practice & Land Offers",
    description:
      "Use our mock interview tool to practice explaining your projects. Match your portfolio against real job descriptions. Walk into interviews knowing exactly what to say.",
    icon: Rocket,
    color: "oklch(0.68 0.23 50)", // Energy Orange
    screenshot: "/landing-image.png",
  },
];

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const currentStep = steps[activeStep];
  const Icon = currentStep.icon;

  return (
    <section
      id="how-it-works"
      className="py-24 px-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, oklch(0.97 0.03 240) 0%, oklch(0.97 0.03 270) 50%, oklch(0.97 0.03 320) 100%)",
      }}
    >
      {/* Floating shapes decoration */}
      <div className="absolute top-10 right-10 opacity-20">
        <CraftBot state="guiding" size={150} />
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            className="text-5xl lg:text-6xl font-bold font-display mb-4"
            style={{
              background: "linear-gradient(135deg, oklch(0.63 0.24 240) 0%, oklch(0.64 0.26 290) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>
          <motion.p
            className="text-xl"
            style={{ color: "oklch(0.45 0.013 240)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Get interview-ready in 4 simple steps
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {steps.map((step, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setActiveStep(index);
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 10000); // Resume after 10s
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeStep === index
                  ? "text-white shadow-lg"
                  : "text-gray-600 hover:shadow-md"
              }`}
              style={{
                backgroundColor: activeStep === index ? step.color : "oklch(1 0 0 / 0.9)",
                border: activeStep === index ? "none" : `2px solid ${step.color}`,
              }}
            >
              Step {step.number}
            </motion.button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
            className="grid md:grid-cols-2 gap-12 items-center rounded-3xl p-8 md:p-12"
            style={{
              background: "oklch(1 0 0 / 0.7)",
              backdropFilter: "blur(20px)",
              border: "1px solid oklch(0.63 0.24 240 / 0.1)",
            }}
          >
            <div>
              <motion.div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: `linear-gradient(135deg, ${currentStep.color} 0%, ${currentStep.color} 100%)`,
                  opacity: 0.15,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              >
                <Icon size={40} style={{ color: currentStep.color }} />
              </motion.div>

              <h3 className="text-4xl font-bold font-display mb-4" style={{ color: "oklch(0.21 0.007 240)" }}>
                {currentStep.title}
              </h3>

              <p className="text-lg leading-relaxed mb-6" style={{ color: "oklch(0.45 0.013 240)" }}>
                {currentStep.description}
              </p>

              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className="h-1 flex-1 rounded-full bg-gray-200 overflow-hidden"
                  >
                    {index === activeStep && !isPaused && (
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 5, ease: "linear" }}
                        className="h-full"
                        style={{ backgroundColor: currentStep.color }}
                      />
                    )}
                    {index === activeStep && isPaused && (
                      <div
                        className="h-full w-full"
                        style={{ backgroundColor: currentStep.color }}
                      />
                    )}
                    {index < activeStep && (
                      <div
                        className="h-full w-full"
                        style={{ backgroundColor: steps[index].color }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div
                className="rounded-2xl overflow-hidden shadow-2xl border-4"
                style={{ borderColor: currentStep.color }}
              >
                <Image
                  src={currentStep.screenshot}
                  alt={currentStep.title}
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-xl text-white font-semibold text-lg"
            style={{
              background: "linear-gradient(135deg, oklch(0.63 0.24 240) 0%, oklch(0.64 0.26 290) 100%)",
              boxShadow: "0 10px 40px -10px oklch(0.54 0.24 240 / 0.4)",
            }}
          >
            <Link href="/login">Get Started Free</Link>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
