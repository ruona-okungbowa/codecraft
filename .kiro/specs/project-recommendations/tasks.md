# Implementation Plan

- [x] 1. Set up core data types and interfaces
  - Create TypeScript interfaces for ProjectRecommendation, FilterState, UserProject, SkillMatch
  - Define types in `types/recommendations.ts`
  - Import and extend existing types from `types/skills.ts`
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 2. Implement recommendation engine business logic
  - [x] 2.1 Create skill matcher service
    - Implement `matchSkills` function in `lib/recommendations/matcher.ts`
    - Logic to tag skills as NEW/FILLS GAP/REINFORCES
    - Handle fuzzy matching for skill names
    - _Requirements: 3.3_
  - [ ]\* 2.2 Write property test for skill matcher
    - **Property 4: Skill tag accuracy**
    - **Validates: Requirements 3.3**
  - [x] 2.3 Create priority scorer service
    - Implement `calculatePriorityScore` function in `lib/recommendations/scorer.ts`
    - Scoring logic: essential (+10), preferred (+5), nice-to-have (+2)
    - Determine priority level (high/medium/low) based on score
    - _Requirements: 1.4, 3.2_
  - [ ]\* 2.4 Write property test for priority scorer
    - **Property 2: Priority score monotonicity**
    - **Validates: Requirements 1.4**
  - [x] 2.5 Create recommendation engine
    - Implement `generateRecommendations` function in `lib/recommendations/engine.ts`
    - Load project templates from JSON
    - Match templates to skill gaps
    - Calculate scores and rank recommendations
    - _Requirements: 1.3, 1.4_
  - [ ]\* 2.6 Write property test for recommendation engine
    - **Property 1: Recommendation relevance**
    - **Validates: Requirements 1.3**
  - [ ]\* 2.7 Write property test for recommendation idempotency
    - **Property 10: Recommendation refresh idempotency**
    - **Validates: Requirements 8.5**

- [x] 3. Create database schema and API routes for user projects
  - [x] 3.1 Create user_projects table migration
    - Add table with columns: id, user_id, project_id, status, progress, started_at, completed_at, created_at, updated_at
    - Add indexes on user_id, project_id, and status
    - Add foreign key constraint to users table
    - _Requirements: 5.1, 6.1_
  - [x] 3.2 Implement POST /api/user-projects route
    - Create `app/api/user-projects/route.ts`
    - Handle authentication with Supabase getUser()
    - Validate request body (projectId, status)
    - Insert record into user_projects table
    - Return created user project
    - _Requirements: 5.1, 6.1_
  - [x]\* 3.3 Write property test for save persistence
    - **Property 5: Save state persistence**
    - **Validates: Requirements 5.1, 5.3**
  - [x] 3.4 Implement PATCH /api/user-projects/[id] route
    - Create `app/api/user-projects/[id]/route.ts`
    - Handle authentication and authorization (user owns project)
    - Validate request body (progress, status)
    - Update record in database
    - Auto-update status to "completed" when progress reaches 100
    - _Requirements: 6.3, 6.4_
  - [ ]\* 3.5 Write property test for progress tracking
    - **Property 6: Progress tracking consistency**
    - **Validates: Requirements 6.2, 6.3, 6.4**
  - [x] 3.6 Implement DELETE /api/user-projects/[id] route
    - Handle authentication and authorization
    - Delete record from database
    - Return success response
    - _Requirements: 5.3_

- [x] 4. Implement GET /api/recommendations route
  - [x] 4.1 Create recommendations API route
    - Create `app/api/recommendations/route.ts`
    - Authenticate user with Supabase getUser()
    - Fetch most recent skill gap analysis from database
    - Return 404 if no analysis exists
    - Load project templates from JSON
    - Call recommendation engine to generate recommendations
    - Fetch user's saved and started projects
    - Return recommendations with user project state
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]\* 4.2 Write unit tests for API route
    - Test authentication failure returns 401
    - Test no skill gap analysis returns 404
    - Test successful recommendation generation
    - Test response includes user project state
    - _Requirements: 1.1, 1.2_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create filter logic and utilities
  - [x] 6.1 Implement client-side filter functions
    - Create `lib/recommendations/filters.ts`
    - Implement `applyFilters` function
    - Handle difficulty, category, time commitment, skills filters
    - Implement AND logic for multiple filters
    - _Requirements: 2.2, 2.3_

  - [ ]\* 6.2 Write property test for filter correctness
    - **Property 3: Filter correctness**
    - **Validates: Requirements 2.2, 2.3**
  - [ ]\* 6.3 Write property test for filter combination
    - **Property 8: Filter combination correctness**
    - **Validates: Requirements 2.3**
  - [x] 6.4 Implement sort functions
    - Create sort functions for priority, difficulty, time, skills
    - Handle ascending/descending order
    - _Requirements: 2.4_

  - [ ]\* 6.5 Write unit tests for sort functions
    - Test each sort criteria produces correct order
    - Test edge cases (empty arrays, equal values)
    - _Requirements: 2.4_

