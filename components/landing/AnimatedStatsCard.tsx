"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface AnimatedStatsCardProps {
  value: number;
  label: string;
  suffix?: string;
  color: "primary" | "growth" | "energy" | "joy";
}

export default function AnimatedStatsCard({
  value,
  label,
  suffix = "",
  color,
}: AnimatedStatsCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  const colorClasses = {
    primary:
      "from-primary-200 to-primary-300 border-primary-400 text-primary-800",
    growth: "from-growth-200 to-growth-300 border-growth-400 text-growth-800",
    energy: "from-energy-200 to-energy-300 border-energy-400 text-energy-800",
    joy: "from-joy-200 to-joy-300 border-joy-400 text-joy-800",
  };

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05, rotate: 2 }}
      className={`text-center p-6 bg-linear-to-br ${colorClasses[color]} rounded-2xl border-3 shadow-xl`}
    >
      <motion.div
        className="text-4xl md:text-5xl font-bold mb-2"
        animate={isInView ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {count}
        {suffix}
      </motion.div>
      <div className="text-sm font-bold opacity-80">{label}</div>
    </motion.div>
  );
}
