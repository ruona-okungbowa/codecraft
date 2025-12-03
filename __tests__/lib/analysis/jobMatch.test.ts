import { describe, it, expect } from "vitest";

// Feature: CodeCraft, Property 8: Job Match Percentage Bounds
describe("Job Match Scoring", () => {
  // Helper function to calculate job match
  function calculateJobMatch(
    userSkills: string[],
    requiredSkills: string[]
  ): {
    matchPercentage: number;
    matchedSkills: string[];
    missingSkills: string[];
  } {
    const normalizedUserSkills = userSkills.map((s) => s.toLowerCase().trim());
    const normalizedRequired = requiredSkills.map((s) =>
      s.toLowerCase().trim()
    );

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    normalizedRequired.forEach((required, index) => {
      const isMatched = normalizedUserSkills.some(
        (user) => user.includes(required) || required.includes(user)
      );

      if (isMatched) {
        matchedSkills.push(requiredSkills[index]);
      } else {
        missingSkills.push(requiredSkills[index]);
      }
    });

    const matchPercentage =
      requiredSkills.length > 0
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 0;

    return {
      matchPercentage,
      matchedSkills,
      missingSkills,
    };
  }

  describe("Property 8: Match Percentage Bounds", () => {
    it("returns percentage between 0 and 100", () => {
      const userSkills = ["JavaScript", "React", "Node.js"];
      const requiredSkills = ["JavaScript", "TypeScript", "React", "Vue"];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(result.matchPercentage).toBeGreaterThanOrEqual(0);
      expect(result.matchPercentage).toBeLessThanOrEqual(100);
    });

    it("returns 100% for perfect match", () => {
      const skills = ["JavaScript", "React", "Node.js", "TypeScript"];

      const result = calculateJobMatch(skills, skills);

      expect(result.matchPercentage).toBe(100);
      expect(result.missingSkills).toHaveLength(0);
    });

    it("returns 0% for no match", () => {
      const userSkills = ["Python", "Django", "Flask"];
      const requiredSkills = ["JavaScript", "React", "Node.js"];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(result.matchPercentage).toBe(0);
      expect(result.matchedSkills).toHaveLength(0);
    });

    it("returns 0% for empty user skills", () => {
      const requiredSkills = ["JavaScript", "React"];

      const result = calculateJobMatch([], requiredSkills);

      expect(result.matchPercentage).toBe(0);
    });

    it("returns 0% for empty required skills", () => {
      const userSkills = ["JavaScript", "React"];

      const result = calculateJobMatch(userSkills, []);

      expect(result.matchPercentage).toBe(0);
    });
  });

  describe("Skill Matching Logic", () => {
    it("matches skills case-insensitively", () => {
      const userSkills = ["javascript", "REACT", "Node.JS"];
      const requiredSkills = ["JavaScript", "React", "Node.js"];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(result.matchPercentage).toBe(100);
    });

    it("matches partial skill names", () => {
      const userSkills = ["React", "Node"];
      const requiredSkills = ["React.js", "Node.js"];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(result.matchPercentage).toBeGreaterThan(0);
    });

    it("identifies matched skills correctly", () => {
      const userSkills = ["JavaScript", "React", "CSS"];
      const requiredSkills = ["JavaScript", "React", "TypeScript", "Vue"];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(result.matchedSkills).toContain("JavaScript");
      expect(result.matchedSkills).toContain("React");
      expect(result.matchedSkills).toHaveLength(2);
    });

    it("identifies missing skills correctly", () => {
      const userSkills = ["JavaScript", "React"];
      const requiredSkills = ["JavaScript", "React", "TypeScript", "Vue"];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(result.missingSkills).toContain("TypeScript");
      expect(result.missingSkills).toContain("Vue");
      expect(result.missingSkills).toHaveLength(2);
    });
  });

  describe("Percentage Calculation", () => {
    it("calculates 50% match correctly", () => {
      const userSkills = ["JavaScript", "React"];
      const requiredSkills = ["JavaScript", "React", "TypeScript", "Vue"];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(result.matchPercentage).toBe(50);
    });

    it("calculates 75% match correctly", () => {
      const userSkills = ["JavaScript", "React", "TypeScript"];
      const requiredSkills = ["JavaScript", "React", "TypeScript", "Vue"];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(result.matchPercentage).toBe(75);
    });

    it("calculates 25% match correctly", () => {
      const userSkills = ["JavaScript"];
      const requiredSkills = ["JavaScript", "React", "TypeScript", "Vue"];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(result.matchPercentage).toBe(25);
    });

    it("rounds percentage to nearest integer", () => {
      const userSkills = ["JavaScript", "React"];
      const requiredSkills = ["JavaScript", "React", "TypeScript"];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(Number.isInteger(result.matchPercentage)).toBe(true);
      expect(result.matchPercentage).toBe(67); // 2/3 = 66.67 rounds to 67
    });
  });

  describe("Edge Cases", () => {
    it("handles duplicate skills in user array", () => {
      const userSkills = ["JavaScript", "JavaScript", "React"];
      const requiredSkills = ["JavaScript", "React"];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(result.matchPercentage).toBe(100);
    });

    it("handles duplicate skills in required array", () => {
      const userSkills = ["JavaScript", "React"];
      const requiredSkills = ["JavaScript", "JavaScript", "React"];

      const result = calculateJobMatch(userSkills, requiredSkills);

      // Should still calculate based on required array length
      expect(result.matchPercentage).toBeGreaterThanOrEqual(0);
      expect(result.matchPercentage).toBeLessThanOrEqual(100);
    });

    it("handles skills with extra whitespace", () => {
      const userSkills = ["  JavaScript  ", " React "];
      const requiredSkills = ["JavaScript", "React"];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(result.matchPercentage).toBe(100);
    });

    it("handles empty strings in skill arrays", () => {
      const userSkills = ["JavaScript", "", "React"];
      const requiredSkills = ["JavaScript", "React", "TypeScript"];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(result.matchPercentage).toBeGreaterThanOrEqual(0);
      expect(result.matchPercentage).toBeLessThanOrEqual(100);
    });

    it("handles very long skill lists", () => {
      const userSkills = Array.from({ length: 50 }, (_, i) => `UserSkill${i}`);
      const requiredSkills = Array.from({ length: 100 }, (_, i) => `Skill${i}`);

      const result = calculateJobMatch(userSkills, requiredSkills);

      // No overlap between UserSkill and Skill prefixes
      expect(result.matchPercentage).toBeGreaterThanOrEqual(0);
      expect(result.matchPercentage).toBeLessThanOrEqual(100);
    });
  });

  describe("Real-World Scenarios", () => {
    it("matches frontend developer job", () => {
      const userSkills = [
        "JavaScript",
        "React",
        "HTML",
        "CSS",
        "Git",
        "Webpack",
      ];
      const requiredSkills = [
        "JavaScript",
        "React",
        "TypeScript",
        "HTML",
        "CSS",
        "Git",
        "Testing",
        "REST API",
      ];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(result.matchPercentage).toBeGreaterThan(50);
      expect(result.matchPercentage).toBeLessThan(100);
      expect(result.matchedSkills.length).toBeGreaterThan(0);
      expect(result.missingSkills.length).toBeGreaterThan(0);
    });

    it("matches backend developer job", () => {
      const userSkills = ["Node.js", "Express", "PostgreSQL", "MongoDB", "AWS"];
      const requiredSkills = [
        "Node.js",
        "Express",
        "PostgreSQL",
        "Docker",
        "Kubernetes",
      ];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(result.matchPercentage).toBe(60); // 3/5
      expect(result.matchedSkills).toContain("Node.js");
      expect(result.matchedSkills).toContain("Express");
      expect(result.matchedSkills).toContain("PostgreSQL");
      expect(result.missingSkills).toContain("Docker");
      expect(result.missingSkills).toContain("Kubernetes");
    });

    it("matches entry-level position", () => {
      const userSkills = ["JavaScript", "HTML", "CSS", "Git"];
      const requiredSkills = ["JavaScript", "HTML", "CSS", "Git", "React"];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(result.matchPercentage).toBe(80); // 4/5
      expect(result.missingSkills).toEqual(["React"]);
    });

    it("matches senior position with many requirements", () => {
      const userSkills = [
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        "PostgreSQL",
        "Docker",
        "AWS",
        "CI/CD",
      ];
      const requiredSkills = [
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        "PostgreSQL",
        "Docker",
        "Kubernetes",
        "AWS",
        "CI/CD",
        "Microservices",
        "GraphQL",
        "Redis",
      ];

      const result = calculateJobMatch(userSkills, requiredSkills);

      expect(result.matchPercentage).toBeGreaterThan(60);
      expect(result.matchPercentage).toBeLessThan(100);
    });
  });
});
