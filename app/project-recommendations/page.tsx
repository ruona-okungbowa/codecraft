"use client";

import { useState, useEffect } from "react";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import Link from "next/link";

interface ProjectRecommendation {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  timeEstimate: string;
  gapsFilled: string[];
  features: string[];
  learningResources: { title: string; url: string; type: string }[];
  priorityScore: number;
}

interface ProjectStatus {
  project_id: string;
  status: "saved" | "in_progress" | "completed";
}

export default function ProjectRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<
    ProjectRecommendation[]
  >([]);
  const [projectStatuses, setProjectStatuses] = useState<
    Map<string, ProjectStatus>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  useEffect(() => {
    fetchRecommendations();
    fetchProjectStatuses();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".filter-dropdown")) {
        setShowDifficultyDropdown(false);
        setShowTimeDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchRecommendations() {
    try {
      const response = await fetch("/api/recommendations");
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        const errorData = await response.json();
        if (errorData.message?.includes("skill gap analysis")) {
          setError("skill_gap_required");
        } else {
          setError(errorData.message || "Failed to load recommendations");
        }
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProjectStatuses() {
    try {
      const response = await fetch("/api/recommendations/status");
      if (response.ok) {
        const data = await response.json();
        const statusMap = new Map<string, ProjectStatus>();
        data.projects?.forEach(
          (project: { project_id: string; status: string }) => {
            statusMap.set(project.project_id, {
              project_id: project.project_id,
              status: project.status as "saved" | "in_progress" | "completed",
            });
          }
        );
        setProjectStatuses(statusMap);
      }
    } catch (error) {
      console.error("Error fetching project statuses:", error);
    }
  }

  async function updateProjectStatus(
    projectId: string,
    status: "in_progress" | "completed"
  ) {
    setUpdatingStatus(projectId);
    try {
      const response = await fetch("/api/recommendations/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, status }),
      });

      if (response.ok) {
        // Update local state
        setProjectStatuses((prev) => {
          const newMap = new Map(prev);
          newMap.set(projectId, { project_id: projectId, status });
          return newMap;
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update project status");
      }
    } catch (error) {
      console.error("Error updating project status:", error);
      alert("Failed to update project status");
    } finally {
      setUpdatingStatus(null);
    }
  }

  function getProjectStatus(projectId: string) {
    return projectStatuses.get(projectId)?.status;
  }

  const inProgressProjects = recommendations.filter(
    (rec) => getProjectStatus(rec.id) === "in_progress"
  );

  const completedProjects = recommendations.filter(
    (rec) => getProjectStatus(rec.id) === "completed"
  );

  const filteredRecommendations = recommendations
    .filter((rec) => !getProjectStatus(rec.id)) // Only show projects without status
    .filter((rec) =>
      difficultyFilter === "all" ? true : rec.difficulty === difficultyFilter
    )
    .filter((rec) =>
      timeFilter === "all"
        ? true
        : rec.timeEstimate.toLowerCase().includes(timeFilter)
    );

  return (
    <div className="flex min-h-screen bg-[#f6f7f8]">
      <CollapsibleSidebar />

      <main className="flex-1 p-8 lg:p-12 ml-20">
        <div className="mx-auto max-w-4xl">
          {/* Page Heading */}
          <div className="flex flex-wrap justify-between gap-3 pb-4 items-center">
            <h1 className="text-slate-900 text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
              Projects to Build
            </h1>
          </div>

          {/* In Progress & Completed Projects Section */}
          {!loading &&
            !error &&
            (inProgressProjects.length > 0 || completedProjects.length > 0) && (
              <div className="mb-8 space-y-6">
                {/* In Progress Projects */}
                {inProgressProjects.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-[#4c96e1] text-2xl">
                        schedule
                      </span>
                      <h2 className="text-slate-900 text-2xl font-bold">
                        In Progress ({inProgressProjects.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inProgressProjects.map((project) => (
                        <div
                          key={project.id}
                          className="p-4 bg-white rounded-lg border border-[#4c96e1]/30 hover:border-[#4c96e1] transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="text-slate-900 font-bold text-base mb-1">
                                {project.name}
                              </h3>
                              <p className="text-slate-500 text-sm line-clamp-2 mb-3">
                                {project.description}
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                {project.techStack
                                  .slice(0, 3)
                                  .map((tech, index) => (
                                    <div
                                      key={index}
                                      className="flex h-6 items-center justify-center rounded-full bg-[#4c96e1]/20 px-2"
                                    >
                                      <p className="text-[#4c96e1] text-xs font-medium">
                                        {tech}
                                      </p>
                                    </div>
                                  ))}
                                {project.techStack.length > 3 && (
                                  <div className="flex h-6 items-center justify-center rounded-full bg-slate-100 px-2">
                                    <p className="text-slate-600 text-xs font-medium">
                                      +{project.techStack.length - 3}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                updateProjectStatus(project.id, "completed")
                              }
                              disabled={updatingStatus === project.id}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-sm">
                                check
                              </span>
                              <span>Complete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Projects */}
                {completedProjects.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-green-600 text-2xl">
                        check_circle
                      </span>
                      <h2 className="text-slate-900 text-2xl font-bold">
                        Completed ({completedProjects.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {completedProjects.map((project) => (
                        <div
                          key={project.id}
                          className="p-4 bg-white rounded-lg border border-green-200 opacity-75 hover:opacity-100 transition-opacity"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-slate-900 font-bold text-base">
                                  {project.name}
                                </h3>
                                <span className="material-symbols-outlined text-green-600 text-lg">
                                  check_circle
                                </span>
                              </div>
                              <p className="text-slate-500 text-sm line-clamp-2 mb-3">
                                {project.description}
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                {project.techStack
                                  .slice(0, 3)
                                  .map((tech, index) => (
                                    <div
                                      key={index}
                                      className="flex h-6 items-center justify-center rounded-full bg-green-100 px-2"
                                    >
                                      <p className="text-green-700 text-xs font-medium">
                                        {tech}
                                      </p>
                                    </div>
                                  ))}
                                {project.techStack.length > 3 && (
                                  <div className="flex h-6 items-center justify-center rounded-full bg-slate-100 px-2">
                                    <p className="text-slate-600 text-xs font-medium">
                                      +{project.techStack.length - 3}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-slate-200 pt-6">
                  <h2 className="text-slate-900 text-2xl font-bold mb-4">
                    Recommended Projects
                  </h2>
                </div>
              </div>
            )}

          {/* Filters */}
          <div className="flex gap-3 py-3 flex-wrap items-center">
            {/* Difficulty Filter Dropdown */}
            <div className="relative filter-dropdown">
              <button
                onClick={() => {
                  setShowDifficultyDropdown(!showDifficultyDropdown);
                  setShowTimeDropdown(false);
                }}
                className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white pl-4 pr-3 border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <p className="text-slate-800 text-sm font-medium leading-normal">
                  {difficultyFilter === "all"
                    ? "Difficulty"
                    : difficultyFilter.charAt(0).toUpperCase() +
                      difficultyFilter.slice(1)}
                </p>
                <span className="material-symbols-outlined text-slate-500 text-xl">
                  expand_more
                </span>
              </button>
              {showDifficultyDropdown && (
                <div className="absolute top-12 left-0 z-10 bg-white rounded-lg border border-slate-200 shadow-lg min-w-[160px] overflow-hidden">
                  {["all", "beginner", "intermediate", "advanced"].map(
                    (option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setDifficultyFilter(option);
                          setShowDifficultyDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                          difficultyFilter === option
                            ? "bg-[#4c96e1]/10 text-[#4c96e1] font-medium"
                            : "text-slate-700"
                        }`}
                      >
                        {option === "all"
                          ? "All Difficulties"
                          : option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Time Filter Dropdown */}
            <div className="relative filter-dropdown">
              <button
                onClick={() => {
                  setShowTimeDropdown(!showTimeDropdown);
                  setShowDifficultyDropdown(false);
                }}
                className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white pl-4 pr-3 border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <p className="text-slate-800 text-sm font-medium leading-normal">
                  {timeFilter === "all"
                    ? "Time estimate"
                    : timeFilter === "weekend"
                      ? "Weekend"
                      : timeFilter === "week"
                        ? "1 Week"
                        : "1 Month"}
                </p>
                <span className="material-symbols-outlined text-slate-500 text-xl">
                  expand_more
                </span>
              </button>
              {showTimeDropdown && (
                <div className="absolute top-12 left-0 z-10 bg-white rounded-lg border border-slate-200 shadow-lg min-w-[160px] overflow-hidden">
                  {[
                    { value: "all", label: "All Time Estimates" },
                    { value: "weekend", label: "Weekend" },
                    { value: "week", label: "1 Week" },
                    { value: "month", label: "1 Month" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTimeFilter(option.value);
                        setShowTimeDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                        timeFilter === option.value
                          ? "bg-[#4c96e1]/10 text-[#4c96e1] font-medium"
                          : "text-slate-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommendation Cards */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-slate-500">Loading recommendations...</p>
            </div>
          ) : error === "skill_gap_required" ? (
            <div className="text-center py-20">
              <p className="text-slate-600 mb-4">
                Complete a skill gap analysis to get personalized project
                recommendations.
              </p>
              <Link
                href="/skill-gap"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#4c96e1] text-white font-semibold hover:bg-[#3a7bc8] transition-colors"
              >
                <span>Complete Skill Gap Analysis</span>
                <span className="material-symbols-outlined text-xl">
                  arrow_forward
                </span>
              </Link>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
            </div>
          ) : filteredRecommendations.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-600">
                No recommendations match your filters.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 py-6">
              {filteredRecommendations.map((project) => {
                const isExpanded = expandedCard === project.id;

                return (
                  <div
                    key={project.id}
                    className="p-4 bg-white rounded-lg border border-slate-200"
                  >
                    <div className="flex flex-col items-stretch justify-start rounded-xl">
                      <div className="flex w-full grow flex-col items-stretch justify-center gap-1">
                        <p className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em]">
                          {project.name}
                        </p>
                        <div className="flex items-start gap-4 justify-between">
                          <div className="flex flex-col gap-3 flex-1">
                            <p className="text-slate-500 text-base font-normal leading-normal">
                              {project.description}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base">
                                  signal_cellular_alt
                                </span>
                                <span className="capitalize">
                                  {project.difficulty}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base">
                                  hourglass_top
                                </span>
                                <span>{project.timeEstimate}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {project.techStack.map((tech, index) => (
                                <div
                                  key={index}
                                  className="flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#4c96e1]/20 px-3"
                                >
                                  <p className="text-[#4c96e1] text-xs font-medium">
                                    {tech}
                                  </p>
                                </div>
                              ))}
                            </div>
                            {project.gapsFilled.length > 0 && (
                              <p className="text-[#4c96e1]/80 text-sm font-medium leading-normal bg-[#4c96e1]/10 p-2 rounded">
                                Why recommended: Fills gaps in{" "}
                                {project.gapsFilled.slice(0, 3).join(", ")}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              setExpandedCard(isExpanded ? null : project.id)
                            }
                            className="flex mt-1 min-w-[100px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-5 bg-[#4c96e1] text-white text-sm font-medium leading-normal gap-2 hover:bg-[#3a7bc8] transition-colors"
                          >
                            <span className="truncate">Get started</span>
                            <span className="material-symbols-outlined text-lg">
                              {isExpanded ? "expand_less" : "expand_more"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-6 border-t border-slate-200 pt-6 space-y-4 text-slate-600">
                        {project.features.length > 0 && (
                          <div>
                            <h4 className="font-bold text-slate-800 mb-2">
                              Full Project Description
                            </h4>
                            <p className="text-sm">
                              {project.features.join(" ")}
                            </p>
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-800 mb-2">
                            Learning Objectives
                          </h4>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {project.techStack.map((tech, index) => (
                              <li key={index}>
                                Master {tech} fundamentals and best practices
                              </li>
                            ))}
                          </ul>
                        </div>
                        {project.learningResources.length > 0 && (
                          <div>
                            <h4 className="font-bold text-slate-800 mb-2">
                              Resources
                            </h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {project.learningResources.map(
                                (resource, index) => (
                                  <li key={index}>
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#4c96e1] underline hover:text-[#3a7bc8]"
                                    >
                                      {resource.title}
                                    </a>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                        <div className="flex items-center gap-3 pt-4">
                          {getProjectStatus(project.id) === "in_progress" ? (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4c96e1]/10 text-[#4c96e1]">
                              <span className="material-symbols-outlined text-base">
                                schedule
                              </span>
                              <span className="text-sm font-medium">
                                In Progress
                              </span>
                            </div>
                          ) : getProjectStatus(project.id) === "completed" ? (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700">
                              <span className="material-symbols-outlined text-base">
                                check_circle
                              </span>
                              <span className="text-sm font-medium">
                                Completed
                              </span>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  updateProjectStatus(project.id, "in_progress")
                                }
                                disabled={updatingStatus === project.id}
                                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-5 bg-[#4c96e1]/20 text-[#4c96e1] text-sm font-medium leading-normal hover:bg-[#4c96e1]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updatingStatus === project.id
                                  ? "Updating..."
                                  : "Mark as started"}
                              </button>
                              <button
                                onClick={() =>
                                  updateProjectStatus(project.id, "completed")
                                }
                                disabled={updatingStatus === project.id}
                                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-5 bg-slate-100 text-slate-600 text-sm font-medium leading-normal hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updatingStatus === project.id
                                  ? "Updating..."
                                  : "Mark as completed"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
