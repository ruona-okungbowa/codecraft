import { SupabaseClient } from "@supabase/supabase-js";
import {
  ProjectTemplateCacheRow,
  ProjectTemplateCacheInsert,
} from "@/types/template-cache";
import { ProjectTemplate } from "@/types/recommendations";

/**
 * Default cache TTL: 24 hours in milliseconds
 */
const DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000;

/**
 * Manages caching of project templates in Supabase
 * Handles retrieval, storage, invalidation, and cleanup of cached templates
 */
export class TemplateCacheManager {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Retrieve cached templates that haven't expired
   * @param maxAge Maximum age in milliseconds (default: 24 hours)
   * @returns Array of cached ProjectTemplate objects
   */
  async get(maxAge: number = DEFAULT_MAX_AGE): Promise<ProjectTemplate[]> {
    try {
      const now = new Date();
      const minFetchedAt = new Date(now.getTime() - maxAge);

      const { data, error } = await this.supabase
        .from("project_templates_cache")
        .select("*")
        .gte("expires_at", now.toISOString())
        .gte("fetched_at", minFetchedAt.toISOString())
        .order("fetched_at", { ascending: false });

      if (error) {
        console.error("Error fetching cached templates:", error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Extract template_data from each row
      return data.map((row: ProjectTemplateCacheRow) => row.template_data);
    } catch (error) {
      console.error("Unexpected error in TemplateCacheManager.get:", error);
      return [];
    }
  }

  /**
   * Store templates in cache with metadata
   * Updates existing templates if they already exist (based on template_id + source)
   * @param templates Array of ProjectTemplate objects to cache
   * @param source Source name (e.g., "github-trending", "devto")
   * @param sourceUrl Optional URL where templates were fetched from
   */
  async set(
    templates: ProjectTemplate[],
    source: string,
    sourceUrl?: string
  ): Promise<void> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + DEFAULT_MAX_AGE);

      const cacheEntries: ProjectTemplateCacheInsert[] = templates.map(
        (template) => ({
          template_id: template.id,
          template_data: template,
          source,
          source_url: sourceUrl || null,
          fetched_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
      );

      // Use upsert to handle duplicates (update if exists, insert if not)
      const { error } = await this.supabase
        .from("project_templates_cache")
        .upsert(cacheEntries, {
          onConflict: "template_id,source",
          ignoreDuplicates: false,
        });

      if (error) {
        console.error("Error storing templates in cache:", error);
        throw error;
      }
    } catch (error) {
      console.error("Unexpected error in TemplateCacheManager.set:", error);
      throw error;
    }
  }

  /**
   * Invalidate (delete) cached templates by source
   * If no source is provided, clears all cached templates
   * @param source Optional source name to filter deletion
   */
  async invalidate(source?: string): Promise<void> {
    try {
      let query = this.supabase.from("project_templates_cache").delete();

      if (source) {
        query = query.eq("source", source);
      } else {
        // Delete all - use a condition that's always true
        query = query.neq("id", "00000000-0000-0000-0000-000000000000");
      }

      const { error } = await query;

      if (error) {
        console.error("Error invalidating cache:", error);
        throw error;
      }
    } catch (error) {
      console.error(
        "Unexpected error in TemplateCacheManager.invalidate:",
        error
      );
      throw error;
    }
  }

  /**
   * Remove expired cache entries
   * Should be run periodically to clean up old data
   */
  async cleanup(): Promise<void> {
    try {
      const now = new Date();

      const { error } = await this.supabase
        .from("project_templates_cache")
        .delete()
        .lt("expires_at", now.toISOString());

      if (error) {
        console.error("Error cleaning up expired cache:", error);
        throw error;
      }
    } catch (error) {
      console.error("Unexpected error in TemplateCacheManager.cleanup:", error);
      throw error;
    }
  }

  /**
   * Check if a cached template has expired
   * @param template Cached template row from database
   * @returns true if expired, false otherwise
   */
  isExpired(template: ProjectTemplateCacheRow): boolean {
    const now = new Date();
    const expiresAt = new Date(template.expires_at);
    return expiresAt <= now;
  }
}
