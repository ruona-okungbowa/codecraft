import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, status } = await request.json();

    if (!projectId || !status) {
      return NextResponse.json(
        { error: "Missing projectId or status" },
        { status: 400 }
      );
    }

    if (!["saved", "in_progress", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Check if user project already exists
    const { data: existing } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .single();

    const now = new Date().toISOString();
    const updateData: {
      status: string;
      updated_at: string;
      started_at?: string;
      completed_at?: string;
      progress?: number;
    } = {
      status,
      updated_at: now,
    };

    if (status === "in_progress" && !existing?.started_at) {
      updateData.started_at = now;
    }

    if (status === "completed") {
      updateData.completed_at = now;
      updateData.progress = 100;
    }

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from("user_projects")
        .update(updateData)
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      // Create new record
      const { error } = await supabase.from("user_projects").insert({
        user_id: user.id,
        project_id: projectId,
        ...updateData,
        progress: status === "completed" ? 100 : 0,
        created_at: now,
      });

      if (error) throw error;
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Error updating project status:", error);
    return NextResponse.json(
      { error: "Failed to update project status" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ projects: data || [] });
  } catch (error) {
    console.error("Error fetching project statuses:", error);
    return NextResponse.json(
      { error: "Failed to fetch project statuses" },
      { status: 500 }
    );
  }
}
