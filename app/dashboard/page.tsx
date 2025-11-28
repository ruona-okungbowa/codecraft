"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Folder,
  ArrowUp,
  FileText,
  Briefcase,
  Lightbulb,
  Mic,
  Star,
  GitFork,
} from "lucide-react";
import Link from "next/link";
import { Newsreader, Sansation } from "next/font/google";
import DashboardSidebar from "@/components/DashboardSidebar";
import { ProjectRow } from "@/types";
import { createClient } from "@/lib/supabase/client";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

interface PortfolioScore {
  overallScore: number;
  projectQualityScore: number;
  techDiversityScore: number;
  documentationScore: number;
  consistencyScore: number;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [portfolioScore, setPortfolioScore] = useState<PortfolioScore | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("there");

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch projects
        const projectsRes = await fetch("/api/projects");
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.projects || []);
        }

        // Fetch portfolio score
        const scoreRes = await fetch("/api/analysis/portfolio-score");
        if (scoreRes.ok) {
          const scoreData = await scoreRes.json();
          setPortfolioScore(scoreData);
        }

        // Get user info from Supabase
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.user_metadata?.name) {
          setUserName(user.user_metadata.name.split(" ")[0]);
        } else if (user?.email) {
          setUserName(user.email.split("@")[0]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const score = portfolioScore?.overallScore || 0;
  const projectsCount = projects.length;
  const recentProjects = projects.slice(0, 3);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="ml-[72px] flex-1">
        {/* Content Area */}
        <main className="p-10 max-w-[1400px] mx-auto">
          {/* Welcome Section */}
          <div className="mb-10">
            <h2
              className={`text-3xl font-semibold text-gray-900 ${newsreader.className}`}
            >
              Welcome Back, {userName}! 👋
            </h2>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Portfolio Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -2, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm transition-all"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #a855f7)",
                }}
              >
                <Trophy size={24} className="text-white" />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-extrabold text-gray-900">
                  {loading ? "--" : Math.round(score)}
                </span>
                <span className="text-xl text-gray-400">/100</span>
              </div>
              <p
                className={`text-sm text-gray-600 mb-4 ${sansation.className}`}
              >
                Portfolio Score
              </p>
              <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: loading ? "0%" : `${score}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #3b82f6, #a855f7)",
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Link
                  href="/portfolio-score/improve"
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Improve Score →
                </Link>
              </div>
            </motion.div>

            {/* Projects Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -2, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <Folder size={24} className="text-green-600" />
              </div>
              <div className="text-5xl font-extrabold text-gray-900 mb-2">
                {loading ? "--" : projectsCount}
              </div>
              <p
                className={`text-sm text-gray-600 mb-4 ${sansation.className}`}
              >
                GitHub Repositories
              </p>
              <div className="space-y-2 mb-4">
                {loading ? (
                  <div className="text-sm text-gray-400">Loading...</div>
                ) : recentProjects.length > 0 ? (
                  recentProjects.map((project, index) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          index === 0
                            ? "bg-blue-500"
                            : index === 1
                              ? "bg-green-500"
                              : "bg-orange-500"
                        }`}
                      />
                      <span className={`truncate ${sansation.className}`}>
                        {project.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-400">No projects yet</div>
                )}
              </div>
              <Link
                href="/projects"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                View all →
              </Link>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <h2
              className={`text-2xl font-bold text-gray-900 mb-6 ${newsreader.className}`}
            >
              What would you like to do today?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="rounded-xl p-6 h-[180px] flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-xl transition-all"
                style={{
                  background: "linear-gradient(135deg, #a855f7, #ec4899)",
                }}
              >
                <div>
                  <Briefcase size={40} className="text-white mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Match to a Job
                  </h3>
                  <p className="text-sm text-white/90">See how you stack up</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                className="rounded-xl p-6 h-[180px] flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-xl transition-all"
                style={{
                  background: "linear-gradient(135deg, #22c55e, #14b8a6)",
                }}
              >
                <div>
                  <Lightbulb size={40} className="text-white mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Get Project Ideas
                  </h3>
                  <p className="text-sm text-white/90">
                    Build what employers want
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                className="rounded-xl p-6 h-[180px] flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-xl transition-all"
                style={{
                  background: "linear-gradient(135deg, #f97316, #ef4444)",
                }}
              >
                <div>
                  <Mic size={40} className="text-white mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Practice Interviewing
                  </h3>
                  <p className="text-sm text-white/90">Build confidence</p>
                </div>
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xs text-white/80 border border-white/30 px-2 py-1 rounded-full self-start"
                >
                  New
                </motion.span>
              </motion.div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-xl font-bold text-gray-900 ${newsreader.className}`}
              >
                Recent Projects
              </h2>
              <Link
                href="/projects"
                className="text-sm text-blue-600 hover:underline"
              >
                View all →
              </Link>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-400">
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <Folder size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No projects yet</p>
                <Link
                  href="/api/auth/github"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Connect GitHub
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.slice(0, 6).map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <h3
                      className={`font-semibold text-gray-900 mb-2 ${newsreader.className}`}
                    >
                      {project.name}
                    </h3>
                    <p
                      className={`text-sm text-gray-600 mb-3 line-clamp-2 ${sansation.className}`}
                    >
                      {project.description || "No description"}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star size={14} />
                        {project.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork size={14} />
                        {project.forks}
                      </span>
                      {project.languages && project.languages.length > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                          {project.languages[0]}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
