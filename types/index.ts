export interface User {
  id: string;
  githubId: number;
  githubUsername: string;
  email?: string;
  avatarUrl?: string;
  targetRole?: "frontend" | "backend" | "fullstack" | "devops";
  createdAt: Date;
  updatedAt: Date;
}
export interface Project {
  id: string;
  userId: string;
  githubRepoId: number;
  name: string;
  description?: string;
  url: string;
  languages: Record<string, number>;
  stars: number;
  forks: number;
  lastCommitDate?: Date;
  complexityScore?: number;
  analysedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedContent {
  id: string;
  projectId: string;
  contentType: "story" | "bullet" | "readme" | "linkedin";
  content: string;
  metadata?: {
    wordCount?: number;
    tone?: string;
    version?: number;
  };
  createdAt: Date;
}

export interface PortfolioScore {
  id: string;
  userId: string;
  overallScore: number;
  projectQualityScore?: number;
  techDiversityScore?: number;
  documentationScore?: number;
  consistencyScore?: number;
  breakdown?: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  calculatedAt: Date;
}

export interface SkillGap {
  id: string;
  userId: string;
  targetRole: string;
  presentSkills: string[];
  missingSkills: string[];
  gapPriority: {
    essential: string[];
    preferred: string[];
    niceToHave: string[];
  };
  analyzedAt: Date;
}

export interface ProjectRecommendation {
  id: string;
  userId: string;
  projectName: string;
  description: string;
  techStack: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  timeEstimate: string;
  gapsFilled: string[];
  learningResources: {
    title: string;
    url: string;
    type: "tutorial" | "docs" | "video" | "article";
  }[];
  priority: number;
  status: "suggested" | "in_progress" | "completed";
  createdAt: Date;
}

export interface MockInterview {
  id: string;
  userId: string;
  projectId: string;
  questions: string[];
  answers: string[];
  feedback: {
    question: string;
    answer: string;
    score: number;
    strengths: string[];
    improvements: string[];
  }[];
  overallScore: number;
  completedAt: Date;
}

export interface Interview {
  id: string;
  user_id: string;
  role: string;
  type: string;
  level: string;
  techstack: string[];
  questions: InterviewQuestion[];
  finalised: boolean;
  created_at: string;
  updated_at?: string;
}

export interface InterviewQuestion {
  question: string;
  type?: string;
  difficulty?: string;
  expectedAnswer?: string;
  hints?: string[];
}

export interface JobMatch {
  id: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendedProjects: string[];
  createdAt: Date;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    retryable: boolean;
  };
}

export interface UserRow {
  id: string;
  github_id: number;
  github_username: string;
  email?: string;
  avatar_url?: string;
  target_role?: string;
  first_name?: string;
  last_name?: string;
  github_token?: string;
  token_updated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectRow {
  id: string;
  user_id: string;
  github_repo_id: number;
  name: string;
  description?: string;
  url: string;
  languages?: Record<string, number>;
  stars: number;
  forks: number;
  last_commit_date?: string;
  complexity_score?: number;
  analysed_at?: string;
  created_at: string;
  updated_at: string;
  in_portfolio?: boolean;
  // Enriched fields from API
  has_story?: boolean;
  has_bullets?: boolean;
  has_readme?: boolean;
  content_count?: number;
}

export type DbToApp<T> = {
  [K in keyof T as K extends string
    ? K extends `${infer Start}_${infer Rest}`
      ? `${Start}${Capitalize<Rest>}`
      : K
    : K]: T[K];
};
