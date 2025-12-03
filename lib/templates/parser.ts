import type {
  ProjectTemplate,
  LearningResource,
} from "@/types/recommendations";

/**
 * Intermediate format before parsing into ProjectTemplate
 */
export interface RawTemplate {
  title?: string;
  name?: string;
  description?: string;
  content?: string;
  tags?: string[];
  language?: string;
  languages?: string[];
  difficulty?: string;
  level?: string;
  url?: string;
  stars?: number;
  techStack?: string[];
  technologies?: string[];
  tech?: string[];
  timeEstimate?: string;
  duration?: string;
  skillsTaught?: string[];
  skills?: string[];
  category?: string;
  features?: string[];
  learningResources?: LearningResource[];
  resources?: unknown[];
  [key: string]: unknown;
}

/**
 * Options for parsing templates
 */
export interface ParseOptions {
  strictMode?: boolean;
  applyDefaults?: boolean;
}

/**
 * TemplateParser transforms raw external content into structured ProjectTemplate format
 */
export class TemplateParser {
  /**
   * Parse raw template data into ProjectTemplate schema
   */
  parse(
    raw: RawTemplate,
    source: string,
    options: ParseOptions = {}
  ): ProjectTemplate | null {
    const { strictMode = false, applyDefaults = true } = options;

    try {
      // Extract and sanitize basic fields
      const title = this.sanitizeString(raw.title || raw.name || "", 200);
      const description = this.sanitizeString(
        raw.description || raw.content || "",
        2000
      );

      // Validate required fields
      if (!title || !description) {
        if (strictMode) {
          return null;
        }
      }

      // Build partial template
      const partial: Partial<ProjectTemplate> = {
        id: this.generateId(title, source),
        name: title,
        description: description,
        techStack: this.extractTechStack(raw),
        difficulty: this.extractDifficulty(raw),
        timeEstimate: raw.timeEstimate || raw.duration || "",
        skillsTaught: this.extractSkillsTaught(raw),
        category: this.extractCategory(raw),
        features: raw.features || [],
        learningResources: this.extractLearningResources(raw),
      };

      // Validate the partial template
      if (!this.validate(partial)) {
        if (strictMode) {
          return null;
        }
      }

      // Apply defaults if needed
      if (applyDefaults) {
        return this.applyDefaults(partial);
      }

      return partial as ProjectTemplate;
    } catch (error) {
      console.error(`Error parsing template from ${source}:`, error);
      return null;
    }
  }

