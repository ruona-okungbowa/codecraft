import { Project } from "@/types";
import { openai } from "./client";
import { fetchReadMe } from "../github/fetchReadme";
import { Octokit } from "octokit";

export async function generateReadme(
  project: Project,
  githubToken?: string,
  owner?: string,
  repo?: string,
  template: "minimal" | "detailed" | "visual" | "professional" = "professional"
): Promise<string> {
  let existingReadme: string | null = null;
  const repoAnalysis = {
    framework: "Unknown",
    dependencies: [] as string[],
    devDependencies: [] as string[],
    structure: [] as string[],
    features: [] as string[],
    scripts: {} as Record<string, string>,
  };

  if (githubToken && owner && repo) {
    const octokit = new Octokit({ auth: githubToken });
    existingReadme = await fetchReadMe(octokit, owner, repo);

    // Fetch package.json or other config files to analyze
    try {
      const { data: packageJson } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: "package.json",
      });

      if ("content" in packageJson) {
        const content = Buffer.from(packageJson.content, "base64").toString(
          "utf-8"
        );
        const pkg = JSON.parse(content);

        repoAnalysis.dependencies = Object.keys(pkg.dependencies || {}).slice(
          0,
          10
        );
        repoAnalysis.devDependencies = Object.keys(
          pkg.devDependencies || {}
        ).slice(0, 10);
        repoAnalysis.scripts = pkg.scripts || {};

        // Detect framework
        if (pkg.dependencies?.["next"]) repoAnalysis.framework = "Next.js";
        else if (pkg.dependencies?.["react"]) repoAnalysis.framework = "React";
        else if (pkg.dependencies?.["vue"]) repoAnalysis.framework = "Vue.js";
        else if (pkg.dependencies?.["@angular/core"])
          repoAnalysis.framework = "Angular";
        else if (pkg.dependencies?.["express"])
          repoAnalysis.framework = "Express.js";
      }
    } catch {
      console.log("Could not fetch package.json");
    }

    // Fetch repository tree structure
    try {
      const { data: tree } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: "HEAD",
        recursive: "1",
      });

      repoAnalysis.structure = tree.tree
        .filter((item) => item.type === "tree")
        .map((item) => item.path || "")
        .slice(0, 15);

      // Detect features from file structure
      const files = tree.tree.map((item) => item.path || "");
      if (files.some((f) => f.includes("test")))
        repoAnalysis.features.push("Unit testing");
      if (files.some((f) => f.includes("docker")))
        repoAnalysis.features.push("Docker support");
      if (files.some((f) => f.includes(".github/workflows")))
        repoAnalysis.features.push("CI/CD pipeline");
      if (files.some((f) => f.includes("api") || f.includes("routes")))
        repoAnalysis.features.push("RESTful API");
      if (files.some((f) => f.includes("component")))
        repoAnalysis.features.push("Component-based architecture");
    } catch {
      console.log("Could not fetch repository tree");
    }
  }

  const languages = Object.keys(project.languages || {}).join(", ");

  // Template-specific instructions
  const templateInstructions = {
    minimal: `
TEMPLATE STYLE: MINIMAL
- Keep it concise and to the point
- Include only essential sections: Description, Installation, Usage
- Use simple formatting, minimal emojis
- Focus on getting started quickly
- Target: 200-400 words total`,

    detailed: `
TEMPLATE STYLE: DETAILED
- Comprehensive documentation with all sections
- Include examples, code snippets, and explanations
- Add troubleshooting section if applicable
- Detailed installation and configuration steps
- Target: 800-1200 words total`,

    visual: `
TEMPLATE STYLE: VISUAL
- Use emojis for all section headers
- Include badges (shields.io) for build status, version, license
- Add visual elements like diagrams descriptions
- Use tables for feature comparisons
- Include screenshots placeholders
- Make it visually appealing and engaging
- Target: 600-900 words total`,

    professional: `
TEMPLATE STYLE: PROFESSIONAL
- Corporate/enterprise style documentation
- Formal tone, comprehensive but organized
- Include all standard sections
- Add API documentation if applicable
- Professional formatting with clear hierarchy
- Target: 700-1000 words total`,
  };

  const prompt = `You are an expert documentation writer. Generate a COMPLETE, ACCURATE, and PROFESSIONAL README.md for this GitHub project.

You MUST use the repository analysis provided, and you MUST NOT guess or fabricate features.

${templateInstructions[template]}

---------------------------------------
📌 PROJECT CONTEXT (REAL DATA)
---------------------------------------
Name: ${project.name}
Description: ${project.description || "No description provided"}
URL: ${project.url}
Languages Detected: ${languages}
Framework Detected: ${repoAnalysis.framework}
Key Dependencies: ${repoAnalysis.dependencies.join(", ") || "None detected"}
Dev Dependencies: ${repoAnalysis.devDependencies.join(", ") || "None detected"}
Project Structure: ${repoAnalysis.structure.join(", ") || "Not available"}
Detected Features from Code: ${repoAnalysis.features.join(", ") || "Analyze from structure"}
Available Scripts: ${Object.keys(repoAnalysis.scripts).join(", ") || "None detected"}

${existingReadme ? `Existing README (first 1000 chars):\n${existingReadme.substring(0, 1000)}\n\nUse this as reference but improve it.` : ""}

Use ONLY the features detected above. Do NOT invent features.

---------------------------------------
📌 REQUIRED README SECTIONS
---------------------------------------
${
  template === "minimal"
    ? `# Title


