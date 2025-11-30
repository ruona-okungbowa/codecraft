// API route that retches the user's GitHub repos and stores them in database

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGitHubClient } from "@/lib/github/client";
import { Octokit } from "octokit";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const githubToken = session?.provider_token;

    if (!githubToken) {
      return NextResponse.json(
        { error: "Github token not found" },
        { status: 400 }
      );
    }

    const octokit = createGitHubClient(githubToken);

    const repos = await octokit.paginate(
      octokit.rest.repos.listForAuthenticatedUser,
      {
        sort: "updated",
        per_page: 100,
      }
    );

    console.log(`Fetched ${repos.length} repos from GitHub`);
    const projects = [];

    for (const repo of repos) {
      console.log(`Processing repo: ${repo.name}`);
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
        console.error(`Error checking project ${repo.name}:`, selectError);
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
        console.log(`Updating: ${repo.name}`);
        // Update existing project
        const { data: updatedProject, error: updateError } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", existingProject.id)
          .select()
          .single();

        if (updateError) {
          console.error(`Update error for ${repo.name}:`, updateError);
        } else if (updatedProject) {
          projects.push(updatedProject);
        }
      } else {
        // Insert new project
        console.log(`Inserting: ${repo.name}`);
        const { data: newProject, error: insertError } = await supabase
          .from("projects")
          .insert(projectData)
          .select()
          .single();

        if (insertError) {
          console.error(`Insert error for ${repo.name}:`, insertError);
          console.error("Project data:", projectData);
        } else if (newProject) {
          projects.push(newProject);
        }
      }
    }

    console.log(`Stored ${projects.length} projects in database`);
    return NextResponse.json({
      projects,
      count: repos.length,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Error fetching repos:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch repositories",
        details: error instanceof Error ? error.message : "Unknown error",
      },
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
