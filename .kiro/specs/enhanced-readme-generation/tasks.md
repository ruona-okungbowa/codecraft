# Implementation Plan - Enhanced README Generation

- [x] 1. Set up project structure and dependencies
  - Create `lib/readme/` directory with service files
  - Install new dependencies: marked, gray-matter, fast-check
  - Create TypeScript type definitions in `lib/readme/types.ts`
  - Set up test directory structure in `__tests__/readme/`
  - _Requirements: 8.1, 8.2_

- [x] 2. Implement README validation service
  - Create `lib/readme/validation.ts` with markdown validation logic
  - Implement heading hierarchy validation
  - Implement code block closure validation
  - Implement badge URL format validation
  - Implement section presence detection
  - Calculate quality score (0-100) based on validation results
  - _Requirements: 8.3_

- [ ]\* 2.1 Write property test for markdown validity
  - **Property 3: Markdown Validity**
  - **Validates: Requirements 8.3**

- [ ]\* 2.2 Write unit tests for validation service
  - Test valid markdown passes validation
  - Test invalid markdown returns appropriate errors
  - Test heading hierarchy detection
  - Test code block validation
  - _Requirements: 8.3_

- [x] 3. Implement MCP research service
  - Create `lib/readme/mcp-research.ts` with MCP client integration
  - Implement `researchProjectReadmeBestPractices()` function
  - Implement `researchProfileReadmeBestPractices()` function
  - Add 5-second timeout for MCP queries
  - Parse MCP results to extract sections, badges, and trending features
  - Create fallback templates in `lib/readme/templates.ts`
  - _Requirements: 8.1, 8.2_

- [x] 4. Implement research caching
  - Create database migration for `readme_research_cache` table
  - Implement `getCachedResearch()` function with cache key lookup
  - Implement `cacheResearch()` function with 24-hour expiration
  - Add cache key generation based on research type and date
  - _Requirements: Design - MCP Caching_

- [ ]\* 4.1 Write property test for cache consistency
  - **Property 7: Research Cache Consistency**
  - **Validates: Design Requirements - MCP Caching**

- [ ]\* 4.2 Write unit tests for caching logic
  - Test cache hit returns same data
  - Test cache miss triggers new research
  - Test cache expiration after 24 hours
  - Test cache key generation
  - _Requirements: Design - MCP Caching_

- [x] 5. Implement project analysis utilities
  - Create `lib/readme/analysis.ts` with project analysis functions
  - Implement technology extraction from package.json
  - Implement language detection from file extensions
  - Implement framework identification from dependencies
  - Implement existing README detection (case-insensitive)
  - Extract project metadata (name, description, version)
  - _Requirements: 8.1, 8.5_

- [ ]\* 5.1 Write property test for project analysis completeness
  - **Property 1: Project Analysis Completeness**
  - **Validates: Requirements 8.1**

- [ ]\* 5.2 Write property test for existing README detection
  - **Property 5: Existing README Detection**
  - **Validates: Requirements 8.5**

- [ ]\* 5.3 Write unit tests for analysis utilities
  - Test technology extraction with various package.json formats
  - Test language detection with different file types
  - Test README detection with various naming conventions
  - _Requirements: 8.1, 8.5_

- [x] 6. Implement README generation service
  - Create `lib/readme/generation.ts` with main generation logic
  - Implement `generateProjectReadme()` function
  - Implement `generateProfileReadme()` function
  - Create OpenAI prompts for project and profile READMEs
  - Inject MCP research findings into prompts
  - Generate appropriate badges using shields.io patterns
  - Include GitHub stats widgets for profile READMEs
  - Handle template selection (minimal, detailed, visual, professional)
  - _Requirements: 8.1, 8.2, 8.3_

- [ ]\* 6.1 Write property test for required sections presence
  - **Property 2: Required Sections Presence**
  - **Validates: Requirements 8.2**

- [ ]\* 6.2 Write property test for fallback resilience
  - **Property 8: Fallback Resilience**
  - **Validates: Design Requirements - MCP Fallback**

