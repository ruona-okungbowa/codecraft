import type { Project } from "@/types";

export const PROMPTS = {
  story: `You are an expert resume and interview writer. Generate 2–4 STAR stories based on the project data provided.

Use ONLY the actual project details provided. Do NOT invent technologies or accomplishments.

Each STAR story must include:

⭐ **Situation** — The problem, context, or challenge
⭐ **Task** — What YOU were responsible for
⭐ **Action** — Steps YOU took (technical breakdown)
⭐ **Result** — Impact with measurable outcome when possible

Tone: professional, clear, results-oriented.
Length: 4–6 sentences per story.

Format each story as:
**Situation:** [text]
**Task:** [text]
**Action:** [text]
**Result:** [text]

Generate multiple stories focusing on different aspects (architecture, features, performance, etc.).`,

  bullet: `You are an expert resume writer. Generate 5–8 resume bullet points based ONLY on the real project data provided.

Each bullet point must:
- Start with a strong action verb (Developed, Implemented, Built, Engineered, Architected, Optimized, etc.)
- Highlight YOUR contributions, not generic features
- Include technical depth (frameworks, tools, architecture)
- Show measurable or meaningful impact
- Avoid guessing — use ONLY verified project data
- Be concise, ATS-friendly, and achievement-based
- Be under 150 characters each

Return only the bullet points, one per line, starting with "•".`,

  readme: `You are a technical writer creating professional README files.
Generate README content that:
- Is clear and well-structured
- Includes all essential sections
- Uses proper Markdown formatting
- Is professional but approachable
- Helps users understand and use the project`,

  interview: `You are a senior software engineer conducting technical interviews.
Generate interview questions that:
- Are relevant to the project's technologies
- Test both technical knowledge and problem-solving
- Are appropriate for the experience level
- Encourage detailed explanations
- Cover different aspects (design, implementation, trade-offs)`,

  feedback: `You are a senior software engineer providing interview feedback.
Evaluate answers based on:
- Technical accuracy
- Depth of understanding
- Communication clarity
- Problem-solving approach
- Completeness of response
Provide constructive, specific feedback.`,
};

export function buildProjectContext(project: Project): string {
  const languages = Object.keys(project.languages || {}).join(", ");
  const complexity = project.complexityScore || "unknown";

  return `
Project: ${project.name}
Description: ${project.description || "No description provided"}
Technologies: ${languages}
Complexity Score: ${complexity}/100
Stars: ${project.stars}
Forks: ${project.forks}
URL: ${project.url}
`.trim();
}

// Story generation prompt with enhanced context
export function buildStoryPrompt(
  project: Project,
  repoAnalysis?: {
    framework: string;
    dependencies: string[];
    features: string[];
    structure: string[];
  }
): string {
  const languages = Object.keys(project.languages || {}).join(", ");

  let prompt = `--------------------------------------- 
📌 PROJECT CONTEXT (REAL DATA)
---------------------------------------
Name: ${project.name}
Description: ${project.description || "No description provided"}
Technologies/Languages: ${languages}
Stars: ${project.stars}
Forks: ${project.forks}`;

  if (repoAnalysis) {
    prompt += `
Framework: ${repoAnalysis.framework}
Dependencies: ${repoAnalysis.dependencies.slice(0, 10).join(", ")}
Features: ${repoAnalysis.features.slice(0, 5).join(", ")}
Structure: ${repoAnalysis.structure.slice(0, 5).join(", ")}`;
  }

  prompt += `

Generate 2-4 STAR stories for this project now.`;

  return prompt;
}

// Resume bullet prompt with enhanced context
export function buildBulletPrompt(
  project: Project,
  count: number = 5,
  repoAnalysis?: {
    framework: string;
    dependencies: string[];
    features: string[];
    structure: string[];
  }
): string {
  const languages = Object.keys(project.languages || {}).join(", ");

  let prompt = `--------------------------------------- 
📌 PROJECT CONTEXT (REAL DATA)
---------------------------------------
Name: ${project.name}
Description: ${project.description || "No description provided"}
Technologies/Languages: ${languages}`;

  if (repoAnalysis) {
    prompt += `
Framework: ${repoAnalysis.framework}
Features Implemented: ${repoAnalysis.features.slice(0, 8).join(", ")}
Dependencies Used: ${repoAnalysis.dependencies.slice(0, 10).join(", ")}
Architecture / Structure: ${repoAnalysis.structure.slice(0, 5).join(", ")}`;
  }

  prompt += `

Generate ${count} resume bullet points for this project now.`;

  return prompt;
}

// README generation prompt
export function buildReadmePrompt(project: Project): string {
  const context = buildProjectContext(project);

  return `${context}

Generate a professional README.md file for this project. Include these sections:

# Project Name
Brief description

## Features
Key features and capabilities

## Tech Stack
Technologies used

## Getting Started
Installation and setup instructions

## Usage
How to use the project

## Contributing
How others can contribute (if applicable)

Use proper Markdown formatting with code blocks, lists, and badges where appropriate.`;
}

// Interview question prompt
export function buildInterviewQuestionPrompt(
  project: Project,
  questionCount: number = 5
): string {
  const context = buildProjectContext(project);

  return `${context}

Generate ${questionCount} technical interview questions about this project. Questions should:
- Cover different aspects (architecture, implementation, trade-offs)
- Be specific to the technologies used
- Test both knowledge and problem-solving
- Be appropriate for a mid-level developer interview

Return questions numbered 1-${questionCount}.`;
}

// Interview feedback prompt
export function buildFeedbackPrompt(question: string, answer: string): string {
  return `Question: ${question}

Candidate's Answer: ${answer}

Evaluate this interview answer and provide:
1. Score (0-100)
2. Strengths (2-3 points)
3. Areas for improvement (2-3 points)
4. Suggested improvements

Be constructive and specific.`;
}
