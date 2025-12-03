import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface AnalyticsResponse {
  portfolioScoreChange: number;
  storiesGenerated: number;
  bulletsGenerated: number;
  readmesGenerated: number;
  interviewsCompleted: number;
  skillCoverageChange: number;
  daysActive: number;
  generatedAt: string;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all data in parallel for better performance
    const [
      { data: scores },
      { data: projects },
      { count: interviewsCount },
      { data: skillGaps },
      { data: userData },
    ] = await Promise.all([
      supabase
        .from("portfolio_scores")
        .select("overall_score, calculated_at")
        .eq("user_id", user.id)
        .order("calculated_at", { ascending: false })
        .limit(2),
      supabase.from("projects").select("id").eq("user_id", user.id),
      supabase
        .from("mock_interviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("skill_gaps")
        .select("coverage_percentage, analyzed_at")
        .eq("user_id", user.id)
        .order("analyzed_at", { ascending: false })
        .limit(2),
      supabase.from("users").select("created_at").eq("id", user.id).single(),
    ]);

    // Calculate portfolio score change
    const portfolioScoreChange =
      scores && scores.length >= 2
        ? scores[0].overall_score - scores[1].overall_score
        : 0;

    // Calculate skill coverage change (deterministic)
    const skillCoverageChange =
      skillGaps && skillGaps.length >= 2
        ? skillGaps[0].coverage_percentage - skillGaps[1].coverage_percentage
        : 0;

    // Get generated content counts
    const projectIds = projects?.map((p) => p.id) || [];
    let storiesCount = 0;
    let bulletsCount = 0;
    let readmesCount = 0;

    if (projectIds.length > 0) {
      const [stories, bullets, readmes] = await Promise.all([
        supabase
          .from("generated_content")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
          .eq("content_type", "story"),
        supabase
          .from("generated_content")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
          .eq("content_type", "bullet"),
        supabase
          .from("generated_content")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
          .eq("content_type", "readme"),
      ]);

      storiesCount = stories.count || 0;
      bulletsCount = bullets.count || 0;
      readmesCount = readmes.count || 0;
    }

    // Calculate days active
    const daysActive = userData
      ? Math.floor(
          (Date.now() - new Date(userData.created_at).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    const response: AnalyticsResponse = {
      portfolioScoreChange,
      storiesGenerated: storiesCount,
      bulletsGenerated: bulletsCount,
      readmesGenerated: readmesCount,
      interviewsCompleted: interviewsCount || 0,
      skillCoverageChange,
      daysActive: Math.max(1, daysActive),
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
