"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Code,
  Terminal,
  FileText,
  Calendar,
  Award,
  CheckCircle,
  ListChecks,
  Lightbulb,
} from "lucide-react";

interface ScoreData {
  overallScore: number;
  rank?: string;
  projectQualityScore: number;
  techDiversityScore: number;
  documentationScore: number;
  consistencyScore: number;
  professionalismScore?: number;
  breakdown: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

interface ScoreCategory {
  name: string;
  description: string;
  score: number;
  maxScore: number;
  icon: React.ReactNode;
}

export default function DetailedPortfolioScorePage() {
  const router = useRouter();
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScoreData();
  }, []);

  async function fetchScoreData() {
    try {
      const response = await fetch("/api/analysis/portfolio-score");
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio score");
      }
      const data = await response.json();
      setScoreData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Improvement";
  };

  const getScoreLabelColor = (score: number): string => {
    if (score >= 85) return "text-green-800 bg-green-100 ";
    if (score >= 70) return "text-blue-800 bg-blue-100";
    if (score >= 50) return "text-yellow-800 bg-yellow-100 ";
    return "text-red-800 bg-red-100 ";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 ">
        <CollapsibleSidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Analysing your portfolio..." />
        </div>
      </div>
    );
  }

  if (error || !scoreData) {
    return (
      <div className="flex min-h-screen bg-gray-50 ">
        <CollapsibleSidebar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              {error || "Failed to load score data"}
            </p>
            <button
              onClick={() => router.push("/portfolio-score")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categories: ScoreCategory[] = [
    {
      name: "Project Quality",
      description:
        "Substantial, original projects that solve real-world problems with technical depth.",
      score: scoreData.projectQualityScore,
      maxScore: 100,
      icon: <Code className="w-6 h-6" />,
    },
    {
      name: "Documentation",
      description:
        "Clear READMEs with setup instructions, screenshots, and project narratives.",
      score: scoreData.documentationScore,
      maxScore: 100,
      icon: <FileText className="w-6 h-6" />,
    },
    {
      name: "Technical Diversity",
      description:
        "Variety of languages, frameworks, and full-stack capabilities.",
      score: scoreData.techDiversityScore,
      maxScore: 100,
      icon: <Terminal className="w-6 h-6" />,
    },
    {
      name: "Activity & Consistency",
      description:
        "Regular commits, recent activity, and sustained project maintenance.",
      score: scoreData.consistencyScore,
      maxScore: 100,
      icon: <Calendar className="w-6 h-6" />,
    },
    ...(scoreData.professionalismScore !== undefined
      ? [
          {
            name: "Professionalism",
            description:
              "Community engagement, code organisation, and professional presentation.",
            score: scoreData.professionalismScore,
            maxScore: 100,
            icon: <Award className="w-6 h-6" />,
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 ">
      <CollapsibleSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Page Heading */}
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tight text-gray-900 ">
              Your Portfolio Score
            </h1>
            <p className="mt-2 text-base text-gray-600 ">
              Here&apos;s a detailed breakdown of your GitHub portfolio&apos;s
              readiness for interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column - Score Breakdown & Suggestions */}
            <div className="lg:col-span-2 space-y-8">
              {/* Score Breakdown Section */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm ">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 ">
                  Score Breakdown
                </h2>
                <div className="mt-6 flex flex-col gap-6">
                  {categories.map((category) => {
                    const percentage =
                      (category.score / category.maxScore) * 100;
                    return (
                      <div
                        key={category.name}
                        className="flex flex-col gap-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex flex-1 items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600  ">
                            {category.icon}
                          </div>
                          <div className="flex flex-1 flex-col justify-center">
                            <p className="text-base font-medium text-gray-900 ">
                              {category.name}
                            </p>
                            <p className="text-sm text-gray-600 ">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 sm:w-44 sm:justify-end">
                          <p className="w-20 text-right text-sm font-medium text-gray-600 ">
                            {Math.round(category.score)}/{category.maxScore} pts
                          </p>
                          <div className="h-2 flex-1 rounded-full bg-gray-200 ">
                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Improvement Suggestions Section */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm ">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 ">
                  Improvement Suggestions
                </h2>
                <div className="mt-6 flex flex-col gap-4">
                  {scoreData.breakdown.suggestions.length > 0 ? (
                    scoreData.breakdown.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-start gap-4 rounded border border-gray-200 p-4  sm:flex-row sm:items-center"
                      >
                        <div className="flex flex-1 items-start gap-4">
                          <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-blue-600 " />
                          <div className="flex flex-col">
                            <p className="font-medium text-gray-900 ">
                              {suggestion}
                            </p>
                          </div>
                        </div>
                        <div className="flex w-full items-center justify-between sm:w-auto sm:justify-end sm:gap-4">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 ">
                            Recommended
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 ">
                      Great job! No immediate improvements needed.
                    </p>
                  )}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              {(scoreData.breakdown.strengths.length > 0 ||
                scoreData.breakdown.weaknesses.length > 0) && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Strengths */}
                  {scoreData.breakdown.strengths.length > 0 && (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm ">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Strengths
                      </h3>
                      <ul className="space-y-2">
                        {scoreData.breakdown.strengths.map(
                          (strength, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-gray-700 "
                            >
                              <CheckCircle className="h-5 w-5 shrink-0 text-green-600 " />
                              <span>{strength}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {scoreData.breakdown.weaknesses.length > 0 && (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm ">
                      <h3 className="text-lg font-semibold text-gray-900  mb-4">
                        Areas to Improve
                      </h3>
                      <ul className="space-y-2">
                        {scoreData.breakdown.weaknesses.map(
                          (weakness, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-gray-700 "
                            >
                              <Lightbulb className="h-5 w-5 shrink-0 text-yellow-600 " />
                              <span>{weakness}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Overall Score & CTAs */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 flex flex-col gap-8">
                {/* Overall Score Card */}
                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                  <h3 className="text-base font-medium text-gray-600 ">
                    Overall Score
                  </h3>
                  <div className="relative my-4 flex h-40 w-40 items-center justify-center">
                    <svg
                      className="absolute inset-0 h-full w-full -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        className="stroke-current text-gray-200 "
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3"
                      />
                      <path
                        className="stroke-current text-blue-600"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeDasharray={`${scoreData.overallScore}, 100`}
                        strokeLinecap="round"
                        strokeWidth="3"
                      />
                    </svg>
                    <span className="text-5xl font-extrabold text-gray-900 ">
                      {scoreData.overallScore}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getScoreLabelColor(scoreData.overallScore)}`}
                    >
                      {getScoreLabel(scoreData.overallScore)}
                    </span>
                    {scoreData.rank && (
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        Rank: {scoreData.rank}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-sm text-gray-600 ">
                    {scoreData.overallScore >= 85
                      ? "Your portfolio is in great shape and ready to impress recruiters."
                      : scoreData.overallScore >= 70
                        ? "Your portfolio is good, but there&apos;s room for improvement."
                        : scoreData.overallScore >= 50
                          ? "Your portfolio needs some work to be interview-ready."
                          : "Focus on building quality projects and documentation."}
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push("/skill-gap")}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                  >
                    <ListChecks className="h-5 w-5" />
                    View Skill Gap Analysis
                  </button>
                  <button
                    onClick={() => router.push("/project-recommendations")}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 "
                  >
                    <Lightbulb className="h-5 w-5" />
                    Get Project Recommendations
                  </button>
                  <button
                    onClick={() => router.push("/projects")}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 "
                  >
                    <Award className="h-5 w-5" />
                    View All Projects
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
