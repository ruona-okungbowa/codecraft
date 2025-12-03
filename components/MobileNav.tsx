"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Folder, label: "Projects", href: "/projects" },
  { icon: Globe, label: "Portfolio", href: "/portfolio" },
  { icon: TrendingUp, label: "Skill Gap", href: "/skill-gap" },
  {
    icon: Lightbulb,
    label: "Recommendations",
    href: "/project-recommendations",
  },
  { icon: Briefcase, label: "Job Match", href: "/job-match" },
  { icon: Mic, label: "Interview", href: "/mock-interview" },
  { icon: FileText, label: "README", href: "/readme-generator" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/icon-logo.png"
            alt="CodeCraft"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <h1 className="text-lg font-bold text-black">CodeCraft</h1>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <nav
        className={`md:hidden fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ul className="p-4 space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={index}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "text-white font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={isActive ? { backgroundColor: "#4c96e1" } : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
