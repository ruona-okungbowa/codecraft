// app/api/ai/readme/project/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateProjectReadme } from "@/lib/readme/generation";
import { researchProjectReadmeBestPracticesWithCache } from "@/lib/readme/mcp-research";
import { analyzeProject } from "@/lib/readme/analysis";
import { ReadmeTemplate } from "@/lib/readme/types";

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { projectId, template = "professional" } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Validate template
    const validTemplates: ReadmeTemplate[] = [
      "minimal",
      "detailed",
      "visual",
      "professional",
    ];
    if (!validTemplates.includes(template)) {
      return NextResponse.json(
        { error: "Invalid template type" },
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

    // Get GitHub token from session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const githubToken = session?.provider_token;
    if (!githubToken) {
      return NextResponse.json(
        { error: "GitHub token not found" },
        { status: 401 }
      );
    }

    // Analyze project to determine type
    const analysis = await analyzeProject(
      {
        ...project,
        languages: project.languages || {},
        stars: project.stars || 0,
        forks: project.forks || 0,
        lastCommitDate: project.last_commit_date
          ? new Date(project.last_commit_date)
          : undefined,
        complexityScore: project.complexity_score,
        analysedAt: project.analysed_at
          ? new Date(project.analysed_at)
          : undefined,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
      },
      githubToken
    );

    // Determine project type from technologies
    let projectType = "general";
    if (analysis.frameworks.some((f) => f.includes("React"))) {
      projectType = "react";
    } else if (analysis.frameworks.some((f) => f.includes("Express"))) {
      projectType = "api";
    }

    // Research best practices with caching
    const research =
      await researchProjectReadmeBestPracticesWithCache(projectType);

    // Generate README
    const generatedReadme = await generateProjectReadme(
      {
        ...project,
        languages: project.languages || {},
        stars: project.stars || 0,
        forks: project.forks || 0,
        lastCommitDate: project.last_commit_date
          ? new Date(project.last_commit_date)
          : undefined,
        complexityScore: project.complexity_score,
        analysedAt: project.analysed_at
          ? new Date(project.analysed_at)
          : undefined,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
      },
      template,
      research,
      githubToken
    );

    // Return response
    return NextResponse.json({
      content: generatedReadme.content,
      validation: generatedReadme.validation,
      research: {
        ...research,
        cached: research.source === "cache",
      },
      metadata: generatedReadme.metadata,
      generatedAt: generatedReadme.metadata.generatedAt,
    });
  } catch (error) {
    console.error("Error generating project README:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("MCP")) {
        // MCP error - should have fallen back to templates
        return NextResponse.json(
          { error: "Research service unavailable, using fallback templates" },
          { status: 200 }
        );
      }

      if (error.message.includes("OpenAI")) {
        return NextResponse.json(
          { error: "AI service temporarily unavailable. Please try again." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate README" },
      { status: 500 }
    );
  }
}
