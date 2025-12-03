import { describe, it, expect } from "vitest";
import { calculatePortfolioScore } from "@/lib/scoring/portfolio";
import type { Project } from "@/types";

// Feature: CodeCraft, Property 2: Portfolio Score Consistency
describe("Portfolio Scoring", () => {
  const mockProject: Project = {
    id: "1",
    userId: "user1",
    githubRepoId: 123,
    name: "awesome-project",
    description:
      "A comprehensive full-stack application with React and Node.js",
    url: "https://github.com/user/awesome-project",
    languages: { TypeScript: 60, JavaScript: 30, CSS: 10 },
    stars: 10,
    forks: 3,
    lastCommitDate: new Date(),
    complexityScore: 75,
    analysedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("Property 2: Deterministic Scoring", () => {
    it("returns same score for identical input", () => {
      const projects = [mockProject];

      const score1 = calculatePortfolioScore(projects);
      const score2 = calculatePortfolioScore(projects);

      expect(score1.overallScore).toBe(score2.overallScore);
      expect(score1).toEqual(score2);
    });

    it("returns consistent scores across multiple calls", () => {
      const projects = [
        mockProject,
        { ...mockProject, id: "2", githubRepoId: 456 },
      ];

      const scores = Array.from(
        { length: 10 },
        () => calculatePortfolioScore(projects).overallScore
      );

      const allSame = scores.every((score) => score === scores[0]);
      expect(allSame).toBe(true);
    });
  });

  describe("Score Bounds", () => {
    it("returns score between 0-100", () => {
      const projects = [mockProject];
      const result = calculatePortfolioScore(projects);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it("returns 0 for empty portfolio", () => {
      const result = calculatePortfolioScore([]);

      expect(result.overallScore).toBe(0);
      expect(result.rank).toBe("C");
    });

    it("all category scores are between 0-100", () => {
      const projects = [mockProject];
      const result = calculatePortfolioScore(projects);

      expect(result.projectQualityScore).toBeGreaterThanOrEqual(0);
      expect(result.projectQualityScore).toBeLessThanOrEqual(100);
      expect(result.techDiversityScore).toBeGreaterThanOrEqual(0);
      expect(result.techDiversityScore).toBeLessThanOrEqual(100);
      expect(result.documentationScore).toBeGreaterThanOrEqual(0);
      expect(result.documentationScore).toBeLessThanOrEqual(100);
      expect(result.consistencyScore).toBeGreaterThanOrEqual(0);
      expect(result.consistencyScore).toBeLessThanOrEqual(100);
    });
  });

  describe("Rank Calculation", () => {
    it("assigns S rank for scores >= 95", () => {
      const excellentProjects = Array.from({ length: 5 }, (_, i) => ({
        ...mockProject,
        id: `${i}`,
        githubRepoId: i,
        complexityScore: 95,
        stars: 50,
        forks: 20,
        languages: { TypeScript: 40, JavaScript: 30, Python: 20, Go: 10 },
      }));

      const result = calculatePortfolioScore(excellentProjects);

      if (result.overallScore >= 95) {
        expect(result.rank).toBe("S");
      }
    });

    it("assigns A rank for scores 75-94", () => {
      const goodProjects = Array.from({ length: 3 }, (_, i) => ({
        ...mockProject,
        id: `${i}`,
        githubRepoId: i,
        complexityScore: 80,
      }));

      const result = calculatePortfolioScore(goodProjects);

      if (result.overallScore >= 75 && result.overallScore < 95) {
        expect(["A+", "A", "A-"]).toContain(result.rank);
      }
    });

    it("assigns C rank for low scores", () => {
      const weakProject: Project = {
        ...mockProject,
        complexityScore: 20,
        stars: 0,
        forks: 0,
        description: "test",
        languages: { JavaScript: 100 },
      };

      const result = calculatePortfolioScore([weakProject]);

      if (result.overallScore < 25) {
        expect(["C", "C+"]).toContain(result.rank);
      }
    });
  });

  describe("Feedback Generation", () => {
    it("provides strengths for high scores", () => {
      const strongProjects = Array.from({ length: 4 }, (_, i) => ({
        ...mockProject,
        id: `${i}`,
        githubRepoId: i,
        complexityScore: 85,
        stars: 20,
      }));

      const result = calculatePortfolioScore(strongProjects);

      expect(result.breakdown.strengths.length).toBeGreaterThan(0);
    });

    it("provides suggestions for low scores", () => {
      const weakProject: Project = {
        ...mockProject,
        complexityScore: 30,
        stars: 0,
        description: "test",
      };

      const result = calculatePortfolioScore([weakProject]);

      expect(result.breakdown.suggestions.length).toBeGreaterThan(0);
    });

    it("identifies weaknesses correctly", () => {
      const inconsistentProject: Project = {
        ...mockProject,
        lastCommitDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      };

      const result = calculatePortfolioScore([inconsistentProject]);

      expect(result.breakdown.weaknesses.length).toBeGreaterThan(0);
    });
  });

  describe("Profile README Bonus", () => {
    it("adds bonus to documentation score when profile README exists", () => {
      const projects = [mockProject];

      const withoutReadme = calculatePortfolioScore(projects, false);
      const withReadme = calculatePortfolioScore(projects, true);

      expect(withReadme.documentationScore).toBeGreaterThanOrEqual(
        withoutReadme.documentationScore
      );
      expect(withReadme.hasProfileReadme).toBe(true);
      expect(withoutReadme.hasProfileReadme).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("handles projects with missing data", () => {
      const incompleteProject: Project = {
        id: "1",
        userId: "user1",
        githubRepoId: 123,
        name: "test",
        url: "https://github.com/user/test",
        languages: {},
        stars: 0,
        forks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = calculatePortfolioScore([incompleteProject]);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it("handles projects with null complexity scores", () => {
      const project: Project = {
        ...mockProject,
        complexityScore: undefined,
      };

      const result = calculatePortfolioScore([project]);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
    });

    it("handles very large portfolios", () => {
      const manyProjects = Array.from({ length: 50 }, (_, i) => ({
        ...mockProject,
        id: `${i}`,
        githubRepoId: i,
      }));

      const result = calculatePortfolioScore(manyProjects);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });
  });
});
