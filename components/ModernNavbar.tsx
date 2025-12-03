"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function ModernNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-transparent">
      <div className="flex justify-center px-3 sm:px-4 py-3">
        <nav className="max-w-4xl w-full flex items-center justify-between whitespace-nowrap rounded-full bg-white/70 backdrop-blur-xl border border-gray-200/50 px-3 sm:px-4 py-2 shadow-2xl">
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 transition-transform duration-300 hover:scale-105"
          >
            <Image
              src="/icon-logo.png"
              alt="CodeCraft Icon"
              width={32}
              height={32}
              className="h-7 w-7 sm:h-8 sm:w-8"
            />
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              CodeCraft
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scrollToSection("features")}
              className="relative overflow-hidden h-9 flex items-center text-base font-medium text-gray-700 px-4 py-2 transition-colors nav-link"
            >
              <span className="transition-transform duration-300 ease-in-out">
                Features
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 transition-transform duration-300 ease-in-out transform translate-y-full"
                style={{ color: "#4c96e1" }}
              >
                Features
              </span>
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="relative overflow-hidden h-9 flex items-center text-base font-medium text-gray-700 px-4 py-2 transition-colors nav-link"
            >
              <span className="transition-transform duration-300 ease-in-out">
                How It Works
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 transition-transform duration-300 ease-in-out transform translate-y-full"
                style={{ color: "#4c96e1" }}
              >
                How It Works
              </span>
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="relative overflow-hidden h-9 flex items-center text-base font-medium text-gray-700 px-4 py-2 transition-colors nav-link"
            >
              <span className="transition-transform duration-300 ease-in-out">
                About
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 transition-transform duration-300 ease-in-out transform translate-y-full"
                style={{ color: "#4c96e1" }}
              >
                About
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Desktop Sign Up Button */}
          <Link
            href="/login"
            className="hidden md:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-11 px-6 text-white text-base font-bold leading-normal tracking-wide shadow-lg transition-all duration-300 transform hover:scale-105"
            style={{
              backgroundColor: "#a855f7",
              boxShadow: "0 10px 15px -3px rgba(168, 85, 247, 0.3)",
            }}
          >
            <span className="truncate">Sign Up</span>
          </Link>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-white/95 backdrop-blur-xl z-40 animate-fadeIn">
          <div className="flex flex-col items-center justify-center h-full space-y-6 px-6">
            <button
              onClick={() => scrollToSection("features")}
              className="text-2xl font-medium text-gray-700 hover:text-[#4c96e1] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-2xl font-medium text-gray-700 hover:text-[#4c96e1] transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-2xl font-medium text-gray-700 hover:text-[#4c96e1] transition-colors"
            >
              About
            </button>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 text-white text-lg font-bold leading-normal tracking-wide shadow-lg transition-all duration-300 transform hover:scale-105 mt-4"
              style={{
                backgroundColor: "#a855f7",
                boxShadow: "0 10px 15px -3px rgba(168, 85, 247, 0.3)",
              }}
            >
              <span className="truncate">Sign Up</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
