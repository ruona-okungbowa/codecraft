import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateReadme } from "@/lib/openai/generateReadme";
import { validateMarkdown } from "@/lib/utils/validateMarkdown";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      projectId,
      enhance,
      template = "professional",
      forceRegenerate = false,
    } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

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

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError) {
      return NextResponse.json(
        {
          error: "Project not found",
          details: "This project doesn't exist or you don't have access to it",
        },
        { status: 404 }
      );
    }

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { data: existingContent } = await supabase
      .from("generated_content")
      .select("*")
      .eq("project_id", projectId)
      .eq("content_type", "readme")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existingContent && !forceRegenerate) {
      const createdAt = new Date(existingContent.created_at);
      const now = new Date();
      const hoursSinceCreation =
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceCreation < 24) {
        return NextResponse.json({
          readme: existingContent.content,
          cached: true,
          generatedAt: existingContent.created_at,
        });
      }
    }

    let owner: string | undefined;
    let repo: string | undefined;

    if (project.url) {
      const match = project.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        owner = match[1];
        repo = match[2];
      }
    }

    console.log("Generating readme for project", projectId);

    const githubToken = user.user_metadata?.provider_token;
    const readme = await generateReadme(
      project,
      enhance ? githubToken : undefined,
      owner,
      repo,
      template as "minimal" | "detailed" | "visual" | "professional"
    );

    const validation = validateMarkdown(readme);
    if (!validation.valid) {
      console.warn(
        "Generated README has validation errors:",
        validation.errors
      );
    }

    const { error: insertError } = await supabase
      .from("generated_content")
      .insert({
        project_id: projectId,
        content_type: "readme",
        content: readme,
        metadata: {
          enhanced: enhance,
          validation: validation,
          characterCount: readme.length,
        },
      });

    if (insertError) {
      console.error("Error storing README:", insertError);
    }

    return NextResponse.json({
      readme,
      cached: false,
      generatedAt: new Date().toISOString(),
      validation,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate README";
    return NextResponse.json(
      { error: errorMessage, details: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
