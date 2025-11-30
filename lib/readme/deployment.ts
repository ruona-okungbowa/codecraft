import { Octokit } from "octokit";
import { DeploymentResult } from "@/types/readme";

export async function deployProjectReadme(
  repoOwner: string,
  repoName: string,
  content: string,
  githubToken: string
): Promise<DeploymentResult> {
  try {
    const octokit = new Octokit({ auth: githubToken });

    // Check if README.md already exists
    let existingSha: string | undefined;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: repoOwner,
        repo: repoName,
        path: "README.md",
      });

      if ("sha" in data) {
        existingSha = data.sha;
      }
    } catch (_error) {
      // README doesn't exist, that's fine
      existingSha = undefined;
    }

    // Create or update the README
    const { data } = await octokit.rest.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: "README.md",
      message: "docs: update README via CodeCraft",
      content: Buffer.from(content).toString("base64"),
      sha: existingSha, // Required for updates
    });

    return {
      success: true,
      url: `https://github.com/${repoOwner}/${repoName}#readme`,
      commitSha: data.commit.sha,
    };
  } catch (error) {
    console.error("Error deploying project README:", error);
    return {
      success: false,
      error: `Failed to deploy README: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Deploys a profile README to username/username repository
 * @param username - GitHub username
 * @param content - README markdown content
 * @param githubToken - GitHub access token
 * @returns Deployment result with URL and commit SHA
 */
export async function deployProfileReadme(
  username: string,
  content: string,
  githubToken: string
): Promise<DeploymentResult> {
  try {
    const octokit = new Octokit({ auth: githubToken });

    // Ensure the profile repository exists
    const repoExists = await ensureProfileRepoExists(username, githubToken);

    if (!repoExists) {
      return {
        success: false,
        error: "Failed to create or access profile repository",
      };
    }

    // Check if README.md already exists
    let existingSha: string | undefined;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: username,
        repo: username,
        path: "README.md",
      });

      if ("sha" in data) {
        existingSha = data.sha;
      }
    } catch (_error) {
      // README doesn't exist, that's fine
      existingSha = undefined;
    }

    // Create or update the README
    const { data } = await octokit.rest.repos.createOrUpdateFileContents({
      owner: username,
      repo: username,
      path: "README.md",
      message: "docs: update README via CodeCraft",
      content: Buffer.from(content).toString("base64"),
      sha: existingSha,
    });

    return {
      success: true,
      url: `https://github.com/${username}`,
      commitSha: data.commit.sha,
    };
  } catch (error) {
    console.error("Error deploying profile README:", error);
    return {
      success: false,
      error: `Failed to deploy profile README: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Ensures the profile repository (username/username) exists
 * Creates it if it doesn't exist
 * @param username - GitHub username
 * @param githubToken - GitHub access token
 * @returns True if repo exists or was created successfully
 */
export async function ensureProfileRepoExists(
  username: string,
  githubToken: string
): Promise<boolean> {
  try {
    const octokit = new Octokit({ auth: githubToken });

    // Check if the repository exists
    try {
      await octokit.rest.repos.get({
        owner: username,
        repo: username,
      });

      // Repository exists
      return true;
    } catch (_error) {
      // Repository doesn't exist, create it
      console.log(
        `Profile repository ${username}/${username} doesn't exist, creating it...`
      );

      await octokit.rest.repos.createForAuthenticatedUser({
        name: username,
        description: "My GitHub Profile",
        private: false,
        auto_init: false, // Don't auto-initialize with README
      });

      console.log(
        `Successfully created profile repository ${username}/${username}`
      );
      return true;
    }
  } catch (error) {
    console.error("Error ensuring profile repo exists:", error);
    return false;
  }
}

/**
 * Gets deployment instructions for manual deployment
 * @param repoOwner - Repository owner
 * @param repoName - Repository name
 * @param content - README content
 * @returns Instructions as markdown string
 */
export function getDeploymentInstructions(
  repoOwner: string,
  repoName: string,
  content: string
): string {
  return `# Manual Deployment Instructions

To add this README to your repository manually:

## Option 1: Via GitHub Web Interface

1. Go to https://github.com/${repoOwner}/${repoName}
2. Click "Add file" → "Create new file"
3. Name the file \`README.md\`
4. Paste the generated content
5. Commit the changes

## Option 2: Via Git Command Line

\`\`\`bash
# Navigate to your repository
cd ${repoName}

# Create README.md file
cat > README.md << 'EOF'
${content}
EOF

# Commit and push
git add README.md
git commit -m "docs: add README via CodeCraft"
git push origin main
\`\`\`

## Option 3: Download and Upload

1. Download the README content as a file
2. Navigate to your repository on GitHub
3. Upload the file via "Add file" → "Upload files"
`;
}

/**
 * Validates that a commit SHA is in the correct format
 * @param sha - Commit SHA to validate
 * @returns True if valid (40 hex characters)
 */
export function isValidCommitSha(sha: string): boolean {
  return /^[a-f0-9]{40}$/i.test(sha);
}

/**
 * Parses GitHub repository URL to extract owner and repo name
 * @param url - GitHub repository URL
 * @returns Object with owner and repo, or null if invalid
 */
export function parseGitHubUrl(
  url: string
): { owner: string; repo: string } | null {
  const match = url.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
  if (!match) {
    return null;
  }

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""),
  };
}
