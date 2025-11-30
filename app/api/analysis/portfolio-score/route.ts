import { calculatePortfolioScore } from "@/lib/scoring/portfolio";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id);

    if (projectsError) {
      throw projectsError;
    }

    const scoreData = calculatePortfolioScore(projects || []);

    // Check if a score already exists for this user
    const { data: existingScore } = await supabase
      .from("portfolio_scores")
      .select("id")
      .eq("user_id", user.id)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .single();

    const scoreRecord = {
      user_id: user.id,
      overall_score: scoreData.overallScore,
      project_quality_score: scoreData.projectQualityScore,
      tech_diversity_score: scoreData.techDiversityScore,
      documentation_score: scoreData.documentationScore,
      consistency_score: scoreData.consistencyScore,
      breakdown: scoreData.breakdown,
      calculated_at: new Date().toISOString(),
    };

    if (existingScore) {
      // Update existing score
      const { error: updateError } = await supabase
        .from("portfolio_scores")
        .update(scoreRecord)
        .eq("id", existingScore.id);

      if (updateError) {
        console.error("Error updating portfolio score:", updateError);
      }
    } else {
      // Insert new score
      const { error: insertError } = await supabase
        .from("portfolio_scores")
        .insert(scoreRecord);

      if (insertError) {
        console.error("Error storing portfolio score:", insertError);
      }
    }

    return NextResponse.json({
      ...scoreData,
      calculatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Error calculating portfolio score", error);
    return NextResponse.json(
      {
        error: "Failed to calculate portfolio score",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
