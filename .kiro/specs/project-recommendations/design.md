# Design Document

## Overview

The Project Recommendations feature is a personalized project discovery system that helps developers identify and build projects that address their specific skill gaps. The system analyzes a user's skill gap analysis results, matches them against a curated database of project templates, and presents ranked recommendations with detailed learning resources and progress tracking capabilities.

The feature integrates with the existing skill gap analysis system and leverages the project templates database to provide actionable, portfolio-worthy project ideas. Users can filter, save, and track their progress on recommended projects, creating a guided learning path toward their target role.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (React)                      │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Recommendations│  │   Filters    │  │  Project Card   │ │
│  │     Page       │  │   Component  │  │   Component     │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                       │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ GET /api/      │  │ POST /api/   │  │ PATCH /api/     │ │
│  │ recommendations│  │ user-projects│  │ user-projects   │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Recommendation │  │   Priority   │  │    Matching     │ │
│  │    Engine      │  │   Scorer     │  │    Algorithm    │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (Supabase)                     │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  skill_gaps    │  │user_projects │  │   projects      │ │
│  │     table      │  │    table     │  │    table        │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
│  ┌────────────────┐                                         │
│  │ project-       │  (Static JSON)                          │
│  │ templates.json │                                         │
│  └────────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Navigation**: User navigates to `/project-recommendations`
2. **Skill Gap Fetch**: System fetches user's most recent skill gap analysis from `skill_gaps` table
3. **Template Loading**: System loads project templates from `project-templates.json`
4. **Matching & Scoring**: Recommendation engine matches templates to skill gaps and calculates priority scores
5. **Filtering**: Client-side filters apply to matched recommendations
6. **Display**: Ranked, filtered recommendations render in grid layout
7. **User Actions**: User can save, start, or track progress on projects (persisted to `user_projects` table)

## Components and Interfaces

### Frontend Components

#### 1. ProjectRecommendationsPage (`app/project-recommendations/page.tsx`)

Main page component that orchestrates the entire feature.

**Props**: None (uses URL params and auth context)

**State**:

- `recommendations: ProjectRecommendation[]` - All matched recommendations
- `filters: FilterState` - Active filter selections
- `loading: boolean` - Loading state
- `skillGapAnalysis: SkillGapAnalysis | null` - User's skill gap data
- `savedProjects: Set<string>` - IDs of saved projects
- `startedProjects: Map<string, ProjectProgress>` - Progress tracking

**Responsibilities**:

- Fetch skill gap analysis on mount
- Fetch recommendations from API
- Manage filter state
- Handle save/start/progress actions
- Render empty states

#### 2. FilterBar Component

Displays and manages all filter controls.

**Props**:

- `filters: FilterState`
- `onFilterChange: (filters: FilterState) => void`
- `availableSkills: string[]`
- `activeFilterCount: number`

**Features**:

- Difficulty dropdown (Beginner/Intermediate/Advanced)
- Category dropdown (Frontend/Backend/Fullstack/DevOps/Mobile)
- Time commitment dropdown (Weekend/Week-long/Extended)
- Skills multi-select
- Sort order dropdown
- Active filter chips with remove capability
- Clear all filters button

#### 3. ProjectCard Component

Displays a single project recommendation with all details.

**Props**:

- `project: ProjectRecommendation`
- `userSkills: string[]`
- `missingSkills: MissingSkills`
- `isSaved: boolean`
- `progress: ProjectProgress | null`
- `onSave: () => void`
- `onStart: () => void`
- `onProgressUpdate: (progress: number) => void`

**Features**:

- Priority badge (High/Medium/Low)
- Difficulty badge with icon
- Time estimate badge
- Category badge with icon
- Skill tags (NEW/FILLS GAP/REINFORCES)
- Expandable learning resources
- Save/unsave toggle
- Start/continue button
- Progress indicator

#### 4. PriorityCallout Component

Displays alert banner for critical skill gaps.

**Props**:

- `criticalGaps: string[]`
- `targetRole: string`
- `onViewCritical: () => void`

#### 5. ProgressSidebar Component (Optional)

Sticky sidebar showing user's overall progress.

**Props**:

