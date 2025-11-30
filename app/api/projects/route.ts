import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

    // Fetch user's projects
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (projectsError) {
      return NextResponse.json(
        {
          error: "Failed to fetch projects",
          details: projectsError.message,
        },
        { status: 500 }
      );
    }

    // Fetch generated content for all projects
    const projectIds = projects?.map((p) => p.id) || [];
    const { data: generatedContent, error: contentError } = await supabase
      .from("generated_content")
      .select("project_id, content_type, created_at")
      .in("project_id", projectIds);

    if (contentError) {
      // Non-critical error, continue without content data
      console.error("Error fetching generated content:", contentError);
    }

    // Enrich projects with story status
    const enrichedProjects = projects?.map((project) => {
      const projectContent = generatedContent?.filter(
        (gc) => gc.project_id === project.id
      );
      const hasStory = projectContent?.some(
        (gc) => gc.content_type === "story"
      );
      const hasBullets = projectContent?.some(
        (gc) => gc.content_type === "bullet"
      );
      const hasReadme = projectContent?.some(
        (gc) => gc.content_type === "readme"
      );

      return {
        ...project,
        has_story: hasStory || false,
        has_bullets: hasBullets || false,
        has_readme: hasReadme || false,
        content_count: projectContent?.length || 0,
      };
    });

    return NextResponse.json({
      projects: enrichedProjects || [],
      count: enrichedProjects?.length || 0,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch projects", details: errorMessage },
      { status: 500 }
    );
  }
}
