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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, status } = body;

    if (!projectId || !status) {
      return NextResponse.json(
        { error: "Project ID and status are required" },
        { status: 400 }
      );
    }

    // Check if project already exists
    const { data: existing } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .single();

    if (existing) {
      // Update existing
      const { data: updated, error: updateError } = await supabase
        .from("user_projects")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({
        userProject: {
          projectId: updated.project_id,
          status: updated.status,
          progress: updated.progress || 0,
        },
      });
    }

    // Create new
    const { data: created, error: createError } = await supabase
      .from("user_projects")
      .insert({
        user_id: user.id,
        project_id: projectId,
        status,
        progress: 0,
      })
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json({
      userProject: {
        projectId: created.project_id,
        status: created.status,
        progress: created.progress || 0,
      },
    });
  } catch (error) {
    console.error("Error managing user project:", error);
    return NextResponse.json(
      { error: "Failed to save project" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userProjects, error } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({
      userProjects: userProjects.map((p) => ({
        projectId: p.project_id,
        status: p.status,
        progress: p.progress || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching user projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
