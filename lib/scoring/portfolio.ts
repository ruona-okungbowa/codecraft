import { Project } from "@/types";

interface DetailedBreakdown {
  // Project Quality sub-scores
  substantialProjects?: {
    score: number;
    count: number;
    details: string;
  };
  realWorldRelevance?: {
    score: number;
    details: string;
  };
  technicalDepth?: {
    score: number;
    details: string;
  };
  // Documentation sub-scores
  readmeQuality?: {
    score: number;
    avgQuality: number;
    details: string;
  };
  visualDemonstration?: {
    score: number;
    projectsWithScreenshots: number;
    details: string;
  };
  // Tech Diversity sub-scores
  languageDiversity?: {
    score: number;
    languages: string[];
    details: string;
  };
  frameworkVariety?: {
    score: number;
    frameworks: string[];
    details: string;
  };
  fullStackCapability?: {
    score: number;
    details: string;
  };
  // Activity sub-scores
  recentActivity?: {
    score: number;
    daysSinceLastCommit: number;
    details: string;
  };
  commitFrequency?: {
    score: number;
    details: string;
  };
  // Professionalism sub-scores
  communityEngagement?: {
    score: number;
    stars: number;
    forks: number;
    details: string;
  };
  codeOrganization?: {
    score: number;
    details: string;
  };
}

interface Props {
  overallScore: number;
  rank?: string;
  projectQualityScore: number;
  techDiversityScore: number;
  documentationScore: number;
  consistencyScore: number;
  professionalismScore?: number;
  hasProfileReadme?: boolean;
  breakdown: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    detailed?: DetailedBreakdown;
  };
}

export function calculatePortfolioScore(
  projects: Project[],
  hasProfileReadme?: boolean
): Props {
  if (projects.length === 0) {
    return {
      overallScore: 0,
      rank: "C",
      projectQualityScore: 0,
      techDiversityScore: 0,
      documentationScore: 0,
      consistencyScore: 0,
      professionalismScore: 0,
      hasProfileReadme: false,
      breakdown: {
        strengths: [],
        weaknesses: ["No projects found"],
        suggestions: ["Sync your GitHub repositories to get started"],
      },
    };
  }

  // Calculate main category scores with detailed breakdowns
  const projectQualityResult = calculateProjectQualityEnhanced(projects);
  const documentationResult = calculateDocumentationEnhanced(projects);
  const techDiversityResult = calculateTechDiversityEnhanced(projects);
  const consistencyResult = calculateConsistencyEnhanced(projects);
  const professionalismResult = calculateProfessionalism(projects);

  // Apply profile README bonus to documentation
  let documentationScore = documentationResult.score;
  if (hasProfileReadme) {
    documentationScore = Math.min(documentationScore + 10, 100);
  }

  // Calculate weighted overall score (updated weights based on 2025 recruiter feedback)
  const overallScore = Math.round(
    projectQualityResult.score * 0.3 +
      documentationScore * 0.25 +
      techDiversityResult.score * 0.2 +
      consistencyResult.score * 0.15 +
      professionalismResult.score * 0.1
  );

  const rank = calculateRank(overallScore);

  // Generate comprehensive feedback
  const breakdown = generateEnhancedFeedback({
    projectQualityScore: projectQualityResult.score,
    documentationScore,
    techDiversityScore: techDiversityResult.score,
    consistencyScore: consistencyResult.score,
    professionalismScore: professionalismResult.score,
    projectCount: projects.length,
    hasProfileReadme,
    detailed: {
      ...projectQualityResult.breakdown,
      ...documentationResult.breakdown,
      ...techDiversityResult.breakdown,
      ...consistencyResult.breakdown,
      ...professionalismResult.breakdown,
    },
  });

  return {
    overallScore,
    rank,
    projectQualityScore: projectQualityResult.score,
    techDiversityScore: techDiversityResult.score,
    documentationScore,
    consistencyScore: consistencyResult.score,
    professionalismScore: professionalismResult.score,
    hasProfileReadme,
    breakdown,
  };
}

