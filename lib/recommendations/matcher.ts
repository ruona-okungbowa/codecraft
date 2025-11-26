import type { SkillMatch } from "@/types/recommendations";
import type { MissingSkills } from "@/types/skills";

function normaliseSkill(skill: string): string {
  return skill.toLowerCase().trim();
}

function skillsMatch(skill1: string, skill2: string): boolean {
  const norm1 = normaliseSkill(skill1);
  const norm2 = normaliseSkill(skill2);

  if (norm1 === norm2) return true;

  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;

  const variations: Record<string, string[]> = {
    javascript: ["js", "javascript"],
    typescript: ["ts", "typescript"],
    "node.js": ["node", "nodejs", "node.js"],
    react: ["react", "reactjs", "react.js"],
    vue: ["vue", "vuejs", "vue.js"],
    docker: ["docker", "containerization"],
    kubernetes: ["kubernetes", "k8s"],
  };

  for (const [key, values] of Object.entries(variations)) {
    if (values.includes(norm1) && values.includes(norm2)) {
      return true;
    }
  }

  return false;
}

export function matchSkills(
  projectSkills: string[],
  userSkills: string[],
  missingSkills: MissingSkills
): SkillMatch[] {
  const matches: SkillMatch[] = [];
  for (const projectSkill of projectSkills) {
    const hasSkill = userSkills.some((userSkill) =>
      skillsMatch(projectSkill, userSkill)
    );
    if (hasSkill) {
      matches.push({
        skill: projectSkill,
        type: "reinforces",
      });
      continue;
    }

    const fillsEssential = missingSkills.essential.some((missing) =>
      skillsMatch(projectSkill, missing)
    );

    if (fillsEssential) {
      matches.push({
        skill: projectSkill,
        type: "fills_gap",
        priority: "essential",
      });
      continue;
    }

    const fillsPreferred = missingSkills.preferred.some((missing) =>
      skillsMatch(projectSkill, missing)
    );

    if (fillsPreferred) {
      matches.push({
        skill: projectSkill,
        type: "fills_gap",
        priority: "preferred",
      });
      continue;
    }
    const fillsNiceToHave = missingSkills.niceToHave.some((missing) =>
      skillsMatch(projectSkill, missing)
    );

    if (fillsNiceToHave) {
      matches.push({
        skill: projectSkill,
        type: "fills_gap",
        priority: "niceToHave",
      });
      continue;
    }
    matches.push({
      skill: projectSkill,
      type: "new",
    });
  }
  return matches;
}
