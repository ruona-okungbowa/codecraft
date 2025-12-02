# Design Document

## Overview

This design enhances the CodeCraft skill gap analysis feature to provide comprehensive career development insights. The improvements focus on five key areas:

1. **Production-ready API infrastructure** - Replace test endpoint with authenticated, cached API routes
2. **Intelligent skill proficiency detection** - Multi-factor analysis of skill expertise levels
3. **Advanced skill matching** - Handle synonyms, composite requirements, and fuzzy matching
4. **Personalized learning paths** - Ordered recommendations with prerequisites and resources
5. **Progress tracking** - Persistent storage and historical trend analysis

The design maintains backward compatibility with existing UI components while adding new capabilities for tracking skill development over time.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────────┐         ┌─────────────────────┐      │
│  │ SkillGapPage     │────────▶│ ProgressDashboard   │      │
│  │ (existing)       │         │ (new)               │      │
│  └──────────────────┘         └─────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ POST /api/analysis/skill-gaps                        │  │
│  │ GET  /api/analysis/skill-gaps/history                │  │
│  │ GET  /api/analysis/skill-gaps/progress               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Skill        │  │ Proficiency  │  │ Learning Path   │  │
│  │ Extractor    │  │ Calculator   │  │ Generator       │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Skill        │  │ Gap          │  │ Progress        │  │
│  │ Normalizer   │  │ Calculator   │  │ Tracker         │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│  ┌──────────────────┐         ┌─────────────────────┐      │
│  │ Supabase         │         │ Static Data         │      │
│  │ - skill_analyses │         │ - role-requirements │      │
│  │ - projects       │         │ - skill-synonyms    │      │
│  │ - users          │         │ - learning-resources│      │
│  └──────────────────┘         └─────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Analysis Request**: User selects target role → API authenticates → Fetches user projects
2. **Skill Extraction**: Projects → Extract skills from languages, dependencies, descriptions
3. **Normalization**: Raw skills → Normalize synonyms → Deduplicate
4. **Proficiency Calculation**: Normalized skills → Calculate proficiency scores → Classify levels
5. **Gap Analysis**: Present skills + Role requirements → Calculate gaps → Generate summary
6. **Learning Path**: Missing skills → Order by priority/prerequisites → Attach resources
7. **Persistence**: Analysis results → Store in database → Return to client

## Components and Interfaces

### 1. API Routes

#### POST /api/analysis/skill-gaps

**Request:**

```typescript
{
  targetRole: Role;
  forceRefresh?: boolean; // Skip cache
}
```

**Response:**

```typescript
{
  analysis: EnhancedSkillGapAnalysis;
  learningPath: LearningPathItem[];
  cached: boolean;
  generatedAt: string; // ISO timestamp
}
```

#### GET /api/analysis/skill-gaps/history

**Query Parameters:**

- `limit?: number` (default: 10)
- `role?: Role` (filter by role)

**Response:**

```typescript
{
  analyses: AnalysisHistoryItem[];
  total: number;
}
```

#### GET /api/analysis/skill-gaps/progress

**Response:**

```typescript
{
  currentAnalysis: EnhancedSkillGapAnalysis;
  previousAnalysis: EnhancedSkillGapAnalysis | null;
  progress: ProgressMetrics;
}
```

### 2. Core Business Logic

#### SkillNormalizer

```typescript
class SkillNormalizer {
  private synonymMap: Map<string, string>;

  normalize(skill: string): string;
  normalizeAll(skills: string[]): string[];
  addSynonym(variants: string[], canonical: string): void;
}
```

**Responsibilities:**

- Normalize skill names to canonical forms
- Handle case-insensitive matching
- Manage synonym mappings
- Remove duplicates after normalization

#### ProficiencyCalculator

```typescript
interface ProficiencyFactors {
  projectCount: number;
  totalLines: number;
  recencyMonths: number;
  complexityScore: number;
}

class ProficiencyCalculator {
  calculate(skill: string, projects: Project[]): ProficiencyScore;
  classifyLevel(score: number): ProficiencyLevel;
  applyRecencyBonus(score: number, months: number): number;
}
```

**Proficiency Scoring Algorithm:**

```
baseScore = (projectCount * 25) + (totalLines / 1000) + complexityScore
recencyMultiplier =
  - if < 3 months: 1.2
  - if < 6 months: 1.1
  - if < 12 months: 1.0
  - if >= 12 months: 0.9
finalScore = min(baseScore * recencyMultiplier, 100)

Classification:
  - 0-30: beginner
  - 31-60: intermediate
  - 61-85: proficient
  - 86-100: expert
```

