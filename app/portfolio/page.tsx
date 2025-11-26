"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Star,
  Globe,
  Code,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { Newsreader, Sansation } from "next/font/google";
import DashboardSidebar from "@/components/DashboardSidebar";
import { ProjectRow } from "@/types";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

export default function PortfolioPage() {
  const [selectedProjects, setSelectedProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    url?: string;
    message?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    fetchSelectedProjects();
  }, []);

  async function fetchSelectedProjects() {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        const portfolio = data.projects.filter(
          (p: ProjectRow) => p.in_portfolio
        );
        setSelectedProjects(portfolio);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }

  async function generatePortfolio() {
    setGenerating(true);
    setResult(null);

    try {
      const response = await fetch("/api/ai/portfolio-site", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          url: data.url,
          message: data.message,
        });
      } else {
        setResult({
          error: data.error || "Failed to generate portfolio",
        });
      }
    } catch (error) {
      console.error("Error generating portfolio:", error);
      setResult({
        error: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setGenerating(false);
    }
  }

  const getLanguageArray = (
    languages: Record<string, number> | null | undefined
  ): string[] => {
    if (!languages) return [];
    return Object.keys(languages).sort((a, b) => languages[b] - languages[a]);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="ml-[72px] flex-1">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-10 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1
                  className={`text-[28px] font-bold text-gray-900 ${newsreader.className}`}
                >
                  Portfolio Website Generator
                </h1>
                <p
                  className={`text-sm text-gray-600 mt-1 ${sansation.className}`}
                >
                  Create a stunning portfolio website from your selected
                  projects
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-10 py-8 max-w-5xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <Loader2
                size={48}
                className="text-gray-400 animate-spin mx-auto mb-4"
              />
              <p className="text-gray-500">Loading your projects...</p>
            </div>
          ) : (
            <>
              {/* Selected Projects Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className={`text-2xl font-bold text-gray-900 ${newsreader.className}`}
                  >
                    Selected Projects ({selectedProjects.length})
                  </h2>
                  <Link
                    href="/projects"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Manage Projects →
                  </Link>
                </div>

                {selectedProjects.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                    <Star size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3
                      className={`text-xl font-bold text-gray-900 mb-2 ${newsreader.className}`}
                    >
                      No projects selected
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Add projects to your portfolio from the Projects page to
                      generate your website
                    </p>
                    <Link
                      href="/projects"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Star size={18} />
                      <span>Select Projects</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProjects.map((project) => {
                      const languages = getLanguageArray(project.languages);
                      return (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3
                              className={`text-lg font-bold text-gray-900 ${newsreader.className}`}
                            >
                              {project.name}
                            </h3>
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star size={14} fill="currentColor" />
                              <span className="text-sm text-gray-600">
                                {project.stars}
                              </span>
                            </div>
                          </div>
                          <p
                            className={`text-sm text-gray-600 mb-3 line-clamp-2 ${sansation.className}`}
                          >
                            {project.description || "No description"}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {languages.slice(0, 3).map((lang) => (
                              <span
                                key={lang}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                              >
                                {lang}
                              </span>
                            ))}
                            {languages.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                                +{languages.length - 3}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Generation Section */}
              {selectedProjects.length > 0 && (
                <div className="bg-gradient-to-br from-[#d8f0de] to-[#dbfae1] border border-[#d8f0de] rounded-xl p-8">
                  <div className="max-w-2xl mx-auto text-center">
                    <div className="w-16 h-16 bg-[#87d498] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Globe size={32} className="text-white " />
                    </div>
                    <h2
                      className={`text-2xl font-bold text-gray-900 mb-3 ${newsreader.className}`}
                    >
                      Ready to Generate Your Portfolio
                    </h2>
                    <p className="text-gray-700 mb-6">
                      We&apos;ll create a beautiful, professional portfolio
                      website featuring your {selectedProjects.length} selected{" "}
                      {selectedProjects.length === 1 ? "project" : "projects"}{" "}
                      and deploy it to GitHub Pages.
                    </p>

                    <button
                      onClick={generatePortfolio}
                      disabled={generating}
                      className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-lg bg-[#87d498] hover:bg-[#72b681] transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold text-lg shadow-lg"
                    >
                      {generating ? (
                        <>
                          <Loader2 size={24} className="animate-spin" />
                          <span>Generating Website...</span>
                        </>
                      ) : (
                        <>
                          <span>Generate Website</span>
                        </>
                      )}
                    </button>

                    {generating && (
                      <p className="text-sm text-gray-600 mt-4">
                        This may take 30-60 seconds...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Result Section */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  {result.error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={24} className="text-red-600 mt-1" />
                        <div>
                          <h3
                            className={`text-lg font-bold text-red-900 mb-2 ${newsreader.className}`}
                          >
                            Generation Failed
                          </h3>
                          <p className="text-red-700">{result.error}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle
                          size={24}
                          className="text-green-600 mt-1"
                        />
                        <div className="flex-1">
                          <h3
                            className={`text-lg font-bold text-green-900 mb-2 ${newsreader.className}`}
                          >
                            Portfolio Generated Successfully!
                          </h3>
                          <p className="text-green-700 mb-4">
                            {result.message}
                          </p>
                          {result.url && (
                            <div className="flex flex-col sm:flex-row gap-3">
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                              >
                                <ExternalLink size={18} />
                                <span>View Your Portfolio</span>
                              </a>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(result.url!);
                                }}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
                              >
                                <Code size={18} />
                                <span>Copy URL</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Info Section */}
              <div className="mt-8 bg-[#d8f0de] border border-[#d8f0de] rounded-xl p-6">
                <h3
                  className={`text-lg font-bold text-gray-900 mb-3 ${newsreader.className}`}
                >
                  How it works
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#87d498] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <p className="text-gray-700">
                      We analyse your selected projects and generate compelling
                      descriptions.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#87d498] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <p className="text-gray-700">
                      A beautiful, responsive portfolio website is created with
                      modern design
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#87d498] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <p className="text-gray-700">
                      Your portfolio is automatically deployed to GitHub Pages
                      at username.github.io
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
