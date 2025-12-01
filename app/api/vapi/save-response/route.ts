import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { interviewId, question, answer, questionIndex } = body;

    if (!interviewId || !question || !answer) {
      return NextResponse.json(
        { error: "interviewId, question, and answer are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current interview state
    const { data: interview, error: fetchError } = await supabase
      .from("interviews")
      .select("responses, questions, current_question_index")
      .eq("id", interviewId)
      .single();

    if (fetchError || !interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const responses = interview.responses || [];

    // Add new response
    responses.push({
      question,
      answer,
      questionIndex: questionIndex ?? responses.length,
      timestamp: new Date().toISOString(),
    });

    // Update interview with new response and increment question index
    const { error: updateError } = await supabase
      .from("interviews")
      .update({
        responses,
        current_question_index: (questionIndex ?? 0) + 1,
      })
      .eq("id", interviewId);

    if (updateError) {
      console.error("Error updating interview:", updateError);
      return NextResponse.json(
        { error: "Failed to save response", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      responseCount: responses.length,
      totalQuestions: interview.questions?.length || 0,
    });
  } catch (error) {
    console.error("Error in save-response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
