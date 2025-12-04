import { Project } from "@/types";

export interface JobMatchResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendedProjects: string[];
  breakdown: {
    essentialMatch: number;
    totalRequired: number;
    totalMatched: number;
  };
}

/**
 * Calculate job match percentage based on user's skills vs required skills
 */
export function calculateJobMatch(
  requiredSkills: string[],
  userProjects: Project[]
): JobMatchResult {
  // Extract all skills from user's projects
  const userSkills = new Set<string>();

  // Auto-add Git since users have GitHub accounts
  userSkills.add("git");
  userSkills.add("version control");
  userSkills.add("github");

  userProjects.forEach((project) => {
    // Add languages from project
    if (project.languages) {
      Object.keys(project.languages).forEach((lang) => {
        userSkills.add(lang.toLowerCase());
      });
    }

    // Detect frameworks, tools, and responsive design from project description
    if (project.description) {
      const { skills: detectedSkills, hasResponsive } =
        detectSkillsInDescription(project.description);
      detectedSkills.forEach((skill) => userSkills.add(skill));

      if (hasResponsive) {
        userSkills.add("responsive design");
      }
    }
  });

  // Normalize required skills for comparison
  const normalizedRequired = requiredSkills.map((s) => s.toLowerCase());
  const normalizedUser = Array.from(userSkills);

  // Find matched and missing skills
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  normalizedRequired.forEach((required) => {
    const isMatch = normalizedUser.some((user) => {
      // Exact match or partial match (e.g., "React" matches "ReactJS")
      return (
        user === required || user.includes(required) || required.includes(user)
      );
    });

    if (isMatch) {
      // Find original casing from requiredSkills
      const original = requiredSkills.find((s) => s.toLowerCase() === required);
      matchedSkills.push(original || required);
    } else {
      const original = requiredSkills.find((s) => s.toLowerCase() === required);
      missingSkills.push(original || required);
    }
  });

  // Calculate match percentage
  const matchPercentage =
    requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 0;

  // Recommend projects that demonstrate matched skills
  const recommendedProjects = userProjects
    .filter((project) => {
      // Check if project uses any of the matched skills
      const projectSkills = new Set<string>();
      if (project.languages) {
        Object.keys(project.languages).forEach((lang) =>
          projectSkills.add(lang.toLowerCase())
        );
      }

      return matchedSkills.some((skill) =>
        Array.from(projectSkills).some(
          (ps) =>
            ps === skill.toLowerCase() ||
            ps.includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(ps)
        )
      );
    })
    .sort((a, b) => (b.stars || 0) - (a.stars || 0)) // Sort by stars
    .slice(0, 5) // Top 5 projects
    .map((p) => p.id);

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    recommendedProjects,
    breakdown: {
      essentialMatch: matchedSkills.length,
      totalRequired: requiredSkills.length,
      totalMatched: matchedSkills.length,
    },
  };
}

/**
 * Detect frameworks, tools, and responsive design from project description
 */
function detectSkillsInDescription(description: string): {
  skills: string[];
  hasResponsive: boolean;
} {
  // Validate input
  if (!description || typeof description !== "string") {
    return { skills: [], hasResponsive: false };
  }

  const skills: string[] = [];
  const lowerText = description.toLowerCase();

  // Framework patterns to detect
  const frameworkPatterns: Record<string, string[]> = {
    react: ["react", "reactjs", "react.js"],
    "next.js": ["next.js", "nextjs"],
    vue: ["vue", "vuejs", "vue.js"],
    angular: ["angular"],
    svelte: ["svelte"],
    "node.js": ["node", "nodejs", "node.js"],
    express: ["express", "expressjs"],
    django: ["django"],
    flask: ["flask"],
    fastapi: ["fastapi"],
    spring: ["spring", "spring boot"],
    laravel: ["laravel"],
    rails: ["rails", "ruby on rails"],
    tailwind: ["tailwind", "tailwindcss"],
    bootstrap: ["bootstrap"],
    mongodb: ["mongodb", "mongo"],
    postgresql: ["postgresql", "postgres"],
    mysql: ["mysql"],
    redis: ["redis"],
    firebase: ["firebase"],
    supabase: ["supabase"],
    docker: ["docker"],
    kubernetes: ["kubernetes", "k8s"],
    aws: ["aws", "amazon web services"],
    azure: ["azure"],
    gcp: ["gcp", "google cloud"],
    redux: ["redux"],
    graphql: ["graphql"],
    "rest api": ["rest api", "restful api", "restful"],
    typescript: ["typescript"],
    "react native": ["react native"],
  };

  // Check for each framework pattern
  Object.entries(frameworkPatterns).forEach(([skill, patterns]) => {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern)) {
        skills.push(skill);
        break;
      }
    }
  });

  // Detect responsive design
  const responsiveKeywords = [
    "responsive",
    "mobile-friendly",
    "mobile friendly",
    "mobile responsive",
    "adaptive design",
    "media queries",
    "mobile-first",
    "mobile first",
    "cross-device",
    "multi-device",
    "tablet",
    "smartphone",
  ];
  const hasResponsive = responsiveKeywords.some((keyword) =>
    lowerText.includes(keyword)
  );

  return { skills, hasResponsive };
}
