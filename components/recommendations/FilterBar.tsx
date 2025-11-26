"use client";

import { X } from "lucide-react";
import type { FilterState } from "@/types/recommendations";

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableSkills: string[];
}

export default function FilterBar({
  filters,
  onFilterChange,
  availableSkills,
}: FilterBarProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFilterChange({
      difficulty: "all",
      category: "all",
      timeCommitment: "all",
      skills: [],
      sortBy: "priority",
    });
  };

  const activeFilterCount =
    (filters.difficulty !== "all" ? 1 : 0) +
    (filters.category !== "all" ? 1 : 0) +
    (filters.timeCommitment !== "all" ? 1 : 0) +
    filters.skills.length;

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-10 py-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Difficulty */}
          <select
            value={filters.difficulty}
            onChange={(e) => updateFilter("difficulty", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Category */}
          <select
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="fullstack">Fullstack</option>
            <option value="devops">DevOps</option>
            <option value="mobile">Mobile</option>
          </select>

          {/* Time Commitment */}
          <select
            value={filters.timeCommitment}
            onChange={(e) => updateFilter("timeCommitment", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Any Time</option>
            <option value="weekend">Weekend Project (&lt; 20 hrs)</option>
            <option value="week">Week-long (20-40 hrs)</option>
            <option value="extended">Extended (40+ hrs)</option>
          </select>

          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter("sortBy", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
          >
            <option value="priority">Sort: Priority Score</option>
            <option value="difficulty">Sort: Difficulty</option>
            <option value="time">Sort: Time (Quick First)</option>
            <option value="skills">Sort: Skills Taught</option>
          </select>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.difficulty !== "all" && (
              <FilterChip
                label={`Difficulty: ${filters.difficulty}`}
                onRemove={() => updateFilter("difficulty", "all")}
              />
            )}
            {filters.category !== "all" && (
              <FilterChip
                label={`Category: ${filters.category}`}
                onRemove={() => updateFilter("category", "all")}
              />
            )}
            {filters.timeCommitment !== "all" && (
              <FilterChip
                label={`Time: ${filters.timeCommitment}`}
                onRemove={() => updateFilter("timeCommitment", "all")}
              />
            )}
            {filters.skills.map((skill) => (
              <FilterChip
                key={skill}
                label={`Skill: ${skill}`}
                onRemove={() =>
                  updateFilter(
                    "skills",
                    filters.skills.filter((s) => s !== skill)
                  )
                }
              />
            ))}
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium ml-2"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
