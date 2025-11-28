import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { interviewId, question, answer, questionIndex } = body;

    console.log("Test save called with:", {
      interviewId,
      question,
      answer,
      questionIndex,
    });

    const supabase = await createClient();

    const { data: interview, error: fetchError } = await supabase
      .from("interviews")
      .select("responses")
      .eq("id", interviewId)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { error: "Interview not found", details: fetchError },
        { status: 404 }
      );
    }

    console.log("Current responses:", interview.responses);

    const responses = interview.responses || [];
    responses.push({
      question,
      answer,
      questionIndex,
      timestamp: new Date().toISOString(),
    });

    console.log("New responses array:", responses);

    const { data: updated, error: updateError } = await supabase
      .from("interviews")
      .update({ responses })
      .eq("id", interviewId)
      .select();

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save response", details: updateError },
        { status: 500 }
      );
    }

    console.log("Updated successfully:", updated);

    return NextResponse.json({
      success: true,
      message: "Response saved successfully",
      totalResponses: responses.length,
      updated,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
