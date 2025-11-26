import { ReadmeResearch } from "./types";
import {
  getProjectFallbackTemplate,
  getProfileFallbackTemplate,
} from "./templates";

const MCP_TIMEOUT = 5000;

export async function researchProjectReadmeBestPractices(
  projectType: string = "general"
): Promise<ReadmeResearch> {
  try {
    const research = await Promise.race([
      fetchProjectBestPractices(projectType),
      createTimeout(MCP_TIMEOUT),
    ]);

    return research;
  } catch (error) {
    console.error("MCP research failed, using fallback template:", error);
    return getProjectFallbackTemplate(projectType);
  }
}

export async function researchProfileReadmeBestPractices(): Promise<ReadmeResearch> {
  try {
    const research = await Promise.race([
      fetchProfileBestPractices(),
      createTimeout(MCP_TIMEOUT),
    ]);

    return research;
  } catch (error) {
    console.error("MCP research failed, using fallback template:", error);
    return getProfileFallbackTemplate();
  }
}

async function fetchProjectBestPractices(
  projectType: string
): Promise<ReadmeResearch> {
  const currentYear = new Date().getFullYear();
  const searchQuery = `best README practices ${currentYear} ${projectType} project`;

  try {
    // Simulate MCP fetch call
    // In production, this would be: await mcpClient.fetch({ url: searchUrl })
    const mockMcpResponse = await simulateMcpFetch(searchQuery);

    return parseMcpResponse(mockMcpResponse, "project");
  } catch (error) {
    throw new Error(`MCP fetch failed: ${error}`);
  }
}

async function fetchProfileBestPractices(): Promise<ReadmeResearch> {
  const currentYear = new Date().getFullYear();
  const searchQuery = `best GitHub profile README ${currentYear}`;

  try {
    // Simulate MCP fetch call
    const mockMcpResponse = await simulateMcpFetch(searchQuery);

    return parseMcpResponse(mockMcpResponse, "profile");
  } catch (error) {
    throw new Error(`MCP fetch failed: ${error}`);
  }
}

async function simulateMcpFetch(_query: string): Promise<string> {
  // This is a placeholder that simulates MCP being unavailable
  // In production, replace this with actual MCP fetch tool call:
  // const response = await fetch(`https://search-api.com?q=${encodeURIComponent(query)}`);
  // return await response.text();

  throw new Error("MCP not configured - using fallback templates");
}

/**
 * Parses MCP response to extract README best practices
 * @param htmlContent - HTML content from MCP fetch
 * @param type - Type of README (project or profile)
 * @returns Structured research data
 */
function parseMcpResponse(
  htmlContent: string,
  type: "project" | "profile"
): ReadmeResearch {
  const sections: string[] = [];
  const badgeStyles: string[] = [];
  const visualElements: string[] = [];
  const trendingFeatures: string[] = [];
  const exampleStructures: string[] = [];

  const sectionMatches = htmlContent.match(
    /(?:sections?|include|should have):\s*([^\n]+)/gi
  );
  if (sectionMatches) {
    sectionMatches.forEach((match) => {
      const extracted = match
        .replace(/(?:sections?|include|should have):\s*/i, "")
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      sections.push(...extracted);
    });
  }

  // Extract badge information
  const badgeMatches = htmlContent.match(/shields\.io|badge|img\.shields/gi);
  if (badgeMatches) {
    badgeStyles.push("https://img.shields.io/badge/style-flat-square");
    badgeStyles.push("https://img.shields.io/badge/style-for-the-badge");
  }

  // Extract visual elements
  const visualMatches = htmlContent.match(
    /screenshot|demo|gif|diagram|image|visual/gi
  );
  if (visualMatches) {
    visualElements.push("Screenshots", "Demo GIF", "Architecture diagram");
  }

  // Extract trending features
  const trendingMatches = htmlContent.match(
    /github actions|ci\/cd|coverage|stats|analytics/gi
  );
  if (trendingMatches) {
    trendingFeatures.push(
      "GitHub Actions badges",
      "Code coverage",
      "Version badges"
    );
  }

  return {
    sections: sections.length > 0 ? sections : getDefaultSections(type),
    badgeStyles: badgeStyles.length > 0 ? badgeStyles : getDefaultBadgeStyles(),
    visualElements:
      visualElements.length > 0 ? visualElements : getDefaultVisualElements(),
    trendingFeatures:
      trendingFeatures.length > 0
        ? trendingFeatures
        : getDefaultTrendingFeatures(),
    exampleStructures: exampleStructures,
    source: "mcp",
  };
}

