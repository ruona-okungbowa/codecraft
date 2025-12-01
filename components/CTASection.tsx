"use client";

import Link from "next/link";
import { Terminal, CheckCircle, ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section
      id="cta"
      className="py-24 md:py-48 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <div className="absolute inset-0 z-[-1px] opacity-30 dark:opacity-40">
        <div className="w-full h-full animated-bg"></div>
      </div>

      <div
        aria-hidden="true"
        className="absolute top-10 left-10 select-none transform rotate-12 animate-float-1"
        style={{ color: "rgba(168, 85, 247, 0.2)" }}
      >
        <Terminal className="w-36 h-36" />
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-10 right-10 select-none transform -rotate-6 animate-float-2"
        style={{ color: "rgba(34, 197, 94, 0.2)" }}
      >
        <CheckCircle className="w-36 h-36" />
      </div>

      <div className="container mx-auto">
        <div
          className="max-w-4xl mx-auto flex flex-col gap-8 items-center justify-center text-center backdrop-blur-lg p-12 md:p-16 rounded-xl"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            transform: "rotate(-1deg)",
          }}
        >
          <h2 className="text-6xl md:text-7xl font-extrabold leading-tight tracking-tight text-gray-900">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl font-normal leading-relaxed text-gray-600 max-w-3xl">
            Stop letting your hard work hide in repositories. Build a portfolio
            that gets you noticed, and walk into interviews with unshakeable
            confidence.
          </p>
          <Link
            href="/login"
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-16 px-10 text-white text-lg font-bold leading-normal tracking-wide transition-all duration-300 transform hover:scale-105 mt-4 group"
            style={{
              backgroundColor: "#a855f7",
              boxShadow: "0 10px 15px -3px rgba(168, 85, 247, 0.4)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.boxShadow =
                "0 20px 25px -5px rgba(168, 85, 247, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.boxShadow =
                "0 10px 15px -3px rgba(168, 85, 247, 0.4)";
            }}
          >
            <span className="truncate transition-transform duration-300 group-hover:scale-110">
              Get Started for Free
            </span>
            <ArrowRight className="ml-2 w-6 h-6 transform transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
