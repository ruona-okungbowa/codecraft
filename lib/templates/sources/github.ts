import type { SourceFetcher, RawTemplate } from "./types";
import type { ProjectTemplate } from "@/types/recommendations";
import { TemplateParser } from "../parser";

/**
 * Fetches trending repositories from GitHub
 */
export class GitHubTrendingFetcher implements SourceFetcher {
  name = "github-trending";
  url = "https://github.com/trending";
  private parser = new TemplateParser();
  private timeout = 10000; // 10 seconds

  /**
   * Fetch trending repositories from GitHub
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
          throw new Error(
            `GitHub Trending fetch timeout after ${this.timeout}ms`
          );
        }
        throw new Error(`GitHub Trending fetch failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Parse HTML to extract repository information
   */
  private parseHTML(html: string): RawTemplate[] {
    const templates: RawTemplate[] = [];

    try {
      // Match repository articles in the trending page
      const repoPattern =
        /<article[^>]*class="[^"]*Box-row[^"]*"[^>]*>([\s\S]*?)<\/article>/g;
      const matches = html.matchAll(repoPattern);

      for (const match of matches) {
        const articleHtml = match[1];
        const template = this.extractRepoData(articleHtml);
        if (template) {
          templates.push(template);
        }
      }
    } catch (error) {
      console.error("Error parsing GitHub Trending HTML:", error);
    }

    return templates;
  }

  /**
   * Extract repository data from article HTML
   */
  private extractRepoData(html: string): RawTemplate | null {
    try {
      // Extract repo name
      const nameMatch = html.match(
        /<h2[^>]*>[\s\S]*?<a[^>]*href="\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/
      );
      const repoPath = nameMatch ? nameMatch[1].trim() : null;
      const repoName = repoPath ? repoPath.split("/").pop() : null;

      if (!repoName || !repoPath) {
        return null;
      }

      // Extract description
      const descMatch = html.match(
        /<p[^>]*class="[^"]*col-9[^"]*"[^>]*>([\s\S]*?)<\/p>/
      );
      const description = descMatch
        ? descMatch[1].replace(/<[^>]*>/g, "").trim()
        : "";

      // Extract language
      const langMatch = html.match(
        /itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/
      );
      const language = langMatch ? langMatch[1].trim() : "";

      // Extract stars
      const starsMatch = html.match(/(\d+(?:,\d+)*)\s*stars?\s*today/i);
      const stars = starsMatch
        ? parseInt(starsMatch[1].replace(/,/g, ""), 10)
        : 0;

      return {
        name: repoName,
        title: repoName,
        description: description || `Trending ${language || ""} repository`,
        language: language,
        languages: language ? [language] : [],
        stars: stars,
        url: `https://github.com/${repoPath}`,
        tags: language ? [language] : [],
      };
    } catch (error) {
      console.error("Error extracting repo data:", error);
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
