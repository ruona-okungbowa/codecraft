"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Clock,
  Code,
  Layers,
  Play,
  Target,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Sparkles,
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
  userSkills: _userSkills,
  missingSkills: _missingSkills,
  isSaved,
  progress,
  onSave,
  onStart,
  onProgressUpdate: _onProgressUpdate,
}: ProjectCardProps) {
  const [showResources, setShowResources] = useState(false);

  // Get priority badge styling
  const getPriorityBadge = () => {
    switch (project.priority) {
      case "high":
        return {
          label: "High Priority",
          className: "bg-error-100 text-error-700 border-error-200",
        };
      case "medium":
        return {
          label: "Recommended",
          className: "bg-warning-100 text-warning-700 border-warning-200",
        };
      case "low":
        return {
          label: "Good to Have",
          className: "bg-info-100 text-info-700 border-info-200",
        };
    }
  };

  // Get difficulty badge styling
  const getDifficultyBadge = () => {
    switch (project.difficulty) {
      case "beginner":
        return {
          label: "Beginner",
          icon: <Layers size={14} />,
          className: "bg-success-100 text-success-700",
        };
      case "intermediate":
        return {
          label: "Intermediate",
          icon: <Layers size={14} />,
          className: "bg-warning-100 text-warning-700",
        };
      case "advanced":
        return {
          label: "Advanced",
          icon: <Layers size={14} />,
          className: "bg-error-100 text-error-700",
        };
    }
  };

  // Get category icon
  const getCategoryIcon = () => {
    switch (project.category) {
      case "frontend":
        return <Code size={14} />;
      case "backend":
        return <Layers size={14} />;
      case "fullstack":
        return <Sparkles size={14} />;
      case "devops":
        return <Target size={14} />;
      case "mobile":
        return <Code size={14} />;
      default:
        return <Code size={14} />;
    }
  };

  const priorityBadge = getPriorityBadge();
  const difficultyBadge = getDifficultyBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200"
    >
      {/* Card Header */}
      <div className="p-6">
        {/* Priority Badge */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${priorityBadge.className}`}
          >
            <Target size={12} />
            {priorityBadge.label}
          </span>
        </div>

        {/* Project Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>

        {/* Project Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Difficulty Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${difficultyBadge.className}`}
          >
            {difficultyBadge.icon}
            {difficultyBadge.label}
          </span>

          {/* Time Estimate Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
            <Clock size={14} />
            {project.timeEstimate}
          </span>

          {/* Category Badge */}
          {project.category && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-100 text-primary-700">
              {getCategoryIcon()}
              {project.category.charAt(0).toUpperCase() +
                project.category.slice(1)}
            </span>
          )}
        </div>

        {/* Skill Tags */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Skills You&apos;ll Learn
          </p>
          <div className="flex flex-wrap gap-2">
            {project.skillMatches.map((skillMatch) => (
              <SkillTag key={skillMatch.skill} skillMatch={skillMatch} />
            ))}
          </div>
        </div>

        {/* Critical Gaps Callout */}
        {project.criticalGapsAddressed > 0 && (
          <div className="mb-4 p-3 bg-success-50 border border-success-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles
                size={16}
                className="text-success-600 mt-0.5 shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-success-800 mb-1">
                  Addresses Critical Skill Gaps
                </p>
                <ul className="text-xs text-success-700 space-y-0.5">
                  {project.skillMatches
                    .filter(
                      (sm) =>
                        sm.type === "fills_gap" && sm.priority === "essential"
                    )
                    .map((sm) => (
                      <li key={sm.skill}>• {sm.skill}</li>
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
            onClick={() => setShowResources(!showResources)}
            className="w-full px-6 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <BookOpen size={16} />
              Learning Resources ({project.learningResources.length})
            </span>
            {showResources ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          <AnimatePresence>
            {showResources && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4">
                  <LearningResourcesSection
                    resources={project.learningResources}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Card Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
        <div className="flex items-center justify-between">
          {/* Gaps Filled Count */}
          <div className="text-sm text-gray-600">
            {project.gapsFilled.length > 0 ? (
              <span className="font-medium">
                Fills {project.gapsFilled.length} skill gap
                {project.gapsFilled.length !== 1 ? "s" : ""}
              </span>
            ) : (
              <span>Teaches new skills</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Save/Unsave Button - will be implemented in 8.6 */}
            <button
              onClick={onSave}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isSaved
                  ? "bg-success-100 text-success-700 hover:bg-success-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck size={16} />
                  Saved ✓
                </>
              ) : (
                <>
                  <Bookmark size={16} />
                  Save
                </>
              )}
            </button>

            {/* Progress Indicator (when in progress) */}
            {progress?.status === "in_progress" && (
              <div className="flex items-center gap-2 mr-2">
                <div className="min-w-[80px]">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{progress.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Start/Continue Button */}
            <button
              onClick={onStart}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              <Play size={16} />
              {progress?.status === "in_progress"
                ? "Continue"
                : "Start Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// SkillTag Component
function SkillTag({ skillMatch }: { skillMatch: SkillMatch }) {
  const getSkillTagStyle = () => {
    switch (skillMatch.type) {
      case "new":
        return {
          label: "NEW",
          className: "bg-info-100 text-info-700 border border-info-200",
          glowClass: "",
        };
      case "fills_gap":
        return {
          label: "FILLS GAP",
          className:
            "bg-success-100 text-success-700 border border-success-300 shadow-success-200",
          glowClass: "shadow-lg",
        };
      case "reinforces":
        return {
          label: "REINFORCES",
          className: "bg-gray-100 text-gray-700 border border-gray-200",
          glowClass: "",
        };
    }
  };

  const style = getSkillTagStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${style.className} ${style.glowClass}`}
    >
      <span className="font-semibold">{skillMatch.skill}</span>
      <span className="text-[10px] opacity-75">• {style.label}</span>
    </span>
  );
}

// LearningResourcesSection Component
function LearningResourcesSection({
  resources,
}: {
  resources: LearningResource[];
}) {
  // Organise resources by category
  const gettingStarted = resources.filter((r) => r.type === "tutorial");
  const documentation = resources.filter((r) => r.type === "docs");
  const templates = resources.filter((r) => r.type === "example");
  const videos = resources.filter((r) => r.type === "video");
  const articles = resources.filter((r) => r.type === "article");

  const sections = [
    { title: "Getting Started", resources: gettingStarted },
    { title: "Documentation", resources: documentation },
    { title: "Templates & Examples", resources: templates },
    { title: "Video Tutorials", resources: videos },
    { title: "Articles", resources: articles },
  ].filter((section) => section.resources.length > 0);

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.title}>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {section.title}
          </h4>
          <div className="space-y-2">
            {section.resources.map((resource, index) => (
              <ResourceItem key={index} resource={resource} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ResourceItem Component
function ResourceItem({ resource }: { resource: LearningResource }) {
  const getResourceIcon = () => {
    switch (resource.type) {
      case "tutorial":
        return <BookOpen size={14} className="text-primary-600" />;
      case "docs":
        return <FileText size={14} className="text-info-600" />;
      case "video":
        return <Video size={14} className="text-error-600" />;
      case "article":
        return <FileText size={14} className="text-warning-600" />;
      case "example":
        return <Code size={14} className="text-success-600" />;
    }
  };

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
    >
      <div className="mt-0.5">{getResourceIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
            {resource.title}
          </p>
          <ExternalLink
            size={14}
            className="text-gray-400 group-hover:text-primary-600 shrink-0"
          />
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          {resource.provider && <span>{resource.provider}</span>}
          {resource.duration && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {resource.duration}
              </span>
            </>
          )}
        </div>
      </div>
    </a>
  );
}
