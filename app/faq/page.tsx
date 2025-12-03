"use client";

import { useState } from "react";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import { ChevronDown, Search, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Getting Started",
    question: "What is CodeCraft?",
    answer:
      "CodeCraft is an AI-powered career readiness platform that transforms your GitHub repositories into interview-ready portfolio materials. We analyse your projects, generate professional content, and help you prepare for technical interviews.",
  },
  {
    category: "Getting Started",
    question: "How do I get started?",
    answer:
      "Simply sign in with your GitHub account, sync your repositories, and let CodeCraft analyse your portfolio. You'll get an instant portfolio score and can start generating content for your projects.",
  },
  {
    category: "Getting Started",
    question: "Is CodeCraft free?",
    answer:
      "CodeCraft offers a free tier with core features including portfolio analysis, basic content generation, and mock interviews. Premium features may be available in the future.",
  },
  {
    category: "Portfolio Analysis",
    question: "How is my portfolio score calculated?",
    answer:
      "Your portfolio score (0-100) is based on five key factors: Project Quality (complexity, stars, forks), Technical Diversity (variety of languages and technologies), Documentation (README quality, comments), Consistency (commit frequency, maintenance), and Professionalism (code organisation, best practices).",
  },
  {
    category: "Portfolio Analysis",
    question: "How often should I sync my repositories?",
    answer:
      "We recommend syncing your repositories whenever you make significant updates to your projects. You can manually sync anytime from the Projects page. Your portfolio score will be recalculated with each sync.",
  },
  {
    category: "Portfolio Analysis",
    question: "Can I exclude certain repositories from my portfolio?",
    answer:
      "Yes! On the Projects page, click the three-dot menu on any project and select 'Remove from Portfolio'. This won't delete the project but will exclude it from your portfolio score calculation.",
  },
  {
    category: "Content Generation",
    question: "What is a STAR story?",
    answer:
      "STAR (Situation, Task, Action, Result) is a structured method for answering behavioural interview questions. CodeCraft analyses your projects and generates compelling STAR stories that highlight your technical achievements.",
  },
  {
    category: "Content Generation",
    question: "Can I edit the generated content?",
    answer:
      "Absolutely! All generated content (STAR stories, resume bullets, READMEs) can be edited and customised. We provide a starting point, but you should always personalise the content to match your voice and experience.",
  },
  {
    category: "Content Generation",
    question: "How does the README generator work?",
    answer:
      "Our AI analyses your repository's code, structure, and dependencies to generate a professional README. You can choose from multiple templates (Professional, Minimal, Detailed) and deploy directly to GitHub.",
  },
  {
    category: "Job Matching",
    question: "How accurate is the job match analysis?",
    answer:
      "Our AI analyses both the job description and your portfolio to provide a realistic match percentage. It considers required skills, preferred skills, experience level, and technology stack. The analysis includes specific recommendations for improving your match.",
  },
  {
    category: "Job Matching",
    question: "Can I save multiple job matches?",
    answer:
      "Yes! Every job match analysis is automatically saved to your history. You can view, compare, and revisit past matches anytime from the Job Match page.",
  },
  {
    category: "Job Matching",
    question: "What are learning paths?",
    answer:
      "When you have missing skills for a job, CodeCraft provides curated learning resources including free courses, tutorials, documentation, and practice platforms. Resources are prioritised based on skill importance.",
  },
  {
    category: "Mock Interviews",
    question: "How do mock interviews work?",
    answer:
      "Choose your focus area (Technical, Behavioural, System Design, or Mixed), difficulty level, and number of questions. Our AI generates tailored interview questions based on your profile and target role. You can practice and receive detailed feedback.",
  },
  {
    category: "Mock Interviews",
    question: "Can I practice specific technologies?",
    answer:
      "Yes! For technical interviews, you can specify your tech stack (e.g., 'React, Node.js, PostgreSQL') and the questions will be tailored to those technologies.",
  },
  {
    category: "Mock Interviews",
    question: "How is interview feedback calculated?",
    answer:
      "Our AI evaluates your responses based on technical accuracy, completeness, communication clarity, and problem-solving approach. You'll receive a detailed score breakdown and specific suggestions for improvement.",
  },
  {
    category: "Project Recommendations",
    question: "How are project recommendations generated?",
    answer:
      "After completing a skill gap analysis, CodeCraft recommends projects that will help you learn missing skills. Each recommendation includes difficulty level, time estimate, tech stack, and learning resources.",
  },
  {
    category: "Project Recommendations",
    question: "Can I track my progress on recommended projects?",
    answer:
      "Yes! Mark projects as 'In Progress' or 'Completed' to track your learning journey. Completed projects will be reflected in your next skill gap analysis.",
  },
  {
    category: "Privacy & Security",
    question: "Is my GitHub data secure?",
    answer:
      "Yes. We only access public repository data through GitHub's official API. We never access private repositories unless explicitly authorised. Your data is encrypted and stored securely.",
  },
  {
    category: "Privacy & Security",
    question: "Can I delete my data?",
    answer:
      "Yes. You can log out anytime from the Settings page. If you want to completely delete your account and all associated data, please contact our support team.",
  },
  {
    category: "Privacy & Security",
    question: "Do you share my data with third parties?",
    answer:
      "No. We never sell or share your personal data with third parties. We only use your data to provide CodeCraft services and improve your experience.",
  },
  {
    category: "Technical Issues",
    question: "Why isn't my portfolio score updating?",
    answer:
      "Try manually syncing your repositories from the Projects page. If the issue persists, ensure your GitHub repositories are public and contain valid code. Clear your browser cache and try again.",
  },
  {
    category: "Technical Issues",
    question: "The AI generation is taking too long. What should I do?",
    answer:
      "AI content generation typically takes 10-30 seconds. If it takes longer, check your internet connection and try again. For large repositories, generation may take up to a minute.",
  },
  {
    category: "Technical Issues",
    question: "I'm getting an error when syncing repositories. Help!",
    answer:
      "Common causes include: expired GitHub authentication (try logging out and back in), rate limiting (wait a few minutes), or network issues. If the problem persists, contact support with the error message.",
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    ...Array.from(new Set(faqs.map((faq) => faq.category))),
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="flex min-h-screen bg-[#f6f7f8]">
      <CollapsibleSidebar />

      <main className="flex-1 p-4 sm:p-8 lg:p-12 ml-0 md:ml-20 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#4c96e1]/10 mb-4 sm:mb-6">
              <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-[#4c96e1]" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-3 sm:mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-4">
              Find answers to common questions about CodeCraft. Can&apos;t find
              what you&apos;re looking for? Contact our support team.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#4c96e1] focus:border-transparent text-slate-900 placeholder:text-slate-400 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6 sm:mb-8 overflow-x-auto">
            <div className="flex gap-2 pb-2 min-w-max sm:min-w-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-[#4c96e1] text-white"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <p className="text-slate-500 text-base sm:text-lg">
                No questions found matching your search.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="text-xs sm:text-sm font-medium text-[#4c96e1] mb-1 block">
                        {faq.category}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {faq.question}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 sm:w-6 sm:h-6 text-slate-400 transition-transform shrink-0 ${
                        openItems.has(index) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openItems.has(index) && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-5">
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
