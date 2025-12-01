import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import JSZip from "jszip";

interface PortfolioConfig {
  name: string;
  tagline?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  bio?: string;
  selectedProjects: string[];
  sections: {
    about?: boolean;
    projects?: boolean;
    skills?: boolean;
    experience?: boolean;
    contact?: boolean;
  };
}

interface Project {
  id: string;
  name: string;
  description?: string;
  tech_stack?: string[];
  repo_url?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config: PortfolioConfig = await request.json();
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .in("id", config.selectedProjects || []);

    if (projectsError) {
      throw new Error(`Failed to fetch projects: ${projectsError.message}`);
    }

    const zip = new JSZip();
    const htmlContent = generateHTML(config, (projects || []) as Project[]);
    zip.file("index.html", htmlContent);
    zip.file("styles.css", generateCSS());
    zip.file("README.md", generateReadme(config));

    const zipData = await zip.generateAsync({ type: "blob" });
    return new NextResponse(zipData, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${config.name.replace(/\s+/g, "-").toLowerCase()}-portfolio.zip"`,
      },
    });
  } catch (error) {
    console.error("Error generating portfolio download:", error);
    return NextResponse.json(
      {
        error: "Failed to generate portfolio download",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function generateHTML(config: PortfolioConfig, projects: Project[]): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.name} - Portfolio</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>${config.name}</h1>
    ${config.tagline ? `<p class="tagline">${config.tagline}</p>` : ""}
    <div class="contact">
      ${config.email ? `<a href="mailto:${config.email}">${config.email}</a>` : ""}
      ${config.github ? `<a href="${config.github}" target="_blank">GitHub</a>` : ""}
      ${config.linkedin ? `<a href="${config.linkedin}" target="_blank">LinkedIn</a>` : ""}
      ${config.website ? `<a href="${config.website}" target="_blank">Website</a>` : ""}
    </div>
  </header>
  <main>
    ${config.sections.about ? `<section id="about"><h2>About Me</h2><p>${config.bio || "Add your bio here"}</p></section>` : ""}
    ${config.sections.projects ? `<section id="projects"><h2>Projects</h2><div class="projects-grid">${projects.map((p) => `<div class="project-card"><h3>${p.name}</h3><p>${p.description || ""}</p>${p.tech_stack ? `<div class="tech-stack">${p.tech_stack.map((t) => `<span class="tech-tag">${t}</span>`).join("")}</div>` : ""}${p.repo_url ? `<a href="${p.repo_url}" target="_blank">View on GitHub</a>` : ""}</div>`).join("")}</div></section>` : ""}
  </main>
  <footer><p>&copy; ${new Date().getFullYear()} ${config.name}</p></footer>
</body>
</html>`;
}

function generateCSS(): string {
  return `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f6f7f8; }
header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4rem 2rem; text-align: center; }
header h1 { font-size: 3rem; margin-bottom: 0.5rem; }
.tagline { font-size: 1.25rem; opacity: 0.9; margin-bottom: 1.5rem; }
.contact { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; }
.contact a { color: white; text-decoration: none; padding: 0.5rem 1rem; border: 2px solid white; border-radius: 25px; transition: all 0.3s; }
.contact a:hover { background: white; color: #667eea; }
main { max-width: 1200px; margin: 0 auto; padding: 3rem 2rem; }
section { margin-bottom: 4rem; }
h2 { font-size: 2rem; margin-bottom: 1.5rem; color: #667eea; }
.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
.project-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.3s; }
.project-card:hover { transform: translateY(-5px); }
.project-card h3 { font-size: 1.5rem; margin-bottom: 0.75rem; }
.tech-stack { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1rem 0; }
.tech-tag { background: #e0e7ff; color: #667eea; padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.875rem; }
.project-card a { color: #667eea; text-decoration: none; font-weight: 600; }
footer { background: #333; color: white; text-align: center; padding: 2rem; }
@media (max-width: 768px) { header h1 { font-size: 2rem; } .projects-grid { grid-template-columns: 1fr; } }`;
}

function generateReadme(config: PortfolioConfig): string {
  return `# ${config.name} - Portfolio

This is a static portfolio website generated by CodeCraft.

## Setup
1. Extract the ZIP file
2. Open \`index.html\` in your browser
3. Deploy to any static hosting (Netlify, Vercel, GitHub Pages)

## Customization
- Edit \`index.html\` to update content
- Modify \`styles.css\` to change styling

Generated with ❤️ by CodeCraft`;
}
