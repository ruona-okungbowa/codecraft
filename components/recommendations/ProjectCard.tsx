"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  Play,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  Sparkles,
  CheckCircle,
  ExternalLink,
  Video,
  FileText,
  BookOpen,
  Signal,
} from "lucide-react";
import type {
  ProjectRecommendation,
  ProjectProgress,
} from "@/types/recommendations";
import type { MissingSkills } from "@/types/skills";

interface ProjectCardProps {
  project: ProjectRecommendation;
  userSkills: string[];
  missingSkills: MissingSkills;
  isSaved: boolean;
  progress: ProjectProgress | null;
  onSave: () => void;
  onStart: () => void;
  onProgressUpdate?: (progress: number) => void;
}

export default function ProjectCard({
  project,
  userSkills,
  missingSkills,
  isSaved,
  progress,
  onSave,
  onStart,
}: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave();
    setSaving(false);
  };

  const handleStart = async () => {
    setStarting(true);
    await onStart();
    setStarting(false);
  };

  // Priority gradient
  const priorityGradient =
    project.priority === "high"
      ? "from-red-500 to-orange-500"
      : project.priority === "medium"
        ? "from-orange-500 to-yellow-500"
        : "from-blue-500 to-cyan-500";

  // Priority badge
  const priorityBadge =
    project.priority === "high"
      ? { bg: "bg-red-100", text: "text-red-700", label: "High Priority" }
      : project.priority === "medium"
        ? { bg: "bg-blue-100", text: "text-blue-700", label: "Recommended" }
        : { bg: "bg-gray-100", text: "text-gray-700", label: "Good to Have" };

  // Difficulty badge
  const difficultyConfig = {
    beginner: { bg: "bg-green-100", text: "text-green-700", bars: 1 },
    intermediate: { bg: "bg-orange-100", text: "text-orange-700", bars: 2 },
    advanced: { bg: "bg-red-100", text: "text-red-700", bars: 3 },
  };
  const difficulty = difficultyConfig[project.difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all overflow-hidden"
    >
      {/* Priority Strip */}
      <div className={`h-2 bg-gradient-to-r ${priorityGradient}`} />

      {/* Card Body */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex-1">
            {project.name}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityBadge.bg} ${priorityBadge.text} ml-4`}
          >
            {priorityBadge.label}
          </span>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Difficulty */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${difficulty.bg} ${difficulty.text}`}
          >
            <Signal size={14} />
            <span className="capitalize">{project.difficulty}</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
            <Clock size={14} />
            <span>{project.timeEstimate}</span>
          </div>

          {/* Category */}
          {project.category && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              <span className="capitalize">{project.category}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 leading-relaxed mb-5">
          {project.description}
        </p>

        {/* Skills Taught */}
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Skills you will learn:
          </h4>
          <div className="flex flex-wrap gap-2">
            {project.skillMatches.map((match) => (
              <SkillTag key={match.skill} match={match} />
            ))}
          </div>
        </div>

        {/* Critical Gaps Callout */}
        {project.criticalGapsAddressed > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Fills {project.criticalGapsAddressed} critical gap
                {project.criticalGapsAddressed > 1 ? "s" : ""}:{" "}
                <strong>{project.gapsFilled.join(", ")}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Learning Resources */}
        <div className="mb-5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            View learning resources
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                  {project.learningResources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 hover:bg-white rounded transition-colors group"
                    >
                      <ResourceIcon type={resource.type} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          {resource.title}
                        </div>
                        {resource.provider && (
                          <div className="text-xs text-gray-500">
                            {resource.provider}
                          </div>
                        )}
                      </div>
                      <ExternalLink
                        size={14}
                        className="text-gray-400 group-hover:text-blue-600"
                      />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="text-xs text-gray-600">
          Matches {project.gapsFilled.length} of your skill gaps
        </div>

        <div className="flex items-center gap-3">
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isSaved
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck size={16} />
                Saved
              </>
            ) : (
              <>
                <Bookmark size={16} />
                {saving ? "Saving..." : "Save"}
              </>
            )}
          </button>

          {/* Start/Continue Button */}
          <button
            onClick={handleStart}
            disabled={starting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Play size={16} />
            {progress?.status === "in_progress"
              ? starting
                ? "Loading..."
                : "Continue"
              : starting
                ? "Starting..."
                : "Start Project"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SkillTag({ match }: { match: any }) {
  if (match.type === "fills_gap") {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border bg-green-50 text-green-600 border-green-300 shadow-sm shadow-green-200">
        {match.skill}
        <CheckCircle size={14} />
      </span>
    );
  }

  if (match.type === "new") {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border bg-blue-50 text-blue-600 border-blue-300">
        {match.skill}
        <Sparkles size={14} />
      </span>
    );
  }

  // reinforces
  return (
    <span className="px-3 py-1.5 rounded-full text-sm border bg-gray-50 text-gray-600 border-gray-300">
      {match.skill}
    </span>
  );
}

function ResourceIcon({ type }: { type: string }) {
  switch (type) {
    case "video":
      return <Video size={16} className="text-red-500" />;
    case "article":
      return <FileText size={16} className="text-blue-500" />;
    case "docs":
      return <BookOpen size={16} className="text-green-500" />;
    default:
      return <FileText size={16} className="text-gray-500" />;
  }
}
