import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGitHubClient } from "@/lib/github/client";
import {
  generatePortfolioBio,
  generateProjectDescription,
} from "@/lib/openai/generatePortfolio";
import { generatePortfolioHTML } from "@/lib/templates/portfolio-template";
import { generatePortfolioReadme } from "@/lib/templates/portfolio-readme";
import { deployToGitHubPages } from "@/lib/github/deployPortfolio";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const { data: userData } = await supabase
      .from("users")
      .select(
        "github_username, target_role, email, avatar_url, github_token, token_updated_at, first_name, last_name"
      )
      .eq("id", user.id)
      .single();

    if (!userData?.github_username) {
      return NextResponse.json(
        { error: "GitHub username not found" },
        { status: 404 }
      );
    }

    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .eq("in_portfolio", true)
      .order("stars", { ascending: false })
      .limit(6);

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
      return NextResponse.json(
        { error: "Failed to fetch projects", details: projectsError.message },
        { status: 500 }
      );
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json(
        {
          error:
            "No projects selected for portfolio. Please add projects to your portfolio from the Projects page.",
        },
        { status: 404 }
      );
    }

    console.log("Generating portfolio bio...");
    const bio = await generatePortfolioBio(projects, userData.target_role);

    console.log("Generating project descriptions...");
    const projectsWithDescriptions = await Promise.all(
      projects.map(async (project) => {
        const description = await generateProjectDescription(project);
        return {
          ...project,
          description,
        };
      })
    );

    const skillsSet = new Set<string>();
    projects.forEach((project) => {
      if (project.languages) {
        Object.keys(project.languages).forEach((lang) => skillsSet.add(lang));
      }
    });
    const skills = Array.from(skillsSet);

    console.log("Generating portfolio HTML...");
    // Use full name if available, otherwise fall back to GitHub username
    const displayName =
      userData.first_name && userData.last_name
        ? `${userData.first_name} ${userData.last_name}`
        : userData.github_username;

    const htmlContent = generatePortfolioHTML(
      displayName,
      bio,
      userData.github_username,
      projectsWithDescriptions,
      skills,
      userData.email,
      userData.avatar_url
    );

    console.log("Deploying to GitHub Pages...");
    const { data: sessionData } = await supabase.auth.getSession();
    const githubToken =
      sessionData.session?.provider_token || sessionData.session?.access_token;

    if (!githubToken) {
      console.error("Session data:", sessionData);
      return NextResponse.json(
        {
          error:
            "GitHub token not found. Please log out and log back in to reconnect your GitHub account.",
          details:
            "The GitHub access token is missing from your session. This may happen if you logged in before we added GitHub repository access.",
        },
        { status: 401 }
      );
    }

    console.log("Generating README...");
    const portfolioUrl = `https://${userData.github_username}.github.io/portfolio-website`;
    const readmeContent = generatePortfolioReadme(
      displayName, // Use full name in README too
      userData.github_username,
      portfolioUrl,
      projects.length
    );

    const octokit = createGitHubClient(githubToken);
    const deployResult = await deployToGitHubPages(
      userData.github_username,
      githubToken,
      htmlContent,
      octokit,
      readmeContent,
      userData.github_username,
      projects.length
    );

    return NextResponse.json({
      success: true,
      url: deployResult.url,
      repoName: deployResult.repoName,
      message: deployResult.message,
      isNewRepo: deployResult.isNewRepo,
      projectsIncluded: projects.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating portfolio website:", error);
    return NextResponse.json(
      {
        error: "Failed to generate portfolio website",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
