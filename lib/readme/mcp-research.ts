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
    // Web research failed or timed out, using fallback template
    console.info(
      `Using fallback template for project type: ${projectType}`,
      error instanceof Error ? error.message : "Unknown error"
    );
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
    // Web research failed or timed out, using fallback template
    console.info(
      "Using fallback template for profile README",
      error instanceof Error ? error.message : "Unknown error"
    );
    return getProfileFallbackTemplate();
  }
}

async function fetchProjectBestPractices(
  projectType: string
): Promise<ReadmeResearch> {
  const currentYear = new Date().getFullYear();
  const searchQuery = `best README practices ${currentYear} ${projectType} project GitHub markdown`;

  try {
    // Use DuckDuckGo HTML search (no API key required, works in production)
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;

    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(MCP_TIMEOUT),
    });

    if (!response.ok) {
      console.warn(
        `DuckDuckGo search failed with status ${response.status}, using fallback`
      );
      throw new Error("Search failed");
    }

    const htmlContent = await response.text();
    const parsed = parseWebContent(htmlContent, "project");

    // If parsing yielded no useful data, use fallback
    if (parsed.sections.length === 0 && parsed.trendingFeatures.length === 0) {
      console.warn("Web parsing yielded no data, using fallback");
      throw new Error("No data extracted");
    }

    return parsed;
  } catch (error) {
    console.warn("Web research failed, using fallback template:", error);
    throw error;
  }
}

async function fetchProfileBestPractices(): Promise<ReadmeResearch> {
  const currentYear = new Date().getFullYear();
  const searchQuery = `best GitHub profile README ${currentYear} examples trending`;

  try {
    // Use DuckDuckGo HTML search (no API key required, works in production)
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;

    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(MCP_TIMEOUT),
    });

    if (!response.ok) {
      console.warn(
        `DuckDuckGo search failed with status ${response.status}, using fallback`
      );
      throw new Error("Search failed");
    }

    const htmlContent = await response.text();
    const parsed = parseWebContent(htmlContent, "profile");

    // If parsing yielded no useful data, use fallback
    if (parsed.sections.length === 0 && parsed.trendingFeatures.length === 0) {
      console.warn("Web parsing yielded no data, using fallback");
      throw new Error("No data extracted");
    }

    return parsed;
  } catch (error) {
    console.warn("Web research failed, using fallback template:", error);
    throw error;
  }
}

function parseWebContent(
  htmlContent: string,
  type: "project" | "profile"
): ReadmeResearch {
  const sections: string[] = [];
  const badgeStyles: string[] = [];
  const visualElements: string[] = [];
  const trendingFeatures: string[] = [];

  // Convert to lowercase for case-insensitive matching
  const lowerContent = htmlContent.toLowerCase();

  // Extract sections from content - look for common README section keywords
  const sectionKeywords =
    type === "project"
      ? [
          "installation",
          "usage",
          "features",
          "documentation",
          "contributing",
          "license",
          "getting started",
          "prerequisites",
          "deployment",
          "testing",
          "api reference",
        ]
      : [
          "about me",
          "skills",
          "projects",
          "experience",
          "contact",
          "stats",
          "technologies",
          "portfolio",
        ];

  sectionKeywords.forEach((keyword) => {
    if (lowerContent.includes(keyword)) {
      sections.push(
        keyword
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      );
    }
  });

  // Extract badge information
  if (lowerContent.match(/shields\.io|badge|img\.shields|status badge/gi)) {
    badgeStyles.push("flat-square", "for-the-badge", "plastic");
  }

  // Extract visual elements
  if (
    lowerContent.match(
      /screenshot|demo|gif|diagram|image|visual|preview|example/gi
    )
  ) {
    visualElements.push("Screenshots", "Demo GIF", "Architecture diagram");
  }

  // Extract trending features
  if (
    lowerContent.match(
      /github actions|ci\/cd|coverage|stats|analytics|workflow|automation/gi
    )
  ) {
    trendingFeatures.push(
      "GitHub Actions badges",
      "Code coverage",
      "Version badges"
    );
  }

  // Deduplicate arrays
  const uniqueSections = [...new Set(sections)];
  const uniqueBadgeStyles = [...new Set(badgeStyles)];
  const uniqueVisualElements = [...new Set(visualElements)];
  const uniqueTrendingFeatures = [...new Set(trendingFeatures)];

  return {
    sections:
      uniqueSections.length > 0 ? uniqueSections : getDefaultSections(type),
    badgeStyles:
      uniqueBadgeStyles.length > 0
        ? uniqueBadgeStyles
        : getDefaultBadgeStyles(),
    visualElements:
      uniqueVisualElements.length > 0
        ? uniqueVisualElements
        : getDefaultVisualElements(),
    trendingFeatures:
      uniqueTrendingFeatures.length > 0
        ? uniqueTrendingFeatures
        : getDefaultTrendingFeatures(),
    exampleStructures: [],
    source: "web" as const,
  };
}

function getDefaultSections(type: "project" | "profile"): string[] {
  if (type === "profile") {
    return [
      "About Me",
      "Tech Stack",
      "Featured Projects",
      "GitHub Stats",
      "Contact",
    ];
  }
  return [
    "Overview",
    "Features",
    "Installation",
    "Usage",
    "Contributing",
    "License",
  ];
}

function getDefaultBadgeStyles(): string[] {
  return ["flat-square", "for-the-badge", "plastic"];
}

function getDefaultVisualElements(): string[] {
  return ["Screenshots", "Demo GIF", "Architecture Diagram"];
}

function getDefaultTrendingFeatures(): string[] {
  return [
    "GitHub Actions CI/CD",
    "Code Coverage Badges",
    "Version Badges",
    "Social Badges",
  ];
}

function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Research request timed out")), ms);
  });
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
