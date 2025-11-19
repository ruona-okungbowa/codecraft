import { describe, it, expect } from "vitest";
import { calculatePortfolioScore } from "@/lib/scoring/portfolio";
import type { Project } from "@/types";

describe("Portfolio Scoring", () => {
  // Helper to create mock projects
  const createMockProject = (overrides?: Partial<Project>): Project => ({
    id: "1",
    userId: "user1",
    githubRepoId: 123,
    name: "test-project",
    description: "A test project",
    url: "https://github.com/user/repo",
    stars: 5,
    forks: 2,
    languages: { TypeScript: 80, JavaScript: 20 },
    lastCommitDate: new Date(),
    complexityScore: 50,
    analysedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe("Edge Cases", () => {
    it("should return 0 score for empty portfolio", () => {
      const result = calculatePortfolioScore([]);

      expect(result.overallScore).toBe(0);
      expect(result.breakdown.weaknesses).toContain("No projects found");
    });

    it("should handle projects without complexity scores", () => {
      const projects = [createMockProject({ complexityScore: undefined })];

      const result = calculatePortfolioScore(projects);

      expect(result.projectQualityScore).toBe(0);
    });
  });

  describe("Project Quality", () => {
    it("should calculate average complexity correctly", () => {
      const projects = [
        createMockProject({ complexityScore: 60 }),
        createMockProject({ complexityScore: 80, id: "2", githubRepoId: 124 }),
      ];

      const result = calculatePortfolioScore(projects);

      // Average is 70, should be at least 70
      expect(result.projectQualityScore).toBeGreaterThanOrEqual(70);
    });

    it("should give bonus for high-quality projects", () => {
      const projects = [
        createMockProject({ complexityScore: 90 }),
        createMockProject({ complexityScore: 85, id: "2", githubRepoId: 124 }),
      ];

      const result = calculatePortfolioScore(projects);

      // Should get bonus for multiple high-quality projects
      expect(result.projectQualityScore).toBeGreaterThan(85);
    });
  });

  describe("Tech Diversity", () => {
    it("should score higher with more languages", () => {
      const fewLanguages = [
        createMockProject({ languages: { JavaScript: 100 } }),
      ];

      const manyLanguages = [
        createMockProject({
          languages: {
            TypeScript: 40,
            JavaScript: 30,
            Python: 20,
            Go: 10,
          },
        }),
      ];

      const resultFew = calculatePortfolioScore(fewLanguages);
      const resultMany = calculatePortfolioScore(manyLanguages);

      expect(resultMany.techDiversityScore).toBeGreaterThan(
        resultFew.techDiversityScore
      );
    });
  });

  describe("Documentation", () => {
    it("should score higher with descriptions", () => {
      const withDescription = [
        createMockProject({
          description: "A detailed description of the project",
          stars: 0, // Remove other factors
          languages: { JavaScript: 100 }, // Single language
        }),
      ];

      const withoutDescription = [
        createMockProject({
          description: undefined,
          stars: 0, // Remove other factors
          languages: { JavaScript: 100 }, // Single language
        }),
      ];

      const resultWith = calculatePortfolioScore(withDescription);
      const resultWithout = calculatePortfolioScore(withoutDescription);

      expect(resultWith.documentationScore).toBeGreaterThan(
        resultWithout.documentationScore
      );
    });
  });

  describe("Consistency", () => {
    it("should score higher with recent activity", () => {
      const recentDate = new Date();
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 1);

      const recentProjects = [
        createMockProject({ lastCommitDate: recentDate }),
      ];

      const oldProjects = [createMockProject({ lastCommitDate: oldDate })];

      const resultRecent = calculatePortfolioScore(recentProjects);
      const resultOld = calculatePortfolioScore(oldProjects);

      expect(resultRecent.consistencyScore).toBeGreaterThan(
        resultOld.consistencyScore
      );
    });
  });
});
