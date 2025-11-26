import { createClient } from "@/lib/supabase/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await request.json();
    const { type, role, level, techstack, amount, userId } = body;

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
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: userId,
      finalised: true,
      createdAt: new Date().toISOString(),
    };

    const { data: userInterview, error: insertError } = await supabase
      .from("interviews")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (insertError) {
      console.error("Error inserting user interview:", insertError);
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
