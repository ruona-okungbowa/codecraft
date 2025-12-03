import type {
  ProjectRecommendation,
  FilterState,
} from "@/types/recommendations";

/**
 * Maps time estimate strings to standardized categories
 */
function categorizeTimeEstimate(timeEstimate: string): string {
  const normalized = timeEstimate.toLowerCase();

  // Weekend projects (1-2 days, few hours)
  if (
    normalized.includes("weekend") ||
    normalized.includes("1-2 days") ||
    normalized.includes("few hours") ||
    normalized.includes("4-8 hours")
  ) {
    return "weekend";
  }

  // Week-long projects (3-7 days, 1 week)
  if (
    normalized.includes("week") ||
    normalized.includes("3-7 days") ||
    normalized.includes("5-10 days") ||
    normalized.includes("1-2 weeks")
  ) {
    return "week";
  }

  // Extended projects (2+ weeks, month)
  if (
    normalized.includes("extended") ||
    normalized.includes("2+ weeks") ||
    normalized.includes("month") ||
    normalized.includes("3+ weeks")
  ) {
    return "extended";
  }

  // Default to week if unclear
  return "week";
}

/**
 * Apply filters to project recommendations using AND logic
 * All active filters must match for a project to be included
 */
export function applyFilters(
  recommendations: ProjectRecommendation[],
  filters: FilterState
): ProjectRecommendation[] {
  return recommendations.filter((project) => {
    // Filter by difficulty
    if (filters.difficulty !== "all") {
      if (project.difficulty !== filters.difficulty) {
        return false;
      }
    }

    // Filter by category
    if (filters.category !== "all") {
      if (project.category !== filters.category) {
        return false;
      }
    }

    // Filter by time commitment
    if (filters.timeCommitment !== "all") {
      const projectTimeCategory = categorizeTimeEstimate(project.timeEstimate);
      if (projectTimeCategory !== filters.timeCommitment) {
        return false;
      }
    }

    // Filter by skills (OR logic within skills - project must teach at least one selected skill)
    if (filters.skills.length > 0) {
      const teachesSelectedSkill = filters.skills.some((selectedSkill) => {
        return project.skillsTaught.some((taughtSkill) =>
          taughtSkill.toLowerCase().includes(selectedSkill.toLowerCase())
        );
      });

      if (!teachesSelectedSkill) {
        return false;
      }
    }

    // Filter by priority level
    if (filters.priorityLevel && filters.priorityLevel !== "all") {
      if (project.priority !== filters.priorityLevel) {
        return false;
      }
    }

    // All filters passed
    return true;
  });
}

/**
 * Sort projects by priority score (descending)
 */
function sortByPriority(
  projects: ProjectRecommendation[],
  ascending = false
): ProjectRecommendation[] {
  return [...projects].sort((a, b) => {
    const diff = a.priorityScore - b.priorityScore;
    return ascending ? diff : -diff;
  });
}

/**
 * Sort projects by difficulty level
 */
function sortByDifficulty(
  projects: ProjectRecommendation[],
  ascending = true
): ProjectRecommendation[] {
  const difficultyOrder = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
  };

  return [...projects].sort((a, b) => {
    const diff = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    return ascending ? diff : -diff;
  });
}

/**
 * Sort projects by time estimate
 */
function sortByTime(
  projects: ProjectRecommendation[],
  ascending = true
): ProjectRecommendation[] {
  const timeOrder = {
    weekend: 1,
    week: 2,
    extended: 3,
  };

  return [...projects].sort((a, b) => {
    const aCategory = categorizeTimeEstimate(a.timeEstimate);
    const bCategory = categorizeTimeEstimate(b.timeEstimate);
    const diff =
      timeOrder[aCategory as keyof typeof timeOrder] -
      timeOrder[bCategory as keyof typeof timeOrder];
    return ascending ? diff : -diff;
  });
}

/**
 * Sort projects by number of skills taught (descending by default)
 */
function sortBySkills(
  projects: ProjectRecommendation[],
  ascending = false
): ProjectRecommendation[] {
  return [...projects].sort((a, b) => {
    const diff = a.skillsTaught.length - b.skillsTaught.length;
    return ascending ? diff : -diff;
  });
}

/**
 * Apply sorting to project recommendations
 */
export function sortProjects(
  projects: ProjectRecommendation[],
  sortBy: FilterState["sortBy"],
  ascending = false
): ProjectRecommendation[] {
  switch (sortBy) {
    case "priority":
      return sortByPriority(projects, ascending);
    case "difficulty":
      return sortByDifficulty(projects, ascending);
    case "time":
      return sortByTime(projects, ascending);
    case "skills":
      return sortBySkills(projects, ascending);
    default:
      return projects;
  }
}

/**
 * Apply both filters and sorting to recommendations
 */
export function filterAndSortRecommendations(
  recommendations: ProjectRecommendation[],
  filters: FilterState,
  ascending = false
): ProjectRecommendation[] {
  const filtered = applyFilters(recommendations, filters);
  return sortProjects(filtered, filters.sortBy, ascending);
}

/**
 * Alias for sortProjects for backwards compatibility
 */
export function sortRecommendations(
  recommendations: ProjectRecommendation[],
  sortBy: FilterState["sortBy"],
  ascending = false
): ProjectRecommendation[] {
  return sortProjects(recommendations, sortBy, ascending);
}
