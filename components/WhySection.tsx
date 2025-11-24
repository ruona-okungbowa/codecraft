"use client";

import { Newsreader, Sansation } from "next/font/google";
import Link from "next/link";
import { motion } from "framer-motion";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

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
          className="bg-gray-900 text-white py-20 px-8 md:px-16 flex flex-col justify-center"
        >
          <div className="max-w-xl mx-auto w-full">
            <h2
              className={`text-5xl font-extrabold mb-12 text-red-400 ${newsreader.className}`}
            >
              The Problem
            </h2>
            <div className="space-y-8">
              {problems.map((problem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-4 group"
                >
                  <span className="text-3xl shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                    ❌
                  </span>
                  <p
                    className={`text-lg leading-relaxed text-gray-300 ${sansation.className}`}
                  >
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
          className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20 px-8 md:px-16 flex flex-col justify-center"
        >
          <div className="max-w-xl mx-auto w-full">
            <h2
              className={`text-5xl font-extrabold mb-12 text-green-600 ${newsreader.className}`}
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
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-4 group"
                >
                  <span className="text-3xl shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                    ✅
                  </span>
                  <p
                    className={`text-lg leading-relaxed text-gray-800 ${sansation.className}`}
                  >
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
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-200"
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
