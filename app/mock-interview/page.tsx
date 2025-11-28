"use client";

import { useRouter } from "next/navigation";
import { Newsreader, Sansation } from "next/font/google";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  showSuccess,
  showError,
  showLoading,
  dismissToast,
} from "@/lib/utils/toast";
import { Mic, ArrowRight, Loader2, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { InterviewRow } from "@/types/interview";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

interface InterviewWithFeedback extends InterviewRow {
  feedback?: {
    total_score: number;
  };
  hasResponses?: boolean;
}

const InterviewPage = () => {
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewWithFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    fetchInterviews();
    fetchUserName();
  }, []);

  async function fetchUserName() {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setUserName(data.first_name || data.github_username || "");
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  }

  async function fetchInterviews() {
    const toastId = showLoading("Loading interviews...");
    try {
      const response = await fetch("/api/interviews");
      if (response.ok) {
        const data = await response.json();
        dismissToast(toastId);
        const interviewsData = data.interviews || [];

        const interviewsWithFeedback = await Promise.all(
          interviewsData.map(async (interview: InterviewRow) => {
            try {
              const feedbackResponse = await fetch(
                `/api/feedback?interviewId=${interview.id}`
              );
              const hasResponses =
                interview.responses && interview.responses.length > 0;

              if (feedbackResponse.ok) {
                const feedbackData = await feedbackResponse.json();
                return {
                  ...interview,
                  feedback: feedbackData.feedback,
                  hasResponses,
                };
              }
              return { ...interview, hasResponses };
            } catch {
              return {
                ...interview,
                hasResponses:
                  interview.responses && interview.responses.length > 0,
              };
            }
          })
        );

        setInterviews(interviewsWithFeedback);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
      dismissToast(toastId);
      showError("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="ml-0 md:ml-[72px] flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 md:px-10 py-4 md:py-6 pl-16 md:pl-10">
            <h1
              className={`text-xl md:text-[28px] font-bold text-gray-900 ${newsreader.className}`}
            >
              Mock Interview
              {userName && (
                <span className="text-gray-500 font-normal text-xl ml-2">
                  - Welcome, {userName}
                </span>
              )}
            </h1>
            <p className={`text-sm text-gray-600 mt-1 ${sansation.className}`}>
              Prepare for your next interview with AI-powered practice sessions
            </p>
          </div>
        </header>

        <main className="px-10 py-8 max-w-[1400px] mx-auto">
          {/* Generate Interview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Mic size={24} className="text-blue-600" />
                </div>
                <h2
                  className={`text-xl font-bold text-gray-900 ${newsreader.className}`}
                >
                  Ready to Practice?
                </h2>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/interview")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <span>Generate Interview</span>
                <ArrowRight size={18} />
              </motion.button>
            </div>
          </motion.div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-xl font-bold text-gray-900 ${newsreader.className}`}
              >
                Generated Interviews
              </h2>
              {interviews.length > 0 && (
                <span className="text-sm text-gray-500">
                  {interviews.length} interview
                  {interviews.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader2
                  size={48}
                  className="text-gray-400 animate-spin mx-auto mb-4"
                />
                <p className="text-gray-500">Loading interviews...</p>
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-12">
                <Mic size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No interviews yet</p>
                <p className="text-sm text-gray-400">
                  Generate your first interview to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {interviews.map((interview, index) => (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer overflow-hidden group"
                    onClick={() => router.push(`/interview/${interview.id}`)}
                  >
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full capitalize">
                        {interview.type}
                      </span>
                    </div>

                    <div className="mb-6 mt-2">
                      <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Mic size={36} className="text-white" />
                      </div>
                    </div>

                    <h3
                      className={`text-xl font-bold text-gray-900 mb-4 ${newsreader.className}`}
                    >
                      {interview.role}
                    </h3>

                    <div className="flex items-center gap-4 mb-4 text-gray-600 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Clock size={16} />
                        <span>{formatTimeAgo(interview.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle
                          size={16}
                          className={
                            interview.feedback
                              ? "text-green-600"
                              : "text-gray-400"
                          }
                        />
                        <span
                          className={
                            interview.feedback
                              ? "font-semibold text-green-600"
                              : ""
                          }
                        >
                          {interview.feedback
                            ? `${interview.feedback.total_score}/100`
                            : "--/100"}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {interview.feedback
                        ? "Interview completed! Click to view feedback and retake."
                        : interview.hasResponses
                          ? "Interview in progress. Continue or view partial results."
                          : "Interview ready to start. Click to begin your practice session."}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {interview.tech_stack &&
                          interview.tech_stack.slice(0, 3).map((tech) => (
                            <div
                              key={tech}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 border border-gray-300"
                              title={tech}
                            >
                              {tech.charAt(0).toUpperCase()}
                            </div>
                          ))}
                        {interview.tech_stack &&
                          interview.tech_stack.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600 border border-gray-300">
                              +{interview.tech_stack.length - 3}
                            </div>
                          )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (interview.feedback) {
                            router.push(`/interview/${interview.id}/feedback`);
                          } else {
                            router.push(`/interview/${interview.id}`);
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-colors group-hover:scale-105 transform shadow-md"
                      >
                        {interview.feedback
                          ? "View Feedback"
                          : "Start Interview"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default InterviewPage;