// ============================================
// ENHANCED SCORING FUNCTIONS (2025)
// ============================================

function calculateProjectQualityEnhanced(projects: Project[]) {
  const breakdown: Partial<DetailedBreakdown> = {};

  // 1. Substantial Projects (not tutorial clones)
  const substantialProjects = projects.filter((p) => {
    const hasGoodDescription = p.description && p.description.length > 50;
    const notTutorialClone = !isTutorialClone(p.name);
    // Don't require stars/forks - new projects won't have them yet
    return hasGoodDescription && notTutorialClone;
  });

  const substantialScore = Math.min(
    (substantialProjects.length / 3) * 100,
    100
  );
  breakdown.substantialProjects = {
    score: substantialScore,
    count: substantialProjects.length,
    details:
      substantialProjects.length >= 3
        ? `You have ${substantialProjects.length} substantial, original projects`
        : `Build ${3 - substantialProjects.length} more substantial projects with detailed descriptions`,
  };

  // 2. Real-World Relevance (solves actual problems)
  const realWorldProjects = projects.filter(
    (p) =>
      p.description &&
      p.description.length > 50 &&
      !p.description.toLowerCase().includes("tutorial")
  );

  const realWorldScore = Math.min((realWorldProjects.length / 2) * 100, 100);
  breakdown.realWorldRelevance = {
    score: realWorldScore,
    details:
      realWorldProjects.length >= 2
        ? `${realWorldProjects.length} projects solve real-world problems`
        : "Build projects that solve actual problems, not just tutorials",
  };

  // 3. Technical Depth (complexity indicators)
  const complexProjects = projects.filter((p) => {
    const indicators = [
      p.complexityScore && p.complexityScore >= 60,
      Object.keys(p.languages || {}).length >= 2,
      p.stars >= 5,
      p.forks >= 2,
      p.description && p.description.length > 100, // Detailed description shows depth
    ];
    return indicators.filter(Boolean).length >= 2;
  });

  const depthScore = Math.min((complexProjects.length / 2) * 100, 100);
  breakdown.technicalDepth = {
    score: depthScore,
    details:
      complexProjects.length >= 2
        ? `${complexProjects.length} projects show technical maturity`
        : "Add complexity to projects: multiple languages, good architecture",
  };

  // Average the sub-scores
  const score = Math.round(
    (substantialScore + realWorldScore + depthScore) / 3
  );

  return { score, breakdown };
}

function calculateDocumentationEnhanced(projects: Project[]) {
  const breakdown: Partial<DetailedBreakdown> = {};

  // 1. README Quality (using complexity score as proxy)
  const avgReadmeQuality =
    projects.reduce((sum, p) => sum + (p.complexityScore || 0), 0) /
    projects.length;
  const readmeScore = avgReadmeQuality;

  breakdown.readmeQuality = {
    score: readmeScore,
    avgQuality: Math.round(avgReadmeQuality),
    details:
      avgReadmeQuality >= 75
        ? `Excellent README documentation (${Math.round(avgReadmeQuality)}/100)`
        : "Improve READMEs: add setup instructions, screenshots, tech stack",
  };

  // 2. Visual Demonstration (check for visual keywords in description)
  const projectsWithScreenshots = projects.filter(
    (p) => p.description && hasVisualContent(p.description)
  ).length;

  const visualScore = Math.min(
    (projectsWithScreenshots / Math.max(projects.length, 1)) * 100,
    100
  );
  breakdown.visualDemonstration = {
    score: visualScore,
    projectsWithScreenshots,
    details:
      visualScore >= 60
        ? `${projectsWithScreenshots} projects include visual demos`
        : "Add screenshots, GIFs, or demo videos to your READMEs",
  };

  // Average the sub-scores
  const score = Math.round((readmeScore + visualScore) / 2);

  return { score, breakdown };
}

