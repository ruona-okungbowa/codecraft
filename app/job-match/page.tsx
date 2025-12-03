"use client";

import { useState } from "react";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import MobileNav from "@/components/MobileNav";
import Link from "next/link";

interface JobMatchResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: Array<{
    skill: string;
    priority: "high" | "medium" | "low";
  }>;
  bonusSkills: string[];
  recommendations: Array<{
    title: string;
    description: string;
  }>;
  summary: string;
}

export default function JobMatchPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analysis/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze job match");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
    } finally {
      setAnalyzing(false);
    }
  }

  function handleReset() {
    setJobDescription("");
    setResult(null);
    setError(null);
  }

  function getMatchLabel(percentage: number) {
    if (percentage >= 80) return "Strong Match";
    if (percentage >= 60) return "Good Match";
    if (percentage >= 40) return "Fair Match";
    return "Needs Improvement";
  }

  function getMatchColor(percentage: number) {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-[#4c96e1]";
    return "text-orange-600";
  }

  function getStrokeColor(percentage: number) {
    if (percentage >= 80) return "#10b981";
    if (percentage >= 60) return "#4c96e1";
    return "#f59e0b";
  }

  return (
    <div className="flex min-h-screen bg-[#f6f7f8]">
      <MobileNav />
      <CollapsibleSidebar />

      <main className="pt-16 md:pt-0 flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto ml-0 md:ml-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 text-4xl font-black leading-tight tracking-[-0.033em]">
              Job Match Analyzer
            </h1>
            <p className="text-slate-500 text-base font-normal leading-normal">
              Paste a job description below to see how your skills stack up.
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col gap-4">
              <label className="flex flex-col w-full">
                <p className="text-slate-900 text-base font-medium leading-normal pb-2">
                  Job Description
                </p>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="form-textarea flex w-full resize-y rounded-md text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[#4c96e1]/50 border border-slate-300 bg-[#f6f7f8] min-h-36 placeholder:text-slate-400 p-4 text-base font-normal leading-normal"
                  placeholder="e.g., Senior Frontend Developer at TechCorp..."
                />
              </label>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div className="flex justify-start">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !jobDescription.trim()}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#4c96e1] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#3a7bc8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Analyzing...
                    </span>
                  ) : (
                    <span>Analyze Match</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <>
              {/* Match Score Section */}
              <div className="space-y-4">
                <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em]">
                  Your Match Score
                </h2>
                <div className="bg-white p-8 rounded-lg shadow-sm">
                  <div className="flex items-start gap-8">
                    <div className="relative size-32 shrink-0">
                      <svg
                        className="size-full -rotate-90"
                        viewBox="0 0 36 36"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          className="stroke-slate-200"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          stroke={getStrokeColor(result.matchPercentage)}
                          strokeWidth="3"
                          strokeDasharray={`${result.matchPercentage} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-slate-900">
                        {result.matchPercentage}%
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <p
                        className={`text-3xl font-bold leading-tight ${getMatchColor(result.matchPercentage)}`}
                      >
                        {getMatchLabel(result.matchPercentage)}
                      </p>
                      <p className="text-slate-500 text-base leading-relaxed">
                        {result.summary}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Comparison Section */}
              <div className="space-y-4">
                <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em]">
                  Skills Comparison
                </h2>
                <div className="space-y-4">
                  {/* Matched Skills */}
                  <div className="bg-green-500/10 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">
                      Matched Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-white text-slate-700 text-sm font-medium px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  {result.missingSkills.length > 0 && (
                    <div className="bg-red-500/10 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-red-800 mb-4">
                        Missing Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.missingSkills.map((item, index) => (
                          <span
                            key={index}
                            className="bg-white text-slate-700 text-sm font-medium px-3 py-1 rounded-full"
                          >
                            {item.skill}{" "}
                            <span
                              className={
                                item.priority === "high"
                                  ? "text-red-500 ml-1"
                                  : item.priority === "medium"
                                    ? "text-orange-500 ml-1"
                                    : "text-yellow-500 ml-1"
                              }
                            >
                              (
                              {item.priority.charAt(0).toUpperCase() +
                                item.priority.slice(1)}{" "}
                              Priority)
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bonus Skills */}
                  {result.bonusSkills.length > 0 && (
                    <div className="bg-indigo-500/10 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-indigo-800 mb-4">
                        Bonus Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.bonusSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-white text-slate-700 text-sm font-medium px-3 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations Section */}
              {result.recommendations.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em]">
                    Next Steps to Improve Your Match
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg shadow-sm"
                      >
                        <h4 className="font-bold text-slate-800">
                          {rec.title}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1">
                          {rec.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200">
                <Link
                  href="/project-recommendations"
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-11 px-5 bg-[#4c96e1] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#3a7bc8] transition-colors"
                >
                  <span>Get project recommendations</span>
                </Link>
                <button
                  onClick={handleReset}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-11 px-5 bg-slate-200 text-slate-800 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-300 transition-colors"
                >
                  <span>Try another job description</span>
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
