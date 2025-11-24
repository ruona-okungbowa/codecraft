"use client";

import { motion } from "framer-motion";
import { Github, ArrowRight, Check, Lock, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Newsreader, Sansation } from "next/font/google";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

const benefits = [
  "AI-powered portfolio generation",
  "Skill gap analysis & recommendations",
  "Mock interview practice",
  "Live portfolio site deployment",
];

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "linear-gradient(to bottom right, #f0f9ff, #faf5ff)",
      }}
    >
      {/* Left Side - Animated Illustration */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-16 py-20 relative overflow-hidden">
        {/* Floating Animation Container */}
        <motion.div
          animate={{
            y: [-10, 10, -10],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="relative w-full max-w-[600px]"
        >
          <Image
            src="/landing_image.svg"
            alt="Developer at desk"
            width={600}
            height={600}
            className="w-full h-auto"
            priority
          />
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [-5, 5, -5],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 0.5,
          }}
          className="absolute top-32 right-32 bg-white rounded-2xl p-4 shadow-xl"
        >
          <Github size={32} className="text-gray-900" />
        </motion.div>

        {/* Welcome Text */}
        <div className="mt-12 text-center">
          <h2
            className={`text-3xl font-bold text-gray-900 mb-3 ${newsreader.className}`}
          >
            Built by developers, for developers
          </h2>
          <p className={`text-lg text-gray-600 ${sansation.className}`}>
            We know the struggle. Let&apos;s make your GitHub shine ✨
          </p>
        </div>
      </div>

      {/* Right Side - Login Card */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[480px]"
        >
          <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-12">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <Image
                src="/logo.png"
                alt="CodeCraft Logo"
                width={120}
                height={40}
              />
            </div>

            {/* Friendly Header */}
            <div className="text-center mb-10">
              <h2
                className={`text-3xl font-bold text-gray-900 mb-3 ${newsreader.className}`}
              >
                Hey there, developer! 👋
              </h2>
              <p className={`text-base text-gray-600 ${sansation.className}`}>
                Ready to turn your GitHub into your greatest career asset?
              </p>
            </div>

            {/* GitHub OAuth Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 mb-6"
              aria-label="Sign in with GitHub"
            >
              <Link
                href="/api/auth/github"
                className="flex items-center gap-3 w-full justify-center"
              >
                <Github size={24} />
                <span className="text-base">Continue with GitHub</span>
                <ArrowRight size={20} />
              </Link>
            </motion.button>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3 mb-6">
              <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
              <p className={`text-sm text-gray-700 ${sansation.className}`}>
                <strong>New here?</strong> No worries! Signing in automatically
                creates your account. Zero forms, zero hassle.
              </p>
            </div>

            {/* Benefits - Mobile Only */}
            <div className="lg:hidden space-y-3 mb-6">
              {benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-green-600" />
                  </div>
                  <span
                    className={`text-sm text-gray-700 ${sansation.className}`}
                  >
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* Trust Signal */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Lock size={14} />
              <span className={sansation.className}>
                Secure OAuth • We never access private repos
              </span>
            </div>

            {/* Privacy Note */}
            <p
              className={`text-xs text-gray-500 text-center mt-6 ${sansation.className}`}
            >
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