#### CompositeSkillMatcher

```typescript
interface CompositeRequirement {
  raw: string;
  options: string[];
  category: "essential" | "preferred" | "niceToHave";
}

class CompositeSkillMatcher {
  parseComposite(requirement: string): CompositeRequirement;
  matchesAny(userSkills: string[], options: string[]): string[];
  evaluateRequirement(requirement: string, userSkills: string[]): MatchResult;
}
```

**Parsing Logic:**

- Extract text within parentheses as options
- Split by commas or "or" keyword
- Trim and normalize each option
- Return base requirement + options array

#### LearningPathGenerator

```typescript
interface LearningPathItem {
  skill: string;
  category: "essential" | "preferred" | "niceToHave";
  estimatedHours: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites: string[];
  resources: LearningResource[];
  priority: number;
}

class LearningPathGenerator {
  generate(
    missingSkills: MissingSkills,
    presentSkills: string[]
  ): LearningPathItem[];
  orderByPrerequisites(items: LearningPathItem[]): LearningPathItem[];
  attachResources(skill: string): LearningResource[];
}
```

**Ordering Algorithm:**

1. Topological sort based on prerequisites
2. Within same prerequisite level, order by:
   - Category (essential > preferred > niceToHave)
   - Difficulty (beginner > intermediate > advanced)
   - Estimated hours (shorter first)

#### ProgressTracker

```typescript
interface ProgressMetrics {
  newSkills: string[];
  improvedSkills: Array<{
    skill: string;
    oldLevel: ProficiencyLevel;
    newLevel: ProficiencyLevel;
  }>;
  coverageChange: number;
  daysElapsed: number;
}

class ProgressTracker {
  calculateProgress(current: Analysis, previous: Analysis): ProgressMetrics;
  getSkillGrowthRate(userId: string): number;
  predictTimeToReady(analysis: Analysis): number;
}
```

## Data Models

### Database Schema

#### skill_analyses Table

```sql
CREATE TABLE skill_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  present_skills JSONB NOT NULL,
  missing_skills JSONB NOT NULL,
  coverage_percentage INTEGER NOT NULL,
  proficiency_data JSONB NOT NULL,
  learning_path JSONB,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_role CHECK (role IN ('frontend', 'backend', 'fullstack', 'devops')),
  CONSTRAINT valid_coverage CHECK (coverage_percentage >= 0 AND coverage_percentage <= 100)
);

CREATE INDEX idx_skill_analyses_user_role ON skill_analyses(user_id, role);
CREATE INDEX idx_skill_analyses_analyzed_at ON skill_analyses(analyzed_at DESC);
```

#### skill_synonyms Table (Static Data)

```sql
CREATE TABLE skill_synonyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL UNIQUE,
  synonyms TEXT[] NOT NULL,
  category TEXT,

  CONSTRAINT non_empty_synonyms CHECK (array_length(synonyms, 1) > 0)
);
```

#### learning_resources Table

```sql
CREATE TABLE learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  is_free BOOLEAN NOT NULL DEFAULT false,
  difficulty TEXT,
  estimated_hours INTEGER,
  rating DECIMAL(3,2),

  CONSTRAINT valid_type CHECK (type IN ('documentation', 'tutorial', 'course', 'video', 'book')),
  CONSTRAINT valid_difficulty CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))
);

CREATE INDEX idx_learning_resources_skill ON learning_resources(skill);
```

### TypeScript Interfaces

```typescript
// Enhanced from existing types/skills.ts

export type ProficiencyLevel =
  | "beginner"
  | "intermediate"
  | "proficient"
  | "expert";

export interface ProficiencyScore {
  skill: string;
  score: number; // 0-100
  level: ProficiencyLevel;
  projectCount: number;
  lastUsed: Date;
  recencyBonus: number;
}

export interface EnhancedSkillGapAnalysis extends SkillGapAnalysis {
  proficiencyScores: ProficiencyScore[];
  matchedCompositeSkills: Array<{
    requirement: string;
    matchedOptions: string[];
  }>;
  summary: {
    totalRequired: number;
    present: number;
    missing: number;
    readinessScore: number;
  };
}

export interface LearningResource {
  title: string;
  url: string;
  type: "documentation" | "tutorial" | "course" | "video" | "book";
  isFree: boolean;
  difficulty?: "beginner" | "intermediate" | "advanced";
  estimatedHours?: number;
  rating?: number;
}

export interface LearningPathItem {
  skill: string;
  category: "essential" | "preferred" | "niceToHave";
  estimatedHours: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites: string[];
  resources: LearningResource[];
  priority: number;
}

export interface AnalysisHistoryItem {
  id: string;
  role: Role;
  coveragePercentage: number;
  analyzedAt: Date;
  skillCount: number;
}

export interface ProgressMetrics {
  newSkills: string[];
  improvedSkills: Array<{
    skill: string;
    oldLevel: ProficiencyLevel;
    newLevel: ProficiencyLevel;
  }>;
  lostSkills: string[];
  coverageChange: number;
  daysElapsed: number;
  skillGrowthRate: number;
}
```

