// app/api/ai/readme/project/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateProjectReadme } from "@/lib/readme/generation";
import { researchProjectReadmeBestPracticesWithCache } from "@/lib/readme/mcp-research";
import { analyzeProject } from "@/lib/readme/analysis";
import { ReadmeTemplate } from "@/lib/readme/types";
import { openai } from "@/lib/openai/client";

async function generateBriefDescription(
  readmeContent: string,
  projectName: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at writing concise project descriptions for GitHub repositories.",
        },
        {
          role: "user",
          content: `Based on this README content, write a brief, engaging description for the GitHub repository "${projectName}". 

README:
${readmeContent.substring(0, 1000)}

Requirements:
- Maximum 150 characters
- Clear and professional
- Highlight the main purpose
- No emojis or special characters
- One sentence only

Return only the description text, nothing else.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const description = completion.choices[0]?.message?.content?.trim();
    return description || "";
  } catch (error) {
    console.error("Error generating brief description:", error);
    return "";
  }
}

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
    const { projectId, template = "professional", config } = body;

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
      githubToken,
      config
    );

    // Generate brief description from README
    const briefDescription = await generateBriefDescription(
      generatedReadme.content,
      project.name
    );

    // Update project description on GitHub if different
    if (briefDescription && briefDescription !== project.description) {
      try {
        const urlParts = project.url.split("/");
        const owner = urlParts[urlParts.length - 2];
        const repo = urlParts[urlParts.length - 1];

        const { Octokit } = await import("octokit");
        const octokit = new Octokit({ auth: githubToken });

        await octokit.rest.repos.update({
          owner,
          repo,
          description: briefDescription,
        });

        // Update in database
        await supabase
          .from("projects")
          .update({ description: briefDescription })
          .eq("id", projectId);
      } catch (error) {
        console.error("Error updating project description:", error);
      }
    }

    // Store generated README in database
    const { error: insertError } = await supabase
      .from("generated_content")
      .insert({
        project_id: projectId,
        content_type: "readme",
        content: generatedReadme.content,
        metadata: {
          ...generatedReadme.metadata,
          template,
          validation: generatedReadme.validation,
          characterCount: generatedReadme.content.length,
          briefDescription,
        },
      });

    if (insertError) {
      console.error("Error storing README in database:", insertError);
      // Don't fail the request, just log the error
    }

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
      briefDescription,
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
