"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Briefcase, Mic, Folder, TrendingUp } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ProjectRow } from "@/types";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";

interface PortfolioScore {
  overallScore: number;
  projectQualityScore: number;
  techDiversityScore: number;
  documentationScore: number;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [portfolioScore, setPortfolioScore] = useState<PortfolioScore | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("there");
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserName(
            user.user_metadata?.name?.split(" ")[0] ||
              user.email?.split("@")[0] ||
              "there"
          );
          setUserEmail(user.email || "");
          setUserAvatar(user.user_metadata?.avatar_url || "");
        }

        const [projectsRes, scoreRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/analysis/portfolio-score"),
        ]);

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.projects || []);
        }

        if (scoreRes.ok) {
          const scoreData = await scoreRes.json();
          setPortfolioScore(scoreData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const score = portfolioScore?.overallScore || 0;
  const readmeScore = Math.round(
    (portfolioScore?.documentationScore || 0) * 10
  );
  const codeScore = Math.round((portfolioScore?.projectQualityScore || 0) * 10);
  const diversityScore = Math.round(
    (portfolioScore?.techDiversityScore || 0) * 10
  );

  return (
    <div className="flex min-h-screen bg-[#f6f7f8]">
      <CollapsibleSidebar />

      {/* Main Content */}
      <main className="ml-20 flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Welcome */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-black">
              Welcome back, {userName}! 👋
            </h2>
            <p className="text-black mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Portfolio Score Card */}
              <div className="bg-white p-8 rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-48 h-48 flex items-center justify-center">
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
                    <span
                      className="text-5xl font-extrabold"
                      style={{ color: "#4c96e1" }}
                    >
                      {loading ? "--" : Math.round(score)}
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      out of 100
                    </span>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2 text-black">
                    Excellent Portfolio Score!
                  </h3>
                  <p className="text-black mb-6 max-w-sm">
                    Your portfolio is looking strong. Keep up the great work and
                    refine your projects to reach a perfect score.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span className="text-sm">
                        README Quality: {readmeScore}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                      <span className="text-sm">
                        Code Best Practices: {codeScore}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                      <span className="text-sm">
                        Project Diversity: {diversityScore}/10
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/portfolio-score"
                    className="font-semibold hover:underline"
                    style={{ color: "#4c96e1" }}
                  >
                    View Detailed Breakdown →
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Link
                  href="/job-match"
                  className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(76, 150, 225, 0.1)" }}
                  >
                    <Briefcase
                      className="w-8 h-8"
                      style={{ color: "#4c96e1" }}
                    />
                  </div>
                  <h4 className="font-bold text-lg text-black">
                    Match to a Job
                  </h4>
                  <p className="text-sm text-black mt-1">
                    Find roles that fit your skills.
                  </p>
                </Link>

                <Link
                  href="/project-recommendations"
                  className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                    <Lightbulb className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="font-bold text-lg text-black">
                    Get Project Ideas
                  </h4>
                  <p className="text-sm text-black mt-1">
                    Discover new project inspirations.
                  </p>
                </Link>

                <Link
                  href="/mock-interview"
                  className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                    <Mic className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h4 className="font-bold text-lg text-black">
                    Practice Interview
                  </h4>
                  <p className="text-sm text-black mt-1">
                    Sharpen your interview skills.
                  </p>
                </Link>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-black">
                  Recent Activity & Updates
                </h3>
                <ul className="space-y-4">
                  {loading ? (
                    <li className="text-gray-500">Loading...</li>
                  ) : (
                    <>
                      <li className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex-shrink-0 flex items-center justify-center mt-1">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p>
                            <strong>
                              Portfolio Score: {Math.round(score)}/100
                            </strong>
                          </p>
                          <time className="text-sm text-gray-600">
                            Just now
                          </time>
                        </div>
                      </li>
                      {projects.slice(0, 3).map((project) => (
                        <li key={project.id} className="flex items-start gap-4">
                          <div
                            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mt-1"
                            style={{
                              backgroundColor: "rgba(76, 150, 225, 0.1)",
                            }}
                          >
                            <Folder
                              className="w-5 h-5"
                              style={{ color: "#4c96e1" }}
                            />
                          </div>
                          <div>
                            <p>
                              Synced project:{" "}
                              <span className="font-semibold">
                                {project.name}
                              </span>
                            </p>
                            <time className="text-sm text-gray-600">
                              {new Date(
                                project.created_at
                              ).toLocaleDateString()}
                            </time>
                          </div>
                        </li>
                      ))}
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-black">
                  Project Overview
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-extrabold text-black">
                      {loading ? "--" : projects.length}
                    </p>
                    <p className="text-black">Total Repositories</p>
                  </div>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(76, 150, 225, 0.1)" }}
                  >
                    <Folder className="w-8 h-8" style={{ color: "#4c96e1" }} />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold mb-3">
                    Recently Synced Projects
                  </h4>
                  <ul className="space-y-3">
                    {loading ? (
                      <li className="text-gray-500">Loading...</li>
                    ) : projects.length === 0 ? (
                      <li className="text-gray-500">No projects yet</li>
                    ) : (
                      projects.slice(0, 3).map((project, index) => {
                        const colors = [
                          { bg: "bg-indigo-100", text: "text-indigo-500" },
                          { bg: "bg-pink-100", text: "text-pink-500" },
                          { bg: "bg-emerald-100", text: "text-emerald-500" },
                        ];
                        const color = colors[index % 3];

                        return (
                          <li
                            key={project.id}
                            className="flex items-center gap-3"
                          >
                            <div
                              className={`w-8 h-8 flex-shrink-0 rounded ${color.bg} ${color.text} flex items-center justify-center font-bold text-sm`}
                            >
                              {project.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 truncate">
                              <p className="font-medium text-sm truncate text-black">
                                {project.name}
                              </p>
                              <p className="text-xs text-black">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
