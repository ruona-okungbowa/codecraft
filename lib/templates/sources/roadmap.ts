import type { SourceFetcher, RawTemplate } from "./types";
import type { ProjectTemplate } from "@/types/recommendations";
import { TemplateParser } from "../parser";

/**
 * Fetches project ideas from Roadmap.sh
 */
export class RoadmapFetcher implements SourceFetcher {
  name = "roadmap";
  url = "https://roadmap.sh/projects";
  private parser = new TemplateParser();
  private timeout = 10000; // 10 seconds

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
          throw new Error(`Roadmap.sh fetch timeout after ${this.timeout}ms`);
        }
        throw new Error(`Roadmap.sh fetch failed: ${error.message}`);
      }
      throw error;
    }
  }

  private parseHTML(html: string): RawTemplate[] {
    const templates: RawTemplate[] = [];

    try {
      const projectPattern =
        /<a[^>]*href="\/projects\/([^"]+)"[^>]*class="[^"]*group[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
      const matches = html.matchAll(projectPattern);

      for (const match of matches) {
        const projectSlug = match[1];
        const cardHtml = match[2];
        const template = this.extractProjectData(projectSlug, cardHtml);
        if (template) {
          templates.push(template);
        }
      }
    } catch (error) {
      console.error("Error parsing Roadmap.sh HTML:", error);
    }

    return templates;
  }

  private extractProjectData(slug: string, html: string): RawTemplate | null {
    try {
      // Extract title
      const titleMatch = html.match(
        /<h3[^>]*class="[^"]*text-lg[^"]*"[^>]*>([\s\S]*?)<\/h3>/
      );
      const title = titleMatch
        ? titleMatch[1].replace(/<[^>]*>/g, "").trim()
        : null;

      if (!title) {
        return null;
      }

      // Extract description
      const descMatch = html.match(
        /<p[^>]*class="[^"]*text-sm[^"]*"[^>]*>([\s\S]*?)<\/p>/
      );
      const description = descMatch
        ? descMatch[1].replace(/<[^>]*>/g, "").trim()
        : "";

      // Extract difficulty badge
      const difficultyMatch = html.match(
        /<span[^>]*class="[^"]*rounded-full[^"]*"[^>]*>([\s\S]*?)<\/span>/
      );
      const difficulty = difficultyMatch
        ? difficultyMatch[1]
            .replace(/<[^>]*>/g, "")
            .trim()
            .toLowerCase()
        : "";

      // Extract tags/technologies
      const tagPattern =
        /<span[^>]*class="[^"]*inline-flex[^"]*"[^>]*>([\s\S]*?)<\/span>/g;
      const tagMatches = html.matchAll(tagPattern);
      const tags: string[] = [];
      for (const tagMatch of tagMatches) {
        const tag = tagMatch[1].replace(/<[^>]*>/g, "").trim();
        if (
          tag &&
          !tag.toLowerCase().includes("beginner") &&
          !tag.toLowerCase().includes("intermediate") &&
          !tag.toLowerCase().includes("advanced")
        ) {
          tags.push(tag);
        }
      }

      return {
        title: title,
        name: title,
        description: description || `Roadmap.sh project: ${title}`,
        difficulty: difficulty,
        tags: tags,
        languages: tags,
        url: `https://roadmap.sh/projects/${slug}`,
      };
    } catch (error) {
      console.error("Error extracting Roadmap.sh project data:", error);
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
