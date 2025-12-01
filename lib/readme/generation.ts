import { Project, User } from "@/types";
import {
  GeneratedReadme,
  ReadmeTemplate,
  ReadmeResearch,
  ProfileReadmeData,
} from "@/types/readme";
import { validateMarkdown } from "./validation";
import { openai } from "@/lib/openai/client";
import { selectTopProjects } from "./ranking";

interface RepoAnalysis {
  framework: string;
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
  features: string[];
  structure: string[];
  projectPurpose?: string;
  mainPages?: string[];
}

interface ConfigOptions {
  installation?: boolean;
  usage?: boolean;
  api?: boolean;
  contributing?: boolean;
  license?: boolean;
  badges?: boolean;
  demo?: boolean;
}

export async function generateProjectReadme(
  project: Project,
  template: ReadmeTemplate,
  research: ReadmeResearch,
  githubToken?: string,
  config?: ConfigOptions
): Promise<GeneratedReadme> {
  let repoAnalysis: RepoAnalysis | null = null;

  if (githubToken && project.url) {
    try {
      const urlParts = project.url.split("/");
      const owner = urlParts[urlParts.length - 2];
      const repo = urlParts[urlParts.length - 1];

      console.log(`Starting repository analysis for ${owner}/${repo}`);
      const { analyzeRepository } = await import("./analyze-repo");
      repoAnalysis = await analyzeRepository(owner, repo, githubToken);
      console.log(`Repository analysis complete:`, {
        framework: repoAnalysis.framework,
        dependenciesCount: repoAnalysis.dependencies.length,
        featuresCount: repoAnalysis.features.length,
      });
    } catch (error) {
      console.error("Error analyzing repository:", error);
      console.log("Proceeding with basic project information only");
    }
  }

  const prompt = buildProjectReadmePrompt(
    project,
    template,
    research,
    repoAnalysis,
    config
  );
  const content = await callOpenAI(prompt, "project");

  const wordCount = content.split(/\s+/).length;
  const sectionsIncluded = extractSections(content);
  const validation = validateMarkdown(content, "project");

  return {
    content,
    metadata: {
      template,
      sectionsIncluded,
      wordCount,
      generatedAt: new Date().toISOString(),
    },
    validation,
  };
}

export async function generateProfileReadme(
  user: User,
  projects: Project[],
  template: ReadmeTemplate,
  research: ReadmeResearch
): Promise<GeneratedReadme> {
  // Select top projects
  const topProjects = selectTopProjects(projects, 6);

  // Build profile data
  const profileData: ProfileReadmeData = {
    username: user.githubUsername,
    bio: "", // Could be fetched from GitHub API
    topProjects,
    techStack: extractUniqueTechnologies(topProjects),
    stats: calculateStats(projects),
    socialLinks: {
      // These would come from user profile or GitHub API
    },
  };

  // Build the prompt with research context
  const prompt = buildProfileReadmePrompt(profileData, template, research);

  // Call OpenAI
  const content = await callOpenAI(prompt, "profile");

  // Count words
  const wordCount = content.split(/\s+/).length;

  // Extract sections that were included
  const sectionsIncluded = extractSections(content);

  // Validate the generated README
  const validation = validateMarkdown(content, "profile");

  return {
    content,
    metadata: {
      template,
      sectionsIncluded,
      wordCount,
      generatedAt: new Date().toISOString(),
    },
    validation,
  };
}

/**
 * Builds the OpenAI prompt for project README generation
 */
