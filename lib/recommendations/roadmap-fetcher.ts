import { ProjectTemplate } from "@/types/recommendations";

export async function fetchRoadmapProjects(
  role: string
): Promise<ProjectTemplate[]> {
  try {
    // Map common roles to roadmap.sh paths
    const rolePathMap: Record<string, string> = {
      "frontend developer": "frontend",
      "backend developer": "backend",
      "full stack developer": "full-stack",
      "devops engineer": "devops",
      "software engineer": "software-design-architecture",
    };

    const roadmapPath =
      rolePathMap[role.toLowerCase()] || "software-design-architecture";
    const projectsUrl = `https://roadmap.sh/${roadmapPath}/projects`;

    const response = await fetch("/api/mcp/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: projectsUrl,
        max_length: 10000,
      }),
    });

    if (!response.ok) {
      console.warn("Failed to fetch from roadmap.sh, using fallback");
      return [];
    }

    const data = await response.json();
    const content = data.content || "";

    // Parse the content to extract project information
    const projects = parseRoadmapContent(content, roadmapPath);

    return projects;
  } catch (error) {
    console.error("Error fetching roadmap projects:", error);
    return [];
  }
}

/**
 * Parse roadmap.sh content and convert to ProjectTemplate format
 */
function parseRoadmapContent(
  content: string,
  roadmapPath: string
): ProjectTemplate[] {
  const projects: ProjectTemplate[] = [];

  // Extract project links and titles from markdown content
  // Roadmap.sh typically has project links in format: [Project Name](url)
  const projectRegex = /\[([^\]]+)\]\((\/projects\/[^\)]+)\)/g;
  let match;

  while ((match = projectRegex.exec(content)) !== null) {
    const [, title, path] = match;

    // Skip if not a valid project
    if (!title || !path) continue;

    // Infer difficulty from title or position
    const difficulty = inferDifficulty(title);

    // Create a basic template
    const template: ProjectTemplate = {
      id: path.replace("/projects/", "").toLowerCase(),
      name: title,
      description: `Build ${title} - a ${roadmapPath} project from roadmap.sh`,
      techStack: inferTechStack(roadmapPath),
      difficulty,
      timeEstimate: estimateTime(difficulty),
      skillsTaught: inferSkills(title, roadmapPath),
      category: (roadmapPath === "frontend" ||
      roadmapPath === "backend" ||
      roadmapPath === "fullstack" ||
      roadmapPath === "devops"
        ? roadmapPath
        : "backend") as "frontend" | "backend" | "fullstack" | "devops",
      features: [],
      learningResources: [
        {
          title: `${title} - Roadmap.sh`,
          url: `https://roadmap.sh${path}`,
          type: "article",
        },
      ],
    };

    projects.push(template);
  }

  return projects;
}

/**
 * Infer difficulty from project title
 */
function inferDifficulty(
  title: string
): "beginner" | "intermediate" | "advanced" {
  const lowerTitle = title.toLowerCase();

  if (
    lowerTitle.includes("basic") ||
    lowerTitle.includes("simple") ||
    lowerTitle.includes("intro")
  ) {
    return "beginner";
  }

  if (
    lowerTitle.includes("advanced") ||
    lowerTitle.includes("complex") ||
    lowerTitle.includes("scalable")
  ) {
    return "advanced";
  }

  return "intermediate";
}

/**
 * Infer tech stack based on roadmap path
 */
function inferTechStack(roadmapPath: string): string[] {
  const stackMap: Record<string, string[]> = {
    frontend: ["HTML", "CSS", "JavaScript", "React"],
    backend: ["Node.js", "Express", "PostgreSQL"],
    "full-stack": ["React", "Node.js", "Express", "PostgreSQL"],
    devops: ["Docker", "Kubernetes", "CI/CD", "Linux"],
  };

  return stackMap[roadmapPath] || ["JavaScript"];
}

/**
 * Estimate time based on difficulty
 */
function estimateTime(
  difficulty: "beginner" | "intermediate" | "advanced"
): string {
  const timeMap = {
    beginner: "1-3 days",
    intermediate: "1-2 weeks",
    advanced: "2-4 weeks",
  };

  return timeMap[difficulty];
}

/**
 * Infer skills from title and roadmap path
 */
function inferSkills(title: string, roadmapPath: string): string[] {
  const skills: string[] = [];
  const lowerTitle = title.toLowerCase();

  // Common skill keywords
  const skillKeywords: Record<string, string[]> = {
    api: ["REST API", "API design"],
    auth: ["Authentication", "JWT"],
    database: ["Database design", "SQL"],
    docker: ["Docker", "Containerization"],
    testing: ["Testing", "Unit tests"],
    deployment: ["Deployment", "CI/CD"],
  };

  // Check title for keywords
  Object.entries(skillKeywords).forEach(([keyword, relatedSkills]) => {
    if (lowerTitle.includes(keyword)) {
      skills.push(...relatedSkills);
    }
  });

  // Add roadmap-specific skills
  if (roadmapPath === "frontend") {
    skills.push("JavaScript", "HTML", "CSS");
  } else if (roadmapPath === "backend") {
    skills.push("Node.js", "Express", "Database design");
  } else if (roadmapPath === "devops") {
    skills.push("Linux", "Automation", "Infrastructure");
  }

  return [...new Set(skills)]; // Remove duplicates
}
