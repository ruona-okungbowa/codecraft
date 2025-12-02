import type { ProjectTemplate } from "@/types/recommendations";

/**
 * Intermediate format for raw template data before parsing
 */
export interface RawTemplate {
  title?: string;
  name?: string;
  description?: string;
  content?: string;
  tags?: string[];
  language?: string;
  languages?: string[];
  difficulty?: string;
  level?: string;
  url?: string;
  stars?: number;
  [key: string]: any; // Allow additional fields from various sources
}

/**
 * Result of a fetch operation from a source
 */
export interface FetchResult {
  templates: ProjectTemplate[];
  source: string;
  fetchedAt: Date;
  error?: string;
}

/**
 * Base interface for all source fetchers
 */
export interface SourceFetcher {
  name: string;
  url: string;
  fetch(): Promise<RawTemplate[]>;
  parse(raw: RawTemplate): ProjectTemplate | null;
}
