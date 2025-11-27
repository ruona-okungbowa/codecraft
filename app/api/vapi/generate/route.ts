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
    const { type, role, level, techstack, amount } = body;

    const { text: questions } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Prepare questions for a job interview. The job role is ${role}. The job experience level is ${level}. The tech stack used in the job is ${techstack}. 
      The focus between behavioural and technical questions should lean towards: ${type}. 
      The amount of questions required is: ${amount}.
      Please return only the questions, without any additional text.
      The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
      Return the questions formatted like this:
      ["Question 1","Question 2","Question 3"]
      Thank you! <3`,
    });

    const interview = {
      user_id: userId, // Use user.id from auth, not userId from body
      role,
      type,
      level,
      techstack: techstack.split(",").map((tech: string) => tech.trim()),
      questions: JSON.parse(questions),
      finalised: true,
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
    console.error("Error generating interview questions", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { success: true, data: "Thank you!" },
    { status: 200 }
  );
}
