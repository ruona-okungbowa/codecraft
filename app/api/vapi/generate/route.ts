import { createClient } from "@/lib/supabase/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const isVapiRequest = authHeader?.startsWith("Bearer ");

    let userId: string | null = null;
    if (isVapiRequest) {
      const token = authHeader?.replace("Bearer ", "");
      const expectedToken = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

      if (!expectedToken) {
        console.error("VAPI_API_SECRET not configured");
        return NextResponse.json(
          { error: "Server configuration error" },
          { status: 500 }
        );
      }

      if (token !== expectedToken) {
        console.error("Invalid VAPI token");
        return NextResponse.json(
          { error: "Unauthorized - Invalid token" },
          { status: 401 }
        );
      }

      const body = await request.json();
      userId = body.userId;

      if (!userId) {
        return NextResponse.json(
          { error: "userId is required for VAPI requests" },
          { status: 400 }
        );
      }
    } else {
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
      }
      userId = user.id;
    }

    const body = await request.json();
    const { type, role, level, techstack, amount, projectId } = body;

    console.log("Generate interview request:", {
      type,
      role,
      level,
      techstack,
      amount,
      projectId,
      userId,
    });

    // Validate required fields
    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json(
        { error: "Interview type is required" },
        { status: 400 }
      );
    }

    if (!level) {
      return NextResponse.json(
        { error: "Experience level is required" },
        { status: 400 }
      );
    }

    // Validate amount
    if (!amount || amount < 1 || amount > 10) {
      return NextResponse.json(
        { error: "Amount must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Fetch project details if project-based interview
    let projectDetails = null;
    if (type === "project-based" && projectId) {
      const supabase = await createClient();
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", userId)
        .single();

      if (projectError || !project) {
        return NextResponse.json(
          { error: "Project not found or access denied" },
          { status: 404 }
        );
      }

      projectDetails = project;
    }

    // Build prompt based on interview type
    let promptDetails = `Job Details:
- Role: ${role}
- Experience Level: ${level}
- Interview Type: ${type}`;

    // Add project-specific context
    if (type === "project-based" && projectDetails) {
      const languages = projectDetails.languages
        ? Object.keys(projectDetails.languages).join(", ")
        : "various technologies";

      promptDetails += `\n\nProject Context:
- Project Name: ${projectDetails.name}
- Description: ${projectDetails.description || "No description provided"}
- Technologies Used: ${languages}
- GitHub URL: ${projectDetails.url}`;

      if (projectDetails.readme_content) {
        promptDetails += `\n- README Summary: ${projectDetails.readme_content.substring(0, 500)}...`;
      }
    }

    // Only include tech stack for technical and mixed interviews
    if ((type === "technical" || type === "mixed") && techstack) {
      promptDetails += `\n- Tech Stack: ${techstack}`;
    }

    // Build interview-specific prompt
    let interviewPrompt = "";
    if (type === "project-based") {
      interviewPrompt = `Generate EXACTLY ${amount} interview questions about the candidate's specific project.

${promptDetails}

QUESTION FOCUS:
- Ask about technical decisions made in this project
- Inquire about challenges faced and how they were solved
- Explore the architecture and design patterns used
- Discuss the technologies and why they were chosen
- Ask about testing, deployment, and maintenance
- Probe into specific features or implementations

CRITICAL REQUIREMENTS:
1. Generate EXACTLY ${amount} questions - no more, no less
2. Number each question (e.g., "Question 1 of ${amount}: ...")
3. Questions must be SPECIFIC to this project (use project name and details)
4. Do not use special characters like "/" or "*" (voice assistant compatibility)
5. Return ONLY a valid JSON array of strings
6. Each question should be clear, specific, and demonstrate deep understanding

Format (example for 3 questions):
["Question 1 of 3: In your ${projectDetails?.name} project, what led you to choose ${Object.keys(projectDetails?.languages || {})[0]} as the primary technology?","Question 2 of 3: Can you walk me through the architecture of ${projectDetails?.name} and explain your design decisions?","Question 3 of 3: What was the most challenging technical problem you solved in ${projectDetails?.name} and how did you approach it?"]

Generate exactly ${amount} project-specific questions now:`;
    } else {
      interviewPrompt = `Generate EXACTLY ${amount} interview questions for a ${role} position.

${promptDetails}

CRITICAL REQUIREMENTS:
1. Generate EXACTLY ${amount} questions - no more, no less
2. Number each question (e.g., "Question 1 of ${amount}: ...")
3. Questions should be appropriate for ${type} interview focus
4. Do not use special characters like "/" or "*" (voice assistant compatibility)
5. Return ONLY a valid JSON array of strings
6. Each question should be clear and concise

Format (example for 3 questions):
["Question 1 of 3: First question text here","Question 2 of 3: Second question text here","Question 3 of 3: Third question text here"]

Generate exactly ${amount} questions now:`;
    }

    const { text: questions } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: interviewPrompt,
    });

    // Parse and validate questions
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);

      if (!Array.isArray(parsedQuestions)) {
        throw new Error("Questions must be an array");
      }

      // Ensure exact count
      if (parsedQuestions.length !== amount) {
        console.warn(
          `Expected ${amount} questions, got ${parsedQuestions.length}. Adjusting...`
        );
        if (parsedQuestions.length > amount) {
          parsedQuestions = parsedQuestions.slice(0, amount);
        }
      }
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Failed to parse generated questions",
          details:
            parseError instanceof Error ? parseError.message : "Parse error",
        },
        { status: 500 }
      );
    }

    const interview = {
      user_id: userId,
      role,
      type,
      level,
      questions: parsedQuestions,
      finalised: true,
      // Use empty array for non-technical interviews, or parse techstack if provided
      techstack:
        (type === "technical" || type === "mixed") && techstack
          ? techstack.split(",").map((tech: string) => tech.trim())
          : type === "project-based" && projectDetails?.languages
            ? Object.keys(projectDetails.languages)
            : [],
      // Store project reference for project-based interviews
      project_id: type === "project-based" ? projectId : null,
    };

    const supabase = await createClient();

    const { data: userInterview, error: insertError } = await supabase
      .from("interviews")
      .insert(interview)
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting interview:", insertError);
      return NextResponse.json(
        { error: "Failed to save interview", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userInterview,
    });
  } catch (error) {
    console.error("Error generating interview questions:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate interview",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: true, data: "Thank you!" },
    { status: 200 }
  );
}
