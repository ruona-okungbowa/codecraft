# Requirements Document

## Introduction

This specification defines improvements to the CodeCraft skill gap analysis feature. The current implementation provides basic skill detection and gap identification, but lacks depth in proficiency assessment, learning guidance, and persistence. This enhancement will transform the skill gap analysis into a comprehensive career development tool that tracks progress over time, provides actionable learning paths, and offers market-relevant insights.

## Glossary

- **System**: The CodeCraft skill gap analysis feature
- **User**: A developer using CodeCraft to assess their skills
- **Skill**: A technology, framework, tool, or programming language
- **Proficiency Level**: A measure of expertise in a skill (beginner, intermediate, proficient, expert)
- **Role Requirements**: The set of skills needed for a target developer role
- **Skill Gap**: The difference between a user's current skills and role requirements
- **Learning Path**: A recommended sequence of skills to learn with resources
- **Analysis**: A complete skill gap assessment for a specific role
- **GitHub Repository**: A user's code repository used for skill extraction

## Requirements

### Requirement 1: Production API Route

**User Story:** As a user, I want the skill gap analysis to work reliably in production, so that I can assess my skills against target roles.

#### Acceptance Criteria

1. WHEN a user requests skill gap analysis THEN the System SHALL authenticate the user via Supabase
2. WHEN a user is not authenticated THEN the System SHALL return a 401 status code with an error message
3. WHEN a user requests analysis for a valid role THEN the System SHALL fetch their GitHub projects from the database
4. WHEN a user has no projects THEN the System SHALL return an empty analysis with appropriate messaging
5. WHEN analysis completes successfully THEN the System SHALL return results with a 200 status code and ISO timestamp

### Requirement 2: Skill Proficiency Detection

**User Story:** As a user, I want to see my proficiency level for each skill, so that I can understand my strengths and areas for improvement.

#### Acceptance Criteria

1. WHEN the System analyzes a skill THEN the System SHALL calculate proficiency based on project count, code volume, and recency
2. WHEN a skill appears in 1 project THEN the System SHALL classify it as beginner level
3. WHEN a skill appears in 2-3 projects THEN the System SHALL classify it as intermediate level
4. WHEN a skill appears in 4+ projects THEN the System SHALL classify it as proficient level
5. WHEN a skill was used within the last 6 months THEN the System SHALL apply a recency bonus to proficiency
6. WHEN calculating proficiency THEN the System SHALL normalize scores to a 0-100 scale

### Requirement 3: Enhanced Skill Matching

**User Story:** As a user, I want accurate skill matching against role requirements, so that I get reliable gap analysis.

#### Acceptance Criteria

1. WHEN matching skills THEN the System SHALL handle composite requirements like "JavaScript Framework (React, Vue or Angular)"
2. WHEN a user has React THEN the System SHALL match it against "JavaScript Framework (React, Vue or Angular)"
3. WHEN matching skills THEN the System SHALL recognize common synonyms (Node vs Node.js, JS vs JavaScript)
4. WHEN matching skills THEN the System SHALL perform case-insensitive comparison
5. WHEN a skill has multiple names THEN the System SHALL match any valid variant

### Requirement 4: Learning Path Recommendations

**User Story:** As a user, I want personalized learning paths for missing skills, so that I know what to learn and in what order.

#### Acceptance Criteria

1. WHEN the System identifies missing skills THEN the System SHALL generate a learning path ordered by priority and prerequisites
2. WHEN generating a learning path THEN the System SHALL include estimated learning time for each skill
3. WHEN generating a learning path THEN the System SHALL classify difficulty as beginner, intermediate, or advanced
4. WHEN a skill has prerequisites THEN the System SHALL place prerequisites before dependent skills in the path
5. WHEN displaying learning paths THEN the System SHALL show essential skills before preferred skills

### Requirement 5: Analysis Persistence

**User Story:** As a user, I want my skill gap analyses saved, so that I can track my progress over time.

#### Acceptance Criteria

1. WHEN an analysis completes THEN the System SHALL store results in the database with a timestamp
2. WHEN storing analysis THEN the System SHALL include role, present skills, missing skills, coverage percentage, and proficiency data
3. WHEN a user requests analysis history THEN the System SHALL return all past analyses ordered by date
4. WHEN displaying analysis history THEN the System SHALL show coverage percentage trends over time
5. WHEN an analysis is older than 30 days THEN the System SHALL mark it as stale and suggest re-analysis

### Requirement 6: Progress Tracking

**User Story:** As a user, I want to see how my skills have improved over time, so that I can measure my career growth.

#### Acceptance Criteria

1. WHEN a user has multiple analyses THEN the System SHALL calculate skill growth between analyses
2. WHEN displaying progress THEN the System SHALL show newly acquired skills since last analysis
3. WHEN displaying progress THEN the System SHALL show proficiency improvements for existing skills
4. WHEN displaying progress THEN the System SHALL show coverage percentage change over time
5. WHEN a user has no previous analysis THEN the System SHALL display a message indicating this is their first analysis

### Requirement 7: Skill Synonym Normalization

**User Story:** As a developer, I want the system to recognize different names for the same technology, so that my skills are accurately counted.

#### Acceptance Criteria

1. WHEN the System encounters "Node" or "Node.js" or "NodeJS" THEN the System SHALL normalize to "Node.js"
2. WHEN the System encounters "JS" or "Javascript" THEN the System SHALL normalize to "JavaScript"
3. WHEN the System encounters "TS" or "Typescript" THEN the System SHALL normalize to "TypeScript"
4. WHEN the System encounters "K8s" or "k8s" THEN the System SHALL normalize to "Kubernetes"
5. WHEN normalizing skills THEN the System SHALL maintain a centralized synonym mapping

### Requirement 8: Composite Skill Parsing

**User Story:** As a user, I want composite requirements like "JavaScript Framework (React, Vue or Angular)" to be properly evaluated, so that my framework knowledge is recognized.

#### Acceptance Criteria

1. WHEN a requirement contains parentheses with options THEN the System SHALL extract individual skill options
2. WHEN a user has any skill from a composite requirement THEN the System SHALL mark that requirement as satisfied
3. WHEN displaying matched composite skills THEN the System SHALL show which specific option the user has
4. WHEN a user has multiple options from a composite requirement THEN the System SHALL list all matched options
5. WHEN parsing composite requirements THEN the System SHALL handle comma-separated and "or"-separated lists

### Requirement 9: Skill Recency Calculation

**User Story:** As a user, I want recent skills to be weighted more heavily, so that my current expertise is accurately reflected.

#### Acceptance Criteria

1. WHEN calculating skill recency THEN the System SHALL use the most recent commit date for projects containing that skill
2. WHEN a skill was used within 3 months THEN the System SHALL apply a 20% proficiency boost
3. WHEN a skill was used within 6 months THEN the System SHALL apply a 10% proficiency boost
4. WHEN a skill was not used in over 12 months THEN the System SHALL apply a 10% proficiency penalty
5. WHEN a project has no commit date THEN the System SHALL use the project creation date

### Requirement 10: Learning Resource Integration

**User Story:** As a user, I want curated learning resources for each missing skill, so that I can start learning immediately.

#### Acceptance Criteria

1. WHEN displaying missing skills THEN the System SHALL provide learning resource links for each skill
2. WHEN providing resources THEN the System SHALL include at least one free resource per skill
3. WHEN providing resources THEN the System SHALL categorize them as documentation, tutorial, course, or video
4. WHEN a skill has no curated resources THEN the System SHALL generate a search link to relevant learning platforms
5. WHEN displaying resources THEN the System SHALL prioritize official documentation and highly-rated courses
