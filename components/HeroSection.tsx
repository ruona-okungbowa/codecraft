"use client";

import { Code, Rocket } from "lucide-react";
import { Londrina_Solid } from "next/font/google";

const londrina = Londrina_Solid({
  subsets: ["latin"],
  weight: ["400", "900"],
});

export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center pt-24 sm:pt-28 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden relative">
      <div className="absolute inset-0 z-[-1px] animated-bg opacity-20 -30 blur-3xl">
        <div className="w-full h-full animated-bg"></div>
      </div>

      <div
        aria-hidden="true"
        className="hidden sm:block absolute top-[10%] left-[5%] text-[#4c96e1]/10 opacity-50 select-none animate-float-1 transform-gpu"
      >
        <Code className="w-20 h-20 sm:w-32 sm:h-32 -rotate-12" />
      </div>

      <div
        aria-hidden="true"
        className="hidden sm:block absolute bottom-[5%] right-[-2%] text-orange-500/10 opacity-50 select-none animate-float-2 transform-gpu"
      >
        <Rocket className="w-24 h-24 sm:w-40 sm:h-40 rotate-6" />
      </div>

      <h1
        className={`${londrina.className} font-black uppercase leading-[0.85] sm:leading-[0.85] tracking-tighter z-0 text-gray-900 max-w-full`}
        style={{ fontSize: "clamp(2.5rem, 12vw, 16rem)" }}
      >
        <span className="block">Turn your</span>
        <span
          className="block text-transparent bg-clip-text"
          style={{
            backgroundImage:
              "linear-gradient(to right, #4c96e1, #a855f7, #f97316)",
          }}
        >
          GitHub
        </span>
        <span className="block">into your</span>
        <span className="block">next job</span>
      </h1>
    </section>
  );
}
