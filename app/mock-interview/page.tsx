"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import { InterviewRow } from "@/types/interview";
import { getScoreColor } from "@/lib/utils/scoring";

interface InterviewWithFeedback extends InterviewRow {
  feedback?: {
    total_score: number;
  };
  hasResponses?: boolean;
}

type FocusArea = "technical" | "behavioral" | "mixed" | "systems";
type Difficulty = "entry" | "mid" | "senior" | "junior";

export default function MockInterviewClient() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewWithFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Setup form state
  const [focusArea, setFocusArea] = useState<FocusArea>("technical");
  const [difficulty, setDifficulty] = useState<Difficulty>("entry");
  const [role, setRole] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [techStack, setTechStack] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/interviews");
      if (response.ok) {
        const data = await response.json();
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
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    setGenerating(true);
    try {
      let type = "balanced";
      if (focusArea === "technical") type = "technical";
      else if (focusArea === "behavioral") type = "behavioral";
      else if (focusArea === "systems") type = "system design";
      else if (focusArea === "mixed") type = "mixed";

      const requestBody: {
        role: string;
        level: string;
        type: string;
        amount: number;
        techstack?: string;
      } = {
        role: role || "Software Developer",
        level: difficulty,
        type,
        amount: questionCount,
      };

      // Only include techstack for technical and mixed interviews
      if (type === "technical" || type === "mixed") {
        requestBody.techstack = techStack || "JavaScript, React, Node.js";
      }

      const response = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.userInterview?.id) {
          // Show success toast
          const toast = await import("react-hot-toast");
          toast.default.success("Interview generated successfully!", {
            duration: 3000,
            position: "top-center",
          });

          // Navigate to interview
          setTimeout(() => {
            router.push(`/interview/${data.userInterview.id}`);
          }, 500);
        }
      } else {
        const toast = await import("react-hot-toast");
        toast.default.error("Failed to generate interview. Please try again.");
      }
    } catch (error) {
      console.error("Error generating interview:", error);
      const toast = await import("react-hot-toast");
      toast.default.error("An error occurred. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getGradientImage = (index: number) => {
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="relative flex w-full min-h-screen bg-white">
      <CollapsibleSidebar />
      <main className="flex-1 p-8 ml-20">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-8">
            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-black text-4xl font-black leading-tight tracking-tight">
                  Mock Interview
                </p>
                <p className="text-blue-600 dark:text-slate-400 text-base font-normal leading-normal">
                  Prepare for your next interview with an AI-powered session.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-gray-900 font-bold text-[22px] leading-tight tracking-tight">
                  Interview Generation
                </h2>
                <span
                  className={`material-symbols-outlined text-gray-600 transition-transform ${
                    isFormOpen ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>

              {isFormOpen && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div className="col-span-3">
                      <h3 className="text-gray-900 text-lg font-bold leading-tight tracking-tight pb-2">
                        Focus Area
                      </h3>
                      <div className="flex w-full">
                        <div className="flex h-10 flex-1 items-center justify-center rounded-full bg-slate-200 p-1">
                          {(
                            [
                              { value: "technical", label: "Technical" },
                              { value: "behavioral", label: "Behavioral" },
                              {
                                value: "systems",
                                label: "System Design",
                              },
                              {
                                value: "mixed",
                                label: "Mixed",
                              },
                            ] as const
                          ).map((option) => (
                            <label
                              key={option.value}
                              className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-full px-2 has-[:checked]:bg-white  has-[:checked]:shadow-sm has-[:checked]:text-blue-600 text-blue-600  text-sm font-medium leading-normal transition-colors"
                            >
                              <span className="truncate">{option.label}</span>
                              <input
                                checked={focusArea === option.value}
                                className="invisible w-0"
                                name="focus-area"
                                type="radio"
                                value={option.value}
                                onChange={() => setFocusArea(option.value)}
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Role Input */}
                    <div>
                      <h3 className="text-gray-900 text-lg font-bold leading-tight tracking-tight pb-2">
                        Role
                      </h3>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g., Full Stack Developer, Frontend Engineer"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Difficulty */}
                    <div>
                      <h3 className="text-gray-900  text-lg font-bold leading-tight tracking-tight pb-2">
                        Difficulty
                      </h3>
                      <div className="flex w-full">
                        <div className="flex h-10 flex-1 items-center justify-center rounded-full bg-slate-200  p-1">
                          {(
                            [
                              { value: "entry", label: "Entry-level" },
                              { value: "junior", label: "Junior-level" },
                              { value: "mid", label: "Mid-level" },
                              { value: "senior", label: "Senior" },
                            ] as const
                          ).map((option) => (
                            <label
                              key={option.value}
                              className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-full px-2 has-[:checked]:bg-white  has-[:checked]:shadow-sm has-[:checked]:text-blue-600 text-blue-600 text-sm font-medium leading-normal transition-colors"
                            >
                              <span className="truncate">{option.label}</span>
                              <input
                                checked={difficulty === option.value}
                                className="invisible w-0"
                                name="difficulty"
                                type="radio"
                                value={option.value}
                                onChange={() => setDifficulty(option.value)}
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Number of Questions */}
                    <div className="col-span-3">
                      <h3 className="text-gray-900 text-lg font-bold leading-tight tracking-tight pb-2">
                        Number of Questions: {questionCount}
                      </h3>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={questionCount}
                        onChange={(e) =>
                          setQuestionCount(Number(e.target.value))
                        }
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>1</span>
                        <span>10</span>
                      </div>
                    </div>

                    {/* Tech Stack - Only show for technical and mixed interviews */}
                    {(focusArea === "technical" || focusArea === "mixed") && (
                      <div className="col-span-3">
                        <h3 className="text-gray-900 text-lg font-bold leading-tight tracking-tight pb-2">
                          Tech Stack
                        </h3>
                        <input
                          type="text"
                          value={techStack}
                          onChange={(e) => setTechStack(e.target.value)}
                          placeholder="e.g., JavaScript, React, Node.js, PostgreSQL"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Separate multiple technologies with commas
                        </p>
                      </div>
                    )}

                    {/* Start Interview Button */}
                    <div className="flex justify-end mt-8 col-span-3">
                      <button
                        onClick={handleStartInterview}
                        disabled={generating}
                        className="flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-blue-600 text-white font-bold text-base leading-normal shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {generating ? "Generating..." : "Generate Interview"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4 mb-8 mt-12">
              <h1 className="text-black text-4xl font-black leading-tight tracking-tight min-w-72">
                Your Mock Interview Sessions
              </h1>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading interviews...</p>
              </div>
            ) : interviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 mt-8 bg-white rounded border-2 border-dashed border-slate-300">
                <span className="material-symbols-outlined text-7xl text-blue-600/50">
                  upcoming
                </span>
                <h2 className="text-2xl font-bold text-gray-900  mt-4">
                  No Interviews Yet!
                </h2>
                <p className="text-slate-500 mt-2 max-w-md">
                  Configure your interview settings above and click Start
                  Interview to begin.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {interviews.map((interview, index) => (
                  <div
                    key={interview.id}
                    className="flex items-center gap-0 rounded-lg bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                  >
                    <div
                      className="w-60 h-60 shrink-0 bg-center bg-no-repeat bg-cover"
                      style={{
                        backgroundImage: getGradientImage(index),
                      }}
                    ></div>
                    <div className="flex-1 flex items-center justify-between p-6 gap-6">
                      <div className="flex flex-col gap-2">
                        {interview.feedback ? (
                          <p
                            className={`${getScoreColor(interview.feedback.total_score)} text-sm font-medium leading-normal`}
                          >
                            Score: {interview.feedback.total_score}%
                          </p>
                        ) : interview.hasResponses ? (
                          <p className="text-blue-600  text-sm font-medium leading-normal">
                            In Progress
                          </p>
                        ) : (
                          <p className="text-slate-800 text-sm font-medium leading-normal">
                            Pending
                          </p>
                        )}
                        <h3 className="text-gray-900 text-xl font-bold leading-tight tracking-tight">
                          {interview.type === "technical"
                            ? "Technical"
                            : interview.type === "behavioral"
                              ? "Behavioral"
                              : "Mixed"}
                          : {interview.role}
                        </h3>
                        <div className="flex flex-col gap-1 mt-2">
                          <p className="text-slate-600  text-base font-normal leading-normal">
                            Difficulty:{" "}
                            {interview.level.charAt(0).toUpperCase() +
                              interview.level.slice(1)}{" "}
                            Level , Number of Questions:{" "}
                            {interview.questions?.length}
                          </p>
                          <p className="text-slate-600 text-base font-normal leading-normal">
                            {interview.feedback ? "Completed" : "Generated"}:{" "}
                            {formatDate(interview.created_at)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (interview.feedback) {
                            router.push(`/interview/${interview.id}/feedback`);
                          } else {
                            router.push(`/interview/${interview.id}`);
                          }
                        }}
                        className={`shrink-0 flex items-center justify-center rounded-full h-10 px-6 ${
                          interview.feedback
                            ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        } text-sm font-medium leading-normal transition-colors`}
                      >
                        <span className="truncate">
                          {interview.feedback
                            ? "Review Interview"
                            : "Start Interview"}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
