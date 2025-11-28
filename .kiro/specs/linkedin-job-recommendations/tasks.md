# Implementation Plan

- [ ] 1. Set up LinkedIn API client and types
  - Create TypeScript types for LinkedIn jobs and API responses
  - Implement RapidAPI client with authentication
  - Add environment variables for API key and host
  - _Requirements: 1.3, 1.4_

- [ ]\* 1.1 Write property test for job data completeness
  - **Property 11: Job data completeness**
  - **Validates: Requirements 1.4, 4.4**

- [ ] 2. Implement tech stack extraction service
  - Create function to extract skills from user projects
  - Combine languages and tech_stack fields from all projects
  - Handle deduplication of skills
  - _Requirements: 1.2_

- [ ]\* 2.1 Write property test for tech stack extraction
  - **Property 1: Complete tech stack extraction**
  - **Validates: Requirements 1.2**

- [ ] 3. Create job matching and scoring service
  - Implement OpenAI-based job match analysis
  - Calculate match scores based on skill overlap
  - Identify matched and missing skills
  - Generate match reasoning and recommendations
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [ ]\* 3.1 Write property test for matched skills subset
  - **Property 4: Matched skills are subset of both**
  - **Validates: Requirements 2.4**

- [ ]\* 3.2 Write property test for missing skills identification
  - **Property 5: Missing skills are in requirements but not user skills**
  - **Validates: Requirements 2.5**

- [ ]\* 3.3 Write property test for match score skill overlap
  - **Property 3: Match score reflects skill overlap**
  - **Validates: Requirements 2.2**

- [ ]\* 3.4 Write unit tests for match scoring edge cases
  - Test 100% match, 0% match, partial matches
  - Test empty user skills and empty job requirements
  - _Requirements: 2.1, 2.2_

- [ ] 4. Build job recommendations API endpoint
  - Create GET /api/jobs/recommendations route
  - Retrieve user profile and projects from database
  - Extract tech stack from projects
  - Query LinkedIn API with role and tech stack
  - Analyze each job for match score
  - Sort results by match score descending
  - Handle query parameters for filters
  - _Requirements: 1.1, 1.3, 2.3, 3.1, 3.2, 3.3, 3.4_

- [ ]\* 4.1 Write property test for job sorting
  - **Property 2: Job recommendations sorted by match score**
  - **Validates: Requirements 2.3**

- [ ]\* 4.2 Write property test for filter application
  - **Property 6: Filters are applied correctly**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [ ]\* 4.3 Write unit tests for API endpoint
  - Test with valid user and projects
  - Test with user without target role
  - Test with various filter combinations
  - Test error handling for API failures
  - _Requirements: 1.1, 1.5, 3.5_

- [ ] 5. Create database schema for saved jobs
  - Create saved_jobs table with proper indexes
  - Add foreign key constraint to users table
  - Set up unique constraint on user_id + job_id
  - _Requirements: 4.1_

- [ ] 6. Implement saved jobs API endpoints
  - Create GET /api/jobs/saved route to retrieve saved jobs
  - Create POST /api/jobs/saved route to save a job
  - Create DELETE /api/jobs/saved/:id route to remove saved job
  - Sort saved jobs by created_at descending
  - Handle duplicate save attempts gracefully
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]\* 6.1 Write property test for save and retrieve
  - **Property 7: Save then retrieve returns same job**
  - **Validates: Requirements 4.1, 4.2**

- [ ]\* 6.2 Write property test for delete operation
  - **Property 8: Delete removes from saved list**
  - **Validates: Requirements 4.3**

- [ ]\* 6.3 Write property test for saved jobs ordering
  - **Property 9: Saved jobs ordered by recency**
  - **Validates: Requirements 4.5**

