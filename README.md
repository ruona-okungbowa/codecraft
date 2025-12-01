# 🚀 CodeCraft

> Transform your GitHub repositories into interview-ready portfolio materials with AI-powered career tools

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-purple?style=flat-square&logo=openai)](https://openai.com/)

## 📋 Overview

CodeCraft is an AI-powered career readiness platform designed for developers preparing for job interviews. It analyzes your GitHub repositories, generates professional content, identifies skill gaps, and provides personalized career guidance.

### 🎯 Target Users

- **New graduates** entering the job market
- **Career switchers** transitioning into tech
- **Developers** preparing for interviews
- **Anyone** looking to showcase their GitHub projects professionally

## ✨ Features

### 🎨 Portfolio Analysis

- **Portfolio Scoring**: Get a 0-100 score based on project quality, documentation, and technical depth
- **Detailed Breakdown**: See strengths and weaknesses across multiple dimensions
- **Actionable Insights**: Receive specific recommendations for improvement

### 🤖 AI Content Generation

- **STAR Stories**: Generate behavioral interview stories from your projects
- **Resume Bullets**: Create compelling, achievement-focused resume points
- **Professional READMEs**: Auto-generate comprehensive project documentation
- **Portfolio Sites**: Build downloadable portfolio websites

### 📊 Career Guidance

- **Skill Gap Analysis**: Identify missing skills for target roles (Frontend, Backend, Full-stack, DevOps)
- **Project Recommendations**: Get personalized project ideas to fill skill gaps
- **Learning Paths**: Receive curated resources and roadmaps

### 🎤 Interview Preparation

- **Mock Interviews**: Practice with AI-powered interview simulator
- **Real-time Feedback**: Get instant feedback on your answers
- **Question Bank**: Access role-specific technical and behavioral questions

### 💼 Job Matching

- **Smart Matching**: Compare your portfolio against job descriptions
- **Match Percentage**: See how well you fit each role
- **Gap Identification**: Understand what skills you need to develop

## 🛠️ Tech Stack

### Core

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router (React Server Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Runtime**: Node.js 20+

### Styling

- **CSS Framework**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Fonts**: Google Fonts (Newsreader, Sansation)

### Backend & Database

- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth with GitHub OAuth
- **Storage**: Supabase Storage for generated content

### AI & APIs

- **AI Model**: [OpenAI GPT-4o-mini](https://openai.com/)
- **GitHub API**: [Octokit v5](https://github.com/octokit/octokit.js)

### Code Quality

- **Linting**: ESLint 9 with Next.js config
- **Formatting**: Prettier (double quotes, 2 spaces, semicolons)
- **Testing**: Vitest with React Testing Library

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and npm
- **Supabase Account** for database and authentication
- **OpenAI API Key** for AI features
- **GitHub OAuth App** for authentication

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ruona-okungbowa/codecraft.git
   cd codecraft
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # GitHub OAuth
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up Supabase database**

   Run the SQL migrations in your Supabase project (found in `/supabase/migrations`)

5. **Configure GitHub OAuth**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL to: `http://localhost:3000/api/auth/callback`
   - Copy Client ID and Client Secret to `.env.local`

6. **Run the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start dev server on localhost:3000

# Building
npm run build            # Production build
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run format:check     # Check formatting

# Testing
npm test                 # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:ui          # Open Vitest UI
```

## 📁 Project Structure

```
codecraft/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (serverless functions)
│   ├── dashboard/         # Dashboard page
│   ├── projects/          # Projects listing
│   ├── skill-gap/         # Skill gap analysis
│   ├── project-recommendations/  # Project recommendations
│   ├── mock-interview/    # Interview simulator
│   └── job-match/         # Job matching
├── components/            # React components
├── lib/                   # Utility functions and clients
│   ├── analysis/         # Skill extraction, gap analysis
│   ├── auth/             # Auth provider components
│   ├── github/           # GitHub API client
│   ├── openai/           # OpenAI client, prompts, caching
│   ├── scoring/          # Portfolio scoring logic
│   └── supabase/         # Supabase clients
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## 🔐 Authentication Flow

1. User clicks "Sign in with GitHub"
2. Redirected to GitHub OAuth
3. GitHub redirects back with authorization code
4. Backend exchanges code for access token
5. User profile created/updated in Supabase
6. Session established with Supabase Auth

## 🎨 Key Features Implementation

### Portfolio Scoring Algorithm

- **Project Quality** (30%): Code organization, best practices
- **Documentation** (25%): README quality, comments
- **Technical Depth** (25%): Complexity, technologies used
- **Activity** (20%): Commit frequency, maintenance

### AI Content Generation

- Uses OpenAI GPT-4o-mini with custom prompts
- Implements 24-hour caching to reduce API costs
- Includes retry logic for rate limit handling
- Request queuing to stay within API limits

### Skill Gap Analysis

- Compares user's tech stack against role requirements
- Categorizes skills: Essential, Preferred, Nice-to-have
- Calculates coverage percentage
- Provides actionable recommendations

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Ensure all environment variables from `.env.local` are added to your deployment platform.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

- **Author**: Ruona Okungbowa
- **GitHub**: [@ruona-okungbowa](https://github.com/ruona-okungbowa)
- **Project Link**: [https://github.com/ruona-okungbowa/codecraft](https://github.com/ruona-okungbowa/codecraft)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [OpenAI](https://openai.com/)
- Database by [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)

---
