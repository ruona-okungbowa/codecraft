import { Octokit } from "octokit";

export interface DeployResult {
  url: string;
  repoName: string;
  message: string;
  isNewRepo: boolean;
}

export async function deployToGitHubPages(
  githubUsername: string,
  token: string,
  htmlContent: string,
  octokit: Octokit,
  readmeContent?: string,
  name?: string,
  projectCount?: number
): Promise<DeployResult> {
  const repoName = "portfolio-website";
  const siteUrl = `https://${githubUsername}.github.io/${repoName}`;
  let isNewRepo = false;
  let sha: string | undefined;

  try {
    await octokit.rest.repos.get({
      owner: githubUsername,
      repo: repoName,
    });
    console.log(`Repository ${repoName} exists`);
  } catch (error) {
    const err = error as { status?: number; message?: string };
    if (err.status === 404) {
      console.log(`Creating repository ${repoName}...`);
      await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        description: "Portfolio Website - Showcasing my projects and skills",
        homepage: siteUrl,
        private: false,
        auto_init: true,
      });
      isNewRepo = true;

      // Wait for repo initialization (GitHub needs time to create the main branch)
      console.log("Waiting for repository initialization...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } else {
      throw new Error(
        `Failed to check repository: ${err.message || "Unknown error"}`
      );
    }
  }

  if (!isNewRepo) {
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: githubUsername,
        repo: repoName,
        path: "index.html",
      });

      if ("sha" in data && !Array.isArray(data)) {
        sha = data.sha;
        console.log(`Found existing index.html with SHA: ${sha}`);
      }
    } catch (error) {
      const err = error as { status?: number; message?: string };
      if (err.status === 404) {
        console.log("index.html doesn't exist, will create new file");
      } else {
        console.error("Error checking index.html:", err.message);
      }
    }
  }

  try {
    const base64Content = Buffer.from(htmlContent).toString("base64");

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: githubUsername,
      repo: repoName,
      path: "index.html",
      message: sha
        ? "Update portfolio via CodeCraft"
        : "Create portfolio via CodeCraft",
      content: base64Content,
      sha: sha,
    });

    console.log(`Successfully ${sha ? "updated" : "created"} index.html`);
  } catch (error) {
    const err = error as { message?: string };
    throw new Error(
      `Failed to deploy portfolio: ${err.message || "Unknown error"}`
    );
  }

  // Deploy README.md if provided
  if (readmeContent) {
    try {
      console.log("Deploying README.md...");
      let readmeSha: string | undefined;

      // Check if README already exists
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner: githubUsername,
          repo: repoName,
          path: "README.md",
        });

        if ("sha" in data && !Array.isArray(data)) {
          readmeSha = data.sha;
        }
      } catch (error) {
        // README doesn't exist, will create new one
      }

      const readmeBase64 = Buffer.from(readmeContent).toString("base64");

      await octokit.rest.repos.createOrUpdateFileContents({
        owner: githubUsername,
        repo: repoName,
        path: "README.md",
        message: readmeSha
          ? "Update README via CodeCraft"
          : "Add README via CodeCraft",
        content: readmeBase64,
        sha: readmeSha,
      });

      console.log(
        `Successfully ${readmeSha ? "updated" : "created"} README.md`
      );
    } catch (error) {
      const err = error as { message?: string };
      console.error("Failed to deploy README:", err.message);
      // Don't throw - README is optional, main site is more important
    }
  }

  // Enable GitHub Pages if it's a new repo or not already enabled
  let pagesEnabled = false;
  try {
    console.log("Checking GitHub Pages status...");
    await octokit.rest.repos.getPages({
      owner: githubUsername,
      repo: repoName,
    });
    console.log("GitHub Pages already enabled");
    pagesEnabled = true;
  } catch (error) {
    const err = error as { status?: number; message?: string };
    if (err.status === 404) {
      console.log("Enabling GitHub Pages...");
      try {
        await octokit.rest.repos.createPagesSite({
          owner: githubUsername,
          repo: repoName,
          source: {
            branch: "main",
            path: "/",
          },
        });
        console.log("GitHub Pages enabled successfully");
        pagesEnabled = true;

        // Wait a moment for GitHub Pages to initialize
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (createError) {
        const createErr = createError as { status?: number; message?: string };
        console.error("Failed to enable GitHub Pages:", createErr.message);
      }
    } else {
      console.warn("Error checking GitHub Pages:", err.message);
    }
  }

  let message = "";
  if (isNewRepo) {
    message = pagesEnabled
      ? "Portfolio site created and deployed successfully! GitHub Pages is being set up - it may take 1-2 minutes to go live."
      : "Portfolio site created! Please enable GitHub Pages manually: Go to your repository Settings → Pages → Select 'main' branch.";
  } else {
    message = pagesEnabled
      ? "Portfolio site updated successfully! Changes will be live in a few moments."
      : "Portfolio site updated! If the site doesn't load, please enable GitHub Pages in your repository settings.";
  }

  return {
    url: siteUrl,
    repoName,
    message,
    isNewRepo,
  };
}
