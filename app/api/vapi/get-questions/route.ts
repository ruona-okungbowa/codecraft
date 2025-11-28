import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const expectedToken = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

    if (!expectedToken || token !== expectedToken) {
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

    const supabase = await createClient();

    const { data: interview, error } = await supabase
      .from("interviews")
      .select("questions, role, level, type")
      .eq("id", interviewId)
      .single();

    if (error) {
      console.error("Error fetching interview:", error);
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      questions: interview.questions,
      role: interview.role,
      level: interview.level,
      type: interview.type,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
