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

export interface InterviewResponse {
  question: string;
  answer: string;
  questionIndex: number;
  timestamp: string;
}

export interface InterviewRow {
  id: string;
  user_id: string;
  role: string;
  type: string;
  level: string;
  tech_stack: string[];
  questions: any; // JSONB
  responses?: InterviewResponse[]; // JSONB - stores user answers
  finalised: boolean;
  created_at: string;
  updated_at: string;
}

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

export interface AgentProps {
  userName: string;
  userId: string;
  type: string;
  role?: string;
  level?: string;
}
