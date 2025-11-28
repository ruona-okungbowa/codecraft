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

  // Try to analyze package.json for Node.js projects
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
      } else if (analysis.dependencies.includes("express")) {
        analysis.framework = "Express.js";
      }
    }
  } catch {
    console.log("No package.json found, analyzing as non-Node.js project");
  }

  // Analyze repository structure and detect project type
  try {
    const { data: tree } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: "HEAD",
      recursive: "1",
    });

    const paths = tree.tree.map((item) => item.path || "");
    const fileExtensions = new Set(
      paths
        .filter((p) => p.includes("."))
        .map((p) => p.split(".").pop()?.toLowerCase())
    );

    // Detect project structure
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
    if (paths.some((p) => p.startsWith("src/"))) {
      analysis.structure.push("Source directory");
    }
    if (paths.some((p) => p.startsWith("public/"))) {
      analysis.structure.push("Static assets");
    }

    // Detect features from dependencies
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

    // Detect non-Node.js projects by file extensions
    if (fileExtensions.has("html") && !analysis.dependencies.length) {
      analysis.framework = "HTML/CSS/JavaScript";
      if (fileExtensions.has("css")) {
        analysis.structure.push("Stylesheets");
      }
      if (fileExtensions.has("js")) {
        analysis.structure.push("JavaScript");
      }
    }

    if (fileExtensions.has("py")) {
      analysis.framework = "Python";
      if (paths.some((p) => p.includes("requirements.txt"))) {
        analysis.structure.push("Python dependencies");
      }
      if (paths.some((p) => p.includes("app.py") || p.includes("main.py"))) {
        analysis.structure.push("Python application");
      }
    }

    if (fileExtensions.has("java")) {
      analysis.framework = "Java";
      if (paths.some((p) => p.includes("pom.xml"))) {
        analysis.structure.push("Maven project");
      }
      if (paths.some((p) => p.includes("build.gradle"))) {
        analysis.structure.push("Gradle project");
      }
    }

    if (fileExtensions.has("go")) {
      analysis.framework = "Go";
      if (paths.some((p) => p.includes("go.mod"))) {
        analysis.structure.push("Go modules");
      }
    }

    if (fileExtensions.has("rs")) {
      analysis.framework = "Rust";
      if (paths.some((p) => p.includes("Cargo.toml"))) {
        analysis.structure.push("Cargo project");
      }
    }

    // Analyze key files for better understanding
    await analyzeKeyFiles(octokit, owner, repo, paths, analysis);
  } catch {
    console.error("Error analyzing repository structure");
  }

  return analysis;
}

async function analyzeKeyFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  paths: string[],
  analysis: RepoAnalysis
): Promise<void> {
  const keyFiles = [
    "index.html",
    "main.py",
    "app.py",
    "index.js",
    "main.js",
    "app.js",
    "server.js",
    "main.go",
    "main.rs",
    "Main.java",
  ];

  for (const file of keyFiles) {
    const foundPath = paths.find((p) => p.endsWith(file));
    if (foundPath) {
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: foundPath,
        });

        if ("content" in data) {
          const content = Buffer.from(data.content, "base64").toString();

          // Detect features from file content
          if (
            content.includes("fetch(") ||
            content.includes("axios") ||
            content.includes("requests")
          ) {
            analysis.features.push("API integration");
          }
          if (
            content.includes("localStorage") ||
            content.includes("sessionStorage")
          ) {
            analysis.features.push("Local storage");
          }
          if (content.includes("canvas") || content.includes("WebGL")) {
            analysis.features.push("Graphics/Canvas");
          }
          if (content.includes("socket") || content.includes("WebSocket")) {
            analysis.features.push("Real-time communication");
          }
          if (
            content.includes("addEventListener") ||
            content.includes("onClick")
          ) {
            analysis.features.push("Interactive UI");
          }
          if (
            content.includes("Flask") ||
            content.includes("Django") ||
            content.includes("FastAPI")
          ) {
            analysis.framework = content.includes("Flask")
              ? "Flask"
              : content.includes("Django")
                ? "Django"
                : "FastAPI";
            analysis.features.push("Web framework");
          }
          if (content.includes("express()") || content.includes("app.listen")) {
            analysis.features.push("HTTP server");
          }
          if (
            content.includes("database") ||
            content.includes("db.") ||
            content.includes("sql")
          ) {
            analysis.features.push("Database integration");
          }
          if (
            content.includes("auth") ||
            content.includes("login") ||
            content.includes("jwt")
          ) {
            analysis.features.push("Authentication");
          }
          if (content.includes("form") || content.includes("input")) {
            analysis.features.push("Form handling");
          }
          if (
            content.includes("chart") ||
            content.includes("graph") ||
            content.includes("d3")
          ) {
            analysis.features.push("Data visualization");
          }
        }
      } catch {
        // File might not be accessible, continue
      }
    }
  }

  // Analyze requirements.txt for Python projects
  if (paths.includes("requirements.txt")) {
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: "requirements.txt",
      });

      if ("content" in data) {
        const content = Buffer.from(data.content, "base64").toString();
        const packages = content
          .split("\n")
          .map((line) => line.split("==")[0].trim());
        analysis.dependencies = packages.filter((p) => p.length > 0);
      }
    } catch {
      // File might not be accessible
    }
  }
}
