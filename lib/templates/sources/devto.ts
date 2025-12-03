import type { SourceFetcher, RawTemplate } from "./types";
import type { ProjectTemplate } from "@/types/recommendations";
import { TemplateParser } from "../parser";

/**
 * Fetches project tutorial articles from Dev.to
 */
export class DevToFetcher implements SourceFetcher {
  name = "devto";
  url = "https://dev.to/t/tutorial";
  private parser = new TemplateParser();
  private timeout = 10000; // 10 seconds

  /**
   * Fetch tutorial articles from Dev.to
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
          throw new Error(`Dev.to fetch timeout after ${this.timeout}ms`);
        }
        throw new Error(`Dev.to fetch failed: ${error.message}`);
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
      // Match article elements in the Dev.to page
      const articlePattern =
        /<article[^>]*class="[^"]*crayons-story[^"]*"[^>]*>([\s\S]*?)<\/article>/g;
      const matches = html.matchAll(articlePattern);

      for (const match of matches) {
        const articleHtml = match[1];
        const template = this.extractArticleData(articleHtml);
        if (template) {
          templates.push(template);
        }
      }
    } catch (error) {
      console.error("Error parsing Dev.to HTML:", error);
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
        /<h2[^>]*class="[^"]*crayons-story__title[^"]*"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/
      );
      const title = titleMatch
        ? titleMatch[1].replace(/<[^>]*>/g, "").trim()
        : null;

      if (!title) {
        return null;
      }

      // Extract URL
      const urlMatch = html.match(
        /<a[^>]*href="([^"]+)"[^>]*class="[^"]*crayons-story__hidden-navigation-link[^"]*"/
      );
      const url = urlMatch ? `https://dev.to${urlMatch[1]}` : null;

      // Extract tags
      const tagPattern =
        /<a[^>]*class="[^"]*crayons-tag[^"]*"[^>]*>#([^<]+)<\/a>/g;
      const tagMatches = html.matchAll(tagPattern);
      const tags: string[] = [];
      for (const tagMatch of tagMatches) {
        tags.push(tagMatch[1].trim());
      }

      // Extract description/snippet
      const descMatch = html.match(
        /<div[^>]*class="[^"]*crayons-story__snippet[^"]*"[^>]*>([\s\S]*?)<\/div>/
      );
      const description = descMatch
        ? descMatch[1].replace(/<[^>]*>/g, "").trim()
        : "";

      // Filter for project-related content
      const isProjectRelated = this.isProjectRelated(title, description, tags);
      if (!isProjectRelated) {
        return null;
      }

      return {
        title: title,
        name: title,
        description: description || `Tutorial: ${title}`,
        tags: tags,
        languages: tags,
        url: url || undefined,
      };
    } catch (error) {
      console.error("Error extracting article data:", error);
      return null;
    }
  }

  /**
   * Check if content is project-related
   */
  private isProjectRelated(
    title: string,
    description: string,
    tags: string[]
  ): boolean {
    const projectKeywords = [
      "project",
      "build",
      "create",
      "tutorial",
      "guide",
      "app",
      "application",
      "develop",
      "coding",
      "programming",
    ];

    const content = `${title} ${description} ${tags.join(" ")}`.toLowerCase();

    return projectKeywords.some((keyword) => content.includes(keyword));
  }

  /**
   * Parse raw template into ProjectTemplate format
   */
  parse(raw: RawTemplate): ProjectTemplate | null {
    return this.parser.parse(raw, this.name, { applyDefaults: true });
  }
}
