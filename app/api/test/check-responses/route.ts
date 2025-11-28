import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get("interviewId");

    if (!interviewId) {
      return NextResponse.json(
        { error: "interviewId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: interview, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", interviewId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Interview not found", details: error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      interview,
      hasResponses: !!interview.responses,
      responsesCount: Array.isArray(interview.responses)
        ? interview.responses.length
        : 0,
      responsesData: interview.responses,
    });
  } catch (error) {
    console.error("Error checking responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
