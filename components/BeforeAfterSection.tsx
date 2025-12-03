"use client";

import { CheckCircle } from "lucide-react";

export default function BeforeAfterSection() {
  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute -top-1/2 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent -z-10 blur-3xl opacity-60 transform -skew-y-12"></div>

      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 mb-4">
            From Clutter to Clarity
          </h2>
          <p className="mt-4 text-lg md:text-xl font-normal leading-relaxed text-gray-600 max-w-3xl mx-auto">
            See the transformation for yourself. CodeCraft turns a standard
            GitHub profile into a compelling career narrative that hiring
            managers love.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Before */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200/50 shadow-lg relative transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="absolute -top-4 -left-4 bg-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider transform -rotate-6">
              Before
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .5 -.6 1.2 -.5 2v3.5"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Standard GitHub Repo
                </h3>
                <p className="text-gray-500">A list of projects and code.</p>
              </div>
            </div>

            <div className="space-y-3 opacity-70">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl shrink-0">❌</span>
                <p className="text-gray-600 text-sm">
                  Missing project descriptions
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl shrink-0">❌</span>
                <p className="text-gray-600 text-sm">
                  Can&apos;t explain work in interviews
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl shrink-0">❌</span>
                <p className="text-gray-600 text-sm">Generic resume bullets</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">
                  Portfolio Score:
                </span>
                <span className="text-2xl font-bold text-red-500">42%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Rank: C</p>
            </div>
          </div>

          {/* After */}
          <div className="bg-white p-8 rounded-2xl border border-[#4c96e1]/50 shadow-2xl shadow-[#4c96e1]/20 relative transition-all duration-300 hover:shadow-[#4c96e1]/30 hover:scale-105">
            <div className="absolute -top-4 -left-4 bg-[#4c96e1] text-white text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider transform -rotate-6">
              After
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#4c96e1]/10 text-[#4c96e1] flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  CodeCraft Portfolio
                </h3>
                <p className="text-[#4c96e1]">
                  A powerful story of your skills.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <p className="text-gray-700 text-sm">
                  AI-generated project descriptions
                </p>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <p className="text-gray-700 text-sm">
                  Clear STAR stories for interviews
                </p>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <p className="text-gray-700 text-sm">
                  Visualized skills &amp; contributions
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">
                  Portfolio Score:
                </span>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4c96e1] via-green-500 to-yellow-500">
                  92%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Rank: A+</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-4xl font-bold text-blue-600 mb-2">+35</p>
            <p className="text-gray-600">Average Score Improvement</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-4xl font-bold text-green-600 mb-2">3x</p>
            <p className="text-gray-600">More Interview Callbacks</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-4xl font-bold text-purple-600 mb-2">5 min</p>
            <p className="text-gray-600">To Generate All Content</p>
          </div>
        </div>
      </div>
    </section>
  );
}