function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("MCP request timed out")), ms);
  });
}

function getDefaultSections(type: "project" | "profile"): string[] {
  if (type === "profile") {
    return ["About Me", "Projects", "Skills", "Contact"];
  }
  return ["Overview", "Features", "Installation", "Usage"];
}

function getDefaultBadgeStyles(): string[] {
  return [
    "https://img.shields.io/badge/style-flat-square",
    "https://img.shields.io/badge/style-for-the-badge",
  ];
}

function getDefaultVisualElements(): string[] {
  return ["Screenshots", "Demo", "Diagrams"];
}

function getDefaultTrendingFeatures(): string[] {
  return ["GitHub Actions", "Badges", "Stats"];
}

interface CacheEntry {
  data: ReadmeResearch;
  expiresAt: number;
}

const researchCache = new Map<string, CacheEntry>();

const CACHE_DURATION = 24 * 60 * 60 * 1000;

export function generateCacheKey(
  type: "project" | "profile",
  projectType?: string
): string {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  if (type === "project" && projectType) {
    return `readme-research-project-${projectType}-${today}`;
  }
  return `readme-research-profile-${today}`;
}

export function getCachedResearch(cacheKey: string): ReadmeResearch | null {
  const entry = researchCache.get(cacheKey);

  if (!entry) {
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    researchCache.delete(cacheKey);
    return null;
  }
  return {
    ...entry.data,
    source: "cache",
  };
}

export function cacheResearch(
  cacheKey: string,
  research: ReadmeResearch
): void {
  const expiresAt = Date.now() + CACHE_DURATION;

  researchCache.set(cacheKey, {
    data: research,
    expiresAt,
  });

  console.log(
    `Cached research with key: ${cacheKey}, expires at: ${new Date(expiresAt).toISOString()}`
  );
}

export function cleanupExpiredCache(): void {
  const now = Date.now();
  let removedCount = 0;

  for (const [key, entry] of researchCache.entries()) {
    if (now > entry.expiresAt) {
      researchCache.delete(key);
      removedCount++;
    }
  }

  if (removedCount > 0) {
    console.log(`Cleaned up ${removedCount} expired cache entries`);
  }
}

export function clearAllCache(): void {
  researchCache.clear();
  console.log("Cleared all cache entries");
}

export async function researchProjectReadmeBestPracticesWithCache(
  projectType: string = "general"
): Promise<ReadmeResearch> {
  const cacheKey = generateCacheKey("project", projectType);

  const cached = getCachedResearch(cacheKey);
  if (cached) {
    console.log("Using cached research for project:", projectType);
    return cached;
  }

  console.log("Cache miss - fetching fresh research for project:", projectType);
  const research = await researchProjectReadmeBestPractices(projectType);

  cacheResearch(cacheKey, research);

  return research;
}

export async function researchProfileReadmeBestPracticesWithCache(): Promise<ReadmeResearch> {
  const cacheKey = generateCacheKey("profile");

  const cached = getCachedResearch(cacheKey);
  if (cached) {
    console.log("Using cached research for profile README");
    return cached;
  }
  console.log("Cache miss - fetching fresh research for profile README");
  const research = await researchProfileReadmeBestPractices();

  cacheResearch(cacheKey, research);

  return research;
}
