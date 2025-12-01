import { createClient } from "@/lib/supabase/server";
import { generateInterviewFeedback } from "@/lib/feedback/generate";
import { NextResponse } from "next/server";

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
    const { interviewId } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: "interviewId is required" },
        { status: 400 }
      );
    }

    // Get interview with responses
    const { data: interview, error: interviewError } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", interviewId)
      .eq("user_id", user.id)
      .single();

    if (interviewError || !interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    if (!interview.responses || interview.responses.length === 0) {
      console.error(
        `Interview ${interviewId} has no responses. Interview data:`,
        JSON.stringify(interview, null, 2)
      );
      return NextResponse.json(
        {
          error: "No responses found",
          details: `Interview has ${interview.responses?.length || 0} responses. Expected at least 1.`,
          interviewId,
        },
        { status: 400 }
      );
    }

    // Get existing feedback count to determine attempt number
    const { count: feedbackCount } = await supabase
      .from("feedback")
      .select("id", { count: "exact" })
      .eq("interview_id", interviewId);

    const attemptNumber = (feedbackCount || 0) + 1;
    console.log(
      `Generating feedback attempt #${attemptNumber} for interview ${interviewId}`
    );

    console.log(
      `Generating feedback for interview ${interviewId} with ${interview.responses.length} responses`
    );

    const transcript = interview.responses.flatMap(
      (response: { question: string; answer: string }) => [
        { role: "interviewer", content: response.question },
        { role: "candidate", content: response.answer },
      ]
    );

    // Pass both transcript and original questions for better context
    const feedback = await generateInterviewFeedback(
      transcript,
      interview.questions || []
    );

    console.log(
      `Feedback generated successfully for interview ${interviewId}. Total score: ${feedback.totalScore}`
    );

    const { data: savedFeedback, error: saveError } = await supabase
      .from("feedback")
      .insert({
        interview_id: interviewId,
        user_id: user.id,
        attempt_number: attemptNumber,
        total_score: feedback.totalScore,
        category_scores: feedback.categoryScores,
        question_breakdown: feedback.questionBreakdown,
        strengths: feedback.strengths,
        areas_for_improvement: feedback.areasForImprovement,
        final_assessment: feedback.finalAssessment,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving feedback:", saveError);
      return NextResponse.json(
        { error: "Failed to save feedback", details: saveError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      feedback: savedFeedback,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating feedback:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
    });

    // Check if it's a rate limit error
    if (
      errorMessage.includes("429") ||
      errorMessage.toLowerCase().includes("rate limit")
    ) {
      const retryMatch = errorMessage.match(/try again in ([^.]+)/i);
      const retryAfter = retryMatch ? retryMatch[1] : "a few minutes";

      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          details: `OpenAI API rate limit reached. Please try again in ${retryAfter}.`,
          retryAfter,
          code: "RATE_LIMIT_EXCEEDED",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 }
    );
  }
}