- [x] 7. Build FilterBar component

- [ ] 7. Build FilterBar component
  - [x] 7.1 Create FilterBar component
    - Create `components/recommendations/FilterBar.tsx`
    - Implement difficulty dropdown
    - Implement category dropdown
    - Implement time commitment dropdown
    - Implement skills multi-select
    - Implement sort order dropdown
    - Display active filter chips
    - Implement clear all filters button
    - _Requirements: 2.1, 2.5_

  - [ ]\* 7.2 Write unit tests for FilterBar
    - Test filter changes trigger onFilterChange callback
    - Test active filter chips display correctly
    - Test clear all filters resets state
    - _Requirements: 2.1, 2.5_

- [x] 8. Build ProjectCard component
  - [x] 8.1 Create ProjectCard component structure
    - Create `components/recommendations/ProjectCard.tsx`
    - Display project name, description
    - Display priority badge (high/medium/low)
    - Display difficulty badge with icon
    - Display time estimate badge
    - Display category badge with icon
    - _Requirements: 3.1, 3.2_

  - [x] 8.2 Implement skill tags display
    - Map skills to SkillMatch data
    - Render skill tags with correct type (NEW/FILLS GAP/REINFORCES)
    - Apply correct styling for each type
    - Add glow effect for gap-filling skills
    - _Requirements: 3.3_

  - [x] 8.3 Implement critical gaps callout
    - Conditionally render callout if project fills essential skills
    - Display list of critical gaps addressed
    - Apply green color scheme
    - _Requirements: 3.4_

  - [x] 8.4 Implement gaps filled count
    - Calculate total gaps filled
    - Display count in card footer
    - _Requirements: 3.5_

  - [x] 8.5 Implement expandable learning resources
    - Create collapsible section for resources
    - Organize resources into Getting Started, Documentation, Templates sections
    - Display resource title, provider, type icon, duration, external link
    - Implement smooth expand/collapse animation
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 8.6 Implement save/unsave functionality
    - Add save button with bookmark icon
    - Handle save click (call API)
    - Update UI optimistically
    - Display "Saved ✓" when saved
    - Handle unsave click
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 8.7 Implement start/continue functionality
    - Add start button
    - Handle start click (call API)
    - Display progress indicator when in progress
    - Change button text to "Continue" when in progress
    - _Requirements: 6.1, 6.2, 6.5_

  - [ ]\* 8.8 Write unit tests for ProjectCard
    - Test correct badges display based on props
    - Test skill tags render with correct types
    - Test critical gaps callout shows when appropriate
    - Test save/unsave updates UI
    - Test start updates UI
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.2, 6.2_

- [x] 9. Build PriorityCallout component
  - [x] 9.1 Create PriorityCallout component
    - Create `components/recommendations/PriorityCallout.tsx`
    - Display alert icon
    - Display title "Critical skill gaps detected"
    - Display description with target role
    - Display "View critical projects" link
    - Apply orange color scheme with left border
    - _Requirements: 7.1, 7.2_

  - [ ]\* 9.2 Write property test for callout visibility
    - **Property 9: Critical gaps callout visibility**
    - **Validates: Requirements 7.1, 7.4**

-

