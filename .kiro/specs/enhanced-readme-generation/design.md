# Enhanced README Generation - Design Document

## Overview

This feature extends the existing README generation capability in GitStory to support both project READMEs and personal GitHub profile READMEs. The system integrates with MCP (Model Context Protocol) servers to research current best practices and trending elements, ensuring generated content follows industry standards.

The design builds upon the existing `lib/openai/generateReadme.ts` implementation while adding:

- Profile README generation for username/username repositories
- MCP server integration for real-time best practices research
- Enhanced project README generation with better structure detection
- Side-by-side preview and editing interface
- Direct GitHub deployment capabilities
- Multiple template styles and customization options

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   UI Layer      │
│  (React Pages)  │
└────────┬────────┘
         │
┌────────▼────────────────────────────────────────┐
│         API Routes Layer                        │
│  /api/ai/readme/project                        │
│  /api/ai/readme/profile                        │
│  /api/ai/readme/deploy                         │
└────────┬────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────┐
│       Service Layer                             │
│  - ReadmeGenerationService                      │
│  - MCPResearchService                           │
│  - ReadmeDeploymentService                      │
│  - ReadmeValidationService                      │
└────────┬────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────┐
│       Integration Layer                         │
│  - OpenAI Client (existing)                     │
│  - GitHub Client (existing)                     │
│  - MCP Client (new)                             │
│  - Supabase Client (existing)                   │
└─────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **User Request** → UI presents README type selection (project/profile)
2. **Research Phase** → MCP server queries best practices (cached 24hrs)
3. **Analysis Phase** → Analyze repository/profile data
4. **Generation Phase** → OpenAI generates README with researched context
5. **Validation Phase** → Validate markdown quality and completeness
6. **Preview Phase** → Display side-by-side editor with live preview
7. **Deployment Phase** → Optional direct push to GitHub repository

## Components and Interfaces

### 1. MCP Research Service

**Purpose**: Query MCP servers for README best practices and trending elements

**Interface**:

```typescript
interface MCPResearchService {
  researchProjectReadmeBestPractices(
    projectType: string
  ): Promise<ReadmeResearch>;
  researchProfileReadmeBestPractices(): Promise<ReadmeResearch>;
  getCachedResearch(cacheKey: string): Promise<ReadmeResearch | null>;
  cacheResearch(cacheKey: string, research: ReadmeResearch): Promise<void>;
}

interface ReadmeResearch {
  sections: string[];
  badgeStyles: string[];
  visualElements: string[];
  trendingFeatures: string[];
  exampleStructures: string[];
  source: "mcp" | "cache" | "fallback";
}
```

**Implementation Notes**:

- Use fetch MCP tool to search for "best README practices [year]"
- Parse results to extract common patterns
- Cache results in Supabase `readme_research_cache` table
- Fallback to built-in templates if MCP unavailable
- Timeout after 5 seconds to avoid blocking generation

### 2. README Generation Service

**Purpose**: Generate README content using OpenAI with researched context

**Interface**:

```typescript
interface ReadmeGenerationService {
  generateProjectReadme(
    project: Project,
    template: ReadmeTemplate,
    research: ReadmeResearch,
    githubToken?: string
  ): Promise<GeneratedReadme>;

  generateProfileReadme(
    user: User,
    projects: Project[],
    template: ReadmeTemplate,
    research: ReadmeResearch
  ): Promise<GeneratedReadme>;
}

interface GeneratedReadme {
  content: string;
  metadata: {
    template: ReadmeTemplate;
    sectionsIncluded: string[];
    wordCount: number;
    generatedAt: string;
  };
  validation: ValidationResult;
}

type ReadmeTemplate = "minimal" | "detailed" | "visual" | "professional";
```

**Implementation Notes**:

- Extend existing `generateReadme.ts` function
- Inject research findings into OpenAI prompt
- Detect project type from package.json, dependencies, file structure
- For profile READMEs, analyze top 6 projects by stars/complexity
- Generate appropriate badges using shields.io patterns
- Include GitHub stats widgets for profile READMEs

### 3. README Validation Service

**Purpose**: Validate generated README quality and completeness

**Interface**:

