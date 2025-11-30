import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all generated content for this project
    const { data: content, error } = await supabase
      .from("generated_content")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ content: content || [] });
  } catch (error: unknown) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch content" },
      { status: 500 }
    );
  }
}
