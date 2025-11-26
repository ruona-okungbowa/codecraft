"use client";

import { Project } from "@/types";
import { Star, GitFork, Calendar } from "lucide-react";

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelect: (projectId: string) => void;
}

export default function ProjectSelector({
  projects,
  selectedProjectId,
  onSelect,
}: ProjectSelectorProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No projects found.</p>
        <p className="text-sm text-gray-500 mt-2">
          Please add some projects to your portfolio first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select a Project</h3>
      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onSelect(project.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedProjectId === project.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{project.name}</h4>
                {project.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{project.stars}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <GitFork className="w-4 h-4" />
                    <span>{project.forks}</span>
                  </div>
                  {project.lastCommitDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(project.lastCommitDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {selectedProjectId === project.id && (
                <div className="ml-4">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
