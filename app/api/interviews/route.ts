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
