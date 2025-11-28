// TODO: Complete the Skill Gap UI
"use client";

import { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  Info,
  Monitor,
  Server,
  Layers,
  Cloud,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Code,
  Plus,
  ExternalLink,
  BookOpen,
  Video,
  FileText as Article,
  Clock,
  Target,
  Map,
} from "lucide-react";

import Link from "next/link";

import { Newsreader, Sansation } from "next/font/google";

import DashboardSidebar from "@/components/DashboardSidebar";

const newsreader = Newsreader({
  subsets: ["latin"],

  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],

  weight: ["400"],
});

type Role = "frontend" | "backend" | "fullstack" | "devops";

interface MissingSkills {
  essential: string[];
  preferred: string[];
  niceToHave: string[];
}

interface SkillAnalysis {
  role: Role;
  presentSkills: string[];
  missingSkills: MissingSkills;
  coveragePercentage: number;
}

interface AnalysisSummary {
  status: "excellent" | "good" | "needs-work" | "beginner";
  message: string;
  priority: string[];
}

interface AnalysisResponse {
  analysis: SkillAnalysis;
  summary: AnalysisSummary;
  cached: boolean;
  analyzedAt: string;
}

interface LearningResource {
  title: string;

  url: string;

  type: "tutorial" | "docs" | "video" | "article";
}

const roleDefinitions = [
  {
    id: "frontend" as Role,
    title: "Frontend Developer",
    icon: Monitor,
    color: "blue",
    gradient: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
    textColor: "text-blue-600",
    description: "Build user interfaces with React, Vue, Angular",
  },

  {
    id: "backend" as Role,
    title: "Backend Developer",
    icon: Server,
    color: "green",
    gradient: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-500",
    textColor: "text-green-600",
    description: "Create APIs, databases, server logic",
  },

  {
    id: "fullstack" as Role,
    title: "Fullstack Developer",
    icon: Layers,
    color: "purple",
    gradient: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-500",
    textColor: "text-purple-600",
    description: "End-to-end application development",
  },

  {
    id: "devops" as Role,
    title: "DevOps Engineer",
    icon: Cloud,
    color: "orange",
    gradient: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-500",
    textColor: "text-orange-600",
    description: "CI/CD, infrastructure, deployment",
  },
];

const priorityConfig = {
  essential: {
    label: "Essential",
    description: "Required for 80%+ of jobs",
    color: "red",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-500",
    badgeBg: "bg-red-100",
  },

  preferred: {
    label: "Preferred",
    description: "Common in job listings (40-80%)",
    color: "orange",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-500",
    badgeBg: "bg-orange-100",
  },

  niceToHave: {
    label: "Nice-to-have",
    description: "Differentiators (20-40%)",
    color: "blue",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-500",
    badgeBg: "bg-blue-100",
  },
};

const mockLearningResources: { [key: string]: LearningResource[] } = {
  default: [
    {
      title: "Getting Started Guide",
      url: "https://developer.mozilla.org/",
      type: "docs",
    },

    {
      title: "Interactive Tutorial",
      url: "https://www.freecodecamp.org/",
      type: "tutorial",
    },

    {
      title: "Video Course",
      url: "https://www.youtube.com/",
      type: "video",
    },
  ],
};

