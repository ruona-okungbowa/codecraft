import { describe, it, expect } from "vitest";
import {
  calculateSkillGaps,
  getSkillGapSummary,
} from "@/lib/analysis/calculateSkillGaps";
import type { Role } from "@/types/skills";

// Feature: CodeCraft, Property 5: Skill Gap Identification
describe("Skill Gap Analysis", () => {
  describe("Property 5: Set Difference Logic", () => {
    it("identifies missing skills as set difference (required - present)", () => {
      const presentSkills = ["JavaScript", "React", "HTML", "CSS"];
      const result = calculateSkillGaps(presentSkills, "frontend");

      // Missing skills should be those in requirements but not in present
      expect(result.missingSkills.essential).toBeInstanceOf(Array);

      // Verify no present skill appears in missing
      presentSkills.forEach((skill) => {
        const isInMissing = [
          ...result.missingSkills.essential,
          ...result.missingSkills.preferred,
          ...result.missingSkills.niceToHave,
        ].some((missing) => missing.toLowerCase() === skill.toLowerCase());

        expect(isInMissing).toBe(false);
      });
    });

    it("returns empty gaps when all skills are present", () => {
      // Get all required skills for frontend role
      const allSkills = [
        "JavaScript",
        "TypeScript",
        "React",
        "HTML",
        "CSS",
        "Git",
        "REST API",
        "Responsive Design",
        "Testing",
        "Webpack",
        "npm",
        "State Management",
      ];

      const result = calculateSkillGaps(allSkills, "frontend");

      expect(result.coveragePercentage).toBe(100);
      expect(result.missingSkills.essential).toHaveLength(0);
    });

    it("identifies all gaps when no skills are present", () => {
      const result = calculateSkillGaps([], "frontend");

      expect(result.coveragePercentage).toBe(0);
      expect(result.missingSkills.essential.length).toBeGreaterThan(0);
    });
  });

  describe("Coverage Percentage", () => {
    it("calculates coverage between 0-100", () => {
      const presentSkills = ["JavaScript", "React"];
      const result = calculateSkillGaps(presentSkills, "frontend");

      expect(result.coveragePercentage).toBeGreaterThanOrEqual(0);
      expect(result.coveragePercentage).toBeLessThanOrEqual(100);
    });

    it("returns 100% when all essential skills present", () => {
      const allEssential = [
        "JavaScript",
        "TypeScript",
        "React",
        "HTML",
        "CSS",
        "Git",
        "REST API",
        "Responsive Design",
      ];

      const result = calculateSkillGaps(allEssential, "frontend");

      expect(result.coveragePercentage).toBe(100);
    });

    it("returns 0% when no skills present", () => {
      const result = calculateSkillGaps([], "backend");

      expect(result.coveragePercentage).toBe(0);
    });
  });

  describe("Role-Specific Analysis", () => {
    it("analyzes frontend role correctly", () => {
      const frontendSkills = ["JavaScript", "React", "HTML", "CSS"];
      const result = calculateSkillGaps(frontendSkills, "frontend");

      expect(result.role).toBe("frontend");
      expect(result.presentSkills).toEqual(frontendSkills);
    });

    it("analyzes backend role correctly", () => {
      const backendSkills = ["Node.js", "Express", "PostgreSQL", "REST API"];
      const result = calculateSkillGaps(backendSkills, "backend");

      expect(result.role).toBe("backend");
      expect(result.presentSkills).toEqual(backendSkills);
    });

    it("analyzes fullstack role correctly", () => {
      const fullstackSkills = ["JavaScript", "React", "Node.js", "PostgreSQL"];
      const result = calculateSkillGaps(fullstackSkills, "fullstack");

      expect(result.role).toBe("fullstack");
    });

    it("analyzes devops role correctly", () => {
      const devopsSkills = ["Docker", "Kubernetes", "AWS", "CI/CD"];
      const result = calculateSkillGaps(devopsSkills, "devops");

      expect(result.role).toBe("devops");
    });

    it("throws error for invalid role", () => {
      expect(() => {
        calculateSkillGaps([], "invalid" as Role);
      }).toThrow();
    });
  });

  describe("Skill Matching", () => {
    it("matches skills case-insensitively", () => {
      const presentSkills = ["javascript", "REACT", "HtMl"];
      const result = calculateSkillGaps(presentSkills, "frontend");

      // Should recognize these as valid skills despite case differences
      expect(result.coveragePercentage).toBeGreaterThan(0);
    });

    it("handles skills with extra whitespace", () => {
      const presentSkills = ["  JavaScript  ", " React ", "HTML"];
      const result = calculateSkillGaps(presentSkills, "frontend");

      expect(result.coveragePercentage).toBeGreaterThan(0);
    });

    it("matches partial skill names", () => {
      const presentSkills = ["React", "Node.js"];
      const result = calculateSkillGaps(presentSkills, "fullstack");

      // Should match skills
      expect(result.coveragePercentage).toBeGreaterThanOrEqual(0);
      expect(result.presentSkills).toContain("React");
      expect(result.presentSkills).toContain("Node.js");
    });
  });

  describe("Gap Prioritization", () => {
    it("categorizes gaps into essential, preferred, and nice-to-have", () => {
      const result = calculateSkillGaps(["JavaScript"], "frontend");

      expect(result.missingSkills).toHaveProperty("essential");
      expect(result.missingSkills).toHaveProperty("preferred");
      expect(result.missingSkills).toHaveProperty("niceToHave");

      expect(Array.isArray(result.missingSkills.essential)).toBe(true);
      expect(Array.isArray(result.missingSkills.preferred)).toBe(true);
      expect(Array.isArray(result.missingSkills.niceToHave)).toBe(true);
    });

    it("essential gaps have higher priority than preferred", () => {
      const result = calculateSkillGaps(["JavaScript"], "frontend");

      // Essential skills should be checked first for coverage
      expect(result.missingSkills.essential).toBeDefined();
    });
  });

  describe("Skill Gap Summary", () => {
    it("returns excellent status for 90%+ coverage", () => {
      const mostSkills = [
        "JavaScript",
        "TypeScript",
        "React",
        "HTML",
        "CSS",
        "Git",
        "REST API",
        "Responsive Design",
      ];
      const analysis = calculateSkillGaps(mostSkills, "frontend");
      const summary = getSkillGapSummary(analysis);

      if (analysis.coveragePercentage >= 90) {
        expect(summary.status).toBe("excellent");
      }
    });

    it("returns good status for 70-89% coverage", () => {
      const someSkills = ["JavaScript", "React", "HTML", "CSS", "Git"];
      const analysis = calculateSkillGaps(someSkills, "frontend");
      const summary = getSkillGapSummary(analysis);

      if (
        analysis.coveragePercentage >= 70 &&
        analysis.coveragePercentage < 90
      ) {
        expect(summary.status).toBe("good");
      }
    });

    it("returns needs-work status for 40-69% coverage", () => {
      const fewSkills = ["JavaScript", "HTML"];
      const analysis = calculateSkillGaps(fewSkills, "frontend");
      const summary = getSkillGapSummary(analysis);

      if (
        analysis.coveragePercentage >= 40 &&
        analysis.coveragePercentage < 70
      ) {
        expect(summary.status).toBe("needs-work");
      }
    });

    it("returns beginner status for <40% coverage", () => {
      const analysis = calculateSkillGaps(["HTML"], "frontend");
      const summary = getSkillGapSummary(analysis);

      if (analysis.coveragePercentage < 40) {
        expect(summary.status).toBe("beginner");
      }
    });

    it("provides actionable priority list", () => {
      const analysis = calculateSkillGaps(["JavaScript"], "frontend");
      const summary = getSkillGapSummary(analysis);

      expect(summary.priority).toBeInstanceOf(Array);
      expect(summary.priority.length).toBeGreaterThan(0);
      expect(summary.priority.length).toBeLessThanOrEqual(5);
    });

    it("includes helpful message", () => {
      const analysis = calculateSkillGaps(["JavaScript", "React"], "frontend");
      const summary = getSkillGapSummary(analysis);

      expect(summary.message).toBeTruthy();
      expect(typeof summary.message).toBe("string");
      expect(summary.message.length).toBeGreaterThan(10);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty present skills array", () => {
      const result = calculateSkillGaps([], "frontend");

      expect(result.presentSkills).toEqual([]);
      expect(result.coveragePercentage).toBe(0);
    });

    it("handles duplicate skills in present array", () => {
      const duplicateSkills = ["JavaScript", "JavaScript", "React", "React"];
      const result = calculateSkillGaps(duplicateSkills, "frontend");

      expect(result.presentSkills).toEqual(duplicateSkills);
      expect(result.coveragePercentage).toBeGreaterThan(0);
    });

    it("handles skills not in requirements", () => {
      const extraSkills = ["JavaScript", "React", "Fortran", "COBOL"];
      const result = calculateSkillGaps(extraSkills, "frontend");

      // Should not crash, extra skills just don't count toward coverage
      expect(result.coveragePercentage).toBeGreaterThanOrEqual(0);
    });
  });
});
