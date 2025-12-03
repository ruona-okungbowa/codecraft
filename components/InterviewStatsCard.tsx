"use client";

import { TrendingUp, TrendingDown, Award, Target } from "lucide-react";

interface InterviewStats {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  improvement: number;
  scoreHistory: Array<{ score: number; date: string }>;
  byType: {
    technical: number;
    behavioral: number;
    "system design": number;
    mixed: number;
  };
}

export default function InterviewStatsCard({
  stats,
}: {
  stats: InterviewStats;
}) {
  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return "text-green-600";
    if (improvement < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-6 h-6 text-[#4c96e1]" />
        <h2 className="text-xl font-bold text-gray-900">
          Your Interview Progress
        </h2>
      </div>

      {stats.completedInterviews === 0 ? (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            Complete your first interview to see your progress
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalInterviews}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Interviews</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedInterviews}
              </p>
              <p className="text-sm text-gray-600 mt-1">Completed</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p
                className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}
              >
                {stats.averageScore}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Average Score</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1">
                {stats.improvement > 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : stats.improvement < 0 ? (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                ) : null}
                <p
                  className={`text-2xl font-bold ${getImprovementColor(stats.improvement)}`}
                >
                  {stats.improvement > 0 ? "+" : ""}
                  {stats.improvement}%
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-1">Improvement</p>
            </div>
          </div>

          {/* Score History Chart */}
          {stats.scoreHistory.length > 1 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Score Trend
              </h3>
              <div className="relative h-32 flex items-end gap-2">
                {stats.scoreHistory.map((item, index) => {
                  const height = (item.score / 100) * 100;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div className="relative w-full group">
                        <div
                          className="w-full bg-[#4c96e1] rounded-t transition-all hover:bg-[#3a7bc8]"
                          style={{ height: `${height}%` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {item.score}%
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{index + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interview Types Breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Interview Types
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-700 capitalize">
                    {type}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
