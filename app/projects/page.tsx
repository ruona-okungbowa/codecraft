"use client";

import { useEffect, useState } from "react";
import { ProjectRow } from "@/types";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import MobileNav from "@/components/MobileNav";
import Link from "next/link";

// Material Symbols icons as SVG components
const MaterialIcon = ({
  name,
  filled = false,
}: {
  name: string;
  filled?: boolean;
}) => {
  const icons: Record<string, React.ReactElement> = {
    search: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    star: filled ? (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ) : (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    more_horiz: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="18" cy="12" r="2" />
      </svg>
    ),
    expand_more: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 10l5 5 5-5z" />
      </svg>
    ),
    folder_off: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z" />
      </svg>
    ),
    grid_view: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
      </svg>
    ),
    view_list: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 14h4v-4H3v4zm0 5h4v-4H3v4zM3 9h4V5H3v4zm5 5h13v-4H8v4zm0 5h13v-4H8v4zM8 5v4h13V5H8z" />
      </svg>
    ),
  };
  return icons[name] || <span>{name}</span>;
};

const GitHubIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0c-2.4-1.6-3.5-1.3-3.5-1.3a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.5-.6 1.2-.5 2V21" />
  </svg>
);

const ForkIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

type SortOption = "updated" | "name" | "stars" | "score";

