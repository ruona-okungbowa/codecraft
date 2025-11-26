// lib/readme/analysis.ts

import { Octokit } from "octokit";
import { Project } from "@/types";
import { ProjectAnalysis } from "./types";

/**
 * Analyzes a GitHub project to extract technologies and metadata
 * @param project - The project to analyze
 * @param githubToken - GitHub access token
 * @returns ProjectAnalysis with extracted data
 */
export async function analyzeProject(
  project: Project,
  githubToken: string
): Promise<ProjectAnalysis> {
  const octokit = new Octokit({ auth: githubToken });

  // Extract owner and repo name from URL
  const { owner, repo } = parseGitHubUrl(project.url);

  // Check for existing README
  const { hasReadme, filename } = await detectExistingReadme(
    octokit,
    owner,
    repo
  );

  // Extract technologies from various sources
  const technologies = await extractTechnologies(octokit, owner, repo, project);

  // Get project metadata
  const metadata = await extractProjectMetadata(octokit, owner, repo, project);

  // Separate technologies into languages and frameworks
  const languages = extractLanguages(project, technologies);
  const frameworks = extractFrameworks(technologies);

  return {
    technologies,
    languages,
    frameworks,
    hasExistingReadme: hasReadme,
    existingReadmeFilename: filename,
    metadata,
  };
}

/**
 * Parses GitHub URL to extract owner and repo name
 * @param url - GitHub repository URL
 * @returns Object with owner and repo
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } {
  // Handle various GitHub URL formats
  // https://github.com/owner/repo
  // https://github.com/owner/repo.git
  // git@github.com:owner/repo.git

  const match = url.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
  if (!match) {
    throw new Error(`Invalid GitHub URL: ${url}`);
  }

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""),
  };
}

/**
 * Detects if a README file exists in the repository
 * @param octokit - Octokit client
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Object with hasReadme boolean and filename if found
 */
export async function detectExistingReadme(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<{ hasReadme: boolean; filename?: string }> {
  const possibleNames = [
    "README.md",
    "readme.md",
    "Readme.md",
    "README.MD",
    "README",
  ];

  for (const filename of possibleNames) {
    try {
      await octokit.rest.repos.getContent({
        owner,
        repo,
        path: filename,
      });

      // If we get here, the file exists
      return { hasReadme: true, filename };
    } catch (error) {
      // File doesn't exist, try next one
      continue;
    }
  }

  return { hasReadme: false };
}

/**
 * Extracts technologies from package.json, dependencies, and file structure
 * @param octokit - Octokit client
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param project - Project object with languages data
 * @returns Array of technology names
 */
async function extractTechnologies(
  octokit: Octokit,
  owner: string,
  repo: string,
  project: Project
): Promise<string[]> {
  const technologies = new Set<string>();

  // Add languages from project data
  if (project.languages) {
    Object.keys(project.languages).forEach((lang) => technologies.add(lang));
  }

  // Try to fetch and parse package.json
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: "package.json",
    });

    if ("content" in data) {
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      const packageJson = JSON.parse(content);

      // Extract dependencies
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Add major frameworks and libraries
      Object.keys(deps).forEach((dep) => {
        const normalized = normalizeDependencyName(dep);
        if (normalized) {
          technologies.add(normalized);
        }
      });
    }
  } catch (error) {
    // package.json doesn't exist or couldn't be parsed
    console.log("No package.json found or error parsing it");
  }

  // Try to detect other config files
  const configFiles = [
    { file: "tsconfig.json", tech: "TypeScript" },
    { file: "Dockerfile", tech: "Docker" },
    { file: "docker-compose.yml", tech: "Docker" },
    { file: ".eslintrc", tech: "ESLint" },
    { file: "jest.config.js", tech: "Jest" },
    { file: "vitest.config.ts", tech: "Vitest" },
    { file: "tailwind.config.js", tech: "Tailwind CSS" },
    { file: "next.config.js", tech: "Next.js" },
    { file: "vite.config.ts", tech: "Vite" },
    { file: "app.json", tech: "React Native" }, // React Native/Expo
    { file: "metro.config.js", tech: "React Native" },
    { file: "pubspec.yaml", tech: "Flutter" }, // Flutter
    { file: "angular.json", tech: "Angular" },
    { file: "nuxt.config.js", tech: "Nuxt.js" },
    { file: "svelte.config.js", tech: "Svelte" },
    { file: "astro.config.mjs", tech: "Astro" },
    { file: "remix.config.js", tech: "Remix" },
  ];

  for (const { file, tech } of configFiles) {
    try {
      await octokit.rest.repos.getContent({
        owner,
        repo,
        path: file,
      });
      technologies.add(tech);
    } catch (error) {
      // File doesn't exist
      continue;
    }
  }

  return Array.from(technologies);
}

