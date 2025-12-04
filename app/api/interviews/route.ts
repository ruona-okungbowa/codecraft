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

    const { data: interviews, error: fetchError } = await supabase
      .from("interviews")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching interviews:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch interviews", details: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      interviews: interviews || [],
    });
  } catch (error) {
    console.error("Error in GET /api/interviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const { role, type, level, questions, techstack } = body;

    if (!role || !type || !level || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: interview, error: insertError } = await supabase
      .from("interviews")
      .insert({
        user_id: user.id,
        role,
        type,
        level,
        questions,
        techstack: techstack || [],
        finalised: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating interview:", insertError);
      return NextResponse.json(
        { error: "Failed to create interview", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Error in POST /api/interviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
