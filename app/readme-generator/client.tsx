"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Project } from "@/types";
import { ReadmeTemplate } from "@/types/readme";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import { marked } from "marked";

export interface ProjectConfig {
  installation: boolean;
  usage: boolean;
  api: boolean;
  contributing: boolean;
  license: boolean;
  badges: boolean;
  demo: boolean;
}

export interface ProfileConfig {
  includeStats: boolean;
  includeTopLanguages: boolean;
  includeProjects: boolean;
  includeSkills: boolean;
  includeContact: boolean;
  includeSocials: boolean;
}

export default function ReadmeClient() {
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get("projectId");

  // Add Material Symbols CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }`;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projectIdFromUrl
  );
  const [templateType, setTemplateType] = useState<"project" | "profile">(
    projectIdFromUrl ? "project" : "profile"
  );
  const [template] = useState<ReadmeTemplate>("professional");
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    installation: true,
    usage: true,
    api: false,
    contributing: true,
    license: true,
    badges: true,
    demo: true,
  });
  const [profileConfig, setProfileConfig] = useState<ProfileConfig>({
    includeStats: true,
    includeTopLanguages: true,
    includeProjects: true,
    includeSkills: true,
    includeContact: true,
    includeSocials: true,
  });
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const renderMarkdown = (markdown: string) => {
    return marked(markdown, { breaks: true, gfm: true });
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      if (templateType === "profile") {
        const response = await fetch("/api/ai/readme/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ template, config: profileConfig }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate README");
        }

        const data = await response.json();
        setContent(data.content);
      } else {
        if (!selectedProjectId) {
          setError("Please select a project");
          return;
        }

        const response = await fetch("/api/ai/readme/project", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: selectedProjectId,
            template,
            config: projectConfig,
            forceRegenerate: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate README");
        }

        const data = await response.json();
        setContent(data.content);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    import("react-hot-toast").then((toast) => {
      toast.default.success("Copied to clipboard!");
    });
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeployReadme = async () => {
    try {
      const response = await fetch("/api/ai/readme/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: templateType === "profile" ? "profile" : "project",
          content,
          projectId: templateType !== "profile" ? selectedProjectId : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Deployment failed");
      }

      const data = await response.json();
      const toast = await import("react-hot-toast");

      if (data.pullRequestUrl) {
        toast.default.success(
          `README deployed! Pull request created: ${data.pullRequestUrl}`,
          { duration: 7000 }
        );
      } else {
        toast.default.success("README deployed successfully to repository!", {
          duration: 5000,
        });
      }
    } catch (err) {
      const toast = await import("react-hot-toast");
      toast.default.error(
        err instanceof Error ? err.message : "Failed to deploy README"
      );
    }
  };

  const currentConfig =
    templateType === "profile" ? profileConfig : projectConfig;
  const configLabels =
    templateType === "profile"
      ? {
          includeStats: "GitHub Stats",
          includeTopLanguages: "Top Languages",
          includeProjects: "Featured Projects",
          includeSkills: "Skills & Tech Stack",
          includeContact: "Contact Info",
          includeSocials: "Social Links",
        }
      : {
          installation: "Installation",
          usage: "Usage",
          api: "API Documentation",
          contributing: "Contributing",
          license: "License",
          badges: "Badges",
          demo: "Demo",
        };

  return (
    <div className="relative flex w-full min-h-screen bg-gray-50">
      <CollapsibleSidebar />

      <main className="flex flex-col flex-1 ml-20">
        <div className="p-8">
          <div className="flex flex-wrap justify-between gap-3 pb-8">
            <p className="text-4xl font-black leading-tight tracking-tight min-w-72 text-gray-900">
              README Generator
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold leading-tight text-gray-900">
                  Template Selection
                </h3>
                <div className="flex p-1 rounded-full bg-gray-200">
                  <label className="flex items-center justify-center h-full overflow-hidden text-sm font-medium leading-normal rounded-full cursor-pointer grow has-checked:bg-white has-checked:shadow-sm has-checked:text-blue-600 text-gray-600">
                    <span className="truncate px-4 py-1.5">Project README</span>
                    <input
                      checked={templateType === "project"}
                      className="invisible w-0"
                      name="template-selection"
                      type="radio"
                      value="project"
                      onChange={() => {
                        setTemplateType("project");
                        if (!projectIdFromUrl) {
                          setSelectedProjectId(null);
                        }
                      }}
                    />
                  </label>
                  <label className="flex items-center justify-center h-full overflow-hidden text-sm font-medium leading-normal rounded-full cursor-pointer grow has-checked:bg-white has-checked:shadow-sm has-checked:text-blue-600 text-gray-600">
                    <span className="truncate px-4 py-1.5">Profile README</span>
                    <input
                      checked={templateType === "profile"}
                      className="invisible w-0"
                      name="template-selection"
                      type="radio"
                      value="profile"
                      onChange={() => {
                        setTemplateType("profile");
                        setSelectedProjectId(null);
                      }}
                    />
                  </label>
                </div>
              </div>

              {templateType === "project" && (
                <div className="flex flex-col gap-2">
                  <label className="flex flex-col w-full">
                    <p className="pb-2 text-base font-medium leading-normal text-gray-900">
                      Project Selection
                    </p>
                    <select
                      className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded border border-gray-300 bg-white text-gray-900 focus:outline-0 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-14 p-4 text-base font-normal leading-normal"
                      value={selectedProjectId || ""}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                      <option value="">Select a project...</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              {/* Configuration Options */}
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold leading-tight text-gray-900">
                  Configuration Options
                </h3>
                <div className="flex flex-col gap-4 p-4 border rounded border-gray-200 bg-white">
                  {Object.entries(currentConfig).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <label
                        className="font-medium text-gray-800"
                        htmlFor={key}
                      >
                        {configLabels[key as keyof typeof configLabels]}
                      </label>
                      <input
                        checked={value}
                        className="w-5 h-5 rounded form-checkbox bg-gray-200 border-gray-300 text-blue-600 focus:ring-blue-500"
                        id={key}
                        type="checkbox"
                        onChange={(e) => {
                          if (templateType === "profile") {
                            setProfileConfig({
                              ...profileConfig,
                              [key]: e.target.checked,
                            });
                          } else {
                            setProjectConfig({
                              ...projectConfig,
                              [key]: e.target.checked,
                            });
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Right Column: Preview */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col p-6 border rounded border-gray-200 bg-white min-h-[400px] max-h-[600px] overflow-y-auto">
                <h3 className="pb-4 text-lg font-bold leading-tight text-gray-900">
                  Live Preview
                </h3>
                {content ? (
                  <div className="prose prose-sm max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(content),
                      }}
                      className="text-black"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>Generate a README to see the preview</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold leading-tight text-gray-900">
                  Actions
                </h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  <button
                    onClick={handleGenerate}
                    disabled={
                      generating ||
                      (templateType === "project" && !selectedProjectId)
                    }
                    className="flex items-center justify-center w-full col-span-2 h-12 px-6 text-base font-bold text-white rounded-full md:col-span-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined mr-2">
                      auto_awesome
                    </span>
                    <span>
                      {generating ? "Generating..." : "Generate README"}
                    </span>
                  </button>
                  <button
                    onClick={handleCopy}
                    disabled={!content}
                    className="flex items-center justify-center w-full h-10 px-4 text-sm font-medium border rounded-full text-gray-700 border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined mr-2 text-base">
                      content_copy
                    </span>
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!content}
                    className="flex items-center justify-center w-full h-10 px-4 text-sm font-medium border rounded-full text-gray-700 border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined mr-2 text-base">
                      download
                    </span>
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleDeployReadme}
                    disabled={!content}
                    className="flex items-center justify-center w-full h-10 px-4 text-sm font-medium border rounded-full text-gray-700 border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined mr-2 text-base">
                      upload
                    </span>
                    <span>Deploy</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
