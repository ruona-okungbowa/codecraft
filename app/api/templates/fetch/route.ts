import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TemplateFetcher } from "@/lib/templates/fetcher";

export async function GET() {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch templates using the production-optimized fetcher
    const fetcher = new TemplateFetcher(supabase);
    const templates = await fetcher.fetchAll({
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      fallbackOnError: true,
      forceRefresh: false,
    });

    // 3. Get metrics for monitoring
    const metrics = fetcher.getMetrics();
    const latestMetric = Array.from(metrics.values()).pop();

    // 4. Return response
    return NextResponse.json({
      templates,
      count: templates.length,
      cached: latestMetric?.cacheHit || false,
      generatedAt: new Date().toISOString(),
      metrics: latestMetric
        ? {
            duration: latestMetric.totalDuration,
            sourcesSucceeded: latestMetric.sourcesSucceeded,
            sourcesAttempted: latestMetric.sourcesAttempted,
          }
        : undefined,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch templates",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