- [x] 10. Build main ProjectRecommendationsPage
  - [x] 10.1 Create page component structure
    - Create `app/project-recommendations/page.tsx`
    - Set up page layout with sidebar margin
    - Add page header with title and subtitle
    - Add "Refresh Recommendations" button in header
    - _Requirements: 1.1, 8.1_

  - [x] 10.2 Implement data fetching
    - Fetch recommendations from API on mount
    - Handle loading state with skeleton cards
    - Handle error state with error message
    - Handle empty state (no skill gap analysis)
    - _Requirements: 1.1, 1.2, 9.1_

  - [ ]\* 10.3 Write property test for empty state
    - **Property 7: Empty state correctness**
    - **Validates: Requirements 1.2**
  - [x] 10.4 Implement filter state management
    - Set up filter state with useState
    - Apply filters to recommendations
    - Update displayed projects when filters change
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 10.5 Implement user project state management
    - Fetch user's saved and started projects
    - Track saved projects in Set
    - Track started projects in Map with progress
    - Update state when user saves/starts projects
    - _Requirements: 5.1, 6.1_

  - [x] 10.6 Render FilterBar component
    - Pass filter state and onChange handler
    - Pass available skills from recommendations
    - _Requirements: 2.1_

  - [x] 10.7 Render PriorityCallout component
    - Conditionally render if user has essential skill gaps
    - Pass critical gaps and target role
    - Handle "View critical projects" click (apply filter)
    - _Requirements: 7.1, 7.3_

  - [x] 10.8 Render project grid
    - Map recommendations to ProjectCard components
    - Pass all required props (project, userSkills, missingSkills, isSaved, progress)
    - Pass save/start/progress handlers
    - Apply 2-column grid on desktop, 1-column on mobile
    - _Requirements: 1.5, 3.1, 10.1, 10.3_

  - [x] 10.9 Implement refresh functionality
    - Handle refresh button click
    - Re-fetch recommendations from API
    - Display loading state during refresh
    - Animate new cards with staggered fade-in
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 10.10 Implement empty states
    - No skill gap analysis: display message with link to skill gap page
    - No matching projects: display message with clear filters button
    - _Requirements: 1.2, 2.6_

  - [ ]\* 10.11 Write integration tests for page
    - Test page loads and fetches recommendations
    - Test filters update displayed projects
    - Test save/start actions update UI and call API
    - Test refresh updates recommendations
    - Test empty states display correctly
    - _Requirements: 1.1, 1.2, 2.2, 5.1, 6.1, 8.1_

- [ ] 11. Add navigation link to sidebar
  - [ ] 11.1 Update DashboardSidebar component
    - Add "Project Recommendations" link with Target icon
    - Link to `/project-recommendations`
    - Position after "Skill Gap Analysis"
    - _Requirements: 1.1_

- [x] 12. Implement responsive design
  - [x] 12.1 Add responsive styles to page
    - 2-column grid on desktop (>1280px)
    - 1-column grid on mobile (<768px)
    - Stack filters vertically on mobile
    - Hide progress sidebar on mobile
    - Increase touch targets on mobile (44x44px minimum)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]\* 12.2 Write visual regression tests
    - Test layout at different viewport sizes
    - Test filter bar responsiveness
    - Test card layout responsiveness
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 13. Add animations and transitions
  - [x] 13.1 Implement card entrance animations
    - Stagger card entrance by 50ms per card
    - Fade + slide up animation
    - Use framer-motion for animations
    - _Requirements: 9.4_

  - [x] 13.2 Implement hover effects
    - Card elevation on hover
    - Smooth transition (200ms)
    - Border color change
    - _Requirements: 9.2_

  - [x] 13.3 Implement expand/collapse animations
    - Smooth height transition for learning resources (300ms)
    - Chevron rotation animation
    - _Requirements: 4.5, 9.5_

  - [x] 13.4 Implement filter transition
    - Fade out old results (150ms)
    - Fade in new results (200ms)
    - _Requirements: 9.3_

- [x] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Optional: Add ProgressSidebar component
  - [ ] 15.1 Create ProgressSidebar component
    - Create `components/recommendations/ProgressSidebar.tsx`
    - Display total recommendations count
    - Display started projects count
    - Display completed projects count
    - Display gaps to fill count
    - Display progress bar toward closing all gaps
    - Add "View all started projects" link
    - Make sticky on desktop (>1280px)
    - Hide on mobile
    - _Requirements: 10.5_
  - [ ]\* 15.2 Write unit tests for ProgressSidebar
    - Test correct counts display
    - Test progress bar calculation
    - Test link navigation

- [ ] 16. Optional: Add export functionality
  - [ ] 16.1 Implement export to PDF
    - Add "Export Report" button in header
    - Generate PDF with recommendations list
    - Include skill gaps and priority information
    - Download PDF file
  - [ ]\* 16.2 Write unit tests for export
    - Test PDF generation
    - Test file download trigger
