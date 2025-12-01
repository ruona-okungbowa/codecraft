"use client";

import { AgentProps } from "@/types/interview";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Phone, PhoneOff, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi/vapi.sdk";
import { Message } from "@/types/vapi";
import { createClient } from "@/lib/supabase/client";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({ userName, interviewId, role, level }: AgentProps) => {
  const router = useRouter();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [feedbackGenerating, setFeedbackGenerating] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [responsesSaved, setResponsesSaved] = useState(false);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: unknown) => {
      console.error("Vapi Error:", error);
      const err = error as { type?: string };
      if (err.type === "start-method-error") {
        console.error(
          "Failed to start call. Check your Vapi workflow configuration."
        );
        setCallStatus(CallStatus.INACTIVE);
      }
    };

    vapi.on("call-start", () => {
      console.log("Call started");
      onCallStart();
    });
    vapi.on("call-end", () => {
      console.log("Call ended");
      onCallEnd();
    });
    vapi.on("message", onMessage);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("error", onError);
    };
  }, []);

  // Fetch total questions when component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("/api/vapi/get-questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY}`,
          },
          body: JSON.stringify({ interviewId }),
        });

        if (response.ok) {
          const data = await response.json();
          setTotalQuestions(data.questions?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    if (interviewId) {
      fetchQuestions();
    }
  }, [interviewId]);

  const handleDisconnect = useCallback(() => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  }, []);

  useEffect(() => {
    // Filter out greetings and only count actual interview questions
    const assistantQuestions = messages.filter((m) => {
      if (m.role !== "assistant") return false;

      const content = m.content.toLowerCase();

      // Exclude common greetings and non-questions
      const isGreeting =
        content.includes("ready to begin") ||
        content.includes("let's get started") ||
        content.includes("welcome") ||
        content.includes("hello") ||
        content.includes("hi there") ||
        content.includes("good morning") ||
        content.includes("good afternoon") ||
        content.includes("good evening") ||
        (!content.includes("?") && content.length < 100); // Short non-questions

      // Must contain a question mark and not be a greeting
      return m.content.includes("?") && !isGreeting;
    });

    if (
      assistantQuestions.length >= totalQuestions &&
      totalQuestions > 0 &&
      callStatus === CallStatus.ACTIVE
    ) {
      console.log(
        `All ${totalQuestions} questions completed. Ending interview.`
      );
      const timeoutId = setTimeout(() => {
        handleDisconnect();
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [messages, totalQuestions, callStatus, handleDisconnect]);

  // Save responses when interview ends (client-side backup)
  useEffect(() => {
    let isSaving = false;

    const saveResponses = async () => {
      if (
        callStatus !== CallStatus.FINISHED ||
        responsesSaved ||
        messages.length === 0 ||
        isSaving
      ) {
        return;
      }

      isSaving = true;

      try {
        // Extract Q&A pairs from messages
        const pairs: Array<{
          question: string;
          answer: string;
          questionIndex: number;
        }> = [];

        for (let i = 0; i < messages.length - 1; i++) {
          const current = messages[i];
          const next = messages[i + 1];

          const isGreeting =
            current.content.toLowerCase().includes("ready to begin") ||
            current.content.toLowerCase().includes("let's get started") ||
            current.content.toLowerCase().includes("welcome");

          // If assistant asks question and user answers
          if (
            current.role === "assistant" &&
            current.content.includes("?") &&
            !isGreeting &&
            next.role === "user"
          ) {
            pairs.push({
              question: current.content,
              answer: next.content,
              questionIndex: pairs.length,
            });
          }
        }

        if (pairs.length === 0) {
          console.warn("No Q&A pairs found in messages");
          return;
        }

        console.log(`Saving ${pairs.length} responses client-side...`);

        const supabase = createClient();
        const { error } = await supabase
          .from("interviews")
          .update({
            responses: pairs.map((pair) => ({
              question: pair.question,
              answer: pair.answer,
              questionIndex: pair.questionIndex,
              timestamp: new Date().toISOString(),
            })),
          })
          .eq("id", interviewId);

        if (error) {
          console.error("Error saving responses:", error);
          const toast = (await import("react-hot-toast")).default;
          toast.error("Failed to save interview responses");
        } else {
          console.log(`Successfully saved ${pairs.length} responses`);
          setResponsesSaved(true);
        }
      } catch (error) {
        console.error("Error in saveResponses:", error);
        const toast = (await import("react-hot-toast")).default;
        toast.error("Failed to save interview responses");
      }
    };

    saveResponses();
  }, [callStatus, messages, interviewId, responsesSaved]);

  // Generate feedback after responses are saved
  useEffect(() => {
    let isMounted = true;

    const generateFeedback = async () => {
      if (
        callStatus !== CallStatus.FINISHED ||
        feedbackGenerating ||
        !responsesSaved
      ) {
        return;
      }

      // Wait a moment for responses to be fully saved
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFeedbackGenerating(true);
      setFeedbackError(null);

      const toast = (await import("react-hot-toast")).default;

      try {
        const response = await fetch("/api/feedback/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interviewId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate feedback");
        }

        const data = await response.json();

        if (!isMounted) return;

        if (data.success) {
          toast.success("Feedback generated successfully!");

          setTimeout(() => {
            if (isMounted) {
              router.push(`/interview/${interviewId}/feedback`);
            }
          }, 1000);
        } else {
          throw new Error("Feedback generation failed");
        }
      } catch (error: unknown) {
        if (!isMounted) return;

        console.error("Error generating feedback:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setFeedbackError(errorMessage);

        toast.error(`Failed to generate feedback: ${errorMessage}`);

        setTimeout(() => {
          if (isMounted) {
            router.push("/mock-interview");
          }
        }, 3000);
      } finally {
        if (isMounted) {
          setFeedbackGenerating(false);
        }
      }
    };

    generateFeedback();

    return () => {
      isMounted = false;
    };
  }, [callStatus, interviewId, router, feedbackGenerating, responsesSaved]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    if (!assistantId) {
      console.error("NEXT_PUBLIC_VAPI_ASSISTANT_ID is not configured");
      setCallStatus(CallStatus.INACTIVE);
      return;
    }

    console.log("Starting call with assistant:", assistantId);
    console.log("Variables:", {
      userName,
      interviewId,
      role,
      level,
      totalQuestions,
    });

    try {
      await vapi.start(assistantId, {
        variableValues: {
          userName,
          interviewId,
          role: role || "Software Engineer",
          level: level || "junior",
          totalQuestions: totalQuestions.toString(),
          currentQuestionIndex: "0",
        },
      });
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const latestMessage = messages[messages.length - 1]?.content;
  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  // Count only actual interview questions, not greetings
  const assistantQuestions = messages.filter((m) => {
    if (m.role !== "assistant") return false;

    const content = m.content.toLowerCase();

    // Exclude common greetings
    const isGreeting =
      content.includes("ready to begin") ||
      content.includes("let's get started") ||
      content.includes("welcome") ||
      content.includes("hello") ||
      content.includes("hi there") ||
      content.includes("good morning") ||
      content.includes("good afternoon") ||
      content.includes("good evening") ||
      (!content.includes("?") && content.length < 100);

    return m.content.includes("?") && !isGreeting;
  });
  const currentQuestionCount = assistantQuestions.length;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-5xl mx-auto">
      {/* Feedback Generation Loading Modal */}
      {feedbackGenerating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Generating Your Feedback
            </h3>
            <p className="text-gray-600">
              Analyzing your responses and preparing detailed feedback...
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {feedbackError && (
        <div className="fixed bottom-4 right-4 bg-red-50 border-2 border-red-200 rounded-lg p-4 max-w-md shadow-lg z-50">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-red-800 font-semibold">
                Feedback Generation Failed
              </p>
              <p className="text-red-600 text-sm mt-1">{feedbackError}</p>
              <p className="text-red-500 text-xs mt-2">
                Redirecting to interview list...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      {totalQuestions > 0 && callStatus === CallStatus.ACTIVE && (
        <div className="w-full bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Interview Progress
            </span>
            <span className="text-sm font-semibold text-blue-600">
              Question {currentQuestionCount} of {totalQuestions}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((currentQuestionCount / totalQuestions) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[320px] shadow-sm">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center relative">
              <Image
                src="/ai-avatar.png"
                alt="AI Interviewer"
                width={80}
                height={80}
                className="object-contain"
              />
              {isSpeaking && callStatus === CallStatus.ACTIVE && (
                <span className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-30" />
              )}
            </div>
            {callStatus === CallStatus.ACTIVE && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            AI Interviewer
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {callStatus === CallStatus.ACTIVE
              ? "Speaking..."
              : callStatus === CallStatus.CONNECTING
                ? "Connecting..."
                : "Ready to interview"}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[320px] shadow-sm">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <User size={64} className="text-gray-400" />
            </div>
            {callStatus === CallStatus.ACTIVE && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{userName}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {callStatus === CallStatus.ACTIVE
              ? "In call"
              : callStatus === CallStatus.CONNECTING
                ? "Joining..."
                : "You"}
          </p>
        </div>
      </div>

      {messages.length > 0 && latestMessage && (
        <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
          <p className="text-gray-800 text-center text-base animate-fade-in">
            {latestMessage}
          </p>
        </div>
      )}

      <div className="w-full flex justify-center mt-4">
        {callStatus !== CallStatus.ACTIVE ? (
          <button
            onClick={handleCall}
            disabled={callStatus === CallStatus.CONNECTING}
            className="relative inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {callStatus === CallStatus.CONNECTING && (
              <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-75" />
            )}
            <Phone size={24} className="relative z-10" />
            <span className="relative z-10">
              {isCallInactiveOrFinished ? "Call" : ". . ."}
            </span>
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="inline-flex items-center gap-2 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <PhoneOff size={24} />
            <span>End Call</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Agent;
