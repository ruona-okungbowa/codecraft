import { describe, it, expect } from "vitest";

// Feature: CodeCraft, Property 4: Resume Bullet Length Constraint
describe("Resume Bullet Validation", () => {
  function validateResumeBullet(bullet: string) {
    const MAX_LENGTH = 150;
    const trimmed = bullet.trim();
    const length = trimmed.length;
    const exceedsLimit = length > MAX_LENGTH;

    const actionVerbs = [
      "developed",
      "built",
      "created",
      "implemented",
      "designed",
      "optimized",
      "improved",
      "reduced",
      "increased",
      "led",
      "managed",
      "architected",
      "deployed",
      "automated",
      "integrated",
    ];

    const hasActionVerb = actionVerbs.some((verb) =>
      trimmed.toLowerCase().startsWith(verb)
    );

    const hasQuantification = /\d+[%x+]|\d+\+|\$\d+|\d+ to \d+|\d+/.test(
      trimmed
    );

    const warnings: string[] = [];
    if (exceedsLimit) warnings.push("Exceeds 150 character limit");
    if (!hasActionVerb) warnings.push("Should start with an action verb");
    if (!hasQuantification)
      warnings.push("Consider adding quantified achievements");

    return {
      valid: !exceedsLimit && hasActionVerb,
      length,
      exceedsLimit,
      hasActionVerb,
      hasQuantification,
      warnings,
    };
  }

  describe("Property 4: Character Length Constraint", () => {
    it("validates bullets under 150 characters", () => {
      const result = validateResumeBullet(
        "Developed a React dashboard that improved user engagement by 40%"
      );
      expect(result.length).toBeLessThanOrEqual(150);
      expect(result.exceedsLimit).toBe(false);
    });

    it("rejects bullets over 150 characters", () => {
      const longBullet =
        "Developed a comprehensive full-stack web application using React, Node.js, Express, PostgreSQL, and Redis that serves over 10,000 users daily and improved system performance by 50%";
      const result = validateResumeBullet(longBullet);
      expect(result.length).toBeGreaterThan(150);
      expect(result.exceedsLimit).toBe(true);
    });
  });

  describe("Action Verb Detection", () => {
    it("detects common action verbs", () => {
      const result = validateResumeBullet(
        "Developed a mobile app with React Native"
      );
      expect(result.hasActionVerb).toBe(true);
    });

    it("rejects bullets without action verbs", () => {
      const result = validateResumeBullet(
        "A project that uses React and Node.js"
      );
      expect(result.hasActionVerb).toBe(false);
    });
  });

  describe("Quantification Detection", () => {
    it("detects percentages", () => {
      const result = validateResumeBullet("Improved performance by 40%");
      expect(result.hasQuantification).toBe(true);
    });

    it("warns when no quantification present", () => {
      const result = validateResumeBullet(
        "Developed a web application using React"
      );
      expect(result.hasQuantification).toBe(false);
    });
  });
});