### Static Data Files

#### lib/data/skill-synonyms.json

```json
{
  "JavaScript": ["js", "javascript", "ecmascript"],
  "TypeScript": ["ts", "typescript"],
  "Node.js": ["node", "nodejs", "node.js"],
  "Kubernetes": ["k8s", "kubernetes"],
  "PostgreSQL": ["postgres", "postgresql", "psql"],
  "MongoDB": ["mongo", "mongodb"],
  "React": ["react", "reactjs", "react.js"],
  "Next.js": ["next", "nextjs", "next.js"],
  "Vue.js": ["vue", "vuejs", "vue.js"],
  "CI/CD": ["cicd", "ci/cd", "continuous integration", "continuous deployment"]
}
```

#### lib/data/skill-prerequisites.json

```json
{
  "React": ["JavaScript", "HTML", "CSS"],
  "Next.js": ["React", "JavaScript"],
  "TypeScript": ["JavaScript"],
  "Node.js": ["JavaScript"],
  "Express": ["Node.js", "JavaScript"],
  "Kubernetes": ["Docker", "Linux"],
  "Redux": ["React", "JavaScript"],
  "GraphQL": ["REST API"],
  "PostgreSQL": ["SQL"],
  "MongoDB": ["Databases (SQL/NoSQL)"]
}
```

#### lib/data/learning-resources.json

