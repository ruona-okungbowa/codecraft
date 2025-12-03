"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Briefcase, Mic, Folder } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ProjectRow } from "@/types";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import MobileNav from "@/components/MobileNav";
import OnboardingTour from "@/components/OnboardingTour";

interface PortfolioScore {
  overallScore: number;
  rank?: string;
  projectQualityScore: number;
  techDiversityScore: number;
  documentationScore: number;
  consistencyScore: number;
  professionalismScore?: number;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [portfolioScore, setPortfolioScore] = useState<PortfolioScore | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("there");

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw new Error("Authentication failed. Please log in again.");
        }

        if (user) {
          setUserName(
            user.user_metadata?.name?.split(" ")[0] ||
              user.email?.split("@")[0] ||
              "there"
          );
        }

        const [projectsRes, scoreRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/analysis/portfolio-score"),
        ]);

        if (!projectsRes.ok) {
          const projectsError = await projectsRes.json().catch(() => ({}));
          console.error("Failed to fetch projects:", projectsError);
        } else {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.projects || []);
        }

        if (!scoreRes.ok) {
          const scoreError = await scoreRes.json().catch(() => ({}));
          console.error("Failed to fetch portfolio score:", scoreError);
        } else {
          const scoreData = await scoreRes.json();
          setPortfolioScore(scoreData);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data. Please try refreshing the page.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const score = portfolioScore?.overallScore || 0;
  const rank = portfolioScore?.rank || "C";

  // Convert 0-100 scores to 0-10 scale for display
  const projectQualityDisplay = Math.round(
    (portfolioScore?.projectQualityScore || 0) / 10
  );
  const documentationDisplay = Math.round(
    (portfolioScore?.documentationScore || 0) / 10
  );
  const techDiversityDisplay = Math.round(
    (portfolioScore?.techDiversityScore || 0) / 10
  );
  const consistencyDisplay = Math.round(
    (portfolioScore?.consistencyScore || 0) / 10
  );
  const professionalismDisplay = Math.round(
    (portfolioScore?.professionalismScore || 0) / 10
  );

  const getScoreLabel = (score: number): string => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Work";
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 85)
      return "Your portfolio is in great shape and ready to impress recruiters!";
    if (score >= 70)
      return "Your portfolio is good, but there's room for improvement.";
    if (score >= 50)
      return "Your portfolio needs some work to be interview-ready.";
    return "Focus on building quality projects and documentation.";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f6f7f8]">
        <MobileNav />
        <CollapsibleSidebar />
        <main className="pt-16 md:pt-0 ml-0 md:ml-20 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 sm:mb-8 lg:mb-10">
              <div className="h-10 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="bg-white p-8 rounded-xl shadow-sm animate-pulse">
                  <div className="flex items-center gap-8">
                    <div className="w-48 h-48 rounded-full bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white p-6 rounded-xl shadow-sm animate-pulse"
                    >
                      <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-4"></div>
                      <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-10 bg-gray-200 rounded w-16"></div>
                    <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f6f7f8]">
        <MobileNav />
        <CollapsibleSidebar />
        <main className="pt-16 md:pt-0 ml-0 md:ml-20 flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <div className="text-red-500 text-4xl sm:text-5xl mb-4">⚠️</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#4c96e1] text-white rounded-lg hover:bg-[#3a7bc8] hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base"
            >
              Refresh Page
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f6f7f8]">
      <MobileNav />
      <OnboardingTour />
      <CollapsibleSidebar />

      {/* Main Content */}
      <main className="pt-16 md:pt-0 ml-0 md:ml-20 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Welcome */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Welcome back, {userName}! 👋
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Portfolio Score Card */}
              <div
                id="dashboard-score"
                className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row items-center gap-6 sm:gap-8"
              >
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center shrink-0">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      className="text-gray-200"
                      cx="60"
                      cy="60"
                      fill="none"
                      r="54"
                      strokeWidth="12"
                      stroke="currentColor"
                    ></circle>
                    <circle
                      cx="60"
                      cy="60"
                      fill="none"
                      r="54"
                      strokeWidth="12"
                      strokeDasharray="339.29"
                      strokeDashoffset={339.29 - (339.29 * score) / 100}
                      strokeLinecap="round"
                      stroke="#4c96e1"
                      style={{
                        transition: "stroke-dashoffset 1.5s ease-out",
                      }}
                    ></circle>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#4c96e1]">
                      {loading ? "--" : Math.round(score)}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-gray-600">
                      out of 100
                    </span>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left w-full">
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-3 mb-3">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {getScoreLabel(score)} Portfolio Score!
                    </h3>
                    <span className="px-3 py-1 bg-[#4c96e1]/10 text-[#4c96e1] rounded-full text-sm font-bold">
                      Rank: {rank}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 sm:mb-6 max-w-sm mx-auto md:mx-0 text-sm sm:text-base">
                    {getScoreMessage(score)}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <span className="w-3 h-3 rounded-full bg-[#4c96e1] shrink-0"></span>
                      <span className="text-xs sm:text-sm text-gray-700">
                        Project Quality: {projectQualityDisplay}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <span className="w-3 h-3 rounded-full bg-green-500 shrink-0"></span>
                      <span className="text-xs sm:text-sm text-gray-700">
                        Documentation: {documentationDisplay}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0"></span>
                      <span className="text-xs sm:text-sm text-gray-700">
                        Tech Diversity: {techDiversityDisplay}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <span className="w-3 h-3 rounded-full bg-yellow-500 shrink-0"></span>
                      <span className="text-xs sm:text-sm text-gray-700">
                        Consistency: {consistencyDisplay}/10
                      </span>
                    </div>
                    {professionalismDisplay > 0 && (
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <span className="w-3 h-3 rounded-full bg-pink-500 shrink-0"></span>
                        <span className="text-xs sm:text-sm text-gray-700">
                          Professionalism: {professionalismDisplay}/10
                        </span>
                      </div>
                    )}
                  </div>
                  <Link
                    href="/portfolio-score/detailed"
                    className="inline-flex items-center gap-1 font-semibold text-[#4c96e1] hover:text-[#3a7bc8] transition-colors text-sm sm:text-base"
                  >
                    View Detailed Breakdown
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div
                id="dashboard-actions"
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
              >
                <Link
                  href="/job-match"
                  className="bg-white p-5 sm:p-6 rounded-xl shadow-sm flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 hover:scale-105 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 bg-[#4c96e1]/10 group-hover:bg-[#4c96e1]/20 transition-colors">
                    <Briefcase className="w-7 h-7 sm:w-8 sm:h-8 text-[#4c96e1]" />
                  </div>
                  <h4 className="font-bold text-base sm:text-lg text-gray-900 mb-1">
                    Match to a Job
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Find roles that fit your skills.
                  </p>
                </Link>

                <Link
                  href="/project-recommendations"
                  className="bg-white p-5 sm:p-6 rounded-xl shadow-sm flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 hover:scale-105 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500/10 group-hover:bg-green-500/20 flex items-center justify-center mb-3 sm:mb-4 transition-colors">
                    <Lightbulb className="w-7 h-7 sm:w-8 sm:h-8 text-green-500" />
                  </div>
                  <h4 className="font-bold text-base sm:text-lg text-gray-900 mb-1">
                    Get Project Ideas
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Discover new project inspirations.
                  </p>
                </Link>

                <Link
                  href="/mock-interview"
                  className="bg-white p-5 sm:p-6 rounded-xl shadow-sm flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 hover:scale-105 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-yellow-500/10 group-hover:bg-yellow-500/20 flex items-center justify-center mb-3 sm:mb-4 transition-colors">
                    <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500" />
                  </div>
                  <h4 className="font-bold text-base sm:text-lg text-gray-900 mb-1">
                    Practice Interview
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Sharpen your interview skills.
                  </p>
                </Link>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1">
              <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 space-y-5 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Project Overview
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                      {loading ? "--" : projects.length}
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base mt-1">
                      Total Repositories
                    </p>
                  </div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-[#4c96e1]/10">
                    <Folder className="w-7 h-7 sm:w-8 sm:h-8 text-[#4c96e1]" />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 sm:pt-5">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                    Recently Synced Projects
                  </h4>
                  <ul className="space-y-3">
                    {loading ? (
                      <li className="text-gray-500 text-sm">Loading...</li>
                    ) : projects.length === 0 ? (
                      <li className="text-gray-500 text-sm">
                        <Link
                          href="/projects"
                          className="text-[#4c96e1] hover:underline"
                        >
                          Sync your first project →
                        </Link>
                      </li>
                    ) : (
                      projects.slice(0, 3).map((project, index) => {
                        const colors = [
                          { bg: "bg-[#4c96e1]/10", text: "text-[#4c96e1]" },
                          { bg: "bg-pink-100", text: "text-pink-600" },
                          { bg: "bg-emerald-100", text: "text-emerald-600" },
                        ];
                        const color = colors[index % 3];

                        return (
                          <li
                            key={project.id}
                            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
                          >
                            <div
                              className={`w-8 h-8 shrink-0 rounded-lg ${color.bg} ${color.text} flex items-center justify-center font-bold text-xs`}
                            >
                              {project.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate text-gray-900">
                                {project.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Synced{" "}
                                {new Date(
                                  project.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </li>
                        );
                      })
                    )}
                  </ul>
                  {projects.length > 3 && (
                    <Link
                      href="/projects"
                      className="block mt-4 text-center text-sm text-[#4c96e1] hover:text-[#3a7bc8] font-medium transition-colors"
                    >
                      View all projects →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
