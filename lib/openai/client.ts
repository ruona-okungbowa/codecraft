import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: options?.model || "gpt-4o-mini",
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No conrent generated");
    }

    return content;
  } catch (error: any) {
    if (error.status === 429) {
      throw new Error("OpenAI rate limit exceeded. Please try again later.");
    }

    if (error.status === 401) {
      throw new Error("Invalid OpenAI API key");
    }

    throw new Error(error.message || "Failed to generate content");
  }
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
