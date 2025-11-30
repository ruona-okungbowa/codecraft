import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Fetch all generated content for this project
    const { data: content, error: contentError } = await supabase
      .from("generated_content")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (contentError) {
      console.error("Error fetching generated content:", contentError);
      return NextResponse.json(
        { error: "Failed to fetch generated content" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: content || [],
    });
  } catch (error) {
    console.error("Error in content route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
