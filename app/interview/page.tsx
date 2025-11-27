"use client";
import Agent from "@/components/Agent";
import DashboardSidebar from "@/components/DashboardSidebar";
import { createClient } from "@/lib/supabase/client";
import { Newsreader } from "next/font/google";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const Interview = () => {
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Set user ID
          setUserId(user.id);

          // Set username - try multiple sources
          if (user.user_metadata?.name) {
            setUserName(user.user_metadata.name.split(" ")[0]);
          } else if (user.user_metadata?.user_name) {
            setUserName(user.user_metadata.user_name);
          } else if (user.email) {
            setUserName(user.email.split("@")[0]);
          }
        }
      } catch (error) {
        console.error("Error getting user", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <Loader2 size={48} className="text-gray-400 animate-spin" />
      </div>
    );
  }

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
            <p className="text-sm text-gray-600 mt-1">
              Practice your interview skills with AI
            </p>
          </div>
        </header>

        <main className="px-10 py-8 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <Agent userName={userName} userId={userId} type="generate" />
        </main>
      </div>
    </div>
  );
};

export default Interview;
