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
      return NextResponse.json(
        { error: "Interview has no responses to analyze" },
        { status: 400 }
      );
    }

    const { data: existingFeedback } = await supabase
      .from("feedback")
      .select("id")
      .eq("interview_id", interviewId)
      .single();

    if (existingFeedback) {
      return NextResponse.json(
        { error: "Feedback already exists for this interview" },
        { status: 409 }
      );
    }

    const transcript = interview.responses.flatMap(
      (response: { question: string; answer: string }) => [
        { role: "interviewer", content: response.question },
        { role: "candidate", content: response.answer },
      ]
    );

    const feedback = await generateInterviewFeedback(transcript);

    const { data: savedFeedback, error: saveError } = await supabase
      .from("feedback")
      .insert({
        interview_id: interviewId,
        user_id: user.id,
        total_score: feedback.totalScore,
        category_scores: feedback.categoryScores,
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
