import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateResumeBullets } from "@/lib/openai/bullets";

/**
 * POST /api/ai/bullets
 * Generate resume bullet points for a project
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
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
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    // Fetch project from database
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if bullets already exist (cache)
    const { data: existingContent } = await supabase
      .from("generated_content")
      .select("*")
      .eq("project_id", projectId)
      .eq("content_type", "bullet")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Return cached content if it exists and is recent (< 24 hours)
    if (existingContent) {
      const createdAt = new Date(existingContent.created_at);
      const now = new Date();
      const hoursSinceCreation =
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceCreation < 24) {
        return NextResponse.json({
          bullets: JSON.parse(existingContent.content),
          cached: true,
          generatedAt: existingContent.created_at,
        });
      }
    }

    // Try to get repo analysis for enhanced context
    let repoAnalysis;
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser?.user_metadata?.provider_token) {
        const urlParts = project.url.split("/");
        const owner = urlParts[urlParts.length - 2];
        const repo = urlParts[urlParts.length - 1];

        const { analyzeRepository } = await import("@/lib/readme/analyze-repo");
        repoAnalysis = await analyzeRepository(
          owner,
          repo,
          authUser.user_metadata.provider_token
        );
      }
    } catch (error) {
      console.log("Could not fetch repo analysis, using basic context");
    }

    // Generate resume bullets using OpenAI
    const bullets = await generateResumeBullets(project, repoAnalysis);

    // Store generated content in database
    const { error: insertError } = await supabase
      .from("generated_content")
      .insert({
        project_id: projectId,
        content_type: "bullet",
        content: JSON.stringify(bullets),
        metadata: {
          bulletCount: bullets.length,
          generatedAt: new Date().toISOString(),
        },
      });

    if (insertError) {
      console.error("Error storing bullets:", insertError);
      // Continue anyway - we can still return the generated content
    }

    return NextResponse.json({
      bullets,
      cached: false,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating bullets:", error);
    return NextResponse.json(
      {
        error: "Failed to generate resume bullets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
