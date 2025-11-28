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

interface RepoAnalysis {
  framework: string;
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
  features: string[];
  structure: string[];
}

export async function generateProjectReadme(
  project: Project,
  template: ReadmeTemplate,
  research: ReadmeResearch,
  githubToken?: string
): Promise<GeneratedReadme> {
  let repoAnalysis: RepoAnalysis | null = null;

  if (githubToken && project.url) {
    try {
      const urlParts = project.url.split("/");
      const owner = urlParts[urlParts.length - 2];
      const repo = urlParts[urlParts.length - 1];

      const { analyzeRepository } = await import("./analyze-repo");
      repoAnalysis = await analyzeRepository(owner, repo, githubToken);
    } catch (error) {
      console.error("Error analyzing repository:", error);
    }
  }

  const prompt = buildProjectReadmePrompt(
    project,
    template,
    research,
    repoAnalysis
  );
  const content = await callOpenAI(prompt, "project");

  const wordCount = content.split(/\s+/).length;
  const sectionsIncluded = extractSections(content);
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
  research: ReadmeResearch,
  repoAnalysis?: RepoAnalysis | null
): string {
  const languages = Object.keys(project.languages || {}).join(", ");
  const badges = generateBadges(Object.keys(project.languages || {}));

  const templateInstructions = getTemplateInstructions(template);

  let analysisSection = "";
  if (repoAnalysis) {
    analysisSection = `

**Detailed Repository Analysis:**
- Framework: ${repoAnalysis.framework}
- Key Dependencies: ${repoAnalysis.dependencies.slice(0, 10).join(", ")}
- Project Structure: ${repoAnalysis.structure.join(", ")}
- Detected Features: ${repoAnalysis.features.join(", ")}
- Available Scripts: ${Object.keys(repoAnalysis.scripts).join(", ")}

Use this analysis to provide ACCURATE and SPECIFIC information about the project.
Do NOT make generic assumptions - use the actual dependencies and structure detected.`;
  }

  return `Generate a professional README.md for this GitHub project:

**Project Information:**
- Name: ${project.name}
- Description: ${project.description || "No description provided"}
- Technologies: ${languages}
- Stars: ${project.stars}
- Forks: ${project.forks}
- URL: ${project.url}
${analysisSection}

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

**CRITICAL FORMATTING RULES - MUST FOLLOW:**
1. Start with # for main title
2. Add TWO blank lines after the title
3. Add TWO blank lines before each ## section header
4. Add ONE blank line after each ## section header
5. Put badges on a separate line with blank lines above and below
6. Add blank lines between all paragraphs
7. Add blank lines before and after lists
8. Add blank lines before and after code blocks
9. Use proper code block formatting with language tags
10. Each section must be clearly separated with proper whitespace

**CONTENT REQUIREMENTS:**
1. Write a compelling project overview based on ACTUAL analysis (not generic)
2. If it's a web app, describe what users can DO with it
3. For HTML/CSS/JS projects, analyze the actual functionality from files
4. For Python projects, describe the application purpose
5. Include SPECIFIC features found in the code, not generic assumptions
6. Installation steps must match the ACTUAL framework/language detected
7. Usage examples should be framework-specific
8. If no package.json exists, provide appropriate setup for the detected language
9. Remove placeholder text like "(Demo link will be added once available)"
10. Only include sections that are relevant to THIS specific project

**EXAMPLE STRUCTURE WITH PROPER SPACING:**

# Project Name


Brief engaging description of what this project does.


![Badge1](url) ![Badge2](url)


## Features


- Actual feature 1 from analysis
- Actual feature 2 from analysis


## Tech Stack


List of actual technologies used


## Installation


Framework-specific installation steps

\`\`\`
npm install
\`\`\`


## Usage


How to actually use this project


## Contributing


Standard contributing guidelines


## License


License information


IMPORTANT: Return ONLY the Markdown content with proper spacing. Do NOT wrap in code blocks:`;
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
          content: `You are an expert technical writer who creates professional ${type === "project" ? "project" : "GitHub profile"} README files. 

CRITICAL FORMATTING RULES:
1. Add TWO blank lines after the title
2. Add TWO blank lines before each ## heading
3. Add ONE blank line after each ## heading
4. Add ONE blank line between paragraphs
5. Add ONE blank line before and after code blocks
6. Add ONE blank line before and after lists
7. Put badges on their own line with blank lines above and below
8. Ensure proper spacing throughout

Generate clear, well-structured Markdown with proper line breaks.`,
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

    // Clean up the response and ensure proper spacing
    let cleaned = responseText.trim();

    // Remove markdown code block wrapper if present
    cleaned = cleaned.replace(/^```markdown\n?/i, "").replace(/\n?```$/i, "");

    // Ensure proper spacing after title
    cleaned = cleaned.replace(/^(#\s+.+)\n([^#\n])/m, "$1\n\n$2");

    // Ensure proper spacing before section headers
    cleaned = cleaned.replace(/([^\n])\n(##\s+)/g, "$1\n\n$2");

    // Ensure proper spacing after section headers
    cleaned = cleaned.replace(/(##\s+.+)\n([^#\n])/g, "$1\n\n$2");

    // Ensure badges have spacing
    cleaned = cleaned.replace(
      /(\]\(https:\/\/img\.shields\.io[^\)]+\))\s*(\]\()/g,
      "$1 $2"
    );
    cleaned = cleaned.replace(
      /(\]\(https:\/\/img\.shields\.io[^\)]+\))\n([^!\n])/g,
      "$1\n\n$2"
    );

    return cleaned.trim();
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