const languageColors: Record<string, string> = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3776ab",
  Java: "#f89820",
  Ruby: "#cc342d",
  Go: "#00add8",
  Rust: "#ce422b",
  PHP: "#777bb4",
  "Node.js": "#68a063",
  default: "#9ca3af",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdown) setOpenDropdown(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openDropdown]);

  async function fetchProjects() {
    try {
      setError(null);
      const response = await fetch("/api/projects");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load projects");
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load projects. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setError(null);
    const { showSuccess, showError, showLoading, dismissToast } = await import(
      "@/lib/utils/toast"
    );
    const toastId = showLoading("Syncing repositories from GitHub...");

    try {
      const response = await fetch("/api/github/repos", { method: "GET" });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to sync projects");
      }

      const data = await response.json();
      await fetchProjects();

      dismissToast(toastId);
      showSuccess(
        `Successfully synced ${data.count} project${data.count !== 1 ? "s" : ""}!`
      );

      if (data.errors && data.errors.length > 0) {
        showError(
          `${data.errors.length} project${data.errors.length !== 1 ? "s" : ""} failed to sync`
        );
      }
    } catch (error) {
      dismissToast(toastId);
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred while syncing projects.";
      showError(message);
    } finally {
      setSyncing(false);
    }
  }

  async function togglePortfolio(projectId: string, currentStatus: boolean) {
    const { showSuccess, showError } = await import("@/lib/utils/toast");

    // Optimistic update
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, in_portfolio: !currentStatus } : p
      )
    );
    setOpenDropdown(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/portfolio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inPortfolio: !currentStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update portfolio status");
      }

      showSuccess(
        !currentStatus ? "Added to portfolio!" : "Removed from portfolio"
      );
    } catch (error) {
      // Revert optimistic update
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, in_portfolio: currentStatus } : p
        )
      );
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update portfolio status.";
      showError(message);
    }
  }

  const getPrimaryLanguage = (
    languages: Record<string, number> | null | undefined
  ): string => {
    if (!languages || Object.keys(languages).length === 0) return "Code";
    const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  };

  const getLanguageColor = (language: string): string => {
    return languageColors[language] || languageColors.default;
  };

  const formatTimeAgo = (dateString: string | undefined): string => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getAllLanguages = (): string[] => {
    const languageSet = new Set<string>();
    projects.forEach((project) => {
      if (project.languages) {
        Object.keys(project.languages).forEach((lang) => languageSet.add(lang));
      }
    });
    return Array.from(languageSet).sort();
  };

  // Filter and sort projects
  let filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLanguage =
      languageFilter === "all" ||
      (project.languages &&
        Object.keys(project.languages).includes(languageFilter));

    return matchesSearch && matchesLanguage;
  });

  // Sort projects
  filteredProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "stars":
        return (b.stars || 0) - (a.stars || 0);
      case "score":
        return (b.complexity_score || 0) - (a.complexity_score || 0);
      default: // "updated"
        return (
          new Date(b.last_commit_date || b.updated_at).getTime() -
          new Date(a.last_commit_date || a.updated_at).getTime()
        );
    }
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f7f8]">
      <MobileNav />
      <CollapsibleSidebar />

      <main className="pt-16 md:pt-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 ml-0 md:ml-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Your Projects
              </h2>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg h-11 px-6 font-semibold transition-all duration-300 hover:scale-105 shadow-sm bg-[#4c96e1] hover:bg-[#3a7bc8] text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <GitHubIcon />
                <span>{syncing ? "Syncing..." : "Sync with GitHub"}</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="relative sm:col-span-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <MaterialIcon name="search" />
                </span>
                <input
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-[#4c96e1] focus:border-[#4c96e1] focus:outline-none transition text-gray-900 placeholder:text-gray-500 text-sm sm:text-base"
                  placeholder="Search by name, language..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="relative">
                <select
                  className="w-full h-11 appearance-none px-4 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-[#4c96e1] focus:border-[#4c96e1] focus:outline-none transition text-gray-900 text-sm sm:text-base"
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                >
                  <option value="all">All Languages</option>
                  {getAllLanguages().map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <MaterialIcon name="expand_more" />
                </span>
              </div>

              <div className="relative">
                <select
                  className="w-full h-11 appearance-none px-4 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-[#4c96e1] focus:border-[#4c96e1] focus:outline-none transition text-gray-900 text-sm sm:text-base"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="updated">Sort by: Last updated</option>
                  <option value="name">Sort by: Name</option>
                  <option value="stars">Sort by: Stars</option>
                  <option value="score">Sort by: Score</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <MaterialIcon name="expand_more" />
                </span>
              </div>
            </div>
          </header>

          {/* View Toggle and Count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <p className="text-xs sm:text-sm text-gray-600">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
            <div className="flex items-center gap-2 p-1 rounded-lg bg-gray-100 border border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-[#4c96e1]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                aria-label="Grid view"
              >
                <MaterialIcon name="grid_view" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-[#4c96e1]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                aria-label="List view"
              >
                <MaterialIcon name="view_list" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-xl shadow-sm animate-pulse"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex items-center justify-between border-y border-gray-200 py-3 my-3">
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
                    <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold mb-2 text-black">
                Failed to Load Projects
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchProjects}
                className="px-6 py-3 bg-[#4c96e1] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="mt-12 sm:mt-16 text-center px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#4c96e1]/10">
                <span className="text-[#4c96e1]">
                  <MaterialIcon name="folder_off" />
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">
                No repositories found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm sm:text-base">
                Connect your GitHub account and sync your repositories to start
                building your portfolio. We&apos;ll analyze your projects and
                help you create professional content.
              </p>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 font-semibold transition-all duration-300 hover:scale-105 shadow-sm mx-auto bg-[#4c96e1] hover:bg-[#3a7bc8] text-white text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <GitHubIcon />
                <span>{syncing ? "Syncing..." : "Sync repositories"}</span>
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="mt-12 sm:mt-16 text-center px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-gray-100">
                <span className="text-gray-400 text-5xl">🔍</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">
                No projects match your filters
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto text-sm sm:text-base">
                Try adjusting your search or filter criteria to find what
                you&apos;re looking for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setLanguageFilter("all");
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
              >
                Clear filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const primaryLang = getPrimaryLanguage(project.languages);
                const langColor = getLanguageColor(primaryLang);

                return (
                  <div
                    key={project.id}
                    className="bg-white p-4 sm:p-6 rounded-xl shadow-sm flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Project Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                      <div className="flex-1 min-w-0">
                        <Link href={`/projects/${project.id}`}>
                          <h3 className="font-bold text-base sm:text-lg text-black hover:text-[#4c96e1] transition-colors cursor-pointer truncate">
                            {project.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-900 mt-1">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: langColor }}
                          ></div>
                          <span>{primaryLang}</span>
                        </div>
                      </div>
                      {project.in_portfolio && (
                        <div
                          className="text-xs font-semibold py-1 px-2.5 rounded-full self-start whitespace-nowrap"
                          style={{
                            backgroundColor: "rgba(34, 197, 94, 0.1)",
                            color: "#16a34a",
                          }}
                        >
                          In Portfolio
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-900 grow mb-4 line-clamp-2">
                      {project.description || "No description available"}
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-900 border-y border-gray-200 py-3 my-3 gap-2">
                      <div className="flex items-center gap-1.5">
                        <MaterialIcon name="star" />
                        <span className="font-medium">{project.stars}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ForkIcon />
                        <span className="font-medium">{project.forks}</span>
                      </div>
                      <span className="text-xs">
                        {formatTimeAgo(project.last_commit_date)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
                      <Link
                        href={`/projects/${project.id}`}
                        className="flex-1 text-xs sm:text-sm text-center font-semibold py-2.5 px-3 rounded-lg transition-colors hover:bg-[#4c96e1]/20 min-w-0"
                        style={{
                          backgroundColor: "rgba(76, 150, 225, 0.1)",
                          color: "#4c96e1",
                        }}
                      >
                        Generate STAR
                      </Link>
                      <Link
                        href={`/projects/${project.id}`}
                        className="flex-1 text-xs sm:text-sm text-center font-semibold py-2.5 px-3 rounded-lg transition-colors hover:bg-[#4c96e1]/20 min-w-0"
                        style={{
                          backgroundColor: "rgba(76, 150, 225, 0.1)",
                          color: "#4c96e1",
                        }}
                      >
                        README
                      </Link>
                      <div className="relative sm:flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(
                              openDropdown === project.id ? null : project.id
                            );
                          }}
                          className="w-full sm:w-auto p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                        >
                          <MaterialIcon name="more_horiz" />
                        </button>
                        {openDropdown === project.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                          >
                            <button
                              onClick={() =>
                                togglePortfolio(
                                  project.id,
                                  project.in_portfolio || false
                                )
                              }
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-t-lg"
                            >
                              {project.in_portfolio
                                ? "Remove from Portfolio"
                                : "Add to Portfolio"}
                            </button>
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-b-lg"
                            >
                              View on GitHub
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => {
                const primaryLang = getPrimaryLanguage(project.languages);
                const langColor = getLanguageColor(primaryLang);

                return (
                  <div
                    key={project.id}
                    className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Left: Project Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <Link href={`/projects/${project.id}`}>
                            <h3 className="font-bold text-base sm:text-lg text-black truncate hover:text-[#4c96e1] transition-colors cursor-pointer">
                              {project.name}
                            </h3>
                          </Link>
                          {project.in_portfolio && (
                            <div
                              className="text-xs font-semibold py-1 px-2.5 rounded-full whitespace-nowrap self-start"
                              style={{
                                backgroundColor: "rgba(34, 197, 94, 0.1)",
                                color: "#16a34a",
                              }}
                            >
                              In Portfolio
                            </div>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-900 mb-3 line-clamp-2">
                          {project.description || "No description available"}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-900">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: langColor }}
                            ></div>
                            <span>{primaryLang}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MaterialIcon name="star" />
                            <span className="font-medium">{project.stars}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ForkIcon />
                            <span className="font-medium">{project.forks}</span>
                          </div>
                          <span className="hidden sm:inline">
                            Last commit:{" "}
                            {formatTimeAgo(project.last_commit_date)}
                          </span>
                          <span className="sm:hidden">
                            {formatTimeAgo(project.last_commit_date)}
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <Link
                          href={`/projects/${project.id}?tab=story`}
                          className="text-xs sm:text-sm font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors hover:bg-[#4c96e1]/20 whitespace-nowrap text-center"
                          style={{
                            backgroundColor: "rgba(76, 150, 225, 0.1)",
                            color: "#4c96e1",
                          }}
                        >
                          Generate STAR
                        </Link>
                        <Link
                          href={`/projects/${project.id}?tab=readme`}
                          className="text-xs sm:text-sm font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors hover:bg-[#4c96e1]/20 whitespace-nowrap text-center"
                          style={{
                            backgroundColor: "rgba(76, 150, 225, 0.1)",
                            color: "#4c96e1",
                          }}
                        >
                          README
                        </Link>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(
                                openDropdown === project.id ? null : project.id
                              );
                            }}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <MaterialIcon name="more_horiz" />
                          </button>
                          {openDropdown === project.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                            >
                              <button
                                onClick={() =>
                                  togglePortfolio(
                                    project.id,
                                    project.in_portfolio || false
                                  )
                                }
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-t-lg"
                              >
                                {project.in_portfolio
                                  ? "Remove from Portfolio"
                                  : "Add to Portfolio"}
                              </button>
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-b-lg"
                              >
                                View on GitHub
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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
