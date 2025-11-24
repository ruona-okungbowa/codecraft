import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's projects
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Fetch generated content for all projects
    const projectIds = projects?.map((p) => p.id) || [];
    const { data: generatedContent } = await supabase
      .from("generated_content")
      .select("project_id, content_type, created_at")
      .in("project_id", projectIds);

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

    return NextResponse.json({ projects: enrichedProjects });
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
