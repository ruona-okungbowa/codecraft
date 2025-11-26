import type { Role } from "./skills";

export interface SkillMatch {
  skill: string;
  type: "new" | "fills_gap" | "reinforces";
  priority?: "essential" | "preferred" | "niceToHave";
}

export interface LearningResource {
  title: string;
  url: string;
  type: "tutorial" | "docs" | "video" | "article" | "example";
  provider?: string;
  duration?: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  timeEstimate: string;
  skillsTaught: string[];
  category: "frontend" | "backend" | "fullstack" | "devops" | "mobile" | "";
  features: string[];
  learningResources: LearningResource[];
}

export interface ProjectRecommendation extends ProjectTemplate {
  priorityScore: number;
  priority: "high" | "medium" | "low";
  gapsFilled: string[];
  skillMatches: SkillMatch[];
  criticalGapsAddressed: number;
}

export interface FilterState {
  difficulty: "all" | "beginner" | "intermediate" | "advanced";
  category: "all" | "frontend" | "backend" | "fullstack" | "devops" | "mobile";
  timeCommitment: "all" | "weekend" | "week" | "extended";
  skills: string[];
  sortBy: "priority" | "difficulty" | "time" | "skills";
}

export interface UserProject {
  id: string;
  userId: string;
  projectId: string;
  status: "saved" | "in_progress" | "completed";
  progress: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectProgress {
  projectId: string;
  status: "saved" | "in_progress" | "completed";
  progress: number;
}
