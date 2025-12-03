"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Target,
  AlertCircle,
  Loader2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import MobileNav from "@/components/MobileNav";
import FilterBar from "@/components/recommendations/FilterBar";
import ProjectCard from "@/components/recommendations/ProjectCard";
import PriorityCallout from "@/components/recommendations/PriorityCallout";
import type {
  ProjectRecommendation,
  FilterState,
  UserProject,
  ProjectProgress,
} from "@/types/recommendations";
import type { SkillGapAnalysis } from "@/types/skills";
import {
  applyFilters,
  sortRecommendations,
} from "@/lib/recommendations/filters";

interface RecommendationsResponse {
  recommendations: ProjectRecommendation[];
  skillGapAnalysis: SkillGapAnalysis;
  userProjects: UserProject[];
  cached: boolean;
  generatedAt: string;
}

export default function ProjectRecommendationsPage() {
  // State for recommendations data
  const [recommendations, setRecommendations] = useState<
    ProjectRecommendation[]
  >([]);
  const [skillGapAnalysis, setSkillGapAnalysis] =
    useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [filters, setFilters] = useState<FilterState>({
    difficulty: "all",
    category: "all",
    timeCommitment: "all",
    skills: [],
    sortBy: "priority",
    priorityLevel: "all",
  });

  // State for user projects
  const [savedProjects, setSavedProjects] = useState<Set<string>>(new Set());
  const [startedProjects, setStartedProjects] = useState<
    Map<string, ProjectProgress>
  >(new Map());

  // Fetch recommendations on mount
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async (isRefresh = false) => {
    try {
      if (isRefresh) {
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

      const data: RecommendationsResponse = await response.json();

      setRecommendations(data.recommendations);
      setSkillGapAnalysis(data.skillGapAnalysis);

      // Process user projects
      const saved = new Set<string>();
      const started = new Map<string, ProjectProgress>();

      data.userProjects.forEach((project) => {
        if (project.status === "saved") {
          saved.add(project.projectId);
        } else if (
          project.status === "in_progress" ||
          project.status === "completed"
        ) {
          started.set(project.projectId, {
            projectId: project.projectId,
            status: project.status,
            progress: project.progress,
          });
        }
      });

      setSavedProjects(saved);
      setStartedProjects(started);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load recommendations"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchRecommendations(true);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleViewCritical = () => {
    // Apply filter to show only high-priority projects
    setFilters({
      difficulty: "all",
      category: "all",
      timeCommitment: "all",
      skills: [],
      sortBy: "priority",
      priorityLevel: "high",
    });
  };

  const handleSave = async (projectId: string) => {
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
        // Find the user project ID to delete
        const response = await fetch("/api/user-projects");
        const data = await response.json();
        const userProject = data.userProjects.find(
          (p: { projectId: string }) => p.projectId === projectId
        );

        if (userProject) {
          // Delete via project_id lookup - we need to get the actual ID
          // For now, just call POST to toggle status
          await fetch("/api/user-projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId, status: "saved" }),
          });
        }
      } else {
        await fetch("/api/user-projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, status: "saved" }),
        });
      }
    } catch (err) {
      console.error("Error saving project:", err);
      // Revert optimistic update
      setSavedProjects(savedProjects);
    }
  };

  const handleStart = async (projectId: string) => {
    const isStarted = startedProjects.has(projectId);

    // Optimistic update
    if (!isStarted) {
      const newStarted = new Map(startedProjects);
      newStarted.set(projectId, {
        projectId,
        status: "in_progress",
        progress: 0,
      });
      setStartedProjects(newStarted);

      // Remove from saved if it was saved
      if (savedProjects.has(projectId)) {
        const newSaved = new Set(savedProjects);
        newSaved.delete(projectId);
        setSavedProjects(newSaved);
      }
    }

    try {
      await fetch("/api/user-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, status: "in_progress" }),
      });
    } catch (err) {
      console.error("Error starting project:", err);
      // Revert optimistic update
      setStartedProjects(startedProjects);
    }
  };

  const handleProgressUpdate = async (projectId: string, progress: number) => {
    // Optimistic update
    const current = startedProjects.get(projectId);
    if (current) {
      const newStarted = new Map(startedProjects);
      newStarted.set(projectId, {
        ...current,
        progress,
        status: progress === 100 ? "completed" : "in_progress",
      });
      setStartedProjects(newStarted);
    }

    try {
      // We need the actual user project ID - fetch it first
      const response = await fetch("/api/user-projects");
      const data = await response.json();
      const userProject = data.userProjects.find(
        (p: { projectId: string }) => p.projectId === projectId
      );

      if (userProject) {
        // Update progress - this endpoint needs the database ID
        // For now, we'll skip this as it requires the ID
        console.log("Progress update:", projectId, progress);
      }
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  // Apply filters and sorting
  const filteredRecommendations = sortRecommendations(
    applyFilters(recommendations, filters),
    filters.sortBy
  );

  // Calculate active filter count
  const activeFilterCount =
    (filters.difficulty !== "all" ? 1 : 0) +
    (filters.category !== "all" ? 1 : 0) +
    (filters.timeCommitment !== "all" ? 1 : 0) +
    (filters.priorityLevel && filters.priorityLevel !== "all" ? 1 : 0) +
    filters.skills.length;

  // Get available skills from recommendations
  const availableSkills = Array.from(
    new Set(recommendations.flatMap((r) => r.skillsTaught))
  ).sort();

  // Check if user has critical skill gaps
  const hasCriticalGaps =
    skillGapAnalysis?.missingSkills.essential.length ?? 0 > 0;

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f6f7f8]">
        <MobileNav />
        <CollapsibleSidebar />
        <main className="pt-16 md:pt-0 ml-0 md:ml-20 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Filter Bar Skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="grid grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Project Cards Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 h-96 animate-pulse"
                >
                  <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
                  <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded mb-4" />
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-20 bg-gray-200 rounded" />
                    <div className="h-6 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state - no skill gap analysis
  if (error && error.includes("skill gap analysis")) {
    return (
      <div className="flex min-h-screen bg-[#f6f7f8]">
        <MobileNav />
        <CollapsibleSidebar />
        <main className="pt-16 md:pt-0 ml-0 md:ml-20 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-warning-100 rounded-full mb-4">
                <AlertCircle size={32} className="text-warning-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Skill Gap Analysis Found
              </h2>
              <p className="text-gray-600 mb-6">
                To get personalised project recommendations, you need to
                complete a skill gap analysis first.
              </p>
              <Link
                href="/skill-gap"
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-all"
                style={{ backgroundColor: "#4c96e1" }}
              >
                <TrendingUp size={20} />
                Complete Skill Gap Analysis
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state - general error
  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f6f7f8]">
        <MobileNav />
        <CollapsibleSidebar />
        <main className="pt-16 md:pt-0 ml-0 md:ml-20 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-error-200 shadow-sm p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-error-100 rounded-full mb-4">
                <AlertCircle size={32} className="text-error-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Something Went Wrong
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => fetchRecommendations()}
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-all"
                style={{ backgroundColor: "#4c96e1" }}
              >
                <RefreshCw size={20} />
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Empty state - no matching projects
  if (filteredRecommendations.length === 0 && recommendations.length > 0) {
    return (
      <div className="flex min-h-screen bg-[#f6f7f8]">
        <MobileNav />
        <CollapsibleSidebar />
        <main className="pt-16 md:pt-0 ml-0 md:ml-20 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Project Recommendations
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Personalised projects to fill your skill gaps
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  size={18}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh Recommendations
              </button>
            </div>

            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              availableSkills={availableSkills}
              activeFilterCount={activeFilterCount}
            />

            {/* Empty State */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Target size={32} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {filters.priorityLevel === "high"
                  ? "No High Priority Projects Found"
                  : "No Projects Match Your Filters"}
              </h2>
              <p className="text-gray-600 mb-6">
                {filters.priorityLevel === "high"
                  ? "Great news! You don't have any critical skill gaps that require immediate attention. Try viewing all projects to continue building your skills."
                  : "Try adjusting your filters to see more project recommendations."}
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
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-all"
                style={{ backgroundColor: "#4c96e1" }}
              >
                {filters.priorityLevel === "high"
                  ? "View All Projects"
                  : "Clear All Filters"}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main content
  return (
    <div className="flex min-h-screen bg-[#f6f7f8]">
      <MobileNav />
      <CollapsibleSidebar />
      <main className="pt-16 md:pt-0 ml-0 md:ml-20 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Project Recommendations
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Personalised projects to fill your skill gaps for{" "}
                <span className="font-semibold">
                  {skillGapAnalysis?.role || "your target role"}
                </span>
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh Recommendations
            </button>
          </div>

          {/* Filter Bar */}
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            availableSkills={availableSkills}
            activeFilterCount={activeFilterCount}
          />

          {/* Priority Filter Indicator */}
          {filters.priorityLevel === "high" && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target size={20} className="text-error-600" />
                <div>
                  <p className="font-semibold text-error-900 text-sm">
                    Showing High Priority Projects Only
                  </p>
                  <p className="text-xs text-error-700">
                    These projects address your critical skill gaps
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFilters({ ...filters, priorityLevel: "all" })}
                className="text-sm font-medium text-error-700 hover:text-error-900 underline"
              >
                Show All Projects
              </button>
            </div>
          )}

          {/* Priority Callout */}
          {hasCriticalGaps && filters.priorityLevel !== "high" && (
            <PriorityCallout
              criticalGaps={skillGapAnalysis?.missingSkills.essential || []}
              targetRole={skillGapAnalysis?.role || "your target role"}
              onViewCritical={handleViewCritical}
            />
          )}

          {/* Project Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${filters.difficulty}-${filters.category}-${filters.timeCommitment}-${filters.skills.join(",")}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {filteredRecommendations.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
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
                    onSave={() => handleSave(project.id)}
                    onStart={() => handleStart(project.id)}
                    onProgressUpdate={(progress) =>
                      handleProgressUpdate(project.id, progress)
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Refreshing Overlay */}
          {refreshing && (
            <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 shadow-xl flex items-center gap-3">
                <Loader2 size={24} className="animate-spin text-primary-600" />
                <span className="text-gray-900 font-medium">
                  Refreshing recommendations...
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
