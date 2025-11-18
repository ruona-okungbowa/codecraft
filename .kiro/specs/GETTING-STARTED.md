# PortfolioAI - Getting Started Guide

## 🎯 Kiroween Hackathon Checklist

Before you start coding, make sure you have:

- [ ] Registered for Kiroween at https://kiroween.devpost.com/
- [ ] Kiro Pro+ access (provided during hackathon)
- [ ] GitHub account for OAuth integration
- [ ] OpenAI API key (for AI features)
- [ ] 18 days blocked out (Dec 5 deadline)

---

## 📋 Step 1: Use Kiro Spec-Driven Development

You're already doing this! I've created `requirements.md` for you.

### Next Steps with Kiro:

1. **Review the requirements** - Read through requirements.md
2. **Ask Kiro to create design.md** - Say: "Create the design document for PortfolioAI"
3. **Ask Kiro to create tasks.md** - Say: "Create the implementation tasks for PortfolioAI"
4. **Start executing tasks** - Kiro will help you implement each task

### Why Spec-Driven Development?

- ✅ Judges want to see this (Implementation criteria)
- ✅ Keeps you organized over 18 days
- ✅ Shows strategic use of Kiro
- ✅ Makes it easy to track progress

---

## 🛠️ Step 2: Project Setup

### Initialize Your Project

```bash
# Create project directory
mkdir portfolioai
cd portfolioai

# Initialize git
git init

# Create Next.js app with TypeScript
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

# Install dependencies
npm install @supabase/supabase-js openai octokit
npm install -D @types/node

# Create .env.local
touch .env.local
```

### Environment Variables (.env.local)

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/callback

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Supabase (optional for user data)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Project Structure

```
portfolioai/
├── .kiro/                    # ⚠️ IMPORTANT: Don't gitignore this!
│   ├── specs/
│   │   └── portfolioai/
│   │       ├── requirements.md  ✅ Done
│   │       ├── design.md        ⏳ Next
│   │       └── tasks.md         ⏳ After design
│   ├── hooks/                # Agent hooks (auto-testing, etc.)
│   └── steering/             # Steering docs (AI tone, standards)
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/            # Main dashboard
│   ├── projects/             # Project analysis
│   └── api/                  # API routes
├── components/               # React components
├── lib/                      # Utilities
│   ├── github.ts             # GitHub API client
│   ├── openai.ts             # OpenAI client
│   └── analysis.ts           # Portfolio analysis logic
└── public/                   # Static assets
```

---

## 🎨 Step 3: Kiro Usage Strategy (For Judging)

The judges will evaluate "how well you used Kiro". Here's your strategy:

### 1. Spec-Driven Development ✅

**What:** Use Kiro to create requirements → design → tasks
**How:** You're doing this now!
**Documentation:** Include screenshots of spec files in your writeup

### 2. Vibe Coding

**What:** Use Kiro's conversational coding to build features quickly
**How:**

- "Build the GitHub OAuth flow"
- "Create a component for displaying portfolio score"
- "Implement the STAR story generator"
  **Documentation:** Save chat logs showing Kiro generating code

### 3. Agent Hooks

**What:** Automate workflows with Kiro hooks
**Examples:**

- Hook on file save: Auto-run tests
- Hook on commit: Update documentation
- Hook on API change: Regenerate types
  **Documentation:** Show .kiro/hooks/ directory with your hooks

### 4. Steering Docs

**What:** Guide Kiro's behavior with custom rules
**Examples:**

- `.kiro/steering/ai-tone.md` - Rules for professional, encouraging AI responses
- `.kiro/steering/code-standards.md` - TypeScript best practices
- `.kiro/steering/resume-writing.md` - Resume bullet point guidelines
  **Documentation:** Show steering docs and their impact

### 5. MCP (Model Context Protocol)

**What:** Extend Kiro with custom tools
**Examples:**

- Custom MCP server for GitHub API with caching
- MCP tool for job board API integration
- MCP tool for portfolio scoring algorithm
  **Documentation:** Show .kiro/settings/mcp.json and custom servers

---

## 📅 Step 4: 18-Day Execution Plan

### Week 1: Foundation (Days 1-6)

**Goal:** Core features working

- **Day 1 (TODAY):**
  - ✅ Requirements done
  - ⏳ Ask Kiro: "Create design.md for PortfolioAI"
  - ⏳ Ask Kiro: "Create tasks.md for PortfolioAI"
  - Setup project structure
- **Day 2:** GitHub OAuth + repo fetching
- **Day 3-4:** Portfolio analysis + scoring
- **Day 5-6:** STAR story generation + resume bullets

**Checkpoint:** Can analyze a GitHub profile and generate content

### Week 2: Differentiators (Days 7-12)

**Goal:** Features that make you win

- **Day 7-8:** Skill gap analysis + project recommendations
- **Day 9-10:** Mock interview simulator
- **Day 11-12:** Job match scoring + dashboard

**Checkpoint:** All core features working

### Week 3: Polish & Ship (Days 13-18)

**Goal:** Demo-ready submission

