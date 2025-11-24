// Database Types for GitStory

// User (matches your users table structure)
export interface User {
  id: string; // Supabase Auth user ID (primary key, references auth.users)
  githubId: number;
  githubUsername: string;
  email?: string;
  avatarUrl?: string;
  targetRole?: "frontend" | "backend" | "fullstack" | "devops";
  createdAt: Date;
  updatedAt: Date;
}

// Project (matches your projects table)
export interface Project {
  id: string;
  userId: string; // References users.id
  githubRepoId: number;
  name: string;
  description?: string;
  url: string;
  languages: Record<string, number>; // language: percentage
  stars: number;
  forks: number;
  lastCommitDate?: Date;
  complexityScore?: number;
  analysedAt?: Date; // British spelling to match DB column
  createdAt: Date;
  updatedAt: Date;
}

// Generated Content
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

// Portfolio Score (matches your portfolio_scores table)
export interface PortfolioScore {
  id: string;
  userId: string; // References users.id
  overallScore: number; // 0-100
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

// Skill Gap
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

// Project Recommendation
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

// Mock Interview
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

// Job Match
export interface JobMatch {
  id: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendedProjects: string[]; // Project IDs to highlight
  createdAt: Date;
}

// API Error Response
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    retryable: boolean;
  };
}

// Database row types (snake_case to match actual DB columns)
// Use these when working directly with Supabase queries
export interface UserRow {
  id: string; // Supabase Auth user ID
  github_id: number;
  github_username: string;
  email?: string;
  avatar_url?: string;
  target_role?: string;
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
  // Enriched fields from API
  has_story?: boolean;
  has_bullets?: boolean;
  has_readme?: boolean;
  content_count?: number;
}

// Helper type to convert DB rows to app types
export type DbToApp<T> = {
  [K in keyof T as K extends string
    ? K extends `${infer Start}_${infer Rest}`
      ? `${Start}${Capitalize<Rest>}`
      : K
    : K]: T[K];
};
