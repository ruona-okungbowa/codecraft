"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Newsreader, Sansation } from "next/font/google";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Copy, Check, ArrowLeft } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

interface Project {
  id: string;
  name: string;
  description: string;
  languages: Record<string, number>;
}

interface STARStory {
  situation: string;
  task: string;
  action: string;
  result: string;
  talkingPoints: string[];
}

interface BulletPoint {
  text: string;
  emphasis: string;
}

export default function StoryGeneratorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>("");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState<STARStory | null>(null);
  const [bullets, setBullets] = useState<BulletPoint[]>([]);
  const [copiedStory, setCopiedStory] = useState(false);
  const [copiedBullets, setCopiedBullets] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      const resolvedParams = await params;
      setProjectId(resolvedParams.id);

      try {
        const response = await fetch(`/api/projects/${resolvedParams.id}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data.project);
        } else {
          router.push("/projects");
        }
      } catch (error) {
        console.error("Error loading project:", error);
        router.push("/projects");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [params, router]);

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const [storyResponse, bulletsResponse] = await Promise.all([
        fetch("/api/ai/story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        }),
        fetch("/api/ai/bullets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        }),
      ]);

      if (storyResponse.ok) {
        const storyData = await storyResponse.json();
        setStory(storyData.story);
      }

      if (bulletsResponse.ok) {
        const bulletsData = await bulletsResponse.json();
        setBullets(bulletsData.bullets);
      }
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setGenerating(false);
    }
  };

  const copyStory = () => {
    if (!story) return;
    const text = `STAR Story: ${project?.name}\n\nSituation: ${story.situation}\n\nTask: ${story.task}\n\nAction: ${story.action}\n\nResult: ${story.result}\n\nTalking Points:\n${story.talkingPoints.map((p) => `• ${p}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopiedStory(true);
    setTimeout(() => setCopiedStory(false), 2000);
  };

  const copyBullets = () => {
    const text = bullets.map((b) => `• ${b.text}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedBullets(true);
    setTimeout(() => setCopiedBullets(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="ml-[72px] flex-1 flex items-center justify-center">
          <Loader2 size={48} className="text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="ml-[72px] flex-1 flex items-center justify-center">
          <p className="text-gray-500">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="ml-[72px] flex-1">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-10 py-6">
            <button
              onClick={() => router.push("/projects")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to Projects</span>
            </button>
            <h1
              className={`text-[28px] font-bold text-gray-900 ${newsreader.className}`}
            >
              Generate Story & Resume Bullets
            </h1>
            <p className={`text-sm text-gray-600 mt-1 ${sansation.className}`}>
              {project.name}
            </p>
          </div>
        </header>

        <main className="px-10 py-8 max-w-[1400px] mx-auto">
          {!story && !bullets.length ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={40} className="text-blue-600" />
              </div>
              <h2
                className={`text-2xl font-bold text-gray-900 mb-3 ${newsreader.className}`}
              >
                Ready to Generate Your Story?
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Generate a professional STAR story and resume bullet points for
                this project. Perfect for interviews and job applications.
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {generating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Story & Bullets
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {story && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2
                      className={`text-2xl font-bold text-gray-900 ${newsreader.className}`}
                    >
                      STAR Story
                    </h2>
                    <button
                      onClick={copyStory}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {copiedStory ? (
                        <>
                          <Check size={16} className="text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy Story
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-600 mb-2">
                        Situation
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {story.situation}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-green-600 mb-2">
                        Task
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {story.task}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-purple-600 mb-2">
                        Action
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {story.action}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-orange-600 mb-2">
                        Result
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {story.result}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Interview Talking Points
                      </h3>
                      <ul className="space-y-2">
                        {story.talkingPoints.map((point, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-gray-700"
                          >
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {bullets.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2
                      className={`text-2xl font-bold text-gray-900 ${newsreader.className}`}
                    >
                      Resume Bullet Points
                    </h2>
                    <button
                      onClick={copyBullets}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {copiedBullets ? (
                        <>
                          <Check size={16} className="text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy Bullets
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {bullets.map((bullet, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                      >
                        <span className="text-blue-600 font-bold mt-1">•</span>
                        <div className="flex-1">
                          <p className="text-gray-900 leading-relaxed">
                            {bullet.text}
                          </p>
                          <span className="text-xs text-gray-500 mt-1 inline-block">
                            Emphasis: {bullet.emphasis}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-6 py-3 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <Sparkles size={18} />
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