/**
 * Normalizes dependency names to common technology names
 * @param dep - Dependency name from package.json
 * @returns Normalized technology name or null if not a major tech
 */
function normalizeDependencyName(dep: string): string | null {
  const mapping: Record<string, string> = {
    // Frontend Frameworks
    react: "React",
    "react-dom": "React",
    "react-native": "React Native",
    vue: "Vue.js",
    angular: "Angular",
    "@angular/core": "Angular",
    svelte: "Svelte",
    solid: "Solid.js",
    "solid-js": "Solid.js",

    // Meta Frameworks
    next: "Next.js",
    nuxt: "Nuxt.js",
    gatsby: "Gatsby",
    remix: "Remix",
    "@remix-run/react": "Remix",
    astro: "Astro",

    // Mobile
    expo: "Expo",
    "expo-cli": "Expo",
    flutter: "Flutter",

    // Backend Frameworks
    express: "Express",
    fastify: "Fastify",
    koa: "Koa",
    nestjs: "NestJS",
    "@nestjs/core": "NestJS",
    hono: "Hono",

    // Languages & Tools
    typescript: "TypeScript",

    // Styling
    tailwindcss: "Tailwind CSS",
    "styled-components": "Styled Components",
    "@emotion/react": "Emotion",
    sass: "Sass",

    // Databases & ORMs
    "@supabase/supabase-js": "Supabase",
    prisma: "Prisma",
    "@prisma/client": "Prisma",
    mongoose: "Mongoose",
    sequelize: "Sequelize",
    drizzle: "Drizzle ORM",
    "drizzle-orm": "Drizzle ORM",

    // HTTP Clients
    axios: "Axios",
    "node-fetch": "Fetch API",

    // GraphQL
    graphql: "GraphQL",
    "@apollo/client": "Apollo GraphQL",
    "apollo-server": "Apollo Server",

    // State Management
    redux: "Redux",
    "@reduxjs/toolkit": "Redux Toolkit",
    zustand: "Zustand",
    jotai: "Jotai",
    recoil: "Recoil",

    // Testing
    vitest: "Vitest",
    jest: "Jest",
    playwright: "Playwright",
    cypress: "Cypress",
    "@testing-library/react": "React Testing Library",

    // Build Tools
    vite: "Vite",
    webpack: "Webpack",
    turbopack: "Turbopack",
    esbuild: "esbuild",
  };

  return mapping[dep] || null;
}

/**
 * Extracts project metadata
 * @param octokit - Octokit client
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param project - Project object
 * @returns Metadata object
 */
async function extractProjectMetadata(
  octokit: Octokit,
  owner: string,
  repo: string,
  project: Project
): Promise<ProjectAnalysis["metadata"]> {
  try {
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    // Try to get commit count (approximate)
    let commitCount: number | undefined;
    try {
      const { data: commits } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: 1,
      });

      // GitHub provides commit count in the Link header, but we'll use a simple approach
      commitCount = repoData.size; // Rough approximation
    } catch (error) {
      commitCount = undefined;
    }

    return {
      name: project.name,
      description: project.description || repoData.description || "",
      version: undefined, // Would need to parse package.json for this
      fileCount: undefined, // Would need to traverse tree
      commitCount,
    };
  } catch (error) {
    return {
      name: project.name,
      description: project.description || "",
    };
  }
}

/**
 * Extracts language names from project
 * @param project - Project object
 * @param technologies - All extracted technologies
 * @returns Array of language names
 */
function extractLanguages(project: Project, technologies: string[]): string[] {
  const languages = new Set<string>();

  // Add from project.languages
  if (project.languages) {
    Object.keys(project.languages).forEach((lang) => languages.add(lang));
  }

  // Add known languages from technologies
  const knownLanguages = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "Go",
    "Rust",
    "C++",
    "C#",
    "Ruby",
    "PHP",
    "Swift",
    "Kotlin",
  ];

  technologies.forEach((tech) => {
    if (knownLanguages.includes(tech)) {
      languages.add(tech);
    }
  });

  return Array.from(languages);
}

/**
 * Extracts framework names from technologies
 * @param technologies - All extracted technologies
 * @returns Array of framework names
 */
function extractFrameworks(technologies: string[]): string[] {
  const knownFrameworks = [
    "React",
    "Vue.js",
    "Angular",
    "Next.js",
    "Nuxt.js",
    "Express",
    "Fastify",
    "NestJS",
    "Django",
    "Flask",
    "Spring Boot",
    "Laravel",
  ];

  return technologies.filter((tech) => knownFrameworks.includes(tech));
}
