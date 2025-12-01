# Implementation Plan

- [ ] 1. Set up database schema and cache infrastructure
  - Create Supabase migration for `project_templates_cache` table
  - Add indexes for `expires_at`, `source`, and `template_id`
  - Set up table with JSONB column for flexible template storage
  - _Requirements: 3.1, 3.2_

- [ ] 2. Implement core template parser
- [ ] 2.1 Create template parser with validation
  - Write `TemplateParser` class in `lib/templates/parser.ts`
  - Implement `parse()` method to transform raw data to ProjectTemplate
  - Implement `validate()` method to check required fields
  - Implement `applyDefaults()` for missing optional fields
  - Add helper methods: `extractSkills()`, `inferDifficulty()`, `inferCategory()`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ]\* 2.2 Write property test for schema conformance
  - **Property 2: Parsed templates match schema**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

- [ ]\* 2.3 Write property test for malformed data handling
  - **Property 7: Malformed data graceful handling**
  - **Validates: Requirements 5.2, 5.3**

- [ ]\* 2.4 Write unit tests for parser
  - Test parsing with all required fields present
  - Test parsing with missing optional fields
  - Test default value application
  - Test skill extraction from description text
  - Test difficulty inference logic
  - Test category inference from tech stack
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 3. Implement cache manager
- [ ] 3.1 Create cache manager class
  - Write `TemplateCacheManager` class in `lib/templates/cache.ts`
  - Implement `get()` method to retrieve cached templates
  - Implement `set()` method to store templates with metadata
  - Implement `invalidate()` method to clear cache by source
  - Implement `cleanup()` method to remove expired entries
  - Add `isExpired()` helper method
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]\* 3.2 Write property test for cache freshness
  - **Property 3: Cache freshness respected**
  - **Validates: Requirements 3.3, 3.4**

- [ ]\* 3.3 Write property test for source metadata
  - **Property 4: Cache stores source metadata**
  - **Validates: Requirements 3.2**

- [ ]\* 3.4 Write property test for template uniqueness
  - **Property 10: Template uniqueness in cache**
  - **Validates: Requirements 3.1**

- [ ]\* 3.5 Write unit tests for cache manager
  - Test cache hit with fresh data
  - Test cache miss returns empty array
  - Test expired cache is not returned
  - Test cache invalidation by source
  - Test cleanup removes only expired entries
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 4. Implement source-specific fetchers
- [ ] 4.1 Create base SourceFetcher interface
  - Define `SourceFetcher` interface in `lib/templates/sources/types.ts`
  - Define `RawTemplate` interface for intermediate data
  - Define `FetchResult` interface for fetch responses
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 4.2 Implement GitHub Trending fetcher
  - Create `GitHubTrendingFetcher` class in `lib/templates/sources/github.ts`
  - Use MCP fetch tool to retrieve trending repos page
  - Parse HTML to extract repo name, description, language, stars
  - Map to `RawTemplate` format
  - Handle timeout and network errors
  - _Requirements: 1.1, 1.5_

- [ ] 4.3 Implement Dev.to fetcher
  - Create `DevToFetcher` class in `lib/templates/sources/devto.ts`
  - Fetch tutorial articles tagged with "project"
  - Parse article structure to extract project ideas
  - Map to `RawTemplate` format
  - Handle timeout and network errors
  - _Requirements: 1.2, 1.5_

- [ ] 4.4 Implement FreeCodeCamp fetcher
  - Create `FreeCodeCampFetcher` class in `lib/templates/sources/freecodecamp.ts`
  - Fetch project tutorial articles
  - Parse FCC article structure
  - Map to `RawTemplate` format
  - Handle timeout and network errors
  - _Requirements: 1.3, 1.5_

- [ ] 4.5 Implement Roadmap.sh fetcher
  - Create `RoadmapFetcher` class in `lib/templates/sources/roadmap.ts`
  - Fetch project ideas from roadmap.sh/projects
  - Parse roadmap project structure
  - Map to `RawTemplate` format
  - Handle timeout and network errors
  - _Requirements: 1.4, 1.5_

- [ ]\* 4.6 Write property test for timeout enforcement
  - **Property 9: Timeout enforcement**
  - **Validates: Requirements 1.5**

- [ ]\* 4.7 Write unit tests for source fetchers
  - Test each fetcher with mocked MCP responses
  - Test timeout behavior for slow responses
  - Test error handling for network failures
  - Test parsing of valid source data
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 5. Implement main template fetcher service
- [ ] 5.1 Create TemplateFetcher orchestrator
  - Write `TemplateFetcher` class in `lib/templates/fetcher.ts`
  - Implement `fetchAll()` to coordinate all sources
  - Implement `fetchFromSource()` for individual sources
  - Implement `getCached()` to check cache first
  - Implement `updateCache()` to store results
  - Add retry logic with exponential backoff
  - Add circuit breaker for failing sources
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.3, 3.4, 7.1, 7.2_

- [ ] 5.2 Implement fallback template system
  - Create `getFallbackTemplates()` method
  - Define at least 10 diverse fallback templates
  - Store fallbacks in `lib/templates/fallbacks.ts`
  - Ensure fallbacks cover different difficulty levels
  - _Requirements: 4.3, 4.4_

