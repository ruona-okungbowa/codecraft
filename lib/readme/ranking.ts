import { Project } from "@/types";

export function calculateProjectScore(project: Project): number {
  let score = 0;

  // Stars contribute to score (capped at 50 points)
  const starScore = Math.min((project.stars || 0) * 2, 50);
  score += starScore;

  // Forks indicate project usefulness (capped at 20 points)
  const forkScore = Math.min((project.forks || 0) * 4, 20);
  score += forkScore;

  // Recent activity (updated recently gets bonus)
  if (project.updatedAt) {
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(project.updatedAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (daysSinceUpdate < 30) {
      score += 15;
    } else if (daysSinceUpdate < 90) {
      score += 10;
    } else if (daysSinceUpdate < 180) {
      score += 5;
    }
  }

  // Has description (indicates documentation)
  if (project.description && project.description.length > 20) {
    score += 10;
  }

  // Has languages (indicates tech diversity)
  if (project.languages && Object.keys(project.languages).length > 0) {
    score += Math.min(Object.keys(project.languages).length * 2, 10);
  }

  return Math.min(score, 100);
}

/**
 * Ranks projects by a combination of stars and complexity
 * @param projects - Array of projects to rank
 * @returns Sorted array with highest ranked projects first
 */
export function rankProjects(projects: Project[]): Project[] {
  return projects
    .map((project) => ({
      project,
      score: (project.stars || 0) * 0.6 + calculateProjectScore(project) * 0.4,
    }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.project);
}

/**
 * Selects the top N projects from a user's portfolio
 * @param projects - Array of all projects
 * @param count - Number of projects to select (default 6)
 * @returns Array of top projects
 */
export function selectTopProjects(
  projects: Project[],
  count: number = 6
): Project[] {
  const ranked = rankProjects(projects);
  return ranked.slice(0, Math.min(count, ranked.length));
}
