"use client";

import Link from "next/link";
import Image from "next/image";

export default function ModernNavbar() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-transparent">
      <div className="flex justify-center px-4 py-3">
        <nav className="max-w-4xl w-full flex items-center justify-between whitespace-nowrap rounded-full bg-white/70 backdrop-blur-xl border border-gray-200/50 px-4 py-2 shadow-2xl">
          <Link
            href="/"
            className="flex items-center gap-2 transition-transform duration-300 hover:scale-105"
          >
            <Image
              src="/icon-logo.png"
              alt="CodeCraft Icon"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-gray-900">CodeCraft</span>
          </Link>

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

          <Link
            href="/login"
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-11 px-6 text-white text-base font-bold leading-normal tracking-wide shadow-lg transition-all duration-300 transform hover:scale-105"
            style={{
              backgroundColor: "#4c96e1",
              boxShadow: "0 10px 15px -3px rgba(76, 150, 225, 0.3)",
            }}
          >
            <span className="truncate">Sign Up</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
