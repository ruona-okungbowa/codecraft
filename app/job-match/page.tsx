"use client";

import { useState, useEffect } from "react";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import Link from "next/link";
import {
  Trash2,
  Clock,
  Briefcase,
  TrendingUp,
  Download,
  Share2,
  BookOpen,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { getLearningResources } from "@/lib/learning/resources";
import {
  downloadJobMatchReport,
  copyJobMatchToClipboard,
} from "@/lib/export/job-match-pdf";

interface JobMatchResult {
  matchId?: string;
  jobTitle?: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: Array<{
    skill: string;
    priority: "high" | "medium" | "low";
  }>;
  bonusSkills: string[];
  recommendations: Array<{
    title: string;
    description: string;
  }>;
  summary: string;
  projectMappings?: Array<{
    projectId: string;
    projectName: string;
    matchedSkills: string[];
    relevanceScore: number;
  }>;
  interviewQuestions?: Array<{
    question: string;
    category: string;
    difficulty: string;
  }>;
}

interface SavedJobMatch {
  id: string;
  job_title: string;
  company_name?: string;
  match_percentage: number;
  created_at: string;
}

export default function JobMatchPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedMatches, setSavedMatches] = useState<SavedJobMatch[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showLearningPaths, setShowLearningPaths] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  useEffect(() => {
    fetchMatchHistory();
  }, []);

  async function fetchMatchHistory() {
    try {
      const response = await fetch("/api/job-matches");
      if (response.ok) {
        const data = await response.json();
        setSavedMatches(data.matches || []);
      }
    } catch (err) {
      console.error("Failed to fetch match history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleAnalyse() {
    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    setAnalysing(true);
    setError(null);

    try {
      const response = await fetch("/api/analysis/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          jobTitle: jobTitle.trim() || undefined,
          companyName: companyName.trim() || undefined,
          saveMatch: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyse job match");
      }

      const data = await response.json();
      setResult(data);
      fetchMatchHistory();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
    } finally {
      setAnalysing(false);
    }
  }

  async function handleDeleteMatch(matchId: string) {
    if (!confirm("Are you sure you want to delete this job match?")) return;

    try {
      const response = await fetch(`/api/job-matches/${matchId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSavedMatches((prev) => prev.filter((m) => m.id !== matchId));
      }
    } catch (err) {
      console.error("Failed to delete match:", err);
    }
  }

  async function handleLoadMatch(matchId: string) {
    try {
      const response = await fetch(`/api/job-matches/${matchId}`);
      if (response.ok) {
        const match = await response.json();
        setJobTitle(match.job_title);
        setCompanyName(match.company_name || "");
        setJobDescription(match.job_description);
        setResult({
          matchId: match.id,
          jobTitle: match.job_title,
          matchPercentage: match.match_percentage,
          matchedSkills: match.matched_skills,
          missingSkills: match.missing_skills,
          bonusSkills: match.bonus_skills,
          recommendations: match.recommendations,
          summary: match.summary,
          projectMappings: match.project_mappings,
          interviewQuestions: match.interview_questions,
        });
        setShowHistory(false);
      }
    } catch (err) {
      console.error("Failed to load match:", err);
    }
  }

  function handleReset() {
    setJobDescription("");
    setJobTitle("");
    setCompanyName("");
    setResult(null);
    setError(null);
    setShowLearningPaths(false);
  }

  async function handleCopyToClipboard() {
    if (!result) return;

    try {
      await copyJobMatchToClipboard({
        jobTitle: jobTitle || result.jobTitle || "Job Position",
        companyName: companyName,
        matchPercentage: result.matchPercentage,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        bonusSkills: result.bonusSkills,
        summary: result.summary,
        projectMappings: result.projectMappings,
      });
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  }

  function handleDownloadReport() {
    if (!result) return;

    downloadJobMatchReport({
      jobTitle: jobTitle || result.jobTitle || "Job Position",
      companyName: companyName,
      matchPercentage: result.matchPercentage,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      bonusSkills: result.bonusSkills,
      summary: result.summary,
      projectMappings: result.projectMappings,
    });
  }

  function getMatchLabel(percentage: number) {
    if (percentage >= 80) return "Strong Match";
    if (percentage >= 60) return "Good Match";
    if (percentage >= 40) return "Fair Match";
    return "Needs Improvement";
  }

  function getMatchColor(percentage: number) {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-[#4c96e1]";
    return "text-orange-600";
  }

  function getStrokeColor(percentage: number) {
    if (percentage >= 80) return "#10b981";
    if (percentage >= 60) return "#4c96e1";
    return "#f59e0b";
  }

  return (
    <div className="flex min-h-screen bg-[#f6f7f8]">
      <CollapsibleSidebar />

      <main className="flex-1 p-8 overflow-y-auto ml-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Heading */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-slate-900 text-4xl font-black leading-tight tracking-[-0.033em]">
                  Job Match Analyser
                </h1>
                <p className="text-slate-500 text-base font-normal leading-normal">
                  Paste a job description below to see how your skills stack up.
                </p>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  History ({savedMatches.length})
                </span>
              </button>
            </div>
          </div>

          {/* Match History Sidebar */}
          {showHistory && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
                Previous Job Matches
              </h2>
              {loadingHistory ? (
                <p className="text-slate-500 text-sm">Loading...</p>
              ) : savedMatches.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  No saved matches yet. Analyse a job to get started!
                </p>
              ) : (
                <div className="space-y-3">
                  {savedMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-slate-200 rounded-lg hover:border-[#4c96e1] transition-colors group gap-3"
                    >
                      <button
                        onClick={() => handleLoadMatch(match.id)}
                        className="flex-1 text-left w-full"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg font-bold shrink-0 ${
                              match.match_percentage >= 80
                                ? "bg-green-100 text-green-700"
                                : match.match_percentage >= 60
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {match.match_percentage}%
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-[#4c96e1] truncate">
                              {match.job_title}
                            </h3>
                            {match.company_name && (
                              <p className="text-xs sm:text-sm text-slate-500 truncate">
                                {match.company_name}
                              </p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(match.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors self-end sm:self-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Input Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col w-full">
                  <p className="text-slate-900 text-base font-medium leading-normal pb-2">
                    Job Title
                  </p>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="form-input flex w-full rounded-md text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[#4c96e1]/50 border border-slate-300 bg-[#f6f7f8] placeholder:text-slate-400 p-3 text-base font-normal leading-normal"
                    placeholder="e.g., Senior Frontend Developer"
                  />
                </label>
                <label className="flex flex-col w-full">
                  <p className="text-slate-900 text-base font-medium leading-normal pb-2">
                    Company Name (Optional)
                  </p>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="form-input flex w-full rounded-md text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[#4c96e1]/50 border border-slate-300 bg-[#f6f7f8] placeholder:text-slate-400 p-3 text-base font-normal leading-normal"
                    placeholder="e.g., TechCorp"
                  />
                </label>
              </div>
              <label className="flex flex-col w-full">
                <p className="text-slate-900 text-base font-medium leading-normal pb-2">
                  Job Description
                </p>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="form-textarea flex w-full resize-y rounded-md text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[#4c96e1]/50 border border-slate-300 bg-[#f6f7f8] min-h-36 placeholder:text-slate-400 p-4 text-base font-normal leading-normal"
                  placeholder="Paste the full job description here..."
                />
              </label>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div className="flex justify-start">
                <button
                  onClick={handleAnalyse}
                  disabled={analysing || !jobDescription.trim()}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#4c96e1] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#3a7bc8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analysing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Analysing...
                    </span>
                  ) : (
                    <span>Analyse Match</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {analysing && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-lg shadow-sm animate-pulse">
                <div className="flex items-center gap-8">
                  <div className="w-32 h-32 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-lg shadow-sm animate-pulse"
                  >
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="flex gap-2 flex-wrap">
                      <div className="h-8 bg-gray-200 rounded-full w-20"></div>
                      <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                      <div className="h-8 bg-gray-200 rounded-full w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Section */}
          {result && !analysing && (
            <>
              {/* Match Score Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em]">
                    Your Match Score
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyToClipboard}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium"
                    >
                      {copiedToClipboard ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadReport}
                      className="flex items-center gap-2 px-4 py-2 bg-[#4c96e1] hover:bg-[#3a7bc8] text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-sm">
                  <div className="flex items-start gap-8">
                    <div className="relative size-32 shrink-0">
                      <svg
                        className="size-full -rotate-90"
                        viewBox="0 0 36 36"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          className="stroke-slate-200"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          stroke={getStrokeColor(result.matchPercentage)}
                          strokeWidth="3"
                          strokeDasharray={`${result.matchPercentage} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-slate-900">
                        {result.matchPercentage}%
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <p
                        className={`text-3xl font-bold leading-tight ${getMatchColor(result.matchPercentage)}`}
                      >
                        {getMatchLabel(result.matchPercentage)}
                      </p>
                      <p className="text-slate-500 text-base leading-relaxed">
                        {result.summary}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Comparison Section */}
              <div className="space-y-4">
                <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em]">
                  Skills Comparison
                </h2>
                <div className="space-y-4">
                  {/* Matched Skills */}
                  <div className="bg-green-500/10 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">
                      Matched Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-white text-slate-700 text-sm font-medium px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  {result.missingSkills.length > 0 && (
                    <div className="bg-red-500/10 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-red-800">
                          Missing Skills
                        </h3>
                        <button
                          onClick={() =>
                            setShowLearningPaths(!showLearningPaths)
                          }
                          className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-red-50 rounded-lg transition-colors text-sm font-medium text-red-700"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>
                            {showLearningPaths ? "Hide" : "Show"} Learning Paths
                          </span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.missingSkills.map((item, index) => (
                          <span
                            key={index}
                            className="bg-white text-slate-700 text-sm font-medium px-3 py-1 rounded-full"
                          >
                            {item.skill}{" "}
                            <span
                              className={
                                item.priority === "high"
                                  ? "text-red-500 ml-1"
                                  : item.priority === "medium"
                                    ? "text-orange-500 ml-1"
                                    : "text-yellow-500 ml-1"
                              }
                            >
                              (
                              {item.priority.charAt(0).toUpperCase() +
                                item.priority.slice(1)}{" "}
                              Priority)
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bonus Skills */}
                  {result.bonusSkills.length > 0 && (
                    <div className="bg-indigo-500/10 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-indigo-800 mb-4">
                        Bonus Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.bonusSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-white text-slate-700 text-sm font-medium px-3 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Learning Paths Section */}
              {showLearningPaths && result.missingSkills.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em]">
                    Actionable Learning Paths
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Curated resources to help you learn the missing skills
                  </p>
                  <div className="space-y-6">
                    {result.missingSkills
                      .sort((a, b) => {
                        const priorityOrder = { high: 0, medium: 1, low: 2 };
                        return (
                          priorityOrder[a.priority] - priorityOrder[b.priority]
                        );
                      })
                      .map((item, index) => {
                        const resources = getLearningResources(item.skill);
                        return (
                          <div
                            key={index}
                            className="bg-white p-5 rounded-lg border border-slate-200"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-bold text-slate-900">
                                {item.skill}
                              </h3>
                              <span
                                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                  item.priority === "high"
                                    ? "bg-red-100 text-red-700"
                                    : item.priority === "medium"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {item.priority.toUpperCase()} PRIORITY
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {resources.slice(0, 4).map((resource, idx) => (
                                <a
                                  key={idx}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:border-[#4c96e1] hover:bg-[#4c96e1]/5 transition-all group"
                                >
                                  <div className="w-10 h-10 rounded-lg bg-[#4c96e1]/10 flex items-center justify-center shrink-0">
                                    <ExternalLink className="w-5 h-5 text-[#4c96e1]" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-slate-900 group-hover:text-[#4c96e1] truncate">
                                      {resource.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-slate-500">
                                        {resource.platform}
                                      </span>
                                      <span className="text-xs text-slate-400">
                                        •
                                      </span>
                                      <span
                                        className={`text-xs ${resource.free ? "text-green-600" : "text-orange-600"}`}
                                      >
                                        {resource.free ? "Free" : "Paid"}
                                      </span>
                                      {resource.duration && (
                                        <>
                                          <span className="text-xs text-slate-400">
                                            •
                                          </span>
                                          <span className="text-xs text-slate-500">
                                            {resource.duration}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Recommendations Section */}
              {result.recommendations.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em]">
                    Next Steps to Improve Your Match
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg shadow-sm"
                      >
                        <h4 className="font-bold text-slate-800">
                          {rec.title}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1">
                          {rec.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Mappings Section */}
              {result.projectMappings && result.projectMappings.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em]">
                    Your Relevant Projects
                  </h2>
                  <p className="text-slate-500 text-sm">
                    These projects demonstrate skills needed for this role
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    {result.projectMappings
                      .sort((a, b) => b.relevanceScore - a.relevanceScore)
                      .map((mapping, index) => (
                        <div
                          key={index}
                          className="bg-linear-to-r from-[#4c96e1]/5 to-transparent p-5 rounded-lg border border-[#4c96e1]/20"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-slate-900 text-lg">
                                {mapping.projectName}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <TrendingUp className="w-4 h-4 text-[#4c96e1]" />
                                <span className="text-sm text-slate-600">
                                  {mapping.relevanceScore}% relevant to this
                                  role
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {mapping.matchedSkills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="bg-[#4c96e1]/10 text-[#4c96e1] text-xs font-semibold px-3 py-1 rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Interview Questions Section */}
              {result.interviewQuestions &&
                result.interviewQuestions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em]">
                          Prepare for Your Interview
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                          Practice these questions based on the job requirements
                        </p>
                      </div>
                      <Link
                        href="/mock-interview"
                        className="flex items-center gap-2 px-4 py-2 bg-[#4c96e1] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors text-sm font-semibold"
                      >
                        <Briefcase className="w-4 h-4" />
                        Start Mock Interview
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {result.interviewQuestions.map((q, index) => (
                        <div
                          key={index}
                          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-[#4c96e1] transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#4c96e1]/10 flex items-center justify-center shrink-0 mt-1">
                              <span className="text-[#4c96e1] font-bold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-900 font-medium">
                                {q.question}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    q.category === "technical"
                                      ? "bg-blue-100 text-blue-700"
                                      : q.category === "behavioral"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {q.category}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    q.difficulty === "hard"
                                      ? "bg-red-100 text-red-700"
                                      : q.difficulty === "medium"
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {q.difficulty}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200">
                <Link
                  href="/project-recommendations"
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-11 px-5 bg-[#4c96e1] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#3a7bc8] transition-colors"
                >
                  <span>Get project recommendations</span>
                </Link>
                <button
                  onClick={handleReset}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-11 px-5 bg-slate-200 text-slate-800 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-300 transition-colors"
                >
                  <span>Try another job description</span>
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
