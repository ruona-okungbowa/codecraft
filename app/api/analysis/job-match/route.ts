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
    const { jobDescription } = body;

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
            "You are an expert career advisor analyzing job matches. Return your response as valid JSON only.",
        },
        {
          role: "user",
          content: `Analyze how well this candidate's skills match the job requirements.

Job Description:
${jobDescription}

Candidate's Skills:
${userSkills.join(", ")}

Candidate's Projects:
${projects.map((p) => `- ${p.name}: ${p.description || "No description"}`).join("\n")}

Provide a detailed match analysis in JSON format:
{
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
  "summary": "brief summary of the match"
}

Be honest and accurate. Consider:
- Required vs nice-to-have skills
- Years of experience if mentioned
- Project complexity and relevance
- Technology stack alignment
- Identify bonus skills the candidate has that aren't required but add value
- Prioritize missing skills as high, medium, or low based on job requirements`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(responseText);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error analyzing job match:", error);
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
  }>
): string[] {
  const skillsSet = new Set<string>();

  projects.forEach((project) => {
    if (project.languages) {
      Object.keys(project.languages).forEach((lang) => skillsSet.add(lang));
    }

    if (project.tech_stack) {
      project.tech_stack.forEach((tech: string) => skillsSet.add(tech));
    }

    if (project.description) {
      const commonTech = [
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
        "TypeScript",
        "JavaScript",
        "Python",
        "Java",
        "Go",
        "Rust",
        "C++",
        "C#",
      ];

      commonTech.forEach((tech) => {
        if (
          project.description?.toLowerCase().includes(tech.toLowerCase()) ||
          project.name.toLowerCase().includes(tech.toLowerCase())
        ) {
          skillsSet.add(tech);
        }
      });
    }
  });

  return Array.from(skillsSet);
}
