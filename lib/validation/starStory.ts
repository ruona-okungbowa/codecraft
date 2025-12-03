/**
 * STAR Story Validation
 * Validates that a story contains all four STAR components:
 * - Situation: Context or background
 * - Task: Goal or objective
 * - Action: What was implemented
 * - Result: Outcome or impact
 */

export interface StarStoryValidation {
  valid: boolean;
  hasSituation: boolean;
  hasTask: boolean;
  hasAction: boolean;
  hasResult: boolean;
  missingComponents: string[];
  hasQuantifiedResults?: boolean;
}

/**
 * Validates a STAR story for completeness
 * @param story - The story text to validate
 * @returns Validation result with component breakdown
 */
export function validateStarStory(story: string): StarStoryValidation {
  const lowerStory = story.toLowerCase();

  const hasSituation =
    lowerStory.includes("situation") ||
    /\b(context|background|scenario|problem)\b/.test(lowerStory);

  const hasTask =
    lowerStory.includes("task") ||
    /\b(goal|objective|challenge|requirement)\b/.test(lowerStory);

  const hasAction =
    lowerStory.includes("action") ||
    /\b(implemented|built|developed|created|designed|architected|optimized|refactored|integrated|deployed|configured|automated)\b/.test(
      lowerStory
    );

  const hasResult =
    lowerStory.includes("result") ||
    /\b(outcome|achievement|impact|improved|increased|reduced|decreased)\b/.test(
      lowerStory
    );

  const missingComponents: string[] = [];
  if (!hasSituation) missingComponents.push("Situation");
  if (!hasTask) missingComponents.push("Task");
  if (!hasAction) missingComponents.push("Action");
  if (!hasResult) missingComponents.push("Result");

  const hasQuantifiedResults = /\d+[%x]|\d+\+|\$\d+|\d+ to \d+/.test(story);

  return {
    valid: hasSituation && hasTask && hasAction && hasResult,
    hasSituation,
    hasTask,
    hasAction,
    hasResult,
    missingComponents,
    hasQuantifiedResults,
  };
}

/**
 * Gets a human-readable summary of validation issues
 */
export function getStarValidationSummary(
  validation: StarStoryValidation
): string {
  if (validation.valid) {
    return validation.hasQuantifiedResults
      ? "Complete STAR story with quantified results"
      : "Complete STAR story (consider adding quantified results)";
  }

  return `Missing components: ${validation.missingComponents.join(", ")}`;
}
