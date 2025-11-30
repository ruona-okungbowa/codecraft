// API route that fetches the user's GitHub repos and stores them in database

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGitHubClient } from "@/lib/github/client";
import { Octokit } from "octokit";

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

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.json(
        { error: "Failed to get session", details: sessionError.message },
        { status: 401 }
      );
    }

    const githubToken = session?.provider_token;

    if (!githubToken) {
      return NextResponse.json(
        {
          error: "GitHub token not found",
          details: "Please reconnect your GitHub account",
        },
        { status: 400 }
      );
    }

    const octokit = createGitHubClient(githubToken);

    // Fetch repos from GitHub
    let repos;
    try {
      repos = await octokit.paginate(
        octokit.rest.repos.listForAuthenticatedUser,
        {
          sort: "updated",
          per_page: 100,
        }
      );
    } catch (githubError) {
      return NextResponse.json(
        {
          error: "Failed to fetch repositories from GitHub",
          details:
            githubError instanceof Error
              ? githubError.message
              : "GitHub API error",
        },
        { status: 502 }
      );
    }

    const projects = [];
    const errors = [];

    for (const repo of repos) {
      try {
        const languages = await getRepoLanguages(
          octokit,
          repo.owner.login,
          repo.name
        );

        // Check if project already exists
        const { data: existingProject, error: selectError } = await supabase
          .from("projects")
          .select("id")
          .eq("github_repo_id", repo.id)
          .single();

        if (selectError && selectError.code !== "PGRST116") {
          errors.push({
            repo: repo.name,
            error: "Failed to check existing project",
          });
          continue;
        }

        const projectData = {
          user_id: user.id,
          github_repo_id: repo.id,
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          last_commit_date: repo.pushed_at,
          languages,
        };

        if (existingProject) {
          // Update existing project
          const { data: updatedProject, error: updateError } = await supabase
            .from("projects")
            .update(projectData)
            .eq("id", existingProject.id)
            .select()
            .single();

          if (updateError) {
            errors.push({ repo: repo.name, error: "Failed to update" });
          } else if (updatedProject) {
            projects.push(updatedProject);
          }
        } else {
          // Insert new project
          const { data: newProject, error: insertError } = await supabase
            .from("projects")
            .insert(projectData)
            .select()
            .single();

          if (insertError) {
            errors.push({ repo: repo.name, error: "Failed to insert" });
          } else if (newProject) {
            projects.push(newProject);
          }
        }
      } catch (repoError) {
        errors.push({
          repo: repo.name,
          error:
            repoError instanceof Error ? repoError.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      projects,
      count: projects.length,
      totalRepos: repos.length,
      syncedAt: new Date().toISOString(),
      ...(errors.length > 0 && { errors }),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to sync repositories", details: errorMessage },
      { status: 500 }
    );
  }
}

async function getRepoLanguages(octokit: Octokit, owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.repos.listLanguages({
      owner,
      repo,
    });
    const total = Object.values(data).reduce((sum, bytes) => sum + bytes, 0);
    const languages: Record<string, number> = {};

    for (const [lang, bytes] of Object.entries(data)) {
      languages[lang] = (bytes / total) * 100;
    }

    return languages;
  } catch (error) {
    console.error(`Error fetching languages for ${repo}:`, error);
    return {};
  }
}
