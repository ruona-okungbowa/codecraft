"use client";

import { useState, useEffect } from "react";
import { RefreshCw, AlertCircle, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import FilterBar from "@/components/recommendations/FilterBar";
import ProjectCard from "@/components/recommendations/ProjectCard";
import CardSkeleton from "@/components/skeletons/CardSkeleton";
import { filterAndSortRecommendations } from "@/lib/recommendations/filters";
import type {
  ProjectRecommendation,
  FilterState,
  UserProject,
  ProjectProgress,
} from "@/types/recommendations";
import type { SkillGapAnalysis } from "@/types/skills";

export default function ProjectRecommendationsPage() {
  // State management
  const [recommendations, setRecommendations] = useState<
    ProjectRecommendation[]
  >([]);
  const [skillGapAnalysis, setSkillGapAnalysis] =
    useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<Set<string>>(new Set());
  const [startedProjects, setStartedProjects] = useState<
    Map<string, ProjectProgress>
  >(new Map());

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    difficulty: "all",
    category: "all",
    timeCommitment: "all",
    skills: [],
    sortBy: "priority",
    priorityLevel: "all",
  });

  // Fetch recommendations on mount
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch("/api/recommendations");

      if (!response.ok) {
        if (response.status === 404) {
          const data = await response.json();
          setError(data.message || "No skill gap analysis found");
          return;
        }
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setSkillGapAnalysis(data.skillGapAnalysis);

      // Process user projects
      if (data.userProjects) {
        const saved = new Set<string>();
        const started = new Map<string, ProjectProgress>();

        data.userProjects.forEach((up: UserProject) => {
          if (up.status === "saved") {
            saved.add(up.projectId);
          } else if (up.status === "in_progress" || up.status === "completed") {
            started.set(up.projectId, {
              projectId: up.projectId,
              status: up.status,
              progress: up.progress,
            });
          }
        });

        setSavedProjects(saved);
        setStartedProjects(started);
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to load recommendations. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchRecommendations(true);
  };

  // Handle save/unsave project
  const handleSaveProject = async (projectId: string) => {
    const isSaved = savedProjects.has(projectId);

    // Optimistic update
    const newSaved = new Set(savedProjects);
    if (isSaved) {
      newSaved.delete(projectId);
    } else {
      newSaved.add(projectId);
    }
    setSavedProjects(newSaved);

    try {
      if (isSaved) {
        // Find the user project ID and delete it
        const response = await fetch("/api/user-projects");
        const data = await response.json();
        const userProject = data.userProjects?.find(
          (up: { projectId: string }) => up.projectId === projectId
        );

        if (userProject) {
          await fetch(`/api/user-projects/${userProject.id}`, {
            method: "DELETE",
          });
        }
      } else {
        // Save the project
        await fetch("/api/user-projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            status: "saved",
          }),
        });
      }
    } catch (err) {
      console.error("Error saving project:", err);
      // Revert optimistic update
      setSavedProjects(savedProjects);
    }
  };

  // Handle start/continue project
  const handleStartProject = async (projectId: string) => {
    const isStarted = startedProjects.has(projectId);

    if (!isStarted) {
      // Optimistic update
      const newStarted = new Map(startedProjects);
      newStarted.set(projectId, {
        projectId,
        status: "in_progress",
        progress: 0,
      });
      setStartedProjects(newStarted);

      try {
        await fetch("/api/user-projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            status: "in_progress",
          }),
        });
      } catch (err) {
        console.error("Error starting project:", err);
        // Revert optimistic update
        setStartedProjects(startedProjects);
      }
    }
    // If already started, just navigate or show progress modal
    // For now, we'll just keep the current behavior
  };

  // Handle progress update
  const handleProgressUpdate = async (projectId: string, progress: number) => {
    const currentProgress = startedProjects.get(projectId);
    if (!currentProgress) return;

    // Optimistic update
    const newStarted = new Map(startedProjects);
    newStarted.set(projectId, {
      ...currentProgress,
      progress,
      status: progress === 100 ? "completed" : "in_progress",
    });
    setStartedProjects(newStarted);

    try {
      // Find the user project ID
      const response = await fetch("/api/user-projects");
      const data = await response.json();
      const userProject = data.userProjects?.find(
        (up: { projectId: string }) => up.projectId === projectId
      );

      if (userProject) {
        await fetch(`/api/user-projects/${userProject.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ progress }),
        });
      }
    } catch (err) {
      console.error("Error updating progress:", err);
      // Revert optimistic update
      setStartedProjects(startedProjects);
    }
  };
  // Apply filters and sorting
  const filteredRecommendations = filterAndSortRecommendations(
    recommendations,
    filters
  );

  // Get available skills for filter
  const availableSkills = Array.from(
    new Set(recommendations.flatMap((r) => r.skillsTaught))
  ).sort();

  // Count active filters
  const activeFilterCount =
    (filters.difficulty !== "all" ? 1 : 0) +
    (filters.category !== "all" ? 1 : 0) +
    (filters.timeCommitment !== "all" ? 1 : 0) +
    (filters.priorityLevel && filters.priorityLevel !== "all" ? 1 : 0) +
    filters.skills.length;

  return (
    <div className="flex min-h-screen bg-[#f6f7f8]">
      <CollapsibleSidebar />

      <main className="ml-0 md:ml-20 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Project Recommendations
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Curated projects to fill your skill gaps and boost your
                  portfolio
                </p>
              </div>

              {/* Refresh Button */}
              {!loading && (
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] sm:min-h-0"
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  <span className="sm:hidden">
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </span>
                  <span className="hidden sm:inline">
                    {refreshing ? "Refreshing..." : "Refresh Recommendations"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {error.includes("No skill gap analysis")
                  ? "No Skill Gap Analysis Found"
                  : "Something went wrong"}
              </h3>
              <p className="text-gray-600 mb-6">
                {error.includes("No skill gap analysis")
                  ? "Complete a skill gap analysis first to get personalized project recommendations."
                  : error}
              </p>
              {error.includes("No skill gap analysis") ? (
                <a
                  href="/skill-gap"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  <TrendingUp size={20} />
                  Analyze Skill Gaps
                </a>
              ) : (
                <button
                  onClick={() => fetchRecommendations()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  <RefreshCw size={20} />
                  Try Again
                </button>
              )}
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && (
            <>
              {/* Filter Bar */}
              <FilterBar
                filters={filters}
                onFilterChange={setFilters}
                availableSkills={availableSkills}
                activeFilterCount={activeFilterCount}
              />

              {/* No Matching Projects */}
              {filteredRecommendations.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No projects match your filters
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters to see more project
                    recommendations.
                  </p>
                  <button
                    onClick={() =>
                      setFilters({
                        difficulty: "all",
                        category: "all",
                        timeCommitment: "all",
                        skills: [],
                        sortBy: "priority",
                        priorityLevel: "all",
                      })
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* Project Grid */}
              {filteredRecommendations.length > 0 && (
                <div
                  data-projects-grid
                  className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredRecommendations.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          duration: refreshing ? 0.3 : 0.2,
                          delay: refreshing ? index * 0.05 : 0,
                          ease: "easeOut",
                        }}
                      >
                        <ProjectCard
                          project={project}
                          userSkills={skillGapAnalysis?.presentSkills || []}
                          missingSkills={
                            skillGapAnalysis?.missingSkills || {
                              essential: [],
                              preferred: [],
                              niceToHave: [],
                            }
                          }
                          isSaved={savedProjects.has(project.id)}
                          progress={startedProjects.get(project.id) || null}
                          onSave={() => handleSaveProject(project.id)}
                          onStart={() => handleStartProject(project.id)}
                          onProgressUpdate={(progress) =>
                            handleProgressUpdate(project.id, progress)
                          }
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
