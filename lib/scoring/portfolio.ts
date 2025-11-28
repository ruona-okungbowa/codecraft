import { Project } from "@/types";

interface Props {
  overallScore: number;
  projectQualityScore: number;
  techDiversityScore: number;
  documentationScore: number;
  consistencyScore: number;
  hasProfileReadme?: boolean;
  breakdown: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

export function calculatePortfolioScore(
  projects: Project[],
  hasProfileReadme?: boolean
): Props {
  if (projects.length === 0) {
    return {
      overallScore: 0,
      projectQualityScore: 0,
      techDiversityScore: 0,
      documentationScore: 0,
      consistencyScore: 0,
      hasProfileReadme: false,
      breakdown: {
        strengths: [],
        weaknesses: ["No projects found"],
        suggestions: ["Sync your GitHub repositories to get started"],
      },
    };
  }

  const projectQualityScore = calculateProjectQuality(projects);
  const techDiversityScore = calculateTechDiversity(projects);
  let documentationScore = calculateDocumentation(projects);
  const consistencyScore = calculateConsistency(projects);

  if (hasProfileReadme) {
    documentationScore = Math.min(documentationScore + 10, 100);
  }

  const overallScore = Math.round(
    projectQualityScore * 0.35 +
      techDiversityScore * 0.25 +
      documentationScore * 0.2 +
      consistencyScore * 0.2
  );

  const breakdown = generateFeedback({
    projectQualityScore,
    techDiversityScore,
    documentationScore,
    consistencyScore,
    projectCount: projects.length,
    hasProfileReadme,
  });

  return {
    overallScore,
    projectQualityScore,
    techDiversityScore,
    documentationScore,
    consistencyScore,
    hasProfileReadme,
    breakdown,
  };
}

function calculateProjectQuality(projects: Project[]): number {
  const analysedProjects = projects.filter((p) => p.complexityScore !== null);

  if (analysedProjects.length === 0) {
    return 0;
  }
  const avgComplexity =
    analysedProjects.reduce((sum, p) => sum + (p.complexityScore || 0), 0) /
    analysedProjects.length;
  const highQualityProjects = analysedProjects.filter(
    (p) => (p.complexityScore || 0) >= 70
  ).length;

  const bonus = Math.min(highQualityProjects * 5, 20);

  return Math.min(Math.round(avgComplexity + bonus), 100);
}

function calculateTechDiversity(projects: Project[]): number {
  const allLanguages = new Set<string>();

  projects.forEach((project) => {
    if (project.languages) {
      Object.keys(project.languages).forEach((lang) => allLanguages.add(lang));
    }
  });

  const languageCount = allLanguages.size;

  let score = 0;
  if (languageCount === 0) {
    score = 0;
  } else if (languageCount <= 2) {
    score = 20 + languageCount * 10;
  } else if (languageCount <= 5) {
    score = 40 + (languageCount - 2) * 10;
  } else if (languageCount <= 10) {
    score = 70 + (languageCount - 5) * 4;
  } else {
    score = 90 + Math.min((languageCount - 10) * 2, 10);
  }

  return Math.min(score, 100);
}

function calculateDocumentation(projects: Project[]): number {
  let score = 0;

  const withDescription = projects.filter(
    (p) => p.description && p.description.length > 10
  ).length;
  const descriptionScore = (withDescription / projects.length) * 50;
  const withStars = projects.filter((p) => p.stars > 0).length;
  const starsScore = (withStars / projects.length) * 30;
  const withMultipleLangs = projects.filter(
    (p) => p.languages && Object.keys(p.languages).length > 1
  ).length;
  const complexityScore = (withMultipleLangs / projects.length) * 20;

  score = descriptionScore + starsScore + complexityScore;
  return Math.round(Math.min(score, 100));
}

export async function checkProfileReadme(
  username: string,
  githubToken: string
): Promise<boolean> {
  try {
    const { Octokit } = await import("octokit");
    const octokit = new Octokit({ auth: githubToken });

    await octokit.rest.repos.get({
      owner: username,
      repo: username,
    });

    const { data } = await octokit.rest.repos.getContent({
      owner: username,
      repo: username,
      path: "README.md",
    });

    return !!data;
  } catch {
    return false;
  }
}

function calculateConsistency(projects: Project[]): number {
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const recentlyActive = projects.filter((p) => {
    if (!p.lastCommitDate) return false;
    const lastCommit = new Date(p.lastCommitDate);
    return lastCommit > threeMonthsAgo;
  }).length;

  const activityScore = (recentlyActive / projects.length) * 60;
  const completed = projects.filter((p) => p.stars > 0 || p.forks > 0).length;
  const completionScore = (completed / projects.length) * 40;

  return Math.round(activityScore + completionScore);
}

function generateFeedback(scores: {
  projectQualityScore: number;
  techDiversityScore: number;
  documentationScore: number;
  consistencyScore: number;
  projectCount: number;
  hasProfileReadme?: boolean;
}): {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  if (scores.projectQualityScore >= 70) {
    strengths.push("High-quality projects with good complexity");
  } else if (scores.projectQualityScore < 50) {
    weaknesses.push("Projects need more complexity and features");
    suggestions.push(
      "Add more features to existing projects or build more complex applications"
    );
  }

  if (scores.techDiversityScore >= 70) {
    strengths.push("Diverse technology stack");
  } else if (scores.techDiversityScore < 50) {
    weaknesses.push("Limited technology diversity");
    suggestions.push(
      "Learn and use different programming languages and frameworks"
    );
  }

  if (scores.documentationScore >= 70) {
    strengths.push("Well-documented projects");
    if (scores.hasProfileReadme) {
      strengths.push("Professional GitHub profile README");
    }
  } else if (scores.documentationScore < 50) {
    weaknesses.push("Projects lack proper documentation");
    suggestions.push(
      "Add detailed README files with setup instructions and descriptions"
    );
  }

  if (!scores.hasProfileReadme) {
    suggestions.push(
      "Create a GitHub profile README to showcase your skills and projects"
    );
  }

  if (scores.consistencyScore >= 70) {
    strengths.push("Consistent development activity");
  } else if (scores.consistencyScore < 50) {
    weaknesses.push("Irregular development activity");
    suggestions.push("Commit code regularly and maintain active projects");
  }

  if (scores.projectCount < 3) {
    suggestions.push("Build more projects to showcase your skills");
  } else if (scores.projectCount >= 10) {
    strengths.push(`Impressive portfolio with ${scores.projectCount} projects`);
  }

  return { strengths, weaknesses, suggestions };
}
