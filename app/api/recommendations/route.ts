import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateRecommendations,
  generateRecommendationsAsync,
} from "@/lib/recommendations/engine";
import type { SkillGapAnalysis } from "@/types/skills";

export async function GET() {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch most recent skill gap analysis
    const { data: skillGapData, error: skillGapError } = await supabase
      .from("skill_gaps")
      .select("*")
      .eq("user_id", user.id)
      .order("analysed_at", { ascending: false })
      .limit(1)
      .single();

    if (skillGapError || !skillGapData) {
      return NextResponse.json(
        {
          error: "No skill gap analysis found",
          message: "Please complete a skill gap analysis first",
        },
        { status: 404 }
      );
    }

    // 3. Transform database result to SkillGapAnalysis type
    const skillGapAnalysis: SkillGapAnalysis = {
      role: skillGapData.target_role,
      presentSkills: skillGapData.present_skills,
      missingSkills: skillGapData.missing_skills,
      coveragePercentage: Math.round(
        (skillGapData.present_skills.length /
          (skillGapData.present_skills.length +
            skillGapData.missing_skills.essential.length)) *
          100
      ),
    };

    // 4. Generate recommendations (with optional live data from roadmap.sh)
    const useLiveData = request.nextUrl.searchParams.get("live") === "true";
    const recommendations = await generateRecommendationsAsync(
      skillGapAnalysis,
      useLiveData
    );

    // 5. Fetch user's saved and started projects
    const { data: userProjects } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_id", user.id);

    // 6. Return response
    return NextResponse.json({
      recommendations,
      skillGapAnalysis,
      userProjects: userProjects || [],
      cached: false,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      {
        error: "Failed to generate recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
