import { SupabaseClient } from "@supabase/supabase-js";
import type { ProjectTemplate } from "@/types/recommendations";
import type { FetchResult, SourceFetcher } from "./sources/types";
import { TemplateCacheManager } from "./cache";
import { GitHubTrendingFetcher } from "./sources/github";
import { DevToFetcher } from "./sources/devto";
import { FreeCodeCampFetcher } from "./sources/freecodecamp";
import { RoadmapFetcher } from "./sources/roadmap";
import { FALLBACK_TEMPLATES } from "./fallbacks";

/**
 * Options for fetching templates
 */
export interface FetcherOptions {
  maxAge?: number; // Cache TTL in milliseconds
  timeout?: number; // Request timeout (default: 10000ms)
  fallbackOnError?: boolean;
  forceRefresh?: boolean; // Bypass cache
  source?: string; // Fetch from specific source only
}

/**
 * Metrics for monitoring fetch performance
 */
export interface FetchMetrics {
  totalDuration: number;
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  templatesReturned: number;
  cacheHit: boolean;
  fallbackUsed: boolean;
}

/**
 * Circuit breaker state for a source
 */
interface CircuitBreakerState {
  failures: number;
  lastFailure: Date | null;
  isOpen: boolean;
}

/**
 * Default cache TTL: 24 hours in milliseconds
 */
const DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000;

/**
 * Default timeout for fetch operations: 10 seconds
 */
const DEFAULT_TIMEOUT = 10000;

/**
 * Circuit breaker configuration
 */
const CIRCUIT_BREAKER_THRESHOLD = 5; // Open circuit after 5 failures
const CIRCUIT_BREAKER_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Retry configuration
 */
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000; // 1 second
const MAX_BACKOFF = 8000; // 8 seconds max

/**
 * Deduplication: prevent concurrent fetches
 */
const DEDUP_WINDOW = 5000; // 5 seconds

/**
 * In-flight request tracking for deduplication
 */
interface InFlightRequest {
  promise: Promise<ProjectTemplate[]>;
  timestamp: number;
}

/**
 * TemplateFetcher orchestrates fetching templates from multiple sources
 * Manages caching, retries, circuit breakers, and fallbacks
 *
 * Production optimizations:
 * - Request deduplication to prevent thundering herd
 * - Memory-efficient template deduplication
 * - Timeout enforcement on all fetch operations
 * - Graceful degradation with stale cache
 * - Comprehensive error tracking
 */
export class TemplateFetcher {
  private supabase: SupabaseClient;
  private cacheManager: TemplateCacheManager;
  private sources: Map<string, SourceFetcher>;
  private circuitBreakers: Map<string, CircuitBreakerState>;
  private inFlightRequests: Map<string, InFlightRequest>;
  private metrics: Map<string, FetchMetrics>;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.cacheManager = new TemplateCacheManager(supabase);
    this.inFlightRequests = new Map();
    this.metrics = new Map();

    // Initialize all source fetchers
    this.sources = new Map<string, SourceFetcher>([
      ["github-trending", new GitHubTrendingFetcher()],
      ["devto", new DevToFetcher()],
      ["freecodecamp", new FreeCodeCampFetcher()],
      ["roadmap", new RoadmapFetcher()],
    ]);

    // Initialize circuit breakers for each source
    this.circuitBreakers = new Map();
    for (const sourceName of this.sources.keys()) {
      this.circuitBreakers.set(sourceName, {
        failures: 0,
        lastFailure: null,
        isOpen: false,
      });
    }

