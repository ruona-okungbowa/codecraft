"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Newsreader, Sansation } from "next/font/google";
import { motion } from "framer-motion";
import {
  Loader2,
  Star,
  Calendar,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  CheckCircle,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

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

export default function FeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [interviewId, setInterviewId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [interview, setInterview] = useState<InterviewData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params;
      setInterviewId(resolvedParams.id);

      try {
        const feedbackResponse = await fetch(
          `/api/feedback?interviewId=${resolvedParams.id}`
        );
        if (feedbackResponse.ok) {
          const data = await feedbackResponse.json();
          setFeedback(data.feedback);
        } else {
          router.push("/mock-interview");
          return;
        }

        const interviewResponse = await fetch(
          `/api/interviews/${resolvedParams.id}`
        );
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
  }, [params, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="ml-0 md:ml-[72px] flex-1 flex items-center justify-center">
          <Loader2 size={48} className="text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!feedback || !interview) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="ml-0 md:ml-[72px] flex-1 flex items-center justify-center">
          <p className="text-gray-500">Feedback not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="ml-0 md:ml-[72px] flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-10 py-6">
            <button
              onClick={() => router.push("/mock-interview")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to Interviews</span>
            </button>
            <h1
              className={`text-[28px] font-bold text-gray-900 ${newsreader.className}`}
            >
              Feedback on the Interview — {interview.role}
            </h1>
            <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-blue-600" />
                <span
                  className={`font-semibold ${getScoreColor(feedback.total_score)}`}
                >
                  Overall Impression: {feedback.total_score}/100
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-500" />
                <span>{formatDate(feedback.created_at)}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="px-10 py-8 max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <p
                className={`text-gray-700 leading-relaxed ${sansation.className}`}
              >
                {feedback.final_assessment}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <h2
                className={`text-2xl font-bold text-gray-900 mb-6 ${newsreader.className}`}
              >
                Breakdown of Evaluation:
              </h2>

              <div className="space-y-6">
                {feedback.category_scores.map((category, index) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {index + 1}. {category.category}
                      </h3>
                      <div
                        className={`px-3 py-1 rounded-full ${getScoreBgColor(category.score)} ${getScoreColor(category.score)} font-bold text-sm`}
                      >
                        {category.score}/100
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {category.feedback}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp size={20} className="text-green-600" />
                  </div>
                  <h2
                    className={`text-xl font-bold text-gray-900 ${newsreader.className}`}
                  >
                    Strengths
                  </h2>
                </div>
                <ul className="space-y-3">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle
                        size={20}
                        className="text-green-600 shrink-0 mt-0.5"
                      />
                      <span className="text-gray-700 leading-relaxed">
                        {strength}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <TrendingDown size={20} className="text-orange-600" />
                  </div>
                  <h2
                    className={`text-xl font-bold text-gray-900 ${newsreader.className}`}
                  >
                    Areas for Improvement
                  </h2>
                </div>
                <ul className="space-y-3">
                  {feedback.areas_for_improvement.map((area, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-orange-600 shrink-0 mt-0.5" />
                      <span className="text-gray-700 leading-relaxed">
                        {area}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => router.push(`/interview/${interviewId}`)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md"
              >
                Retake Interview
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