```typescript
interface ReadmeValidationService {
  validate(content: string, type: "project" | "profile"): ValidationResult;
}

interface ValidationResult {
  valid: boolean;
  score: number; // 0-100
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

interface ValidationError {
  type: "missing_section" | "invalid_markdown" | "broken_link";
  message: string;
  line?: number;
}
```

**Implementation Notes**:

- Extend existing `validateMarkdown.ts` utility
- Check for required sections based on README type
- Validate markdown syntax and heading hierarchy
- Check link formatting (not necessarily accessibility)
- Verify code block language tags
- Score based on completeness and quality

### 4. README Deployment Service

**Purpose**: Deploy generated READMEs to GitHub repositories

**Interface**:

```typescript
interface ReadmeDeploymentService {
  deployProjectReadme(
    repoOwner: string,
    repoName: string,
    content: string,
    githubToken: string
  ): Promise<DeploymentResult>;

  deployProfileReadme(
    username: string,
    content: string,
    githubToken: string
  ): Promise<DeploymentResult>;

  ensureProfileRepoExists(
    username: string,
    githubToken: string
  ): Promise<boolean>;
}

interface DeploymentResult {
  success: boolean;
  url?: string;
  error?: string;
  commitSha?: string;
}
```

**Implementation Notes**:

- Use GitHub API to create/update README.md files
- For profile READMEs, check if username/username repo exists
- Create profile repo if needed (public, with description)
- Use commit message: "docs: update README via GitStory"
- Return direct link to view README on GitHub

### 5. UI Components

**New Pages/Components**:

- `app/readme-generator/page.tsx` - Main README generation page
- `components/ReadmeTypeSelector.tsx` - Choose project vs profile
- `components/ReadmeEditor.tsx` - Side-by-side markdown editor
- `components/ReadmePreview.tsx` - Live markdown preview
- `components/TemplateSelector.tsx` - Choose README style
- `components/DeploymentDialog.tsx` - Deployment confirmation

## Data Models

### Database Schema Extensions

**New Table: `readme_research_cache`**

```sql
CREATE TABLE readme_research_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  research_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_readme_research_cache_key ON readme_research_cache(cache_key);
CREATE INDEX idx_readme_research_expires ON readme_research_cache(expires_at);
```

**Extend `generated_content` table**:

```sql
-- Add new content_type values: 'project_readme', 'profile_readme'
-- Existing table already supports this via content_type column
```

### TypeScript Types

