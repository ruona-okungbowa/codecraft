import { openai } from "./client";

interface Project {
  name: string;
  description?: string;
  languages?: Record<string, number>;
  stars?: number;
  forks?: number;
  url: string;
}

interface ResumeBullet {
  text: string;
  emphasis: "technical" | "impact" | "collaboration";
  characterCount: number;
  actionVerb: string;
}

/**
 * Generate professional resume bullet points for a project
 * Requirements: 3.1, 3.2, 3.3, 3.4
 *
 * Generates 3-5 variations with different emphasis:
 * - Technical depth (technologies, architecture)
 * - Impact (metrics, results, outcomes)
 * - Collaboration (teamwork, open source)
 */
export async function generateResumeBullets(
  project: Project,
  repoAnalysis?: {
    framework: string;
    dependencies: string[];
    features: string[];
    structure: string[];
  }
): Promise<ResumeBullet[]> {
  // Extract tech stack
  const techStack = project.languages
    ? Object.keys(project.languages).slice(0, 5).join(", ")
    : "various technologies";

  // Build enhanced context
  let context = `---------------------------------------
📌 PROJECT CONTEXT (REAL DATA)
---------------------------------------
Name: ${project.name}
Description: ${project.description || "No description provided"}
Technologies/Languages: ${techStack}
GitHub Stars: ${project.stars || 0}
GitHub Forks: ${project.forks || 0}`;

  if (repoAnalysis) {
    context += `
Framework: ${repoAnalysis.framework}
Features Implemented: ${repoAnalysis.features.slice(0, 8).join(", ")}
Dependencies Used: ${repoAnalysis.dependencies.slice(0, 10).join(", ")}
Architecture / Structure: ${repoAnalysis.structure.slice(0, 5).join(", ")}`;
  }

  const prompt = `You are an expert resume writer. Generate 5-8 resume bullet points based ONLY on the real project data below.

${context}

---------------------------------------
📌 REQUIREMENTS
---------------------------------------
Each bullet point must:

- Start with a strong action verb (Developed, Implemented, Built, Engineered, Architected, Optimized, Designed, Created)
- Highlight YOUR contributions, not generic features
- Include technical depth (frameworks, tools, architecture)
- Show measurable or meaningful impact when possible
- Avoid guessing — use ONLY verified project data from above
- Be concise, ATS-friendly, and achievement-based
- Each bullet MUST be 150 characters or less

Provide variety:
- 3-4 bullets emphasizing technical implementation (architecture, technologies, features)
- 2-3 bullets emphasizing impact (performance, scalability, user value)
- 1-2 bullets emphasizing collaboration or best practices (if applicable)

Format your response as a JSON array of objects with this structure:
[
  {
    "text": "Developed a full-stack web app using React and Node.js, serving 500+ active users with 99.9% uptime",
    "emphasis": "impact",
    "actionVerb": "Developed"
  },
  ...
]

CRITICAL: Every bullet MUST be 150 characters or less. If a bullet exceeds this, make it shorter.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume writer specializing in software engineering resumes. You create concise, impactful bullet points that highlight technical skills and quantifiable achievements.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8, // Higher creativity for varied bullets
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON response
    const bullets = parseResumeBullets(responseText);

    // Validate and enforce character limit
    const validatedBullets = bullets.map((bullet) => {
      const characterCount = bullet.text.length;

      // If bullet exceeds 150 characters, truncate intelligently
      if (characterCount > 150) {
        const truncated = truncateBullet(bullet.text, 150);
        return {
          ...bullet,
          text: truncated,
          characterCount: truncated.length,
        };
      }

      return {
        ...bullet,
        characterCount,
      };
    });

    return validatedBullets;
  } catch (error) {
    console.error("Error generating resume bullets:", error);
    throw new Error(
      `Failed to generate resume bullets: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Parse resume bullets from OpenAI response
 */
function parseResumeBullets(responseText: string): ResumeBullet[] {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : responseText;

    const parsed = JSON.parse(jsonText);

    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array");
    }

    return parsed.map(
      (item: { text?: string; emphasis?: string; actionVerb?: string }) => {
        const validEmphasis: "technical" | "impact" | "collaboration" =
          (item.emphasis as "technical" | "impact" | "collaboration") ||
          "technical";
        return {
          text: item.text || "",
          emphasis: validEmphasis,
          characterCount: (item.text || "").length,
          actionVerb: item.actionVerb || extractActionVerb(item.text || ""),
        };
      }
    );
  } catch (error) {
    console.error("Error parsing resume bullets:", error);
    throw new Error("Failed to parse resume bullets from AI response");
  }
}

/**
 * Extract action verb from bullet text
 */
function extractActionVerb(text: string): string {
  const words = text.trim().split(/\s+/);
  return words[0] || "";
}

/**
 * Intelligently truncate a bullet to fit character limit
 * Tries to preserve meaning by removing less important words
 */
function truncateBullet(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Strategy 1: Remove trailing phrases after commas
  const parts = text.split(",");
  if (parts.length > 1) {
    for (let i = parts.length - 1; i > 0; i--) {
      const truncated = parts.slice(0, i).join(",");
      if (truncated.length <= maxLength) {
        return truncated;
      }
    }
  }

  // Strategy 2: Simple truncation with ellipsis
  return text.substring(0, maxLength - 3) + "...";
}
