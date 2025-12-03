"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  Play,
  ChevronDown,
  Clock,
  Target,
  Code2,
  Layers,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import type {
  ProjectRecommendation,
  SkillMatch,
  ProjectProgress,
  LearningResource,
} from "@/types/recommendations";

interface ProjectCardProps {
  project: ProjectRecommendation;
  userSkills: string[];
  missingSkills: {
    essential: string[];
    preferred: string[];
    niceToHave: string[];
  };
  isSaved: boolean;
  progress: ProjectProgress | null;
  onSave: () => void;
  onStart: () => void;
  onProgressUpdate: (progress: number) => void;
}

export default function ProjectCard({
  project,
  userSkills,
  missingSkills,
  isSaved,
  progress,
  onSave,
  onStart,
  onProgressUpdate,
}: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get difficulty icon and color
  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return {
          color: "text-green-700 bg-green-100 border-green-200",
          label: "Beginner",
        };
      case "intermediate":
        return {
          color: "text-yellow-700 bg-yellow-100 border-yellow-200",
          label: "Intermediate",
        };
      case "advanced":
        return {
          color: "text-red-700 bg-red-100 border-red-200",
          label: "Advanced",
        };
      default:
        return {
          color: "text-gray-700 bg-gray-100 border-gray-200",
          label: difficulty,
        };
    }
  };

  // Get priority badge config
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          color: "text-red-700 bg-red-100 border-red-200",
          label: "High Priority",
          icon: <AlertCircle size={14} />,
        };
      case "medium":
        return {
          color: "text-blue-700 bg-blue-100 border-blue-200",
          label: "Recommended",
          icon: <Target size={14} />,
        };
      case "low":
        return {
          color: "text-gray-700 bg-gray-100 border-gray-200",
          label: "Good to Have",
          icon: <Sparkles size={14} />,
        };
      default:
        return {
          color: "text-gray-700 bg-gray-100 border-gray-200",
          label: priority,
          icon: <Target size={14} />,
        };
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "frontend":
        return <Code2 size={14} />;
      case "backend":
        return <Layers size={14} />;
      case "fullstack":
        return <Code2 size={14} />;
      case "devops":
        return <Layers size={14} />;
      case "mobile":
        return <Code2 size={14} />;
      default:
        return <Code2 size={14} />;
    }
  };

  const difficultyConfig = getDifficultyConfig(project.difficulty);
  const priorityConfig = getPriorityConfig(project.priority);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary-300 hover:-translate-y-1 transition-all duration-200 ease-out overflow-hidden">
      {/* Card Header */}
      <div className="p-4 sm:p-6">
        {/* Priority Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${priorityConfig.color}`}
          >
            {priorityConfig.icon}
            {priorityConfig.label}
          </span>
        </div>

        {/* Project Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>

        {/* Project Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Difficulty Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${difficultyConfig.color}`}
          >
            <Target size={14} />
            {difficultyConfig.label}
          </span>

          {/* Time Estimate Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200">
            <Clock size={14} />
            {project.timeEstimate}
          </span>

          {/* Category Badge */}
          {project.category && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-purple-700 bg-purple-100 border border-purple-200 capitalize">
              {getCategoryIcon(project.category)}
              {project.category}
            </span>
          )}
        </div>

        {/* Skill Tags with Type Indicators */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700 mb-2">
            Skills you&apos;ll learn:
          </p>
          <div className="flex flex-wrap gap-2">
            {project.skillMatches.map((skillMatch) => (
              <SkillTag key={skillMatch.skill} skillMatch={skillMatch} />
            ))}
          </div>
        </div>

        {/* Critical Gaps Callout */}
        {project.criticalGapsAddressed > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="text-green-600 shrink-0 mt-0.5"
              />
              <div>
                <h4 className="text-sm font-semibold text-green-900 mb-1">
                  Addresses Critical Gaps
                </h4>
                <p className="text-xs text-green-800 mb-2">
                  This project fills {project.criticalGapsAddressed} essential
                  skill
                  {project.criticalGapsAddressed !== 1 ? "s" : ""} for your
                  target role:
                </p>
                <ul className="space-y-1">
                  {project.skillMatches
                    .filter(
                      (sm) =>
                        sm.type === "fills_gap" && sm.priority === "essential"
                    )
                    .map((sm) => (
                      <li
                        key={sm.skill}
                        className="text-xs text-green-800 flex items-center gap-2"
                      >
                        <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                        {sm.skill}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Learning Resources */}
      {project.learningResources && project.learningResources.length > 0 && (
        <div className="border-t border-gray-200">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 sm:px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors min-h-[44px]"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? "Collapse learning resources"
                : "Expand learning resources"
            }
          >
            <span className="text-sm font-semibold text-gray-900">
              Learning Resources ({project.learningResources.length})
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ChevronDown size={20} className="text-gray-500" />
            </motion.div>
          </button>

          {/* Resources Content */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
                  {/* Organize resources by category */}
                  {(() => {
                    const gettingStarted = project.learningResources.filter(
                      (r) => r.type === "tutorial" || r.type === "article"
                    );
                    const documentation = project.learningResources.filter(
                      (r) => r.type === "docs"
                    );
                    const examples = project.learningResources.filter(
                      (r) => r.type === "example" || r.type === "video"
                    );

                    return (
                      <>
                        {gettingStarted.length > 0 && (
                          <ResourceSection
                            title="Getting Started"
                            resources={gettingStarted}
                          />
                        )}
                        {documentation.length > 0 && (
                          <ResourceSection
                            title="Documentation"
                            resources={documentation}
                          />
                        )}
                        {examples.length > 0 && (
                          <ResourceSection
                            title="Examples & Videos"
                            resources={examples}
                          />
                        )}
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Card Footer */}
      <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
        {/* Progress Indicator (when in progress) */}
        {progress && progress.status === "in_progress" && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">
                Progress
              </span>
              <span className="text-xs font-semibold text-primary-700">
                {progress.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Gaps Filled Count */}
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {project.gapsFilled.length}
            </span>{" "}
            gap{project.gapsFilled.length !== 1 ? "s" : ""} filled
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Save Button */}
            <button
              onClick={onSave}
              className={`inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial ${
                isSaved
                  ? "text-primary-700 bg-primary-100 hover:bg-primary-200"
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
              aria-label={isSaved ? "Remove from saved" : "Save for later"}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck size={16} />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark size={16} />
                  <span>Save</span>
                </>
              )}
            </button>

            {/* Start/Continue Button */}
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial"
              aria-label={progress ? "Continue project" : "Start project"}
            >
              <Play size={16} />
              <span>{progress ? "Continue" : "Start Project"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// SkillTag Component
function SkillTag({ skillMatch }: { skillMatch: SkillMatch }) {
  const getSkillTagConfig = (type: SkillMatch["type"]) => {
    switch (type) {
      case "new":
        return {
          color: "text-blue-700 bg-blue-50 border-blue-200",
          label: "NEW",
          glow: false,
        };
      case "fills_gap":
        return {
          color: "text-green-700 bg-green-50 border-green-200",
          label: "FILLS GAP",
          glow: true,
        };
      case "reinforces":
        return {
          color: "text-purple-700 bg-purple-50 border-purple-200",
          label: "REINFORCES",
          glow: false,
        };
      default:
        return {
          color: "text-gray-700 bg-gray-50 border-gray-200",
          label: "",
          glow: false,
        };
    }
  };

  const config = getSkillTagConfig(skillMatch.type);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.color} ${
        config.glow ? "ring-2 ring-green-200 ring-opacity-50 shadow-sm" : ""
      }`}
    >
      <span>{skillMatch.skill}</span>
      {config.label && (
        <span className="text-[10px] font-bold opacity-75">{config.label}</span>
      )}
    </span>
  );
}

// ResourceSection Component
function ResourceSection({
  title,
  resources,
}: {
  title: string;
  resources: LearningResource[];
}) {
  return (
    <div>
      <h5 className="text-xs font-semibold text-gray-700 mb-2">{title}</h5>
      <div className="space-y-2">
        {resources.map((resource, index) => (
          <ResourceItem key={index} resource={resource} />
        ))}
      </div>
    </div>
  );
}

// ResourceItem Component
function ResourceItem({ resource }: { resource: LearningResource }) {
  const getResourceIcon = (type: LearningResource["type"]) => {
    switch (type) {
      case "video":
        return <Play size={14} className="text-red-600" />;
      case "article":
        return <Code2 size={14} className="text-blue-600" />;
      case "docs":
        return <Layers size={14} className="text-green-600" />;
      case "tutorial":
        return <Target size={14} className="text-purple-600" />;
      case "example":
        return <Sparkles size={14} className="text-yellow-600" />;
      default:
        return <ExternalLink size={14} className="text-gray-600" />;
    }
  };

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
    >
      <div className="shrink-0 mt-0.5">{getResourceIcon(resource.type)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h6 className="text-sm font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
            {resource.title}
          </h6>
          <ExternalLink
            size={14}
            className="text-gray-400 group-hover:text-primary-600 shrink-0"
          />
        </div>
        <div className="flex items-center gap-2 mt-1">
          {resource.provider && (
            <span className="text-xs text-gray-600">{resource.provider}</span>
          )}
          {resource.duration && (
            <>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-600">{resource.duration}</span>
            </>
          )}
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-600 capitalize">
            {resource.type}
          </span>
        </div>
      </div>
    </a>
  );
}
