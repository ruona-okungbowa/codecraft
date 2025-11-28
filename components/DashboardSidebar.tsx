"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Folder,
  Target,
  BarChart3,
  Mic,
  FileText,
  Settings,
  ChevronDown,
  LogOut,
  HelpCircle,
  Globe,
  RefreshCw,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Folder, label: "Projects", href: "/projects" },
  { icon: Globe, label: "Portfolio Website", href: "/portfolio" },
  { icon: Target, label: "Skill Gap", href: "/skill-gap" },
  {
    icon: Lightbulb,
    label: "Recommendations",
    href: "/project-recommendations",
  },
  { icon: BarChart3, label: "Job Match", href: "/job-match" },
  { icon: Mic, label: "Mock Interview", href: "/mock-interview" },
  { icon: BookOpen, label: "README Generator", href: "/readme-generator" },
];

interface UserData {
  name: string;
  email: string;
  avatar_url?: string;
}

export default function DashboardSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [projectCount, setProjectCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserData({
            name:
              user.user_metadata?.name || user.email?.split("@")[0] || "User",
            email: user.email || "",
            avatar_url: user.user_metadata?.avatar_url,
          });
        }

        // Fetch project count
        const projectsRes = await fetch("/api/projects");
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjectCount(projectsData.projects?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.aside
      initial={{ width: 72 }}
      animate={{ width: isExpanded ? 240 : 72 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-sm z-40 transition-all duration-200"
    >
      {/* Logo Section */}
      <div className="h-[72px] flex items-center justify-center border-b border-gray-200 px-4">
        <Image
          src="/icon-logo.png"
          alt="CodeCraft"
          width={40}
          height={40}
          className="shrink-0"
        />
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="ml-3 text-xl font-bold text-gray-900 whitespace-nowrap"
            >
              CodeCraft
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Section */}
      <nav className="p-2 flex flex-col gap-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const showBadge = item.href === "/projects" && projectCount > 0;

          return (
            <Link
              key={index}
              href={item.href}
              className={`
                relative flex items-center gap-3 h-12 px-4 rounded-lg transition-all duration-150
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r"
                  transition={{ duration: 0.2 }}
                />
              )}
              <Icon size={18} className="shrink-0" />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {showBadge && isExpanded && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                >
                  {projectCount}
                </motion.span>
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-4 h-px bg-gray-200" />

        {/* Sync Button */}
        <button
          onClick={async () => {
            setSyncing(true);
            try {
              const response = await fetch("/api/github/repos", {
                method: "POST",
              });
              if (response.ok) {
                // Refresh project count
                const projectsRes = await fetch("/api/projects");
                if (projectsRes.ok) {
                  const projectsData = await projectsRes.json();
                  setProjectCount(projectsData.projects?.length || 0);
                }
                // Reload the page to show updated data
                window.location.reload();
              }
            } catch (error) {
              console.error("Error syncing:", error);
            } finally {
              setSyncing(false);
            }
          }}
          disabled={syncing}
          className={`flex items-center gap-3 h-12 px-4 rounded-lg transition-all duration-150 ${
            syncing
              ? "bg-blue-50 text-blue-600 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <RefreshCw
            size={18}
            className={`shrink-0 ${syncing ? "animate-spin" : ""}`}
          />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                {syncing ? "Syncing..." : "Sync GitHub"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Settings */}
        <Link
          href="/settings"
          className="flex items-center gap-3 h-12 px-4 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-150"
        >
          <Settings size={18} className="shrink-0" />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 w-full border-t border-gray-200 bg-white p-4">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 w-full hover:bg-gray-50 rounded-lg p-2 transition-colors"
        >
          {userData?.avatar_url ? (
            <Image
              src={userData.avatar_url}
              alt={userData.name}
              width={40}
              height={40}
              className="rounded-full shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shrink-0">
              {userData ? getInitials(userData.name) : "U"}
            </div>
          )}
          <AnimatePresence>
            {isExpanded && userData && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 text-left overflow-hidden"
              >
                <div className="text-sm font-medium text-gray-900 truncate">
                  {userData.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {userData.email}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {isExpanded && (
            <ChevronDown size={16} className="text-gray-400 shrink-0" />
          )}
        </button>

        {/* User Dropdown Menu */}
        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-20 left-2 right-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2"
            >
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings size={16} className="text-gray-600" />
                <span className="text-sm text-gray-700">Settings</span>
              </Link>
              <Link
                href="/help"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <HelpCircle size={16} className="text-gray-600" />
                <span className="text-sm text-gray-700">Help & Support</span>
              </Link>
              <div className="my-2 h-px bg-gray-200" />
              <button
                onClick={async () => {
                  const { createClient } = await import(
                    "@/lib/supabase/client"
                  );
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
              >
                <LogOut size={16} className="text-red-600" />
                <span className="text-sm text-red-600">Sign Out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
