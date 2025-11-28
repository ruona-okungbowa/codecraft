import { openai } from "./client";

/**
 * Use OpenAI to analyze a codebase and identify frameworks/technologies
 * Fallback when dependency files are not available
 */
export async function analyzeCodebaseForSkills(
  repoName: string,
  languages: Record<string, number>,
  readmeContent?: string
): Promise<string[]> {
  const languageList = Object.keys(languages).join(", ");

  // Shorter, more focused prompt for faster response
  const prompt = `Repository: ${repoName}
Languages: ${languageList}
${readmeContent ? `Description: ${readmeContent.substring(0, 500)}` : ""}

List frameworks/technologies used (not languages). Return JSON array only.
Examples: ["React", "Express", "PostgreSQL", "Docker"]`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Extract frameworks/technologies from repo info. Return only JSON array of strings.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1, // Lower for faster, more deterministic responses
      max_tokens: 200, // Reduced for faster response
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    if (!responseText) {
      return [];
    }

    // Parse JSON response
    const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const skills = JSON.parse(jsonMatch[0]);
      return Array.isArray(skills)
        ? skills.filter((s) => typeof s === "string")
        : [];
    }

    return [];
  } catch (error) {
    console.error("Error analyzing codebase with OpenAI:", error);
    return [];
  }
}
