import { NextResponse } from "next/server";
import { extractSkillsFromProjects } from "@/lib/analysis/extractSkills";
import {
  calculateSkillGaps,
  getSkillGapSummary,
} from "@/lib/analysis/calculateSkillGaps";
import type { Role } from "@/types/skills";

/**
 * Test endpoint for skill gap analysis
 * GET /api/test/skill-gaps?role=frontend
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get("role") || "frontend") as Role;

    // Mock project data
    const mockProjects = [
      {
        name: "Todo App",
        languages: { JavaScript: 60, HTML: 20, CSS: 20 },
        description: "A task management app built with React and local storage",
      },
      {
        name: "Weather Dashboard",
        languages: { TypeScript: 70, CSS: 30 },
        description:
          "Weather app using Next.js and Tailwind CSS with API integration",
      },
      {
        name: "API Server",
        languages: { TypeScript: 80, JavaScript: 20 },
        description:
          "REST API built with Node.js, Express, and PostgreSQL database",
      },
      {
        name: "Portfolio Website",
        languages: { HTML: 40, CSS: 40, JavaScript: 20 },
        description: "Personal portfolio with responsive design",
      },
    ];

    console.log("Extracting skills from mock projects...");
    // Note: Test endpoint doesn't use GitHub token, so it will use OpenAI fallback
    const presentSkills = await extractSkillsFromProjects(mockProjects);
    console.log("Present skills:", presentSkills);

    console.log(`Analysing gaps for ${role} role...`);
    const analysis = calculateSkillGaps(presentSkills, role);
    const summary = getSkillGapSummary(analysis);

    // Test all roles
    const allRoles: Role[] = ["frontend", "backend", "fullstack", "devops"];
    const allAnalyses: Record<string, unknown> = {};

    for (const r of allRoles) {
      const roleAnalysis = calculateSkillGaps(presentSkills, r);
      const roleSummary = getSkillGapSummary(roleAnalysis);
      allAnalyses[r] = {
        coverage: roleAnalysis.coveragePercentage,
        status: roleSummary.status,
        missingEssential: roleAnalysis.missingSkills.essential.length,
        missingPreferred: roleAnalysis.missingSkills.preferred.length,
      };
    }

    return NextResponse.json({
      success: true,
      mockProjects: mockProjects.map((p) => p.name),
      presentSkills,
      selectedRole: role,
      analysis,
      summary,
      allRoles: allAnalyses,
      validation: {
        hasPresent: presentSkills.length > 0,
        hasMissing:
          analysis.missingSkills.essential.length > 0 ||
          analysis.missingSkills.preferred.length > 0,
        coverageInRange:
          analysis.coveragePercentage >= 0 &&
          analysis.coveragePercentage <= 100,
      },
    });
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
