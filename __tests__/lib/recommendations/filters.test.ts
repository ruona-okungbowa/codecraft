import { describe, it, expect } from "vitest";
import {
  applyFilters,
  sortRecommendations,
} from "@/lib/recommendations/filters";
import type {
  ProjectRecommendation,
  FilterState,
} from "@/types/recommendations";

// Helper to create a mock recommendation
function createMockRecommendation(
  overrides: Partial<ProjectRecommendation> = {}
): ProjectRecommendation {
  return {
    id: "test-1",
    name: "Test Project",
    description: "A test project",
    techStack: ["React", "TypeScript"],
    difficulty: "beginner",
    timeEstimate: "1-2 days",
    skillsTaught: ["React", "TypeScript"],
    category: "frontend",
    features: [],
    learningResources: [],
    priorityScore: 10,
    priority: "medium",
    gapsFilled: [],
    skillMatches: [],
    criticalGapsAddressed: 0,
    ...overrides,
  };
}

describe("applyFilters", () => {
  it("returns all recommendations when all filters are set to 'all'", () => {
    const recommendations = [
      createMockRecommendation({ id: "1" }),
      createMockRecommendation({ id: "2" }),
    ];

    const filters: FilterState = {
      difficulty: "all",
      category: "all",
      timeCommitment: "all",
      skills: [],
      sortBy: "priority",
    };

    const result = applyFilters(recommendations, filters);
    expect(result).toHaveLength(2);
  });

  it("filters by difficulty correctly", () => {
    const recommendations = [
      createMockRecommendation({ id: "1", difficulty: "beginner" }),
      createMockRecommendation({ id: "2", difficulty: "advanced" }),
      createMockRecommendation({ id: "3", difficulty: "beginner" }),
    ];

    const filters: FilterState = {
      difficulty: "beginner",
      category: "all",
      timeCommitment: "all",
      skills: [],
      sortBy: "priority",
    };

    const result = applyFilters(recommendations, filters);
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.difficulty === "beginner")).toBe(true);
  });

  it("filters by category correctly", () => {
    const recommendations = [
      createMockRecommendation({ id: "1", category: "frontend" }),
      createMockRecommendation({ id: "2", category: "backend" }),
      createMockRecommendation({ id: "3", category: "frontend" }),
    ];

    const filters: FilterState = {
      difficulty: "all",
      category: "frontend",
      timeCommitment: "all",
      skills: [],
      sortBy: "priority",
    };

    const result = applyFilters(recommendations, filters);
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.category === "frontend")).toBe(true);
  });

  it("filters by time commitment correctly", () => {
    const recommendations = [
      createMockRecommendation({ id: "1", timeEstimate: "1-2 days" }),
      createMockRecommendation({ id: "2", timeEstimate: "3-5 days" }),
      createMockRecommendation({ id: "3", timeEstimate: "weekend project" }),
    ];

    const filters: FilterState = {
      difficulty: "all",
      category: "all",
      timeCommitment: "weekend",
      skills: [],
      sortBy: "priority",
    };

    const result = applyFilters(recommendations, filters);
    expect(result).toHaveLength(2);
  });

  it("filters by skills correctly", () => {
    const recommendations = [
      createMockRecommendation({
        id: "1",
        skillsTaught: ["React", "TypeScript"],
      }),
      createMockRecommendation({
        id: "2",
        skillsTaught: ["Vue", "JavaScript"],
      }),
      createMockRecommendation({
        id: "3",
        skillsTaught: ["React", "Node.js"],
      }),
    ];

    const filters: FilterState = {
      difficulty: "all",
      category: "all",
      timeCommitment: "all",
      skills: ["React"],
      sortBy: "priority",
    };

    const result = applyFilters(recommendations, filters);
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.skillsTaught.includes("React"))).toBe(true);
  });

  it("applies AND logic for multiple filters", () => {
    const recommendations = [
      createMockRecommendation({
        id: "1",
        difficulty: "beginner",
        category: "frontend",
        skillsTaught: ["React"],
      }),
      createMockRecommendation({
        id: "2",
        difficulty: "beginner",
        category: "backend",
        skillsTaught: ["React"],
      }),
      createMockRecommendation({
        id: "3",
        difficulty: "advanced",
        category: "frontend",
        skillsTaught: ["React"],
      }),
    ];

    const filters: FilterState = {
      difficulty: "beginner",
      category: "frontend",
      timeCommitment: "all",
      skills: ["React"],
      sortBy: "priority",
    };

    const result = applyFilters(recommendations, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});

describe("sortRecommendations", () => {
  it("sorts by priority score (descending by default)", () => {
    const recommendations = [
      createMockRecommendation({ id: "1", priorityScore: 5 }),
      createMockRecommendation({ id: "2", priorityScore: 20 }),
      createMockRecommendation({ id: "3", priorityScore: 10 }),
    ];

    const result = sortRecommendations(recommendations, "priority");
    expect(result[0].id).toBe("2");
    expect(result[1].id).toBe("3");
    expect(result[2].id).toBe("1");
  });

  it("sorts by difficulty (ascending by default)", () => {
    const recommendations = [
      createMockRecommendation({ id: "1", difficulty: "advanced" }),
      createMockRecommendation({ id: "2", difficulty: "beginner" }),
      createMockRecommendation({ id: "3", difficulty: "intermediate" }),
    ];

    const result = sortRecommendations(recommendations, "difficulty");
    expect(result[0].id).toBe("2");
    expect(result[1].id).toBe("3");
    expect(result[2].id).toBe("1");
  });

  it("sorts by time commitment (ascending by default)", () => {
    const recommendations = [
      createMockRecommendation({ id: "1", timeEstimate: "2+ weeks" }),
      createMockRecommendation({ id: "2", timeEstimate: "weekend project" }),
      createMockRecommendation({ id: "3", timeEstimate: "3-5 days" }),
    ];

    const result = sortRecommendations(recommendations, "time");
    expect(result[0].id).toBe("2");
    expect(result[1].id).toBe("3");
    expect(result[2].id).toBe("1");
  });

  it("sorts by number of skills taught (descending by default)", () => {
    const recommendations = [
      createMockRecommendation({ id: "1", skillsTaught: ["React"] }),
      createMockRecommendation({
        id: "2",
        skillsTaught: ["React", "TypeScript", "Node.js"],
      }),
      createMockRecommendation({ id: "3", skillsTaught: ["React", "CSS"] }),
    ];

    const result = sortRecommendations(recommendations, "skills");
    expect(result[0].id).toBe("2");
    expect(result[1].id).toBe("3");
    expect(result[2].id).toBe("1");
  });
});
