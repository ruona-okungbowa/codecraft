"use client";

import { AgentProps } from "@/types/interview";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Phone, PhoneOff, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi/vapi.sdk";

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

const Agent = ({ userName, userId, type }: AgentProps) => {
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
    const onError = (error: Error) => console.log("Error", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
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

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) router.push("/dashboard");
  }, [messages, callStatus, type, userId, router]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
      variableValues: {
        username: userName,
        userid: userId,
      },
    });
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

        {/* User Card */}
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

      {/* Message Display */}
      {messages.length > 0 && latestMessage && (
        <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
          <p className="text-gray-800 text-center text-base animate-fade-in">
            {latestMessage}
          </p>
        </div>
      )}

      {/* Call Button */}
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
