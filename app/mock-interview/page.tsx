"use client";

import { useRouter } from "next/navigation";
import { Newsreader, Sansation } from "next/font/google";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Mic, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

const InterviewPage = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="ml-[72px] flex-1">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-10 py-6">
            <h1
              className={`text-[28px] font-bold text-gray-900 ${newsreader.className}`}
            >
              Mock Interview
            </h1>
            <p className={`text-sm text-gray-600 mt-1 ${sansation.className}`}>
              Prepare for your next interview with AI-powered practice sessions
            </p>
          </div>
        </header>

        <main className="px-10 py-8 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #f97316, #ef4444)",
                }}
              >
                <Mic size={40} className="text-white" />
              </div>

              <h2
                className={`text-3xl font-bold text-gray-900 mb-4 ${newsreader.className}`}
              >
                Ready to Practice?
              </h2>

              <p
                className={`text-base text-gray-600 mb-8 leading-relaxed ${sansation.className}`}
              >
                Start an AI-powered mock interview session to practice your
                responses, get real-time feedback, and build confidence for your
                next opportunity.
              </p>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} className="text-blue-600" />
                  </div>
                  <p className={`text-sm text-gray-700 ${sansation.className}`}>
                    AI-powered questions tailored to your portfolio
                  </p>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} className="text-green-600" />
                  </div>
                  <p className={`text-sm text-gray-700 ${sansation.className}`}>
                    Real-time feedback on your responses
                  </p>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} className="text-purple-600" />
                  </div>
                  <p className={`text-sm text-gray-700 ${sansation.className}`}>
                    Practice behavioral and technical questions
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/interview")}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <span>Generate Interview</span>
                <ArrowRight size={20} />
              </motion.button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default InterviewPage;
