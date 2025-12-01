# Design Document: Dynamic Project Templates

## Overview

The Dynamic Project Templates feature extends CodeCraft's project recommendation system by fetching fresh project ideas from external sources (GitHub Trending, Dev.to, FreeCodeCamp, Roadmap.sh) using the MCP fetch tool. The system will parse external content into the existing `ProjectTemplate` schema, cache results in Supabase with 24-hour TTL, and provide fallback templates when external sources fail.

This design integrates seamlessly with the existing recommendation engine (`lib/recommendations/engine.ts`) and maintains compatibility with the current template structure defined in `types/recommendations.ts`.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  API Route      │
│  /api/templates │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Template Fetcher Service│
│ - Orchestrates fetching │
│ - Manages cache         │
└────────┬────────────────┘
         │
         ├──────────────────┬──────────────────┬──────────────────┐
         ▼                  ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│GitHub Fetcher│   │Dev.to Fetcher│   │FCC Fetcher   │   │Roadmap Fetcher│
│- MCP fetch   │   │- MCP fetch   │   │- MCP fetch   │   │- MCP fetch   │
│- Parse HTML  │   │- Parse HTML  │   │- Parse HTML  │   │- Parse HTML  │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │                  │
       └──────────────────┴──────────────────┴──────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Template Parser │
                         │ - Normalize data│
                         │ - Validate      │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Supabase Cache  │
                         │ - 24hr TTL      │
                         │ - Source tracking│
                         └─────────────────┘
```

### Data Flow

1. **Request**: User requests project recommendations
2. **Cache Check**: System checks Supabase for cached templates < 24hrs old
3. **Fetch**: If cache miss or stale, fetch from external sources in parallel
4. **Parse**: Transform raw HTML/JSON into `ProjectTemplate` schema
5. **Validate**: Ensure all required fields present, apply defaults
6. **Cache**: Store in Supabase with timestamp and source metadata
7. **Fallback**: If all sources fail, return static fallback templates
8. **Response**: Return templates to recommendation engine

## Components and Interfaces

### 1. Template Fetcher Service

**Location**: `lib/templates/fetcher.ts`

```typescript
interface FetchResult {
  templates: ProjectTemplate[];
  source: string;
  fetchedAt: Date;
  error?: string;
}

interface FetcherOptions {
  maxAge?: number; // Cache TTL in milliseconds
  timeout?: number; // Request timeout
  fallbackOnError?: boolean;
}

class TemplateFetcher {
  async fetchAll(options?: FetcherOptions): Promise<ProjectTemplate[]>;
  async fetchFromSource(source: SourceType): Promise<FetchResult>;
  async getCached(): Promise<ProjectTemplate[]>;
  async updateCache(
    templates: ProjectTemplate[],
    source: string
  ): Promise<void>;
  private async getFallbackTemplates(): Promise<ProjectTemplate[]>;
}
```

### 2. Source-Specific Fetchers

**Location**: `lib/templates/sources/`

Each source implements the `SourceFetcher` interface:

```typescript
interface SourceFetcher {
  name: string;
  url: string;
  fetch(): Promise<RawTemplate[]>;
  parse(raw: RawTemplate): ProjectTemplate | null;
}

// GitHub Trending Fetcher
class GitHubTrendingFetcher implements SourceFetcher {
  name = "github-trending";
  url = "https://github.com/trending";

  async fetch(): Promise<RawTemplate[]> {
    // Use MCP fetch tool to get trending repos
    // Extract: name, description, language, stars
  }

  parse(raw: RawTemplate): ProjectTemplate | null {
    // Map GitHub repo data to ProjectTemplate schema
  }
}

// Dev.to Fetcher
class DevToFetcher implements SourceFetcher {
  name = "devto";
  url = "https://dev.to/t/tutorial";

  async fetch(): Promise<RawTemplate[]> {
    // Fetch tutorial articles tagged with "project"
  }

  parse(raw: RawTemplate): ProjectTemplate | null {
    // Extract project ideas from articles
  }
}

