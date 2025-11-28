"use client";

import { useState } from "react";
import { Newsreader, Sansation } from "next/font/google";
import { motion } from "framer-motion";
import {
  Loader2,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Briefcase,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

interface MatchResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  summary: string;
}

export default function JobMatchPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
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
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setAnalyzing(false);
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getMatchBgColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100";
    if (percentage >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getMatchLabel = (percentage: number) => {
    if (percentage >= 80) return "Excellent Match";
    if (percentage >= 60) return "Good Match";
    if (percentage >= 40) return "Fair Match";
    return "Needs Improvement";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="ml-[72px] flex-1">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-10 py-6">
            <h1
              className={`text-[28px] font-bold text-black ${newsreader.className}`}
            >
              Job Match Analysis
            </h1>
            <p className={`text-sm text-black mt-1 ${sansation.className}`}>
              Analyze how well your portfolio matches a job description
            </p>
          </div>
        </header>

        <main className="px-10 py-8 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Briefcase size={24} className="text-blue-600" />
                </div>
                <h2
                  className={`text-xl font-bold text-gray-900 ${newsreader.className}`}
                >
                  Job Description
                </h2>
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here...

Example:
We are looking for a Senior Frontend Developer with 5+ years of experience in React, TypeScript, and Next.js. You will be responsible for building scalable web applications using modern frameworks and best practices.

Required Skills:
- React, TypeScript, Next.js
- RESTful APIs
- Git, CI/CD
- Responsive design"
                className="w-full h-[400px] text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              />

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="text-red-600 shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={analyzing || !jobDescription.trim()}
                className="w-full mt-6 inline-flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Analyzing Match...
                  </>
                ) : (
                  <>
                    <Target size={20} />
                    Analyze Job Match
                  </>
                )}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-8"
            >
              {!result ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Target size={40} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Analysis Yet
                  </h3>
                  <p className="text-black max-w-sm">
                    Paste a job description and click &quot;Analyze Job
                    Match&quot; to see how well your portfolio matches the
                    requirements.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center pb-6 border-b border-gray-200">
                    <div
                      className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getMatchBgColor(result.matchPercentage)} mb-4`}
                    >
                      <span
                        className={`text-4xl font-bold ${getMatchColor(result.matchPercentage)}`}
                      >
                        {result.matchPercentage}%
                      </span>
                    </div>
                    <h3
                      className={`text-2xl font-bold ${getMatchColor(result.matchPercentage)} mb-2`}
                    >
                      {getMatchLabel(result.matchPercentage)}
                    </h3>
                    <p className="text-black">{result.summary}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle size={20} className="text-green-600" />
                      <h4 className="font-semibold text-gray-900">
                        Matched Skills ({result.matchedSkills.length})
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {result.missingSkills.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <XCircle size={20} className="text-red-600" />
                        <h4 className="font-semibold text-gray-900">
                          Missing Skills ({result.missingSkills.length})
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.missingSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.recommendations.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={20} className="text-blue-600" />
                        <h4 className="font-semibold text-gray-900">
                          Recommendations
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-gray-700"
                          >
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
