"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Newsreader, Sansation } from "next/font/google";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Agent from "@/components/Agent";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

export default function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [interviewId, setInterviewId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [interviewData, setInterviewData] = useState<{
    type: string;
    role: string;
    level: string;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params;
      setInterviewId(resolvedParams.id);

      try {
        const response = await fetch(`/api/interviews/${resolvedParams.id}`);
        if (response.ok) {
          const data = await response.json();
          setInterviewData(data.interview);
        } else {
          router.push("/mock-interview");
          return;
        }

        const userResponse = await fetch("/api/user");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserName(userData.user.user_metadata?.user_name || "User");
          setUserId(userData.user.id);
        }
      } catch (error) {
        console.error("Error loading interview:", error);
        router.push("/mock-interview");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 size={48} className="text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1
            className={`text-3xl font-bold text-gray-900 mb-2 ${newsreader.className}`}
          >
            Interview in Progress
          </h1>
          <p className={`text-gray-600 ${sansation.className}`}>
            Answer the questions naturally and take your time
          </p>
        </motion.div>

        <Agent
          userName={userName}
          userId={userId}
          interviewId={interviewId}
          role={interviewData?.role}
          level={interviewData?.level}
        />
      </div>
    </div>
  );
}
