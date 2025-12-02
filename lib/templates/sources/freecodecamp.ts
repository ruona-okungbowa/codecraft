import type { SourceFetcher, RawTemplate } from "./types";
import type { ProjectTemplate } from "@/types/recommendations";
import { TemplateParser } from "../parser";

/**
 * Fetches project tutorial articles from FreeCodeCamp
 */
export class FreeCodeCampFetcher implements SourceFetcher {
  name = "freecodecamp";
  url = "https://www.freecodecamp.org/news/tag/projects/";
  private parser = new TemplateParser();
  private timeout = 10000; // 10 seconds

  /**
   * Fetch project tutorial articles from FreeCodeCamp
   */
  async fetch(): Promise<RawTemplate[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "CodeCraft-Template-Fetcher/1.0",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      return this.parseHTML(html);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(`FreeCodeCamp fetch timeout after ${this.timeout}ms`);
        }
        throw new Error(`FreeCodeCamp fetch failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Parse HTML to extract article information
   */
  private parseHTML(html: string): RawTemplate[] {
    const templates: RawTemplate[] = [];

    try {
      // Match article elements in the FreeCodeCamp page
      const articlePattern =
        /<article[^>]*class="[^"]*post-card[^"]*"[^>]*>([\s\S]*?)<\/article>/g;
      const matches = html.matchAll(articlePattern);

      for (const match of matches) {
        const articleHtml = match[1];
        const template = this.extractArticleData(articleHtml);
        if (template) {
          templates.push(template);
        }
      }
    } catch (error) {
      console.error("Error parsing FreeCodeCamp HTML:", error);
    }

    return templates;
  }

  /**
   * Extract article data from article HTML
   */
  private extractArticleData(html: string): RawTemplate | null {
    try {
      // Extract title
      const titleMatch = html.match(
        /<h2[^>]*class="[^"]*post-card-title[^"]*"[^>]*>([\s\S]*?)<\/h2>/
      );
      const title = titleMatch
        ? titleMatch[1].replace(/<[^>]*>/g, "").trim()
        : null;

      if (!title) {
        return null;
      }

      // Extract URL
      const urlMatch = html.match(
        /<a[^>]*class="[^"]*post-card-content-link[^"]*"[^>]*href="([^"]+)"/
      );
      const url = urlMatch ? urlMatch[1] : null;

      // Extract excerpt/description
      const excerptMatch = html.match(
        /<div[^>]*class="[^"]*post-card-excerpt[^"]*"[^>]*>([\s\S]*?)<\/div>/
      );
      const description = excerptMatch
        ? excerptMatch[1].replace(/<[^>]*>/g, "").trim()
        : "";

      // Extract tags
      const tagPattern =
        /<span[^>]*class="[^"]*post-card-tag[^"]*"[^>]*>([^<]+)<\/span>/g;
      const tagMatches = html.matchAll(tagPattern);
      const tags: string[] = [];
      for (const tagMatch of tagMatches) {
        const tag = tagMatch[1].trim();
        if (tag && tag !== "projects") {
          tags.push(tag);
        }
      }

      return {
        title: title,
        name: title,
        description: description || `FreeCodeCamp project tutorial: ${title}`,
        tags: tags,
        languages: tags,
        url: url || undefined,
      };
    } catch (error) {
      console.error("Error extracting FreeCodeCamp article data:", error);
      return null;
    }
  }

  /**
   * Parse raw template into ProjectTemplate format
   */
  parse(raw: RawTemplate): ProjectTemplate | null {
    return this.parser.parse(raw, this.name, { applyDefaults: true });
  }
}