```json
{
  "React": [
    {
      "title": "React Official Documentation",
      "url": "https://react.dev",
      "type": "documentation",
      "isFree": true,
      "difficulty": "beginner",
      "estimatedHours": 20
    },
    {
      "title": "React - The Complete Guide",
      "url": "https://www.udemy.com/course/react-the-complete-guide",
      "type": "course",
      "isFree": false,
      "difficulty": "intermediate",
      "estimatedHours": 40,
      "rating": 4.6
    }
  ]
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Proficiency scores are bounded

_For any_ skill proficiency calculation, the resulting score must be between 0 and 100 inclusive.

**Validates: Requirements 2.6**

### Property 2: Recency bonus increases proficiency

_For any_ skill with usage within the last 6 months, the proficiency score with recency bonus must be greater than or equal to the base score without recency.

**Validates: Requirements 2.5**

### Property 3: Synonym normalization is idempotent

_For any_ skill name, normalizing it once and normalizing it twice must produce the same result (normalize(normalize(x)) = normalize(x)).

**Validates: Requirements 3.3, 3.5**

### Property 4: Case-insensitive matching

_For any_ two skill names that differ only in case, they must match as equivalent (match("react") = match("React") = match("REACT")).

**Validates: Requirements 3.4**

### Property 5: Composite requirement satisfaction

_For any_ composite requirement and user skill set, if the user has at least one skill from the requirement's options, then the requirement must be marked as satisfied.

**Validates: Requirements 3.1, 8.2**

### Property 6: Composite parsing extracts all options

_For any_ composite requirement string containing parentheses with comma or "or" separated options, parsing must extract all individual options.

**Validates: Requirements 8.1, 8.5**

### Property 7: Learning path prerequisite ordering

_For any_ learning path with skills A and B where A is a prerequisite of B, skill A must appear before skill B in the ordered path.

**Validates: Requirements 4.4**

### Property 8: Essential skills precede preferred skills

_For any_ learning path, all essential skills must appear before all preferred skills, and all preferred skills must appear before all nice-to-have skills.

**Validates: Requirements 4.5**

### Property 9: Learning path completeness

_For any_ learning path item, it must include all required fields: skill name, category, estimated hours, difficulty level, prerequisites list, and resources list.

**Validates: Requirements 4.2, 4.3**

### Property 10: Analysis persistence completeness

_For any_ stored skill analysis, it must include all required fields: role, present skills, missing skills, coverage percentage, proficiency data, and timestamp.

**Validates: Requirements 5.2**

### Property 11: History ordering by date

_For any_ set of skill analyses for a user, when retrieved as history, they must be ordered by analyzed_at timestamp in descending order (newest first).

**Validates: Requirements 5.3**

### Property 12: Coverage percentage validity

_For any_ skill gap analysis, the coverage percentage must be between 0 and 100 inclusive, and must equal (essential skills met / total essential skills) \* 100.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 13: New skills are set difference

_For any_ two analyses (current and previous), the new skills must equal the set of skills in current that are not in previous (current - previous).

**Validates: Requirements 6.2**

### Property 14: Coverage change is arithmetic difference

_For any_ two analyses (current and previous), the coverage change must equal current coverage percentage minus previous coverage percentage.

**Validates: Requirements 6.4**

### Property 15: Proficiency improvement detection

_For any_ skill present in both current and previous analyses, if the proficiency level increased, it must appear in the improved skills list.

**Validates: Requirements 6.3**

### Property 16: Stale analysis marking

_For any_ analysis with analyzed_at timestamp more than 30 days before the current date, it must be marked as stale.

**Validates: Requirements 5.5**

### Property 17: Resource availability guarantee

_For any_ missing skill in an analysis, the system must provide at least one learning resource (either curated or generated search link).

**Validates: Requirements 10.1, 10.4**

### Property 18: Free resource inclusion

_For any_ skill's learning resources, at least one resource must have isFree = true.

**Validates: Requirements 10.2**

### Property 19: Resource type validity

_For any_ learning resource, its type must be one of: 'documentation', 'tutorial', 'course', 'video', or 'book'.

**Validates: Requirements 10.3**

### Property 20: Resource ordering by priority

_For any_ skill's learning resources, official documentation must appear before other resource types, and resources must be ordered by rating (highest first) within each type.

**Validates: Requirements 10.5**

### Property 21: Successful analysis returns valid response

_For any_ successful skill gap analysis request, the response must have status code 200, include an analysis object, and include an ISO 8601 formatted timestamp.

**Validates: Requirements 1.5**

### Property 22: Composite match reporting completeness

_For any_ composite requirement where a user matches multiple options, all matched options must be included in the matchedOptions array.

**Validates: Requirements 8.4**

### Property 23: Matched composite skills display

_For any_ matched composite requirement, the response must include both the original requirement string and the specific options the user matched.

**Validates: Requirements 8.3**

### Property 24: Skill recency uses most recent date

_For any_ skill appearing in multiple projects, the recency calculation must use the most recent commit date among all projects containing that skill.

**Validates: Requirements 9.1**

## Error Handling

### Error Scenarios

1. **Authentication Failure**
   - Condition: No valid Supabase session
   - Response: 401 Unauthorized
   - Message: "Authentication required. Please log in."

2. **Invalid Role**
   - Condition: Role not in ['frontend', 'backend', 'fullstack', 'devops']
   - Response: 400 Bad Request
   - Message: "Invalid role. Must be one of: frontend, backend, fullstack, devops"

3. **No Projects Found**
   - Condition: User has no GitHub projects in database
   - Response: 200 OK with empty analysis
   - Message: "No projects found. Connect your GitHub account and sync projects."

4. **Database Error**
   - Condition: Supabase query fails
   - Response: 500 Internal Server Error
   - Message: "Failed to retrieve analysis. Please try again."
   - Log: Full error details for debugging

5. **Skill Extraction Timeout**
   - Condition: GitHub API or OpenAI takes too long
   - Response: 200 OK with partial results
   - Message: "Analysis completed with limited data. Some skills may be missing."

6. **Invalid Analysis ID**
   - Condition: Requesting history for non-existent analysis
   - Response: 404 Not Found
   - Message: "Analysis not found"

### Error Recovery Strategies

- **Graceful Degradation**: If OpenAI fails, fall back to language and dependency detection only
- **Partial Results**: Return what we have rather than failing completely
- **Retry Logic**: Retry failed GitHub API calls up to 3 times with exponential backoff
- **Timeout Handling**: Set reasonable timeouts (5s for GitHub, 8s for OpenAI) to prevent hanging
- **Cache Fallback**: If fresh analysis fails, return cached results if available

## Testing Strategy

### Unit Testing

**Core Logic Tests:**

- SkillNormalizer: Test synonym mapping, case handling, deduplication
- ProficiencyCalculator: Test scoring algorithm with various inputs
- CompositeSkillMatcher: Test parsing and matching logic
- LearningPathGenerator: Test ordering and prerequisite resolution
- ProgressTracker: Test metric calculations

**Edge Cases:**

- Empty project lists
- Skills with no synonyms
- Circular prerequisites
- Missing resource data
- Analyses with identical timestamps

**Example Unit Tests:**

```typescript
describe("SkillNormalizer", () => {
  it("normalizes Node.js variants to canonical form", () => {
    expect(normalizer.normalize("node")).toBe("Node.js");
    expect(normalizer.normalize("nodejs")).toBe("Node.js");
    expect(normalizer.normalize("Node.js")).toBe("Node.js");
  });

  it("handles case-insensitive matching", () => {
    expect(normalizer.normalize("REACT")).toBe("React");
    expect(normalizer.normalize("react")).toBe("React");
  });
});