function buildProjectReadmePrompt(
  project: Project,
  template: ReadmeTemplate,
  research: ReadmeResearch,
  repoAnalysis?: RepoAnalysis | null,
  config?: ConfigOptions
): string {
  const languages = Object.keys(project.languages || {}).join(", ");
  const badges = generateBadges(Object.keys(project.languages || {}));

  const templateInstructions = getTemplateInstructions(template);

  let analysisSection = "";
  if (repoAnalysis) {
    const scriptsDetails = Object.entries(repoAnalysis.scripts)
      .map(([name, cmd]) => `  - \`${name}\`: ${cmd}`)
      .join("\n");

    analysisSection = `

**🔍 REPOSITORY ANALYSIS - STUDY THIS CAREFULLY:**

**Framework Detected:** ${repoAnalysis.framework}
${repoAnalysis.framework.includes("React Native") || repoAnalysis.framework.includes("Expo") ? "⚠️ THIS IS A MOBILE APP - Do NOT use web routes!" : ""}

**Main Pages/Routes:**
${repoAnalysis.mainPages && repoAnalysis.mainPages.length > 0 ? repoAnalysis.mainPages.map((page) => `- /${page}`).join("\n") : "- No pages detected (likely mobile app or API)"}

**Key Dependencies (ANALYZE THESE):**
${repoAnalysis.dependencies
  .slice(0, 15)
  .map((dep) => `- ${dep}`)
  .join("\n")}

**Project Structure:**
${repoAnalysis.structure.map((s) => `- ${s}`).join("\n")}

**Detected Features:**
${repoAnalysis.features.map((f) => `- ${f}`).join("\n")}

**Available Scripts:**
${scriptsDetails || "  - No scripts detected"}

**HOW TO USE THIS DATA:**

1. **Framework tells you the app type:**
   - "React Native (Expo)" = Mobile app for iOS/Android
   - "Next.js" = Web application with SSR
   - "React" = Web application (SPA)
   - "Express" = Backend API

2. **Dependencies reveal functionality:**
   - Look for AI packages (@google/genai, openai)
   - Look for auth packages (@supabase/supabase-js)
   - Look for navigation (@react-navigation for mobile)
   - Look for UI libraries (@mui/material, tailwindcss)

3. **Describe features based on:**
   - Project name + description
   - Framework type (mobile vs web)
   - Dependencies (what they enable)
   - Detected features from analysis

4. **Installation instructions:**
   - Use ACTUAL scripts listed above
   - For mobile apps: Mention iOS/Android setup
   - For web apps: Mention localhost URL

**CRITICAL INSTRUCTIONS - READ CAREFULLY:**

1. **ANALYZE THE PROJECT THOROUGHLY:**
   - Read the PROJECT NAME and DESCRIPTION carefully
   - Study the FRAMEWORK detected (React Native vs Next.js vs React)
   - Examine ALL DEPENDENCIES to understand what the app does
   - Look at DETECTED FEATURES from the analysis
   - Each project is UNIQUE - don't copy features from other projects

2. **DETERMINE PROJECT TYPE:**
   - **Mobile App** (React Native/Expo): Runs on iOS/Android, uses React Navigation, Expo packages
   - **Web App** (Next.js): Has app/ directory, uses Next.js routing
   - **Web App** (React): Standard React app with React Router
   - **Backend API** (Express): Has API endpoints, no frontend
   
3. **WRITE ACCURATE INTRO:**
   - For mobile apps: "A mobile application for iOS and Android..."
   - For web apps: "A web application that..."
   - Be specific about the domain based on project name and dependencies:
     * Coding practice app: Has coding/interview in name, uses AI for feedback
     * Portfolio/career platform: Has portfolio/resume/job features
     * E-commerce: Has shopping/cart/payment features
     * Social app: Has chat/messaging/social features

4. **DESCRIBE FEATURES ACCURATELY:**
   - **For Web Apps with detected pages:** Transform routes to user actions
   - **For Mobile Apps or apps without pages:** Infer from:
     * Project name and description
     * Dependencies (e.g., @google/genai = AI features, @react-navigation = multiple screens)
     * Detected features from analysis
   - **NEVER** list web routes (/dashboard, /projects) for mobile apps
   - **NEVER** copy features from other projects

5. **TECH STACK:**
   - State clearly if it's a mobile or web app
   - List ACTUAL dependencies detected
   - For mobile: Mention iOS/Android compatibility
   - For web: Mention deployment platform if detected

6. **INSTALLATION:**
   - Use ACTUAL scripts from package.json
   - For Expo: "npm start" + instructions for mobile
   - For Next.js: "npm run dev" + localhost URL
   - For React: "npm start" + localhost URL

7. **KEEP IT CONCISE** - No fluff, no repetition, no marketing speak`;
  }

  return `Generate a PROFESSIONAL and DETAILED README.md for this GitHub project:

**Project Information:**
- Name: ${project.name}
- Description: ${project.description || "No description provided"}
- Primary Technologies: ${languages}
- GitHub Stars: ${project.stars}
- Forks: ${project.forks}
- Repository URL: ${project.url}
${analysisSection}

**PROJECT CONTEXT:**
This is a real project with actual code. Your job is to create comprehensive documentation that:
1. Explains what the project does in detail
2. Highlights its unique features and capabilities
3. Provides clear setup and usage instructions
4. Makes it easy for new contributors to understand and contribute
5. Showcases the technical sophistication of the project

**Template Style:** ${template}
${templateInstructions}

**Research Insights:**
Based on current best practices, include these sections:
${research.sections.map((s) => `- ${s}`).join("\n")}

**Visual Elements to Consider:**
${research.visualElements.map((v) => `- ${v}`).join("\n")}

**Trending Features:**
${research.trendingFeatures.map((f) => `- ${f}`).join("\n")}

**Badges to Include:**
${config?.badges !== false ? badges : "Do not include badges"}

**Sections to Include (based on user configuration):**
${config?.installation !== false ? "- Installation section (REQUIRED)" : "- Skip Installation section"}
${config?.usage !== false ? "- Usage section (REQUIRED)" : "- Skip Usage section"}
${config?.api === true ? "- API Documentation section (REQUIRED)" : "- Skip API Documentation section"}
${config?.contributing !== false ? "- Contributing section (REQUIRED)" : "- Skip Contributing section"}
${config?.license !== false ? "- License section (REQUIRED)" : "- Skip License section"}
${config?.demo !== false ? "- Demo/Screenshots section if applicable (REQUIRED)" : "- Skip Demo section"}

**CRITICAL FORMATTING RULES - MUST FOLLOW:**
1. Start with # for main title
2. Add TWO blank lines after the title
3. Add TWO blank lines before each ## section header
4. Add ONE blank line after each ## section header
5. Put badges on a separate line with blank lines above and below
6. Add blank lines between all paragraphs
7. Add blank lines before and after lists
8. Add blank lines before and after code blocks
9. Use proper code block formatting with language tags
10. Each section must be clearly separated with proper whitespace

**CONTENT REQUIREMENTS:**
1. Write a compelling, detailed project overview based on ACTUAL analysis (not generic)
2. If it's a web app, describe what users can DO with it in detail
3. For HTML/CSS/JS projects, analyze the actual functionality from files
4. For Python projects, describe the application purpose and use cases
5. Include SPECIFIC features found in the code with detailed descriptions
6. Installation steps must match the ACTUAL framework/language detected
7. Usage examples should be framework-specific and comprehensive
8. If no package.json exists, provide appropriate setup for the detected language
9. Remove placeholder text like "(Demo link will be added once available)"
10. Only include sections that are relevant to THIS specific project
11. Be DETAILED and PROFESSIONAL - this should be production-ready documentation
12. Include code examples where relevant
13. Add emojis sparingly for visual appeal (✨ 🚀 📦 🔧 ⚙️ 🎯)
14. Make the description engaging and highlight what makes this project unique

**STYLE GUIDELINES:**
- Write as if onboarding a new developer to the project
- Be CONCISE but informative - avoid fluff and repetition
- Focus on WHAT users can do, not abstract concepts
- Use clear, direct language
- Include practical setup instructions
- Make it scannable with clear sections

**TARGET AUDIENCE:**
Imagine a developer joining this project for the first time. They need to:
1. Understand what the app does in 30 seconds
2. Know what technologies are used
3. See what features/pages exist
4. Get the app running locally quickly

**EXAMPLE STRUCTURE WITH PROPER SPACING:**

# Project Name

> A compelling tagline that captures the essence of the project in one sentence


A clear 1-2 sentence description based on the PROJECT NAME and DESCRIPTION. If it's a mobile app, say "mobile app for iOS and Android". If it's a web app, say "web application".


${config?.badges !== false ? "![Badge1](url) ![Badge2](url) ![Badge3](url)" : ""}


## Overview


2-3 sentences explaining what THIS SPECIFIC PROJECT does. Include:
- What problem it solves
- Who it's for (target users)
- Key value proposition

Read the project name and description carefully. Don't assume it's the same as other projects.


## Features


**ANALYZE DEPENDENCIES AND FRAMEWORK TO DETERMINE FEATURES:**

Group features by category for better organization:
- **Core Features**: Main functionality
- **AI/Smart Features**: If using AI dependencies
- **User Management**: If using auth
- **Additional Features**: Other capabilities

**If Framework = "React Native (Expo)" or "React Native":**
- This is a MOBILE APP - NO web routes!
- Infer features from:
  * Project name (e.g., "Recode" = coding practice, "FitTrack" = fitness tracking)
  * Dependencies (@google/genai = AI features, @react-navigation = multiple screens)
  * Project description
- Example features for coding app: "Practice coding challenges", "Get AI-powered feedback", "Track your progress"

**If Framework = "Next.js" and pages detected:**
- This is a WEB APP
- Transform routes to actions:
  * /dashboard → "View analytics dashboard"
  * /projects → "Manage your projects"
  * /settings → "Configure preferences"

**If Framework = "React" or "Express":**
- Analyze dependencies to understand purpose
- Describe features based on what the dependencies enable


## Tech Stack


### Core
- **Framework**: Next.js 16 with App Router (or detected framework)
- **Language**: TypeScript (or detected language)
- **Runtime**: Node.js 20+ (if applicable)

### Styling
- **CSS Framework**: Tailwind CSS (or detected)
- **UI Library**: (if applicable)

### Backend & Database
- **Database**: Supabase (PostgreSQL) (or detected)
- **Authentication**: Supabase Auth (or detected)
- **Storage**: (if applicable)

### AI & APIs
- **AI Model**: OpenAI GPT-4o-mini (if using AI)
- **External APIs**: List any APIs used

### Code Quality
- **Linting**: ESLint (if detected)
- **Formatting**: Prettier (if detected)
- **Testing**: Vitest/Jest (if detected)

Keep it organized by category - only include sections that apply to THIS project.


## Getting Started


### Prerequisites

- **Node.js** 18+ and npm (or detected runtime)
- **For mobile apps**: iOS Simulator (Mac) or Android Emulator
- **Accounts**: List required accounts based on dependencies (Supabase, OpenAI, etc.)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repo-url>
   cd project-name
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   
   Create a \`.env.local\` file in the root directory:
   \`\`\`env
   # List actual environment variables needed
   # Based on dependencies detected
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   OPENAI_API_KEY=your_openai_key
   \`\`\`

4. **Set up database** (if applicable)
   
   Run migrations or setup instructions

5. **Run the development server**
   
   **For Next.js/Web apps:**
   \`\`\`bash
   npm run dev
   \`\`\`
   Open [http://localhost:3000](http://localhost:3000)
   
   **For Expo/React Native apps:**
   \`\`\`bash
   npm start
   \`\`\`
   - Scan QR code with Expo Go app
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator


## Available Scripts

\`\`\`bash
# List ACTUAL scripts from package.json
npm run dev              # Start development server
npm run build            # Build for production
npm test                 # Run tests
\`\`\`


## Project Structure (Optional - only if helpful)


\`\`\`
project-name/
├── app/                    # Next.js App Router (or src/)
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   └── ...
├── components/            # React components
├── lib/                   # Utility functions
└── public/                # Static assets
\`\`\`


## Deployment (Optional)


### Vercel (or detected platform)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

Include deployment instructions only if relevant to the project type.


## License


This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Contributing (Optional)


Contributions are welcome! Please feel free to submit a Pull Request.


## Contact (Optional)


- **Author**: (if available)
- **GitHub**: [@username](github-url)
- **Project Link**: [repo-url](repo-url)


## Acknowledgments (Optional)


- Built with [Framework](url)
- Powered by [Service](url)

Only include if there are notable acknowledgments.


---

**Made with ❤️ by [Author]** (optional footer)


---

**CRITICAL INSTRUCTIONS FOR GENERATION:**
1. **NO emojis** in section headers - keep them clean and professional
2. **Add tagline** under title with > blockquote
3. **Group features** by category for better organization
4. **Organize tech stack** by sections (Core, Styling, Backend, etc.)
5. **Number installation steps** clearly
6. **Include actual scripts** from package.json
7. **Add project structure** only if it helps understanding
8. **Keep intro SHORT** (1-2 sentences max)
9. **List actual features** from analysis, not generic ones
10. **Make it scannable** - developer should understand in 2 minutes
11. **Use badges** at the top for visual appeal
12. **Add proper spacing** between all sections
13. **Focus on WHAT users can do**, not abstract benefits
14. **Be specific** about the domain and purpose
15. **Include deployment** only if relevant

**STYLE NOTES:**
- Professional but friendly tone
- Clear, direct language
- No marketing fluff
- Practical, actionable information
- Well-organized with visual hierarchy

IMPORTANT: Return ONLY the Markdown content with proper spacing. Do NOT wrap in code blocks:`;
}

