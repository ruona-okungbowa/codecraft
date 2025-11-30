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
      prompt: `Generate EXACTLY ${amount} interview questions for a ${role} position.

Job Details:
- Role: ${role}
- Experience Level: ${level}
- Tech Stack: ${techstack}
- Interview Type: ${type}

CRITICAL REQUIREMENTS:
1. Generate EXACTLY ${amount} questions - no more, no less
2. Questions should be appropriate for ${type} interview focus
3. Do not use special characters like "/" or "*" (voice assistant compatibility)
4. Return ONLY a valid JSON array of strings
5. Each question should be clear and concise

Format (example for 3 questions):
["Question 1 text here","Question 2 text here","Question 3 text here"]

Generate exactly ${amount} questions now:`,
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
