"use client";

import { useState, useEffect } from "react";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import { ProjectRow } from "@/types";

interface PortfolioConfig {
  selectedProjects: string[];
  theme: "minimalist" | "modern-dark" | "creative";
  name: string;
  bio: string;
  linkedinUrl: string;
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

  const [config, setConfig] = useState<PortfolioConfig>({
    selectedProjects: [],
    theme: "minimalist",
    name: "John Doe",
    bio: "Full-stack developer passionate about building innovative web applications and solving complex problems.",
    linkedinUrl: "",
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

  useEffect(() => {
    fetchProjects();
    fetchUserData();
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
      } else {
        alert("Failed to download portfolio");
      }
    } catch (error) {
      console.error("Error downloading portfolio:", error);
      alert("An error occurred while downloading");
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

  async function generatePortfolio() {
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/portfolio-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedUrl(data.url);
        const toast = await import("react-hot-toast");
        toast.default.success(
          "Portfolio deployed to GitHub Pages successfully!",
          { duration: 5000 }
        );
      } else {
        const error = await response.json();
        const toast = await import("react-hot-toast");
        toast.default.error(error.error || "Failed to generate portfolio");
      }
    } catch (error) {
      console.error("Error generating portfolio:", error);
      const toast = await import("react-hot-toast");
      toast.default.error("An error occurred while generating portfolio");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f6f7f8]">
      <CollapsibleSidebar />

      <main className="flex-1 p-8 overflow-y-auto ml-20">
        <div className="max-w-7xl mx-auto">
          {/* Page Heading */}
          <header className="flex flex-wrap justify-between gap-3 mb-8">
            <div className="flex min-w-72 flex-col gap-2">
              <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-slate-900">
                Your Portfolio Website
              </h1>
              <p className="text-base font-normal leading-normal text-slate-500">
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
                    className={`${previewMode === "mobile" ? "max-w-sm mx-auto" : ""} aspect-[16/10] bg-gradient-to-b from-slate-900 to-slate-800 rounded border border-slate-700 overflow-hidden shadow-2xl`}
                  >
                    <div className="h-full overflow-y-auto">
                      {/* Navigation Bar */}
                      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700 px-4 py-2 flex justify-between items-center">
                        <p className="text-xs text-gray-400 font-medium">
                          {config.name || "Your Name"}
                        </p>
                        <div className="flex gap-3 text-xs text-gray-400">
                          <span>Home</span>
                          <span>Projects</span>
                          <span>About</span>
                        </div>
                      </div>

                      {/* Hero Section */}
                      <div className="px-6 py-12 text-center">
                        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                          {config.name || "Your Name"}
                        </h1>
                        <p className="text-sm text-blue-400 mb-3 font-semibold">
                          Software Engineer
                        </p>
                        <p className="text-xs text-gray-300 leading-relaxed mb-4 max-w-md mx-auto">
                          {config.bio ||
                            "Your bio will appear here. Add a compelling description about yourself."}
                        </p>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded text-xs font-semibold hover:bg-blue-600 transition-all">
                          View my Work
                        </button>
                      </div>

                      {/* Projects Section */}
                      {config.sections.projects && (
                        <div className="px-6 py-4">
                          <h2 className="text-lg font-bold text-white mb-3">
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
                                  className="bg-slate-800 border border-slate-700 rounded-lg p-4"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-sm font-bold text-blue-400">
                                      {project.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="text-yellow-400">
                                        ⭐ {project.stars || 0}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-300 line-clamp-2">
                                    {project.description ||
                                      "Project description"}
                                  </p>
                                </div>
                              ))}
                            {config.selectedProjects.length === 0 && (
                              <p className="text-xs text-gray-500 italic text-center py-4">
                                Select projects to display them here
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Skills Section */}
                      {config.sections.skills && (
                        <div className="px-6 py-4">
                          <h2 className="text-lg font-bold text-white mb-3">
                            Skills & Technologies
                          </h2>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "JavaScript",
                              "React",
                              "Node.js",
                              "TypeScript",
                              "Python",
                            ].map((skill) => (
                              <div
                                key={skill}
                                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
                              >
                                <span className="text-xs font-medium text-gray-200">
                                  {skill}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* About Section */}
                      {config.sections.about && (
                        <div className="px-6 py-4">
                          <h2 className="text-lg font-bold text-white mb-3">
                            About Me
                          </h2>
                          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                            <p className="text-xs text-gray-300 leading-relaxed">
                              {config.bio ||
                                "Hi, I'm a passionate Software Engineer with a knack for crafting seamless digital experiences."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Contact Section */}
                      {config.sections.contact && (
                        <div className="px-6 py-4 pb-6">
                          <h2 className="text-lg font-bold text-white mb-3">
                            Contact
                          </h2>
                          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                              <span className="material-symbols-outlined text-gray-400 text-sm">
                                email
                              </span>
                              <span>your.email@example.com</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                              <span className="material-symbols-outlined text-gray-400 text-sm">
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
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={generatePortfolio}
                    disabled={
                      generating || config.selectedProjects.length === 0
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
