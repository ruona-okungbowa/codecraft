/**
 * Type definitions for the project_templates_cache table
 */

import { ProjectTemplate } from "./recommendations";

/**
 * Database row type for project_templates_cache table
 */
export interface ProjectTemplateCacheRow {
  id: string;
  template_id: string;
  template_data: ProjectTemplate;
  source: string;
  source_url: string | null;
  fetched_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Insert type for project_templates_cache table
 */
export interface ProjectTemplateCacheInsert {
  template_id: string;
  template_data: ProjectTemplate;
  source: string;
  source_url?: string | null;
  fetched_at?: string;
  expires_at: string;
}

/**
 * Update type for project_templates_cache table
 */
export interface ProjectTemplateCacheUpdate {
  template_id?: string;
  template_data?: ProjectTemplate;
  source?: string;
  source_url?: string | null;
  fetched_at?: string;
  expires_at?: string;
}

/**
 * Extended ProjectTemplate with metadata for tracking source
 */
export interface ProjectTemplateWithMeta extends ProjectTemplate {
  _meta?: {
    source: string;
    sourceUrl?: string;
    fetchedAt: Date;
    isFallback: boolean;
  };
}

/**
 * Source types for template fetching
 */
export type TemplateSource =
  | "github-trending"
  | "devto"
  | "freecodecamp"
  | "roadmap"
  | "fallback";
