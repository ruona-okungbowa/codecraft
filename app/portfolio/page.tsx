"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import MobileNav from "@/components/MobileNav";
import { ProjectRow } from "@/types";

interface PortfolioConfig {
  selectedProjects: string[];
  colorMode: "light" | "dark";
  accentColor: "blue" | "purple" | "green" | "orange" | "pink" | "red";
  name: string;
  bio: string;
  sections: {
    about: boolean;
    projects: boolean;
    skills: boolean;
    contact: boolean;
  };
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [githubConnected, setGithubConnected] = useState<boolean | null>(null);

  const [config, setConfig] = useState<PortfolioConfig>({
    selectedProjects: [],
    colorMode: "dark", // Always dark mode
    accentColor: "blue",
    name: "John Doe",
    bio: "Full-stack developer passionate about building innovative web applications and solving complex problems.",
    sections: {
      about: true,
      projects: true,
      skills: true,
      contact: true,
    },
  });

  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop"
  );

  // Color mapping for preview
  const colorMap = {
    blue: { primary: "#4c96e1", light: "#60a5fa" },
    purple: { primary: "#9333ea", light: "#a855f7" },
    green: { primary: "#10b981", light: "#34d399" },
    orange: { primary: "#f97316", light: "#fb923c" },
    pink: { primary: "#ec4899", light: "#f472b6" },
    red: { primary: "#ef4444", light: "#f87171" },
  };

  const currentColor = colorMap[config.accentColor];
  const isDarkMode = config.colorMode === "dark";

  useEffect(() => {
    async function checkGitHubConnectionStatus() {
      const isConnected = await checkGitHubConnection();
      setGithubConnected(isConnected);
    }

    fetchProjects();
    fetchUserData();
    checkGitHubConnectionStatus();
  }, []);

  async function fetchUserData() {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        const name = data.first_name || data.github_username || "John Doe";
        setConfig((prev) => ({
          ...prev,
          name: name,
        }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  async function fetchProjects() {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);

        // Pre-select projects that are in portfolio
        const portfolioProjects = data.projects
          .filter((p: ProjectRow) => p.in_portfolio)
          .map((p: ProjectRow) => p.id);

        setConfig((prev) => ({
          ...prev,
          selectedProjects: portfolioProjects,
        }));
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }

  async function downloadAsZip() {
    try {
      const response = await fetch("/api/portfolio/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${config.name.replace(/\s+/g, "-").toLowerCase()}-portfolio.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Portfolio downloaded successfully!");
      } else {
        toast.error("Failed to download portfolio");
      }
    } catch (error) {
      console.error("Error downloading portfolio:", error);
      toast.error("An error occurred while downloading");
    }
  }

  function toggleProject(projectId: string) {
    setConfig((prev) => ({
      ...prev,
      selectedProjects: prev.selectedProjects.includes(projectId)
        ? prev.selectedProjects.filter((id) => id !== projectId)
        : [...prev.selectedProjects, projectId],
    }));
  }

  function toggleAllProjects() {
    if (config.selectedProjects.length === projects.length) {
      setConfig((prev) => ({ ...prev, selectedProjects: [] }));
    } else {
      setConfig((prev) => ({
        ...prev,
        selectedProjects: projects.map((p) => p.id),
      }));
    }
  }

  async function checkGitHubConnection() {
    try {
      // Check if user has a valid GitHub token by making a simple API call
      const response = await fetch("/api/github/repos");
      return response.ok;
    } catch {
      return false;
    }
  }

  async function generatePortfolio() {
    setGenerating(true);

    try {
      // First, check if GitHub connection is valid
      const isConnected = await checkGitHubConnection();

      if (!isConnected) {
        toast.error(
          "GitHub connection expired. Please log out and log back in to reconnect.",
          {
            duration: 8000,
            icon: "🔒",
          }
        );
        setGenerating(false);
        return;
      }

      const response = await fetch("/api/ai/portfolio-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedUrl(data.url);
        toast.success("Portfolio deployed to GitHub Pages successfully!", {
          duration: 5000,
        });
      } else {
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));

        // Special handling for GitHub token errors
        if (
          response.status === 401 &&
          typeof error.error === "string" &&
          error.error.includes("GitHub token")
        ) {
          toast.error(
            "GitHub connection expired. Please log out and log back in to reconnect.",
            {
              duration: 8000,
              icon: "🔒",
            }
          );
        } else {
          toast.error(error.error || "Failed to generate portfolio");
        }
      }
    } catch (error) {
      console.error("Error generating portfolio:", error);
      toast.error("An error occurred while generating portfolio");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f6f7f8]">
      <MobileNav />
      <CollapsibleSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto ml-0 md:ml-20">
        <div className="max-w-7xl mx-auto">
          {/* Page Heading */}
          <header className="flex flex-wrap justify-between gap-3 mb-6 sm:mb-8">
            <div className="flex min-w-0 sm:min-w-72 flex-col gap-2">
              <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] text-slate-900">
                Your Portfolio Website
              </h1>
              <p className="text-sm sm:text-base font-normal leading-normal text-slate-500">
                Configure, preview, and deploy your personal portfolio with
                ease.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Configuration */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-slate-900">
                Configuration
              </h2>

              {/* Accordions */}
              <div className="flex flex-col gap-3">
                {/* Project Selection */}
                <details
                  className="flex flex-col rounded border border-slate-200 bg-white px-4 py-2 group"
                  open
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 list-none">
                    <p className="text-sm font-medium leading-normal text-slate-900">
                      Project Selection
                    </p>
                    <span className="material-symbols-outlined text-slate-900 group-open:rotate-180 transition-transform">
                      expand_more
                    </span>
                  </summary>
                  <div className="pt-2 pb-2 border-t border-slate-200">
                    {loading ? (
                      <p className="text-sm text-slate-500 py-3">
                        Loading projects...
                      </p>
                    ) : (
                      <>
                        <label className="flex gap-x-3 py-3 flex-row items-center cursor-pointer">
                          <input
                            checked={
                              config.selectedProjects.length === projects.length
                            }
                            onChange={toggleAllProjects}
                            className="h-5 w-5 rounded border-slate-300 bg-transparent text-[#4c96e1] focus:ring-[#4c96e1]"
                            type="checkbox"
                          />
                          <p className="text-base font-normal leading-normal text-slate-900">
                            Select all
                          </p>
                        </label>
                        {projects.map((project) => (
                          <label
                            key={project.id}
                            className="flex gap-x-3 py-3 flex-row items-center cursor-pointer"
                          >
                            <input
                              checked={config.selectedProjects.includes(
                                project.id
                              )}
                              onChange={() => toggleProject(project.id)}
                              className="h-5 w-5 rounded border-slate-300 bg-transparent text-[#4c96e1] focus:ring-[#4c96e1]"
                              type="checkbox"
                            />
                            <p
                              className={`text-base font-normal leading-normal ${
                                config.selectedProjects.includes(project.id)
                                  ? "text-slate-900"
                                  : "text-slate-500"
                              }`}
                            >
                              {project.name}
                            </p>
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                </details>

                {/* Personal Information */}
                <details className="flex flex-col rounded border border-slate-200 bg-white px-4 py-2 group">
                  <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 list-none">
                    <p className="text-sm font-medium leading-normal text-slate-900">
                      Personal Information
                    </p>
                    <span className="material-symbols-outlined text-slate-900 group-open:rotate-180 transition-transform">
                      expand_more
                    </span>
                  </summary>
                  <div className="pt-4 pb-2 border-t border-slate-200 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Name
                      </label>
                      <input
                        className="w-full rounded border-slate-300 bg-[#f6f7f8] text-slate-900 focus:ring-[#4c96e1] focus:border-[#4c96e1]"
                        placeholder="Your Name"
                        type="text"
                        value={config.name}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        className="w-full rounded border-slate-300 bg-[#f6f7f8] text-slate-900 focus:ring-[#4c96e1] focus:border-[#4c96e1]"
                        placeholder="Your Bio"
                        rows={3}
                        value={config.bio}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </details>

                {/* Sections to Include */}
                <details className="flex flex-col rounded border border-slate-200 bg-white px-4 py-2 group">
                  <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 list-none">
                    <p className="text-sm font-medium leading-normal text-slate-900">
                      Sections to Include
                    </p>
                    <span className="material-symbols-outlined text-slate-900 group-open:rotate-180 transition-transform">
                      expand_more
                    </span>
                  </summary>
                  <div className="pt-2 pb-2 border-t border-slate-200">
                    {Object.entries(config.sections).map(([key, value]) => (
                      <label
                        key={key}
                        className="flex gap-x-3 py-3 flex-row items-center cursor-pointer"
                      >
                        <input
                          checked={value}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              sections: {
                                ...prev.sections,
                                [key]: e.target.checked,
                              },
                            }))
                          }
                          className="h-5 w-5 rounded border-slate-300 bg-transparent text-[#4c96e1] focus:ring-[#4c96e1]"
                          type="checkbox"
                        />
                        <p
                          className={`text-base font-normal leading-normal ${
                            value ? "text-slate-900" : "text-slate-500"
                          }`}
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </p>
                      </label>
                    ))}
                  </div>
                </details>

                {/* Appearance Customization */}
                <details className="flex flex-col rounded border border-slate-200 bg-white px-4 py-2 group">
                  <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 list-none">
                    <p className="text-sm font-medium leading-normal text-slate-900">
                      Appearance
                    </p>
                    <span className="material-symbols-outlined text-slate-900 group-open:rotate-180 transition-transform">
                      expand_more
                    </span>
                  </summary>
                  <div className="pt-4 pb-2 border-t border-slate-200 space-y-4">
                    {/* Accent Color */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Accent Color
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { name: "blue", color: "#4c96e1", label: "Blue" },
                          { name: "purple", color: "#9333ea", label: "Purple" },
                          { name: "green", color: "#10b981", label: "Green" },
                          { name: "orange", color: "#f97316", label: "Orange" },
                          { name: "pink", color: "#ec4899", label: "Pink" },
                          { name: "red", color: "#ef4444", label: "Red" },
                        ].map((color) => (
                          <button
                            key={color.name}
                            onClick={() =>
                              setConfig((prev) => ({
                                ...prev,
                                accentColor:
                                  color.name as typeof config.accentColor,
                              }))
                            }
                            className={`p-3 rounded-lg border-2 transition-all ${
                              config.accentColor === color.name
                                ? "border-slate-900 scale-105"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <div
                                className="w-6 h-6 rounded-full"
                                style={{ backgroundColor: color.color }}
                              />
                              <span className="text-xs font-medium">
                                {color.label}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>

            {/* Right Column: Preview & Actions */}
            <div className="flex flex-col gap-8">
              {/* Preview */}
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-slate-900">Preview</h2>
                <div className="p-4 rounded-lg bg-white border border-slate-200">
                  <div className="flex justify-end items-center mb-4 gap-2">
                    <button
                      onClick={() => setPreviewMode("desktop")}
                      className={`p-2 rounded-full ${
                        previewMode === "desktop"
                          ? "bg-[#4c96e1]/20 text-[#4c96e1]"
                          : "text-slate-500"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        desktop_windows
                      </span>
                    </button>
                    <button
                      onClick={() => setPreviewMode("mobile")}
                      className={`p-2 rounded-full ${
                        previewMode === "mobile"
                          ? "bg-[#4c96e1]/20 text-[#4c96e1]"
                          : "text-slate-500"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        phone_iphone
                      </span>
                    </button>
                  </div>
                  <div
                    className={`${previewMode === "mobile" ? "max-w-sm mx-auto" : ""} aspect-16/10 rounded border overflow-hidden shadow-2xl`}
                    style={{
                      background: isDarkMode
                        ? "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)"
                        : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                      borderColor: isDarkMode ? "#334155" : "#e2e8f0",
                    }}
                  >
                    <div className="h-full overflow-y-auto">
                      {/* Navigation Bar */}
                      <div
                        className="backdrop-blur-md border-b px-4 py-2 flex justify-between items-center"
                        style={{
                          backgroundColor: isDarkMode
                            ? "rgba(15, 23, 42, 0.9)"
                            : "rgba(255, 255, 255, 0.9)",
                          borderColor: isDarkMode ? "#334155" : "#e2e8f0",
                        }}
                      >
                        <p
                          className="text-xs font-medium"
                          style={{
                            color: isDarkMode ? "#cbd5e1" : "#475569",
                          }}
                        >
                          {config.name || "Your Name"}
                        </p>
                        <div
                          className="flex gap-3 text-xs"
                          style={{
                            color: isDarkMode ? "#cbd5e1" : "#475569",
                          }}
                        >
                          <span>Home</span>
                          <span>Projects</span>
                          <span>About</span>
                        </div>
                      </div>

                      {/* Hero Section */}
                      <div className="px-6 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                          <div>
                            <h1
                              className="text-3xl font-bold mb-2"
                              style={{
                                color: "#f1f5f9",
                              }}
                            >
                              {config.name || "YOUR NAME"}
                            </h1>
                            <p
                              className="text-sm mb-4 font-light leading-relaxed"
                              style={{ color: "rgba(255, 255, 255, 0.9)" }}
                            >
                              {config.bio ||
                                "Full-stack developer passionate about building innovative web applications and solving complex problems."}
                            </p>
                            <div className="flex gap-2">
                              <button
                                className="text-xs font-semibold px-4 py-2 rounded transition-all"
                                style={{
                                  backgroundColor: "white",
                                  color: "#1e3a8a",
                                }}
                              >
                                VIEW MY WORK
                              </button>
                              <button
                                className="text-xs font-semibold px-4 py-2 rounded transition-all flex items-center gap-1"
                                style={{
                                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                                  color: "white",
                                  border: "1px solid rgba(255, 255, 255, 0.3)",
                                }}
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                GITHUB
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-center">
                            <img
                              src="/portfolio.jpg"
                              alt="Portfolio preview"
                              className="rounded-lg shadow-xl w-full max-w-md object-cover"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Projects Section */}
                      {config.sections.projects && (
                        <div className="px-6 py-4">
                          <h2
                            className="text-lg font-bold mb-3"
                            style={{
                              color: isDarkMode ? "#f1f5f9" : "#0f172a",
                            }}
                          >
                            Featured Projects
                          </h2>
                          <div className="space-y-3">
                            {projects
                              .filter((p) =>
                                config.selectedProjects.includes(p.id)
                              )
                              .slice(0, 2)
                              .map((project) => (
                                <div
                                  key={project.id}
                                  className="border rounded-lg p-4"
                                  style={{
                                    backgroundColor: isDarkMode
                                      ? "#1e293b"
                                      : "#ffffff",
                                    borderColor: isDarkMode
                                      ? "#334155"
                                      : "#cbd5e1",
                                  }}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h3
                                      className="text-sm font-bold"
                                      style={{ color: currentColor.primary }}
                                    >
                                      {project.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="text-yellow-400">
                                        ⭐ {project.stars || 0}
                                      </span>
                                    </div>
                                  </div>
                                  <p
                                    className="text-xs line-clamp-2"
                                    style={{
                                      color: isDarkMode ? "#cbd5e1" : "#475569",
                                    }}
                                  >
                                    {project.description ||
                                      "Project description"}
                                  </p>
                                </div>
                              ))}
                            {config.selectedProjects.length === 0 && (
                              <p
                                className="text-xs italic text-center py-4"
                                style={{
                                  color: isDarkMode ? "#64748b" : "#94a3b8",
                                }}
                              >
                                Select projects to display them here
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Skills Section */}
                      {config.sections.skills && (
                        <div className="px-6 py-6">
                          <h2
                            className="text-lg font-bold mb-4 text-center"
                            style={{
                              color: "#f1f5f9",
                            }}
                          >
                            Skills & Technologies
                          </h2>
                          <div className="relative flex justify-center items-center gap-8 py-4">
                            {/* Frontend Group */}
                            <div className="relative flex flex-col items-center">
                              <div
                                className="w-16 h-16 rounded-full flex items-center justify-center text-[8px] font-bold"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #667eea, #764ba2)",
                                  boxShadow:
                                    "0 0 20px rgba(102, 126, 234, 0.5)",
                                }}
                              >
                                FRONTEND
                              </div>
                              {/* Skill nodes around frontend */}
                              <div className="absolute w-32 h-32 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div
                                  className="absolute w-8 h-8 rounded-full flex items-center justify-center text-[6px] border"
                                  style={{
                                    top: "-10px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    backgroundColor: "rgba(15, 30, 50, 0.9)",
                                    borderColor: "rgba(66, 153, 225, 0.3)",
                                  }}
                                >
                                  ⚛️
                                </div>
                                <div
                                  className="absolute w-8 h-8 rounded-full flex items-center justify-center text-[6px] border"
                                  style={{
                                    top: "20%",
                                    right: "0",
                                    backgroundColor: "rgba(15, 30, 50, 0.9)",
                                    borderColor: "rgba(66, 153, 225, 0.3)",
                                  }}
                                >
                                  🟨
                                </div>
                                <div
                                  className="absolute w-8 h-8 rounded-full flex items-center justify-center text-[6px] border"
                                  style={{
                                    bottom: "20%",
                                    right: "0",
                                    backgroundColor: "rgba(15, 30, 50, 0.9)",
                                    borderColor: "rgba(66, 153, 225, 0.3)",
                                  }}
                                >
                                  🎨
                                </div>
                              </div>
                            </div>

                            {/* Backend Group */}
                            <div className="relative flex flex-col items-center">
                              <div
                                className="w-16 h-16 rounded-full flex items-center justify-center text-[8px] font-bold"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #a855f7, #ec4899)",
                                  boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)",
                                }}
                              >
                                BACKEND
                              </div>
                              {/* Skill nodes around backend */}
                              <div className="absolute w-32 h-32 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div
                                  className="absolute w-8 h-8 rounded-full flex items-center justify-center text-[6px] border"
                                  style={{
                                    top: "-10px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    backgroundColor: "rgba(15, 30, 50, 0.9)",
                                    borderColor: "rgba(66, 153, 225, 0.3)",
                                  }}
                                >
                                  🟢
                                </div>
                                <div
                                  className="absolute w-8 h-8 rounded-full flex items-center justify-center text-[6px] border"
                                  style={{
                                    top: "20%",
                                    right: "0",
                                    backgroundColor: "rgba(15, 30, 50, 0.9)",
                                    borderColor: "rgba(66, 153, 225, 0.3)",
                                  }}
                                >
                                  🐍
                                </div>
                                <div
                                  className="absolute w-8 h-8 rounded-full flex items-center justify-center text-[6px] border"
                                  style={{
                                    bottom: "20%",
                                    right: "0",
                                    backgroundColor: "rgba(15, 30, 50, 0.9)",
                                    borderColor: "rgba(66, 153, 225, 0.3)",
                                  }}
                                >
                                  🐘
                                </div>
                              </div>
                            </div>

                            {/* DevTools Group */}
                            <div className="relative flex flex-col items-center">
                              <div
                                className="w-16 h-16 rounded-full flex items-center justify-center text-[7px] font-bold"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #14b8a6, #06b6d4)",
                                  boxShadow: "0 0 20px rgba(20, 184, 166, 0.5)",
                                }}
                              >
                                DEVOPS
                              </div>
                              {/* Skill nodes around devtools */}
                              <div className="absolute w-32 h-32 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div
                                  className="absolute w-8 h-8 rounded-full flex items-center justify-center text-[6px] border"
                                  style={{
                                    top: "-10px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    backgroundColor: "rgba(15, 30, 50, 0.9)",
                                    borderColor: "rgba(66, 153, 225, 0.3)",
                                  }}
                                >
                                  🐳
                                </div>
                                <div
                                  className="absolute w-8 h-8 rounded-full flex items-center justify-center text-[6px] border"
                                  style={{
                                    top: "20%",
                                    right: "0",
                                    backgroundColor: "rgba(15, 30, 50, 0.9)",
                                    borderColor: "rgba(66, 153, 225, 0.3)",
                                  }}
                                >
                                  ☁️
                                </div>
                                <div
                                  className="absolute w-8 h-8 rounded-full flex items-center justify-center text-[6px] border"
                                  style={{
                                    bottom: "20%",
                                    right: "0",
                                    backgroundColor: "rgba(15, 30, 50, 0.9)",
                                    borderColor: "rgba(66, 153, 225, 0.3)",
                                  }}
                                >
                                  🔧
                                </div>
                              </div>
                            </div>

                            {/* Connection lines between groups */}
                            <svg
                              className="absolute inset-0 w-full h-full pointer-events-none"
                              style={{ zIndex: 0 }}
                            >
                              <line
                                x1="33%"
                                y1="50%"
                                x2="50%"
                                y2="50%"
                                stroke="rgba(66, 153, 225, 0.2)"
                                strokeWidth="1"
                              />
                              <line
                                x1="50%"
                                y1="50%"
                                x2="67%"
                                y2="50%"
                                stroke="rgba(66, 153, 225, 0.2)"
                                strokeWidth="1"
                              />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* About Section */}
                      {config.sections.about && (
                        <div className="px-6 py-4">
                          <h2
                            className="text-lg font-bold mb-3"
                            style={{
                              color: isDarkMode ? "#f1f5f9" : "#0f172a",
                            }}
                          >
                            About Me
                          </h2>
                          <div
                            className="border rounded-lg p-4"
                            style={{
                              backgroundColor: isDarkMode
                                ? "#1e293b"
                                : "#ffffff",
                              borderColor: isDarkMode ? "#334155" : "#cbd5e1",
                            }}
                          >
                            <p
                              className="text-xs leading-relaxed"
                              style={{
                                color: isDarkMode ? "#cbd5e1" : "#475569",
                              }}
                            >
                              {config.bio ||
                                "Hi, I'm a passionate Software Engineer with a knack for crafting seamless digital experiences."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Contact Section */}
                      {config.sections.contact && (
                        <div className="px-6 py-4 pb-6">
                          <h2
                            className="text-lg font-bold mb-3"
                            style={{
                              color: isDarkMode ? "#f1f5f9" : "#0f172a",
                            }}
                          >
                            Contact
                          </h2>
                          <div
                            className="border rounded-lg p-4 space-y-2"
                            style={{
                              backgroundColor: isDarkMode
                                ? "#1e293b"
                                : "#ffffff",
                              borderColor: isDarkMode ? "#334155" : "#cbd5e1",
                            }}
                          >
                            <div
                              className="flex items-center gap-2 text-xs"
                              style={{
                                color: isDarkMode ? "#cbd5e1" : "#475569",
                              }}
                            >
                              <span
                                className="material-symbols-outlined text-sm"
                                style={{
                                  color: isDarkMode ? "#94a3b8" : "#64748b",
                                }}
                              >
                                email
                              </span>
                              <span>your.email@example.com</span>
                            </div>
                            <div
                              className="flex items-center gap-2 text-xs"
                              style={{
                                color: isDarkMode ? "#cbd5e1" : "#475569",
                              }}
                            >
                              <span
                                className="material-symbols-outlined text-sm"
                                style={{
                                  color: isDarkMode ? "#94a3b8" : "#64748b",
                                }}
                              >
                                link
                              </span>
                              <span>github.com/yourusername</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-slate-900">Actions</h2>

                {/* GitHub Connection Warning */}
                {githubConnected === false && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                    <span className="text-orange-600 text-lg">⚠️</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-orange-900">
                        GitHub Connection Required
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        Please log out and log back in to reconnect your GitHub
                        account before deploying.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={generatePortfolio}
                    disabled={
                      generating ||
                      config.selectedProjects.length === 0 ||
                      githubConnected === false
                    }
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-4 bg-[#4c96e1] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#3a7bc8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? "Deploying..." : "Deploy to GitHub Pages"}
                  </button>
                  <button
                    onClick={downloadAsZip}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-4 bg-[#4c96e1]/20 text-[#4c96e1] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#4c96e1]/30 transition-colors"
                  >
                    Download as ZIP
                  </button>
                </div>
                <p className="text-sm text-slate-500 text-center">
                  Deploy creates a live website on GitHub Pages. Download gives
                  you the HTML files to host anywhere.
                </p>

                {/* Generated URL Display */}
                {generatedUrl && (
                  <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-green-600 mt-0.5">
                        check_circle
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-900 mb-1">
                          Portfolio deployed successfully!
                        </p>
                        <a
                          href={generatedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {generatedUrl}
                        </a>
                        <p className="text-xs text-slate-600 mt-2">
                          Note: It may take a few minutes for GitHub Pages to
                          publish your site.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
