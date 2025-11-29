"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Github, ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.97 0.03 240) 0%, oklch(0.97 0.03 270) 50%, oklch(0.97 0.03 320) 100%)",
        }}
      />

      {/* Floating shapes decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 rounded-full opacity-20"
          style={{ background: "oklch(0.63 0.24 240)" }}
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-32 h-32 rounded-full opacity-15"
          style={{ background: "oklch(0.64 0.26 290)" }}
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-24 h-24 rounded-full opacity-20"
          style={{ background: "oklch(0.63 0.23 150)" }}
          animate={{
            y: [0, -25, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 right-10 w-16 h-16 rounded-full opacity-25"
          style={{ background: "oklch(0.68 0.23 50)" }}
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Side - Content */}
          <motion.div
            className="flex flex-col justify-center text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 mx-auto lg:mx-0 w-fit"
              style={{
                background: "oklch(1 0 0 / 0.8)",
                border: "1.5px solid oklch(0.63 0.24 240 / 0.2)",
                boxShadow: "0 4px 20px -4px oklch(0.63 0.24 240 / 0.2)",
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Sparkles
                size={16}
                style={{ color: "oklch(0.64 0.26 290)" }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: "oklch(0.28 0.009 240)" }}
              >
                Turn your GitHub into your greatest asset
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              className="font-display font-bold leading-tight mb-6 text-5xl lg:text-7xl"
              style={{
                color: "oklch(0.21 0.007 240)",
                lineHeight: "1.1",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Your GitHub{" "}
              <span
                className="relative inline-block"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.63 0.24 240) 0%, oklch(0.64 0.26 290) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                tells a story
                {/* Underline decoration */}
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.63 0.24 240) 0%, oklch(0.64 0.26 290) 100%)",
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>
              <br />
              Make it{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.68 0.23 50) 0%, oklch(0.64 0.25 340) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                interview-ready
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg lg:text-xl mb-8 mx-auto lg:mx-0 max-w-xl"
              style={{
                color: "oklch(0.45 0.013 240)",
                lineHeight: "1.6",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Transform repos into compelling STAR stories. Identify skill gaps.
              Practice interviews. Land offers. All powered by AI that
              understands your code.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 rounded-xl text-white font-semibold text-lg flex items-center gap-2 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.63 0.24 240) 0%, oklch(0.64 0.26 290) 100%)",
                  boxShadow: "0 10px 40px -10px oklch(0.54 0.24 240 / 0.4)",
                }}
              >
                <Link
                  href="/login"
                  className="flex items-center gap-2 relative z-10"
                >
                  <Github size={20} />
                  Start with GitHub
                  <motion.div
                    className="inline-block"
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ArrowRight size={20} />
                  </motion.div>
                </Link>
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all"
                style={{
                  color: "oklch(0.63 0.24 240)",
                  borderColor: "oklch(0.63 0.24 240 / 0.3)",
                  background: "oklch(1 0 0 / 0.8)",
                }}
                onClick={() => {
                  const element = document.getElementById("how-it-works");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                See how it works
              </motion.button>
            </motion.div>

            {/* Social proof / Quick stats */}
            <motion.div
              className="flex flex-wrap gap-6 mt-10 justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <div className="text-center lg:text-left">
                <div
                  className="text-2xl font-bold font-display"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.63 0.24 240) 0%, oklch(0.64 0.26 290) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  AI-Powered
                </div>
                <div
                  className="text-sm"
                  style={{ color: "oklch(0.56 0.014 240)" }}
                >
                  Story Generation
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div
                  className="text-2xl font-bold font-display"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.63 0.23 150) 0%, oklch(0.63 0.24 180) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Instant
                </div>
                <div
                  className="text-sm"
                  style={{ color: "oklch(0.56 0.014 240)" }}
                >
                  Portfolio Analysis
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div
                  className="text-2xl font-bold font-display"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.68 0.23 50) 0%, oklch(0.64 0.25 340) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Ready
                </div>
                <div
                  className="text-sm"
                  style={{ color: "oklch(0.56 0.014 240)" }}
                >
                  For Interviews
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Craft Bot Mascot */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Glow effect behind mascot */}
            <div
              className="absolute inset-0 blur-3xl opacity-30 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.63 0.24 240) 0%, oklch(0.64 0.26 290) 50%, transparent 70%)",
              }}
            />

            {/* Hero Illustration */}
            <motion.div
              className="relative"
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
                src="/landing-image.png"
                alt="Developer with GitHub, code, and growth elements"
                width={600}
                height={600}
                priority
                className="w-full h-auto drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