/**
 * Builds the OpenAI prompt for profile README generation
 */
function buildProfileReadmePrompt(
  profileData: ProfileReadmeData,
  template: ReadmeTemplate,
  research: ReadmeResearch
): string {
  const templateInstructions = getTemplateInstructions(template);

  const projectsList = profileData.topProjects
    .map(
      (p) =>
        `- **${p.name}**: ${p.description || "No description"} (⭐ ${p.stars})`
    )
    .join("\n");

  return `Generate a professional GitHub profile README for this developer:

**Profile Information:**
- Username: ${profileData.username}
- Tech Stack: ${profileData.techStack.join(", ")}
- Total Repositories: ${profileData.stats.totalRepos}
- Total Stars: ${profileData.stats.totalStars}

**Top Projects:**
${projectsList}

**Template Style:** ${template}
${templateInstructions}

**Research Insights:**
Based on current best practices for profile READMEs, include:
${research.sections.map((s) => `- ${s}`).join("\n")}

**Visual Elements to Consider:**
${research.visualElements.map((v) => `- ${v}`).join("\n")}

**Trending Features:**
${research.trendingFeatures.map((f) => `- ${f}`).join("\n")}

**Instructions:**
1. Create an engaging profile README that showcases the developer
2. Include GitHub stats widgets using:
   - \`![GitHub Stats](https://github-readme-stats.vercel.app/api?username=${profileData.username}&show_icons=true&theme=radical)\`
   - \`![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=${profileData.username}&layout=compact&theme=radical)\`
3. Add skill badges for technologies
4. Highlight top projects with links
5. Make it personal and engaging
6. Use emojis appropriately
7. Return ONLY the Markdown content, no wrapper code blocks

Generate the profile README now:`;
}

