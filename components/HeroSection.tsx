"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Newsreader, Sansation } from "next/font/google";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

export default function HeroSection() {
  return (
    <section
      className="min-h-screen flex items-center"
      style={{
        background: "linear-gradient(to bottom, #f9fafb, #eff6ff)",
      }}
    >
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Content */}
          <div className="flex flex-col justify-center text-center lg:text-left">
            <h1
              className={` text-black leading-tight mb-6 my-auto text-[100px] ${newsreader.className}`}
              style={{
                lineHeight: "0.8",
                maxWidth: "700px",
              }}
            >
              Your GitHub deserves better than{" "}
              <span className="text-blue-600">
                &apos;check out my repos&apos;
              </span>
            </h1>

            <p
              className={`text-gray-600 text-base mb-8 mx-auto lg:mx-0 ${sansation.className}`}
              style={{
                lineHeight: "1.3",
                maxWidth: "350px",
              }}
            >
              Transform your GitHub repos into interview-ready portfolio
              stories. Analyze skill gaps. Build confidence. Land offers.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#5568d3" }}
                whileTap={{ scale: 0.98 }}
                className="text-white font-bold px-8 py-4 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                style={{
                  backgroundColor: "#667fea",
                }}
              >
                <Link href="/login">Start with GitHub</Link>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#8a9de8" }}
                whileTap={{ scale: 0.98 }}
                className="text-white font-bold px-8 py-4 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                style={{
                  backgroundColor: "#a3b2f3",
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
            </div>
          </div>

          {/* Right Side - Visual */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full">
              <Image
                src="/landing_image.svg"
                alt="Developer illustration"
                width={3500}
                height={3500}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