function calculateTechDiversityEnhanced(projects: Project[]) {
  const breakdown: Partial<DetailedBreakdown> = {};

  // 1. Language Diversity
  const allLanguages = new Set<string>();
  projects.forEach((p) => {
    if (p.languages) {
      Object.keys(p.languages).forEach((lang) => allLanguages.add(lang));
    }
  });

  const languageCount = allLanguages.size;
  const languageScore = Math.min((languageCount / 5) * 100, 100);

  breakdown.languageDiversity = {
    score: languageScore,
    languages: Array.from(allLanguages),
    details:
      languageCount >= 5
        ? `Strong diversity across ${languageCount} languages`
        : `Learn more languages (you have ${languageCount}, aim for 5+)`,
  };

  // 2. Framework Variety (extracted from project names and descriptions)
  const frameworks = extractFrameworks(projects);
  const frameworkScore = Math.min((frameworks.length / 6) * 100, 100);

  breakdown.frameworkVariety = {
    score: frameworkScore,
    frameworks,
    details:
      frameworks.length >= 6
        ? `Experience with ${frameworks.length} different frameworks`
        : "Diversify your framework knowledge (aim for 6+)",
  };

  // 3. Full-Stack Capability
  const hasFrontend = projects.some((p) => hasFrontendTech(p));
  const hasBackend = projects.some((p) => hasBackendTech(p));
  const hasDatabase = projects.some((p) => hasDatabaseTech(p));

  const fullStackIndicators = [hasFrontend, hasBackend, hasDatabase].filter(
    Boolean
  ).length;
  const fullStackScore = (fullStackIndicators / 3) * 100;

  breakdown.fullStackCapability = {
    score: fullStackScore,
    details:
      fullStackIndicators === 3
        ? "Full-stack developer: frontend, backend, database"
        : `Missing: ${!hasFrontend ? "Frontend " : ""}${!hasBackend ? "Backend " : ""}${!hasDatabase ? "Database" : ""}`.trim(),
  };

  const score = Math.round(
    (languageScore + frameworkScore + fullStackScore) / 3
  );

  return { score, breakdown };
}

function calculateConsistencyEnhanced(projects: Project[]) {
  const breakdown: Partial<DetailedBreakdown> = {};

  // 1. Recent Activity
  const mostRecentCommit = projects.reduce((latest, p) => {
    if (!p.lastCommitDate) return latest;
    const date = new Date(p.lastCommitDate);
    return date > latest ? date : latest;
  }, new Date(0));

  const daysSinceLastCommit = Math.floor(
    (Date.now() - mostRecentCommit.getTime()) / (1000 * 60 * 60 * 24)
  );
  const recencyScore = Math.max(100 - (daysSinceLastCommit / 30) * 100, 0);

  breakdown.recentActivity = {
    score: recencyScore,
    daysSinceLastCommit,
    details:
      daysSinceLastCommit <= 7
        ? `Very active: last commit ${daysSinceLastCommit} days ago`
        : `Last commit was ${daysSinceLastCommit} days ago (aim for weekly activity)`,
  };

  // 2. Commit Frequency (based on project activity)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const recentlyActive = projects.filter((p) => {
    if (!p.lastCommitDate) return false;
    const lastCommit = new Date(p.lastCommitDate);
    return lastCommit > threeMonthsAgo;
  }).length;

  const frequencyScore = (recentlyActive / projects.length) * 100;

  breakdown.commitFrequency = {
    score: frequencyScore,
    details:
      frequencyScore >= 70
        ? `${recentlyActive} of ${projects.length} projects active in last 3 months`
        : "Increase commit frequency across your projects",
  };

  const score = Math.round((recencyScore + frequencyScore) / 2);

  return { score, breakdown };
}

