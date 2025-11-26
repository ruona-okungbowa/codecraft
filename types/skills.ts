export type Role = "frontend" | "backend" | "fullstack" | "devops";

export interface Requirements {
  title: string;
  essential: string[];
  preferred: string[];
  niceToHave: string[];
}

export type skillCategory = "essential" | "preferred" | "niceToHave";

export interface MissingSkills {
  essential: string[];
  preferred: string[];
  niceToHave: string[];
}

export interface UserSkills {
  userId: string;
  skills: string[];
  analysedAt: Date;
}

export interface SkillAnalysis {
  role: Role;
  presentSkills: string[];
  missingSkills: MissingSkills;
  coveragePercentage: number;
}

// Alias for consistency with API responses
export type SkillGapAnalysis = SkillAnalysis;
