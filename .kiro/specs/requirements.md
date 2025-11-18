# PortfolioAI - Requirements Document

## Introduction

PortfolioAI is an AI-powered career readiness platform that helps CS graduates and bootcamp grads transform their GitHub projects into interview-ready portfolio stories. The platform analyzes existing projects, generates professional narratives, identifies skill gaps, recommends new projects to build, and provides mock interview practice.

**Target Users:** Fresh CS graduates, bootcamp grads, and self-taught developers entering their first software engineering role.

**Core Value Proposition:** Turn GitHub projects into job offers by improving presentation, filling skill gaps, and preparing for interviews.

---

## Glossary

- **Portfolio Score**: A 0-100 metric measuring the strength of a user's GitHub portfolio based on project quality, tech diversity, documentation, and consistency
- **STAR Format**: Situation, Task, Action, Result - a structured way to tell project stories in interviews
- **Skill Gap**: A technology or concept required for target jobs but missing from the user's current portfolio
- **Project Recommendation**: A suggested project to build that fills identified skill gaps
- **Mock Interview**: An AI-powered practice session where users explain their projects and receive feedback
- **Job Match Score**: A percentage indicating how well a user's portfolio aligns with a specific job description

---

## Requirements

### Requirement 1: GitHub Portfolio Analysis

**User Story:** As a new grad, I want to connect my GitHub account and see an analysis of my projects, so that I understand my current portfolio strength.

#### Acceptance Criteria

1. WHEN a user connects their GitHub account via OAuth THEN the system SHALL fetch all public repositories owned by the user
2. WHEN repositories are fetched THEN the system SHALL analyze each repository for programming languages, frameworks, file structure, commit history, and README quality
3. WHEN analysis is complete THEN the system SHALL display a portfolio score (0-100) with breakdown by category (project quality, tech diversity, documentation, consistency)
4. WHEN displaying the portfolio score THEN the system SHALL provide actionable feedback for each category showing how to improve
5. WHEN a user has no repositories THEN the system SHALL display an empty state with guidance on getting started

---

### Requirement 2: Project Story Generation

**User Story:** As a new grad, I want to generate professional interview stories from my projects, so that I can confidently explain my work in interviews.

#### Acceptance Criteria

1. WHEN a user selects a project THEN the system SHALL analyze the codebase to extract technologies used, complexity indicators, and key features
2. WHEN analysis is complete THEN the system SHALL generate a STAR format story (Situation, Task, Action, Result) describing the project
3. WHEN generating stories THEN the system SHALL include quantified achievements where possible (e.g., "serving 100+ users", "reduced load time by 40%")
4. WHEN displaying the story THEN the system SHALL provide interview talking points highlighting technical decisions and challenges overcome
5. WHEN a user requests regeneration THEN the system SHALL create an alternative story with different emphasis

---

### Requirement 3: Resume Bullet Point Generation

**User Story:** As a new grad, I want to generate professional resume bullet points from my projects, so that my resume stands out to recruiters.

#### Acceptance Criteria

1. WHEN a user selects a project for resume generation THEN the system SHALL analyze the project's technical complexity and features
2. WHEN generating bullet points THEN the system SHALL use action verbs and quantified achievements following professional resume standards
3. WHEN displaying bullet points THEN the system SHALL provide 3-5 variations with different emphasis (technical depth, impact, collaboration)
4. WHEN a bullet point exceeds 150 characters THEN the system SHALL provide a warning and suggest a shorter version
5. WHEN exporting bullet points THEN the system SHALL format them for easy copy-paste into resume documents

---

### Requirement 4: Skill Gap Analysis

**User Story:** As a new grad, I want to see what skills I'm missing for my target role, so that I know what to learn next.

#### Acceptance Criteria

1. WHEN a user selects a target role (Frontend, Backend, Full-Stack, DevOps) THEN the system SHALL retrieve industry-standard skill requirements for that role
2. WHEN comparing portfolio to requirements THEN the system SHALL identify present skills and missing skills
3. WHEN displaying gaps THEN the system SHALL categorize them as essential, preferred, or nice-to-have based on job market data
4. WHEN showing skill coverage THEN the system SHALL visualize the percentage of requirements met with a progress indicator
5. WHEN a user has no skill gaps THEN the system SHALL suggest advanced skills to differentiate themselves

---

### Requirement 5: Project Recommendations

**User Story:** As a new grad, I want personalized project suggestions based on my skill gaps, so that I know what to build next to get hired.

#### Acceptance Criteria

1. WHEN skill gaps are identified THEN the system SHALL generate 3-5 project recommendations prioritized by number of gaps filled
2. WHEN displaying a project recommendation THEN the system SHALL include project description, tech stack, difficulty level, time estimate, and learning resources
3. WHEN a user views project details THEN the system SHALL show a week-by-week learning path with milestones
4. WHEN displaying recommendations THEN the system SHALL explain why each project is valuable for the user's target role
5. WHEN a user completes a recommended project THEN the system SHALL update their skill coverage and portfolio score

---

### Requirement 6: Mock Interview Simulator

