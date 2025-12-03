"use client";

import { useState, useEffect } from "react";
import { Sparkles, Download, Upload, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import TypeSelector from "@/components/readme/TypeSelector";
import TemplateSelector from "@/components/readme/TemplateSelector";
import ProjectSelector from "@/components/readme/ProjectSelector";
import Editor from "@/components/readme/Editor";
import Preview from "@/components/readme/Preview";
import DeploymentDialog from "@/components/readme/DeploymentDialog";
import { ReadmeTemplate } from "@/types/readme";
import { Project } from "@/types";

export default function ReadmeClient() {
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get("projectId");

  // State management
  const [readmeType, setReadmeType] = useState<"project" | "profile" | null>(
    projectIdFromUrl ? "project" : null
  );
  const [template, setTemplate] = useState<ReadmeTemplate>("professional");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projectIdFromUrl
  );
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationScore, setValidationScore] = useState<number | null>(null);
  const [showDeployDialog, setShowDeployDialog] = useState(false);

  // Fetch user's projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

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
      if (readmeType === "project") {
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
            forceRegenerate: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate README");
        }

        const data = await response.json();
        setContent(data.content);
        setValidationScore(data.validation.score);
      } else if (readmeType === "profile") {
        const response = await fetch("/api/ai/readme/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ template }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate README");
        }

        const data = await response.json();
        setContent(data.content);
        setValidationScore(data.validation.score);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeploy = async () => {
    const response = await fetch("/api/ai/readme/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: readmeType,
        content,
        projectId: readmeType === "project" ? selectedProjectId : undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Deployment failed");
    }
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

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <span>README Generator</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Generate professional README files for your projects and profile
            </p>
          </div>

          {/* Step 1: Type Selection */}
          {!readmeType && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <TypeSelector
                selectedType={readmeType}
                onSelect={setReadmeType}
              />
            </div>
          )}

          {/* Step 2: Configuration */}
          {readmeType && !content && (
            <div className="space-y-6">
              {/* Template Selection */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <TemplateSelector
                  selectedTemplate={template}
                  onSelect={setTemplate}
                />
              </div>

              {/* Project Selection (for project type) - only show if no projectId in URL */}
              {readmeType === "project" && !projectIdFromUrl && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <ProjectSelector
                    projects={projects}
                    selectedProjectId={selectedProjectId}
                    onSelect={setSelectedProjectId}
                  />
                </div>
              )}

              {/* Show selected project info when coming from projects page */}
              {readmeType === "project" &&
                projectIdFromUrl &&
                selectedProject && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Selected Project
                    </h3>
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {selectedProject.name}
                        </h4>
                        {selectedProject.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedProject.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setReadmeType(null);
                          setSelectedProjectId(null);
                          window.history.pushState({}, "", "/readme-generator");
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900">Error</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleGenerate}
                  disabled={
                    generating ||
                    (readmeType === "project" && !selectedProjectId)
                  }
                  className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate README</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Editor & Preview */}
          {content && (
            <div className="space-y-6">
              {/* Validation Score */}
              {validationScore !== null && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Quality Score
                      </h3>
                      <p className="text-sm text-gray-600">
                        Based on completeness and best practices
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {validationScore}
                      </div>
                      <div className="text-sm text-gray-500">out of 100</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Editor and Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[600px]">
                  <Editor content={content} onChange={setContent} />
                </div>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[600px]">
                  <Preview content={content} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setContent("");
                    setReadmeType(null);
                    setSelectedProjectId(null);
                    setValidationScore(null);
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Start Over
                </button>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setShowDeployDialog(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Deploy to GitHub</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <DeploymentDialog
        isOpen={showDeployDialog}
        onClose={() => setShowDeployDialog(false)}
        onDeploy={handleDeploy}
        type={readmeType || "project"}
        repoName={selectedProject?.name || "username"}
      />
    </div>
  );
}
