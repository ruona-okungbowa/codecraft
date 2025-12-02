import type {
  ProjectRecommendation,
  FilterState,
} from "@/types/recommendations";

/**
 * Maps time estimate strings to time commitment categories
 */
function getTimeCommitment(
  timeEstimate: string
): "weekend" | "week" | "extended" {
  const lower = timeEstimate.toLowerCase();

  // Weekend: 1-2 days, 8-16 hours, weekend project
  if (
    lower.includes("weekend") ||
    lower.includes("1-2 day") ||
    lower.includes("8-16 hour") ||
    lower.includes("10-15 hour")
  ) {
    return "weekend";
  }

  // Week: 3-7 days, 20-40 hours, week-long
  if (
    lower.includes("week") ||
    lower.includes("3-5 day") ||
    lower.includes("20-40 hour") ||
    lower.includes("30-40 hour")
  ) {
    return "week";
  }

  // Extended: 2+ weeks, 40+ hours, month-long
  return "extended";
}

/**
 * Checks if a project matches the difficulty filter
 */
function matchesDifficulty(
  project: ProjectRecommendation,
  difficulty: FilterState["difficulty"]
): boolean {
  if (difficulty === "all") return true;
  return project.difficulty === difficulty;
}

/**
 * Checks if a project matches the category filter
 */
function matchesCategory(
  project: ProjectRecommendation,
  category: FilterState["category"]
): boolean {
  if (category === "all") return true;
  return project.category === category;
}

/**
 * Checks if a project matches the time commitment filter
 */
function matchesTimeCommitment(
  project: ProjectRecommendation,
  timeCommitment: FilterState["timeCommitment"]
): boolean {
  if (timeCommitment === "all") return true;
  const projectTime = getTimeCommitment(project.timeEstimate);
  return projectTime === timeCommitment;
}

/**
 * Checks if a project teaches any of the selected skills
 */
function matchesSkills(
  project: ProjectRecommendation,
  skills: string[]
): boolean {
  if (skills.length === 0) return true;

  // Check if project teaches any of the selected skills
  return skills.some((selectedSkill) =>
    project.skillsTaught.some(
      (taughtSkill) => taughtSkill.toLowerCase() === selectedSkill.toLowerCase()
    )
  );
}

/**
 * Applies all active filters to the recommendations list
 * Uses AND logic - projects must match ALL active filters
 */
export function applyFilters(
  recommendations: ProjectRecommendation[],
  filters: FilterState
): ProjectRecommendation[] {
  return recommendations.filter((project) => {
    // AND logic: project must match all filters
    return (
      matchesDifficulty(project, filters.difficulty) &&
      matchesCategory(project, filters.category) &&
      matchesTimeCommitment(project, filters.timeCommitment) &&
      matchesSkills(project, filters.skills)
    );
  });
}

/**
 * Sorts recommendations by priority score (high to low)
 */
function sortByPriority(
  recommendations: ProjectRecommendation[],
  ascending: boolean = false
): ProjectRecommendation[] {
  return [...recommendations].sort((a, b) => {
    const diff = b.priorityScore - a.priorityScore;
    return ascending ? -diff : diff;
  });
}

/**
 * Sorts recommendations by difficulty level
 * Default is ascending (beginner -> intermediate -> advanced)
 */
function sortByDifficulty(
  recommendations: ProjectRecommendation[],
  ascending: boolean = true
): ProjectRecommendation[] {
  const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };

  return [...recommendations].sort((a, b) => {
    const aOrder = difficultyOrder[a.difficulty];
    const bOrder = difficultyOrder[b.difficulty];
    const diff = aOrder - bOrder;
    return ascending ? diff : -diff;
  });
}

/**
 * Sorts recommendations by time estimate
 * Default is ascending (weekend -> week -> extended)
 */
function sortByTime(
  recommendations: ProjectRecommendation[],
  ascending: boolean = true
): ProjectRecommendation[] {
  const timeOrder = { weekend: 1, week: 2, extended: 3 };

  return [...recommendations].sort((a, b) => {
    const aTime = getTimeCommitment(a.timeEstimate);
    const bTime = getTimeCommitment(b.timeEstimate);
    const aOrder = timeOrder[aTime];
    const bOrder = timeOrder[bTime];
    const diff = aOrder - bOrder;
    return ascending ? diff : -diff;
  });
}

/**
 * Sorts recommendations by number of skills taught (most to least)
 */
function sortBySkills(
  recommendations: ProjectRecommendation[],
  ascending: boolean = false
): ProjectRecommendation[] {
  return [...recommendations].sort((a, b) => {
    const diff = b.skillsTaught.length - a.skillsTaught.length;
    return ascending ? -diff : diff;
  });
}

/**
 * Sorts recommendations based on the selected sort criteria
 */
export function sortRecommendations(
  recommendations: ProjectRecommendation[],
  sortBy: FilterState["sortBy"],
  ascending: boolean = false
): ProjectRecommendation[] {
  switch (sortBy) {
    case "priority":
      return sortByPriority(recommendations, ascending);
    case "difficulty":
      return sortByDifficulty(recommendations, ascending);
    case "time":
      return sortByTime(recommendations, ascending);
    case "skills":
      return sortBySkills(recommendations, ascending);
    default:
      return recommendations;
  }
}