- `totalRecommendations: number`
- `startedCount: number`
- `completedCount: number`
- `gapsToFill: number`

### Backend API Routes

#### GET `/api/recommendations`

Fetches personalized project recommendations for authenticated user.

**Query Parameters**:

- None (uses authenticated user context)

**Response**:

```typescript
{
  recommendations: ProjectRecommendation[];
  skillGapAnalysis: SkillGapAnalysis;
  cached: boolean;
}
```

**Logic**:

1. Authenticate user
2. Fetch most recent skill gap analysis
3. Load project templates
4. Run matching algorithm
5. Calculate priority scores
6. Return ranked recommendations

#### POST `/api/user-projects`

Creates a new user project tracking record.

**Request Body**:

```typescript
{
  projectId: string;
  status: "saved" | "in_progress";
}
```

**Response**:

```typescript
{
  success: boolean;
  userProject: UserProject;
}
```

#### PATCH `/api/user-projects/:id`

Updates user project progress or status.

**Request Body**:

```typescript
{
  progress?: number;
  status?: "saved" | "in_progress" | "completed";
}
```

**Response**:

```typescript
{
  success: boolean;
  userProject: UserProject;
}
```

#### DELETE `/api/user-projects/:id`

Removes a saved project.

**Response**:

```typescript
{
  success: boolean;
}
```

### Business Logic Services

#### RecommendationEngine (`lib/recommendations/engine.ts`)

Core service that generates recommendations.

**Functions**:

```typescript
function generateRecommendations(
  skillGapAnalysis: SkillGapAnalysis,
  templates: ProjectTemplate[]
): ProjectRecommendation[];
```

**Algorithm**:

1. For each template, calculate skill match score
2. Identify which gaps the project fills
3. Calculate priority score based on critical gaps filled
4. Tag skills as NEW/FILLS GAP/REINFORCES
5. Sort by priority score, then difficulty
6. Return ranked list

#### PriorityScorer (`lib/recommendations/scorer.ts`)

Calculates priority scores for projects.

**Functions**:

```typescript
function calculatePriorityScore(
  project: ProjectTemplate,
  missingSkills: MissingSkills
): {
  score: number;
  priority: "high" | "medium" | "low";
  gapsFilled: string[];
};
```

**Scoring Logic**:

- Essential skill filled: +10 points
- Preferred skill filled: +5 points
- Nice-to-have skill filled: +2 points
- High priority: score >= 20
- Medium priority: score >= 10
- Low priority: score < 10

#### SkillMatcher (`lib/recommendations/matcher.ts`)

Matches project skills to user skills and gaps.

**Functions**:

```typescript
function matchSkills(
  projectSkills: string[],
  userSkills: string[],
  missingSkills: MissingSkills
): SkillMatch[];

interface SkillMatch {
  skill: string;
  type: "new" | "fills_gap" | "reinforces";
  priority?: "essential" | "preferred" | "niceToHave";
}
```

## Data Models

### ProjectTemplate (from JSON)

```typescript
interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  timeEstimate: string;
  skillsTaught: string[];
  category: "frontend" | "backend" | "fullstack" | "devops" | "mobile";
  features: string[];
  learningResources: LearningResource[];
}
```

### ProjectRecommendation (Enhanced Template)

```typescript
interface ProjectRecommendation extends ProjectTemplate {
  priorityScore: number;
  priority: "high" | "medium" | "low";
  gapsFilled: string[];
  skillMatches: SkillMatch[];
  criticalGapsAddressed: number;
}
```

### SkillGapAnalysis (from database)

```typescript
interface SkillGapAnalysis {
  id: string;
  userId: string;
  targetRole: Role;
  presentSkills: string[];
  missingSkills: MissingSkills;
  coveragePercentage: number;
  analysedAt: string;
}

interface MissingSkills {
  essential: string[];
  preferred: string[];
  niceToHave: string[];
}
```

### UserProject (database table)

