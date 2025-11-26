"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon, Sparkles, BarChart3, Rocket } from "lucide-react";
import { Newsreader, Sansation } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

const steps = [
  {
    number: 1,
    title: "Connect Your GitHub",
    description:
      "One click, zero manual entry. We securely connect to your GitHub account and pull in all your public repositories. No forms to fill out, no copy-pasting required. Our secure OAuth integration ensures your data stays safe while giving us the access we need to analyze your work.",
    icon: LinkIcon,
    color: "#3b82f6",
    screenshot: "/landing_image.svg", // Placeholder
  },
  {
    number: 2,
    title: "AI Analyzes Your Work",
    description:
      "Our AI reviews your repos, commit history, tech stack, and project complexity. We identify patterns, extract key achievements, and understand what makes your work valuable. The analysis looks at code quality, project structure, documentation, and real-world impact to build a complete picture of your skills.",
    icon: Sparkles,
    color: "#a855f7",
    screenshot: "/landing_image.svg", // Placeholder
  },
  {
    number: 3,
    title: "Get Portfolio & Insights",
    description:
      "Receive a professional portfolio website (deployed to GitHub Pages), skill gap analysis, AI-generated resume content, and personalized project recommendations. Everything you need in one place. Your portfolio is automatically updated as you add new projects, keeping your professional presence fresh.",
    icon: BarChart3,
    color: "#22c55e",
    screenshot: "/landing_image.svg", // Placeholder
  },
  {
    number: 4,
    title: "Practice & Land Offers",
    description:
      "Use our mock interview tool to practice explaining your projects. Match your portfolio against real job descriptions. Walk into interviews knowing exactly what to say and where you stand. Get personalized feedback on your answers and track your improvement over time.",
    icon: Rocket,
    color: "#f97316",
    screenshot: "/landing_image.svg", // Placeholder
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
    <section id="how-it-works" className="bg-white py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className={`text-5xl font-extrabold text-gray-900 mb-4 ${newsreader.className}`}
          >
            How It Works
          </h2>
          <p className={`text-xl text-gray-600 ${sansation.className}`}>
            Get interview-ready in 4 simple steps
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveStep(index);
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 10000); // Resume after 10s
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeStep === index
                  ? "text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: activeStep === index ? step.color : undefined,
              }}
            >
              Step {step.number}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-2 gap-12 items-center bg-gray-50 rounded-3xl p-8 md:p-12"
          >
            <div>
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  backgroundColor: `${currentStep.color}20`,
                }}
              >
                <Icon size={40} style={{ color: currentStep.color }} />
              </div>

              <h3
                className={`text-4xl font-bold text-gray-900 mb-4 ${newsreader.className}`}
              >
                {currentStep.title}
              </h3>

              <p
                className={`text-lg text-gray-600 leading-relaxed mb-6 ${sansation.className}`}
              >
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
            className="bg-[#87d498] hover:bg-[#72b681] text-white font-bold px-8 py-4 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-200 mb-3"
          >
            <Link href="/login">Get Started</Link>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
