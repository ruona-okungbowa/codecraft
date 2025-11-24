"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin, Twitter } from "lucide-react";
import { Newsreader, Sansation } from "next/font/google";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sansation = Sansation({
  subsets: ["latin"],
  weight: ["400"],
});

export default function Footer() {
  return (
    <footer className="bg-gray-600 text-gray-300 py-16 px-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Top Section - 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1 - Brand */}
          <div className="max-w-[250px]">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/icon-logo.png"
                alt="CodeCraft Logo"
                width={24}
                height={24}
              />
              <h3
                className={`text-white text-2xl font-bold ${newsreader.className}`}
              >
                CodeCraft
              </h3>
            </div>
            <p className={`text-sm text-gray-400 ${sansation.className}`}>
              Turn your GitHub repos into interview-ready portfolio stories.
            </p>
          </div>

          {/* Column 2 - Product */}
          <div>
            <h4
              className={`text-white text-base font-semibold mb-4 ${newsreader.className}`}
            >
              Product
            </h4>
            <ul className={`space-y-3 ${sansation.className}`}>
              <li>
                <Link
                  href="#features"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Resources */}
          <div>
            <h4
              className={`text-white text-base font-semibold mb-4 ${newsreader.className}`}
            >
              Resources
            </h4>
            <ul className={`space-y-3 ${sansation.className}`}>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/api"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Legal */}
          <div>
            <h4
              className={`text-white text-base font-semibold mb-4 ${newsreader.className}`}
            >
              Legal
            </h4>
            <ul className={`space-y-3 ${sansation.className}`}>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className={`text-sm text-gray-400 ${sansation.className}`}>
            © {new Date().getFullYear()} CodeCraft. Built by developers, for
            developers.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </Link>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github size={20} />
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
