import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, status } = body;

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
    }

    if (!status || !["saved", "in_progress"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'saved' or 'in_progress'" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Project already saved or started" },
        { status: 409 }
      );
    }

    const { data: userProject, error: insertError } = await supabase
      .from("user_projects")
      .insert({
        user_id: user.id,
        project_id: projectId,
        status,
        progress: 0,
        started_at: status === "in_progress" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting user project:", insertError);
      return NextResponse.json(
        { error: "Failed to save project", details: insertError.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      userProject,
    });
  } catch (error) {
    console.error("Error in POST /api/user-projects:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
