import OpenAI from "openai";
import { openaiQueue } from "./queue";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    retries?: number;
    useQueue?: boolean;
  }
): Promise<string> {
  const useQueue = options?.useQueue ?? true;

  if (useQueue) {
    return openaiQueue.add(() => executeCompletion(messages, options));
  }

  return executeCompletion(messages, options);
}

async function executeCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    retries?: number;
  }
): Promise<string> {
  const maxRetries = options?.retries ?? 2;
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: options?.model || "gpt-4o-mini",
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 500,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content generated");
      }

      return content;
    } catch (error: unknown) {
      const err = error as {
        status?: number;
        headers?: Record<string, string>;
        message?: string;
      };
      lastError = new Error(err.message || "Failed to generate content");

      if (err.status === 429) {
        const retryAfter = err.headers?.["retry-after"];
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 20000;

        if (attempt < maxRetries) {
          console.log(
            `Rate limit hit, waiting ${waitTime / 1000}s before retry ${attempt + 1}/${maxRetries}`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        throw new Error(
          "OpenAI rate limit exceeded. Please wait a moment and try again."
        );
      }

      if (err.status === 401) {
        throw new Error("Invalid OpenAI API key");
      }

      throw lastError;
    }
  }

  throw lastError;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
