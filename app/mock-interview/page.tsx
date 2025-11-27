"use client";

import { useRouter } from "next/navigation";
import { Newsreader, Sansation } from "next/font/google";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  Mic,
  ArrowRight,
  Loader2,
  Clock,
  CheckCircle,
  Play,
} from "lucide-react";
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

const InterviewPage = () => {
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  async function fetchInterviews() {
    try {
      const response = await fetch("/api/interviews");
      if (response.ok) {
        const data = await response.json();
        setInterviews(data.interviews || []);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
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

      <div className="ml-[72px] flex-1">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-10 py-6">
            <h1
              className={`text-[28px] font-bold text-gray-900 ${newsreader.className}`}
            >
              Mock Interview
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

          {/* Previous Interviews Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-xl font-bold text-gray-900 ${newsreader.className}`}
              >
                Previous Interviews
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interviews.map((interview, index) => (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => router.push(`/interview?id=${interview.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, #f97316, #ef4444)",
                        }}
                      >
                        <Mic size={20} className="text-white" />
                      </div>
                      {interview.finalised && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          <CheckCircle size={12} />
                          <span>Complete</span>
                        </div>
                      )}
                    </div>

                    <h3
                      className={`font-semibold text-gray-900 mb-2 ${newsreader.className}`}
                    >
                      {interview.role}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="font-medium">Level:</span>
                        <span className="capitalize">{interview.level}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="font-medium">Type:</span>
                        <span className="capitalize">{interview.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="font-medium">Questions:</span>
                        <span>
                          {Array.isArray(interview.questions)
                            ? interview.questions.length
                            : 0}
                        </span>
                      </div>
                    </div>

                    {interview.tech_stack &&
                      interview.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {interview.tech_stack.slice(0, 3).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                          {interview.tech_stack.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                              +{interview.tech_stack.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{formatTimeAgo(interview.created_at)}</span>
                      </div>
                      <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                        <Play size={12} />
                        <span>Start</span>
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