```typescript
interface UserProject {
  id: string;
  userId: string;
  projectId: string; // References template ID
  status: "saved" | "in_progress" | "completed";
  progress: number; // 0-100
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### FilterState (client-side)

```typescript
interface FilterState {
  difficulty: "all" | "beginner" | "intermediate" | "advanced";
  category: "all" | "frontend" | "backend" | "fullstack" | "devops" | "mobile";
  timeCommitment: "all" | "weekend" | "week" | "extended";
  skills: string[];
  sortBy: "priority" | "difficulty" | "time" | "skills";
}
```

### LearningResource

```typescript
interface LearningResource {
  title: string;
  url: string;
  type: "tutorial" | "docs" | "video" | "article" | "example";
  provider?: string;
  duration?: string;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Recommendation relevance

_For any_ user with skill gap analysis, all returned project recommendations should teach at least one skill from the user's missing skills list.

**Validates: Requirements 1.3, 1.4**

### Property 2: Priority score monotonicity

_For any_ two projects where project A fills more critical (essential) skill gaps than project B, project A's priority score should be greater than or equal to project B's priority score.

**Validates: Requirements 1.4**

### Property 3: Filter correctness

_For any_ active filter selection, all displayed projects should match the filter criteria (difficulty, category, time commitment, or skills).

**Validates: Requirements 2.2, 2.3**

### Property 4: Skill tag accuracy

_For any_ skill displayed on a project card, the skill tag (NEW/FILLS GAP/REINFORCES) should correctly reflect whether the skill is in the user's present skills or missing skills lists.

**Validates: Requirements 3.3**

### Property 5: Save state persistence

_For any_ project that a user saves, querying the user's saved projects should return that project until explicitly removed.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 6: Progress tracking consistency

_For any_ project marked as "in progress", the progress percentage should be between 0 and 100, and when progress reaches 100, the status should update to "completed".

**Validates: Requirements 6.2, 6.3, 6.4**

### Property 7: Empty state correctness

_For any_ user without skill gap analysis, the system should display the "complete skill analysis first" empty state and not attempt to generate recommendations.

**Validates: Requirements 1.2**

### Property 8: Filter combination correctness

_For any_ combination of multiple active filters, a project should only be displayed if it matches ALL active filter criteria (AND logic, not OR).

**Validates: Requirements 2.3**

### Property 9: Critical gaps callout visibility

_For any_ user with at least one missing essential skill, the priority callout banner should be displayed; for users with zero missing essential skills, it should not be displayed.

**Validates: Requirements 7.1, 7.4**

### Property 10: Recommendation refresh idempotency

_For any_ user, refreshing recommendations with the same skill gap analysis should produce the same set of recommendations in the same order.

**Validates: Requirements 8.5**

## Error Handling

### Client-Side Errors

1. **No Skill Gap Analysis**
   - Display empty state with "Complete skill analysis first" message
   - Provide button linking to `/skill-gap` page
   - Do not attempt API call

2. **API Request Failure**
   - Display error toast with retry button
   - Maintain previous state if available
   - Log error details for debugging

3. **No Matching Projects**
   - Display "No projects match these filters" empty state
   - Suggest clearing filters or adjusting criteria
   - Show "Clear all filters" button

4. **Network Timeout**
   - Display loading state for maximum 30 seconds
   - Show timeout error with retry option
   - Preserve user's filter selections

### Server-Side Errors

1. **Unauthenticated Request**
   - Return 401 status
   - Redirect to login page
   - Preserve intended destination

2. **Missing Skill Gap Analysis**
   - Return 404 status with descriptive message
   - Client displays appropriate empty state

3. **Database Query Failure**
   - Return 500 status
   - Log error details
   - Return generic error message to client

4. **Invalid Filter Parameters**
   - Return 400 status with validation errors
   - Client displays error toast
   - Reset to default filters

### Data Validation

1. **Project Template Validation**
   - Ensure all required fields present
   - Validate difficulty enum values
   - Validate category enum values
   - Skip invalid templates with warning log

2. **User Project Validation**
   - Validate progress is 0-100
   - Validate status enum values
   - Validate project ID exists in templates
   - Return 400 for invalid data

3. **Filter Validation**
   - Validate enum values for dropdowns
   - Validate skill names exist in available skills
   - Sanitize user input
   - Apply defaults for invalid values

## Testing Strategy

### Unit Testing

The system will use **Vitest** as the testing framework with **React Testing Library** for component tests.

**Unit tests will cover**:

- Individual utility functions (scorer, matcher, filter logic)
- Component rendering with various props
- API route handlers with mocked database
- Error handling paths
- Edge cases (empty arrays, null values, boundary conditions)

**Example unit tests**:

- `calculatePriorityScore` returns correct score for various skill combinations
- `matchSkills` correctly tags skills as NEW/FILLS GAP/REINFORCES
- `FilterBar` displays correct number of active filters
- `ProjectCard` shows correct priority badge based on score
- API route returns 401 for unauthenticated requests

### Property-Based Testing

The system will use **fast-check** for property-based testing in TypeScript.

**Property-based tests will**:

- Run a minimum of 100 iterations per property
- Generate random but valid input data
- Verify universal properties hold across all inputs
- Tag each test with the corresponding correctness property from the design document

**Test format**:

```typescript
// Feature: project-recommendations, Property 1: Recommendation relevance
test("all recommendations teach at least one missing skill", () => {
  fc.assert(
    fc.property(
      fc.record({
        presentSkills: fc.array(fc.string()),
        missingSkills: fc.record({
          essential: fc.array(fc.string()),
          preferred: fc.array(fc.string()),
          niceToHave: fc.array(fc.string()),
        }),
      }),
      (skillGapAnalysis) => {
        const recommendations = generateRecommendations(
          skillGapAnalysis,
          projectTemplates
        );

        const allMissingSkills = [
          ...skillGapAnalysis.missingSkills.essential,
          ...skillGapAnalysis.missingSkills.preferred,
          ...skillGapAnalysis.missingSkills.niceToHave,
        ];

        return recommendations.every((rec) =>
          rec.skillsTaught.some((skill) => allMissingSkills.includes(skill))
        );
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property tests will verify**:

- Property 1: Recommendation relevance (all recommendations teach missing skills)
- Property 2: Priority score monotonicity (more critical gaps = higher score)
- Property 3: Filter correctness (filtered results match criteria)
- Property 4: Skill tag accuracy (tags match user's skill state)
- Property 5: Save state persistence (saved projects persist correctly)
- Property 6: Progress tracking consistency (progress bounds and status updates)
- Property 7: Empty state correctness (no analysis = empty state)
- Property 8: Filter combination correctness (AND logic for multiple filters)
- Property 9: Critical gaps callout visibility (shown only when essential gaps exist)
- Property 10: Recommendation refresh idempotency (same input = same output)

### Integration Testing

**Integration tests will cover**:

- Full API request/response cycles
- Database operations with test database
- Authentication flow
- Filter application with real data
- Save/start/progress workflows

### Performance Testing

**Performance requirements**:

- Initial page load: < 2 seconds
- Filter application: < 150ms
- Card hover animation: < 200ms
- API response time: < 1 second
- Smooth scrolling with 60fps

## Security Considerations

1. **Authentication**
   - All API routes require authenticated user
   - Use Supabase `getUser()` for session validation
   - No public access to recommendations

2. **Authorization**
   - Users can only access their own skill gap analysis
   - Users can only modify their own saved projects
   - Validate user ID matches authenticated user

3. **Input Validation**
   - Sanitize all user inputs
   - Validate enum values
   - Prevent SQL injection via parameterized queries
   - Validate project IDs exist before operations

4. **Rate Limiting**
   - Implement rate limiting on API routes
   - Prevent abuse of refresh functionality
   - Limit save/unsave operations per minute

5. **Data Privacy**
   - Do not expose other users' data
   - Do not log sensitive user information
   - Comply with data retention policies

## Deployment Considerations

1. **Static Assets**
   - Project templates JSON loaded at build time
   - Cached in memory for performance
   - Updated via deployment, not runtime

2. **Database Migrations**
   - Create `user_projects` table if not exists
   - Add indexes on `user_id` and `project_id`
   - Add index on `status` for filtering

3. **Environment Variables**
   - No new environment variables required
   - Uses existing Supabase and auth configuration

4. **Caching Strategy**
   - Cache skill gap analysis for 24 hours
   - Cache project templates in memory
   - No caching of user-specific data (saved/started projects)

5. **Monitoring**
   - Log API response times
   - Track recommendation generation performance
   - Monitor filter usage patterns
   - Alert on error rates > 5%
