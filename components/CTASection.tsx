"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import CraftBot from "./CraftBot";

export default function CTASection() {
  return (
    <section
      className="w-full py-24 px-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, oklch(0.63 0.24 240) 0%, oklch(0.64 0.26 290) 50%, oklch(0.68 0.23 50) 100%)",
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

      {/* Floating Mascot - Celebrating state */}
      <div className="absolute top-10 left-10 opacity-20 hidden lg:block">
        <CraftBot state="celebrating" size={150} />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20 hidden lg:block">
        <CraftBot state="celebrating" size={120} />
      </div>

      {/* Content */}
      <div className="max-w-[900px] mx-auto text-center relative z-10">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold font-display text-white mb-6"
        >
          Ready to turn your GitHub into job offers?
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl max-w-[700px] mx-auto mb-10"
          style={{ color: "oklch(0.95 0.02 240)" }}
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-5 rounded-xl font-bold text-xl relative overflow-hidden group"
            style={{
              background: "oklch(1 0 0)",
              color: "oklch(0.63 0.24 240)",
              boxShadow: "0 20px 60px -10px oklch(0 0 0 / 0.3)",
            }}
          >
            <Link href="/login" className="relative z-10">
              Get Started Free
            </Link>
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
          </motion.button>
        </motion.div>

        {/* Fine Print */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-sm mt-6"
          style={{ color: "oklch(0.90 0.02 240)" }}
        >
          No credit card required • Takes ~30 minutes • Free forever
        </motion.p>
      </div>
    </section>
  );
}
