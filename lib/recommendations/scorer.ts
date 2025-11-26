import { ProjectTemplate } from "@/types/recommendations";
import { matchSkills } from "./matcher";
import { MissingSkills } from "@/types/skills";

export function calculatePriorityScore(
  project: ProjectTemplate,
  userSkills: string[],
  missingSkills: MissingSkills
): {
  score: number;
  priority: "high" | "medium" | "low";
  gapsFilled: string[];
  criticalGapsAddressed: number;
} {
  let score = 0;
  const gapsFilled: string[] = [];
  let criticalGapsAddressed = 0;

  const skillMatches = matchSkills(
    project.skillsTaught,
    userSkills,
    missingSkills
  );

  for (const match of skillMatches) {
    if (match.type === "fills_gap") {
      gapsFilled.push(match.skill);

      if (match.priority === "essential") {
        score += 10;
        criticalGapsAddressed++;
      } else if (match.priority === "preferred") {
        score += 5;
      } else if (match.priority === "niceToHave") {
        score += 2;
      }
    }
  }
  let priority: "high" | "medium" | "low";
  if (score >= 20) {
    priority = "high";
  } else if (score >= 10) {
    priority = "medium";
  } else {
    priority = "low";
  }

  return {
    score,
    priority,
    gapsFilled,
    criticalGapsAddressed,
  };
}
