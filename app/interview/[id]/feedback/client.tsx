"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";

interface CategoryScore {
  category: string;
  score: number;
  feedback: string;
}

interface FeedbackData {
  id: string;
  interview_id: string;
  total_score: number;
  category_scores: CategoryScore[];
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

export default function FeedbackClient({
  interviewId,
}: {
  interviewId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [openAccordion, setOpenAccordion] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const feedbackResponse = await fetch(
          `/api/feedback?interviewId=${interviewId}`
        );
        if (feedbackResponse.ok) {
          const data = await feedbackResponse.json();
          setFeedback(data.feedback);
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-orange-600";
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 90) return "Outstanding";
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  const getPercentile = (score: number) => {
    if (score >= 90) return "Top 5%";
    if (score >= 80) return "Top 15%";
    if (score >= 70) return "Top 30%";
    if (score >= 60) return "Top 50%";
    return "Bottom 50%";
  };

  const calculateStrokeDashoffset = (score: number) => {
    const circumference = 2 * Math.PI * 54;
    return circumference - (score / 100) * circumference;
  };

  if (loading) {
    return (
      <div className="relative flex w-full min-h-screen bg-white">
        <CollapsibleSidebar />
        <main className="flex-1 p-8 ml-20 flex items-center justify-center">
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
        <CollapsibleSidebar />
        <main className="flex-1 p-8 ml-20 flex items-center justify-center">
          <p className="text-gray-500">Feedback not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex w-full min-h-screen bg-white">
      <CollapsibleSidebar />

      <main className="flex-1 p-8 md:p-12 ml-20">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {/* Page Heading */}
          <div className="flex flex-wrap justify-between gap-4 items-center">
            <h1 className="text-black text-4xl font-black leading-tight tracking-tight">
              Interview Feedback
            </h1>
          </div>

          {/* Overall Performance Card */}
          <div className="bg-white p-6 md:p-8 rounded-lg border border-slate-200">
            <h2 className="text-black text-[22px] font-bold leading-tight tracking-tight mb-6">
              Overall Performance
            </h2>
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Circular Progress */}
              <div className="relative flex justify-center items-center w-40 h-40 mx-auto">
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
                  <span className="text-black text-4xl font-bold">
                    {feedback.total_score}
                  </span>
                  <span className="text-slate-500 text-sm">/ 100</span>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="md:col-span-2 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <p className="text-black text-xl font-medium leading-normal">
                    {getPerformanceLabel(feedback.total_score)}
                  </p>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
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
            <h2 className="text-black text-[22px] font-bold leading-tight tracking-tight px-4">
              Question-by-Question Breakdown
            </h2>

            {feedback.category_scores.map((category, index) => (
              <details
                key={index}
                className="group bg-white p-6 rounded-lg border border-slate-200"
                open={openAccordion === index}
                onToggle={() =>
                  setOpenAccordion(openAccordion === index ? -1 : index)
                }
              >
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <span className="text-slate-800 font-medium">
                    {index + 1}. {category.category}
                  </span>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-medium ${getScoreColor(category.score)}`}
                    >
                      {category.score}/100
                    </span>
                    <span className="material-symbols-outlined text-slate-500 transition-transform duration-300 group-open:rotate-180">
                      expand_more
                    </span>
                  </div>
                </summary>
                <div className="mt-6 flex flex-col gap-4">
                  <div className="border-t border-slate-200 pt-4">
                    <h3 className="font-semibold text-slate-800 mb-2">
                      AI Feedback
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed p-4 bg-slate-50 rounded">
                      {category.feedback}
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </div>

          {/* Areas for Improvement & Recommended Actions */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Areas for Improvement */}
            <div className="bg-white p-6 md:p-8 rounded-lg border border-slate-200">
              <h2 className="text-black text-[22px] font-bold leading-tight tracking-tight mb-6">
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
                        className={`h-2 rounded-full ${
                          category.score >= 80
                            ? "bg-green-500"
                            : category.score >= 60
                              ? "bg-amber-500"
                              : "bg-orange-500"
                        }`}
                        style={{ width: `${category.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="bg-white p-6 md:p-8 rounded-lg border border-slate-200">
              <h2 className="text-black text-[22px] font-bold leading-tight tracking-tight mb-6">
                Recommended Actions
              </h2>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push(`/interview/${interviewId}`)}
                  className="w-full flex items-center justify-center gap-2 text-center bg-blue-600 text-white font-medium py-3 px-4 rounded hover:bg-blue-700 transition-colors duration-200"
                >
                  <span className="material-symbols-outlined">refresh</span>
                  Practice Again
                </button>
                <button
                  onClick={() => router.push("/projects")}
                  className="w-full flex items-center justify-center gap-2 text-center bg-slate-100 text-slate-800 font-medium py-3 px-4 rounded hover:bg-slate-200 transition-colors duration-200"
                >
                  <span className="material-symbols-outlined">
                    folder_managed
                  </span>
                  Review Projects
                </button>
                <button
                  onClick={() => router.push("/mock-interview")}
                  className="w-full flex items-center justify-center gap-2 text-center bg-slate-100 text-slate-800 font-medium py-3 px-4 rounded hover:bg-slate-200 transition-colors duration-200"
                >
                  <span className="material-symbols-outlined">
                    psychology_alt
                  </span>
                  Strengthen Answers
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
