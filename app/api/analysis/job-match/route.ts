import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai/client";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobDescription, jobTitle, companyName, saveMatch = true } = body;

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id);

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      );
    }

    const userSkills = extractSkillsFromProjects(projects);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert career advisor analysing job matches. Return your response as valid JSON only.",
        },
        {
          role: "user",
          content: `Analyze how well this candidate's skills match the job requirements.

Job Description:
${jobDescription}

Candidate's Skills:
${userSkills.join(", ")}

Candidate's Projects:
${projects.map((p) => `- ${p.id}: ${p.name} - ${p.description || "No description"}`).join("\n")}

Provide a detailed match analysis in JSON format:
{
  "jobTitle": "extracted job title from description",
  "matchPercentage": number (0-100),
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": [
    {"skill": "skill1", "priority": "high"},
    {"skill": "skill2", "priority": "medium"}
  ],
  "bonusSkills": ["skill1", "skill2"],
  "recommendations": [
    {"title": "Title", "description": "Description"}
  ],
  "summary": "brief summary of the match",
  "projectMappings": [
    {
      "projectId": "project-uuid",
      "projectName": "project name",
      "matchedSkills": ["skill1", "skill2"],
      "relevanceScore": number (0-100)
    }
  ],
  "interviewQuestions": [
    {
      "question": "Sample interview question",
      "category": "technical|behavioral|system-design",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Be honest and accurate. Consider:
- Required vs nice-to-have skills
- Years of experience if mentioned
- Project complexity and relevance
- Technology stack alignment
- Identify bonus skills the candidate has that aren't required but add value
- Prioritise missing skills as high, medium, or low based on job requirements
- Map each project to relevant skills and score its relevance (0-100)
- Generate 5-8 interview questions based on the job requirements and candidate's background`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(responseText);

    // Save to database if requested
    if (saveMatch) {
      const { data: savedMatch, error: saveError } = await supabase
        .from("job_matches")
        .insert({
          user_id: user.id,
          job_title: jobTitle || result.jobTitle || "Untitled Position",
          company_name: companyName,
          job_description: jobDescription,
          match_percentage: result.matchPercentage,
          matched_skills: result.matchedSkills,
          missing_skills: result.missingSkills,
          bonus_skills: result.bonusSkills,
          recommendations: result.recommendations,
          summary: result.summary,
          project_mappings: result.projectMappings || [],
          interview_questions: result.interviewQuestions || [],
        })
        .select()
        .single();

      if (saveError) {
        console.error("Error saving job match:", saveError);
      } else {
        result.matchId = savedMatch.id;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error analysing job match:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function extractSkillsFromProjects(
  projects: Array<{
    languages?: Record<string, number>;
    tech_stack?: string[];
    description?: string;
    name: string;
    readme_content?: string;
  }>
): string[] {
  const skillsSet = new Set<string>();

  projects.forEach((project) => {
    // Extract from languages
    if (project.languages) {
      Object.keys(project.languages).forEach((lang) => {
        const normalized = normalizeLanguageName(lang);
        skillsSet.add(normalized);
      });
    }

    // Extract from tech_stack
    if (project.tech_stack) {
      project.tech_stack.forEach((tech: string) => skillsSet.add(tech));
    }

    // Extract from description, name, and README
    const searchText =
      `${project.description || ""} ${project.name} ${project.readme_content || ""}`.toLowerCase();

    const techPatterns: Record<string, string[]> = {
      // Core web technologies
      HTML: ["html", "html5", "markup"],
      CSS: ["css", "css3", "stylesheet", "styling"],
      JavaScript: ["javascript", "js", "ecmascript", "es6", "es2015"],
      TypeScript: ["typescript", "ts"],

      // Frontend frameworks & libraries
      React: ["react", "reactjs", "react.js", "jsx"],
      "Next.js": ["next", "nextjs", "next.js"],
      Vue: ["vue", "vuejs", "vue.js"],
      Angular: ["angular", "angularjs"],
      Svelte: ["svelte", "sveltekit"],
      "React Native": ["react native", "react-native"],
      jQuery: ["jquery"],
      Ember: ["ember", "emberjs"],

      // CSS frameworks & preprocessors
      "Tailwind CSS": ["tailwind", "tailwindcss"],
      Bootstrap: ["bootstrap"],
      "Material UI": ["material ui", "mui", "material-ui"],
      "Chakra UI": ["chakra", "chakra ui"],
      SASS: ["sass", "scss"],
      LESS: ["less"],
      "Styled Components": ["styled-components", "styled components"],

      // Backend frameworks
      "Node.js": ["node", "nodejs", "node.js"],
      Express: ["express", "expressjs"],
      Django: ["django"],
      Flask: ["flask"],
      FastAPI: ["fastapi"],
      Spring: ["spring", "spring boot"],
      Laravel: ["laravel"],
      Rails: ["rails", "ruby on rails"],
      "ASP.NET": ["asp.net", "aspnet", "dotnet"],
      NestJS: ["nestjs", "nest.js"],

      // Databases
      MongoDB: ["mongodb", "mongo"],
      PostgreSQL: ["postgresql", "postgres", "psql"],
      MySQL: ["mysql"],
      Redis: ["redis"],
      Firebase: ["firebase", "firestore"],
      Supabase: ["supabase"],
      SQLite: ["sqlite"],
      DynamoDB: ["dynamodb"],
      Cassandra: ["cassandra"],
      "SQL Server": ["sql server", "mssql"],
      Oracle: ["oracle db", "oracle database"],
      Elasticsearch: ["elasticsearch", "elastic"],

      // Cloud platforms & services
      AWS: ["aws", "amazon web services", "ec2", "s3", "lambda"],
      Azure: ["azure", "microsoft azure"],
      GCP: ["gcp", "google cloud"],
      Vercel: ["vercel"],
      Netlify: ["netlify"],
      Heroku: ["heroku"],
      DigitalOcean: ["digitalocean", "digital ocean"],

      // DevOps & CI/CD
      Docker: ["docker", "dockerfile", "containerization"],
      Kubernetes: ["kubernetes", "k8s"],
      "CI/CD": [
        "ci/cd",
        "cicd",
        "continuous integration",
        "continuous deployment",
      ],
      Jenkins: ["jenkins"],
      "GitHub Actions": ["github actions", "gh actions"],
      GitLab: ["gitlab ci", "gitlab"],
      Terraform: ["terraform"],
      Ansible: ["ansible"],

      // APIs & protocols
      "REST API": ["rest", "rest api", "restful"],
      GraphQL: ["graphql"],
      WebSocket: ["websocket", "ws"],
      gRPC: ["grpc"],
      SOAP: ["soap"],

      // State management
      Redux: ["redux"],
      Zustand: ["zustand"],
      MobX: ["mobx"],
      Recoil: ["recoil"],
      "Context API": ["context api", "react context"],

      // Testing frameworks
      Jest: ["jest"],
      Vitest: ["vitest"],
      Cypress: ["cypress"],
      Mocha: ["mocha"],
      Chai: ["chai"],
      Jasmine: ["jasmine"],
      Selenium: ["selenium"],
      Playwright: ["playwright"],
      "React Testing Library": ["react testing library", "rtl"],

      // Build tools & bundlers
      Webpack: ["webpack"],
      Vite: ["vite"],
      Rollup: ["rollup"],
      Parcel: ["parcel"],
      esbuild: ["esbuild"],
      Babel: ["babel"],

      // Version control
      Git: ["git", "github", "gitlab", "bitbucket"],

      // Mobile development
      Flutter: ["flutter"],
      Xamarin: ["xamarin"],

      // Data science & ML
      TensorFlow: ["tensorflow"],
      PyTorch: ["pytorch"],
      Pandas: ["pandas"],
      NumPy: ["numpy"],
      "Scikit-learn": ["scikit-learn", "sklearn"],
      Keras: ["keras"],

      // Other languages
      Python: ["python"],
      Java: ["java"],
      "C#": ["c#", "csharp"],
      "C++": ["c++", "cpp"],
      Go: ["golang", "go"],
      Rust: ["rust"],
      Ruby: ["ruby"],
      PHP: ["php"],
      Scala: ["scala"],
      Dart: ["dart"],
      Elixir: ["elixir"],

      // Message queues & streaming
      RabbitMQ: ["rabbitmq"],
      Kafka: ["kafka"],
      "Apache Spark": ["spark", "apache spark"],

      // Authentication & security
      OAuth: ["oauth"],
      JWT: ["jwt", "json web token"],
      Auth0: ["auth0"],

      // CMS & e-commerce
      WordPress: ["wordpress"],
      Shopify: ["shopify"],
      Contentful: ["contentful"],
      Strapi: ["strapi"],

      // Monitoring & logging
      Prometheus: ["prometheus"],
      Grafana: ["grafana"],
      "New Relic": ["new relic"],
      Datadog: ["datadog"],
      Sentry: ["sentry"],

      // Other tools
      Postman: ["postman"],
      Figma: ["figma"],
      Jira: ["jira"],
      Agile: ["agile", "scrum"],
    };

    Object.entries(techPatterns).forEach(([skill, patterns]) => {
      for (const pattern of patterns) {
        // Escape special regex characters
        const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Use word boundaries for better matching
        const regex = new RegExp(`\\b${escapedPattern}\\b`, "i");
        if (regex.test(searchText)) {
          skillsSet.add(skill);
          break;
        }
      }
    });
  });

  return Array.from(skillsSet);
}

function normalizeLanguageName(lang: string): string {
  const langMap: Record<string, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    html: "HTML",
    css: "CSS",
    "c#": "C#",
    csharp: "C#",
    "c++": "C++",
    cpp: "C++",
    go: "Go",
    golang: "Go",
    rust: "Rust",
    ruby: "Ruby",
    php: "PHP",
    swift: "Swift",
    kotlin: "Kotlin",
    dart: "Dart",
    scala: "Scala",
    elixir: "Elixir",
    shell: "Shell",
    bash: "Bash",
  };

  const lower = lang.toLowerCase();
  return langMap[lower] || lang;
}