function calculateProfessionalism(projects: Project[]) {
  const breakdown: Partial<DetailedBreakdown> = {};

  // 1. Community Engagement
  const totalStars = projects.reduce((sum, p) => sum + p.stars, 0);
  const totalForks = projects.reduce((sum, p) => sum + p.forks, 0);

  // Give base score for having projects, bonus for engagement
  const baseScore = Math.min(projects.length * 10, 50); // Up to 50 points for having projects
  const engagementBonus = Math.min(
    ((totalStars + totalForks * 2) / 20) * 50,
    50
  );
  const engagementScore = baseScore + engagementBonus;

  breakdown.communityEngagement = {
    score: engagementScore,
    stars: totalStars,
    forks: totalForks,
    details:
      totalStars + totalForks > 10
        ? `Good community engagement: ${totalStars} stars, ${totalForks} forks`
        : totalStars + totalForks > 0
          ? `Growing engagement: ${totalStars} stars, ${totalForks} forks`
          : "Share your projects on social media and developer communities to gain visibility",
  };

  // 2. Code Organization (projects with good descriptions)
  const organizedProjects = projects.filter(
    (p) => p.description && p.description.length > 30
  ).length;

  const organizationScore = Math.min(
    (organizedProjects / projects.length) * 100,
    100
  );
  breakdown.codeOrganization = {
    score: organizationScore,
    details:
      organizationScore >= 70
        ? `${organizedProjects} projects are well-organized`
        : "Add detailed descriptions and documentation to all projects",
  };

  const score = Math.round((engagementScore + organizationScore) / 2);

  return { score, breakdown };
}

// ============================================
// LEGACY SCORING FUNCTIONS (kept for compatibility)
// ============================================

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

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateRank(
  score: number
): "S" | "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" {
  if (score >= 95) return "S"; // Top 1%
  if (score >= 87.5) return "A+"; // Top 12.5%
  if (score >= 75) return "A"; // Top 25%
  if (score >= 62.5) return "A-"; // Top 37.5%
  if (score >= 50) return "B+"; // Top 50%
  if (score >= 37.5) return "B"; // Top 62.5%
  if (score >= 25) return "B-"; // Top 75%
  if (score >= 12.5) return "C+"; // Top 87.5%
  return "C";
}

function isTutorialClone(name: string): boolean {
  const tutorialKeywords = [
    "tutorial",
    "clone",
    "practice",
    "learning",
    "course",
    "todo",
    "to-do",
    "example",
    "sample",
    "demo",
    "test",
  ];
  return tutorialKeywords.some((keyword) =>
    name.toLowerCase().includes(keyword)
  );
}

function hasVisualContent(description: string): boolean {
  return /screenshot|demo|gif|video|preview|image/.test(
    description.toLowerCase()
  );
}

function extractFrameworks(projects: Project[]): string[] {
  const frameworks = new Set<string>();
  const frameworkKeywords = [
    "react",
    "vue",
    "angular",
    "svelte",
    "next",
    "nuxt",
    "express",
    "fastify",
    "nest",
    "django",
    "flask",
    "rails",
    "spring",
    "laravel",
    "tailwind",
    "bootstrap",
    "graphql",
    "prisma",
    "mongoose",
  ];

  projects.forEach((p) => {
    const text =
      `${p.name} ${p.description || ""} ${Object.keys(p.languages || {}).join(" ")}`.toLowerCase();
    frameworkKeywords.forEach((fw) => {
      if (text.includes(fw)) frameworks.add(fw);
    });
  });

  return Array.from(frameworks);
}

function hasFrontendTech(project: Project): boolean {
  const frontendIndicators = [
    "react",
    "vue",
    "angular",
    "svelte",
    "html",
    "css",
    "javascript",
    "typescript",
    "tailwind",
  ];
  const text =
    `${project.name} ${project.description || ""} ${Object.keys(project.languages || {}).join(" ")}`.toLowerCase();
  return frontendIndicators.some((tech) => text.includes(tech));
}

function hasBackendTech(project: Project): boolean {
  const backendIndicators = [
    "node",
    "express",
    "fastify",
    "nest",
    "python",
    "django",
    "flask",
    "java",
    "spring",
    "go",
    "rust",
    "api",
  ];
  const text =
    `${project.name} ${project.description || ""} ${Object.keys(project.languages || {}).join(" ")}`.toLowerCase();
  return backendIndicators.some((tech) => text.includes(tech));
}

