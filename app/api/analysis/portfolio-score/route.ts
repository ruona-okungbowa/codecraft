import { calculatePortfolioScore } from "@/lib/scoring/portfolio";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Project, ProjectRow } from "@/types";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json(
        { error: "Authentication failed", details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const { data: projectRows, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id);

    if (projectsError) {
      return NextResponse.json(
        {
          error: "Failed to fetch projects",
          details: projectsError.message,
        },
        { status: 500 }
      );
    }

    if (!projectRows || projectRows.length === 0) {
      return NextResponse.json({
        overallScore: 0,
        rank: "N/A",
        projectQualityScore: 0,
        techDiversityScore: 0,
        documentationScore: 0,
        consistencyScore: 0,
        professionalismScore: 0,
        breakdown: {},
        calculatedAt: new Date().toISOString(),
        message:
          "No projects found. Sync your GitHub repositories to get started.",
      });
    }

    // Transform database rows to Project interface (snake_case to camelCase)
    const projects: Project[] = projectRows.map((row: ProjectRow) => ({
      id: row.id,
      userId: row.user_id,
      githubRepoId: row.github_repo_id,
      name: row.name,
      description: row.description,
      url: row.url,
      languages: row.languages || {},
      stars: row.stars || 0,
      forks: row.forks || 0,
      lastCommitDate: row.last_commit_date
        ? new Date(row.last_commit_date)
        : undefined,
      complexityScore: row.complexity_score,
      analysedAt: row.analysed_at ? new Date(row.analysed_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));

    const scoreData = calculatePortfolioScore(projects);

    // Check if a score already exists for this user
    const { data: existingScore, error: selectError } = await supabase
      .from("portfolio_scores")
      .select("id")
      .eq("user_id", user.id)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Error checking existing score:", selectError);
    }

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
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to calculate portfolio score", details: errorMessage },
      { status: 500 }
    );
  }
}
