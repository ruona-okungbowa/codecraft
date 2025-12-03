"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import MobileNav from "@/components/MobileNav";
import {
  getScoreColor,
  getScoreBackgroundColor,
  getPerformanceLabel,
  getPercentile,
} from "@/lib/utils/scoring";

interface CategoryScore {
  category: string;
  score: number;
  feedback: string;
}

interface QuestionBreakdown {
  questionNumber: number;
  question: string;
  score: number;
  whatWentWell: string;
  whatToImprove: string;
  improvementTips: string[];
}

interface FeedbackData {
  id: string;
  interview_id: string;
  attempt_number: number;
  total_score: number;
  category_scores: CategoryScore[];
  question_breakdown: QuestionBreakdown[];
  strengths: string[];
  areas_for_improvement: string[];
  final_assessment: string;
  created_at: string;
}

interface InterviewData {
  role: string;
  level: string;
  type: string;
  created_at: string;
}

export default function FeedbackPage() {
  const router = useRouter();
  const params = useParams();
  const interviewId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [allAttempts, setAllAttempts] = useState<FeedbackData[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<number>(1);
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [openAccordion, setOpenAccordion] = useState<number>(-1);

  useEffect(() => {
    if (!interviewId) return;

    const loadData = async () => {
      try {
        const feedbackResponse = await fetch(
          `/api/feedback?interviewId=${interviewId}`
        );
        if (feedbackResponse.ok) {
          const data = await feedbackResponse.json();
          setFeedback(data.feedback);
          setAllAttempts(data.allAttempts || [data.feedback]);
          setSelectedAttempt(data.feedback.attempt_number);
        } else {
          router.push("/mock-interview");
          return;
        }

        const interviewResponse = await fetch(`/api/interviews/${interviewId}`);
        if (interviewResponse.ok) {
          const data = await interviewResponse.json();
          setInterview(data.interview);
        }
      } catch (error) {
        console.error("Error loading feedback:", error);
        router.push("/mock-interview");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [interviewId, router]);

  const calculateStrokeDashoffset = useCallback((score: number) => {
    const circumference = 2 * Math.PI * 54;
    return circumference - (score / 100) * circumference;
  }, []);

  if (loading) {
    return (
      <div className="relative flex w-full min-h-screen bg-white">
        <MobileNav />
        <CollapsibleSidebar />
        <main className="pt-16 md:pt-0 flex-1 p-4 sm:p-8 ml-0 md:ml-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading feedback...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!feedback || !interview) {
    return (
      <div className="relative flex w-full min-h-screen bg-white">
        <MobileNav />
        <CollapsibleSidebar />
        <main className="pt-16 md:pt-0 flex-1 p-4 sm:p-8 ml-0 md:ml-20 flex items-center justify-center">
          <p className="text-gray-500">Feedback not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex w-full min-h-screen bg-white">
      <MobileNav />
      <CollapsibleSidebar />

      {/* Back Button - Fixed in top left, below mobile nav on small screens */}
      <div className="fixed top-20 left-4 md:top-8 md:left-28 z-60">
        <button
          onClick={() => router.push("/mock-interview")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors bg-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-sm border border-slate-200"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="font-medium text-sm md:text-base hidden sm:inline">
            Back to Interviews
          </span>
        </button>
      </div>

      <main className="pt-20 md:pt-0 flex-1 p-4 sm:p-6 md:p-8 lg:p-12 ml-0 md:ml-20">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {/* Page Heading */}
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-black text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight text-center">
              Interview Feedback
            </h1>

            {/* Attempt Selector */}
            {allAttempts.length > 1 && (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <span className="text-sm text-slate-600 font-medium">
                  Attempt:
                </span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {allAttempts.map((attempt) => (
                    <button
                      key={attempt.id}
                      onClick={() => {
                        setSelectedAttempt(attempt.attempt_number);
                        setFeedback(attempt);
                      }}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        selectedAttempt === attempt.attempt_number
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      #{attempt.attempt_number}
                      <span className="ml-2 text-xs sm:text-sm opacity-75">
                        ({attempt.total_score})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Overall Performance Card */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg border border-slate-200">
            <h2 className="text-black text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-tight mb-4 sm:mb-6">
              Overall Performance
            </h2>
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8 items-center">
              {/* Circular Progress */}
              <div className="relative flex justify-center items-center w-32 h-32 sm:w-40 sm:h-40 mx-auto">
                <svg
                  className="transform -rotate-90"
                  width="100%"
                  height="100%"
                  viewBox="0 0 120 120"
                >
                  <circle
                    className="stroke-slate-200"
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    strokeWidth="12"
                  />
                  <circle
                    className="stroke-blue-600"
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    strokeWidth="12"
                    strokeDasharray="339.29"
                    strokeDashoffset={calculateStrokeDashoffset(
                      feedback.total_score
                    )}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-black text-3xl sm:text-4xl font-bold">
                    {feedback.total_score}
                  </span>
                  <span className="text-slate-500 text-xs sm:text-sm">
                    / 100
                  </span>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="md:col-span-2 flex flex-col gap-3 text-center md:text-left">
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-3">
                  <p className="text-black text-lg sm:text-xl font-medium leading-normal">
                    {getPerformanceLabel(feedback.total_score)}
                  </p>
                  <span className="px-3 py-1 text-xs sm:text-sm font-medium rounded-full bg-green-100 text-green-800">
                    {getPercentile(feedback.total_score)}
                  </span>
                </div>
                <p className="text-slate-600 text-sm font-normal leading-relaxed">
                  {feedback.final_assessment}
                </p>
              </div>
            </div>
          </div>

          {/* Question-by-Question Breakdown */}
          <div className="flex flex-col gap-4">
            <h2 className="text-black text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-tight px-2 sm:px-4">
              Question-by-Question Breakdown
            </h2>

            {feedback.question_breakdown?.map((question, index) => (
              <details
                key={index}
                className="group bg-white p-4 sm:p-6 rounded-lg border border-slate-200"
                open={openAccordion === index}
                onToggle={(e) => {
                  e.preventDefault();
                  setOpenAccordion(openAccordion === index ? -1 : index);
                }}
              >
                <summary className="flex justify-between items-start cursor-pointer list-none">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-blue-600 font-semibold text-xs sm:text-sm">
                        Question {question.questionNumber}
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-medium ${getScoreColor(question.score)}`}
                      >
                        {question.score}/100
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium text-sm sm:text-base">
                      {question.question}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-slate-500 transition-transform duration-300 group-open:rotate-180 ml-2 shrink-0">
                    expand_more
                  </span>
                </summary>
                <div className="mt-6 flex flex-col gap-4">
                  {/* What Went Well */}
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-green-600 text-xl">
                        check_circle
                      </span>
                      <h3 className="font-semibold text-slate-800">
                        What Went Well
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed p-4 bg-green-50 rounded">
                      {question.whatWentWell}
                    </p>
                  </div>

                  {/* What to Improve */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-amber-600 text-xl">
                        info
                      </span>
                      <h3 className="font-semibold text-slate-800">
                        What to Improve
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed p-4 bg-amber-50 rounded">
                      {question.whatToImprove}
                    </p>
                  </div>

                  {/* Improvement Tips */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-blue-600 text-xl">
                        lightbulb
                      </span>
                      <h3 className="font-semibold text-slate-800">
                        Tips for Improvement
                      </h3>
                    </div>
                    <ul className="text-sm text-slate-600 leading-relaxed p-4 bg-blue-50 rounded space-y-2">
                      {question.improvementTips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            ))}
          </div>

          {/* Areas for Improvement & Recommended Actions */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Areas for Improvement */}
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg border border-slate-200">
              <h2 className="text-black text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-tight mb-4 sm:mb-6">
                Areas for Improvement
              </h2>
              <div className="flex flex-col gap-4">
                {feedback.category_scores.map((category, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <p className="text-slate-800 text-sm font-medium">
                      {category.category}
                    </p>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getScoreBackgroundColor(category.score)}`}
                        style={{ width: `${category.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg border border-slate-200">
              <h2 className="text-black text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-tight mb-4 sm:mb-6">
                Recommended Actions
              </h2>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push(`/interview/${interviewId}`)}
                  className="w-full flex items-center justify-center gap-2 text-center bg-blue-600 text-white font-medium py-3 px-4 rounded hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
                >
                  <span className="material-symbols-outlined text-xl">
                    refresh
                  </span>
                  Practice Again
                </button>
                <button
                  onClick={() => router.push("/projects")}
                  className="w-full flex items-center justify-center gap-2 text-center bg-slate-100 text-slate-800 font-medium py-3 px-4 rounded hover:bg-slate-200 transition-colors duration-200 text-sm sm:text-base"
                >
                  <span className="material-symbols-outlined text-xl">
                    folder_managed
                  </span>
                  Review Projects
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
