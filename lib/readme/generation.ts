import { Project, User } from "@/types";
import {
  GeneratedReadme,
  ReadmeTemplate,
  ReadmeResearch,
  ProfileReadmeData,
} from "@/types/readme";
import { validateMarkdown } from "./validation";
import { openai } from "@/lib/openai/client";
import { selectTopProjects } from "./ranking";

export async function generateProjectReadme(
  project: Project,
  template: ReadmeTemplate,
  research: ReadmeResearch,
  githubToken?: string
): Promise<GeneratedReadme> {
  // Build the prompt with research context
  const prompt = buildProjectReadmePrompt(project, template, research);

  // Call OpenAI
  const content = await callOpenAI(prompt, "project");

  // Count words
  const wordCount = content.split(/\s+/).length;

  // Extract sections that were included
  const sectionsIncluded = extractSections(content);

  // Validate the generated README
  const validation = validateMarkdown(content, "project");

  return {
    content,
    metadata: {
      template,
      sectionsIncluded,
      wordCount,
      generatedAt: new Date().toISOString(),
    },
    validation,
  };
}

/**
 * Generates a profile README using OpenAI with researched context
 * @param user - The user data
 * @param projects - User's projects
 * @param template - Template style to use
 * @param research - Research data from MCP or fallback
 * @returns Generated README with metadata and validation
 */
export async function generateProfileReadme(
  user: User,
  projects: Project[],
  template: ReadmeTemplate,
  research: ReadmeResearch
): Promise<GeneratedReadme> {
  // Select top projects
  const topProjects = selectTopProjects(projects, 6);

  // Build profile data
  const profileData: ProfileReadmeData = {
    username: user.githubUsername,
    bio: "", // Could be fetched from GitHub API
    topProjects,
    techStack: extractUniqueTechnologies(topProjects),
    stats: calculateStats(projects),
    socialLinks: {
      // These would come from user profile or GitHub API
    },
  };

  // Build the prompt with research context
  const prompt = buildProfileReadmePrompt(profileData, template, research);

  // Call OpenAI
  const content = await callOpenAI(prompt, "profile");

  // Count words
  const wordCount = content.split(/\s+/).length;

  // Extract sections that were included
  const sectionsIncluded = extractSections(content);

  // Validate the generated README
  const validation = validateMarkdown(content, "profile");

  return {
    content,
    metadata: {
      template,
      sectionsIncluded,
      wordCount,
      generatedAt: new Date().toISOString(),
    },
    validation,
  };
}

/**
 * Builds the OpenAI prompt for project README generation
 */
function buildProjectReadmePrompt(
  project: Project,
  template: ReadmeTemplate,
  research: ReadmeResearch
): string {
  const languages = Object.keys(project.languages || {}).join(", ");
  const badges = generateBadges(Object.keys(project.languages || {}));

  const templateInstructions = getTemplateInstructions(template);

  return `Generate a professional README.md for this GitHub project:

**Project Information:**
- Name: ${project.name}
- Description: ${project.description || "No description provided"}
- Technologies: ${languages}
- Stars: ${project.stars}
- Forks: ${project.forks}
- URL: ${project.url}

**Template Style:** ${template}
${templateInstructions}

**Research Insights:**
Based on current best practices, include these sections:
${research.sections.map((s) => `- ${s}`).join("\n")}

**Visual Elements to Consider:**
${research.visualElements.map((v) => `- ${v}`).join("\n")}

**Trending Features:**
${research.trendingFeatures.map((f) => `- ${f}`).join("\n")}

**Badges to Include:**
${badges}

**Instructions:**
1. Create a complete, professional README.md
2. Use proper Markdown formatting
3. Include code blocks with language tags
4. Add appropriate badges at the top
5. Make it engaging and easy to understand
6. Include installation and usage instructions
7. Add a features section highlighting key capabilities
8. Return ONLY the Markdown content, no wrapper code blocks

Generate the README now:`;
}

/**
 * Builds the OpenAI prompt for profile README generation
 */
