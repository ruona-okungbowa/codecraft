"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Newsreader, Sansation } from "next/font/google";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Target,
  Code,
  FileText,
  TrendingUp,
  CheckCircle,
  Lightbulb,
  Loader2,
  AlertCircle,
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

const scoreCategories = [
  {
    name: "Project Quality",
    weight: "35%",
    icon: Target,
    color: "blue",
    description: "Measures the complexity and quality of your projects",
    factors: [
      "Average complexity score across all projects",
      "Number of high-quality projects (complexity ≥ 70)",
      "Stars and forks on repositories",
      "Project size and features",
    ],
    howToImprove: [
      "Add more features to existing projects",
      "Build complex applications with multiple components",
      "Implement advanced functionality (authentication, APIs, databases)",
      "Refactor code to follow best practices",
      "Add tests and CI/CD pipelines",
    ],
  },
  {
    name: "Tech Diversity",
    weight: "25%",
    icon: Code,
    color: "purple",
    description: "Evaluates the variety of technologies you use",
    factors: [
      "Number of different programming languages",
      "Variety of frameworks and libraries",
      "Full-stack vs specialized skills",
      "Modern vs legacy technologies",
    ],
    howToImprove: [
      "Learn a new programming language",
      "Try different frameworks (React, Vue, Angular)",
      "Build projects with different tech stacks",
      "Explore backend, frontend, and mobile development",
      "Use databases, cloud services, and DevOps tools",
    ],
  },
  {
    name: "Documentation",
    weight: "20%",
    icon: FileText,
    color: "green",
    description: "Assesses how well your projects are documented",
    factors: [
      "Presence of detailed README files",
      "Quality of project descriptions",
      "GitHub profile README (+10 bonus points)",
      "Code comments and documentation",
      "Setup and usage instructions",
    ],
    howToImprove: [
      "Create a GitHub profile README (username/username repository)",
      "Write comprehensive README files for all projects",
      "Add clear project descriptions",
      "Include installation and usage instructions",
      "Add screenshots or demo videos",
      "Document API endpoints and code architecture",
    ],
  },
  {
    name: "Consistency",
    weight: "20%",
    icon: TrendingUp,
    color: "orange",
    description: "Tracks your development activity and commitment",
    factors: [
      "Recent commit activity (last 3 months)",
      "Project completion rate",
      "Regular contributions",
      "Active maintenance of repositories",
    ],
    howToImprove: [
      "Commit code regularly (at least weekly)",
      "Finish projects before starting new ones",
      "Maintain and update existing projects",
      "Contribute to open source",
      "Keep projects active with bug fixes and improvements",
    ],
  },
];

const scoreRanges = [
  {
    range: "90-100",
    label: "Excellent",
    color: "text-green-600",
    bg: "bg-green-100",
    description: "Outstanding portfolio that stands out to employers",
  },
  {
    range: "70-89",
    label: "Good",
    color: "text-blue-600",
    bg: "bg-blue-100",
    description: "Strong portfolio with room for minor improvements",
  },
  {
    range: "50-69",
    label: "Fair",
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    description: "Decent foundation but needs significant work",
  },
  {
    range: "0-49",
    label: "Needs Work",
    color: "text-red-600",
    bg: "bg-red-100",
    description: "Requires substantial improvement to be competitive",
  },
];

