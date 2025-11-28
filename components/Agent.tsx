"use client";

import { AgentProps } from "@/types/interview";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Phone, PhoneOff, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi/vapi.sdk";
import { Message } from "@/types/vapi";

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

const Agent = ({ userName, userId, interviewId, role, level }: AgentProps) => {
  const router = useRouter();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

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

  const handleGenerateFeedback = async () => {
    try {
      const response = await fetch("/api/feedback/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          console.error("Failed to generate feedback");
          router.push("/mock-interview");
        }
      } else {
        console.error("Feedback generation failed");
        router.push("/mock-interview");
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      router.push("/mock-interview");
    }
  };

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      handleGenerateFeedback();
    }
  }, [callStatus, handleGenerateFeedback]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    if (!assistantId) {
      console.error("NEXT_PUBLIC_VAPI_ASSISTANT_ID is not configured");
      setCallStatus(CallStatus.INACTIVE);
      return;
    }

    console.log("Starting call with assistant:", assistantId);
    console.log("Variables:", { userName, interviewId, role, level });

    try {
      await vapi.start(assistantId, {
        variableValues: {
          userName,
          interviewId,
          role: role || "Software Engineer",
          level: level || "junior",
        },
      });
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };
  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const latestMessage = messages[messages.length - 1]?.content;
  const isCallINactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-5xl mx-auto">
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
              {isCallINactiveOrFinished ? "Call" : ". . ."}
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
