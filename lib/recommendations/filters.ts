import type {
  ProjectRecommendation,
  FilterState,
} from "@/types/recommendations";

export function applyFilters(
  recommendations: ProjectRecommendation[],
  filters: FilterState
): ProjectRecommendation[] {
  const filtered = recommendations.filter((project) => {
    if (
      filters.difficulty !== "all" &&
      project.difficulty !== filters.difficulty
    ) {
      return false;
    }

    if (filters.category !== "all" && project.category !== filters.category) {
      return false;
    }

    if (filters.timeCommitment !== "all") {
      const matchesTime = matchesTimeCommitment(
        project.timeEstimate,
        filters.timeCommitment
      );
      if (!matchesTime) return false;
    }

    if (filters.skills.length > 0) {
      const teachesSelectedSkill = project.skillsTaught.some((skill) =>
        filters.skills.some((filterSkill) =>
          skill.toLowerCase().includes(filterSkill.toLowerCase())
        )
      );
      if (!teachesSelectedSkill) return false;
    }

    return true;
  });

  return filtered;
}

function matchesTimeCommitment(
  timeEstimate: string,
  commitment: "weekend" | "week" | "extended"
): boolean {
  const lower = timeEstimate.toLowerCase();

  if (commitment === "weekend") {
    return (
      lower.includes("day") &&
      !lower.includes("week") &&
      !lower.includes("month")
    );
  }

  if (commitment === "week") {
    return lower.includes("week") && !lower.includes("month");
  }

  if (commitment === "extended") {
    const hasWeeks = lower.includes("week");
    const hasMonths = lower.includes("month");
    if (hasMonths) return true;
    if (hasWeeks) {
      const match = lower.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        return num >= 3;
      }
    }
  }

  return false;
}

export function sortRecommendations(
  recommendations: ProjectRecommendation[],
  sortBy: FilterState["sortBy"]
): ProjectRecommendation[] {
  const sorted = [...recommendations];

  switch (sortBy) {
    case "priority":
      return sorted.sort((a, b) => b.priorityScore - a.priorityScore);

    case "difficulty":
      const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
      return sorted.sort(
        (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      );

    case "time":
      return sorted.sort((a, b) => {
        const aHours = estimateHours(a.timeEstimate);
        const bHours = estimateHours(b.timeEstimate);
        return aHours - bHours;
      });

    case "skills":
      return sorted.sort(
        (a, b) => b.skillsTaught.length - a.skillsTaught.length
      );

    default:
      return sorted;
  }
}

function estimateHours(timeEstimate: string): number {
  const lower = timeEstimate.toLowerCase();

  const match = lower.match(/(\d+)/);
  if (!match) return 999;

  const num = parseInt(match[1]);

  if (lower.includes("hour")) return num;
  if (lower.includes("day")) return num * 8;
  if (lower.includes("week")) return num * 40;
  if (lower.includes("month")) return num * 160;

  return num * 8;
}
