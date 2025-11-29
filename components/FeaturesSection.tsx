"use client";

import { Brain, Wand2, CheckCircle2 } from "lucide-react";

const features = [
  {
    title: "AI-Powered Analysis",
    description:
      "Our AI delves deep into your code to identify your core competencies, coding patterns, and project complexity, providing a true measure of your skills.",
    icon: Brain,
    color: "primary",
  },
  {
    title: "Dynamic Portfolios",
    description:
      "Instantly generate a beautiful, interactive portfolio. Showcase your best projects with automated descriptions, tech stack highlights, and visual flair.",
    icon: Wand2,
    color: "success",
  },
  {
    title: "Targeted Interview Prep",
    description:
      "Receive custom-generated interview questions and talking points based on your own projects, ensuring you're prepared to talk confidently about your work.",
    icon: CheckCircle2,
    color: "warning",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#dbe6f31a]"
    >
      <div
        className="absolute -top-32 -left-32 rounded-full blur-3xl opacity-60"
        style={{
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, #e9d5ff 0%, #ddd6fe 50%, transparent 150%)",
          animation: "spin 20s linear infinite",
        }}
      ></div>
      <div
        className="absolute -bottom-32 -right-32 rounded-full blur-3xl opacity-60"
        style={{
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, #fef08a 0%, #fde047 30%, transparent 70%)",
          animation: "spin 25s linear infinite reverse",
        }}
      ></div>

      <div className="container mx-auto">
        <div className="text-center mb-16 relative">
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
            Your Code, Reimagined
          </h2>
          <p className="mt-4 text-lg md:text-xl font-normal leading-relaxed text-gray-600 max-w-2xl mx-auto">
            CodeCraft goes beyond just displaying your repositories. It
            intelligently analyzes, visualizes, and packages your work to catch
            the eye of top recruiters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorMap = {
              primary: {
                bg: "rgba(76, 150, 225, 0.1)",
                text: "#4c96e1",
                shadow: "rgba(76, 150, 225, 0.2)",
              },
              success: {
                bg: "rgba(34, 197, 94, 0.1)",
                text: "#22c55e",
                shadow: "rgba(34, 197, 94, 0.2)",
              },
              warning: {
                bg: "rgba(251, 191, 36, 0.1)",
                text: "#fbbf24",
                shadow: "rgba(251, 191, 36, 0.2)",
              },
            };
            const colors = colorMap[feature.color as keyof typeof colorMap];

            return (
              <div
                key={index}
                className="bg-white p-8 rounded-lg flex flex-col items-start gap-4 transition-all duration-300 transform hover:scale-[1.03] hover:-translate-y-2"
                style={{
                  boxShadow: "0 4px 6px -4px rgba(0, 0, 0, 0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 20px 25px -5px ${colors.shadow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 6px -4px rgba(0, 0, 0, 0.1)";
                }}
              >
                <div
                  className="flex items-center justify-center size-16 rounded-full"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  <Icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {feature.title}
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
