import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGitHubClient } from "@/lib/github/client";
import { analyseCommitHistory } from "../../analysis";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ repoId: string }> }
) {
  try {
    const { repoId } = await params; // Await params first

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", repoId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const githubToken = session?.provider_token;

    if (!githubToken) {
      return NextResponse.json(
        { error: "GitHub token not found" },
        { status: 400 }
      );
    }

    const octokit = createGitHubClient(githubToken);

    const urlParts = project.url.split("/");
    const owner = urlParts[urlParts.length - 2];
    const repoName = urlParts[urlParts.length - 1];

    console.log(`Analysing ${owner}/${repoName}...`);

    const analysis = await analyseCommitHistory(octokit, owner, repoName);
    const complexityScore = calculateComplexityScore(project, analysis);

    console.log(`Complexity score: ${complexityScore}`);
    console.log(`Analysis:`, analysis);

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        complexity_score: complexityScore,
        analysed_at: new Date().toISOString(), // Fixed typo: anaysed_at -> analysed_at
      })
      .eq("id", repoId);

    if (updateError) {
      console.error("Error updating project:", updateError);
      return NextResponse.json(
        { error: "Failed to update project" },
        { status: 500 }
      );
    }

    console.log(`Successfully updated project ${repoName}`);

    return NextResponse.json({
      analysis,
      complexityScore,
    });
  } catch (error: any) {
    console.error("Error analysing project:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyse project" },
      { status: 500 }
    );
  }
}

function calculateComplexityScore(project: any, analysis: any): number {
  let score = 0;
  score += Math.min(project.stars / 10, 20);

  // Forks (max 15 points)
  score += Math.min(project.forks / 5, 15);

  // Commit frequency (max 25 points)
  score += Math.min(analysis.commitFrequency * 2, 25);

  // Contributors (max 15 points)
  score += Math.min(analysis.contributors * 3, 15);

  // Language diversity (max 15 points)
  const languageCount = Object.keys(project.languages || {}).length;
  score += Math.min(languageCount * 3, 15);

  // Is active (10 points)
  if (analysis.isActive) {
    score += 10;
  }

  return Math.round(Math.min(score, 100));
}
