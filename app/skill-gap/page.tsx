"use client";

import { useState, useEffect } from "react";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import MobileNav from "@/components/MobileNav";
import Link from "next/link";

type Role = "frontend" | "backend" | "fullstack" | "devops";

interface SkillLevel {
  skill: string;
  level: "proficient" | "intermediate" | "beginner";
}

interface SkillGapAnalysis {
  role: Role;
  presentSkills: string[];
  missingSkills: {
    essential: string[];
    preferred: string[];
    niceToHave: string[];
  };
  coveragePercentage: number;
  summary: {
    totalRequired: number;
    present: number;
    missing: number;
    readinessScore: number;
  };
}

export default function SkillGapPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("frontend");
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentSkills, setCurrentSkills] = useState<SkillLevel[]>([]);

  useEffect(() => {
    // Load any existing analysis on mount
    loadExistingAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadExistingAnalysis() {
    try {
      const response = await fetch(
        `/api/analysis/skill-gaps?role=${selectedRole}`
      );
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
        setCurrentSkills(mapSkillsToLevels(data.analysis.presentSkills));
      }
    } catch (error) {
      console.error("Error loading analysis:", error);
    }
  }

  async function handleAnalyze() {
    setLoading(true);
    try {
      const response = await fetch("/api/analysis/skill-gaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: selectedRole }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
        setCurrentSkills(mapSkillsToLevels(data.analysis.presentSkills));
      } else {
        alert("Failed to analyze skills");
      }
    } catch (error) {
      console.error("Error analyzing:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function mapSkillsToLevels(skills: string[]): SkillLevel[] {
    // Simple heuristic: first 40% are proficient, next 40% intermediate, rest beginner
    return skills.map((skill, index) => {
      const ratio = index / skills.length;
      let level: "proficient" | "intermediate" | "beginner";
      if (ratio < 0.4) level = "proficient";
      else if (ratio < 0.8) level = "intermediate";
      else level = "beginner";
      return { skill, level };
    });
  }

  function getSkillColor(level: string) {
    switch (level) {
      case "proficient":
        return "bg-green-500";
      case "intermediate":
        return "bg-sky-500";
      default:
        return "bg-slate-400";
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f6f7f8]">
      <MobileNav />
      <CollapsibleSidebar />

      <main className="pt-16 md:pt-0 flex-1 p-4 sm:p-6 lg:p-12 ml-0 md:ml-20">
        <div className="mx-auto max-w-4xl">
          {/* Page Heading */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-black">
              Skill Gap Analysis
            </h1>
            <p className="text-gray-600 text-base mt-2">
              Select your target role to see how your skills stack up against
              the requirements.
            </p>
          </div>

          {/* Target Role Selection */}
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-black text-base font-medium pb-2">
                  Target Role
                </p>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                  className="w-full rounded-xl border border-gray-300 bg-[#f6f7f8] h-14 px-4 text-base text-black focus:outline-none focus:ring-2 focus:ring-[#4c96e1]"
                >
                  <option value="frontend">Frontend Developer</option>
                  <option value="backend">Backend Developer</option>
                  <option value="fullstack">Full-Stack Developer</option>
                  <option value="devops">DevOps Engineer</option>
                </select>
              </label>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="min-w-[84px] rounded-full h-14 px-6 text-sm font-bold text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#4c96e1" }}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>

          {analysis && (
            <>
              {/* Current Skills */}
              <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="text-black text-[22px] font-bold pb-1">
                  Your Current Skills
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Detected from your GitHub repositories.
                </p>
                <div className="flex flex-wrap gap-4">
                  {currentSkills.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-full border border-gray-200 bg-[#f6f7f8] py-2 px-4"
                    >
                      <span className="relative flex h-3 w-3">
                        {item.level === "proficient" && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-3 w-3 ${getSkillColor(item.level)}`}
                        ></span>
                      </span>
                      <span className="font-medium text-black">
                        {item.skill}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {item.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="text-black text-[22px] font-bold pb-6">
                  Missing Skills for{" "}
                  {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}{" "}
                  Developer
                </h2>
                <div className="space-y-6">
                  {/* Essential Skills */}
                  {analysis.missingSkills.essential.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 text-black">
                        Essential Skills
                      </h3>
                      <div className="flex flex-col gap-3">
                        {analysis.missingSkills.essential.map(
                          (skill, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-lg bg-[#f6f7f8] p-4 border border-gray-200"
                            >
                              <span className="font-medium text-black">
                                {skill}
                              </span>
                              <div className="flex items-center gap-2 text-sm text-red-600 font-semibold">
                                <span>⚠</span> High Priority
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Preferred Skills */}
                  {analysis.missingSkills.preferred.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 text-black">
                        Preferred Skills
                      </h3>
                      <div className="flex flex-col gap-3">
                        {analysis.missingSkills.preferred.map(
                          (skill, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-lg bg-[#f6f7f8] p-4 border border-gray-200"
                            >
                              <span className="font-medium text-black">
                                {skill}
                              </span>
                              <div className="flex items-center gap-2 text-sm text-amber-600 font-semibold">
                                <span>—</span> Medium Priority
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Nice-to-have Skills */}
                  {analysis.missingSkills.niceToHave.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 text-black">
                        Nice-to-have Skills
                      </h3>
                      <div className="flex flex-col gap-3">
                        {analysis.missingSkills.niceToHave.map(
                          (skill, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-lg bg-[#f6f7f8] p-4 border border-gray-200"
                            >
                              <span className="font-medium text-black">
                                {skill}
                              </span>
                              <div className="flex items-center gap-2 text-sm text-sky-600 font-semibold">
                                <span>↘</span> Low Priority
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="text-black text-[22px] font-bold pb-6">
                  Next Steps to Bridge the Gap
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-start gap-3 rounded-lg bg-[#f6f7f8] p-6 border border-gray-200">
                    <span className="text-3xl" style={{ color: "#4c96e1" }}>
                      💡
                    </span>
                    <h3 className="text-lg font-bold text-black">
                      Get Project Recommendations
                    </h3>
                    <p className="text-sm text-gray-600 grow">
                      Receive AI-powered project ideas tailored to build the
                      skills you&apos;re missing.
                    </p>
                    <Link
                      href="/project-recommendations"
                      className="mt-2 w-full text-center rounded-full h-10 px-4 text-sm font-bold transition-colors"
                      style={{
                        backgroundColor: "rgba(76, 150, 225, 0.2)",
                        color: "#4c96e1",
                      }}
                    >
                      Find Projects
                    </Link>
                  </div>
                  <div className="flex flex-col items-start gap-3 rounded-lg bg-[#f6f7f8] p-6 border border-gray-200">
                    <span className="text-3xl" style={{ color: "#4c96e1" }}>
                      🎓
                    </span>
                    <h3 className="text-lg font-bold text-black">
                      Find Learning Resources
                    </h3>
                    <p className="text-sm text-gray-600 grow">
                      Discover curated tutorials, courses, and articles to learn
                      new technologies effectively.
                    </p>
                    <button
                      className="mt-2 w-full rounded-full h-10 px-4 text-sm font-bold transition-colors"
                      style={{
                        backgroundColor: "rgba(76, 150, 225, 0.2)",
                        color: "#4c96e1",
                      }}
                    >
                      Start Learning
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
