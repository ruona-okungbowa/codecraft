interface PortfolioConfig {
  name: string;
  title?: string;
  description?: string;
  selectedProjects: string[];
  theme?: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  tech_stack: string[] | null;
  github_url: string | null;
  demo_url: string | null;
}

export function generatePortfolioHTML(
  config: PortfolioConfig,
  projects: Project[]
): string {
  const projectsHTML = projects
    .map(
      (project) => `
    <div class="project-card">
      <h3>${escapeHtml(project.name)}</h3>
      <p>${escapeHtml(project.description || "No description available")}</p>
      ${
        project.tech_stack && project.tech_stack.length > 0
          ? `<div class="tech-stack">
          ${project.tech_stack.map((tech) => `<span class="tech-badge">${escapeHtml(tech)}</span>`).join("")}
        </div>`
          : ""
      }
      <div class="project-links">
        ${project.github_url ? `<a href="${escapeHtml(project.github_url)}" target="_blank" rel="noopener noreferrer">GitHub</a>` : ""}
        ${project.demo_url ? `<a href="${escapeHtml(project.demo_url)}" target="_blank" rel="noopener noreferrer">Live Demo</a>` : ""}
      </div>
    </div>
  `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(config.name)} - Portfolio</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>${escapeHtml(config.name)}</h1>
    ${config.title ? `<p class="subtitle">${escapeHtml(config.title)}</p>` : ""}
    ${config.description ? `<p class="description">${escapeHtml(config.description)}</p>` : ""}
  </header>
  <main>
    <section class="projects">
      <h2>Projects</h2>
      <div class="projects-grid">
        ${projectsHTML}
      </div>
    </section>
  </main>
  <footer>
    <p>Generated with CodeCraft</p>
  </footer>
</body>
</html>`;
}

export function generatePortfolioCSS(): string {
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  background: linear-gradient(135deg, #f5e6f7 0%, #fce7f3 50%, #f5e6f7 100%);
  min-height: 100vh;
}

header {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  margin-bottom: 3rem;
}

header h1 {
  font-size: 3rem;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 1rem;
}

.description {
  font-size: 1.1rem;
  color: #555;
  max-width: 600px;
  margin: 0 auto;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.projects h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #1a1a1a;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.project-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.project-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.project-card p {
  color: #666;
  margin-bottom: 1rem;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tech-badge {
  background: #a855f7;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.project-links {
  display: flex;
  gap: 1rem;
}

.project-links a {
  color: #a855f7;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
}

.project-links a:hover {
  opacity: 0.8;
}

footer {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  header h1 {
    font-size: 2rem;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
}`;
}

export function generateReadme(config: PortfolioConfig): string {
  return `# ${config.name} - Portfolio

${config.description || "My professional portfolio showcasing my projects and skills."}

## About

This portfolio was generated using [CodeCraft](https://codecraft.dev), an AI-powered career readiness platform.

## Projects

This portfolio includes ${config.selectedProjects.length} selected projects that demonstrate my skills and experience.

## Deployment

To deploy this portfolio:

1. Upload the contents to any static hosting service (GitHub Pages, Netlify, Vercel, etc.)
2. Ensure \`index.html\` is in the root directory
3. The site will be live at your hosting provider's URL

## Local Development

Simply open \`index.html\` in your browser to view the portfolio locally.

---

Generated with ❤️ by CodeCraft
`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