**User Story:** As a new grad, I want to practice explaining my projects to an AI interviewer, so that I feel confident in real interviews.

#### Acceptance Criteria

1. WHEN a user starts a mock interview THEN the system SHALL select a project and generate relevant interview questions
2. WHEN the AI asks a question THEN the system SHALL wait for the user's text response with a reasonable timeout
3. WHEN a user submits an answer THEN the system SHALL analyze the response for completeness, technical accuracy, and communication clarity
4. WHEN providing feedback THEN the system SHALL highlight strengths and suggest specific improvements with examples
5. WHEN an interview session ends THEN the system SHALL provide an overall performance summary with scores for technical depth and communication

---

### Requirement 7: Job Match Scoring

**User Story:** As a new grad, I want to see how well my portfolio matches specific job postings, so that I can tailor my applications effectively.

#### Acceptance Criteria

1. WHEN a user pastes a job description THEN the system SHALL extract required skills, preferred skills, and responsibilities using natural language processing
2. WHEN comparing portfolio to job requirements THEN the system SHALL calculate a match percentage (0-100%)
3. WHEN displaying match results THEN the system SHALL show which requirements are met, which are missing, and which projects demonstrate relevant skills
4. WHEN the match score is below 70% THEN the system SHALL suggest which projects to highlight and which skills to emphasize
5. WHEN a user saves a job match THEN the system SHALL store it for future reference and tracking

---

### Requirement 8: README Generation

**User Story:** As a new grad, I want to generate professional README files for my projects, so that my GitHub profile looks polished.

#### Acceptance Criteria

1. WHEN a user selects a project for README generation THEN the system SHALL analyze the codebase to understand its purpose and features
2. WHEN generating a README THEN the system SHALL include sections for overview, features, tech stack, installation, usage, and roadmap
3. WHEN displaying the README THEN the system SHALL format it in proper Markdown with badges, code blocks, and structure
4. WHEN a user approves the README THEN the system SHALL provide instructions for adding it to the GitHub repository
5. WHEN a project already has a README THEN the system SHALL offer to enhance it rather than replace it

---

### Requirement 9: Portfolio Dashboard

**User Story:** As a new grad, I want a visual dashboard showing my portfolio progress, so that I can track my improvement over time.

#### Acceptance Criteria

1. WHEN a user views the dashboard THEN the system SHALL display portfolio score, skill coverage, projects analyzed, and recommendations completed
2. WHEN displaying skill coverage THEN the system SHALL show a visual breakdown by category (languages, frameworks, concepts) with progress bars
3. WHEN showing project quality THEN the system SHALL rank projects by complexity score and highlight top performers
4. WHEN a user's portfolio improves THEN the system SHALL show a trend graph of portfolio score over time
5. WHEN displaying the dashboard THEN the system SHALL provide quick actions for next steps (analyze new project, start mock interview, view recommendations)

---

### Requirement 10: Export and Sharing

**User Story:** As a new grad, I want to export my generated content in various formats, so that I can use it across different platforms.

#### Acceptance Criteria

1. WHEN a user requests export THEN the system SHALL offer formats including PDF (performance review), plain text (resume bullets), and Markdown (README)
2. WHEN exporting to PDF THEN the system SHALL generate a professionally formatted document with branding and proper typography
3. WHEN exporting resume bullets THEN the system SHALL format them for easy copy-paste into resume builders
4. WHEN exporting LinkedIn content THEN the system SHALL format it according to LinkedIn's character limits and best practices
5. WHEN a user shares their portfolio score THEN the system SHALL generate a shareable image suitable for social media

---

## Non-Functional Requirements

### Performance

- Portfolio analysis SHALL complete within 30 seconds for repositories with up to 100 files
- AI-generated content (stories, bullets, READMEs) SHALL be produced within 10 seconds
- Dashboard SHALL load within 2 seconds on standard broadband connections

### Usability

- The system SHALL be accessible via keyboard navigation for all core features
- The system SHALL provide loading indicators for all asynchronous operations
- The system SHALL display error messages in plain language with suggested actions

### Security

- GitHub OAuth tokens SHALL be stored securely and never exposed to the client
- API keys for AI services SHALL be stored as environment variables
- User data SHALL be stored with appropriate access controls

### Scalability

- The system SHALL handle up to 1000 concurrent users during the hackathon demo period
- The system SHALL cache GitHub API responses to minimize rate limit issues
- The system SHALL queue AI generation requests to manage API costs

---

## Success Metrics

### Hackathon Success

- Complete demo video showcasing all core features
- Comprehensive Kiro usage documentation (specs, hooks, steering, MCP, vibe coding)
- Public GitHub repository with .kiro directory included
- Submission to Frankenstein and Best Startup Project categories

### User Success

- Users can generate interview-ready content in under 5 minutes
- Portfolio scores improve by average of 20 points after following recommendations
- Users report increased confidence in interviews (qualitative feedback)

### Technical Success

- 90%+ uptime during judging period
- <5% error rate on AI generation requests
- Successful integration of 4+ external APIs (GitHub, OpenAI, job boards)
