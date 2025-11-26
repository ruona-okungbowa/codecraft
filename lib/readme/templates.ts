// lib/readme/templates.ts

import { ReadmeResearch } from "./types";

/**
 * Fallback templates for when MCP is unavailable
 * These provide default README structures based on project type
 */

export function getProjectFallbackTemplate(
  projectType: string = "general"
): ReadmeResearch {
  const baseTemplate: ReadmeResearch = {
    sections: [
      "Overview",
      "Features",
      "Tech Stack",
      "Installation",
      "Usage",
      "Configuration",
      "Contributing",
      "License",
    ],
    badgeStyles: [
      "https://img.shields.io/badge/style-flat--square",
      "https://img.shields.io/badge/style-for--the--badge",
    ],
    visualElements: [
      "Screenshots",
      "Demo GIF",
      "Architecture diagram",
      "Code examples",
    ],
    trendingFeatures: [
      "GitHub Actions badges",
      "Code coverage badges",
      "Version badges",
      "License badges",
      "Download stats",
    ],
    exampleStructures: [
      "# Project Title\n\n## Overview\n\n## Features\n\n## Installation\n\n## Usage",
    ],
    source: "fallback",
  };

  // Customize based on project type
  if (
    projectType.toLowerCase().includes("react") ||
    projectType.toLowerCase().includes("frontend")
  ) {
    return {
      ...baseTemplate,
      sections: [
        "Overview",
        "Demo",
        "Features",
        "Tech Stack",
        "Installation",
        "Usage",
        "Components",
        "Styling",
        "Deployment",
        "Contributing",
        "License",
      ],
      trendingFeatures: [
        ...baseTemplate.trendingFeatures,
        "Vercel deployment badge",
        "Bundle size badge",
        "TypeScript badge",
      ],
    };
  }

  if (
    projectType.toLowerCase().includes("api") ||
    projectType.toLowerCase().includes("backend")
  ) {
    return {
      ...baseTemplate,
      sections: [
        "Overview",
        "Features",
        "Tech Stack",
        "Installation",
        "Configuration",
        "API Endpoints",
        "Authentication",
        "Database Schema",
        "Testing",
        "Deployment",
        "Contributing",
        "License",
      ],
      trendingFeatures: [
        ...baseTemplate.trendingFeatures,
        "API documentation badge",
        "Uptime badge",
        "Response time badge",
      ],
    };
  }

  return baseTemplate;
}

export function getProfileFallbackTemplate(): ReadmeResearch {
  return {
    sections: [
      "Introduction/Bio",
      "About Me",
      "Tech Stack",
      "Featured Projects",
      "GitHub Stats",
      "Recent Activity",
      "Skills",
      "Contact/Social Links",
    ],
    badgeStyles: [
      "https://img.shields.io/badge/style-flat",
      "https://img.shields.io/badge/style-for--the--badge",
    ],
    visualElements: [
      "GitHub stats card",
      "Top languages card",
      "Streak stats",
      "Trophy showcase",
      "Activity graph",
      "Profile views counter",
    ],
    trendingFeatures: [
      "GitHub readme stats",
      "Typing SVG for animated text",
      "Skill icons",
      "Social media badges",
      "Visitor counter",
      "Latest blog posts",
    ],
    exampleStructures: [
      "# Hi there 👋\n\n## About Me\n\n## Tech Stack\n\n## Featured Projects\n\n## GitHub Stats\n\n## Connect with Me",
    ],
    source: "fallback",
  };
}
