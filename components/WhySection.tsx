"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import CraftBot from "./CraftBot";

const problems = [
  "Hours spent Googling 'how to make GitHub look professional'",
  "Endless YouTube videos on portfolio tips you never implement",
  "Bookmarked dozens of articles you'll never read",
  "Overwhelmed by conflicting advice from every source",
  "No clear path forward or actionable steps",
  "Analysis paralysis preventing you from taking action",
];

const solutions = [
  "AI analyzes your repos and generates professional content instantly",
  "Clear, actionable insights on what to improve and why",
  "Automated portfolio generation—no design skills needed",
  "One clear path forward, no more conflicting advice",
  "STAR stories and resume bullets ready for interviews",
  "From overwhelmed to confident in minutes, not months",
];

export default function WhySection() {
  return (
    <section className="w-full">
      <div className="grid md:grid-cols-2 min-h-[600px]">
        {/* LEFT SIDE - The Problem */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-white py-20 px-8 md:px-16 flex flex-col justify-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, oklch(0.35 0.05 240) 0%, oklch(0.30 0.04 260) 100%)",
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-10" style={{ background: "oklch(0.68 0.23 50)" }} />
          <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full opacity-10" style={{ background: "oklch(0.64 0.26 290)" }} />

          <div className="max-w-xl mx-auto w-full relative z-10">
            <h2 className="text-5xl font-bold font-display mb-12" style={{ color: "oklch(0.68 0.23 50)" }}>
              The Problem
            </h2>
            <div className="space-y-8">
              {problems.map((problem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1, type: "spring", bounce: 0.3 }}
                  className="flex items-start gap-4 group"
                >
                  <span className="text-3xl shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                    ❌
                  </span>
                  <p className="text-lg leading-relaxed" style={{ color: "oklch(0.85 0.02 240)" }}>
                    {problem}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE - The Solution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-20 px-8 md:px-16 flex flex-col justify-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, oklch(0.97 0.03 150) 0%, oklch(0.97 0.03 240) 50%, oklch(0.97 0.03 290) 100%)",
          }}
        >
          {/* Mascot - Encouraging state */}
          <div className="absolute top-10 right-10 opacity-30">
            <CraftBot state="encouraging" size={120} />
          </div>

          <div className="max-w-xl mx-auto w-full relative z-10">
            <h2
              className="text-5xl font-bold font-display mb-12"
              style={{
                background: "linear-gradient(135deg, oklch(0.63 0.23 150) 0%, oklch(0.63 0.24 180) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              The Solution
            </h2>
            <div className="space-y-8 mb-12">
              {solutions.map((solution, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1, type: "spring", bounce: 0.3 }}
                  className="flex items-start gap-4 group"
                >
                  <span className="text-3xl shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                    ✅
                  </span>
                  <p className="text-lg leading-relaxed" style={{ color: "oklch(0.28 0.009 240)" }}>
                    {solution}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 rounded-xl text-white font-semibold text-lg"
                style={{
                  background: "linear-gradient(135deg, oklch(0.63 0.23 150) 0%, oklch(0.63 0.24 180) 100%)",
                  boxShadow: "0 10px 40px -10px oklch(0.63 0.23 150 / 0.4)",
                }}
              >
                <Link href="/login">Get Started Free</Link>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
