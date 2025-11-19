# GitStory

**Transform your GitHub projects into interview-ready portfolio stories with AI**

GitStory is an AI-powered career readiness platform that analyzes your code repositories, generates professional narratives, identifies skill gaps, recommends projects, and provides mock interview practice.

## Features

- 🔐 **GitHub OAuth Integration** - Seamlessly connect your GitHub account
- 📊 **Portfolio Scoring** - Get a comprehensive 0-100 score for your portfolio
- 📝 **STAR Story Generation** - AI-generated interview stories in STAR format
- 💼 **Resume Bullets** - Professional resume bullet points from your projects
- 🎯 **Skill Gap Analysis** - Identify missing skills for your target role
- 🚀 **Project Recommendations** - Personalized project suggestions to fill gaps
- 🎤 **Mock Interviews** - Practice with AI-powered interview simulator
- 🎯 **Job Matching** - Match your portfolio to job descriptions
- 📄 **README Generation** - Professional README files for your projects

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend:** Vercel Serverless Functions
- **Database:** Supabase (PostgreSQL + Auth)
- **AI:** OpenAI GPT-4
- **APIs:** GitHub REST API (Octokit)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- GitHub account
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/gitstory.git
cd gitstory
```

2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

See `.env.example` for required environment variables:

- `GITHUB_CLIENT_ID` - GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth app client secret
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `OPENAI_API_KEY` - Your OpenAI API key

## Project Structure

```
gitstory/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Auth pages
│   ├── (dashboard)/       # Dashboard pages
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── features/         # Feature-specific components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client
│   ├── openai/           # OpenAI client
│   └── github/           # GitHub API client
├── types/                 # TypeScript type definitions
└── .kiro/                # Kiro spec files
    └── specs/
        ├── requirements.md
        ├── design.md
        └── tasks.md
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

## Built with Kiro

This project was built using [Kiro](https://kiro.dev), an AI-powered IDE that accelerates development through:

- **Spec-Driven Development** - Structured requirements, design, and task planning
- **Vibe Coding** - Natural language code generation
- **Agent Hooks** - Automated testing and quality checks
- **Steering Docs** - Consistent AI output across the project
- **MCP Integration** - Extended capabilities for API interactions

See `.kiro/specs/` for the complete specification documents.

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Acknowledgments

- Built for the Kiro Hackathon 2024
- Powered by OpenAI GPT-4
- GitHub API integration via Octokit
- Database and auth by Supabase

---

**Made with ❤️ using Kiro**