```typescript
interface ReadmeGenerationRequest {
  type: "project" | "profile";
  projectId?: string; // Required for project type
  template: ReadmeTemplate;
  customSections?: string[];
}

interface ReadmeGenerationResponse {
  content: string;
  validation: ValidationResult;
  research: ReadmeResearch;
  cached: boolean;
  generatedAt: string;
}

interface ProfileReadmeData {
  username: string;
  bio: string;
  topProjects: Project[];
  techStack: string[];
  stats: {
    totalStars: number;
    totalRepos: number;
    languages: Record<string, number>;
  };
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    email?: string;
  };
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Project Analysis Completeness

_For any_ valid project repository with detectable files, the analysis should extract at least one technology identifier (language, framework, or tool) from the codebase.

**Validates: Requirements 8.1**

### Property 2: Required Sections Presence

_For any_ generated README content (project or profile), parsing the markdown should identify all required sections: overview/about, features, tech stack, and usage/getting started.

**Validates: Requirements 8.2**

### Property 3: Markdown Validity

_For any_ generated README content, the markdown should be syntactically valid with properly closed code blocks, valid heading hierarchy (no skipped levels), and correctly formatted badge URLs.

**Validates: Requirements 8.3**

### Property 4: Deployment Instructions Provided

_For any_ README approval action, the response should include deployment instructions containing either a GitHub file path or deployment steps.

**Validates: Requirements 8.4**

### Property 5: Existing README Detection

_For any_ project with a README.md file in the root directory, the system should detect its presence and offer enhancement mode rather than replacement mode.

**Validates: Requirements 8.5**

### Property 6: Profile Project Ranking

_For any_ user with multiple projects, the top projects selected for profile README should be ordered by a combination of stars and complexity score, with higher values ranked first.

**Validates: Profile Requirements - Top Project Selection**

### Property 7: Research Cache Consistency

_For any_ research query executed twice within 24 hours, the second query should return cached data with the same content as the first query (cache hit).

**Validates: Design Requirements - MCP Caching**

### Property 8: Fallback Resilience

_For any_ MCP research failure (timeout, error, unavailable), the README generation should still complete successfully using built-in template data.

**Validates: Design Requirements - MCP Fallback**

### Property 9: Deployment Commit Format

_For any_ successful GitHub deployment, the commit message should match the pattern "docs: update README via GitStory" and return a valid 40-character SHA hash.

**Validates: Design Requirements - GitHub Deployment**

## Error Handling

### MCP Integration Errors

**Scenario**: MCP server unavailable, timeout, or returns invalid data

**Handling**:

- Set 5-second timeout for MCP queries
- Log error to console with error type and timestamp
- Return fallback research data from built-in templates
- Set `research.source = "fallback"` in response
- Continue generation without blocking user

**User Experience**: Display subtle notice "Using standard templates" in UI

### GitHub API Errors

**Scenario**: Rate limit exceeded, authentication failure, repository access denied

**Handling**:

- Check rate limit before operations using `octokit.rateLimit.get()`
- For 403 errors, check if rate limited vs permission denied
- For authentication errors, prompt user to reconnect GitHub
- For repository not found, verify repo exists and user has access
- Return clear error messages with actionable next steps

**User Experience**: Display error banner with specific action (e.g., "Reconnect GitHub account" button)

### OpenAI Generation Errors

**Scenario**: API timeout, rate limit, invalid response, content filter triggered

**Handling**:

- Implement exponential backoff for rate limits (1s, 2s, 4s)
- Set 30-second timeout for generation requests
- Validate response structure before returning to user
- For content filter triggers, retry with sanitized prompt
- Cache successful generations to avoid regeneration

**User Experience**: Show loading state with progress indicator, display retry option on failure

### Validation Errors

**Scenario**: Generated README fails quality validation

**Handling**:

- If validation score < 60, automatically regenerate once
- If second attempt fails, return content with warnings
- Highlight specific issues in preview (missing sections, broken links)
- Allow user to manually edit and fix issues
- Provide suggestions for improvement in sidebar

**User Experience**: Show validation warnings in editor with inline suggestions

### Deployment Errors

**Scenario**: GitHub push fails, profile repo creation fails, commit rejected

**Handling**:

- For profile repo creation failure, provide manual instructions
- For push failures, check if branch is protected
- For commit rejections, verify file size limits
- Offer download as fallback for all deployment failures
- Log deployment attempts for debugging

**User Experience**: Show deployment status with fallback download button

## Testing Strategy

### Unit Testing

**Framework**: Vitest with React Testing Library

**Coverage Areas**:

1. **Markdown Validation**
   - Test `validateMarkdown()` with valid and invalid markdown
   - Test heading hierarchy detection
   - Test code block validation
   - Test badge URL format validation

2. **Project Analysis**
   - Test technology extraction from package.json
   - Test language detection from file extensions
   - Test framework identification from dependencies
   - Test README detection in various locations

3. **Template Selection**
   - Test template matching based on project type
   - Test section inclusion based on template
   - Test badge generation for different tech stacks

4. **Cache Management**
   - Test cache key generation
   - Test cache expiration logic
   - Test cache retrieval and storage

5. **GitHub Integration**
   - Test commit message formatting
   - Test profile repo name generation
   - Test file path construction
   - Mock GitHub API responses

### Property-Based Testing

**Framework**: fast-check (JavaScript property testing library)

**Configuration**: Minimum 100 iterations per property test

**Test Tagging Format**: `// Feature: enhanced-readme-generation, Property {number}: {property_text}`

**Property Tests**:

1. **Property 1: Project Analysis Completeness**
   - Generate random project structures with various file types
   - Verify at least one technology is extracted
   - Test with empty projects, single-file projects, complex projects

