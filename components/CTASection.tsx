"use client";

import { motion } from "framer-motion";
import { Newsreader, Sansation } from "next/font/google";
import Link from "next/link";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

export default function CTASection() {
  return (
    <section
      className="w-full py-20 px-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(to right, #7DA1F0FF, #87d498)",
      }}
    >
      {/* Subtle Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Content */}
      <div className="max-w-[900px] mx-auto text-center relative z-10">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`text-4xl md:text-5xl font-extrabold text-white mb-6 ${newsreader.className}`}
        >
          Ready to turn your GitHub into job offers?
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`text-lg md:text-xl text-blue-100 max-w-[700px] mx-auto mb-8 ${sansation.className}`}
        >
          Join hundreds of developers who stopped underselling their work and
          started landing interviews.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white text-blue-600 font-bold px-10 py-5 rounded-lg text-xl shadow-2xl hover:bg-gray-100 hover:shadow-3xl transition-all duration-200"
          >
            <Link href="/login">Get Started Free</Link>
          </motion.button>
        </motion.div>

        {/* Fine Print */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className={`text-sm text-blue-200 mt-4 ${sansation.className}`}
        >
          No credit card required • Takes ~30 minutes • Free forever
        </motion.p>
      </div>
    </section>
  );
}
