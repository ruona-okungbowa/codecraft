import { Project } from "@/types";

// Template types for README styles
export type ReadmeTemplate = "minimal" | "detailed" | "visual" | "professional";

// Research data from MCP, web scraping, cache, or fallback templates
export interface ReadmeResearch {
  sections: string[];
  badgeStyles: string[];
  visualElements: string[];
  trendingFeatures: string[];
  exampleStructures: string[];
  source: "mcp" | "web" | "cache" | "fallback";
}

// Validation error types
export interface ValidationError {
  type: "missing_section" | "invalid_markdown" | "broken_link";
  message: string;
  line?: number;
}

// Validation warning (less severe than error)
export interface ValidationWarning {
  type: string;
  message: string;
  line?: number;
}

// Result of README validation
export interface ValidationResult {
  valid: boolean;
  score: number; // 0-100
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

// Generated README with metadata
export interface GeneratedReadme {
  content: string;
  metadata: {
    template: ReadmeTemplate;
    sectionsIncluded: string[];
    wordCount: number;
    generatedAt: string;
  };
  validation: ValidationResult;
}

// GitHub deployment result
export interface DeploymentResult {
  success: boolean;
  url?: string;
  error?: string;
  commitSha?: string;
}

// Request format for README generation API
export interface ReadmeGenerationRequest {
  type: "project" | "profile";
  projectId?: string; // Required for project type
  template: ReadmeTemplate;
  customSections?: string[];
}

// Response format from README generation API
export interface ReadmeGenerationResponse {
  content: string;
  validation: ValidationResult;
  research: ReadmeResearch;
  cached: boolean;
  generatedAt: string;
}

// Profile README specific data
export interface ProfileReadmeData {
  username: string;
  bio: string;
  topProjects: Project[];
  techStack: string[];
  stats: {
    totalStars: number;
    totalRepos: number;
    languages: Record<string, number>;
  };
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    email?: string;
  };
}

// Project analysis result
export interface ProjectAnalysis {
  technologies: string[];
  languages: string[];
  frameworks: string[];
  hasExistingReadme: boolean;
  existingReadmeFilename?: string;
  metadata: {
    name: string;
    description: string;
    version?: string;
    fileCount?: number;
    commitCount?: number;
  };
}

// Cache entry for research data
export interface ResearchCacheEntry {
  id: string;
  cache_key: string;
  research_data: ReadmeResearch;
  created_at: string;
  expires_at: string;
}