  /**
   * Validate that a template has all required fields
   */
  validate(template: Partial<ProjectTemplate>): boolean {
    // Check required string fields
    if (!template.id || !template.name || !template.description) {
      return false;
    }

    // Check techStack exists (can be empty array)
    if (!template.techStack || !Array.isArray(template.techStack)) {
      return false;
    }

    // Check difficulty exists
    if (!template.difficulty) {
      return false;
    }

    // Validate difficulty is one of the allowed values
    if (
      template.difficulty &&
      !["beginner", "intermediate", "advanced"].includes(template.difficulty)
    ) {
      return false;
    }

    // Validate category if present
    const validCategories = [
      "frontend",
      "backend",
      "fullstack",
      "devops",
      "mobile",
      "",
    ];
    if (
      template.category !== undefined &&
      !validCategories.includes(template.category)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Apply default values for missing optional fields
   */
  applyDefaults(template: Partial<ProjectTemplate>): ProjectTemplate {
    return {
      id: template.id || "",
      name: template.name || "Untitled Project",
      description: template.description || "No description available",
      techStack: template.techStack || [],
      difficulty: template.difficulty || "beginner",
      timeEstimate: template.timeEstimate || "1-2 weeks",
      skillsTaught: template.skillsTaught || [],
      category: template.category || "",
      features: template.features || [],
      learningResources: template.learningResources || [],
    };
  }

  /**
   * Extract skills from description text and other fields
   */
  extractSkills(text: string): string[] {
    const skills: Set<string> = new Set();

    // Common programming languages and technologies
    const techKeywords = [
      "JavaScript",
      "TypeScript",
      "Python",
      "Java",
      "C++",
      "C#",
      "Ruby",
      "Go",
      "Rust",
      "PHP",
      "Swift",
      "Kotlin",
      "React",
      "Vue",
      "Angular",
      "Node.js",
      "Express",
      "Django",
      "Flask",
      "Spring",
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "GCP",
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "Redis",
      "GraphQL",
      "REST",
      "API",
      "HTML",
      "CSS",
      "SQL",
      "NoSQL",
      "Git",
      "CI/CD",
      "Testing",
      "TDD",
      "Agile",
    ];

    const lowerText = text.toLowerCase();

    for (const keyword of techKeywords) {
      const lowerKeyword = keyword.toLowerCase();
      if (lowerText.includes(lowerKeyword)) {
        skills.add(keyword);
      }
    }

    return Array.from(skills);
  }

  /**
   * Infer difficulty level from template data
   */
  inferDifficulty(
    template: Partial<ProjectTemplate>
  ): "beginner" | "intermediate" | "advanced" {
    const description = (template.description || "").toLowerCase();
    const techStack = template.techStack || [];
    const features = template.features || [];

    // Check for explicit difficulty indicators
    if (
      description.includes("beginner") ||
      description.includes("basic") ||
      description.includes("simple") ||
      description.includes("intro")
    ) {
      return "beginner";
    }

    if (
      description.includes("advanced") ||
      description.includes("complex") ||
      description.includes("expert") ||
      description.includes("production")
    ) {
      return "advanced";
    }

    // Infer from tech stack complexity
    const advancedTech = [
      "kubernetes",
      "microservices",
      "distributed",
      "scalability",
      "redis",
      "graphql",
      "websocket",
      "real-time",
    ];

    const hasAdvancedTech = techStack.some((tech) =>
      advancedTech.some((adv) => tech.toLowerCase().includes(adv))
    );

    if (hasAdvancedTech || techStack.length > 5 || features.length > 8) {
      return "advanced";
    }

    // Default to intermediate if not clearly beginner or advanced
    if (techStack.length > 2 || features.length > 4) {
      return "intermediate";
    }

    return "beginner";
  }

  /**
   * Infer category from tech stack
   */
  inferCategory(
    techStack: string[]
  ): "frontend" | "backend" | "fullstack" | "devops" | "mobile" | "" {
    const stack = techStack.map((t) => t.toLowerCase()).join(" ");

    // Frontend indicators
    const frontendKeywords = [
      "react",
      "vue",
      "angular",
      "html",
      "css",
      "tailwind",
      "sass",
      "webpack",
      "vite",
    ];
    const hasFrontend = frontendKeywords.some((k) => stack.includes(k));

    // Backend indicators
    const backendKeywords = [
      "node",
      "express",
      "django",
      "flask",
      "spring",
      "api",
      "database",
      "sql",
      "mongodb",
      "postgresql",
    ];
    const hasBackend = backendKeywords.some((k) => stack.includes(k));

    // DevOps indicators
    const devopsKeywords = [
      "docker",
      "kubernetes",
      "ci/cd",
      "jenkins",
      "terraform",
      "ansible",
      "aws",
      "azure",
      "gcp",
    ];
    const hasDevOps = devopsKeywords.some((k) => stack.includes(k));

    // Mobile indicators
    const mobileKeywords = [
      "react native",
      "flutter",
      "swift",
      "kotlin",
      "ios",
      "android",
      "mobile",
    ];
    const hasMobile = mobileKeywords.some((k) => stack.includes(k));

    if (hasMobile) return "mobile";
    if (hasDevOps) return "devops";
    if (hasFrontend && hasBackend) return "fullstack";
    if (hasBackend) return "backend";
    if (hasFrontend) return "frontend";

    return "";
  }

  /**
   * Sanitize string input by trimming and limiting length
   */
  private sanitizeString(input: string, maxLength: number): string {
    return input.trim().slice(0, maxLength);
  }

  /**
   * Generate a unique ID from title and source
   */
  private generateId(title: string, source: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `${source}-${slug}`;
  }

  /**
   * Extract tech stack from raw template
   */
  private extractTechStack(raw: RawTemplate): string[] {
    if (raw.techStack && Array.isArray(raw.techStack)) {
      return raw.techStack;
    }

    if (raw.technologies && Array.isArray(raw.technologies)) {
      return raw.technologies;
    }

    if (raw.tech && Array.isArray(raw.tech)) {
      return raw.tech;
    }

    if (raw.language) {
      return [raw.language];
    }

    if (raw.languages && Array.isArray(raw.languages)) {
      return raw.languages;
    }

    if (raw.tags && Array.isArray(raw.tags)) {
      return raw.tags;
    }

    // Try to extract from description
    const description = raw.description || raw.content || "";
    return this.extractSkills(description);
  }

  /**
   * Extract difficulty from raw template
   */
  private extractDifficulty(
    raw: RawTemplate
  ): "beginner" | "intermediate" | "advanced" {
    const difficulty = (raw.difficulty || raw.level || "").toLowerCase();

    if (difficulty.includes("beginner") || difficulty.includes("easy")) {
      return "beginner";
    }

    if (difficulty.includes("advanced") || difficulty.includes("hard")) {
      return "advanced";
    }

    if (difficulty.includes("intermediate") || difficulty.includes("medium")) {
      return "intermediate";
    }

    // Infer if not explicitly stated
    return this.inferDifficulty({
      description: raw.description || raw.content,
      techStack: this.extractTechStack(raw),
      features: raw.features,
    });
  }

  /**
   * Extract skills taught from raw template
   */
  private extractSkillsTaught(raw: RawTemplate): string[] {
    if (raw.skillsTaught && Array.isArray(raw.skillsTaught)) {
      return raw.skillsTaught;
    }

    if (raw.skills && Array.isArray(raw.skills)) {
      return raw.skills;
    }

    // Fall back to tech stack
    const techStack = this.extractTechStack(raw);
    if (techStack.length > 0) {
      return techStack;
    }

    // Extract from description
    const description = raw.description || raw.content || "";
    return this.extractSkills(description);
  }

  /**
   * Extract category from raw template
   */
  private extractCategory(
    raw: RawTemplate
  ): "frontend" | "backend" | "fullstack" | "devops" | "mobile" | "" {
    if (raw.category) {
      const cat = raw.category.toLowerCase();
      const validCategories: Array<
        "frontend" | "backend" | "fullstack" | "devops" | "mobile"
      > = ["frontend", "backend", "fullstack", "devops", "mobile"];
      if (validCategories.includes(cat as (typeof validCategories)[number])) {
        return cat as (typeof validCategories)[number];
      }
    }

    // Infer from tech stack
    const techStack = this.extractTechStack(raw);
    return this.inferCategory(techStack);
  }

  /**
   * Extract learning resources from raw template
   */
  private extractLearningResources(raw: RawTemplate): LearningResource[] {
    if (raw.learningResources && Array.isArray(raw.learningResources)) {
      return raw.learningResources;
    }

    if (raw.resources && Array.isArray(raw.resources)) {
      return raw.resources.map((item: unknown) => {
        const r = item as Record<string, unknown>;
        return {
          title: (r.title as string) || (r.name as string) || "Resource",
          url: (r.url as string) || (r.link as string) || "",
          type: ((r.type as string) || "article") as LearningResource["type"],
          provider: r.provider as string | undefined,
          duration: r.duration as string | undefined,
        };
      });
    }

    // If source URL is available, add it as a resource
    if (raw.url) {
      return [
        {
          title: raw.title || raw.name || "Source",
          url: raw.url,
          type: "article",
        },
      ];
    }

    return [];
  }
}
