import Agent from "@/components/Agent";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Newsreader } from "next/font/google";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const Interview = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="ml-[72px] flex-1">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-10 py-6">
            <h1
              className={`text-[28px] font-bold text-gray-900 ${newsreader.className}`}
            >
              Generate Interview
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Generate the interview for your to practice
            </p>
          </div>
        </header>

        <main className="px-10 py-8 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <Agent userName="You" userId="user1" type="generate" />
        </main>
      </div>
    </div>
  );
};

export default Interview;
