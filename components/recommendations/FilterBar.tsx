"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Filter, SlidersHorizontal, Check } from "lucide-react";
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
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const difficultyRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        difficultyRef.current &&
        !difficultyRef.current.contains(event.target as Node)
      ) {
        setShowDifficultyDropdown(false);
      }
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
      if (timeRef.current && !timeRef.current.contains(event.target as Node)) {
        setShowTimeDropdown(false);
      }
      if (
        skillsRef.current &&
        !skillsRef.current.contains(event.target as Node)
      ) {
        setShowSkillsDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDifficultyChange = (difficulty: FilterState["difficulty"]) => {
    onFilterChange({ ...filters, difficulty });
    setShowDifficultyDropdown(false);
  };

  const handleCategoryChange = (category: FilterState["category"]) => {
    onFilterChange({ ...filters, category });
    setShowCategoryDropdown(false);
  };

  const handleTimeChange = (timeCommitment: FilterState["timeCommitment"]) => {
    onFilterChange({ ...filters, timeCommitment });
    setShowTimeDropdown(false);
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill];
    onFilterChange({ ...filters, skills: newSkills });
  };

  const handleSortChange = (sortBy: FilterState["sortBy"]) => {
    onFilterChange({ ...filters, sortBy });
    setShowSortDropdown(false);
  };

  const handleClearAll = () => {
    onFilterChange({
      difficulty: "all",
      category: "all",
      timeCommitment: "all",
      skills: [],
      sortBy: "priority",
      priorityLevel: "all",
    });
  };

  const removeSkillFilter = (skill: string) => {
    onFilterChange({
      ...filters,
      skills: filters.skills.filter((s) => s !== skill),
    });
  };

  const difficultyOptions = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "frontend", label: "Frontend" },
    { value: "backend", label: "Backend" },
    { value: "fullstack", label: "Full Stack" },
    { value: "devops", label: "DevOps" },
    { value: "mobile", label: "Mobile" },
  ];

  const timeOptions = [
    { value: "all", label: "Any Duration" },
    { value: "weekend", label: "Weekend (8-16 hrs)" },
    { value: "week", label: "Week-long (20-40 hrs)" },
    { value: "extended", label: "Extended (40+ hrs)" },
  ];

  const sortOptions = [
    { value: "priority", label: "Priority Score" },
    { value: "difficulty", label: "Difficulty" },
    { value: "time", label: "Time Commitment" },
    { value: "skills", label: "Skills Taught" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filter & Sort</h2>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        {/* Difficulty Dropdown */}
        <div ref={difficultyRef} className="relative">
          <button
            onClick={() => setShowDifficultyDropdown(!showDifficultyDropdown)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm"
          >
            <span className="text-gray-700">
              {difficultyOptions.find((o) => o.value === filters.difficulty)
                ?.label || "Difficulty"}
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>
          <AnimatePresence>
            {showDifficultyDropdown && (
              <Dropdown>
                {difficultyOptions.map((option) => (
                  <DropdownItem
                    key={option.value}
                    label={option.label}
                    selected={filters.difficulty === option.value}
                    onClick={() =>
                      handleDifficultyChange(
                        option.value as FilterState["difficulty"]
                      )
                    }
                  />
                ))}
              </Dropdown>
            )}
          </AnimatePresence>
        </div>

        {/* Category Dropdown */}
        <div ref={categoryRef} className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm"
          >
            <span className="text-gray-700">
              {categoryOptions.find((o) => o.value === filters.category)
                ?.label || "Category"}
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>
          <AnimatePresence>
            {showCategoryDropdown && (
              <Dropdown>
                {categoryOptions.map((option) => (
                  <DropdownItem
                    key={option.value}
                    label={option.label}
                    selected={filters.category === option.value}
                    onClick={() =>
                      handleCategoryChange(
                        option.value as FilterState["category"]
                      )
                    }
                  />
                ))}
              </Dropdown>
            )}
          </AnimatePresence>
        </div>

        {/* Time Commitment Dropdown */}
        <div ref={timeRef} className="relative">
          <button
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm"
          >
            <span className="text-gray-700">
              {timeOptions.find((o) => o.value === filters.timeCommitment)
                ?.label || "Time"}
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>
          <AnimatePresence>
            {showTimeDropdown && (
              <Dropdown>
                {timeOptions.map((option) => (
                  <DropdownItem
                    key={option.value}
                    label={option.label}
                    selected={filters.timeCommitment === option.value}
                    onClick={() =>
                      handleTimeChange(
                        option.value as FilterState["timeCommitment"]
                      )
                    }
                  />
                ))}
              </Dropdown>
            )}
          </AnimatePresence>
        </div>

        {/* Skills Multi-Select */}
        <div ref={skillsRef} className="relative">
          <button
            onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm"
          >
            <span className="text-gray-700">
              {filters.skills.length > 0
                ? `${filters.skills.length} skill${filters.skills.length > 1 ? "s" : ""}`
                : "Skills"}
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>
          <AnimatePresence>
            {showSkillsDropdown && (
              <Dropdown maxHeight="max-h-64">
                {availableSkills.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No skills available
                  </div>
                ) : (
                  availableSkills.map((skill) => (
                    <DropdownItem
                      key={skill}
                      label={skill}
                      selected={filters.skills.includes(skill)}
                      onClick={() => handleSkillToggle(skill)}
                      multiSelect
                    />
                  ))
                )}
              </Dropdown>
            )}
          </AnimatePresence>
        </div>

        {/* Sort Order Dropdown */}
        <div ref={sortRef} className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm"
          >
            <span className="text-gray-700">
              Sort: {sortOptions.find((o) => o.value === filters.sortBy)?.label}
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>
          <AnimatePresence>
            {showSortDropdown && (
              <Dropdown>
                {sortOptions.map((option) => (
                  <DropdownItem
                    key={option.value}
                    label={option.label}
                    selected={filters.sortBy === option.value}
                    onClick={() =>
                      handleSortChange(option.value as FilterState["sortBy"])
                    }
                  />
                ))}
              </Dropdown>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(filters.difficulty !== "all" ||
        filters.category !== "all" ||
        filters.timeCommitment !== "all" ||
        filters.skills.length > 0 ||
        (filters.priorityLevel && filters.priorityLevel !== "all")) && (
        <div className="flex flex-wrap gap-2">
          {filters.priorityLevel && filters.priorityLevel !== "all" && (
            <FilterChip
              label={`Priority: ${filters.priorityLevel.charAt(0).toUpperCase() + filters.priorityLevel.slice(1)}`}
              onRemove={() =>
                onFilterChange({ ...filters, priorityLevel: "all" })
              }
            />
          )}
          {filters.difficulty !== "all" && (
            <FilterChip
              label={`Difficulty: ${difficultyOptions.find((o) => o.value === filters.difficulty)?.label}`}
              onRemove={() => handleDifficultyChange("all")}
            />
          )}
          {filters.category !== "all" && (
            <FilterChip
              label={`Category: ${categoryOptions.find((o) => o.value === filters.category)?.label}`}
              onRemove={() => handleCategoryChange("all")}
            />
          )}
          {filters.timeCommitment !== "all" && (
            <FilterChip
              label={`Time: ${timeOptions.find((o) => o.value === filters.timeCommitment)?.label}`}
              onRemove={() => handleTimeChange("all")}
            />
          )}
          {filters.skills.map((skill) => (
            <FilterChip
              key={skill}
              label={skill}
              onRemove={() => removeSkillFilter(skill)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Dropdown({
  children,
  maxHeight = "max-h-48",
}: {
  children: React.ReactNode;
  maxHeight?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className={`absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-y-auto ${maxHeight}`}
    >
      {children}
    </motion.div>
  );
}

function DropdownItem({
  label,
  selected,
  onClick,
  multiSelect = false,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  multiSelect?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
        selected && !multiSelect ? "bg-blue-50 text-blue-700" : "text-gray-700"
      }`}
    >
      <span>{label}</span>
      {selected && (
        <Check size={16} className={multiSelect ? "text-blue-600" : ""} />
      )}
    </button>
  );
}

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
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
    >
      <Filter size={12} />
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}
