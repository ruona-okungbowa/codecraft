"use client";

import { AgentProps } from "@/types/interview";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi/vapi.sdk";
import { Message } from "@/types/vapi";
import { createClient } from "@/lib/supabase/client";
import { interviewer } from "@/lib/vapi/interviewer";

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

const Agent = ({ userName, interviewId }: AgentProps) => {
  const router = useRouter();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [feedbackGenerating, setFeedbackGenerating] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [interviewProgress, setInterviewProgress] = useState({
    current: 0,
    total: 0,
    percentage: 0,
  });
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [userResponseBuffer, setUserResponseBuffer] = useState<string[]>([]);

  // Ref to track latest values for callbacks without triggering re-renders
  const progressRef = useRef(interviewProgress);
  const currentQuestionRef = useRef(currentQuestion);
  const userResponseBufferRef = useRef(userResponseBuffer);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Keep refs in sync
  useEffect(() => {
    progressRef.current = interviewProgress;
  }, [interviewProgress]);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    userResponseBufferRef.current = userResponseBuffer;
  }, [userResponseBuffer]);

  // Track mount status and cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleDisconnect = useCallback(() => {
    // Save any remaining buffered responses before ending
    const buffer = userResponseBufferRef.current;
    const question = currentQuestionRef.current;
    const progress = progressRef.current;

    if (buffer.length > 0 && question) {
      const combinedAnswer = buffer.join(" ");
      console.log("Saving final buffered response:", {
        question: question,
        answer: combinedAnswer,
      });

      const controller = new AbortController();
      fetch("/api/vapi/save-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY}`,
        },
        body: JSON.stringify({
          interviewId,
          question: question,
          answer: combinedAnswer,
          questionIndex: progress.current,
        }),
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!isMountedRef.current) return;
          const data = await res.json();
          if (!res.ok) {
            console.error("Failed to save final response:", data);
          } else {
            console.log("Final response saved:", data);
          }
        })
        .catch((error) => {
          if (error.name === "AbortError") return;
          console.error("Failed to save final response:", error);
        });
    }

    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  }, [interviewId]);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = async (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        console.log("Captured message:", {
          role: message.role,
          transcript: message.transcript,
        });
        setMessages((prev) => [...prev, newMessage]);

        // Handle assistant messages
        if (message.role === "assistant") {
          const isGreeting =
            message.transcript.toLowerCase().includes("ready to begin") ||
            message.transcript.toLowerCase().includes("got cut off") ||
            message.transcript
              .toLowerCase()
              .includes("could you please finish");

          // If this is a question ending (has ?), finalize the question
          if (message.transcript.includes("?") && !isGreeting) {
            // Save previous answer if exists
            if (
              userResponseBufferRef.current.length > 0 &&
              currentQuestionRef.current &&
              !currentQuestionRef.current
                .toLowerCase()
                .includes("ready to begin")
            ) {
              const combinedAnswer = userResponseBufferRef.current.join(" ");
              console.log("Saving buffered response:", {
                question: currentQuestionRef.current,
                answer: combinedAnswer,
                questionIndex: progressRef.current.current,
              });

              abortControllerRef.current = new AbortController();
              fetch("/api/vapi/save-response", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY}`,
                },
                body: JSON.stringify({
                  interviewId,
                  question: currentQuestionRef.current,
                  answer: combinedAnswer,
                  questionIndex: progressRef.current.current,
                }),
                signal: abortControllerRef.current.signal,
              })
                .then(async (res) => {
                  if (!isMountedRef.current) return;
                  const data = await res.json();
                  if (!res.ok) {
                    console.error("Failed to save response:", data);
                  } else {
                    console.log("Save response result:", data);
                  }
                  return data;
                })
                .catch((error) => {
                  if (error.name === "AbortError") return;
                  console.error("Failed to save response:", error);
                });
            }

            // Set new question and clear buffers
            setCurrentQuestion(message.transcript);
            setUserResponseBuffer([]);
            console.log("Set new question:", message.transcript);
          }
        }

        // Buffer user responses
        if (message.role === "user") {
          setUserResponseBuffer((buffer) => [...buffer, message.transcript]);
        }
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: unknown) => {
      console.error("Vapi Error:", error);
      if (
        error &&
        typeof error === "object" &&
        "type" in error &&
        error.type === "start-method-error"
      ) {
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
  }, [callStatus, handleDisconnect, interviewId]);

  // Fetch total questions when component mounts
  useEffect(() => {
    if (!interviewId) return;

    const fetchQuestions = async () => {
      try {
        setQuestionsLoading(true);
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
          setQuestions(data.questions || []);
          // Initialize progress with total questions
          setInterviewProgress((prev) => ({
            ...prev,
            total: data.questions?.length || 0,
          }));
          console.log("Fetched questions for interview:", data.questions);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchQuestions();
  }, [interviewId]);

  // Auto-end interview when all questions answered (using server-side progress)
  useEffect(() => {
    if (
      callStatus === CallStatus.ACTIVE &&
      interviewProgress.current >= interviewProgress.total &&
      interviewProgress.total > 0
    ) {
      console.log(
        `All ${interviewProgress.total} questions answered. Waiting for assistant to finish speaking before ending...`
      );
      // Give the assistant 15 seconds to say goodbye and wrap up
      const timeoutId = setTimeout(() => {
        handleDisconnect();
      }, 15000);

      return () => clearTimeout(timeoutId);
    }
  }, [interviewProgress, callStatus, handleDisconnect]);

  // Responses are now saved in real-time via onMessage handler

  // Poll interview progress from database during active call
  useEffect(() => {
    if (callStatus !== CallStatus.ACTIVE) return;

    const pollProgress = async () => {
      if (!isMountedRef.current) return false;

      try {
        const supabase = createClient();
        const { data: interview } = await supabase
          .from("interviews")
          .select("responses, questions, current_question_index")
          .eq("id", interviewId)
          .single();

        if (!isMountedRef.current) return false;

        if (interview) {
          const current = interview.responses?.length || 0;
          const total = interview.questions?.length || 0;
          const percentage =
            total > 0 ? Math.round((current / total) * 100) : 0;

          console.log("Progress update:", { current, total, percentage });
          setInterviewProgress({ current, total, percentage });

          // Stop polling if all questions answered
          if (current >= total && total > 0) {
            return true; // Signal to stop polling
          }
        }
        return false;
      } catch (error) {
        console.error("Error polling progress:", error);
        return false;
      }
    };

    let intervalId: NodeJS.Timeout;

    const startPolling = async () => {
      // Initial poll
      const shouldStop = await pollProgress();

      if (!shouldStop && isMountedRef.current) {
        // Poll every 2 seconds until complete
        intervalId = setInterval(async () => {
          if (!isMountedRef.current) {
            clearInterval(intervalId);
            return;
          }
          const shouldStop = await pollProgress();
          if (shouldStop) {
            clearInterval(intervalId);
          }
        }, 2000);
      }
    };

    startPolling();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [callStatus, interviewId]);

  // Generate feedback when interview finishes
  useEffect(() => {
    const generateFeedback = async () => {
      if (callStatus !== CallStatus.FINISHED || feedbackGenerating) {
        return;
      }

      // Wait longer for final responses to be saved (increased from 1s to 3s)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      if (!isMountedRef.current) return;

      setFeedbackGenerating(true);
      setFeedbackError(null);

      const toast = (await import("react-hot-toast")).default;

      try {
        // Verify responses are saved before generating feedback
        const supabase = createClient();
        const { data: interview } = await supabase
          .from("interviews")
          .select("responses, questions")
          .eq("id", interviewId)
          .single();

        console.log(
          `Interview has ${interview?.responses?.length || 0} responses saved`
        );

        // Retry logic for feedback generation (max 5 attempts with longer waits)
        let attempts = 0;
        let response;
        let lastError;

        while (attempts < 5 && isMountedRef.current) {
          attempts++;
          console.log(
            `Attempting to generate feedback (attempt ${attempts}/5)...`
          );

          response = await fetch("/api/feedback/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ interviewId }),
          });

          if (response.ok) {
            break;
          }

          const errorData = await response.json();
          lastError = errorData;

          // If responses aren't ready yet, wait longer and retry
          if (
            response.status === 400 &&
            (errorData.error?.toLowerCase().includes("no responses") ||
              errorData.error?.toLowerCase().includes("responses found"))
          ) {
            console.log(
              `Responses not ready yet (${errorData.details || "no details"}), waiting 3 seconds before retry...`
            );
            await new Promise((resolve) => setTimeout(resolve, 3000));
            continue;
          }

          // For other errors, don't retry
          break;
        }

        if (!isMountedRef.current) return;

        if (!response || !response.ok) {
          // Check for rate limit error
          if (
            response?.status === 429 ||
            lastError?.code === "RATE_LIMIT_EXCEEDED"
          ) {
            throw new Error(
              lastError?.details ||
                "Rate limit exceeded. Please try again later."
            );
          }

          // Provide more detailed error message
          const errorMsg =
            lastError?.error || "Failed to generate feedback after 5 attempts";
          const errorDetails = lastError?.details
            ? ` Details: ${lastError.details}`
            : "";
          throw new Error(errorMsg + errorDetails);
        }

        const data = await response.json();
        console.log("Feedback API response:", data);

        if (!isMountedRef.current) return;

        if (data.success) {
          console.log("Feedback generated successfully, redirecting...");

          // Close loading screen
          setFeedbackGenerating(false);

          // Show success toast
          toast.success("Interview completed! Viewing your feedback...", {
            duration: 2000,
          });

          // Redirect after a brief moment
          setTimeout(() => {
            const feedbackUrl = `/interview/${interviewId}/feedback`;
            console.log("Redirecting to feedback page:", feedbackUrl);
            router.push(feedbackUrl);
          }, 500);
        } else {
          console.error("Feedback generation returned success: false");
          throw new Error("Feedback generation failed");
        }
      } catch (error: unknown) {
        if (!isMountedRef.current) return;

        console.error("Error generating feedback:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setFeedbackError(errorMessage);

        toast.error(`Failed to generate feedback: ${errorMessage}`);

        setFeedbackGenerating(false);

        setTimeout(() => {
          if (!isMountedRef.current) return;
          console.log("Redirecting to interview list after error");
          router.push("/mock-interview");
        }, 3000);
      }
    };

    generateFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus, interviewId, router]); // Removed feedbackGenerating to prevent double generation

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    console.log("=== Starting VAPI Call ===");
    console.log("Questions:", questions);
    console.log("Total questions:", questions.length);

    if (!questions || questions.length === 0) {
      console.error("No questions available!");
      setCallStatus(CallStatus.INACTIVE);
      return;
    }

    // Format questions as a numbered list
    const formattedQuestions = questions
      .map((q, i) => `${i + 1}. ${q}`)
      .join("\n");

    console.log("Formatted questions:", formattedQuestions);
    console.log("Interviewer config:", interviewer);

    try {
      console.log("Calling vapi.start...");
      const result = await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
      console.log("VAPI start result:", result);
    } catch (error) {
      console.error("Failed to start call:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const latestMessage = messages[messages.length - 1]?.content;
  const lastMessageRole = messages[messages.length - 1]?.role;
  const isUserSpeaking =
    !isSpeaking &&
    callStatus === CallStatus.ACTIVE &&
    lastMessageRole === "user";
  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  // Determine current status
  const getCurrentStatus = () => {
    if (callStatus === CallStatus.INACTIVE) return "idle";
    if (callStatus === CallStatus.CONNECTING) return "connecting";
    if (callStatus === CallStatus.FINISHED) return "finished";
    if (isSpeaking) return "speaking";
    if (isUserSpeaking) return "listening";
    return "processing";
  };

  const status = getCurrentStatus();

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-5xl mx-auto">
      {/* Current Question Display */}
      {callStatus === CallStatus.ACTIVE && currentQuestion && (
        <div className="w-full bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <div
                className={`w-3 h-3 rounded-full mt-1 ${
                  status === "listening"
                    ? "bg-green-500 animate-pulse"
                    : status === "processing"
                      ? "bg-yellow-500 animate-pulse"
                      : status === "speaking"
                        ? "bg-blue-500 animate-pulse"
                        : "bg-gray-300"
                }`}
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">
                Current Question
              </p>
              <p className="text-base sm:text-lg font-medium text-gray-900 leading-relaxed">
                {currentQuestion}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Generation Loading */}
      {feedbackGenerating && (
        <div
          className="fixed inset-0 bg-white/90 flex items-center justify-center z-50 cursor-wait"
          role="alert"
          aria-live="assertive"
          aria-busy="true"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"
              aria-label="Loading feedback"
            ></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Generating Your Feedback
            </h3>
            <p className="text-gray-600">Analyzing your responses...</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* AI Interviewer Card */}
        <div
          className={`bg-white border-2 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[320px] shadow-sm transition-all duration-300 ${
            isSpeaking && callStatus === CallStatus.ACTIVE
              ? "border-blue-500 shadow-blue-100 shadow-lg"
              : "border-gray-200"
          }`}
        >
          <div className="relative mb-12">
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center relative transition-all duration-300 ${
                isSpeaking && callStatus === CallStatus.ACTIVE
                  ? "bg-blue-200 scale-110"
                  : "bg-blue-100"
              }`}
            >
              <Image
                src="/ai-avatar.png"
                alt="AI Interviewer"
                width={80}
                height={80}
                className="object-contain w-16 h-16 sm:w-20 sm:h-20"
              />
              {isSpeaking && callStatus === CallStatus.ACTIVE && (
                <>
                  <span className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-30" />
                  {/* Audio wave animation */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-blue-500 rounded-full animate-pulse"
                        style={{
                          height: "16px",
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: "0.6s",
                        }}
                      />
                    ))}
                  </div>
                </>
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
          <p
            className={`text-sm mt-1 font-medium ${
              isSpeaking && callStatus === CallStatus.ACTIVE
                ? "text-blue-600"
                : "text-gray-500"
            }`}
          >
            {callStatus === CallStatus.ACTIVE
              ? isSpeaking
                ? "🗣️ Speaking..."
                : "👂 Listening..."
              : callStatus === CallStatus.CONNECTING
                ? "🔄 Connecting..."
                : callStatus === CallStatus.FINISHED
                  ? "✅ Interview Complete"
                  : "⏸️ Ready to interview"}
          </p>
        </div>

        {/* User Card */}
        <div
          className={`bg-white border-2 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[320px] shadow-sm transition-all duration-300 ${
            isUserSpeaking
              ? "border-green-500 shadow-green-100 shadow-lg"
              : "border-gray-200"
          }`}
        >
          <div className="relative mb-12">
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center overflow-hidden relative transition-all duration-300 ${
                isUserSpeaking ? "bg-green-200 scale-110" : "bg-gray-200"
              }`}
            >
              <User size={64} className="text-gray-400" />
              {isUserSpeaking && (
                <>
                  <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-30" />
                  {/* Audio wave animation */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-green-500 rounded-full animate-pulse"
                        style={{
                          height: "16px",
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: "0.6s",
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {callStatus === CallStatus.ACTIVE && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{userName}</h3>
          <p
            className={`text-sm mt-1 font-medium ${
              isUserSpeaking ? "text-green-600" : "text-gray-500"
            }`}
          >
            {callStatus === CallStatus.ACTIVE
              ? isUserSpeaking
                ? "🎤 Speaking..."
                : "👂 Listening..."
              : callStatus === CallStatus.CONNECTING
                ? "🔄 Joining..."
                : callStatus === CallStatus.FINISHED
                  ? "✅ Done"
                  : "You"}
          </p>
        </div>
      </div>

      {messages.length > 0 && latestMessage && (
        <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
          <p className="text-gray-800 text-center text-sm sm:text-base animate-fade-in">
            {latestMessage}
          </p>
        </div>
      )}

      <div className="w-full flex justify-center mt-4">
        {callStatus !== CallStatus.ACTIVE ? (
          <button
            onClick={handleCall}
            disabled={callStatus === CallStatus.CONNECTING || questionsLoading}
            className="relative inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {callStatus === CallStatus.CONNECTING && (
              <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-75" />
            )}
            <Phone size={20} className="relative z-10 sm:w-6 sm:h-6" />
            <span className="relative z-10">
              {questionsLoading
                ? "Loading..."
                : isCallInactiveOrFinished
                  ? "Start Call"
                  : ". . ."}
            </span>
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <PhoneOff size={20} className="sm:w-6 sm:h-6" />
            <span>End Call</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Agent;
