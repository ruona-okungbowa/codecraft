import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { data: existing, error: fetchError } = await supabase
      .from("user_projects")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      );
    }
    const body = await request.json();
    const { progress, status } = body;

    const updates: Record<string, string | number> = {};
    if (progress !== undefined) {
      if (typeof progress !== "number" || progress < 0 || progress > 100) {
        return NextResponse.json(
          { error: "Invalid progress. Must be between 0 and 100" },
          { status: 400 }
        );
      }
      updates.progress = progress;
      if (progress === 100) {
        updates.status = "completed";
        updates.completed_at = new Date().toISOString();
      }
    }
    if (status !== undefined) {
      if (!["saved", "in_progress", "completed"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updates.status = status;

      if (status === "in_progress" && !existing.started_at) {
        updates.started_at = new Date().toISOString();
      }

      if (status === "completed" && !existing.completed_at) {
        updates.completed_at = new Date().toISOString();
        updates.progress = 100;
      }
    }
    const { data: updated, error: updateError } = await supabase
      .from("user_projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating user project:", updateError);
      return NextResponse.json(
        { error: "Failed to update project", details: updateError.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      userProject: updated,
    });
  } catch (error) {
    console.error("Error in PATCH /api/user-projects/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { error: deleteError } = await supabase
      .from("user_projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting user project:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete project", details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in DELETE /api/user-projects/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
