import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all interviews with feedback
    const { data: interviews, error: interviewsError } = await supabase
      .from("interviews")
      .select("id, created_at, type, level")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (interviewsError) {
      console.error("Error fetching interviews:", interviewsError);
      return NextResponse.json(
        { error: "Failed to fetch interviews" },
        { status: 500 }
      );
    }

    // Fetch feedback for each interview
    const interviewIds = interviews?.map((i) => i.id) || [];
    const { data: feedbackData, error: feedbackError } = await supabase
      .from("interview_feedback")
      .select("interview_id, total_score, created_at")
      .in("interview_id", interviewIds)
      .order("created_at", { ascending: true });

    if (feedbackError) {
      console.error("Error fetching feedback:", feedbackError);
    }

    // Calculate statistics
    const stats = {
      totalInterviews: interviews?.length || 0,
      completedInterviews: feedbackData?.length || 0,
      averageScore:
        feedbackData && feedbackData.length > 0
          ? Math.round(
              feedbackData.reduce((sum, f) => sum + f.total_score, 0) /
                feedbackData.length
            )
          : 0,
      scoreHistory:
        feedbackData?.map((f) => ({
          score: f.total_score,
          date: f.created_at,
        })) || [],
      improvement:
        feedbackData && feedbackData.length >= 2
          ? feedbackData[feedbackData.length - 1].total_score -
            feedbackData[0].total_score
          : 0,
      byType: {
        technical: 0,
        behavioral: 0,
        "system design": 0,
        mixed: 0,
      },
    };

    // Count by type
    interviews?.forEach((interview) => {
      const type = interview.type as keyof typeof stats.byType;
      if (stats.byType[type] !== undefined) {
        stats.byType[type]++;
      }
    });

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error in interview stats route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
