import type { Project } from "@/types";

export const PROMPTS = {
  story: `You are a professional career coach helping developers create compelling interview stories.
Generate STAR format stories (Situation, Task, Action, Result) that:
- Are concise and impactful (200-300 words)
- Use action verbs and quantified achievements
- Focus on technical skills and problem-solving
- Sound natural and conversational
- Highlight the developer's contributions`,

  bullet: `You are a professional resume writer specializing in tech resumes.
Generate resume bullet points that:
- Start with strong action verbs (Developed, Implemented, Optimized, etc.)
- Include quantified results when possible
- Are concise (under 150 characters)
- Focus on impact and technical skills
- Follow professional resume standards`,

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

// Story generation prompt
export function buildStoryPrompt(project: Project): string {
  const context = buildProjectContext(project);

  return `${context}

Generate a STAR format interview story for this project. Structure it as:

**Situation:** Brief context about the project and why it was needed
**Task:** What you needed to accomplish
**Action:** Specific steps you took, technologies you used, challenges you solved
**Result:** Quantified outcomes and impact

Make it compelling and interview-ready.`;
}

// Resume bullet prompt
export function buildBulletPrompt(project: Project, count: number = 3): string {
  const context = buildProjectContext(project);

  return `${context}

Generate ${count} resume bullet points for this project. Each bullet should:
- Start with a strong action verb
- Highlight technical skills and technologies
- Include quantified results if possible
- Be under 150 characters
- Focus on different aspects of the project

Return only the bullet points, one per line, starting with "•".`;
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
