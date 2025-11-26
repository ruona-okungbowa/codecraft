import {
  ProjectTemplate,
  ProjectRecommendation,
} from "@/types/recommendations";
import { SkillGapAnalysis } from "@/types/skills";
import { calculatePriorityScore } from "./scorer";
import projectTemplatesData from "@/lib/data/project-templates.json";
import { matchSkills } from "./matcher";

function loadProjectTemplates(): ProjectTemplate[] {
  const templates = projectTemplatesData.templates as ProjectTemplate[];

  return templates.filter((t) => t.id && t.name && t.skillsTaught.length > 0);
}

export function generateRecommendations(
  skillGapAnalysis: SkillGapAnalysis
): ProjectRecommendation[] {
  const templates = loadProjectTemplates();
  const recommendations: ProjectRecommendation[] = [];

  const { presentSkills, missingSkills } = skillGapAnalysis;

  for (const template of templates) {
    const scoreResult = calculatePriorityScore(
      template,
      presentSkills,
      missingSkills
    );

    if (scoreResult.gapsFilled.length === 0) {
      scoreResult.priority = "low";
      scoreResult.score = 1;
    }

    const skillMatches = matchSkills(
      template.skillsTaught,
      presentSkills,
      missingSkills
    );
    const recommendation: ProjectRecommendation = {
      ...template,
      priorityScore: scoreResult.score,
      priority: scoreResult.priority,
      gapsFilled: scoreResult.gapsFilled,
      skillMatches,
      criticalGapsAddressed: scoreResult.criticalGapsAddressed,
    };

    recommendations.push(recommendation);
  }
  recommendations.sort((a, b) => b.priorityScore - a.priorityScore);

  return recommendations;
}
