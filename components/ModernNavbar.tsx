"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
    <>
      {/* Navbar container */}
      <div className="absolute top-3 left-0 right-0 z-50 flex justify-center px-4">
        <nav
          className="max-w-2xl w-full rounded-full px-5 py-1.5 flex items-center justify-between"
          style={{
            backgroundColor: "rgba(55, 65, 81, 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Left: Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/icon-logo.png"
              alt="Logo"
              width={28}
              height={28}
              className="w-7 h-7"
            />
          </Link>

          {/* Right: Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 ml-auto">
            <button
              onClick={() => scrollToSection("features")}
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm"
            >
              How It Works
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-1.5 ml-auto"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              style={{ backdropFilter: "blur(4px)" }}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-gray-800 z-50 lg:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/icon-logo.png"
                      alt="Logo"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col p-6 gap-4">
                  <button
                    onClick={() => scrollToSection("features")}
                    className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-left py-2"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => scrollToSection("about")}
                    className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-left py-2"
                  >
                    About
                  </button>
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-left py-2"
                  >
                    How It Works
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for navbar height */}
      <div className="h-16"></div>
    </>
  );
}
