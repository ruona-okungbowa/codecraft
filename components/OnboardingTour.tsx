"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    target: "dashboard-score",
    title: "Your Portfolio Score",
    description:
      "This is your overall portfolio score based on project quality, documentation, and technical diversity. Click to see detailed breakdown.",
    position: "bottom",
  },
  {
    target: "dashboard-actions",
    title: "Quick Actions",
    description:
      "Access key features: match your skills to jobs, get project recommendations, and practice interviews.",
    position: "top",
  },
  {
    target: "sidebar-projects",
    title: "Your Projects",
    description:
      "Sync your GitHub repositories and generate professional content for each project.",
    position: "right",
  },
  {
    target: "sidebar-job-match",
    title: "Job Match Analyser",
    description:
      "Paste job descriptions to see how your skills match and get personalised learning paths.",
    position: "right",
  },
  {
    target: "sidebar-mock-interview",
    title: "Mock Interviews",
    description:
      "Practice with AI-powered interviews tailored to your target role and skill level.",
    position: "right",
  },
];

export default function OnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("onboarding-completed");
    }
    return false;
  });

  useEffect(() => {
    // Check if user has completed tour
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem("onboarding-completed");

      if (!completed) {
        // Small delay to let page render
        setTimeout(() => setIsActive(true), 1000);
      }
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem("onboarding-completed", "true");
    setIsActive(false);
    setHasCompletedTour(true);
  };

  const skipTour = () => {
    completeTour();
  };

  if (!isActive || hasCompletedTour) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-9998" />

      {/* Tour Card */}
      <div className="fixed inset-0 z-9999 pointer-events-none">
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <div className="pointer-events-auto bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-[#4c96e1]">
                    Step {currentStep + 1} of {tourSteps.length}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {step.title}
                </h3>
              </div>
              <button
                onClick={skipTour}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <p className="text-gray-600 mb-6">{step.description}</p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex gap-1">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      index <= currentStep ? "bg-[#4c96e1]" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={skipTour}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip tour
              </button>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 bg-[#4c96e1] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
                >
                  <span>
                    {currentStep === tourSteps.length - 1 ? "Finish" : "Next"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
