export class OpenAIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "OpenAIError";
  }
}

export function handleOpenAIError(error: any): never {
  if (error.status === 429) {
    throw new OpenAIError(
      "OpenAI rate limit exceeded. Please try again in a few minutes.",
      429,
      true
    );
  }

  if (error.status === 401) {
    throw new OpenAIError(
      "Invalid OpenAI API key. Please check your configuration.",
      401,
      false
    );
  }

  if (error.status === 500) {
    throw new OpenAIError(
      "OpenAI service error. Please try again later.",
      500,
      true
    );
  }

  throw new OpenAIError(
    error.message || "Failed to generate content",
    error.status,
    false
  );
}