function hasDatabaseTech(project: Project): boolean {
  const dbIndicators = [
    "postgres",
    "mysql",
    "mongodb",
    "redis",
    "sqlite",
    "prisma",
    "mongoose",
    "sequelize",
    "database",
    "supabase",
    "firebase",
  ];
  const text = `${project.name} ${project.description || ""}`.toLowerCase();
  return dbIndicators.some((tech) => text.includes(tech));
}

function generateEnhancedFeedback(scores: {
  projectQualityScore: number;
  techDiversityScore: number;
  documentationScore: number;
  consistencyScore: number;
  professionalismScore: number;
  projectCount: number;
  hasProfileReadme?: boolean;
  detailed: DetailedBreakdown;
}): {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  detailed?: DetailedBreakdown;
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  // Project Quality feedback
  if (scores.projectQualityScore >= 70) {
    strengths.push("High-quality projects with good complexity");
    if (
      scores.detailed.substantialProjects &&
      scores.detailed.substantialProjects.count >= 3
    ) {
      strengths.push(
        `${scores.detailed.substantialProjects.count} substantial, original projects`
      );
    }
  } else if (scores.projectQualityScore < 50) {
    weaknesses.push("Projects need more complexity and features");
    suggestions.push(
      "Build substantial projects with 20+ commits and detailed documentation"
    );
  }

  // Documentation feedback
  if (scores.documentationScore >= 70) {
    strengths.push("Well-documented projects");
    if (scores.hasProfileReadme) {
      strengths.push("Professional GitHub profile README");
    }
  } else if (scores.documentationScore < 50) {
    weaknesses.push("Projects lack proper documentation");
    suggestions.push(
      "Add detailed README files with setup instructions, screenshots, and tech stack"
    );
  }

  // Tech Diversity feedback
  if (scores.techDiversityScore >= 70) {
    strengths.push("Diverse technology stack");
    if (
      scores.detailed.languageDiversity &&
      scores.detailed.languageDiversity.languages.length >= 5
    ) {
      strengths.push(
        `Experience with ${scores.detailed.languageDiversity.languages.length} programming languages`
      );
    }
  } else if (scores.techDiversityScore < 50) {
    weaknesses.push("Limited technology diversity");
    suggestions.push(
      "Learn and use different programming languages and frameworks"
    );
  }

  // Consistency feedback
  if (scores.consistencyScore >= 70) {
    strengths.push("Consistent development activity");
  } else if (scores.consistencyScore < 50) {
    weaknesses.push("Irregular development activity");
    suggestions.push("Commit code regularly and maintain active projects");
  }

  // Professionalism feedback
  if (scores.professionalismScore >= 70) {
    strengths.push("Professional portfolio presentation");
  } else if (scores.professionalismScore < 50) {
    suggestions.push(
      "Improve project organization with detailed descriptions and documentation"
    );
  }

  // General feedback
  if (!scores.hasProfileReadme) {
    suggestions.push(
      "Create a GitHub profile README to showcase your skills and projects"
    );
  }

  if (scores.projectCount < 3) {
    suggestions.push(
      "Build more projects to showcase your skills (aim for 5-8)"
    );
  } else if (scores.projectCount >= 10) {
    strengths.push(`Impressive portfolio with ${scores.projectCount} projects`);
  }

  // Add specific actionable suggestions based on detailed breakdown
  if (
    scores.detailed.visualDemonstration &&
    scores.detailed.visualDemonstration.score < 50
  ) {
    suggestions.push("Add screenshots, GIFs, or demo videos to your READMEs");
  }

  if (
    scores.detailed.communityEngagement &&
    scores.detailed.communityEngagement.score < 40
  ) {
    suggestions.push(
      "Share your projects on social media and developer communities"
    );
  }

  return {
    strengths,
    weaknesses,
    suggestions: suggestions.slice(0, 5), // Top 5 recommendations
    detailed: scores.detailed,
  };
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
