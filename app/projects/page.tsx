"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  showSuccess,
  showError,
  showLoading,
  dismissToast,
} from "@/lib/utils/toast";
import { celebrateSuccess } from "@/lib/utils/confetti";
import {
  RefreshCw,
  Grid3x3,
  List,
  ChevronDown,
  Search,
  Star,
  GitCommit,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileText,
  MoreVertical,
  ExternalLink,
  Check,
  XCircle,
  FolderX,
  X,
  BarChart3,
  Briefcase,
  Sparkles,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { Newsreader, Sansation } from "next/font/google";
import DashboardSidebar from "@/components/DashboardSidebar";
import { ProjectRow } from "@/types";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

type SortOption = "recent" | "alphabetical" | "story" | "portfolio" | "complex";
type FilterOption =
  | "all"
  | "portfolio"
  | "story-ready"
  | "needs-attention"
  | "recent";

const languageGradients: Record<string, string> = {
  JavaScript: "linear-gradient(135deg, #f7df1e, #f59e0b)",
  TypeScript: "linear-gradient(135deg, #3178c6, #06b6d4)",
  Python: "linear-gradient(135deg, #3776ab, #06b6d4)",
  Java: "linear-gradient(135deg, #f89820, #ec4899)",
  Ruby: "linear-gradient(135deg, #cc342d, #ec4899)",
  Go: "linear-gradient(135deg, #00add8, #3b82f6)",
  Rust: "linear-gradient(135deg, #ce422b, #f97316)",
  PHP: "linear-gradient(135deg, #777bb4, #8b5cf6)",
  default: "linear-gradient(135deg, #9ca3af, #6b7280)",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [togglingPortfolio, setTogglingPortfolio] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    const toastId = showLoading("Syncing with GitHub...");
    try {
      const response = await fetch("/api/github/repos", { method: "POST" });
      if (response.ok) {
        await fetchProjects();
        dismissToast(toastId);
        showSuccess("Projects synced successfully!");
        celebrateSuccess();
      } else {
        dismissToast(toastId);
        showError("Failed to sync projects");
      }
    } catch (error) {
      console.error("Error syncing:", error);
      dismissToast(toastId);
      showError("An error occurred while syncing");
    } finally {
      setSyncing(false);
    }
  }

  async function togglePortfolio(projectId: string, currentStatus: boolean) {
    setTogglingPortfolio(projectId);
    try {
      const response = await fetch(`/api/projects/${projectId}/portfolio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inPortfolio: !currentStatus }),
      });

      if (response.ok) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId ? { ...p, in_portfolio: !currentStatus } : p
          )
        );
        if (!currentStatus) {
          showSuccess("Added to portfolio!");
          celebrateSuccess();
        } else {
          showSuccess("Removed from portfolio");
        }
      } else {
        showError("Failed to update portfolio");
      }
    } catch (error) {
      console.error("Error toggling portfolio:", error);
      showError("An error occurred");
    } finally {
      setTogglingPortfolio(null);
      setDropdownOpen(null);
    }
  }

  async function handleDeleteProject(projectId: string, projectName: string) {
    if (
      !confirm(
        `Are you sure you want to delete "${projectName}"? This will remove it from your portfolio.`
      )
    ) {
      return;
    }

    const toastId = showLoading("Deleting project...");
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        setDropdownOpen(null);
        dismissToast(toastId);
        showSuccess("Project deleted successfully");
      } else {
        dismissToast(toastId);
        showError("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      dismissToast(toastId);
      showError("An error occurred while deleting");
    }
  }

  const getLanguageGradient = (
    languages: Record<string, number> | null | undefined
  ) => {
    if (!languages || Object.keys(languages).length === 0)
      return languageGradients.default;
    const primaryLang = Object.keys(languages)[0];
    return languageGradients[primaryLang] || languageGradients.default;
  };

  const getLanguageArray = (
    languages: Record<string, number> | null | undefined
  ): string[] => {
    if (!languages) return [];
    return Object.keys(languages).sort((a, b) => languages[b] - languages[a]);
  };

  const getProjectStatus = (
    project: ProjectRow
  ): "complete" | "needs-review" | "generating" | "error" | "draft" => {
    // Determine status based on generated content
    if (project.has_story && project.has_bullets && project.has_readme) {
      return "complete";
    }
    if (project.has_story || project.has_bullets || project.has_readme) {
      return "needs-review"; // Has some content but not all
    }
    if (project.analysed_at && !project.has_story) {
      return "draft"; // Analyzed but no story yet
    }
    return "draft";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return {
          icon: CheckCircle,
          text: "Story Complete",
          className: "bg-green-100 text-green-700",
        };
      case "needs-review":
        return {
          icon: AlertTriangle,
          text: "Needs Review",
          className: "bg-orange-100 text-orange-700",
        };
      case "generating":
        return {
          icon: Loader2,
          text: "Generating",
          className: "bg-blue-100 text-blue-700",
        };
      case "error":
        return {
          icon: XCircle,
          text: "Error",
          className: "bg-red-100 text-red-700",
        };
      default:
        return {
          icon: FileText,
          text: "Draft",
          className: "bg-gray-100 text-gray-700",
        };
    }
  };

  const getPrimaryAction = (status: string, project: ProjectRow) => {
    switch (status) {
      case "complete":
        return {
          text: "View Details",
          className: "bg-blue-600 hover:bg-blue-700 text-white",
        };
      case "needs-review":
        return {
          text: project.has_story ? "Add More Content" : "Complete Story",
          className: "bg-orange-600 hover:bg-orange-700 text-white",
        };
      default:
        return {
          text: "Generate Story",
          className: "bg-purple-600 hover:bg-purple-700 text-white",
        };
    }
  };

  // Filter and sort projects
  let filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getLanguageArray(project.languages).some((lang) =>
        lang.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (!matchesSearch) return false;

    switch (activeFilter) {
      case "portfolio":
        return project.complexity_score && project.complexity_score > 70;
      case "story-ready":
        return getProjectStatus(project) === "complete";
      case "needs-attention":
        return (
          getProjectStatus(project) === "needs-review" ||
          getProjectStatus(project) === "draft"
        );
      case "recent":
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const projectDate = new Date(
          project.last_commit_date || project.updated_at
        );
        return projectDate > weekAgo;
      default:
        return true;
    }
  });

  // Sort projects
  filteredProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "alphabetical":
        return a.name.localeCompare(b.name);
      case "story":
        return getProjectStatus(b).localeCompare(getProjectStatus(a));
      case "portfolio":
        return (b.complexity_score || 0) - (a.complexity_score || 0);
      case "complex":
        return (b.complexity_score || 0) - (a.complexity_score || 0);
      default:
        return (
          new Date(b.last_commit_date || b.updated_at).getTime() -
          new Date(a.last_commit_date || a.updated_at).getTime()
        );
    }
  });

  // Calculate stats
  const stats = {
    total: projects.length,
    storyComplete: projects.filter((p) => getProjectStatus(p) === "complete")
      .length,
    needsAttention: projects.filter(
      (p) =>
        getProjectStatus(p) === "needs-review" ||
        getProjectStatus(p) === "draft"
    ).length,
    inPortfolio: projects.filter((p) => p.in_portfolio === true).length,
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="ml-0 md:ml-[72px] flex-1">
        {/* Header Section */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 md:px-10 py-4 md:py-6 pl-16 md:pl-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div className="w-full md:w-auto">
                <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                  <h1
                    className={`text-xl md:text-[28px] font-bold text-gray-900 ${newsreader.className}`}
                  >
                    Projects
                  </h1>
                  <span className="text-lg md:text-xl text-gray-500">
                    ({projects.length})
                  </span>
                </div>
                <p
                  className={`text-xs md:text-sm text-gray-600 mt-1 ${sansation.className}`}
                >
                  Manage your GitHub repositories and portfolio stories
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                {/* Sync Button */}
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 text-xs md:text-sm"
                >
                  <RefreshCw
                    size={16}
                    className={`text-gray-500 ${syncing ? "animate-spin" : ""}`}
                  />
                  <span className="font-medium text-gray-700 hidden sm:inline">
                    {syncing ? "Syncing..." : "Sync"}
                  </span>
                </button>

                {/* View Toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`w-9 h-9 flex items-center justify-center transition-colors ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-400 hover:bg-gray-50"
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid3x3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`w-9 h-9 flex items-center justify-center transition-colors ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-400 hover:bg-gray-50"
                    }`}
                    aria-label="List view"
                  >
                    <List size={16} />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative flex-1 md:flex-none">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto text-xs md:text-sm"
                  >
                    <span className="font-medium text-gray-700 truncate">
                      <span className="hidden sm:inline">Sort: </span>
                      {sortBy === "recent"
                        ? "Recent"
                        : sortBy === "alphabetical"
                          ? "A-Z"
                          : sortBy === "story"
                            ? "Story"
                            : sortBy === "portfolio"
                              ? "Portfolio"
                              : "Complex"}
                    </span>
                    <ChevronDown size={14} className="text-gray-500 shrink-0" />
                  </button>

                  <AnimatePresence>
                    {showSortDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
                      >
                        {[
                          {
                            value: "recent" as SortOption,
                            label: "Recently updated",
                          },
                          {
                            value: "alphabetical" as SortOption,
                            label: "Alphabetical (A-Z)",
                          },
                          {
                            value: "story" as SortOption,
                            label: "Story status",
                          },
                          {
                            value: "portfolio" as SortOption,
                            label: "Portfolio first",
                          },
                          {
                            value: "complex" as SortOption,
                            label: "Most complex",
                          },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setShowSortDropdown(false);
                            }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <span>{option.label}</span>
                            {sortBy === option.value && (
                              <Check size={16} className="text-blue-600" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Filters & Search Bar */}
        <div className="px-4 md:px-10 py-4 md:py-6 bg-gray-50 border-b border-gray-200 overflow-x-hidden">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 w-full md:max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 md:h-11 pl-10 pr-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
              {[
                {
                  value: "all" as FilterOption,
                  label: "All Projects",
                  icon: null,
                },
                {
                  value: "portfolio" as FilterOption,
                  label: "In Portfolio",
                  icon: Briefcase,
                  count: stats.inPortfolio,
                },
                {
                  value: "story-ready" as FilterOption,
                  label: "Story Ready",
                  icon: CheckCircle,
                },
                {
                  value: "needs-attention" as FilterOption,
                  label: "Needs Attention",
                  icon: AlertTriangle,
                },
                {
                  value: "recent" as FilterOption,
                  label: "Recently Added",
                  icon: Clock,
                },
              ].map((filter) => {
                const Icon = filter.icon as React.ComponentType<{
                  size: number;
                }> | null;
                const isActive = activeFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-xs md:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {Icon && <Icon size={12} />}
                    <span className="hidden sm:inline">{filter.label}</span>
                    <span className="sm:hidden">
                      {filter.label.split(" ")[0]}
                    </span>
                    {filter.count !== undefined && (
                      <span className="text-xs opacity-70">
                        ({filter.count})
                      </span>
                    )}
                    {isActive && filter.value !== "all" && (
                      <X
                        size={12}
                        className="ml-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFilter("all");
                        }}
                      />
                    )}
                  </button>
                );
              })}

              {activeFilter !== "all" && (
                <button
                  onClick={() => setActiveFilter("all")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="px-4 md:px-10 py-3 md:py-4 bg-blue-50 border-b border-blue-100 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-3 md:gap-10 min-w-max">
            <div className="flex items-center gap-1.5 md:gap-2">
              <BarChart3 size={14} className="text-blue-600 shrink-0" />
              <span className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                {stats.total} repos
              </span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <CheckCircle size={14} className="text-blue-600 shrink-0" />
              <span className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                {stats.storyComplete} complete
              </span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <AlertTriangle size={14} className="text-blue-600 shrink-0" />
              <span className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                {stats.needsAttention} need attention
              </span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <Briefcase size={14} className="text-blue-600 shrink-0" />
              <span className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                {stats.inPortfolio} in portfolio
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="px-4 md:px-10 py-4 md:py-6 pb-20 max-w-[1600px] mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <Loader2
                size={48}
                className="text-gray-400 animate-spin mx-auto mb-4"
              />
              <p className="text-gray-500">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <FolderX size={64} className="text-gray-300 mx-auto mb-6" />
              <h2
                className={`text-2xl font-bold text-gray-900 mb-2 ${newsreader.className}`}
              >
                No projects yet
              </h2>
              <p className="text-base text-gray-600 leading-relaxed mb-8">
                Connect your GitHub account to analyze your repositories and
                generate portfolio stories.
              </p>
              <button
                onClick={handleSync}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <RefreshCw size={18} />
                <span>Sync GitHub</span>
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <Search size={64} className="text-gray-300 mx-auto mb-6" />
              <h2
                className={`text-2xl font-bold text-gray-900 mb-2 ${newsreader.className}`}
              >
                No projects found
              </h2>
              <p className="text-base text-gray-600 mb-8">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProjects.map((project, index) => {
                const status = getProjectStatus(project);
                const statusBadge = getStatusBadge(status);
                const primaryAction = getPrimaryAction(status, project);
                const languages = getLanguageArray(project.languages);
                const StatusIcon = statusBadge.icon;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all overflow-hidden flex flex-col min-h-[320px]"
                  >
                    {/* Thumbnail */}
                    <div
                      className="h-40 relative flex items-center justify-center"
                      style={{
                        background: getLanguageGradient(project.languages),
                      }}
                    >
                      <div className="text-white text-6xl opacity-20 font-mono font-bold">
                        {languages[0]?.slice(0, 2).toUpperCase() || "{}"}
                      </div>
                      {project.in_portfolio && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-sm">
                          <Star size={12} fill="white" />
                          <span>In Portfolio</span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="flex-1 flex flex-col p-5">
                      {/* Header */}
                      <div className="mb-4">
                        <h3
                          className={`text-lg font-bold text-gray-900 mb-2 truncate hover:text-blue-600 transition-colors cursor-pointer ${newsreader.className}`}
                        >
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}
                          >
                            <StatusIcon
                              size={12}
                              className={
                                status === "generating" ? "animate-spin" : ""
                              }
                            />
                            <span>{statusBadge.text}</span>
                          </div>
                          {/* Content indicators */}
                          {(project.has_story ||
                            project.has_bullets ||
                            project.has_readme) && (
                            <div className="flex items-center gap-1">
                              {project.has_story && (
                                <div
                                  className="w-5 h-5 rounded bg-green-100 flex items-center justify-center"
                                  title="Has STAR story"
                                >
                                  <FileText
                                    size={10}
                                    className="text-green-600"
                                  />
                                </div>
                              )}
                              {project.has_bullets && (
                                <div
                                  className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center"
                                  title="Has resume bullets"
                                >
                                  <CheckCircle
                                    size={10}
                                    className="text-blue-600"
                                  />
                                </div>
                              )}
                              {project.has_readme && (
                                <div
                                  className="w-5 h-5 rounded bg-purple-100 flex items-center justify-center"
                                  title="Has README"
                                >
                                  <FileText
                                    size={10}
                                    className="text-purple-600"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p
                        className={`text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed ${sansation.className}`}
                      >
                        {project.description || (
                          <span className="italic text-gray-400">
                            No description provided
                          </span>
                        )}
                      </p>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {languages.slice(0, 4).map((lang) => (
                          <span
                            key={lang}
                            className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                          >
                            {lang}
                          </span>
                        ))}
                        {languages.length > 4 && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                            +{languages.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Star size={14} />
                          {project.stars}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitCommit size={14} />
                          {project.forks}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatTimeAgo(
                            project.last_commit_date || project.updated_at
                          )}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="mt-auto pt-4 border-t border-gray-200 bg-gray-50 -mx-5 -mb-5 px-5 py-4 flex items-center gap-2">
                        <Link
                          href={`/projects/${project.id}/story`}
                          className={`flex-1 text-center px-4 py-2 rounded-lg transition-colors text-sm font-medium ${primaryAction.className}`}
                        >
                          {primaryAction.text}
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setDropdownOpen(
                                dropdownOpen === project.id ? null : project.id
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="More options"
                          >
                            <MoreVertical size={18} className="text-gray-400" />
                          </button>
                          <AnimatePresence>
                            {dropdownOpen === project.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.1 }}
                                className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
                              >
                                <Link
                                  href={`/readme-generator?projectId=${project.id}`}
                                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                  <Sparkles size={14} />
                                  <span>Generate README</span>
                                </Link>
                                <Link
                                  href={`/projects/${project.id}/story`}
                                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                  <BookOpen size={14} />
                                  <span>Generate Story</span>
                                </Link>
                                <div className="border-t border-gray-200" />
                                <a
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                  <ExternalLink size={14} />
                                  <span>View on GitHub</span>
                                </a>
                                <button
                                  onClick={() =>
                                    togglePortfolio(
                                      project.id,
                                      project.in_portfolio || false
                                    )
                                  }
                                  disabled={togglingPortfolio === project.id}
                                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                                    project.in_portfolio
                                      ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                                      : "text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  {togglingPortfolio === project.id ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Star
                                      size={14}
                                      fill={
                                        project.in_portfolio
                                          ? "currentColor"
                                          : "none"
                                      }
                                    />
                                  )}
                                  <span>
                                    {project.in_portfolio
                                      ? "Remove from Portfolio"
                                      : "Add to Portfolio"}
                                  </span>
                                </button>
                                <div className="border-t border-gray-200" />
                                <button
                                  onClick={() =>
                                    handleDeleteProject(
                                      project.id,
                                      project.name
                                    )
                                  }
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <XCircle size={14} />
                                  <span>Delete</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project, index) => {
                const status = getProjectStatus(project);
                const statusBadge = getStatusBadge(status);
                const primaryAction = getPrimaryAction(status, project);
                const languages = getLanguageArray(project.languages);
                const StatusIcon = statusBadge.icon;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all overflow-hidden"
                  >
                    <div className="flex items-center gap-5 p-5">
                      {/* Thumbnail */}
                      <div
                        className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: getLanguageGradient(project.languages),
                        }}
                      >
                        <div className="text-white text-2xl opacity-30 font-mono font-bold">
                          {languages[0]?.slice(0, 2).toUpperCase() || "{}"}
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3
                            className={`text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer ${newsreader.className}`}
                          >
                            {project.name}
                          </h3>
                          {project.in_portfolio && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex-shrink-0">
                              <Star size={10} fill="currentColor" />
                              <span>Portfolio</span>
                            </div>
                          )}
                        </div>
                        <p
                          className={`text-sm text-gray-600 mb-3 line-clamp-1 ${sansation.className}`}
                        >
                          {project.description || (
                            <span className="italic text-gray-400">
                              No description provided
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          {languages.slice(0, 5).map((lang) => (
                            <span
                              key={lang}
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                            >
                              {lang}
                            </span>
                          ))}
                          {languages.length > 5 && (
                            <span className="text-xs text-gray-500">
                              +{languages.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusBadge.className}`}
                        >
                          <StatusIcon
                            size={14}
                            className={
                              status === "generating" ? "animate-spin" : ""
                            }
                          />
                          <span>{statusBadge.text}</span>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-col gap-1 text-xs text-gray-500 flex-shrink-0">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTimeAgo(
                            project.last_commit_date || project.updated_at
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={12} />
                          {project.stars} stars
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          href={`/projects/${project.id}/story`}
                          className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${primaryAction.className}`}
                        >
                          {primaryAction.text}
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setDropdownOpen(
                                dropdownOpen === project.id ? null : project.id
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-white transition-colors"
                            aria-label="More options"
                          >
                            <MoreVertical size={18} className="text-gray-400" />
                          </button>
                          <AnimatePresence>
                            {dropdownOpen === project.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.1 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
                              >
                                <Link
                                  href={`/readme-generator?projectId=${project.id}`}
                                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                  <Sparkles size={14} />
                                  <span>Generate README</span>
                                </Link>
                                <Link
                                  href={`/projects/${project.id}/story`}
                                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                  <BookOpen size={14} />
                                  <span>Generate Story</span>
                                </Link>
                                <div className="border-t border-gray-200" />
                                <a
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                  <ExternalLink size={14} />
                                  <span>View on GitHub</span>
                                </a>
                                <button
                                  onClick={() =>
                                    togglePortfolio(
                                      project.id,
                                      project.in_portfolio || false
                                    )
                                  }
                                  disabled={togglingPortfolio === project.id}
                                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                                    project.in_portfolio
                                      ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                                      : "text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  {togglingPortfolio === project.id ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Star
                                      size={14}
                                      fill={
                                        project.in_portfolio
                                          ? "currentColor"
                                          : "none"
                                      }
                                    />
                                  )}
                                  <span>
                                    {project.in_portfolio
                                      ? "Remove from Portfolio"
                                      : "Add to Portfolio"}
                                  </span>
                                </button>
                                <div className="border-t border-gray-200" />
                                <button
                                  onClick={() =>
                                    handleDeleteProject(
                                      project.id,
                                      project.name
                                    )
                                  }
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <XCircle size={14} />
                                  <span>Delete</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
