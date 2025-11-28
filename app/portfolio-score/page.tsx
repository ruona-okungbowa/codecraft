"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Award, Target, Sparkles } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { celebrateScoreImprovement } from "@/lib/utils/confetti";
import { showSuccess } from "@/lib/utils/toast";

export default function PortfolioScorePage() {
  const [score, setScore] = useState<number | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScore();
  }, []);

  async function fetchScore() {
    try {
      const response = await fetch("/api/analysis/portfolio-score");
      if (response.ok) {
        const data = await response.json();
        const newScore = data.score || 0;

        // Check if score improved
        const stored = localStorage.getItem("previousPortfolioScore");
        if (stored) {
          const prev = parseInt(stored);
          setPreviousScore(prev);
          if (newScore > prev) {
            celebrateScoreImprovement();
            showSuccess(`Your score improved by ${newScore - prev} points! 🎉`);
          }
        }

        setScore(newScore);
        localStorage.setItem("previousPortfolioScore", newScore.toString());
      }
    } catch (error) {
      console.error("Error fetching score:", error);
    } finally {
      setLoading(false);
    }
  }

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-blue-500 to-indigo-600";
    if (score >= 40) return "from-orange-500 to-amber-600";
    return "from-red-500 to-rose-600";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="ml-0 md:ml-[72px] flex-1 flex items-center justify-center">
          <LoadingSpinner
            size="lg"
            text="Calculating your portfolio score..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="ml-0 md:ml-[72px] flex-1 p-4 md:p-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 md:p-10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="mb-6"
            >
              <Award className="w-16 h-16 md:w-20 md:h-20 mx-auto text-yellow-500" />
            </motion.div>

            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Portfolio Score
            </h1>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
              className="relative inline-block"
            >
              <div
                className={`text-7xl md:text-9xl font-bold bg-gradient-to-br ${getScoreGradient(score || 0)} bg-clip-text text-transparent`}
              >
                {score}
              </div>
              <div className="text-xl md:text-2xl text-gray-500 mt-2">
                out of 100
              </div>
            </motion.div>

            {previousScore !== null &&
              score !== null &&
              score > previousScore && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full"
                >
                  <TrendingUp size={20} />
                  <span className="font-semibold">
                    +{score - previousScore} points improvement!
                  </span>
                </motion.div>
              )}

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-4 bg-blue-50 rounded-lg"
              >
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Projects Analyzed</div>
                <div className="text-2xl font-bold text-gray-900">12</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-4 bg-purple-50 rounded-lg"
              >
                <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Stories Complete</div>
                <div className="text-2xl font-bold text-gray-900">8</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="p-4 bg-green-50 rounded-lg"
              >
                <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Portfolio Ready</div>
                <div className="text-2xl font-bold text-gray-900">5</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
