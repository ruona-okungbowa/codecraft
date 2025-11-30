"use client";

import { Github, Code, Rocket, ArrowLeft, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8"
      style={{
        background:
          "linear-gradient(135deg, #f5e6f7 0%, #fce7f3 50%, #f5e6f7 100%)",
      }}
    >
      {/* Back to Home Link */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
      >
        <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <div className="absolute inset-0 z-[-1] opacity-10 blur-3xl">
        <div className="w-full h-full animated-bg"></div>
      </div>

      <div
        aria-hidden="true"
        className="absolute top-[10%] left-[5%] text-[8rem] opacity-50 select-none animate-float-1 transform-gpu"
        style={{ color: "rgba(76, 150, 225, 0.1)" }}
      >
        <Code className="w-32 h-32 -rotate-12" />
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-[5%] right-[-2%] text-[10rem] opacity-50 select-none animate-float-2 transform-gpu"
        style={{ color: "rgba(249, 115, 22, 0.1)" }}
      >
        <Rocket className="w-40 h-40 rotate-6" />
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <header className="text-center mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-900 transition-transform duration-300 hover:scale-105"
          >
            <Image
              src="/icon-logo.png"
              alt="CodeCraft"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <h1 className="text-3xl font-bold">CodeCraft</h1>
          </Link>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-800">
            Welcome!
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Sign in with your GitHub account to continue.
          </p>
        </header>

        {/* Main login card */}
        <main className="w-full bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-lg shadow-2xl p-8 sm:p-10">
          <div className="space-y-6">
            <Link
              href="/api/auth/github"
              className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-transparent bg-[#333] py-3 px-4 text-base font-bold text-white shadow-lg hover:bg-[#24292e] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
              style={{ boxShadow: "0 10px 15px -3px rgba(51, 51, 51, 0.3)" }}
            >
              <Github className="h-6 w-6" />
              <span>Sign in with GitHub</span>
            </Link>

            {/* Quick Benefits */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/50 border border-gray-200/30">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: "rgba(76, 150, 225, 0.1)" }}
                >
                  <Zap className="w-4 h-4" style={{ color: "#4c96e1" }} />
                </div>
                <span className="text-xs font-medium text-gray-700">
                  Setup in 30s
                </span>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/50 border border-gray-200/30">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: "rgba(168, 85, 247, 0.1)" }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: "#a855f7" }} />
                </div>
                <span className="text-xs font-medium text-gray-700">
                  AI-powered
                </span>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-8 text-center">
          <p className="text-base text-gray-600">
            Don&apos;t have an account?{" "}
            <span
              className="font-bold transition-colors"
              style={{ color: "#4c96e1" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              Just Sign In{" "}
            </span>
            <br />
            An account will be created
          </p>
        </footer>
      </div>
    </div>
  );
}
