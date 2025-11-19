import { NextResponse } from "next/server";
import { generateCompletion } from "@/lib/openai/client";

export async function GET() {
  try {
    const response = await generateCompletion([
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "user",
        content: "Say 'OpenAI integration is working!' in a creative way.",
      },
    ]);

    return NextResponse.json({
      success: true,
      message: response,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
