import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy endpoint for MCP fetch tool
 * This allows client-side code to use MCP fetch capabilities
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, max_length = 5000, raw = false, start_index = 0 } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // In a real implementation, this would call the MCP fetch tool
    // For now, we'll use native fetch as a fallback
    const response = await fetch(url, {
      headers: {
        "User-Agent": "CodeCraft/1.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.statusText}` },
        { status: response.status }
      );
    }

    let content = await response.text();

    // Apply max_length and start_index
    if (start_index > 0) {
      content = content.slice(start_index);
    }

    if (content.length > max_length) {
      content = content.slice(0, max_length);
    }

    return NextResponse.json({
      content,
      url,
      length: content.length,
      truncated: content.length >= max_length,
    });
  } catch (error) {
    console.error("MCP fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
