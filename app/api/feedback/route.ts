import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/feedback?interviewId=xxx - Get feedback for an interview
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get("interviewId");

    if (!interviewId) {
      return NextResponse.json(
        { error: "interviewId is required" },
        { status: 400 }
      );
    }

    const { data: feedback, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("interview_id", interviewId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Feedback not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching feedback:", error);
      return NextResponse.json(
        { error: "Failed to fetch feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get("interviewId");

    if (!interviewId) {
      return NextResponse.json(
        { error: "interviewId is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("feedback")
      .delete()
      .eq("interview_id", interviewId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting feedback:", error);
      return NextResponse.json(
        { error: "Failed to delete feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
