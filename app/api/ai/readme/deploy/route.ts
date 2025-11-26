// app/api/ai/readme/deploy/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  deployProjectReadme,
  deployProfileReadme,
  parseGitHubUrl,
} from "@/lib/readme/deployment";

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

    // Get GitHub token from session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const githubToken = session?.provider_token;
    if (!githubToken) {
      return NextResponse.json(
        {
          error:
            "GitHub token not found. Please reconnect your GitHub account.",
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { type, content, projectId, username } = body;

    // Validate required fields
    if (!type || !content) {
      return NextResponse.json(
        { error: "Type and content are required" },
        { status: 400 }
      );
    }

    if (type !== "project" && type !== "profile") {
      return NextResponse.json(
        { error: "Type must be 'project' or 'profile'" },
        { status: 400 }
      );
    }

    // Handle project README deployment
    if (type === "project") {
      if (!projectId) {
        return NextResponse.json(
          { error: "Project ID is required for project README deployment" },
          { status: 400 }
        );
      }

      // Fetch project to get repository URL
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("url")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

      if (projectError || !project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      // Parse GitHub URL
      const parsed = parseGitHubUrl(project.url);
      if (!parsed) {
        return NextResponse.json(
          { error: "Invalid GitHub repository URL" },
          { status: 400 }
        );
      }

      // Deploy README
      const result = await deployProjectReadme(
        parsed.owner,
        parsed.repo,
        content,
        githubToken
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Deployment failed" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        url: result.url,
        commitSha: result.commitSha,
        message: "README successfully deployed to GitHub!",
      });
    }

    // Handle profile README deployment
    if (type === "profile") {
      // Get username from request or user data
      let targetUsername = username;

      if (!targetUsername) {
        const { data: userData } = await supabase
          .from("users")
          .select("github_username")
          .eq("id", user.id)
          .single();

        targetUsername = userData?.github_username;
      }

      if (!targetUsername) {
        return NextResponse.json(
          { error: "GitHub username not found" },
          { status: 400 }
        );
      }

      // Deploy profile README
      const result = await deployProfileReadme(
        targetUsername,
        content,
        githubToken
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Deployment failed" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        url: result.url,
        commitSha: result.commitSha,
        message: `Profile README successfully deployed! Visit ${result.url} to see it.`,
      });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error deploying README:", error);

    // Handle specific GitHub API errors
    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          {
            error:
              "GitHub API rate limit exceeded. Please try again in a few minutes.",
          },
          { status: 429 }
        );
      }

      if (error.message.includes("permission")) {
        return NextResponse.json(
          {
            error:
              "Permission denied. Please ensure you have write access to this repository.",
          },
          { status: 403 }
        );
      }

      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Repository not found or not accessible." },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to deploy README to GitHub" },
      { status: 500 }
    );
  }
}
