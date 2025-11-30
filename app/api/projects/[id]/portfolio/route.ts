import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json(
        { error: "Authentication failed", details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { inPortfolio } = body;

    if (typeof inPortfolio !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request - inPortfolio must be a boolean" },
        { status: 400 }
      );
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from("projects")
      .update({ in_portfolio: inPortfolio })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: "Failed to update project",
          details: error.message,
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Project not found or you don't have access to it" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, project: data });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