## Description

A concise overview (2-3 sentences).


## Installation

Quick install steps.


## Usage

Basic usage example.`
    : template === "visual"
      ? `# 🎯 Title


## 📌 Description

A concise overview with visual appeal.


## ✨ Key Features

List with emojis and visual formatting.


## 🛠 Tech Stack

Use badges and icons.


## 📦 Installation

Step-by-step with code blocks.


## 🚀 Usage

Examples with screenshots placeholders.


## 🤝 Contributing

Standard guidelines.


## 📜 License

License info.`
      : `# Title


## 📌 Description

A concise overview summarizing the project purpose and what it does.


## 📌 Key Features

List ONLY features found in repo analysis or code analysis.


## 🛠 Tech Stack

List languages, frameworks, and notable tools based strictly on actual analysis.


## 📂 Project Structure

Provide a simplified folder structure based on the \`structure\` analysis values.


## 🧰 Installation

Write installation steps based on the framework:
- If Node.js → use npm or yarn
- If Python → use pip + venv
- If Go → go run / build
- If Rust → cargo


## 🚀 Usage

Provide realistic commands/examples based strictly on scripts or main entry files.


## ⚙️ Configuration (if applicable)

Include details only if detected in repo analysis.


## 🤝 Contributing

Standard contribution guidelines.


## 📜 License

Insert placeholder if undetected.`
}

---------------------------------------
📌 CRITICAL FORMATTING RULES (FROM SYSTEM)
---------------------------------------
1. Add TWO blank lines after the main title (#)
2. Add TWO blank lines BEFORE each section header (##)
3. Add ONE blank line AFTER each section header
4. Add ONE blank line between paragraphs
5. Add blank lines before/after lists and code blocks
6. NEVER wrap the README in backticks or code fences
7. All content must be pure Markdown, spaced properly

---------------------------------------
Generate the full README.md now. Return ONLY the Markdown content, no wrapper code blocks or explanations.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical writer who creates professional README files for GitHub projects. Generate clear, well-structured Markdown documentation.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    return responseText.trim();
  } catch (error) {
    console.error("Error generating readme", error);
    return `# ${project.name}
    ${project.description || "A software project"}
    ## Tech Stack
    ${Object.keys(project.languages || {}).join(", ")}`;
  }
}