- [ ] 5.3 Add parallel fetching with Promise.allSettled
  - Fetch from all sources concurrently
  - Don't block on slow sources
  - Collect successful results
  - Log failed sources
  - _Requirements: 5.1, 5.4, 5.5_

- [ ]\* 5.4 Write property test for all sources attempted
  - **Property 1: All sources attempted on cache miss**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [ ]\* 5.5 Write property test for fallback guarantee
  - **Property 5: Fallback on all failures**
  - **Validates: Requirements 4.3, 4.4**

- [ ]\* 5.6 Write property test for partial success
  - **Property 6: Partial success handling**
  - **Validates: Requirements 5.1, 5.4, 5.5**

- [ ]\* 5.7 Write property test for rate limit backoff
  - **Property 8: Rate limit backoff**
  - **Validates: Requirements 7.1, 7.2**

- [ ]\* 5.8 Write unit tests for template fetcher
  - Test fetchAll with all sources succeeding
  - Test fetchAll with some sources failing
  - Test fetchAll with all sources failing (fallback)
  - Test cache hit scenario
  - Test cache miss triggers fetch
  - Test retry logic with exponential backoff
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2, 4.3, 5.1, 7.1, 7.2_

- [ ] 6. Create API routes
- [ ] 6.1 Implement GET /api/templates/fetch route
  - Create route handler in `app/api/templates/fetch/route.ts`
  - Add authentication check using Supabase
  - Support `?force=true` query param to bypass cache
  - Support `?source=<name>` to fetch from specific source
  - Return templates with metadata
  - Handle errors gracefully
  - _Requirements: 3.3, 3.4_

- [ ] 6.2 Implement POST /api/templates/refresh route
  - Create route handler in `app/api/templates/refresh/route.ts`
  - Add authentication check (admin only)
  - Invalidate cache
  - Trigger fresh fetch from all sources
  - Return refresh status
  - _Requirements: 3.4_

- [ ]\* 6.3 Write integration tests for API routes
  - Test GET route with fresh cache
  - Test GET route with stale cache
  - Test GET route with force=true
  - Test GET route with specific source
  - Test POST route invalidates cache
  - Test authentication requirements
  - _Requirements: 3.3, 3.4_

- [ ] 7. Integrate with existing recommendation engine
- [ ] 7.1 Update recommendation engine to use dynamic templates
  - Modify `lib/recommendations/engine.ts` to call template fetcher
  - Merge dynamic templates with static fallbacks
  - Ensure filtering and scoring work with new templates
  - Add source preference logic
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7.2 Add template relevance scoring
  - Implement skill matching for user profile
  - Filter by user skill level
  - Exclude completed projects
  - Calculate relevance score
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]\* 7.3 Write integration tests for recommendation engine
  - Test recommendations with dynamic templates
  - Test filtering by difficulty
  - Test filtering by category
  - Test skill matching
  - Test exclusion of completed projects
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 8. Add error handling and logging
- [ ] 8.1 Implement comprehensive error handling
  - Add try-catch blocks in all fetchers
  - Create error response structure
  - Log errors with context (source, timestamp, error details)
  - Don't expose internal errors to users
  - _Requirements: 4.1, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 8.2 Add rate limiting protection
  - Detect HTTP 429 responses
  - Parse retry-after headers
  - Implement exponential backoff
  - Add circuit breaker for repeatedly failing sources
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]\* 8.3 Write unit tests for error handling
  - Test network error handling
  - Test rate limit detection and backoff
  - Test parsing error handling
  - Test cache error fallback
  - Test validation error handling
  - _Requirements: 4.1, 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2_

- [ ] 9. Add background cache warming job
- [ ] 9.1 Create cache warming utility
  - Create `lib/templates/warming.ts` with cache warming logic
  - Implement scheduled refresh before expiration
  - Add job to refresh cache every 20 hours
  - Log warming job results
  - _Requirements: 3.4_

- [ ] 9.2 Set up periodic cleanup job
  - Create cleanup utility to remove expired cache entries
  - Schedule cleanup to run daily
  - Log cleanup results (number of entries removed)
  - _Requirements: 3.4_

- [ ]\* 9.3 Write unit tests for background jobs
  - Test cache warming triggers fetch
  - Test cleanup removes only expired entries
  - Test cleanup doesn't affect fresh entries
  - _Requirements: 3.4_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Update UI to show template sources
- [ ] 11.1 Add source badges to project cards
  - Update `components/recommendations/ProjectCard.tsx`
  - Display source name (GitHub, Dev.to, etc.)
  - Add visual indicator for fallback templates
  - Show "fetched X hours ago" timestamp
  - _Requirements: 4.5_

- [ ] 11.2 Add filter for template sources
  - Update `components/recommendations/FilterBar.tsx`
  - Add source filter dropdown
  - Allow filtering by specific sources
  - Add "Show only fresh templates" toggle
  - _Requirements: 6.1, 6.2_

- [ ]\* 11.3 Write component tests for UI updates
  - Test ProjectCard displays source badge
  - Test FilterBar source filter works
  - Test fallback indicator appears correctly
  - _Requirements: 4.5, 6.1, 6.2_

- [ ] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
