"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Target, Code } from "lucide-react";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";
import FilterBar from "@/components/recommendations/FilterBar";
import ProjectCard from "@/components/recommendations/ProjectCard";
import PriorityCallout from "@/components/recommendations/PriorityCallout";
import type {
  ProjectRecommendation,
  FilterState,
  UserProject,
} from "@/types/recommendations";
import type { SkillGapAnalysis } from "@/types/skills";
import {
  applyFilters,
  sortRecommendations,
} from "@/lib/recommendations/filters";

export default function ProjectRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<
    ProjectRecommendation[]
  >([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<
    ProjectRecommendation[]
  >([]);
  const [skillGapAnalysis, setSkillGapAnalysis] =
    useState<SkillGapAnalysis | null>(null);
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    difficulty: "all",
    category: "all",
    timeCommitment: "all",
    skills: [],
    sortBy: "priority",
  });

  // Fetch recommendations
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/recommendations");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch recommendations");
      }
      const data = await res.json();
      setRecommendations(data.recommendations);
      setSkillGapAnalysis(data.skillGapAnalysis);
      setUserProjects(data.userProjects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  useEffect(() => {
    let filtered = applyFilters(recommendations, filters);
    filtered = sortRecommendations(filtered, filters.sortBy);
    setFilteredRecommendations(filtered);
  }, [recommendations, filters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
  };

  const handleSave = async (projectId: string) => {
    try {
      const res = await fetch("/api/user-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, status: "saved" }),
      });
      if (res.ok) {
        const data = await res.json();
        setUserProjects([...userProjects, data.userProject]);
      }
    } catch (err) {
      console.error("Failed to save project:", err);
    }
  };

  const handleStart = async (projectId: string) => {
    try {
      const res = await fetch("/api/user-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, status: "in_progress" }),
      });
      if (res.ok) {
        const data = await res.json();
        setUserProjects([...userProjects, data.userProject]);
      }
    } catch (err) {
      console.error("Failed to start project:", err);
    }
  };

  const handleViewCritical = () => {
    setFilters((prev) => ({ ...prev, sortBy: "priority" }));
    document
      .getElementById("projects-grid")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const availableSkills = Array.from(
    new Set(recommendations.flatMap((r) => r.skillsTaught))
  ).sort();
  const isProjectSaved = (projectId: string) =>
    userProjects.some((p) => p.projectId === projectId);
  const getProjectProgress = (projectId: string) => {
    const project = userProjects.find((p) => p.projectId === projectId);
    if (!project) return null;
    return {
      projectId: project.projectId,
      status: project.status,
      progress: project.progress,
    };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="ml-[72px] flex-1">
          <div className="bg-white border-b border-gray-200 px-10 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Project Recommendations
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Build projects that fill your skill gaps
            </p>
          </div>
          <div className="p-10 max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="ml-[72px] flex-1">
          <div className="bg-white border-b border-gray-200 px-10 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Project Recommendations
            </h1>
          </div>
          <div className="p-10 max-w-[1000px] mx-auto">
            <div className="bg-white rounded-2xl p-16 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target size={32} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {error.includes("No skill gap analysis")
                  ? "Complete skill analysis first"
                  : "Something went wrong"}
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
              {error.includes("No skill gap analysis") ? (
                <Link
                  href="/skill-gap"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Analyze Skills
                </Link>
              ) : (
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <RefreshCw size={18} />
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="ml-[72px] flex-1">
        <div className="bg-white border-b border-gray-200 px-10 py-6 sticky top-0 z-30">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Project Recommendations
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Build projects that fill your skill gaps
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          availableSkills={availableSkills}
        />

        {skillGapAnalysis && (
          <PriorityCallout
            criticalGaps={skillGapAnalysis.missingSkills.essential}
            targetRole={skillGapAnalysis.role}
            onViewCritical={handleViewCritical}
          />
        )}

        <div id="projects-grid" className="p-10 pb-20">
          <div className="max-w-[1600px] mx-auto">
            {filteredRecommendations.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Code size={32} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  No projects match these filters
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Try adjusting your filters or difficulty level
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      difficulty: "all",
                      category: "all",
                      timeCommitment: "all",
                      skills: [],
                      sortBy: "priority",
                    })
                  }
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRecommendations.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
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
                      isSaved={isProjectSaved(project.id)}
                      progress={getProjectProgress(project.id)}
                      onSave={() => handleSave(project.id)}
                      onStart={() => handleStart(project.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
