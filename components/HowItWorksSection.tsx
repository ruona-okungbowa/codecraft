"use client";

import { Network, Sparkles, PartyPopper, Github } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Connect Your GitHub",
    description:
      "Securely link your account in seconds. We only need read access to public repos.",
    icon: Network,
    color: "primary",
  },
  {
    number: 2,
    title: "AI Analyzes Your Code",
    description:
      "Our engine scans projects, identifying key skills, languages, and impressive snippets.",
    icon: Sparkles,
    color: "success",
  },
  {
    number: 3,
    title: "Get Your Portfolio",
    description:
      "Receive a beautiful portfolio and tailored interview prep materials.",
    icon: PartyPopper,
    color: "warning",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 md:py-40 bg-white relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-240 h-240 rounded-full bg-gradient-to-tr from-[#4c96e1] to-orange-500/10 blur-3xl opacity-50 -z-10"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-4 lg:col-span-5 md:sticky top-32">
            <div className="flex flex-col gap-6 relative">
              <h2 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
                So simple, it feels like magic.
              </h2>
              <p className="text-lg font-normal leading-relaxed text-gray-600 max-w-sm">
                Our platform provides you with the tools to highlight your
                skills and ace technical interviews in just three steps.
              </p>
              <div
                className="mt-8 p-6 rounded-lg border transform hover:rotate-0 transition-transform duration-300"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                  borderColor: "rgba(229, 231, 235, 0.5)",
                  transform: "rotate(-2deg)",
                }}
              >
                <div className="aspect-video bg-gray-200 rounded overflow-hidden">
                  <img
                    src="/screen.png"
                    alt="Portfolio preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-3 font-medium text-center">
                  A glimpse of your future portfolio.
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-1 gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const colorMap = {
                primary: {
                  bg: "rgba(76, 150, 225, 0.1)",
                  text: "#4c96e1",
                  glow: "rgba(76, 150, 225, 0.3)",
                },
                success: {
                  bg: "rgba(34, 197, 94, 0.1)",
                  text: "#22c55e",
                  glow: "rgba(34, 197, 94, 0.3)",
                },
                warning: {
                  bg: "rgba(251, 191, 36, 0.1)",
                  text: "#fbbf24",
                  glow: "rgba(251, 191, 36, 0.3)",
                },
              };
              const colors = colorMap[step.color as keyof typeof colorMap];

              return (
                <div
                  key={index}
                  className="group flex flex-col sm:flex-row items-start gap-8 p-8 rounded-lg backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.9)";
                    e.currentTarget.style.boxShadow = `0 20px 40px -10px ${colors.glow}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.5)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <div
                    className="flex items-center justify-center size-20 rounded-full shrink-0 relative"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    <Icon
                      className={`w-10 h-10 transition-all duration-500 ${
                        step.number === 1
                          ? "group-hover:rotate-180"
                          : step.number === 2
                            ? "group-hover:animate-pulse group-hover:scale-110"
                            : "group-hover:animate-bounce"
                      }`}
                    />
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow-md">
                        <Github className="w-5 h-5 text-gray-800" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <p
                      className="text-sm font-bold uppercase tracking-wider"
                      style={{ color: colors.text }}
                    >
                      Step {step.number}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-base text-gray-600 mt-1 max-w-md leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
