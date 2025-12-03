"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProjectRow } from "@/types";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import MobileNav from "@/components/MobileNav";
import Link from "next/link";
import { marked } from "marked";
import { showSuccess, showError } from "@/lib/utils/toast";

type TabType = "summary" | "stories" | "bullets" | "readme";

interface GeneratedContent {
  id: string;
  content: string;
  content_type: string;
  created_at: string;
}

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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>(
    []
  );
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    story: {
      status: "pending" as "pending" | "loading" | "success" | "error",
      message: "",
    },
    bullets: {
      status: "pending" as "pending" | "loading" | "success" | "error",
      message: "",
    },
    readme: {
      status: "pending" as "pending" | "loading" | "success" | "error",
      message: "",
    },
  });
  const [projectSummary, setProjectSummary] = useState<{
    description: string;
    keyFeatures: string[];
  } | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    async function loadData() {
      await fetchProject();
      await fetchGeneratedContent();
      await fetchProjectSummary();
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function fetchProject() {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      } else {
        router.push("/projects");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchGeneratedContent() {
    try {
      const response = await fetch(`/api/projects/${projectId}/content`);
      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.content || []);
      }
    } catch (error) {
      console.error("Error fetching generated content:", error);
    }
  }

  async function fetchProjectSummary() {
    setLoadingSummary(true);
    try {
      const response = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Summary API response:", data);
        try {
          // Clean up the response - remove markdown code blocks if present
          let cleanedSummary = data.summary.trim();
          if (cleanedSummary.startsWith("```json")) {
            cleanedSummary = cleanedSummary
              .replace(/```json\n?/g, "")
              .replace(/```\n?/g, "");
          } else if (cleanedSummary.startsWith("```")) {
            cleanedSummary = cleanedSummary.replace(/```\n?/g, "");
          }
          cleanedSummary = cleanedSummary.trim();

          const parsed = JSON.parse(cleanedSummary);
          console.log("Parsed summary:", parsed);
          setProjectSummary(parsed);
        } catch (e) {
          console.error("Failed to parse summary JSON:", data.summary, e);
          // If not JSON, use fallback
          setProjectSummary(null);
        }
      } else {
        const error = await response.json();
        console.error("Summary API error:", error);
      }
    } catch (error) {
      console.error("Error fetching project summary:", error);
    } finally {
      setLoadingSummary(false);
    }
  }

  async function handleGenerateAll() {
    if (!project) return;
    setGenerating(true);

    // Reset progress
    setGenerationProgress({
      story: { status: "pending", message: "" },
      bullets: { status: "pending", message: "" },
      readme: { status: "pending", message: "" },
    });

    try {
      // Generate STAR story
      setGenerationProgress((prev) => ({
        ...prev,
        story: { status: "loading", message: "Generating STAR story..." },
      }));

      const storyResponse = await fetch("/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      if (storyResponse.ok) {
        setGenerationProgress((prev) => ({
          ...prev,
          story: { status: "success", message: "STAR story generated!" },
        }));
      } else {
        setGenerationProgress((prev) => ({
          ...prev,
          story: { status: "error", message: "Failed to generate STAR story" },
        }));
      }

      // Generate bullets
      setGenerationProgress((prev) => ({
        ...prev,
        bullets: { status: "loading", message: "Generating resume bullets..." },
      }));

      const bulletsResponse = await fetch("/api/ai/bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      if (bulletsResponse.ok) {
        setGenerationProgress((prev) => ({
          ...prev,
          bullets: { status: "success", message: "Resume bullets generated!" },
        }));
      } else {
        setGenerationProgress((prev) => ({
          ...prev,
          bullets: { status: "error", message: "Failed to generate bullets" },
        }));
      }

      // Generate README only if one doesn't exist
      const existingReadme = getReadmeContent();

      if (!existingReadme) {
        setGenerationProgress((prev) => ({
          ...prev,
          readme: { status: "loading", message: "Generating README..." },
        }));

        const readmeResponse = await fetch("/api/ai/readme", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            template: "detailed", // Use detailed template for Generate All
          }),
        });

        if (readmeResponse.ok) {
          setGenerationProgress((prev) => ({
            ...prev,
            readme: { status: "success", message: "README generated!" },
          }));
        } else {
          setGenerationProgress((prev) => ({
            ...prev,
            readme: { status: "error", message: "Failed to generate README" },
          }));
        }
      } else {
        setGenerationProgress((prev) => ({
          ...prev,
          readme: {
            status: "success",
            message: "README already exists (skipped)",
          },
        }));
      }

      // Wait a moment to show completion, then reload data
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await fetchProject();
      await fetchGeneratedContent();
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setGenerating(false);
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

    if (diffInDays === 0) return "today";
    if (diffInDays === 1) return "yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getTechStack = (
    languages: Record<string, number> | null | undefined
  ): string[] => {
    if (!languages) return [];
    return Object.keys(languages).sort((a, b) => languages[b] - languages[a]);
  };

  const getStoryContent = () => {
    return generatedContent.find((c) => c.content_type === "story");
  };

  const getBulletsContent = () => {
    return generatedContent.find((c) => c.content_type === "bullet");
  };

  const getReadmeContent = () => {
    return generatedContent.find((c) => c.content_type === "readme");
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#f6f7f8]">
        <MobileNav />
        <CollapsibleSidebar />
        <main className="pt-16 md:pt-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 ml-0 md:ml-20">
          <div className="text-center py-20">
            <p className="text-gray-500">Loading project...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const primaryLang = getPrimaryLanguage(project.languages);
  const langColor = getLanguageColor(primaryLang);
  const techStack = getTechStack(project.languages);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f7f8]">
      <MobileNav />
      <CollapsibleSidebar />

      <main className="pt-16 md:pt-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 ml-0 md:ml-20">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <header className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Link
                href="/projects"
                className="text-gray-600 text-sm sm:text-lg font-medium hover:text-[#4c96e1] transition-colors"
              >
                Projects
              </Link>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-gray-600"
              >
                <path d="M9.29 6.71a.996.996 0 0 0 0 1.41L13.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z" />
              </svg>
              <span className="text-sm sm:text-lg font-medium text-black truncate">
                {project.name}
              </span>
            </div>

            {/* Project Header */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-black break-words">
                  {project.name}
                </h2>
                <p className="text-gray-600 mt-1 max-w-2xl">
                  {project.description || "No description available"}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: langColor }}
                    ></div>
                    <span>{primaryLang}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="font-medium text-black">
                      {project.stars}
                    </span>{" "}
                    stars
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                    <span className="font-medium text-black">
                      {project.forks}
                    </span>{" "}
                    forks
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
                    </svg>
                    <span>
                      Updated {formatTimeAgo(project.last_commit_date)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
                {project.in_portfolio && (
                  <div
                    className="text-sm font-semibold py-1.5 px-3 rounded-full flex items-center gap-1.5"
                    style={{
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                      color: "#16a34a",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                    </svg>
                    In Portfolio
                  </div>
                )}
                <button
                  onClick={handleGenerateAll}
                  disabled={generating}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-lg h-11 px-4 sm:px-6 font-semibold transition-all duration-300 transform hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  style={{ backgroundColor: "#4c96e1", color: "white" }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5z" />
                  </svg>
                  <span>{generating ? "Generating..." : "Generate All"}</span>
                </button>
              </div>
            </div>
          </header>

          {/* Tabs */}
          <div className="border-b border-gray-300 mb-6 overflow-x-auto">
            <div className="flex items-center gap-1 sm:gap-2 min-w-max">
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-3 sm:px-4 py-2.5 border-b-2 font-semibold transition-colors duration-200 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "summary"
                    ? "border-[#4c96e1] text-[#4c96e1]"
                    : "border-transparent text-gray-600 hover:text-black"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                </svg>
                <span>Summary & Skills</span>
              </button>
              <button
                onClick={() => setActiveTab("stories")}
                className={`px-3 sm:px-4 py-2.5 border-b-2 font-medium transition-colors duration-200 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "stories"
                    ? "border-[#4c96e1] text-[#4c96e1]"
                    : "border-transparent text-gray-600 hover:text-black"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>STAR Stories</span>
              </button>
              <button
                onClick={() => setActiveTab("bullets")}
                className={`px-3 sm:px-4 py-2.5 border-b-2 font-medium transition-colors duration-200 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "bullets"
                    ? "border-[#4c96e1] text-[#4c96e1]"
                    : "border-transparent text-gray-600 hover:text-black"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                </svg>
                <span>Resume Bullets</span>
              </button>
              <button
                onClick={() => setActiveTab("readme")}
                className={`px-3 sm:px-4 py-2.5 border-b-2 font-medium transition-colors duration-200 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "readme"
                    ? "border-[#4c96e1] text-[#4c96e1]"
                    : "border-transparent text-gray-600 hover:text-black"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                </svg>
                <span>README.md</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {activeTab === "summary" && (
              <>
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-bold mb-4 text-black">
                      Project Summary
                    </h3>
                    {loadingSummary ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 rounded-full border-2 border-[#4c96e1] border-t-transparent animate-spin"></div>
                      </div>
                    ) : projectSummary ? (
                      <div className="space-y-4 text-gray-600 leading-relaxed">
                        <div>
                          <h4 className="font-semibold text-black mb-2 flex items-center gap-2">
                            <span>📋</span> Description
                          </h4>
                          <p>{projectSummary.description}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-black mb-2 flex items-center gap-2">
                            <span>📌</span> Key Features
                          </h4>
                          <ul className="list-disc list-inside space-y-1">
                            {projectSummary.keyFeatures.map(
                              (feature, index) => (
                                <li key={index}>{feature}</li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 text-gray-600 leading-relaxed">
                        <div>
                          <h4 className="font-semibold text-black mb-2 flex items-center gap-2">
                            <span>📋</span> Description
                          </h4>
                          <p>
                            {project.description ||
                              "This project demonstrates modern software development practices and technical expertise."}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-black mb-2 flex items-center gap-2">
                            <span>📌</span> Key Features
                          </h4>
                          <ul className="list-disc list-inside space-y-1">
                            <li>
                              Built with {getPrimaryLanguage(project.languages)}{" "}
                              and {techStack.length} technologies
                            </li>
                            <li>
                              {project.stars} stars and {project.forks} forks
                              from the developer community
                            </li>
                            <li>
                              Active development with last update{" "}
                              {formatTimeAgo(project.last_commit_date)}
                            </li>
                            <li>
                              Demonstrates proficiency in modern development
                              practices and clean code architecture
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-bold mb-4 text-black">
                      Languages & Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-sm font-medium py-1 px-3 rounded-full"
                          style={{
                            backgroundColor: "rgba(76, 150, 225, 0.1)",
                            color: "#4c96e1",
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-bold mb-4 text-black">
                      Repository Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Stars</span>
                        <span className="font-semibold text-black">
                          {project.stars}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Forks</span>
                        <span className="font-semibold text-black">
                          {project.forks}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Languages</span>
                        <span className="font-semibold text-black">
                          {techStack.length}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                          style={{
                            backgroundColor: "rgba(76, 150, 225, 0.1)",
                            color: "#4c96e1",
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          View on GitHub
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "stories" && (
              <div className="lg:col-span-3">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-black">
                        STAR Stories
                      </h3>
                      {getStoryContent() && (
                        <p className="text-sm text-gray-500 mt-1">
                          Generated{" "}
                          {formatTimeAgo(getStoryContent()?.created_at)}
                        </p>
                      )}
                    </div>
                    {getStoryContent() && (
                      <button
                        onClick={async () => {
                          try {
                            const content = getStoryContent()?.content || "";
                            await navigator.clipboard.writeText(content);
                            showSuccess("Copied to clipboard!");
                          } catch (error) {
                            console.error("Failed to copy:", error);
                            showError("Failed to copy to clipboard");
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                        style={{
                          backgroundColor: "rgba(76, 150, 225, 0.1)",
                          color: "#4c96e1",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                          />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy
                      </button>
                    )}
                  </div>
                  {getStoryContent() ? (
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-gray-600 bg-gray-50 p-4 rounded-lg">
                        {getStoryContent()?.content}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="mx-auto mb-4 text-gray-300"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <p className="text-gray-600 mb-2">
                        No STAR stories generated yet.
                      </p>
                      <p className="text-sm text-gray-500">
                        Click &quot;Generate All&quot; to create interview-ready
                        stories.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "bullets" && (
              <div className="lg:col-span-3">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-black">
                        Resume Bullets
                      </h3>
                      {getBulletsContent() && (
                        <p className="text-sm text-gray-500 mt-1">
                          Generated{" "}
                          {formatTimeAgo(getBulletsContent()?.created_at)}
                        </p>
                      )}
                    </div>
                    {getBulletsContent() && (
                      <button
                        onClick={async () => {
                          const content = getBulletsContent()?.content || "";
                          // Format bullets for clipboard
                          let formattedContent = content;
                          try {
                            const parsed = JSON.parse(content);
                            if (Array.isArray(parsed)) {
                              formattedContent = parsed
                                .map((b: string | { text: string }) =>
                                  typeof b === "string"
                                    ? `• ${b}`
                                    : `• ${b.text}`
                                )
                                .join("\n");
                            }
                          } catch {
                            // Use as-is if not JSON
                          }
                          await navigator.clipboard.writeText(formattedContent);
                          const { showSuccess } = await import(
                            "@/lib/utils/toast"
                          );
                          showSuccess("Copied to clipboard!");
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                        style={{
                          backgroundColor: "rgba(76, 150, 225, 0.1)",
                          color: "#4c96e1",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                          />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy All
                      </button>
                    )}
                  </div>
                  {getBulletsContent() ? (
                    <div className="space-y-3">
                      {(() => {
                        try {
                          const content = getBulletsContent()?.content || "";
                          // Try to parse as JSON first
                          const parsed = JSON.parse(content);
                          if (Array.isArray(parsed)) {
                            return parsed.map(
                              (
                                bullet: string | { text: string },
                                index: number
                              ) => (
                                <div
                                  key={index}
                                  className="group flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors relative"
                                >
                                  <span className="text-[#4c96e1] font-bold mt-1">
                                    •
                                  </span>
                                  <p className="text-gray-700 leading-relaxed flex-1">
                                    {typeof bullet === "string"
                                      ? bullet
                                      : bullet.text || ""}
                                  </p>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const text =
                                          typeof bullet === "string"
                                            ? bullet
                                            : bullet.text || "";
                                        await navigator.clipboard.writeText(
                                          text
                                        );
                                        showSuccess("Copied!");
                                      } catch (error) {
                                        console.error("Failed to copy:", error);
                                        showError("Failed to copy");
                                      }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-white"
                                    title="Copy this bullet"
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      className="text-gray-500"
                                    >
                                      <rect
                                        x="9"
                                        y="9"
                                        width="13"
                                        height="13"
                                        rx="2"
                                        ry="2"
                                      />
                                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                  </button>
                                </div>
                              )
                            );
                          }
                        } catch {
                          // If not JSON, split by bullet points or newlines
                          const content = getBulletsContent()?.content || "";
                          const bullets = content
                            .split(/\n|•/)
                            .map((b) => b.trim())
                            .filter((b) => b.length > 0);

                          return bullets.map((bullet, index) => (
                            <div
                              key={index}
                              className="group flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors relative"
                            >
                              <span className="text-[#4c96e1] font-bold mt-1">
                                •
                              </span>
                              <p className="text-gray-700 leading-relaxed flex-1">
                                {bullet}
                              </p>
                              <button
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(bullet);
                                    showSuccess("Copied!");
                                  } catch (error) {
                                    console.error("Failed to copy:", error);
                                    showError("Failed to copy");
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-white"
                                title="Copy this bullet"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="text-gray-500"
                                >
                                  <rect
                                    x="9"
                                    y="9"
                                    width="13"
                                    height="13"
                                    rx="2"
                                    ry="2"
                                  />
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                              </button>
                            </div>
                          ));
                        }
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="mx-auto mb-4 text-gray-300"
                      >
                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" />
                        <path d="M14 2v6h6" />
                      </svg>
                      <p className="text-gray-600 mb-2">
                        No resume bullets generated yet.
                      </p>
                      <p className="text-sm text-gray-500">
                        Click &quot;Generate All&quot; to create professional
                        resume content.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "readme" && (
              <div className="lg:col-span-3">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-black">
                        README.md Preview
                      </h3>
                      {getReadmeContent() && (
                        <p className="text-sm text-gray-500 mt-1">
                          Generated{" "}
                          {formatTimeAgo(getReadmeContent()?.created_at)}
                        </p>
                      )}
                    </div>
                    {getReadmeContent() && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const content = getReadmeContent()?.content || "";
                              await navigator.clipboard.writeText(content);
                              showSuccess("Copied to clipboard!");
                            } catch (error) {
                              console.error("Failed to copy:", error);
                              showError("Failed to copy to clipboard");
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                          style={{
                            backgroundColor: "rgba(76, 150, 225, 0.1)",
                            color: "#4c96e1",
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect
                              x="9"
                              y="9"
                              width="13"
                              height="13"
                              rx="2"
                              ry="2"
                            />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          Copy
                        </button>
                        <a
                          href={`${project.url}/blob/main/README.md`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                          style={{
                            backgroundColor: "rgba(76, 150, 225, 0.1)",
                            color: "#4c96e1",
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          View on GitHub
                        </a>
                      </div>
                    )}
                  </div>
                  {getReadmeContent() ? (
                    <div
                      className="prose prose-slate max-w-none prose-headings:text-black prose-p:text-black prose-a:text-[#4c96e1] prose-strong:text-black prose-code:text-[#4c96e1] prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-black"
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(getReadmeContent()?.content || ""),
                      }}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="mx-auto mb-4 text-gray-300"
                      >
                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" />
                        <path d="M14 2v6h6" />
                      </svg>
                      <p className="text-gray-600 mb-2">
                        No README generated yet.
                      </p>
                      <p className="text-sm text-gray-500">
                        Click &quot;Generate All&quot; to create a professional
                        README file.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {generating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-6 text-black text-center">
              Generating Content
            </h3>

            <div className="space-y-4">
              {/* STAR Story Progress */}
              <div className="flex items-center gap-3">
                {generationProgress.story.status === "pending" && (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                )}
                {generationProgress.story.status === "loading" && (
                  <div className="w-6 h-6 rounded-full border-2 border-[#4c96e1] border-t-transparent animate-spin"></div>
                )}
                {generationProgress.story.status === "success" && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
                {generationProgress.story.status === "error" && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-black">STAR Story</p>
                  <p className="text-sm text-gray-600">
                    {generationProgress.story.message}
                  </p>
                </div>
              </div>

              {/* Resume Bullets Progress */}
              <div className="flex items-center gap-3">
                {generationProgress.bullets.status === "pending" && (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                )}
                {generationProgress.bullets.status === "loading" && (
                  <div className="w-6 h-6 rounded-full border-2 border-[#4c96e1] border-t-transparent animate-spin"></div>
                )}
                {generationProgress.bullets.status === "success" && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
                {generationProgress.bullets.status === "error" && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-black">Resume Bullets</p>
                  <p className="text-sm text-gray-600">
                    {generationProgress.bullets.message}
                  </p>
                </div>
              </div>

              {/* README Progress */}
              <div className="flex items-center gap-3">
                {generationProgress.readme.status === "pending" && (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                )}
                {generationProgress.readme.status === "loading" && (
                  <div className="w-6 h-6 rounded-full border-2 border-[#4c96e1] border-t-transparent animate-spin"></div>
                )}
                {generationProgress.readme.status === "success" && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
                {generationProgress.readme.status === "error" && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-black">README</p>
                  <p className="text-sm text-gray-600">
                    {generationProgress.readme.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#4c96e1] h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      ((generationProgress.story.status === "success" ||
                      generationProgress.story.status === "error"
                        ? 1
                        : 0) +
                        (generationProgress.bullets.status === "success" ||
                        generationProgress.bullets.status === "error"
                          ? 1
                          : 0) +
                        (generationProgress.readme.status === "success" ||
                        generationProgress.readme.status === "error"
                          ? 1
                          : 0)) *
                      33.33
                    }%`,
                  }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                {generationProgress.story.status === "success" ||
                generationProgress.story.status === "error"
                  ? 1
                  : 0}{" "}
                +
                {generationProgress.bullets.status === "success" ||
                generationProgress.bullets.status === "error"
                  ? 1
                  : 0}{" "}
                +
                {generationProgress.readme.status === "success" ||
                generationProgress.readme.status === "error"
                  ? 1
                  : 0}{" "}
                of 3 completed
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