- **Day 13-14:** UI polish + animations
- **Day 15:** Record demo video (3 min)
- **Day 16:** Documentation + Kiro writeup
- **Day 17:** Pitch deck + blog post
- **Day 18:** Submit to Devpost

---

## 🎬 Step 5: Demo Video Requirements

Per hackathon rules, your video must:

- ✅ Be less than 3 minutes
- ✅ Show the project functioning
- ✅ Be uploaded to YouTube/Vimeo
- ✅ Not include copyrighted music (use royalty-free)

### Suggested Demo Flow:

**0:00-0:20** - Hook: "You have 5 projects. Zero interviews. Why?"
**0:20-0:40** - Problem: Can't explain projects, don't know what to build
**0:40-1:40** - Solution: Show all features working
**1:40-2:00** - Impact: User testimonial, before/after
**2:00-2:30** - Kiro usage: Show specs, hooks, steering
**2:30-2:45** - Business model: Freemium + B2B
**2:45-3:00** - CTA: "Start at PortfolioAI.dev"

---

## 📝 Step 6: Kiro Usage Writeup (Required)

You must document how you used Kiro. Create this as you build:

### Template:

```markdown
# How Kiro Accelerated PortfolioAI Development

## Spec-Driven Development

We used Kiro's spec workflow to plan before coding:

- requirements.md: 10 user stories, 50+ acceptance criteria
- design.md: Complete architecture, API design, Kiro strategy
- tasks.md: 60+ implementation tasks with dependencies

**Impact:** Saved 10+ hours of refactoring by planning upfront

## Vibe Coding

We used conversational coding for rapid prototyping:

- Generated GitHub OAuth flow in 5 minutes
- Created portfolio scoring algorithm through iteration
- Built 20+ React components with Kiro assistance

**Most Impressive:** [Describe your best Kiro-generated code]

## Agent Hooks

We automated our workflow with hooks:

- `.kiro/hooks/test-on-save.json` - Auto-run tests on file save
- `.kiro/hooks/update-docs.json` - Regenerate API docs on changes

**Impact:** Caught 15+ bugs before committing

## Steering Docs

We guided Kiro's behavior with custom rules:

- `.kiro/steering/ai-tone.md` - Professional, encouraging tone
- `.kiro/steering/resume-standards.md` - Resume writing best practices

**Impact:** Consistent, high-quality AI-generated content

## MCP Integration

We extended Kiro with custom tools:

- Custom GitHub API integration with caching
- Job board API connector

**Impact:** Reduced API calls by 80%, saved costs
```

---

## ✅ Step 7: Submission Checklist

Before submitting on Day 18:

### Code Repository

- [ ] Public GitHub repo
- [ ] `.kiro` directory included (NOT in .gitignore!)
- [ ] Open source license (MIT recommended)
- [ ] README.md with installation instructions
- [ ] All code committed and pushed

### Demo Video

- [ ] 3 minutes or less
- [ ] Uploaded to YouTube/Vimeo
- [ ] Shows project functioning
- [ ] Includes Kiro usage showcase

### Devpost Submission

- [ ] Project description
- [ ] Demo video link
- [ ] GitHub repo link
- [ ] Category: Frankenstein + Best Startup Project
- [ ] Kiro usage writeup (detailed)
- [ ] Screenshots

### Bonus Prizes

- [ ] Blog post on dev.to with #kiro tag ($100)
- [ ] Social media post with #hookedonkiro and @kirodotdev ($100)

---

## 🚀 Next Steps (RIGHT NOW)

1. **Ask Kiro to create design.md:**
   - Say: "Create the design document for PortfolioAI based on the requirements"
2. **Ask Kiro to create tasks.md:**

   - Say: "Create the implementation tasks for PortfolioAI"

3. **Setup your project:**

   - Run the commands in Step 2
   - Get your API keys ready

4. **Start Day 2 tomorrow:**
   - Begin with GitHub OAuth implementation
   - Use Kiro to help you code

---

## 💡 Pro Tips

### Time Management

- Work 5-6 hours/day minimum
- Take breaks (avoid burnout)
- If behind schedule, cut features (not quality)

### Kiro Usage

- Document as you go (don't wait until Day 18)
- Take screenshots of impressive Kiro generations
- Save chat logs showing Kiro helping you

### Demo Video

- Record when features work perfectly (don't do live demo)
- Practice your script 5+ times
- Get feedback from friends

### Judging

- Judges value: Problem → Solution → Impact
- Show, don't tell (demo beats slides)
- Be ready for questions about Kiro usage

---

## 🆘 Need Help?

- **Kiro Issues:** Check https://kiro.dev/docs/
- **Hackathon Rules:** https://kiroween.devpost.com/rules
- **Questions:** Ask me! I'm here to help you win.

---

## 🎉 You're Ready!

You have:

- ✅ A validated idea (PortfolioAI)
- ✅ Complete requirements (requirements.md)
- ✅ 18-day plan
- ✅ Kiro usage strategy
- ✅ This guide

**Next:** Ask me to create design.md and let's start building!
