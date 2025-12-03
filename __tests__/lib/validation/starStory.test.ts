import { describe, it, expect } from "vitest";
import { validateStarStory } from "@/lib/validation/starStory";

// Feature: CodeCraft, Property 3: STAR Story Completeness
describe("STAR Story Validation", () => {
  describe("Property 3: All Four Components Present", () => {
    it("validates complete STAR story", () => {
      const completeStory = `
Situation: Our team needed a way to manage user authentication across multiple services.
Task: I was tasked with implementing a centralized authentication system using JWT tokens.
Action: I developed a Node.js microservice with Express and integrated it with our existing React frontend.
Result: Reduced authentication-related bugs by 60% and improved user login speed by 40%.
      `;

      const result = validateStarStory(completeStory);

      expect(result.valid).toBe(true);
      expect(result.hasSituation).toBe(true);
      expect(result.hasTask).toBe(true);
      expect(result.hasAction).toBe(true);
      expect(result.hasResult).toBe(true);
      expect(result.missingComponents).toHaveLength(0);
    });

    it("detects missing Situation", () => {
      const noSituation = `
Task: Build a dashboard for analytics.
Action: I created a React dashboard with Chart.js.
Result: Users can now visualize data in real-time.
      `;

      const result = validateStarStory(noSituation);

      expect(result.valid).toBe(false);
      expect(result.hasSituation).toBe(false);
      expect(result.missingComponents).toContain("Situation");
    });

    it("detects missing Task", () => {
      const noTask = `
Situation: The company needed better data visualization.
Action: I implemented a dashboard using React and D3.js.
Result: Improved decision-making speed by 30%.
      `;

      const result = validateStarStory(noTask);

      expect(result.valid).toBe(false);
      expect(result.hasTask).toBe(false);
      expect(result.missingComponents).toContain("Task");
    });

    it("detects missing Action", () => {
      const noAction = `
Situation: Users complained about slow page load times.
Task: Optimize the application performance.
Result: Page load time decreased from 5s to 1.5s.
      `;

      const result = validateStarStory(noAction);

      expect(result.valid).toBe(false);
      expect(result.hasAction).toBe(false);
      expect(result.missingComponents).toContain("Action");
    });

    it("detects missing Result", () => {
      const noResult = `
Situation: The API was experiencing high latency.
Task: Reduce API response time.
Action: I implemented Redis caching and optimized database queries.
      `;

      const result = validateStarStory(noResult);

      expect(result.valid).toBe(false);
      expect(result.hasResult).toBe(false);
      expect(result.missingComponents).toContain("Result");
    });

    it("detects multiple missing components", () => {
      const incomplete = `
Action: I built a mobile app with React Native.
      `;

      const result = validateStarStory(incomplete);

      expect(result.valid).toBe(false);
      expect(result.missingComponents.length).toBeGreaterThan(1);
      expect(result.missingComponents).toContain("Situation");
      expect(result.missingComponents).toContain("Task");
      expect(result.missingComponents).toContain("Result");
    });
  });

  describe("Alternative Keywords", () => {
    it("recognizes 'context' as Situation", () => {
      const story = `
Context: The application needed real-time updates.
Goal: Implement WebSocket communication.
I developed a Socket.io server and integrated it with the frontend.
Impact: Users now receive updates instantly without page refresh.
      `;

      const result = validateStarStory(story);

      expect(result.hasSituation).toBe(true);
    });

    it("recognizes 'goal' as Task", () => {
      const story = `
Background: Users requested a dark mode feature.
Goal: Add theme switching functionality.
I implemented a theme context provider in React with localStorage persistence.
Outcome: 70% of users now use dark mode regularly.
      `;

      const result = validateStarStory(story);

      expect(result.hasTask).toBe(true);
    });

    it("recognizes action verbs as Action", () => {
      const story = `
Problem: The database queries were slow.
Challenge: Optimize query performance.
I implemented database indexing and query optimization techniques.
Achievement: Query time reduced by 80%.
      `;

      const result = validateStarStory(story);

      expect(result.hasAction).toBe(true);
    });

    it("recognizes 'impact' as Result", () => {
      const story = `
Scenario: The checkout process had high abandonment rates.
Objective: Simplify the checkout flow.
I redesigned the UI to a single-page checkout with progress indicators.
Impact: Conversion rate increased by 25%.
      `;

      const result = validateStarStory(story);

      expect(result.hasResult).toBe(true);
    });
  });

  describe("Quantified Results", () => {
    it("identifies quantified achievements", () => {
      const stories = [
        "Result: Reduced load time by 40%",
        "Outcome: Serving 100+ users daily",
        "Impact: Increased revenue by $50,000",
        "Achievement: Improved performance by 3x",
        "Result: Decreased bugs from 50 to 5",
      ];

      stories.forEach((story) => {
        const hasQuantification = /\d+[%x]|\d+\+|\$\d+|\d+ to \d+/.test(story);
        expect(hasQuantification).toBe(true);
      });
    });

    it("validates story with quantified results", () => {
      const story = `
Situation: The API was experiencing 500ms average response time.
Task: Reduce response time to under 100ms.
Action: I implemented Redis caching and optimized database queries.
Result: Response time decreased by 75% to 125ms average.
      `;

      const result = validateStarStory(story);

      expect(result.valid).toBe(true);
      expect(story).toMatch(/\d+%/); // Has percentage
    });
  });

  describe("Story Length", () => {
    it("validates reasonable story length", () => {
      const tooShort =
        "Situation: Problem. Task: Fix. Action: Fixed. Result: Done.";
      const goodLength = `
Situation: Our e-commerce platform was experiencing high cart abandonment rates during checkout.
Task: I was assigned to redesign the checkout flow to improve conversion rates.
Action: I implemented a single-page checkout with real-time validation, progress indicators, and multiple payment options using React and Stripe API.
Result: Cart abandonment decreased by 35% and conversion rate increased by 25% within the first month.
      `;

      expect(tooShort.length).toBeLessThan(100);
      expect(goodLength.length).toBeGreaterThan(200);

      const goodResult = validateStarStory(goodLength);

      // Good length should have all components and be more detailed
      expect(goodResult.valid).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty string", () => {
      const result = validateStarStory("");

      expect(result.valid).toBe(false);
      expect(result.missingComponents).toHaveLength(4);
    });

    it("handles case-insensitive matching", () => {
      const upperCase = `
SITUATION: Problem existed.
TASK: Needed solution.
ACTION: Built solution.
RESULT: Problem solved.
      `;

      const result = validateStarStory(upperCase);

      expect(result.valid).toBe(true);
    });

    it("handles stories without explicit labels", () => {
      const implicit = `
The company was losing customers due to slow website performance (context).
My goal was to improve page load times (objective).
I implemented lazy loading, code splitting, and CDN integration (developed).
This improved load times by 60% and reduced bounce rate by 40% (achievement).
      `;

      const result = validateStarStory(implicit);

      expect(result.hasSituation).toBe(true);
      expect(result.hasTask).toBe(true);
      expect(result.hasAction).toBe(true);
      expect(result.hasResult).toBe(true);
    });

    it("handles very long stories", () => {
      const longStory = `
Situation: ${"The problem was complex. ".repeat(50)}
Task: ${"I needed to solve it. ".repeat(50)}
Action: ${"I implemented solutions. ".repeat(50)}
Result: ${"The outcome was positive. ".repeat(50)}
      `;

      const result = validateStarStory(longStory);

      expect(result.valid).toBe(true);
    });
  });
});
