import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractSkillsFromProjects } from "@/lib/analysis/extractSkills";
import {
  calculateSkillGaps,
  getSkillGapSummary,
} from "@/lib/analysis/calculateSkillGaps";
import type { Role } from "@/types/skills";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { targetRole } = body;

    // Validate target role
    const validRoles: Role[] = ["frontend", "backend", "fullstack", "devops"];
    if (!targetRole || !validRoles.includes(targetRole)) {
      return NextResponse.json(
        {
          error: `Invalid target role. Must be one of: ${validRoles.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check if analysis already exists and is recent (< 1 hour for better UX)
    const { data: existingAnalysis } = await supabase
      .from("skill_gaps")
      .select("*")
      .eq("user_id", user.id)
      .eq("target_role", targetRole)
      .order("analysed_at", { ascending: false })
      .limit(1)
      .single();

    if (existingAnalysis) {
      const analysedAt = new Date(existingAnalysis.analysed_at);
      const now = new Date();
      const hoursSinceAnalysis =
        (now.getTime() - analysedAt.getTime()) / (1000 * 60 * 60);

      // Return cached result if less than 1 hour old
      if (hoursSinceAnalysis < 1) {
        const analysis = calculateSkillGaps(
          existingAnalysis.present_skills,
          targetRole
        );
        const summary = getSkillGapSummary(analysis);

        return NextResponse.json({
          analysis,
          summary,
          cached: true,
          analysedAt: existingAnalysis.analysed_at,
        });
      }
    }

    // Fetch user's projects (prioritize portfolio and recent projects)
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("in_portfolio", { ascending: false })
      .order("last_commit_date", { ascending: false })
      .limit(20); // Limit to 20 most relevant projects for speed

    if (projectsError) {
      throw new Error(`Failed to fetch projects: ${projectsError.message}`);
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json(
        {
          error:
            "No projects found. Please analyze some GitHub repositories first.",
        },
        { status: 404 }
      );
    }

    // Get GitHub token for fetching dependency files
    const githubToken = user.user_metadata?.provider_token;

    // Extract skills from projects (with GitHub access for dependency files)
    const presentSkills = await extractSkillsFromProjects(
      projects,
      githubToken
    );

    // Calculate skill gaps
    const analysis = calculateSkillGaps(presentSkills, targetRole);
    const summary = getSkillGapSummary(analysis);

    // Store analysis in database
    const { error: insertError } = await supabase.from("skill_gaps").insert({
      user_id: user.id,
      target_role: targetRole,
      present_skills: presentSkills,
      missing_skills: analysis.missingSkills,
      gap_priority: {
        essential: analysis.missingSkills.essential,
        preferred: analysis.missingSkills.preferred,
        niceToHave: analysis.missingSkills.niceToHave,
      },
      // analyzed_at will be set automatically by DEFAULT NOW() in database
    });

    if (insertError) {
      console.error("Error storing skill gaps:", insertError);
      // Continue anyway - we can still return the analysis
    }

    return NextResponse.json({
      analysis,
      summary,
      cached: false,
      analysedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error analyzing skill gaps:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze skill gaps",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