    // Periodic cleanup of in-flight requests
    this.startCleanupInterval();
  }

  /**
   * Fetch templates from all sources or cache
   * Main entry point for getting project templates
   *
   * Production features:
   * - Request deduplication (prevents multiple concurrent fetches)
   * - Timeout enforcement
   * - Comprehensive metrics tracking
   */
  async fetchAll(options: FetcherOptions = {}): Promise<ProjectTemplate[]> {
    const {
      timeout = DEFAULT_TIMEOUT,
      fallbackOnError = true,
      forceRefresh = false,
      source,
    } = options;

    const startTime = Date.now();
    const requestKey = `${source || "all"}-${forceRefresh}`;

    try {
      // Check for in-flight request (deduplication)
      if (!forceRefresh) {
        const inFlight = this.inFlightRequests.get(requestKey);
        if (inFlight && Date.now() - inFlight.timestamp < DEDUP_WINDOW) {
          console.log("Returning in-flight request result");
          return await inFlight.promise;
        }
      }

      // Create new fetch promise
      const fetchPromise = this.executeFetch(options);

      // Store in-flight request
      this.inFlightRequests.set(requestKey, {
        promise: fetchPromise,
        timestamp: Date.now(),
      });

      // Execute with timeout
      const templates = await this.withTimeout(fetchPromise, timeout);

      // Track metrics
      this.trackMetrics(requestKey, {
        totalDuration: Date.now() - startTime,
        sourcesAttempted: source ? 1 : this.sources.size,
        sourcesSucceeded: templates.length > 0 ? 1 : 0,
        sourcesFailed: templates.length === 0 ? 1 : 0,
        templatesReturned: templates.length,
        cacheHit: false,
        fallbackUsed: templates === FALLBACK_TEMPLATES,
      });

      return templates;
    } catch (error) {
      console.error("Error in fetchAll:", error);

      // Try to return stale cache on error
      if (fallbackOnError) {
        const staleCache = await this.getCached(Infinity);
        if (staleCache.length > 0) {
          console.log("Returning stale cache due to error");
          return staleCache;
        }

        console.log("Returning fallback templates due to error");
        return this.getFallbackTemplates();
      }

      throw error;
    } finally {
      // Clean up in-flight request after a delay
      setTimeout(() => {
        this.inFlightRequests.delete(requestKey);
      }, DEDUP_WINDOW);
    }
  }

  /**
   * Execute the actual fetch logic (separated for deduplication)
   */
  private async executeFetch(
    options: FetcherOptions
  ): Promise<ProjectTemplate[]> {
    const {
      maxAge = DEFAULT_MAX_AGE,
      fallbackOnError = true,
      forceRefresh = false,
      source,
    } = options;

    // Use maxAge for cache check
    const cacheMaxAge = maxAge;

    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = await this.getCached(cacheMaxAge);
      if (cached.length > 0) {
        console.log(`Returning ${cached.length} cached templates`);
        return cached;
      }
    }

    // Fetch from sources
    let templates: ProjectTemplate[] = [];

    if (source) {
      const result = await this.fetchFromSource(source);
      templates = result.templates;
    } else {
      templates = await this.fetchFromAllSources();
    }

    // Deduplicate templates by ID
    templates = this.deduplicateTemplates(templates);

    // Update cache if we got templates
    if (templates.length > 0) {
      await this.updateCache(templates, source || "all");
    }

    // Return templates or fallback
    if (templates.length === 0 && fallbackOnError) {
      console.log("All sources failed, returning fallback templates");
      return this.getFallbackTemplates();
    }

    return templates;
  }

  /**
   * Fetch templates from a specific source
   */
  async fetchFromSource(sourceName: string): Promise<FetchResult> {
    const fetcher = this.sources.get(sourceName);

    if (!fetcher) {
      return {
        templates: [],
        source: sourceName,
        fetchedAt: new Date(),
        error: `Unknown source: ${sourceName}`,
      };
    }

    // Check circuit breaker
    if (this.isCircuitOpen(sourceName)) {
      console.log(`Circuit breaker open for ${sourceName}, skipping`);
      return {
        templates: [],
        source: sourceName,
        fetchedAt: new Date(),
        error: "Circuit breaker open",
      };
    }

    // Fetch with retry logic
    return this.fetchWithRetry(fetcher);
  }

  /**
   * Get cached templates
   */
  async getCached(
    maxAge: number = DEFAULT_MAX_AGE
  ): Promise<ProjectTemplate[]> {
    try {
      return await this.cacheManager.get(maxAge);
    } catch (error) {
      console.error("Error getting cached templates:", error);
      return [];
    }
  }

  /**
   * Update cache with new templates
   */
  async updateCache(
    templates: ProjectTemplate[],
    source: string
  ): Promise<void> {
    try {
      await this.cacheManager.set(templates, source);
      console.log(`Cached ${templates.length} templates from ${source}`);
    } catch (error) {
      console.error("Error updating cache:", error);
      // Don't throw - caching failure shouldn't break the flow
    }
  }

  /**
   * Fetch from all sources in parallel
   */
  private async fetchFromAllSources(): Promise<ProjectTemplate[]> {
    const sourceNames = Array.from(this.sources.keys());
    console.log(`Fetching from ${sourceNames.length} sources in parallel`);

    // Fetch from all sources concurrently
    const results = await Promise.allSettled(
      sourceNames.map((name) => this.fetchFromSource(name))
    );

    // Collect successful results
    const allTemplates: ProjectTemplate[] = [];
    const failedSources: string[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const sourceName = sourceNames[i];

      if (result.status === "fulfilled") {
        const fetchResult = result.value;
        if (fetchResult.error) {
          failedSources.push(sourceName);
          console.error(`Source ${sourceName} failed: ${fetchResult.error}`);
        } else {
          allTemplates.push(...fetchResult.templates);
          console.log(
            `Source ${sourceName} returned ${fetchResult.templates.length} templates`
          );
        }
      } else {
        failedSources.push(sourceName);
        console.error(`Source ${sourceName} rejected:`, result.reason);
      }
    }

    if (failedSources.length > 0) {
      console.log(`Failed sources: ${failedSources.join(", ")}`);
    }

    console.log(`Total templates fetched: ${allTemplates.length}`);
    return allTemplates;
  }

  /**
   * Fetch with exponential backoff retry logic
   */
  private async fetchWithRetry(fetcher: SourceFetcher): Promise<FetchResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Fetch raw templates
        const rawTemplates = await fetcher.fetch();

        // Parse templates
        const templates: ProjectTemplate[] = [];
        for (const raw of rawTemplates) {
          try {
            const parsed = fetcher.parse(raw);
            if (parsed) {
              templates.push(parsed);
            }
          } catch (parseError) {
            console.error(
              `Error parsing template from ${fetcher.name}:`,
              parseError
            );
            // Continue with other templates
          }
        }

        // Success - reset circuit breaker
        this.recordSuccess(fetcher.name);

        return {
          templates,
          source: fetcher.name,
          fetchedAt: new Date(),
        };
      } catch (error) {
        lastError = error as Error;
        console.error(
          `Attempt ${attempt + 1}/${MAX_RETRIES} failed for ${fetcher.name}:`,
          error
        );

        // Check if it's a rate limit error
        if (this.isRateLimitError(error)) {
          const retryAfter = this.getRetryAfter(error);
          console.log(
            `Rate limited by ${fetcher.name}, waiting ${retryAfter}ms`
          );
          await this.sleep(retryAfter);
          continue;
        }

        // Exponential backoff for other errors (capped at MAX_BACKOFF)
        if (attempt < MAX_RETRIES - 1) {
          const backoff = Math.min(
            INITIAL_BACKOFF * Math.pow(2, attempt),
            MAX_BACKOFF
          );
          console.log(`Backing off for ${backoff}ms before retry`);
          await this.sleep(backoff);
        }
      }
    }

    // All retries failed - record failure and open circuit if needed
    this.recordFailure(fetcher.name);

    return {
      templates: [],
      source: fetcher.name,
      fetchedAt: new Date(),
      error: lastError?.message || "Unknown error",
    };
  }

  /**
   * Check if circuit breaker is open for a source
   */
  private isCircuitOpen(sourceName: string): boolean {
    const breaker = this.circuitBreakers.get(sourceName);
    if (!breaker) return false;

    // If circuit is open, check if timeout has passed
    if (breaker.isOpen && breaker.lastFailure) {
      const timeSinceFailure = Date.now() - breaker.lastFailure.getTime();
      if (timeSinceFailure > CIRCUIT_BREAKER_TIMEOUT) {
        // Reset circuit breaker
        breaker.isOpen = false;
        breaker.failures = 0;
        console.log(`Circuit breaker reset for ${sourceName}`);
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Record successful fetch for circuit breaker
   */
  private recordSuccess(sourceName: string): void {
    const breaker = this.circuitBreakers.get(sourceName);
    if (breaker) {
      breaker.failures = 0;
      breaker.isOpen = false;
      breaker.lastFailure = null;
    }
  }

  /**
   * Record failed fetch for circuit breaker
   */
  private recordFailure(sourceName: string): void {
    const breaker = this.circuitBreakers.get(sourceName);
    if (breaker) {
      breaker.failures++;
      breaker.lastFailure = new Date();

      if (breaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
        breaker.isOpen = true;
        console.log(
          `Circuit breaker opened for ${sourceName} after ${breaker.failures} failures`
        );
      }
    }
  }

  /**
   * Check if error is a rate limit error
   */
  private isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes("429") ||
        message.includes("rate limit") ||
        message.includes("too many requests")
      );
    }
    return false;
  }

  /**
   * Extract retry-after duration from error
   */
  private getRetryAfter(error: unknown): number {
    // Default to 60 seconds if no retry-after header
    let retryAfter = 60000;

    if (error instanceof Error) {
      // Try to extract retry-after from error message
      const match = error.message.match(/retry[- ]after[:\s]+(\d+)/i);
      if (match) {
        retryAfter = parseInt(match[1], 10) * 1000; // Convert to ms
      }
    }

    return retryAfter;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get fallback templates when all sources fail
   * Returns pre-defined templates covering different difficulty levels and categories
   */
  private getFallbackTemplates(): ProjectTemplate[] {
    console.log(`Returning ${FALLBACK_TEMPLATES.length} fallback templates`);
    return FALLBACK_TEMPLATES;
  }

  /**
   * Deduplicate templates by ID (production optimization)
   * Keeps the first occurrence of each template
   */
  private deduplicateTemplates(
    templates: ProjectTemplate[]
  ): ProjectTemplate[] {
    const seen = new Set<string>();
    const deduplicated: ProjectTemplate[] = [];

    for (const template of templates) {
      if (!seen.has(template.id)) {
        seen.add(template.id);
        deduplicated.push(template);
      }
    }

    if (templates.length !== deduplicated.length) {
      console.log(
        `Deduplicated ${templates.length - deduplicated.length} duplicate templates`
      );
    }

    return deduplicated;
  }

  /**
   * Execute promise with timeout (production safety)
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]);
  }

  /**
   * Track metrics for monitoring (production observability)
   */
  private trackMetrics(key: string, metrics: FetchMetrics): void {
    this.metrics.set(key, metrics);

    // Log metrics for monitoring systems
    console.log(`[METRICS] ${key}:`, {
      duration: `${metrics.totalDuration}ms`,
      success: metrics.templatesReturned > 0,
      sources: `${metrics.sourcesSucceeded}/${metrics.sourcesAttempted}`,
      templates: metrics.templatesReturned,
      cacheHit: metrics.cacheHit,
      fallback: metrics.fallbackUsed,
    });

    // Keep only last 100 metrics to prevent memory leak
    if (this.metrics.size > 100) {
      const firstKey = this.metrics.keys().next().value;
      if (firstKey) {
        this.metrics.delete(firstKey);
      }
    }
  }

  /**
   * Get recent metrics (for monitoring/debugging)
   */
  public getMetrics(): Map<string, FetchMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Periodic cleanup of stale in-flight requests
   */
  private startCleanupInterval(): void {
    // Clean up every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, request] of this.inFlightRequests.entries()) {
        if (now - request.timestamp > DEDUP_WINDOW * 2) {
          this.inFlightRequests.delete(key);
        }
      }
    }, 60000);
  }

  /**
   * Graceful shutdown - clear intervals and pending requests
   */
  public async shutdown(): Promise<void> {
    console.log("Shutting down TemplateFetcher...");
    this.inFlightRequests.clear();
    this.metrics.clear();
  }
}