function buildProfileReadmePrompt(
  profileData: ProfileReadmeData,
  template: ReadmeTemplate,
  research: ReadmeResearch
): string {
  const templateInstructions = getTemplateInstructions(template);

  const projectsList = profileData.topProjects
    .map(
      (p) =>
        `- **${p.name}**: ${p.description || "No description"} (⭐ ${p.stars})`
    )
    .join("\n");

  return `Generate a professional GitHub profile README for this developer:

**Profile Information:**
- Username: ${profileData.username}
- Tech Stack: ${profileData.techStack.join(", ")}
- Total Repositories: ${profileData.stats.totalRepos}
- Total Stars: ${profileData.stats.totalStars}

**Top Projects:**
${projectsList}

**Template Style:** ${template}
${templateInstructions}

**Research Insights:**
Based on current best practices for profile READMEs, include:
${research.sections.map((s) => `- ${s}`).join("\n")}

**Visual Elements to Consider:**
${research.visualElements.map((v) => `- ${v}`).join("\n")}

**Trending Features:**
${research.trendingFeatures.map((f) => `- ${f}`).join("\n")}

**Instructions:**
1. Create an engaging profile README that showcases the developer
2. Include GitHub stats widgets using:
   - \`![GitHub Stats](https://github-readme-stats.vercel.app/api?username=${profileData.username}&show_icons=true&theme=radical)\`
   - \`![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=${profileData.username}&layout=compact&theme=radical)\`
3. Add skill badges for technologies
4. Highlight top projects with links
5. Make it personal and engaging
6. Use emojis appropriately
7. Return ONLY the Markdown content, no wrapper code blocks

Generate the profile README now:`;
}

/**
 * Gets template-specific instructions
 */
function getTemplateInstructions(template: ReadmeTemplate): string {
  switch (template) {
    case "minimal":
      return "Keep it concise and focused. Include only essential sections: About, Installation, Usage.";
    case "detailed":
      return "Be comprehensive. Include all sections with detailed explanations, examples, and documentation.";
    case "visual":
      return "Emphasize visual elements. Include screenshots, GIFs, diagrams, and make it visually appealing.";
    case "professional":
      return "Use a professional tone. Include badges, proper structure, contributing guidelines, and license information.";
    default:
      return "";
  }
}

/**
 * Calls OpenAI API to generate README content
 */
async function callOpenAI(
  prompt: string,
  type: "project" | "profile"
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert technical writer who creates professional ${type === "project" ? "project" : "GitHub profile"} README files. Generate clear, well-structured Markdown documentation that follows current best practices.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    return responseText.trim();
  } catch (error) {
    console.error("Error generating README:", error);
    throw new Error(`Failed to generate README: ${error}`);
  }
}

/**
 * Generates badge markdown for technologies
 */
export function generateBadges(technologies: string[]): string {
  const badgeMap: Record<string, string> = {
    TypeScript:
      "![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)",
    JavaScript:
      "![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)",
    React:
      "![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)",
    "Next.js":
      "![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)",
    "Node.js":
      "![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)",
    Python:
      "![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)",
    "Tailwind CSS":
      "![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)",
    Docker:
      "![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)",
  };

  return technologies
    .map(
      (tech) =>
        badgeMap[tech] ||
        `![${tech}](https://img.shields.io/badge/${tech}-blue?style=for-the-badge)`
    )
    .join(" ");
}

/**
 * Extracts section headings from markdown content
 */
function extractSections(content: string): string[] {
  const sections: string[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^#{1,3}\s+(.+)/);
    if (match) {
      sections.push(match[1].trim());
    }
  }

  return sections;
}

/**
 * Extracts unique technologies from projects
 */
function extractUniqueTechnologies(projects: Project[]): string[] {
  const techSet = new Set<string>();

  projects.forEach((project) => {
    if (project.languages) {
      Object.keys(project.languages).forEach((lang) => techSet.add(lang));
    }
  });

  return Array.from(techSet).slice(0, 12); // Limit to 12 technologies
}

/**
 * Calculates stats from projects
 */
function calculateStats(projects: Project[]): ProfileReadmeData["stats"] {
  const totalStars = projects.reduce((sum, p) => sum + (p.stars || 0), 0);
  const totalRepos = projects.length;

  const languages: Record<string, number> = {};
  projects.forEach((project) => {
    if (project.languages) {
      Object.entries(project.languages).forEach(([lang, percentage]) => {
        languages[lang] = (languages[lang] || 0) + percentage;
      });
    }
  });

  return {
    totalStars,
    totalRepos,
    languages,
  };
}