- [ ]\* 6.3 Write unit tests for generation service
  - Test project README generation with sample project
  - Test profile README generation with sample user data
  - Test template selection logic
  - Test badge generation for different tech stacks
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 7. Implement profile project ranking
  - Create `lib/readme/ranking.ts` with project ranking logic
  - Implement scoring algorithm combining stars and complexity
  - Sort projects by score in descending order
  - Select top 6 projects for profile README
  - _Requirements: Design - Profile Project Selection_

- [ ]\* 7.1 Write property test for profile project ranking
  - **Property 6: Profile Project Ranking**
  - **Validates: Profile Requirements - Top Project Selection**

- [x] 8. Implement GitHub deployment service
  - Create `lib/readme/deployment.ts` with GitHub API integration
  - Implement `deployProjectReadme()` function
  - Implement `deployProfileReadme()` function
  - Implement `ensureProfileRepoExists()` function to create username/username repo
  - Use commit message format: "docs: update README via GitStory"
  - Return commit SHA and GitHub URL
  - Handle existing file updates vs new file creation
  - _Requirements: 8.4_

- [ ]\* 8.1 Write property test for deployment commit format
  - **Property 9: Deployment Commit Format**
  - **Validates: Design Requirements - GitHub Deployment**

- [ ]\* 8.2 Write property test for deployment instructions
  - **Property 4: Deployment Instructions Provided**
  - **Validates: Requirements 8.4**

- [ ]\* 8.3 Write unit tests for deployment service
  - Test project README deployment with mock GitHub API
  - Test profile README deployment with mock GitHub API
  - Test profile repo creation when it doesn't exist
  - Test commit message formatting
  - _Requirements: 8.4_

- [x] 9. Create API routes for README generation
  - Create `app/api/ai/readme/project/route.ts` for project READMEs
  - Create `app/api/ai/readme/profile/route.ts` for profile READMEs
  - Create `app/api/ai/readme/deploy/route.ts` for deployment
  - Validate user authentication via Supabase
  - Handle request validation and error responses
  - Implement error handling for MCP, OpenAI, and GitHub failures
  - Return appropriate HTTP status codes
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]\* 9.1 Write integration tests for API routes
  - Test project README generation endpoint
  - Test profile README generation endpoint
  - Test deployment endpoint
  - Test error handling for various failure scenarios
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 10. Create UI components for README generation
  - Create `components/readme/TypeSelector.tsx` for choosing project vs profile
  - Create `components/readme/TemplateSelector.tsx` for style selection
  - Create `components/readme/Editor.tsx` for side-by-side markdown editing
  - Create `components/readme/Preview.tsx` for live markdown preview
  - Create `components/readme/DeploymentDialog.tsx` for deployment confirmation
  - Add loading states and error handling to all components
  - _Requirements: 8.2, 8.3, 8.4_

- [x] 11. Create main README generator page
  - Create `app/readme-generator/page.tsx` as main entry point
  - Integrate TypeSelector, TemplateSelector, Editor, Preview components
  - Implement state management for generation flow
  - Add project/profile selection logic
  - Connect to API routes for generation and deployment
  - Display validation results and warnings
  - Show deployment status and success messages
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 12. Add navigation and integration with existing app
  - Add "Generate README" link to dashboard sidebar
  - Update `components/DashboardSidebar.tsx` with new route
  - Ensure authentication is required for README generator page
  - Test navigation flow from dashboard to README generator
  - _Requirements: 8.1_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Configure MCP server for fetch capability
  - Document MCP configuration in README
  - Add example `.kiro/settings/mcp.json` configuration
  - Test MCP integration with real fetch server
  - Verify fallback works when MCP is unavailable
  - _Requirements: Design - MCP Integration_

- [ ] 15. Final integration testing and polish
  - Test complete flow: select project → generate → preview → deploy
  - Test complete flow: generate profile → preview → deploy
  - Verify READMEs display correctly on GitHub
  - Test error recovery scenarios
  - Verify cache behavior over 24-hour period
  - Test with various project types (React, Node, Python, etc.)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 16. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
