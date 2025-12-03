"use client";

import { useState } from "react";
import {
  Filter,
  X,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import type { FilterState } from "@/types/recommendations";

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableSkills: string[];
  activeFilterCount: number;
}

export default function FilterBar({
  filters,
  onFilterChange,
  availableSkills,
  activeFilterCount,
}: FilterBarProps) {
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);

  const handleDifficultyChange = (difficulty: FilterState["difficulty"]) => {
    onFilterChange({ ...filters, difficulty });
  };

  const handleCategoryChange = (category: FilterState["category"]) => {
    onFilterChange({ ...filters, category });
  };

  const handleTimeCommitmentChange = (
    timeCommitment: FilterState["timeCommitment"]
  ) => {
    onFilterChange({ ...filters, timeCommitment });
  };

  const handlePriorityLevelChange = (
    priorityLevel: FilterState["priorityLevel"]
  ) => {
    onFilterChange({ ...filters, priorityLevel });
  };

  const handleSortByChange = (sortBy: FilterState["sortBy"]) => {
    onFilterChange({ ...filters, sortBy });
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill];
    onFilterChange({ ...filters, skills: newSkills });
  };

  const handleClearAllFilters = () => {
    onFilterChange({
      difficulty: "all",
      category: "all",
      timeCommitment: "all",
      skills: [],
      sortBy: "priority",
      priorityLevel: "all",
    });
  };

  const handleRemoveSkill = (skill: string) => {
    const newSkills = filters.skills.filter((s) => s !== skill);
    onFilterChange({ ...filters, skills: newSkills });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={20} className="text-gray-600" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Filters
          </h2>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={handleClearAllFilters}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors min-h-[44px] sm:min-h-0 flex items-center"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
        {/* Difficulty Dropdown */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Difficulty
          </label>
          <div className="relative">
            <select
              value={filters.difficulty}
              onChange={(e) =>
                handleDifficultyChange(
                  e.target.value as FilterState["difficulty"]
                )
              }
              className="w-full appearance-none px-3 py-3 sm:py-2 pr-8 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors min-h-[44px] sm:min-h-0"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Category
          </label>
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) =>
                handleCategoryChange(e.target.value as FilterState["category"])
              }
              className="w-full appearance-none px-3 py-3 sm:py-2 pr-8 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors min-h-[44px] sm:min-h-0"
            >
              <option value="all">All Categories</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="fullstack">Fullstack</option>
              <option value="devops">DevOps</option>
              <option value="mobile">Mobile</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Time Commitment Dropdown */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Time Commitment
          </label>
          <div className="relative">
            <select
              value={filters.timeCommitment}
              onChange={(e) =>
                handleTimeCommitmentChange(
                  e.target.value as FilterState["timeCommitment"]
                )
              }
              className="w-full appearance-none px-3 py-3 sm:py-2 pr-8 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors min-h-[44px] sm:min-h-0"
            >
              <option value="all">Any Duration</option>
              <option value="weekend">Weekend (1-2 days)</option>
              <option value="week">Week-long (3-7 days)</option>
              <option value="extended">Extended (2+ weeks)</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Priority Level Dropdown */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Priority
          </label>
          <div className="relative">
            <select
              value={filters.priorityLevel || "all"}
              onChange={(e) =>
                handlePriorityLevelChange(
                  e.target.value as FilterState["priorityLevel"]
                )
              }
              className="w-full appearance-none px-3 py-3 sm:py-2 pr-8 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors min-h-[44px] sm:min-h-0"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Recommended</option>
              <option value="low">Good to Have</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Sort Order Dropdown */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Sort By
          </label>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                handleSortByChange(e.target.value as FilterState["sortBy"])
              }
              className="w-full appearance-none px-3 py-3 sm:py-2 pr-8 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors min-h-[44px] sm:min-h-0"
            >
              <option value="priority">Priority Score</option>
              <option value="difficulty">Difficulty</option>
              <option value="time">Time Estimate</option>
              <option value="skills">Skills Taught</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Skills Multi-Select */}
      <div className="relative mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Filter by Skills
        </label>
        <div className="relative">
          <button
            onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
            className="w-full flex items-center justify-between px-3 py-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors min-h-[44px] sm:min-h-0"
          >
            <span className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              {filters.skills.length === 0 ? (
                <span className="text-gray-500">Select skills...</span>
              ) : (
                <span className="font-medium">
                  {filters.skills.length} skill
                  {filters.skills.length !== 1 ? "s" : ""} selected
                </span>
              )}
            </span>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${
                showSkillsDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Skills Dropdown Menu */}
          {showSkillsDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {availableSkills.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No skills available
                </div>
              ) : (
                <div className="py-1">
                  {availableSkills.map((skill) => (
                    <label
                      key={skill}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.skills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-900">{skill}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.difficulty !== "all" && (
            <FilterChip
              label={`Difficulty: ${filters.difficulty}`}
              onRemove={() => handleDifficultyChange("all")}
            />
          )}
          {filters.category !== "all" && (
            <FilterChip
              label={`Category: ${filters.category}`}
              onRemove={() => handleCategoryChange("all")}
            />
          )}
          {filters.timeCommitment !== "all" && (
            <FilterChip
              label={`Time: ${filters.timeCommitment}`}
              onRemove={() => handleTimeCommitmentChange("all")}
            />
          )}
          {filters.priorityLevel && filters.priorityLevel !== "all" && (
            <FilterChip
              label={`Priority: ${filters.priorityLevel}`}
              onRemove={() => handlePriorityLevelChange("all")}
            />
          )}
          {filters.skills.map((skill) => (
            <FilterChip
              key={skill}
              label={skill}
              icon={<Sparkles size={12} />}
              onRemove={() => handleRemoveSkill(skill)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// FilterChip Component
function FilterChip({
  label,
  icon,
  onRemove,
}: {
  label: string;
  icon?: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
      {icon}
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-primary-200 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X size={12} />
      </button>
    </span>
  );
}
