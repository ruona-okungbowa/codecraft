import { Octokit } from "octokit";

interface RepoAnalysis {
  framework: string;
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
  features: string[];
  structure: string[];
}

export async function analyzeRepository(
  owner: string,
  repo: string,
  githubToken: string
): Promise<RepoAnalysis> {
  const octokit = new Octokit({ auth: githubToken });

  const analysis: RepoAnalysis = {
    framework: "Unknown",
    dependencies: [],
    devDependencies: [],
    scripts: {},
    features: [],
    structure: [],
  };

  try {
    const { data: packageJson } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: "package.json",
    });

    if ("content" in packageJson) {
      const content = Buffer.from(packageJson.content, "base64").toString();
      const pkg = JSON.parse(content);

      analysis.dependencies = Object.keys(pkg.dependencies || {});
      analysis.devDependencies = Object.keys(pkg.devDependencies || {});
      analysis.scripts = pkg.scripts || {};

      if (analysis.dependencies.includes("next")) {
        analysis.framework = "Next.js";
      } else if (analysis.dependencies.includes("react")) {
        analysis.framework = "React";
      } else if (analysis.dependencies.includes("vue")) {
        analysis.framework = "Vue.js";
      }
    }
  } catch (error) {
    console.error("Error fetching package.json:", error);
  }

  try {
    const { data: tree } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: "HEAD",
      recursive: "1",
    });

    const paths = tree.tree.map((item) => item.path || "");

    if (paths.some((p) => p.startsWith("app/"))) {
      analysis.structure.push("App Router");
    }
    if (paths.some((p) => p.startsWith("components/"))) {
      analysis.structure.push("Component-based architecture");
    }
    if (paths.some((p) => p.startsWith("lib/"))) {
      analysis.structure.push("Utility libraries");
    }
    if (paths.some((p) => p.includes("api/"))) {
      analysis.structure.push("API routes");
    }

    if (analysis.dependencies.includes("@supabase/supabase-js")) {
      analysis.features.push("Supabase authentication and database");
    }
    if (analysis.dependencies.includes("openai")) {
      analysis.features.push("OpenAI AI integration");
    }
    if (
      analysis.dependencies.includes("framer-motion") ||
      analysis.dependencies.includes("motion")
    ) {
      analysis.features.push("Animated UI components");
    }
    if (analysis.dependencies.includes("@vapi-ai/web")) {
      analysis.features.push("Voice AI integration");
    }
  } catch (error) {
    console.error("Error analyzing repository structure:", error);
  }

  return analysis;
}
