export interface CategoryScore {
  category: string;
  score: number;
  feedback: string;
}

export interface Feedback {
  totalScore: number;
  categoryScores: CategoryScore[];
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
}

export interface FeedbackRow {
  id: string;
  interview_id: string;
  user_id: string;
  total_score: number;
  category_scores: CategoryScore[];
  strengths: string[];
  areas_for_improvement: string[];
  final_assessment: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackRequest {
  interviewId: string;
  totalScore: number;
  categoryScores: CategoryScore[];
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
}

export interface CreateFeedbackResponse {
  success: boolean;
  feedback?: FeedbackRow;
  error?: string;
}
