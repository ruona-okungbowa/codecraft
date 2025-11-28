import { Octokit } from "octokit";
import { fetchDependencyFiles } from "@/lib/github/fetchRepoFiles";
import { extractSkillsFromDependencies } from "./parseDependencies";
import { analyzeCodebaseForSkills } from "@/lib/openai/analyzeCodebase";

interface Project {
  name: string;
  description?: string;
  languages?: Record<string, number>;
  url?: string;
  github_repo_id?: number;
}

// Helper to add timeout to promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeoutMs)
    ),
  ]);
}

export async function extractSkillsFromProjects(
  projects: Project[],
  githubToken?: string
): Promise<string[]> {
  const skills = new Set<string>();
  const octokit = githubToken ? new Octokit({ auth: githubToken }) : null;

  // Process all projects in parallel for speed
  await Promise.all(
    projects.map(async (project) => {
      // Extract from languages (fast, synchronous)
      if (project.languages) {
        Object.keys(project.languages).forEach((lang) => {
          const normalized = normalizeSkillName(lang);
          if (normalized) {
            skills.add(normalized);
          }
        });
      }

      // Extract from description (fast, synchronous)
      if (project.description) {
        const detectedSkills = detectSkillsInText(project.description);
        detectedSkills.forEach((skill) => skills.add(skill));
      }

      // Parse GitHub URL
      let owner: string | null = null;
      let repo: string | null = null;

      if (project.url) {
        const match = project.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
          owner = match[1];
          repo = match[2];
        }
      }

      // Try dependency files first (faster than OpenAI) with 5s timeout
      if (octokit && owner && repo) {
        try {
          const depFiles = await withTimeout(
            fetchDependencyFiles(octokit, owner, repo),
            5000
          );
          const depSkills = extractSkillsFromDependencies(depFiles);
          depSkills.forEach((skill) => skills.add(skill));

          // Skip OpenAI if we found dependencies
          if (depSkills.length > 0) {
            return;
          }
        } catch (error) {
          // Silently continue to OpenAI fallback
        }
      }

      // Only use OpenAI as fallback if no dependencies found, with 8s timeout
      try {
        const aiSkills = await withTimeout(
          analyzeCodebaseForSkills(
            project.name,
            project.languages || {},
            project.description
          ),
          8000
        );
        aiSkills.forEach((skill) => skills.add(skill));
      } catch (aiError) {
        // Silently fail - we already have language and description skills
      }
    })
  );

  return Array.from(skills);
}

function normalizeSkillName(skill: string): string {
  const normalized = skill.trim();

  const skillMap: Record<string, string> = {
    javascript: "JavaScript",
    js: "JavaScript",
    typescript: "TypeScript",
    ts: "TypeScript",
    python: "Python",
    py: "Python",
    java: "Java",
    csharp: "C#",
    "c#": "C#",
    cpp: "C++",
    "c++": "C++",
    html: "HTML",
    css: "CSS",
    sql: "SQL",
    go: "Go",
    golang: "Go",
    rust: "Rust",
    ruby: "Ruby",
    php: "PHP",
    swift: "Swift",
    kotlin: "Kotlin",
    dart: "Dart",
    shell: "Shell",
    bash: "Bash",
  };

  const lower = normalized.toLowerCase();
  return skillMap[lower] || normalized;
}

/**
 * Detect skills/frameworks mentioned in text
 */
function detectSkillsInText(text: string): string[] {
  const skills: string[] = [];
  const lowerText = text.toLowerCase();

  // Common frameworks and tools to detect
  const skillPatterns: Record<string, string[]> = {
    // Frontend frameworks
    React: ["react", "reactjs", "react.js"],
    "Next.js": ["next", "nextjs", "next.js"],
    Vue: ["vue", "vuejs", "vue.js"],
    Angular: ["angular"],
    Svelte: ["svelte"],
    "Tailwind CSS": ["tailwind", "tailwindcss"],
    Bootstrap: ["bootstrap"],

    // Backend frameworks
    "Node.js": ["node", "nodejs", "node.js"],
    Express: ["express", "expressjs"],
    Django: ["django"],
    Flask: ["flask"],
    FastAPI: ["fastapi"],
    Spring: ["spring", "spring boot"],
    Laravel: ["laravel"],
    Rails: ["rails", "ruby on rails"],

    // Databases
    MongoDB: ["mongodb", "mongo"],
    PostgreSQL: ["postgresql", "postgres"],
    MySQL: ["mysql"],
    Redis: ["redis"],
    Firebase: ["firebase"],
    Supabase: ["supabase"],
    SQLite: ["sqlite"],

    // Cloud & DevOps
    Docker: ["docker"],
    Kubernetes: ["kubernetes", "k8s"],
    AWS: ["aws", "amazon web services"],
    Azure: ["azure"],
    GCP: ["gcp", "google cloud"],
    Vercel: ["vercel"],
    Netlify: ["netlify"],

    // Tools
    Git: ["git"],
    "CI/CD": ["ci/cd", "cicd", "continuous integration"],
    Webpack: ["webpack"],
    Vite: ["vite"],
    Jest: ["jest"],
    Testing: ["testing", "unit test", "integration test"],

    // State Management
    Redux: ["redux"],
    Zustand: ["zustand"],

    // APIs
    "REST API": ["rest", "rest api", "restful"],
    GraphQL: ["graphql"],

    // Mobile
    "React Native": ["react native"],
  };

  // Check for each skill pattern
  Object.entries(skillPatterns).forEach(([skill, patterns]) => {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern)) {
        skills.push(skill);
        break; // Only add once per skill
      }
    }
  });

  return skills;
}
