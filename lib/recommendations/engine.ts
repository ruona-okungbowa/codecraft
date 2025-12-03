import {
  ProjectTemplate,
  ProjectRecommendation,
} from "@/types/recommendations";
import { SkillGapAnalysis } from "@/types/skills";
import { calculatePriorityScore } from "./scorer";
import projectTemplatesData from "@/lib/data/project-templates.json";
import { matchSkills } from "./matcher";
import { fetchRoadmapProjects } from "./roadmap-fetcher";

function loadProjectTemplates(): ProjectTemplate[] {
  const templates = projectTemplatesData.templates as ProjectTemplate[];

  return templates.filter((t) => t.id && t.name && t.skillsTaught.length > 0);
}

/**
 * Load project templates from both local JSON and roadmap.sh
 */
async function loadAllProjectTemplates(
  role: string,
  useLiveData = true
): Promise<ProjectTemplate[]> {
  const localTemplates = loadProjectTemplates();

  if (!useLiveData) {
    return localTemplates;
  }

  try {
    // Fetch fresh projects from roadmap.sh
    const roadmapProjects = await fetchRoadmapProjects(role);

    // Merge and deduplicate by ID
    const allProjects = [...localTemplates];
    const existingIds = new Set(localTemplates.map((t) => t.id));

    roadmapProjects.forEach((project) => {
      if (!existingIds.has(project.id)) {
        allProjects.push(project);
      }
    });

    return allProjects;
  } catch (error) {
    // Silently fall back to local templates - don't propagate error
    console.warn("Using local project templates only");
    return localTemplates;
  }
}

/**
 * Generate recommendations synchronously using local templates only
 * @deprecated Use generateRecommendationsAsync for live roadmap.sh data
 */
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

/**
 * Generate recommendations with optional live data from roadmap.sh
 */
export async function generateRecommendationsAsync(
  skillGapAnalysis: SkillGapAnalysis,
  useLiveData = true
): Promise<ProjectRecommendation[]> {
  const templates = await loadAllProjectTemplates(
    skillGapAnalysis.role,
    useLiveData
  );
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
