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

    const { data: matches, error: matchesError } = await supabase
      .from("job_matches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (matchesError) {
      console.error("Error fetching job matches:", matchesError);
      return NextResponse.json(
        { error: "Failed to fetch job matches" },
        { status: 500 }
      );
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Error in job matches route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