export default function SkillGapPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);

  const [activePriorityTab, setActivePriorityTab] = useState<
    "essential" | "preferred" | "niceToHave"
  >("essential");

  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());

  const [hasProjects, setHasProjects] = useState(true);

  // Check if user has projects on mount

  useEffect(() => {
    async function checkProjects() {
      try {
        const res = await fetch("/api/projects");

        if (res.ok) {
          const data = await res.json();

          setHasProjects(data.projects && data.projects.length > 0);
        }
      } catch (error) {
        console.error("Error checking projects:", error);
      }
    }

    checkProjects();
  }, []);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleAnalyze = async () => {
    if (!selectedRole) return;

    setAnalyzing(true);

    try {
      const res = await fetch("/api/analysis/skill-gaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: selectedRole }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Analysis failed");
      }

      const data: AnalysisResponse = await res.json();
      setAnalysis(data);

      // Scroll to results after a short delay
      setTimeout(() => {
        document.getElementById("analysis-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    } catch (error) {
      console.error("Error analyzing skills:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to analyze skills. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReanalyze = async () => {
    setAnalysis(null);

    setSelectedRole(null);
  };

  const toggleSkillExpand = (skill: string) => {
    const newExpanded = new Set(expandedSkills);

    if (newExpanded.has(skill)) {
      newExpanded.delete(skill);
    } else {
      newExpanded.add(skill);
    }

    setExpandedSkills(newExpanded);
  };

  const getStatusEmoji = (status: AnalysisSummary["status"]) => {
    switch (status) {
      case "excellent":
        return "🎉";

      case "good":
        return "👍";

      case "needs-work":
        return "📈";

      case "beginner":
        return "💪";

      default:
        return "";
    }
  };

  const getStatusColor = (status: AnalysisSummary["status"]) => {
    switch (status) {
      case "excellent":
        return "text-green-600";

      case "good":
        return "text-blue-600";

      case "needs-work":
        return "text-orange-600";

      case "beginner":
        return "text-purple-600";

      default:
        return "text-gray-600";
    }
  };

  const CircularProgress = ({
    percentage,

    size = 200,
  }: {
    percentage: number;

    size?: number;
  }) => {
    const circumference = 2 * Math.PI * (size / 2 - 12);

    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}

          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 12}
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />

          {/* Progress circle */}

          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 12}
            stroke="url(#gradient)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeDasharray={circumference}
          />

          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />

              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-5xl font-extrabold text-gray-900"
          >
            {percentage}%
          </motion.div>

          <div className="text-sm text-gray-600 mt-1">Match Score</div>
        </div>
      </div>
    );
  };

  // No projects state

  if (!hasProjects) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />

        <div className="ml-[72px] flex-1">
          {/* Header */}

          <div className="bg-white border-b border-gray-200 px-10 py-6 sticky top-0 z-30">
            <h1
              className={`text-3xl font-bold text-gray-900 ${newsreader.className}`}
            >
              Skill Gap Analysis
            </h1>

            <p className={`text-sm text-gray-600 mt-1 ${sansation.className}`}>
              Understand what you need to learn for your target role
            </p>
          </div>

          {/* Empty state */}

          <main className="p-10 max-w-[1400px] mx-auto">
            <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Code size={32} className="text-gray-400" />
              </div>

              <h2
                className={`text-2xl font-bold text-gray-900 mb-3 ${newsreader.className}`}
              >
                No Projects to Analyze
              </h2>

              <p
                className={`text-gray-600 mb-8 max-w-md mx-auto ${sansation.className}`}
              >
                Connect your GitHub and analyze projects first to understand
                your skill gaps
              </p>

              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Projects
                <ArrowRight size={18} />
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="ml-[72px] flex-1">
        {/* Page Header */}

        <div className="bg-white border-b border-gray-200 px-10 py-6 sticky top-0 z-30">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between">
            <div>
              <h1
                className={`text-3xl font-bold text-gray-900 ${newsreader.className}`}
              >
                Skill Gap Analysis
              </h1>

              <p
                className={`text-sm text-gray-600 mt-1 ${sansation.className}`}
              >
                Understand what you need to learn for your target role
              </p>
            </div>

            {analysis && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReanalyze}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  <RefreshCw size={18} />
                  Re-analyze Skills
                </button>

                <button
                  onClick={() => {
                    const content = `# Skill Gap Analysis Report\n\nRole: ${roleDefinitions.find((r) => r.id === analysis.analysis.role)?.title}\nDate: ${new Date().toLocaleDateString()}\nMatch Score: ${analysis.analysis.coveragePercentage}%\n\n## Current Skills (${analysis.analysis.presentSkills.length})\n${analysis.analysis.presentSkills.map((s) => `- ${s}`).join("\n")}\n\n## Essential Skills to Learn (${analysis.analysis.missingSkills.essential.length})\n${analysis.analysis.missingSkills.essential.map((s) => `- ${s}`).join("\n")}\n\n## Preferred Skills (${analysis.analysis.missingSkills.preferred.length})\n${analysis.analysis.missingSkills.preferred.map((s) => `- ${s}`).join("\n")}\n\n## Nice-to-Have Skills (${analysis.analysis.missingSkills.niceToHave.length})\n${analysis.analysis.missingSkills.niceToHave.map((s) => `- ${s}`).join("\n")}`;
                    const blob = new Blob([content], { type: "text/markdown" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "skill-gap-report.md";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  <Download size={18} />
                  Export Report
                </button>
              </div>
            )}
          </div>
        </div>

        <main className="p-10">
          {/* Role Selector Section */}

          {!analysis && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-b border-blue-100 rounded-2xl mb-10 overflow-hidden">
              <div className="max-w-[1000px] mx-auto px-10 py-12">
                <h2
                  className={`text-2xl font-semibold text-gray-900 mb-8 text-center ${newsreader.className}`}
                >
                  What role are you targeting?
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {roleDefinitions.map((role) => (
                    <motion.div
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`

                        relative bg-white rounded-xl p-6 cursor-pointer transition-all min-h-[160px]

                        border-2 shadow-sm hover:shadow-lg

                        ${
                          selectedRole === role.id
                            ? `${role.borderColor} ${role.bgColor} shadow-lg`
                            : "border-transparent hover:border-gray-200"
                        }

                      `}
                    >
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br ${role.gradient}`}
                      >
                        <role.icon size={24} className="text-white" />
                      </div>

                      <h3
                        className={`text-lg font-bold text-gray-900 mb-2 ${newsreader.className}`}
                      >
                        {role.title}
                      </h3>

                      <p
                        className={`text-sm text-gray-600 leading-relaxed ${sansation.className}`}
                      >
                        {role.description}
                      </p>

                      {selectedRole === role.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute bottom-4 right-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle size={20} className="text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <motion.button
                    onClick={handleAnalyze}
                    disabled={!selectedRole || analyzing}
                    whileHover={selectedRole ? { scale: 1.05 } : {}}
                    whileTap={selectedRole ? { scale: 0.95 } : {}}
                    className={`

                      flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all

                      ${
                        selectedRole && !analyzing
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }

                    `}
                  >
                    {analyzing ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze Skills
                        <ArrowRight size={20} />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}

          {analyzing && (
            <div className="max-w-[1000px] mx-auto text-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
              />

              <h2
                className={`text-2xl font-bold text-gray-700 mb-3 ${newsreader.className}`}
              >
                Analyzing your skills...
              </h2>

              <p className={`text-gray-600 mb-2 ${sansation.className}`}>
                Extracting skills from your projects
              </p>

              <p className={`text-sm text-gray-500 ${sansation.className}`}>
                This usually takes 5-10 seconds
              </p>

              <div className="mt-6 max-w-md mx-auto">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Analyzing projects...</span>
                  <span>⚡ Optimized</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 8, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results */}

          {analysis && !analyzing && (
            <motion.div
              id="analysis-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-[1400px] mx-auto space-y-8"
            >
              {/* Overview Section */}

              <div className="bg-white rounded-2xl p-10 shadow-lg border border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Overall Match Score */}

                  <div className="flex flex-col items-center">
                    <CircularProgress
                      percentage={analysis.analysis.coveragePercentage}
                    />

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className={`mt-4 text-lg font-semibold ${getStatusColor(
                        analysis.summary.status
                      )}`}
                    >
                      {analysis.summary.status === "excellent" &&
                        "Excellent match!"}
                      {analysis.summary.status === "good" && "Good foundation"}
                      {analysis.summary.status === "needs-work" &&
                        "Room to grow"}
                      {analysis.summary.status === "beginner" &&
                        "Let's build your skills"}{" "}
                      {getStatusEmoji(analysis.summary.status)}
                    </motion.div>
                  </div>

                  {/* Skills Breakdown */}

                  <div className="flex flex-col justify-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={24} className="text-green-600" />
                      </div>

                      <div>
                        <div className="text-3xl font-bold text-gray-900">
                          {analysis.analysis.presentSkills.length} skills
                        </div>

                        <div
                          className={`text-sm text-gray-600 ${sansation.className}`}
                        >
                          from this role
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <XCircle size={24} className="text-red-600" />
                      </div>

                      <div>
                        <div className="text-3xl font-bold text-orange-600">
                          {analysis.analysis.missingSkills.essential.length}{" "}
                          critical
                        </div>

                        <div
                          className={`text-sm text-gray-600 ${sansation.className}`}
                        >
                          skills to learn
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Info size={24} className="text-blue-600" />
                      </div>

                      <div>
                        <div className="text-3xl font-bold text-blue-600">
                          {analysis.analysis.missingSkills.preferred.length +
                            analysis.analysis.missingSkills.niceToHave
                              .length}{" "}
                          preferred
                        </div>

                        <div
                          className={`text-sm text-gray-600 ${sansation.className}`}
                        >
                          nice-to-have skills
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}

                  <div className="flex flex-col justify-center gap-3">
                    <Link
                      href="/project-recommendations"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Target size={18} />
                      View Learning Path
                    </Link>

                    <Link
                      href="/project-recommendations"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      <Code size={18} />
                      Get Project Ideas
                    </Link>

                    <Link
                      href="/job-match"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      <TrendingUp size={18} />
                      Match to Job
                    </Link>
                  </div>
                </div>
              </div>

              {/* Current Skills Section */}

              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className={`text-2xl font-bold text-gray-900 ${newsreader.className}`}
                  >
                    Your Current Skills
                  </h2>

                  <span className="text-sm text-gray-500">
                    {analysis.analysis.presentSkills.length} skills detected
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {analysis.analysis.presentSkills.map((skill, index) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full hover:bg-green-100 transition-colors cursor-pointer"
                    >
                      <CheckCircle size={16} className="text-green-600" />

                      <span
                        className={`text-sm font-medium text-green-700 ${sansation.className}`}
                      >
                        {skill}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Missing Skills Section */}

              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <div className="mb-6">
                  <h2
                    className={`text-2xl font-bold text-gray-900 mb-2 ${newsreader.className}`}
                  >
                    Skills to Learn
                  </h2>

                  <p className={`text-sm text-gray-600 ${sansation.className}`}>
                    Based on{" "}
                    {
                      roleDefinitions.find(
                        (r) => r.id === analysis.analysis.role
                      )?.title
                    }{" "}
                    requirements from 1,000+ job postings
                  </p>
                </div>

                {/* Priority Tabs */}

                <div className="flex gap-2 mb-6 border-b border-gray-200">
                  {(["essential", "preferred", "niceToHave"] as const).map(
                    (priority) => {
                      const count =
                        analysis.analysis.missingSkills[priority].length;

                      const config = priorityConfig[priority];

                      return (
                        <button
                          key={priority}
                          onClick={() => setActivePriorityTab(priority)}
                          className={`

                          px-6 py-3 font-medium transition-all rounded-t-lg relative

                          ${
                            activePriorityTab === priority
                              ? `${config.textColor} bg-${config.color}-50`
                              : "text-gray-600 hover:bg-gray-50"
                          }

                        `}
                        >
                          <div className="flex items-center gap-2">
                            {config.label}

                            <span
                              className={`

                            px-2 py-0.5 rounded-full text-xs font-semibold

                            ${
                              activePriorityTab === priority
                                ? config.badgeBg
                                : "bg-gray-200 text-gray-600"
                            }

                          `}
                            >
                              {count}
                            </span>
                          </div>

                          {activePriorityTab === priority && (
                            <motion.div
                              layoutId="activeTab"
                              className={`absolute bottom-0 left-0 right-0 h-1 bg-${config.color}-500`}
                              style={{
                                backgroundColor:
                                  config.color === "red"
                                    ? "#ef4444"
                                    : config.color === "orange"
                                      ? "#f97316"
                                      : "#3b82f6",
                              }}
                            />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Skills Grid */}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePriorityTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {analysis.analysis.missingSkills[activePriorityTab].map(
                      (skill, index) => {
                        const config = priorityConfig[activePriorityTab];

                        const isExpanded = expandedSkills.has(skill);

                        const resources =
                          mockLearningResources[skill.toLowerCase()] ||
                          mockLearningResources.default;

                        return (
                          <motion.div
                            key={skill}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`

                              border-l-4 ${config.borderColor} border border-gray-200 rounded-lg p-6

                              hover:shadow-md transition-all bg-white

                            `}
                          >
                            {/* Header */}

                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3
                                    className={`text-lg font-bold text-gray-900 ${newsreader.className}`}
                                  >
                                    {skill}
                                  </h3>

                                  <span
                                    className={`

                                    px-3 py-1 rounded-full text-xs font-semibold

                                    ${config.badgeBg} ${config.textColor}

                                  `}
                                  >
                                    {config.label}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <TrendingUp size={14} />

                                  <span>
                                    Found in{" "}
                                    {Math.floor(Math.random() * 30) + 70}% of
                                    jobs
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Description */}

                            <p
                              className={`text-sm text-gray-600 leading-relaxed mb-4 ${sansation.className}`}
                            >
                              Essential skill for modern development. Widely
                              used across the industry.
                            </p>

                            {/* Learning Resources Toggle */}

                            <button
                              onClick={() => toggleSkillExpand(skill)}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mb-3"
                            >
                              {isExpanded ? (
                                <>
                                  Hide learning resources
                                  <ChevronUp size={16} />
                                </>
                              ) : (
                                <>
                                  Show learning resources
                                  <ChevronDown size={16} />
                                </>
                              )}
                            </button>

                            {/* Expanded Resources */}

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="space-y-3 pt-3 border-t border-gray-200">
                                    {resources.map((resource, idx) => {
                                      const IconComponent =
                                        resource.type === "video"
                                          ? Video
                                          : resource.type === "tutorial"
                                            ? BookOpen
                                            : Article;

                                      return (
                                        <a
                                          key={idx}
                                          href={resource.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                        >
                                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <IconComponent
                                              size={16}
                                              className="text-blue-600"
                                            />
                                          </div>

                                          <div className="flex-1 min-w-0">
                                            <div
                                              className={`text-sm font-medium text-gray-900 truncate ${sansation.className}`}
                                            >
                                              {resource.title}
                                            </div>

                                            <div className="text-xs text-gray-500 capitalize">
                                              {resource.type}
                                            </div>
                                          </div>

                                          <ExternalLink
                                            size={14}
                                            className="text-gray-400 group-hover:text-blue-600 flex-shrink-0"
                                          />
                                        </a>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Actions */}

                            <div className="flex gap-2 mt-4">
                              <Link
                                href="/project-recommendations"
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                <Plus size={16} />
                                Add to Path
                              </Link>

                              <Link
                                href="/project-recommendations"
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                              >
                                <Code size={16} />
                                Find Projects
                              </Link>
                            </div>
                          </motion.div>
                        );
                      }
                    )}
                  </motion.div>
                </AnimatePresence>

                {analysis.analysis.missingSkills[activePriorityTab].length ===
                  0 && (
                  <div className="text-center py-10">
                    <CheckCircle
                      size={48}
                      className="text-green-500 mx-auto mb-3"
                    />

                    <p className="text-gray-600">
                      You have all {priorityConfig[activePriorityTab].label}{" "}
                      skills!
                    </p>
                  </div>
                )}
              </div>

              {/* Skill Comparison Chart */}

              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2
                      className={`text-2xl font-bold text-gray-900 mb-1 ${newsreader.className}`}
                    >
                      Skills Comparison
                    </h2>

                    <p
                      className={`text-sm text-gray-600 ${sansation.className}`}
                    >
                      Your skills vs.{" "}
                      {
                        roleDefinitions.find(
                          (r) => r.id === analysis.analysis.role
                        )?.title
                      }{" "}
                      requirements
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Present skills as "Above target" */}

                  {analysis.analysis.presentSkills.slice(0, 5).map((skill) => (
                    <div key={skill}>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`font-medium text-gray-900 ${sansation.className}`}
                        >
                          {skill}
                        </span>

                        <span className="text-sm text-green-600 font-semibold">
                          Above target ✓
                        </span>
                      </div>

                      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "90%" }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        />

                        <div className="absolute inset-y-0 left-0 right-0 border-2 border-dashed border-gray-400 rounded-full w-4/5" />
                      </div>
                    </div>
                  ))}

                  {/* Missing essential skills with gaps */}

                  {analysis.analysis.missingSkills.essential

                    .slice(0, 3)

                    .map((skill) => (
                      <div key={skill}>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`font-medium text-gray-900 ${sansation.className}`}
                          >
                            {skill}
                          </span>

                          <span className="text-sm text-red-600 font-semibold">
                            Not learned
                          </span>
                        </div>

                        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          />

                          <div className="absolute inset-y-0 left-0 right-0 border-2 border-dashed border-red-400 rounded-full w-4/5" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Learning Path Section */}

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-10 border border-blue-200">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Map size={24} className="text-white" />
                  </div>

                  <div>
                    <h2
                      className={`text-2xl font-bold text-gray-900 mb-2 ${newsreader.className}`}
                    >
                      Your Personalized Learning Path
                    </h2>

                    <p
                      className={`text-sm text-gray-600 mb-1 ${sansation.className}`}
                    >
                      We have created a step-by-step plan to close your skill
                      gaps
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} />

                      <span>Approximately 3-4 months at 10 hrs/week</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}

                <div className="relative pl-8">
                  {/* Vertical line */}

                  <div className="absolute left-8 top-0 bottom-0 w-1 bg-blue-300" />

                  {/* Phase 1 */}

                  <div className="relative mb-10">
                    <div className="absolute -left-8 w-16 h-16 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-blue-600">
                        1
                      </span>
                    </div>

                    <div className="ml-12 bg-white rounded-xl p-6 shadow-md border border-gray-200">
                      <h3
                        className={`text-xl font-bold text-gray-900 mb-2 ${newsreader.className}`}
                      >
                        Phase 1: Master the Essentials
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Clock size={16} />

                        <span>4-6 weeks</span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {analysis.analysis.missingSkills.essential

                          .slice(0, 3)

                          .map((skill) => (
                            <div
                              key={skill}
                              className="flex items-center gap-3"
                            >
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle
                                  size={16}
                                  className="text-blue-600"
                                />
                              </div>

                              <span
                                className={`text-gray-900 font-medium ${sansation.className}`}
                              >
                                {skill}
                              </span>

                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                                Essential
                              </span>
                            </div>
                          ))}
                      </div>

                      <Link
                        href="/project-recommendations"
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center block"
                      >
                        Start Phase 1
                      </Link>
                    </div>
                  </div>

                  {/* Phase 2 */}

                  <div className="relative mb-10">
                    <div className="absolute -left-8 w-16 h-16 bg-white border-4 border-blue-300 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-gray-400">
                        2
                      </span>
                    </div>

                    <div className="ml-12 bg-white rounded-xl p-6 shadow-md border border-gray-200 opacity-75">
                      <h3
                        className={`text-xl font-bold text-gray-900 mb-2 ${newsreader.className}`}
                      >
                        Phase 2: Advanced Concepts
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Clock size={16} />

                        <span>6-8 weeks</span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {analysis.analysis.missingSkills.preferred

                          .slice(0, 3)

                          .map((skill) => (
                            <div
                              key={skill}
                              className="flex items-center gap-3"
                            >
                              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle
                                  size={16}
                                  className="text-orange-600"
                                />
                              </div>

                              <span
                                className={`text-gray-900 font-medium ${sansation.className}`}
                              >
                                {skill}
                              </span>

                              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold">
                                Preferred
                              </span>
                            </div>
                          ))}
                      </div>

                      <button
                        disabled
                        className="w-full py-2 px-4 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                      >
                        Complete Phase 1 First
                      </button>
                    </div>
                  </div>

                  {/* Phase 3 */}

                  <div className="relative">
                    <div className="absolute -left-8 w-16 h-16 bg-white border-4 border-blue-300 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-gray-400">
                        3
                      </span>
                    </div>

                    <div className="ml-12 bg-white rounded-xl p-6 shadow-md border border-gray-200 opacity-75">
                      <h3
                        className={`text-xl font-bold text-gray-900 mb-2 ${newsreader.className}`}
                      >
                        Phase 3: Real-World Application
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Clock size={16} />

                        <span>4-6 weeks</span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-3">
                          <Code size={16} className="text-gray-600" />

                          <span
                            className={`text-gray-900 font-medium ${sansation.className}`}
                          >
                            Build a fullstack project with all skills
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <Code size={16} className="text-gray-600" />

                          <span
                            className={`text-gray-900 font-medium ${sansation.className}`}
                          >
                            Deploy to production
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <Code size={16} className="text-gray-600" />

                          <span
                            className={`text-gray-900 font-medium ${sansation.className}`}
                          >
                            Update portfolio
                          </span>
                        </div>
                      </div>

                      <button
                        disabled
                        className="w-full py-2 px-4 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                      >
                        Complete Phase 2 First
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => {
                      const content = `# Learning Plan for ${roleDefinitions.find((r) => r.id === analysis.analysis.role)?.title}\n\nGenerated: ${new Date().toLocaleDateString()}\n\n## Phase 1: Essential Skills\n${analysis.analysis.missingSkills.essential.map((s) => `- ${s}`).join("\n")}\n\n## Phase 2: Preferred Skills\n${analysis.analysis.missingSkills.preferred.map((s) => `- ${s}`).join("\n")}\n\n## Phase 3: Nice-to-Have Skills\n${analysis.analysis.missingSkills.niceToHave.map((s) => `- ${s}`).join("\n")}`;
                      const blob = new Blob([content], {
                        type: "text/markdown",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "learning-plan.md";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                  >
                    <Download size={18} />
                    Download Learning Plan
                  </button>

                  <button
                    onClick={() =>
                      alert(
                        "Timeline adjustment coming soon! You can customize your learning pace."
                      )
                    }
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                  >
                    <Clock size={18} />
                    Adjust Timeline
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