2. **Property 2: Required Sections Presence**
   - Generate random README content with varying structures
   - Parse and verify all required sections exist
   - Test with different heading styles (#, ##, ###)

3. **Property 3: Markdown Validity**
   - Generate random markdown content
   - Validate syntax correctness
   - Verify code blocks are properly closed
   - Check heading hierarchy has no gaps

4. **Property 4: Deployment Instructions Provided**
   - Generate random approval actions
   - Verify instructions are always included in response
   - Test with different README types (project/profile)

5. **Property 5: Existing README Detection**
   - Generate random project structures with/without README
   - Verify detection works for README.md, readme.md, Readme.md
   - Test enhancement mode is offered when README exists

6. **Property 6: Profile Project Ranking**
   - Generate random sets of projects with varying stars/complexity
   - Verify top projects are correctly ordered
   - Test with edge cases (all same stars, all zero stars)

7. **Property 7: Research Cache Consistency**
   - Execute same research query twice
   - Verify second query returns cached data
   - Test cache key generation is consistent

8. **Property 8: Fallback Resilience**
   - Simulate MCP failures (timeout, error, invalid response)
   - Verify generation completes with fallback data
   - Test that fallback templates are valid

9. **Property 9: Deployment Commit Format**
   - Generate random deployment scenarios
   - Verify commit message matches expected pattern
   - Verify SHA is 40 characters and hexadecimal

### Integration Testing

**Scope**: End-to-end flows with real API calls (using test accounts)

**Test Scenarios**:

1. **Full Project README Flow**
   - Select project → Research → Generate → Validate → Deploy
   - Verify README appears on GitHub
   - Test with public and private repositories

2. **Full Profile README Flow**
   - Analyze profile → Research → Generate → Create repo → Deploy
   - Verify profile README displays on GitHub profile
   - Test with existing and new profile repos

3. **MCP Integration Flow**
   - Trigger research → Verify MCP call → Check cache → Use in generation
   - Test cache hit on second request
   - Test fallback when MCP unavailable

4. **Error Recovery Flow**
   - Trigger various errors → Verify fallback behavior → Complete generation
   - Test user can still download README on deployment failure

### Manual Testing Checklist

- [ ] Test with various project types (React, Node, Python, etc.)
- [ ] Verify generated READMEs look professional on GitHub
- [ ] Test MCP integration with real fetch server
- [ ] Verify cache expiration after 24 hours
- [ ] Test deployment to existing and new repositories
- [ ] Verify profile README displays correctly on GitHub profile
- [ ] Test with rate-limited GitHub account
- [ ] Verify error messages are user-friendly
- [ ] Test responsive design on mobile devices
- [ ] Verify accessibility with keyboard navigation

### Performance Testing

**Targets**:

- README generation: < 10 seconds (per requirements)
- MCP research: < 5 seconds (with timeout)
- GitHub deployment: < 3 seconds
- Cache retrieval: < 100ms

**Load Testing**:

- Test with 50 concurrent generation requests
- Verify queue system handles backpressure
- Monitor OpenAI API rate limits
- Test cache performance with 1000+ entries

## Implementation Notes

### MCP Server Configuration

The feature requires the fetch MCP server to be configured in `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "disabled": false
    }
  }
}
```

### Environment Variables

No new environment variables required. Uses existing:

- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Dependencies

New dependencies to add:

```json
{
  "dependencies": {
    "marked": "^11.0.0",
    "gray-matter": "^4.0.3"
  },
  "devDependencies": {
    "fast-check": "^3.15.0"
  }
}
```

### File Structure

```
lib/
├── readme/
│   ├── generation.ts          # Main generation service
│   ├── mcp-research.ts        # MCP integration
│   ├── validation.ts          # README validation
│   ├── deployment.ts          # GitHub deployment
│   ├── templates.ts           # Built-in templates
│   └── types.ts               # TypeScript types
app/
├── api/
│   └── ai/
│       └── readme/
│           ├── project/route.ts
│           ├── profile/route.ts
│           └── deploy/route.ts
├── readme-generator/
│   └── page.tsx               # Main UI page
components/
├── readme/
│   ├── TypeSelector.tsx
│   ├── Editor.tsx
│   ├── Preview.tsx
│   ├── TemplateSelector.tsx
│   └── DeploymentDialog.tsx
__tests__/
├── readme/
│   ├── generation.test.ts
│   ├── validation.test.ts
│   ├── deployment.test.ts
│   └── properties.test.ts     # Property-based tests
```

## Future Enhancements

- Support for README translations (multiple languages)
- A/B testing different README styles for engagement
- README analytics (views, clicks on badges)
- Automated README updates when code changes
- Community template marketplace
- AI-powered README improvement suggestions over time