- [ ]\* 6.4 Write unit tests for saved jobs CRUD
  - Test save operation with valid data
  - Test duplicate save handling
  - Test retrieve with multiple saved jobs
  - Test delete operation
  - Test pagination
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 7. Add error handling and retry logic
  - Implement retry logic for network errors (2 attempts with exponential backoff)
  - Handle rate limit errors with user-friendly messages
  - Handle invalid API key errors
  - Handle malformed API responses
  - Log all errors appropriately
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]\* 7.1 Write property test for retry logic
  - **Property 10: API retry logic executes correctly**
  - **Validates: Requirements 5.5**

- [ ]\* 7.2 Write unit tests for error scenarios
  - Test rate limit error handling
  - Test invalid API key error
  - Test network timeout with retries
  - Test malformed response handling
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 8. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Create job recommendations page UI
  - Create app/job-recommendations/page.tsx
  - Implement job listing display with cards
  - Add filter controls (location, remote, experience level)
  - Show match scores with visual indicators
  - Add pagination or infinite scroll
  - Implement save/unsave functionality
  - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2_

- [ ]\* 9.1 Write integration tests for job recommendations page
  - Test page loads with job listings
  - Test filter application updates results
  - Test save button functionality
  - Test pagination
  - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2_

- [ ] 10. Create job card component
  - Create components/jobs/JobCard.tsx
  - Display job title, company, location
  - Show match score with progress bar or badge
  - Display quick view of matched skills (top 3-5)
  - Add save/unsave button with icon
  - Add "Apply" link button
  - Ensure keyboard accessibility
  - _Requirements: 6.2_

- [ ] 11. Create job detail modal component
  - Create components/jobs/JobDetailModal.tsx
  - Display full job description
  - Show complete matched skills breakdown
  - Show missing skills with explanations
  - Integrate with project recommendation engine for skill gaps
  - Display company information
  - Add prominent "Apply" button
  - Ensure ARIA labels and keyboard navigation
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]\* 11.1 Write property test for project recommendations
  - **Property 12: Project recommendations for skill gaps**
  - **Validates: Requirements 7.3**

- [ ]\* 11.2 Write property test for skill traceability
  - **Property 13: Matched skills traceable to projects**
  - **Validates: Requirements 7.4**

- [ ] 12. Create job filters component
  - Create components/jobs/JobFilters.tsx
  - Add location input field
  - Add remote preference toggle/select
  - Add experience level selector
  - Add "Clear filters" button
  - Implement debouncing for filter changes (500ms)
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ] 13. Integrate job recommendations into dashboard
  - Update app/dashboard/page.tsx
  - Display top 5 job recommendations
  - Show job title, company, location, match score
  - Add "View All Jobs" link to job recommendations page
  - Handle empty state with encouraging message
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 14. Create saved jobs page
  - Create app/jobs/saved/page.tsx
  - Display all saved jobs for user
  - Show jobs sorted by saved date (most recent first)
  - Allow unsaving jobs
  - Show match scores and matched skills
  - Add links to apply
  - _Requirements: 4.2, 4.3, 4.5_

- [ ] 15. Add navigation links
  - Update components/DashboardSidebar.tsx
  - Add "Job Recommendations" navigation item
  - Add "Saved Jobs" navigation item
  - Use appropriate icons
  - _Requirements: 6.4_

- [ ] 16. Implement caching for job search results
  - Add caching layer for job search API calls
  - Use 5-minute TTL for cached results
  - Cache key based on user ID and search parameters
  - Implement cache invalidation on filter changes
  - _Requirements: 5.1 (helps with rate limiting)_

- [ ] 17. Add rate limiting for job search endpoint
  - Implement per-user rate limiting (10 searches per minute)
  - Return appropriate error message when limit exceeded
  - Log rate limit violations
  - _Requirements: 5.1_

- [ ] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]\* 19. End-to-end integration tests
  - Test full job search flow from UI to API
  - Test save and retrieve flow
  - Test filter application flow
  - Test error handling flow
  - _Requirements: All_