// FreeCodeCamp Fetcher
class FreeCodeCampFetcher implements SourceFetcher {
  name = "freecodecamp";
  url = "https://www.freecodecamp.org/news/tag/projects/";

  async fetch(): Promise<RawTemplate[]> {
    // Fetch project tutorial articles
  }

  parse(raw: RawTemplate): ProjectTemplate | null {
    // Parse FCC article structure
  }
}

// Roadmap.sh Fetcher
class RoadmapFetcher implements SourceFetcher {
  name = "roadmap";
  url = "https://roadmap.sh/projects";

  async fetch(): Promise<RawTemplate[]> {
    // Fetch project ideas from roadmap.sh
  }

  parse(raw: RawTemplate): ProjectTemplate | null {
    // Parse roadmap project structure
  }
}
```

### 3. Template Parser

**Location**: `lib/templates/parser.ts`

```typescript
interface ParseOptions {
  strictMode?: boolean;
  applyDefaults?: boolean;
}

class TemplateParser {
  parse(
    raw: any,
    source: string,
    options?: ParseOptions
  ): ProjectTemplate | null;
  validate(template: Partial<ProjectTemplate>): boolean;
  applyDefaults(template: Partial<ProjectTemplate>): ProjectTemplate;
  extractSkills(text: string): string[];
  inferDifficulty(
    template: Partial<ProjectTemplate>
  ): "beginner" | "intermediate" | "advanced";
  inferCategory(techStack: string[]): string;
}
```

### 4. Cache Manager

**Location**: `lib/templates/cache.ts`

```typescript
interface CachedTemplate {
  id: string;
  template_data: ProjectTemplate;
  source: string;
  source_url: string;
  fetched_at: string;
  expires_at: string;
  created_at: string;
}

class TemplateCacheManager {
  async get(maxAge?: number): Promise<ProjectTemplate[]>;
  async set(templates: ProjectTemplate[], source: string): Promise<void>;
  async invalidate(source?: string): Promise<void>;
  async cleanup(): Promise<void>; // Remove expired entries
  private isExpired(template: CachedTemplate): boolean;
}
```

### 5. API Route

**Location**: `app/api/templates/fetch/route.ts`

```typescript
// GET /api/templates/fetch
// Query params: ?force=true (bypass cache), ?source=github (specific source)
export async function GET(request: Request): Promise<NextResponse>;

// POST /api/templates/refresh
// Manually trigger cache refresh
export async function POST(request: Request): Promise<NextResponse>;
```

## Data Models

### Supabase Table: `project_templates_cache`

```sql
CREATE TABLE project_templates_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL,
  template_data JSONB NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_templates_cache_expires ON project_templates_cache(expires_at);
