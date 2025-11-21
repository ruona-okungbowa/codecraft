// Interview types for voice interview simulator

export interface Interview {
  id: string;
  userId: string;
  role: string;
  type: string;
  level: string;
  techStack: string[];
  questions: InterviewQuestion[];
  finalised: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  id?: string;
  question: string;
  category?: string;
  difficulty?: string;
  expectedAnswer?: string;
}

// Database row type (snake_case to match Supabase)
export interface InterviewRow {
  id: string;
  user_id: string;
  role: string;
  type: string;
  level: string;
  tech_stack: string[];
  questions: any; // JSONB
  finalised: boolean;
  created_at: string;
  updated_at: string;
}

// Request/Response types
export interface CreateInterviewRequest {
  role: string;
  type: string;
  level: string;
  techStack: string[];
  questions: InterviewQuestion[];
}

export interface CreateInterviewResponse {
  success: boolean;
  interview?: Interview;
  error?: string;
}
