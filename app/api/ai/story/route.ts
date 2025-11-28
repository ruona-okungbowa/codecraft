import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCompletion } from "@/lib/openai/client";
import { PROMPTS, buildStoryPrompt } from "@/lib/openai/prompts";
import {
  getCachedContent,
  setCachedContent,
  generateCacheKey,
} from "@/lib/openai/cache";

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
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // Get the project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check cache first
    const cacheKey = generateCacheKey("story", projectId);
    const cachedStory = getCachedContent(cacheKey);

    if (cachedStory) {
      console.log("Returning cached story for project:", project.name);
      try {
        const parsedCached = JSON.parse(cachedStory);
        return NextResponse.json({
          story: parsedCached,
          cached: true,
        });
      } catch {
        // If cache is in old format, regenerate
        console.log("Cache in old format, regenerating...");
      }
    }

    // Generate story with OpenAI
    console.log("Generating story for project:", project.name);

    const story = await generateCompletion(
      [
        { role: "system", content: PROMPTS.story },
        { role: "user", content: buildStoryPrompt(project) },
      ],
      {
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 800,
      }
    );

    // Parse the story into structured format
    const structuredStory = parseStoryToStructure(story);

    if (!structuredStory) {
      console.error("Failed to parse story structure");
      return NextResponse.json(
        { error: "Failed to generate valid STAR story" },
        { status: 500 }
      );
    }

    // Cache the structured story as JSON string
    setCachedContent(cacheKey, JSON.stringify(structuredStory));

    // Store in database
    const { error: insertError } = await supabase
      .from("generated_content")
      .insert({
        project_id: projectId,
        content_type: "story",
        content: story,
        metadata: {
          wordCount: story.split(/\s+/).length,
          hasAllComponents: true,
        },
      });

    if (insertError) {
      console.error("Error storing story:", insertError);
      // Don't fail the request if storage fails
    }

    return NextResponse.json({
      story: structuredStory,
      cached: false,
      metadata: {
        wordCount: story.split(/\s+/).length,
      },
    });
  } catch (error: unknown) {
    console.error("Error generating story:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate story" },
      { status: 500 }
    );
  }
}

// Helper function to parse story text into structured format
function parseStoryToStructure(story: string): {
  situation: string;
  task: string;
  action: string;
  result: string;
  talkingPoints: string[];
} | null {
  try {
    // Try to parse as JSON first (if AI returns JSON)
    const jsonMatch = story.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.situation && parsed.task && parsed.action && parsed.result) {
        return {
          situation: parsed.situation,
          task: parsed.task,
          action: parsed.action,
          result: parsed.result,
          talkingPoints: parsed.talkingPoints || [],
        };
      }
    }

    // Parse markdown-style format
    const situationMatch = story.match(
      /\*\*Situation:?\*\*\s*([\s\S]*?)(?=\*\*Task|$)/i
    );
    const taskMatch = story.match(
      /\*\*Task:?\*\*\s*([\s\S]*?)(?=\*\*Action|$)/i
    );
    const actionMatch = story.match(
      /\*\*Action:?\*\*\s*([\s\S]*?)(?=\*\*Result|$)/i
    );
    const resultMatch = story.match(
      /\*\*Result:?\*\*\s*([\s\S]*?)(?=\*\*Talking Points|$)/i
    );
    const talkingPointsMatch = story.match(
      /\*\*Talking Points:?\*\*\s*([\s\S]*?)$/i
    );

    if (situationMatch && taskMatch && actionMatch && resultMatch) {
      const talkingPoints: string[] = [];
      if (talkingPointsMatch) {
        const points = talkingPointsMatch[1]
          .split(/\n/)
          .filter(
            (line) => line.trim().startsWith("-") || line.trim().startsWith("•")
          );
        talkingPoints.push(
          ...points.map((p) => p.replace(/^[-•]\s*/, "").trim())
        );
      }

      return {
        situation: situationMatch[1].trim(),
        task: taskMatch[1].trim(),
        action: actionMatch[1].trim(),
        result: resultMatch[1].trim(),
        talkingPoints,
      };
    }

    return null;
  } catch (error) {
    console.error("Error parsing story:", error);
    return null;
  }
}
