import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("=== Save Response Called ===");

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const expectedToken = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

    console.log("Auth check:", {
      hasToken: !!token,
      hasExpected: !!expectedToken,
    });

    if (!expectedToken || token !== expectedToken) {
      console.log("Auth failed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { interviewId, question, answer, questionIndex } = body;

    console.log("Request body:", {
      interviewId,
      question: question?.substring(0, 50),
      answer: answer?.substring(0, 50),
      questionIndex,
    });

    if (!interviewId || !question || !answer || questionIndex === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get existing interview
    const { data: interview, error: fetchError } = await supabase
      .from("interviews")
      .select("responses, questions")
      .eq("id", interviewId)
      .single();

    if (fetchError) {
      console.error("Error fetching interview:", fetchError);
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Update responses
    const responses = interview.responses || [];
    responses.push({
      question,
      answer,
      questionIndex,
      timestamp: new Date().toISOString(),
    });

    const totalQuestions = interview.questions?.length || 0;
    const progress = Math.round((responses.length / totalQuestions) * 100);

    const { error: updateError } = await supabase
      .from("interviews")
      .update({
        responses,
        current_question_index: questionIndex + 1,
      })
      .eq("id", interviewId);

    if (updateError) {
      console.error("Error updating interview:", updateError);
      return NextResponse.json(
        { error: "Failed to save response" },
        { status: 500 }
      );
    }

    console.log(
      `Response saved successfully. Progress: ${responses.length}/${totalQuestions} (${progress}%)`
    );

    return NextResponse.json({
      success: true,
      message: "Response saved successfully",
      totalResponses: responses.length,
      totalQuestions: totalQuestions,
      progress: progress,
      nextQuestionIndex: questionIndex + 1,
      isComplete: responses.length >= totalQuestions,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving interview response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
