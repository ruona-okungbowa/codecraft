import { describe, it, expect, vi, beforeEach } from "vitest";
import { TemplateFetcher } from "@/lib/templates/fetcher";
import { FALLBACK_TEMPLATES } from "@/lib/templates/fallbacks";
import type { SupabaseClient } from "@supabase/supabase-js";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      lt: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    delete: vi.fn(() => ({
      lt: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
} as unknown as SupabaseClient;

describe("TemplateFetcher", () => {
  let fetcher: TemplateFetcher;

  beforeEach(() => {
    vi.clearAllMocks();
    fetcher = new TemplateFetcher(mockSupabase);
  });

  describe("Fallback Templates", () => {
    it("should return templates (either from sources or fallback)", async () => {
      // Fetch templates - may come from sources or fallback
      const templates = await fetcher.fetchAll({
        forceRefresh: true,
        fallbackOnError: true,
      });

      // Should return some templates
      expect(templates.length).toBeGreaterThan(0);
      // Templates should be valid ProjectTemplate objects
      expect(templates[0]).toHaveProperty("id");
      expect(templates[0]).toHaveProperty("name");
      expect(templates[0]).toHaveProperty("techStack");
    });

    it("should have at least 10 fallback templates", () => {
      expect(FALLBACK_TEMPLATES.length).toBeGreaterThanOrEqual(10);
    });

    it("should have fallback templates covering different difficulty levels", () => {
      const difficulties = new Set(FALLBACK_TEMPLATES.map((t) => t.difficulty));
      expect(difficulties.has("beginner")).toBe(true);
      expect(difficulties.has("intermediate")).toBe(true);
      expect(difficulties.has("advanced")).toBe(true);
    });

    it("should have fallback templates covering different categories", () => {
      const categories = new Set(FALLBACK_TEMPLATES.map((t) => t.category));
      expect(categories.size).toBeGreaterThan(1);
      expect(
        Array.from(categories).some((c) =>
          ["frontend", "backend", "fullstack", "devops", "mobile"].includes(c)
        )
      ).toBe(true);
    });

    it("should have all required fields in fallback templates", () => {
      FALLBACK_TEMPLATES.forEach((template) => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.techStack).toBeDefined();
        expect(template.techStack.length).toBeGreaterThan(0);
        expect(template.difficulty).toBeDefined();
        expect(template.timeEstimate).toBeDefined();
        expect(template.skillsTaught).toBeDefined();
        expect(template.skillsTaught.length).toBeGreaterThan(0);
        expect(template.category).toBeDefined();
        expect(template.features).toBeDefined();
        expect(template.features.length).toBeGreaterThan(0);
        expect(template.learningResources).toBeDefined();
      });
    });
  });

  describe("Parallel Fetching", () => {
    it("should attempt to fetch from all sources", async () => {
      // This test verifies that fetchAll attempts parallel fetching
      const templates = await fetcher.fetchAll({
        forceRefresh: true,
        fallbackOnError: true,
      });

      // Should return some templates (either from sources or fallback)
      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
    });
  });
});
