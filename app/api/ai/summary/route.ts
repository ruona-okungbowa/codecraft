import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCompletion } from "@/lib/openai/client";

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if summary already exists (cache for 24 hours)
    const { data: existingContent } = await supabase
      .from("generated_content")
      .select("*")
      .eq("project_id", projectId)
      .eq("content_type", "summary")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existingContent) {
      const createdAt = new Date(existingContent.created_at);
      const now = new Date();
      const hoursSinceCreation =
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceCreation < 24) {
        return NextResponse.json({
          summary: existingContent.content,
          cached: true,
          generatedAt: existingContent.created_at,
        });
      }
    }

    console.log("Generating summary for project", projectId);

    const languages = Object.keys(project.languages || {}).join(", ");

    // Extract owner and repo from URL
    let repoInfo = "";
    const urlMatch = project.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (urlMatch) {
      const [, owner, repo] = urlMatch;

      // Fetch README and repo structure from GitHub
      try {
        const githubToken = user.user_metadata?.provider_token;
        const headers: Record<string, string> = {
          Accept: "application/vnd.github.v3+json",
        };
        if (githubToken) {
          headers.Authorization = `Bearer ${githubToken}`;
        }

        // Fetch README
        const readmeRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/readme`,
          { headers }
        );

        let readmeContent = "";
        if (readmeRes.ok) {
          const readmeData = await readmeRes.json();
          const content = Buffer.from(readmeData.content, "base64").toString(
            "utf-8"
          );
          // Take first 1000 characters of README
          readmeContent = content.substring(0, 1000);
        }

        // Fetch repo tree to understand structure
        const treeRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
          { headers }
        );

        let fileStructure = "";
        if (treeRes.ok) {
          const treeData = await treeRes.json();
          const files = treeData.tree
            .filter(
              (item: { type: string; path: string }) => item.type === "blob"
            )
            .map((item: { type: string; path: string }) => item.path)
            .slice(0, 30); // First 30 files
          fileStructure = files.join(", ");
        }

        repoInfo = `
README Content (first 1000 chars):
${readmeContent}

File Structure:
${fileStructure}`;
      } catch (error) {
        console.error("Error fetching GitHub data:", error);
      }
    }

    const prompt = `You are an expert technical writer. Generate a clean, well-structured summary section for this GitHub repository.

Project Name: ${project.name}
Description: ${project.description || "No description provided"}
Technologies: ${languages}
Stars: ${project.stars}
Forks: ${project.forks}
Repository URL: ${project.url}
${repoInfo}

Based on the above information, create a professional summary that captures what this project actually does.

The summary must include the following:

📌 Description: A brief overview (2-3 sentences) capturing the repository's purpose, what the project does, and who it is for. Be specific about the actual functionality based on the README and file structure.

📌 Key Features: A concise bullet-point list (4-6 items) highlighting the project's main functionality, unique offerings, and what makes it useful. Focus on actual features you can infer from the code structure and README.

Use clear and professional language suitable for a GitHub README. Do not include installation steps or usage instructions unless they directly support the summary.

IMPORTANT: Return ONLY valid JSON with this exact structure (no markdown, no code blocks, just pure JSON):
{
  "description": "The description text here",
  "keyFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"]
}`;

    const summary = await generateCompletion(
      [
        {
          role: "system",
          content:
            "You are an expert technical writer who creates clear, professional project summaries. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      {
        temperature: 0.7,
        maxTokens: 1000,
      }
    );

    // Clean up the response - remove markdown code blocks if present
    let cleanedSummary = summary.trim();
    if (cleanedSummary.startsWith("```json")) {
      cleanedSummary = cleanedSummary
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    } else if (cleanedSummary.startsWith("```")) {
      cleanedSummary = cleanedSummary.replace(/```\n?/g, "");
    }
    cleanedSummary = cleanedSummary.trim();

    // Validate it's valid JSON
    try {
      JSON.parse(cleanedSummary);
    } catch {
      console.error("Generated summary is not valid JSON:", cleanedSummary);
      throw new Error("Failed to generate valid summary JSON");
    }

    // Store in database
    const { error: insertError } = await supabase
      .from("generated_content")
      .insert({
        project_id: projectId,
        content_type: "summary",
        content: cleanedSummary,
        metadata: {
          characterCount: cleanedSummary.length,
        },
      });

    if (insertError) {
      console.error("Error storing summary:", insertError);
    }

    return NextResponse.json({
      summary: cleanedSummary,
      cached: false,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Error generating summary", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate summary" },
      { status: 500 }
    );
  }
}
