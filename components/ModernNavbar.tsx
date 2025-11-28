"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import CodeCraftLogo from "./CodeCraftLogo";

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
          className="max-w-3xl w-full rounded-full px-6 py-2.5 flex items-center justify-between"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Left: Logo */}
          <Link href="/" className="flex items-center group">
            <CodeCraftLogo size="sm" variant="full" />
          </Link>

          {/* Right: Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 ml-auto">
            <button
              onClick={() => scrollToSection("features")}
              className="font-medium text-sm transition-colors duration-200"
              style={{
                color: "oklch(0.56 0.014 240)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "oklch(0.63 0.24 240)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "oklch(0.56 0.014 240)";
              }}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="font-medium text-sm transition-colors duration-200"
              style={{
                color: "oklch(0.56 0.014 240)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "oklch(0.63 0.24 240)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "oklch(0.56 0.014 240)";
              }}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="font-medium text-sm transition-colors duration-200"
              style={{
                color: "oklch(0.56 0.014 240)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "oklch(0.63 0.24 240)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "oklch(0.56 0.014 240)";
              }}
            >
              How It Works
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 ml-auto"
            style={{ color: "oklch(0.56 0.014 240)" }}
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
              className="fixed top-0 right-0 bottom-0 w-64 z-50 lg:hidden shadow-2xl"
              style={{
                backgroundColor: "oklch(0.99 0.002 240)",
              }}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div
                  className="flex items-center justify-between p-6"
                  style={{
                    borderBottom: "1px solid oklch(0.93 0.006 240)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <CodeCraftLogo size="md" variant="icon" />
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ color: "oklch(0.56 0.014 240)" }}
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col p-6 gap-4">
                  <button
                    onClick={() => scrollToSection("features")}
                    className="font-medium text-left py-2 transition-colors duration-200"
                    style={{ color: "oklch(0.56 0.014 240)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "oklch(0.63 0.24 240)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "oklch(0.56 0.014 240)";
                    }}
                  >
                    Features
                  </button>
                  <button
                    onClick={() => scrollToSection("about")}
                    className="font-medium text-left py-2 transition-colors duration-200"
                    style={{ color: "oklch(0.56 0.014 240)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "oklch(0.63 0.24 240)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "oklch(0.56 0.014 240)";
                    }}
                  >
                    About
                  </button>
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="font-medium text-left py-2 transition-colors duration-200"
                    style={{ color: "oklch(0.56 0.014 240)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "oklch(0.63 0.24 240)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "oklch(0.56 0.014 240)";
                    }}
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
