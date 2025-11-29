"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button, Badge } from "@/components/design-system";
import { fadeInUp, staggerContainer } from "@/lib/design-system/animations";
import { Github, Sparkles, CheckCircle, Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-linear-to-br from-primary-100 via-joy-100 to-energy-100">
      {/* Animated background elements */}
      <AnimatedBackground />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto relative z-10"
      >
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            <motion.div variants={fadeInUp}>
              <Badge
                variant="joy"
                size="lg"
                className="mb-6 shadow-xl border-2 border-joy-300"
              >
                <Sparkles size={16} />
                AI-Powered Career Growth
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="font-heading text-6xl md:text-7xl font-bold leading-[0.95] mb-6"
            >
              Turn Your GitHub Into{" "}
              <span className="relative inline-block">
                <span className="bg-linear-to-r from-primary-600 via-joy-600 to-energy-600 bg-clip-text text-transparent">
                  Interview Gold
                </span>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -right-8 -top-4"
                >
                  <Sparkles className="text-energy-500" size={32} />
                </motion.div>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-neutral-700 leading-relaxed mb-8 max-w-xl font-medium"
            >
              Stop wondering if your portfolio is good enough. CodeCraft
              analyzes your repos, generates professional content, and shows you
              exactly what to build next.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-4 mb-8"
            >
              <Button
                variant="primary"
                size="xl"
                className="shadow-2xl shadow-primary-400/50"
              >
                <Github size={20} />
                Start Free with GitHub
              </Button>
              <Button
                variant="energy"
                size="xl"
                className="shadow-2xl shadow-energy-400/50"
              >
                <Sparkles size={20} />
                See Demo
              </Button>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-6 text-sm font-semibold"
            >
              <TrustBadge
                icon={<CheckCircle size={18} />}
                text="Free forever"
              />
              <TrustBadge
                icon={<CheckCircle size={18} />}
                text="No credit card"
              />
              <TrustBadge icon={<CheckCircle size={18} />} text="2 min setup" />
            </motion.div>
          </div>

          {/* Right: 3D Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Illustration floats naturally on gradient background */}
            <div className="relative">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <Image
                  src="/landing-image.png"
                  alt="CodeCraft Hero - Developer with GitHub"
                  width={600}
                  height={600}
                  className="w-full h-auto drop-shadow-2xl"
                  priority
                />
              </motion.div>

              {/* Floating stars around illustration - more colorful */}
              <FloatingStar
                delay={0}
                top="5%"
                left="-5%"
                size={36}
                color="joy"
              />
              <FloatingStar
                delay={0.5}
                top="15%"
                right="0%"
                size={28}
                color="primary"
              />
              <FloatingStar
                delay={1}
                bottom="10%"
                left="5%"
                size={32}
                color="growth"
              />
              <FloatingStar
                delay={1.5}
                bottom="20%"
                right="-5%"
                size={24}
                color="energy"
              />
              <FloatingStar
                delay={2}
                top="50%"
                left="-8%"
                size={30}
                color="coral"
              />
              <FloatingStar
                delay={2.5}
                top="40%"
                right="-8%"
                size={26}
                color="joy"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function AnimatedBackground() {
  return (
    <>
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-linear-to-br from-joy-400 to-coral-400 rounded-full blur-3xl opacity-30"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-linear-to-br from-growth-400 to-primary-400 rounded-full blur-3xl opacity-30"
      />
      <motion.div
        animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-linear-to-br from-energy-400 to-joy-400 rounded-full blur-3xl opacity-25"
      />
    </>
  );
}

function FloatingStar({
  delay,
  top,
  bottom,
  left,
  right,
  size,
  color = "joy",
}: {
  delay: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: number;
  color?: "joy" | "primary" | "growth" | "energy" | "coral";
}) {
  const colorClasses = {
    joy: "text-joy-500 fill-joy-400",
    primary: "text-primary-500 fill-primary-400",
    growth: "text-growth-500 fill-growth-400",
    energy: "text-energy-500 fill-energy-400",
    coral: "text-coral-500 fill-coral-400",
  };

  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotate: [0, 180, 360],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
      className="absolute z-20"
      style={{ top, bottom, left, right }}
    >
      <Star className={colorClasses[color]} size={size} />
    </motion.div>
  );
}

function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-2 text-growth-700"
    >
      <span className="text-growth-500">{icon}</span>
      {text}
    </motion.div>
  );
}