CREATE INDEX idx_templates_cache_source ON project_templates_cache(source);
CREATE INDEX idx_templates_cache_template_id ON project_templates_cache(template_id);
```

### Extended ProjectTemplate Type

The existing `ProjectTemplate` interface remains unchanged, but we add metadata for tracking:

```typescript
interface ProjectTemplateWithMeta extends ProjectTemplate {
  _meta?: {
    source: string;
    sourceUrl?: string;
    fetchedAt: Date;
    isFallback: boolean;
  };
}
```

### RawTemplate Interface

Intermediate format before parsing:

```typescript
interface RawTemplate {
  title?: string;
  name?: string;
  description?: string;
  content?: string;
  tags?: string[];
  language?: string;
  languages?: string[];
  difficulty?: string;
  level?: string;
  url?: string;
  stars?: number;
  [key: string]: any; // Allow additional fields
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: All sources attempted on cache miss

_For any_ cache miss or stale cache scenario, the system should attempt to fetch from all configured external sources (GitHub, Dev.to, FreeCodeCamp, Roadmap.sh) before returning results.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

### Property 2: Parsed templates match schema

_For any_ successfully parsed template from any external source, the resulting object should conform to the `ProjectTemplate` interface with all required fields present and correctly typed.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

### Property 3: Cache freshness respected

_For any_ cached template, if its age is less than 24 hours, the system should return the cached version without fetching from external sources; if older than 24 hours, the system should fetch fresh content.

**Validates: Requirements 3.3, 3.4**

### Property 4: Cache stores source metadata

_For any_ template stored in cache, the database record should include the source name, source URL, and timestamp of when it was fetched.

**Validates: Requirements 3.2**

### Property 5: Fallback on all failures

_For any_ scenario where all external source fetches fail and no valid cached data exists, the system should return the pre-defined fallback templates without throwing an error.

**Validates: Requirements 4.3, 4.4**

### Property 6: Partial success handling

_For any_ fetch operation where some sources succeed and others fail, the system should return all successfully parsed templates and log failures without blocking the response.

**Validates: Requirements 5.1, 5.4, 5.5**

### Property 7: Malformed data graceful handling

_For any_ external content that fails parsing due to missing required fields or malformed structure, the system should skip that individual template, log the error, and continue processing other templates.

**Validates: Requirements 5.2, 5.3**

### Property 8: Rate limit backoff

_For any_ rate limit error (HTTP 429) received from an external source, the system should implement exponential backoff and respect the retry-after header before attempting the next request.

**Validates: Requirements 7.1, 7.2**

### Property 9: Timeout enforcement

_For any_ external source fetch request, if the request exceeds 10 seconds, the system should timeout gracefully and treat it as a fetch failure for that source.

**Validates: Requirements 1.5**

### Property 10: Template uniqueness in cache

_For any_ template being stored in cache, if a template with the same `template_id` and `source` already exists, the system should update the existing record rather than creating a duplicate.

**Validates: Requirements 3.1**

## Error Handling

### Error Categories

1. **Network Errors**: Timeout, connection refused, DNS failure
   - Action: Log error, try next source, use cache if available
2. **Rate Limiting**: HTTP 429 responses
   - Action: Exponential backoff, respect retry-after header
3. **Parsing Errors**: Malformed HTML, missing fields
   - Action: Skip individual template, log details, continue
4. **Cache Errors**: Database connection issues
   - Action: Proceed without cache, fetch from sources
5. **Validation Errors**: Template doesn't match schema
   - Action: Apply defaults if possible, otherwise skip

### Error Response Structure

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  details?: {
    source?: string;
    failedSources: string[];
    partialResults: boolean;
  };
  fallbackUsed: boolean;
}
```

### Retry Strategy

- **Max Retries**: 3 attempts per source
- **Backoff**: Exponential (1s, 2s, 4s)
- **Circuit Breaker**: After 5 consecutive failures, mark source as down for 5 minutes

## Testing Strategy

### Unit Tests

**Location**: `__tests__/lib/templates/`

1. **Parser Tests**
   - Test parsing valid GitHub trending data
   - Test parsing valid Dev.to article
   - Test parsing with missing fields
   - Test default value application
   - Test skill extraction from text
   - Test difficulty inference

2. **Cache Manager Tests**
   - Test cache hit with fresh data
   - Test cache miss triggers fetch
   - Test expired cache triggers refresh
   - Test cache invalidation
   - Test cleanup of expired entries

3. **Source Fetcher Tests**
   - Test each source fetcher independently
   - Mock MCP fetch tool responses
   - Test error handling for each source
   - Test timeout behavior

### Property-Based Tests

**Framework**: fast-check (JavaScript/TypeScript property-based testing library)

**Location**: `__tests__/lib/templates/properties/`

**Configuration**: Each property test should run minimum 100 iterations

1. **Property Test 1: All sources attempted**
   - **Feature: dynamic-project-templates, Property 1: All sources attempted on cache miss**
   - Generate: Random cache states (empty, stale, fresh)
   - Test: When cache is empty/stale, verify all source fetchers are called
   - Assert: All source names appear in fetch logs

2. **Property Test 2: Schema conformance**
   - **Feature: dynamic-project-templates, Property 2: Parsed templates match schema**
   - Generate: Random raw template data from various sources
   - Test: Parse each template
   - Assert: Result is null OR conforms to ProjectTemplate interface

3. **Property Test 3: Cache freshness**
   - **Feature: dynamic-project-templates, Property 3: Cache freshness respected**
   - Generate: Random timestamps (recent, old, future)
   - Test: Query cache with different maxAge values
   - Assert: Only templates within maxAge are returned

4. **Property Test 4: Source metadata**
   - **Feature: dynamic-project-templates, Property 4: Cache stores source metadata**
   - Generate: Random templates with various sources
   - Test: Store in cache and retrieve
   - Assert: Retrieved templates have source, sourceUrl, fetchedAt

5. **Property Test 5: Fallback guarantee**
   - **Feature: dynamic-project-templates, Property 5: Fallback on all failures**
   - Generate: Scenarios where all sources fail
   - Test: Fetch templates
   - Assert: Returns non-empty array of fallback templates

6. **Property Test 6: Partial success**
   - **Feature: dynamic-project-templates, Property 6: Partial success handling**
   - Generate: Mix of successful and failed source responses
   - Test: Fetch from all sources
   - Assert: Returns templates from successful sources only

7. **Property Test 7: Malformed data handling**
   - **Feature: dynamic-project-templates, Property 7: Malformed data graceful handling**
   - Generate: Invalid template data (missing fields, wrong types)
   - Test: Parse templates
   - Assert: No exceptions thrown, invalid templates skipped

8. **Property Test 8: Rate limit backoff**
   - **Feature: dynamic-project-templates, Property 8: Rate limit backoff**
   - Generate: Sequence of 429 responses with retry-after headers
   - Test: Fetch with rate limiting
   - Assert: Delays between retries match exponential backoff

9. **Property Test 9: Timeout enforcement**
   - **Feature: dynamic-project-templates, Property 9: Timeout enforcement**
   - Generate: Slow-responding sources (>10s)
   - Test: Fetch with timeout
   - Assert: Request aborts after 10 seconds

10. **Property Test 10: Template uniqueness**
    - **Feature: dynamic-project-templates, Property 10: Template uniqueness in cache**
    - Generate: Duplicate templates with same ID and source
    - Test: Store multiple times
    - Assert: Only one record exists in cache per ID+source combination

### Integration Tests

**Location**: `__tests__/integration/templates/`

1. **End-to-End Fetch Flow**
   - Test complete flow from API request to cached response
   - Verify database interactions
   - Test with real MCP fetch tool (if available in test environment)

2. **Recommendation Engine Integration**
   - Test that fetched templates work with existing recommendation engine
   - Verify filtering and scoring still work correctly

3. **Fallback Scenario**
   - Simulate all sources down
   - Verify fallback templates are returned
   - Verify user sees appropriate messaging

## Performance Considerations

### Caching Strategy

- **Cache Duration**: 24 hours (configurable)
- **Cache Warming**: Background job to refresh cache before expiration
- **Partial Cache**: Allow serving mix of cached and fresh data

### Parallel Fetching

- Fetch from all sources concurrently using `Promise.allSettled()`
- Don't wait for slow sources to complete
- Set aggressive timeouts (10s per source)

### Rate Limiting

- Implement request queuing for sources with strict rate limits
- Use exponential backoff on 429 responses
- Cache aggressively to minimize external requests

### Database Optimization

- Index on `expires_at` for efficient cache cleanup
- Index on `source` for source-specific queries
- Use JSONB for flexible template storage
- Periodic cleanup job to remove expired entries

## Security Considerations

1. **Input Validation**: Sanitize all external content before parsing
2. **URL Validation**: Verify source URLs match expected domains
3. **Content Size Limits**: Limit fetched content to prevent memory issues
4. **Rate Limiting**: Respect external API limits to avoid IP bans
5. **Error Information**: Don't expose internal errors to users

## Future Enhancements

1. **User-Submitted Templates**: Allow users to contribute templates
2. **Template Voting**: Let users vote on template quality
3. **AI-Enhanced Parsing**: Use OpenAI to extract better metadata
4. **Source Priority**: Weight sources based on historical quality
5. **Personalized Sources**: Let users configure preferred sources
6. **Template Versioning**: Track changes to templates over time