interface PortfolioScore {
  overallScore: number;
  projectQualityScore: number;
  techDiversityScore: number;
  documentationScore: number;
  consistencyScore: number;
  breakdown?: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

export default function PortfolioScoreImprovePage() {
  const router = useRouter();
  const [portfolioScore, setPortfolioScore] = useState<PortfolioScore | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScore() {
      try {
        const response = await fetch("/api/analysis/portfolio-score");
        if (response.ok) {
          const data = await response.json();
          setPortfolioScore(data);
        }
      } catch (error) {
        console.error("Error fetching portfolio score:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchScore();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="ml-[72px] flex-1">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-10 py-6">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
            <h1
              className={`text-[28px] font-bold text-gray-900 ${newsreader.className}`}
            >
              How to Improve Your Portfolio Score
            </h1>
            <p className={`text-sm text-gray-600 mt-1 ${sansation.className}`}>
              Understanding what makes a great developer portfolio
            </p>
          </div>
        </header>

        <main className="px-10 py-8 max-w-[1400px] mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={48} className="text-blue-600 animate-spin" />
            </div>
          ) : (
            <>
              {portfolioScore && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8"
                >
                  <h2
                    className={`text-2xl font-bold text-gray-900 mb-6 ${newsreader.className}`}
                  >
                    Your Current Scores
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {portfolioScore.overallScore}
                      </div>
                      <div className="text-sm text-gray-600">Overall</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {portfolioScore.projectQualityScore}
                      </div>
                      <div className="text-sm text-gray-600">Quality</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {portfolioScore.techDiversityScore}
                      </div>
                      <div className="text-sm text-gray-600">Diversity</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {portfolioScore.documentationScore}
                      </div>
                      <div className="text-sm text-gray-600">Documentation</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {portfolioScore.consistencyScore}
                      </div>
                      <div className="text-sm text-gray-600">Consistency</div>
                    </div>
                  </div>

                  {portfolioScore.breakdown && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                      {portfolioScore.breakdown.strengths?.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                            <CheckCircle size={18} />
                            Strengths
                          </h3>
                          <ul className="space-y-2">
                            {portfolioScore.breakdown.strengths.map(
                              (strength: string, i: number) => (
                                <li key={i} className="text-sm text-gray-700">
                                  • {strength}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {portfolioScore.breakdown.weaknesses?.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                            <AlertCircle size={18} />
                            Weaknesses
                          </h3>
                          <ul className="space-y-2">
                            {portfolioScore.breakdown.weaknesses.map(
                              (weakness: string, i: number) => (
                                <li key={i} className="text-sm text-gray-700">
                                  • {weakness}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {portfolioScore.breakdown.suggestions?.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                            <Lightbulb size={18} />
                            Suggestions
                          </h3>
                          <ul className="space-y-2">
                            {portfolioScore.breakdown.suggestions.map(
                              (suggestion: string, i: number) => (
                                <li key={i} className="text-sm text-gray-700">
                                  • {suggestion}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8"
              >
                <h2
                  className={`text-2xl font-bold text-gray-900 mb-4 ${newsreader.className}`}
                >
                  Portfolio Score Breakdown
                </h2>
                <p className="text-gray-700 mb-6">
                  Your portfolio score is calculated from four key categories,
                  each weighted differently to reflect their importance to
                  employers:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scoreCategories.map((category, index) => {
                    const Icon = category.icon;
                    return (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-10 h-10 rounded-full bg-${category.color}-100 flex items-center justify-center`}
                          >
                            <Icon
                              size={20}
                              className={`text-${category.color}-600`}
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {category.name}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {category.weight} of total score
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              <div className="space-y-6">
                {scoreCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-8"
                    >
                      <div className="flex items-start gap-4 mb-6">
                        <div
                          className={`w-12 h-12 rounded-full bg-${category.color}-100 flex items-center justify-center shrink-0`}
                        >
                          <Icon
                            size={24}
                            className={`text-${category.color}-600`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3
                              className={`text-xl font-bold text-gray-900 ${newsreader.className}`}
                            >
                              {category.name}
                            </h3>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                              {category.weight}
                            </span>
                          </div>
                          <p className="text-gray-600">
                            {category.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CheckCircle size={18} className="text-blue-600" />
                            What We Measure
                          </h4>
                          <ul className="space-y-2">
                            {category.factors.map((factor, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-gray-700 text-sm"
                              >
                                <span className="text-gray-400 mt-1">•</span>
                                <span>{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Lightbulb size={18} className="text-orange-600" />
                            How to Improve
                          </h4>
                          <ul className="space-y-2">
                            {category.howToImprove.map((tip, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-gray-700 text-sm"
                              >
                                <span className="text-orange-600 mt-1">→</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mt-8"
              >
                <h2
                  className={`text-2xl font-bold text-gray-900 mb-6 ${newsreader.className}`}
                >
                  Score Ranges
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {scoreRanges.map((range) => (
                    <div
                      key={range.range}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div
                        className={`inline-block px-3 py-1 ${range.bg} ${range.color} text-sm font-bold rounded-full mb-2`}
                      >
                        {range.range}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {range.label}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {range.description}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="flex justify-center mt-8">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md"
                >
                  Back to Dashboard
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
