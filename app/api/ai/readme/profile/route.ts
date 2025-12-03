// app/api/ai/readme/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateProfileReadme } from "@/lib/readme/generation";
import { researchProfileReadmeBestPracticesWithCache } from "@/lib/readme/mcp-research";
import { ReadmeTemplate, ProfileConfig } from "@/types/readme";

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
    const { template = "professional", config } = body as {
      template?: ReadmeTemplate;
      config?: ProfileConfig;
    };

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

    // Validate config if provided
    if (config !== undefined) {
      if (typeof config !== "object" || config === null) {
        return NextResponse.json(
          { error: "Invalid config format" },
          { status: 400 }
        );
      }

      // Validate boolean fields
      const validConfigKeys: (keyof ProfileConfig)[] = [
        "includeStats",
        "includeTopLanguages",
        "includeProjects",
        "includeSkills",
        "includeContact",
        "includeSocials",
      ];

      for (const key of Object.keys(config)) {
        if (!validConfigKeys.includes(key as keyof ProfileConfig)) {
          return NextResponse.json(
            { error: `Invalid config key: ${key}` },
            { status: 400 }
          );
        }
        if (typeof config[key as keyof ProfileConfig] !== "boolean") {
          return NextResponse.json(
            { error: `Config value for ${key} must be boolean` },
            { status: 400 }
          );
        }
      }
    }

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user's projects
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("stars", { ascending: false })
      .limit(20); // Get top 20 projects

    if (projectsError) {
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      );
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json(
        { error: "No projects found. Please add some projects first." },
        { status: 400 }
      );
    }

    // Research best practices with caching
    const research = await researchProfileReadmeBestPracticesWithCache();

    // Convert database projects to Project type
    const typedProjects = projects.map((p) => ({
      ...p,
      languages: p.languages || {},
      stars: p.stars || 0,
      forks: p.forks || 0,
      lastCommitDate: p.last_commit_date
        ? new Date(p.last_commit_date)
        : undefined,
      complexityScore: p.complexity_score,
      analysedAt: p.analysed_at ? new Date(p.analysed_at) : undefined,
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
    }));

    // Generate profile README
    const generatedReadme = await generateProfileReadme(
      {
        id: userData.id,
        githubId: userData.github_id,
        githubUsername: userData.github_username,
        email: userData.email,
        avatarUrl: userData.avatar_url,
        targetRole: userData.target_role,
        createdAt: new Date(userData.created_at),
        updatedAt: new Date(userData.updated_at),
      },
      typedProjects,
      template,
      research,
      config
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
    console.error("Error generating profile README:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("MCP")) {
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
      { error: "Failed to generate profile README" },
      { status: 500 }
    );
  }
}