/**
 * Gets template-specific instructions
 */
function getTemplateInstructions(template: ReadmeTemplate): string {
  switch (template) {
    case "minimal":
      return "Keep it concise and focused. Include only essential sections: About, Installation, Usage.";
    case "detailed":
      return "Be comprehensive. Include all sections with detailed explanations, examples, and documentation.";
    case "visual":
      return "Emphasize visual elements. Include screenshots, GIFs, diagrams, and make it visually appealing.";
    case "professional":
      return "Use a professional tone. Include badges, proper structure, contributing guidelines, and license information.";
    default:
      return "";
  }
}

/**
 * Calls OpenAI API to generate README content
 */
async function callOpenAI(
  prompt: string,
  type: "project" | "profile"
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert technical writer creating a README for a new developer joining this project.

YOUR GOAL:
Write a README that helps someone understand and run the project in under 5 minutes.

WRITING STYLE:
- Be CONCISE and DIRECT - no fluff or marketing speak
- Focus on WHAT users can do, not abstract benefits
- Use simple, clear language
- List actual features/pages, not vague capabilities
- Make it scannable with clear sections
- Use emojis sparingly (only for section headers if at all)

CRITICAL RULES:
1. Intro: 1-2 sentences MAX explaining what the app does
2. Overview: 2-3 sentences about purpose and target users
3. Features: List actual pages/features users can access
4. Tech Stack: Simple bullet list of main technologies
5. Getting Started: Clear, step-by-step installation
6. Keep it SHORT - quality over quantity

FORMATTING:
1. Add TWO blank lines after the title
2. Add TWO blank lines before each ## heading
3. Add ONE blank line after each ## heading
4. Add ONE blank line between paragraphs
5. Add ONE blank line before and after code blocks
6. Add ONE blank line before and after lists
7. Put badges on their own line with blank lines above and below

AVOID:
- Repetitive explanations
- Marketing language ("revolutionary", "innovative", "seamless", "engaging")
- Just listing page routes without explaining what users can do
- Long paragraphs
- Abstract concepts without concrete examples

**DEPENDENCY-BASED FEATURE INFERENCE:**

Study the dependencies to understand what the app can do:
- **@google/genai** or **openai** → AI-powered features (code generation, feedback, chat)
- **@supabase/supabase-js** → User authentication, database storage
- **@react-navigation** → Multiple screens/navigation (mobile)
- **expo-camera** → Camera functionality
- **expo-location** → Location tracking
- **@stripe** → Payment processing
- **socket.io** → Real-time communication
- **axios** or **fetch** → API integration

**FRAMEWORK-SPECIFIC FEATURES:**
- **React Native/Expo**: Mobile app features (touch gestures, notifications, offline support)
- **Next.js**: Server-side rendering, API routes, optimized performance
- **Express**: RESTful API, backend services

**IMPORTANT:** 
- Each project is UNIQUE - analyze its specific dependencies and framework
- Don't assume features - derive them from actual dependencies
- Mobile apps ≠ Web apps (different features, different installation)

Generate clear, CONCISE, scannable Markdown.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Clean up the response and ensure proper spacing
    let cleaned = responseText.trim();

    // Remove markdown code block wrapper if present
    cleaned = cleaned.replace(/^```markdown\n?/i, "").replace(/\n?```$/i, "");

    // Ensure proper spacing after title
    cleaned = cleaned.replace(/^(#\s+.+)\n([^#\n])/m, "$1\n\n$2");

    // Ensure proper spacing before section headers
    cleaned = cleaned.replace(/([^\n])\n(##\s+)/g, "$1\n\n$2");

    // Ensure proper spacing after section headers
    cleaned = cleaned.replace(/(##\s+.+)\n([^#\n])/g, "$1\n\n$2");

    // Ensure badges have spacing
    cleaned = cleaned.replace(
      /(\]\(https:\/\/img\.shields\.io[^\)]+\))\s*(\]\()/g,
      "$1 $2"
    );
    cleaned = cleaned.replace(
      /(\]\(https:\/\/img\.shields\.io[^\)]+\))\n([^!\n])/g,
      "$1\n\n$2"
    );

    return cleaned.trim();
  } catch (error) {
    console.error("Error generating README:", error);
    throw new Error(`Failed to generate README: ${error}`);
  }
}

/**
 * Generates badge markdown for technologies
 */
export function generateBadges(technologies: string[]): string {
  const badgeMap: Record<string, string> = {
    TypeScript:
      "![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)",
    JavaScript:
      "![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)",
    React:
      "![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)",
    "Next.js":
      "![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)",
    "Node.js":
      "![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)",
    Python:
      "![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)",
    "Tailwind CSS":
      "![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)",
    Docker:
      "![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)",
    Supabase:
      "![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)",
    PostgreSQL:
      "![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)",
    Vercel:
      "![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)",
    "Framer Motion":
      "![Framer](https://img.shields.io/badge/Framer-black?style=for-the-badge&logo=framer&logoColor=blue)",
    Vitest:
      "![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)",
    ESLint:
      "![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)",
    Prettier:
      "![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)",
  };

  return technologies
    .map(
      (tech) =>
        badgeMap[tech] ||
        `![${tech}](https://img.shields.io/badge/${encodeURIComponent(tech)}-blue?style=for-the-badge)`
    )
    .join(" ");
}

/**
 * Extracts section headings from markdown content
 */
function extractSections(content: string): string[] {
  const sections: string[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^#{1,3}\s+(.+)/);
    if (match) {
      sections.push(match[1].trim());
    }
  }

  return sections;
}

/**
 * Extracts unique technologies from projects
 */
function extractUniqueTechnologies(projects: Project[]): string[] {
  const techSet = new Set<string>();

  projects.forEach((project) => {
    if (project.languages) {
      Object.keys(project.languages).forEach((lang) => techSet.add(lang));
    }
  });

  return Array.from(techSet).slice(0, 12); // Limit to 12 technologies
}

/**
 * Calculates stats from projects
 */
function calculateStats(projects: Project[]): ProfileReadmeData["stats"] {
  const totalStars = projects.reduce((sum, p) => sum + (p.stars || 0), 0);
  const totalRepos = projects.length;

  const languages: Record<string, number> = {};
  projects.forEach((project) => {
    if (project.languages) {
      Object.entries(project.languages).forEach(([lang, percentage]) => {
        languages[lang] = (languages[lang] || 0) + percentage;
      });
    }
  });

  return {
    totalStars,
    totalRepos,
    languages,
  };
}