describe("ProficiencyCalculator", () => {
  it("classifies 1 project as beginner", () => {
    const score = calculator.calculate("React", [mockProject]);
    expect(score.level).toBe("beginner");
  });

  it("applies recency bonus for recent usage", () => {
    const recentProject = { ...mockProject, lastCommit: new Date() };
    const score = calculator.calculate("React", [recentProject]);
    expect(score.recencyBonus).toBeGreaterThan(0);
  });
});
```

### Property-Based Testing

Property-based tests will verify universal properties across randomly generated inputs using a PBT library (Vitest with fast-check for TypeScript).

**Configuration:**

- Minimum 100 iterations per property test
- Use fast-check for random data generation
- Tag each test with the property it validates

**Key Property Tests:**

1. **Proficiency Bounds** (Property 1)
   - Generate random skill data
   - Verify score is always 0-100

2. **Normalization Idempotence** (Property 3)
   - Generate random skill names
   - Verify normalize(normalize(x)) = normalize(x)

3. **Prerequisite Ordering** (Property 7)
   - Generate random skill graphs with dependencies
   - Verify topological sort correctness

4. **Set Difference Correctness** (Property 13)
   - Generate random skill sets
   - Verify new skills = current - previous

5. **Coverage Calculation** (Property 12)
   - Generate random present/required skill combinations
   - Verify coverage = (met / total) \* 100

**Example Property Test:**

```typescript
import { fc } from "@fast-check/vitest";

describe("Property Tests", () => {
  it("proficiency scores are always bounded 0-100", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string(),
            languages: fc.dictionary(fc.string(), fc.nat()),
            lastCommit: fc.date(),
          })
        ),
        fc.string(),
        (projects, skill) => {
          const score = calculator.calculate(skill, projects);
          expect(score.score).toBeGreaterThanOrEqual(0);
          expect(score.score).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**API Route Tests:**

- Test full request/response cycle
- Verify authentication enforcement
- Test caching behavior
- Verify database persistence

**Database Tests:**

- Test CRUD operations on skill_analyses table
- Verify constraints and indexes
- Test concurrent access scenarios

**External Service Tests:**

- Mock GitHub API responses
- Mock OpenAI responses
- Test timeout handling
- Test rate limit handling

### End-to-End Testing

**User Flows:**

1. User logs in → Requests analysis → Views results → Checks history
2. User with no projects → Sees empty state → Adds projects → Re-analyzes
3. User analyzes multiple times → Views progress → Sees skill growth

**Performance Tests:**

- Analysis completes within 10 seconds for typical user (10-20 projects)
- History retrieval completes within 1 second
- Progress calculation completes within 2 seconds

## Implementation Notes

### Performance Considerations

1. **Parallel Processing**: Extract skills from all projects concurrently
2. **Caching Strategy**: Cache analysis results for 24 hours per user/role combination
3. **Database Indexing**: Index on (user_id, role) and (analyzed_at) for fast queries
4. **Lazy Loading**: Load learning resources only when needed
5. **Batch Operations**: Fetch all user projects in single query

### Security Considerations

1. **Row Level Security**: Enable RLS on skill_analyses table
2. **User Isolation**: Users can only access their own analyses
3. **Input Validation**: Validate role parameter against enum
4. **Rate Limiting**: Limit analysis requests to 10 per hour per user
5. **SQL Injection Prevention**: Use parameterized queries

### Scalability Considerations

1. **Horizontal Scaling**: Stateless API routes can scale independently
2. **Database Partitioning**: Partition skill_analyses by user_id if needed
3. **CDN Caching**: Cache static data files (synonyms, resources) on CDN
4. **Background Jobs**: Move heavy analysis to background queue for large portfolios
5. **Archive Strategy**: Archive analyses older than 1 year to cold storage

### Migration Strategy

1. **Phase 1**: Deploy new API routes alongside existing test endpoint
2. **Phase 2**: Update frontend to use new API
3. **Phase 3**: Migrate existing analysis data to new schema
4. **Phase 4**: Remove test endpoint
5. **Phase 5**: Enable progress tracking features

### Backward Compatibility

- Existing `SkillGapAnalysis` type extended, not replaced
- New fields are optional in API responses
- Frontend gracefully handles missing proficiency data
- Old analyses without proficiency scores show "N/A"
