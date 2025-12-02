"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Folder,
  Globe,
  TrendingUp,
  Lightbulb,
  Briefcase,
  Mic,
  FileText,
  Settings,
  ChevronDown,
  LogOut,
  User,
  Github,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Folder, label: "Projects", href: "/projects" },
  { icon: Globe, label: "Portfolio Website", href: "/portfolio" },
  { icon: TrendingUp, label: "Skill Gap Analysis", href: "/skill-gap" },
  {
    icon: Lightbulb,
    label: "Project Recommendations",
    href: "/project-recommendations",
  },
  { icon: Briefcase, label: "Job Match", href: "/job-match" },
  { icon: Mic, label: "Mock Interview", href: "/mock-interview" },
  { icon: FileText, label: "README Generator", href: "/readme-generator" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function CollapsibleSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserName(
            user.user_metadata?.name?.split(" ")[0] ||
              user.email?.split("@")[0] ||
              "User"
          );
          setUserEmail(user.email || "");
          setUserAvatar(user.user_metadata?.avatar_url || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showDropdown]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();

      const toast = await import("react-hot-toast");
      toast.default.success("Logged out successfully!");

      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      const toast = await import("react-hot-toast");
      toast.default.error("Failed to log out. Please try again.");
      setLoggingOut(false);
    }
  };

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`hidden md:flex fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex-col p-4 transition-all duration-300 z-50 ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-4 py-2 mb-6 overflow-hidden hover:opacity-80 transition-opacity"
      >
        <Image
          src="/icon-logo.png"
          alt="CodeCraft"
          width={32}
          height={32}
          className="h-8 w-8 shrink-0"
        />
        <h1
          className={`text-lg font-bold text-black whitespace-nowrap transition-opacity duration-300 ${
            isExpanded ? "opacity-100" : "opacity-0 w-0"
          }`}
        >
          CodeCraft
        </h1>
      </Link>

      {/* Navigation */}
      <nav className="grow flex flex-col justify-between overflow-hidden">
        <ul className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "text-white font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={isActive ? { backgroundColor: "#4c96e1" } : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span
                    className={`text-sm whitespace-nowrap transition-opacity duration-300 ${
                      isExpanded ? "opacity-100" : "opacity-0 w-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Bottom Section */}
        <div className="space-y-4">
          <button
            onClick={async () => {
              await fetch("/api/github/repos", { method: "POST" });
              window.location.reload();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-lg h-11 px-4 font-medium transition-all duration-300 transform hover:scale-105"
            style={{
              backgroundColor: "rgba(76, 150, 225, 0.1)",
              color: "#4c96e1",
            }}
          >
            <Github className="w-5 h-5 shrink-0" />
            <span
              className={`text-sm whitespace-nowrap transition-opacity duration-300 ${
                isExpanded ? "opacity-100" : "opacity-0 w-0"
              }`}
            >
              Sync GitHub
            </span>
          </button>

          <div
            className="border-t border-gray-200 pt-4 relative"
            ref={dropdownRef}
          >
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              onMouseEnter={() => setShowDropdown(true)}
              className="w-full flex items-center justify-between text-left p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {userAvatar ? (
                  <Image
                    alt="User avatar"
                    className="w-10 h-10 rounded-full shrink-0 object-cover"
                    src={userAvatar}
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 shrink-0 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
                <div
                  className={`transition-opacity duration-300 ${
                    isExpanded ? "opacity-100" : "opacity-0 w-0"
                  }`}
                >
                  <p className="font-medium text-sm whitespace-nowrap text-gray-900">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 whitespace-nowrap truncate max-w-[150px]">
                    {userEmail}
                  </p>
                </div>
              </div>
              {isExpanded && (
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 shrink-0 transition-transform duration-200 ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && isExpanded && (
              <div
                className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-fadeIn"
                onMouseLeave={() => setShowDropdown(false)}
              >
                <Link
                  href="/settings"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">
                    {loggingOut ? "Logging out..." : "Log out"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
}
