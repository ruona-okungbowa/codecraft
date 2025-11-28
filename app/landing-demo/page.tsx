/**
 * CodeCraft Landing Page Demo
 *
 * High-converting landing page with modern design principles
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Button,
  Card,
  Badge,
  ProgressBar,
  Mascot,
  MascotWithMessage,
} from "@/components/design-system";
import {
  fadeInUp,
  staggerContainer,
  growIn,
} from "@/lib/design-system/animations";
import {
  Github,
  Sparkles,
  Target,
  TrendingUp,
  FileText,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Zap,
  Heart,
  Code,
  Briefcase,
} from "lucide-react";

export default function LandingDemo() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/icon-logo.png"
              alt="CodeCraft Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="font-heading text-2xl font-bold bg-linear-to-r from-primary-600 via-joy-600 to-energy-600 bg-clip-text text-transparent">
              CodeCraft
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-neutral-600 hover:text-primary-600 transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-neutral-600 hover:text-primary-600 transition-colors font-medium"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-neutral-600 hover:text-primary-600 transition-colors font-medium"
            >
              Pricing
            </a>
            <Button variant="primary" size="sm">
              <Github size={16} />
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Colorful background */}
        <div className="absolute inset-0 bg-linear-to-br from-primary-100 via-joy-50 to-energy-100 opacity-60" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-joy-300 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-growth-300 rounded-full blur-3xl opacity-20" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-energy-300 rounded-full blur-3xl opacity-20" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto relative z-10"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <motion.div variants={fadeInUp}>
                <Badge variant="joy" size="lg" className="mb-6 shadow-lg">
                  <Sparkles size={14} />
                  AI-Powered Career Growth
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="font-heading text-6xl md:text-7xl font-bold leading-tight mb-6"
              >
                Turn Your GitHub Into{" "}
                <span className="bg-linear-to-r from-primary-600 via-joy-600 to-energy-600 bg-clip-text text-transparent">
                  Interview Gold
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-neutral-600 leading-relaxed mb-8 max-w-xl"
              >
                Stop wondering if your portfolio is good enough. CodeCraft
                analyzes your repos, generates professional content, and shows
                you exactly what to build next.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-4 mb-8"
              >
                <Button variant="primary" size="xl">
                  <Github size={20} />
                  Start Free with GitHub
                </Button>
                <Button variant="outline" size="xl">
                  <Sparkles size={20} />
                  See Demo
                </Button>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-6 text-sm text-neutral-600"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-growth-500" />
                  Free forever
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-growth-500" />
                  No credit card
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-growth-500" />2 min
                  setup
                </div>
              </motion.div>
            </div>

            {/* Right: Visual */}
            <motion.div variants={growIn} className="relative">
              <Card
                variant="elevated"
                padding="lg"
                className="relative z-10 border-2 border-primary-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary-400 to-joy-400 flex items-center justify-center shadow-lg">
                    <Github size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Your Portfolio</h3>
                    <p className="text-sm text-neutral-600">
                      Real-time analysis
                    </p>
                  </div>
                </div>

                <ProgressBar
                  value={75}
                  variant="growth"
                  showLabel
                  label="Portfolio Score"
                  className="mb-4"
                />
                <ProgressBar
                  value={60}
                  variant="primary"
                  showLabel
                  label="Skills Coverage"
                  className="mb-4"
                />
                <ProgressBar
                  value={85}
                  variant="energy"
                  showLabel
                  label="Documentation Quality"
                  className="mb-6"
                />

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-4 bg-linear-to-br from-growth-100 to-growth-200 rounded-xl border-2 border-growth-300">
                    <div className="text-2xl font-bold text-growth-700">12</div>
                    <div className="text-xs text-neutral-600 font-medium">
                      Projects
                    </div>
                  </div>
                  <div className="text-center p-4 bg-linear-to-br from-primary-100 to-primary-200 rounded-xl border-2 border-primary-300">
                    <div className="text-2xl font-bold text-primary-700">8</div>
                    <div className="text-xs text-neutral-600 font-medium">
                      Skills
                    </div>
                  </div>
                  <div className="text-center p-4 bg-linear-to-br from-energy-100 to-energy-200 rounded-xl border-2 border-energy-300">
                    <div className="text-2xl font-bold text-energy-700">3</div>
                    <div className="text-xs text-neutral-600 font-medium">
                      Gaps
                    </div>
                  </div>
                </div>
              </Card>

              {/* Floating colorful elements */}
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-8 -right-8 z-0"
              >
                <div className="w-32 h-32 rounded-full bg-linear-to-br from-joy-300 to-joy-500 opacity-40 blur-2xl" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-8 -left-8 z-0"
              >
                <div className="w-40 h-40 rounded-full bg-linear-to-br from-growth-300 to-growth-500 opacity-40 blur-2xl" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute top-1/2 -right-12 z-0"
              >
                <div className="w-24 h-24 rounded-full bg-linear-to-br from-energy-300 to-coral-400 opacity-40 blur-2xl" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-linear-to-r from-primary-50 via-joy-50 to-energy-50 border-y border-primary-200">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-neutral-600 mb-8">
            Trusted by developers from
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            <div className="text-2xl font-bold text-neutral-400">Google</div>
            <div className="text-2xl font-bold text-neutral-400">Meta</div>
            <div className="text-2xl font-bold text-neutral-400">Amazon</div>
            <div className="text-2xl font-bold text-neutral-400">Microsoft</div>
            <div className="text-2xl font-bold text-neutral-400">Stripe</div>
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-20 px-6 bg-linear-to-br from-coral-50 via-energy-50 to-joy-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="energy" size="lg" className="mb-4 shadow-md">
              The Problem
            </Badge>
            <h2 className="font-heading text-5xl font-bold text-neutral-900 mb-6">
              Your GitHub Isn&apos;t Speaking for You
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              You&apos;ve built amazing projects, but recruiters see messy
              repos, missing READMEs, and no clear story. You&apos;re losing
              opportunities before the interview even starts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card padding="lg" className="text-center">
              <div className="w-16 h-16 rounded-full bg-error-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={28} className="text-error-600" />
              </div>
              <h3 className="font-semibold text-xl mb-3">
                Can&apos;t Explain Projects
              </h3>
              <p className="text-neutral-600">
                &quot;Just check out my repos&quot; doesn&apos;t land you
                interviews
              </p>
            </Card>

            <Card padding="lg" className="text-center">
              <div className="w-16 h-16 rounded-full bg-error-100 flex items-center justify-center mx-auto mb-4">
                <Target size={28} className="text-error-600" />
              </div>
              <h3 className="font-semibold text-xl mb-3">
                Don&apos;t Know What to Build
              </h3>
              <p className="text-neutral-600">
                Building random projects that don&apos;t fill skill gaps
              </p>
            </Card>

            <Card padding="lg" className="text-center">
              <div className="w-16 h-16 rounded-full bg-error-100 flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-error-600" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Weak Documentation</h3>
              <p className="text-neutral-600">
                Empty READMEs make your best work look amateur
              </p>
            </Card>
          </div>

          <div className="max-w-2xl mx-auto">
            <MascotWithMessage mood="encouraging">
              <p className="font-medium">
                <strong>Here&apos;s the truth:</strong> Your code is probably
                great. But if you can&apos;t communicate its value, you&apos;re
                invisible to recruiters. Let&apos;s fix that.
              </p>
            </MascotWithMessage>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="primary" size="lg" className="mb-4">
              Features
            </Badge>
            <h2 className="font-heading text-5xl font-bold text-neutral-900 mb-6">
              Everything You Need to Stand Out
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              AI-powered tools that transform your GitHub from a code dump into
              a career-launching portfolio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<TrendingUp size={28} />}
              color="growth"
              title="Portfolio Scoring"
              description="Get a 0-100 score with actionable feedback on what to improve"
              badge="Most Popular"
            />
            <FeatureCard
              icon={<Sparkles size={28} />}
              color="primary"
              title="AI README Generator"
              description="Professional documentation written in seconds, not hours"
              badge="AI-Powered"
            />
            <FeatureCard
              icon={<MessageSquare size={28} />}
              color="energy"
              title="STAR Stories"
              description="Turn your projects into interview-ready behavioral stories"
            />
            <FeatureCard
              icon={<Target size={28} />}
              color="joy"
              title="Skill Gap Analysis"
              description="See exactly what skills you're missing for your dream role"
            />
            <FeatureCard
              icon={<Code size={28} />}
              color="primary"
              title="Project Recommendations"
              description="Get personalized project ideas that fill your skill gaps"
            />
            <FeatureCard
              icon={<Briefcase size={28} />}
              color="growth"
              title="Job Matching"
              description="Match your portfolio to job descriptions and see your fit score"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 px-6 bg-linear-to-br from-growth-50 to-primary-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="growth" size="lg" className="mb-4">
              How It Works
            </Badge>
            <h2 className="font-heading text-5xl font-bold text-neutral-900 mb-6">
              From GitHub to Job Offer in 3 Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              step={1}
              title="Connect GitHub"
              description="Sign in with GitHub. We'll analyze your repos in under 2 minutes."
              icon={<Github size={32} />}
            />
            <StepCard
              step={2}
              title="Get Insights"
              description="See your portfolio score, skill gaps, and personalized recommendations."
              icon={<Zap size={32} />}
            />
            <StepCard
              step={3}
              title="Level Up"
              description="Generate READMEs, practice interviews, and build the right projects."
              icon={<TrendingUp size={32} />}
            />
          </div>

          <div className="text-center mt-12">
            <Button variant="growth" size="xl">
              Start Your Journey
              <ArrowRight size={20} />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="joy" size="lg" className="mb-4">
              <Heart size={14} />
              Loved by Developers
            </Badge>
            <h2 className="font-heading text-5xl font-bold text-neutral-900 mb-6">
              Real Results from Real Developers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="CodeCraft helped me identify gaps I didn't even know I had. Landed 3 interviews in 2 weeks!"
              author="Sarah Chen"
              role="Frontend Developer"
              company="Hired at Stripe"
            />
            <TestimonialCard
              quote="The AI-generated READMEs are incredible. Saved me hours and made my projects look so much more professional."
              author="Marcus Johnson"
              role="Full Stack Developer"
              company="Hired at Meta"
            />
            <TestimonialCard
              quote="Finally, a tool that gets it. As a woman in tech, I love how inclusive and encouraging CodeCraft feels."
              author="Priya Patel"
              role="Software Engineer"
              company="Hired at Google"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-linear-to-br from-primary-500 to-joy-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-5xl md:text-6xl font-bold mb-6">
            Ready to Transform Your GitHub?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers who are landing better jobs with
            CodeCraft
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant="primary"
              size="xl"
              className="bg-white text-primary-600 hover:bg-neutral-100"
            >
              <Github size={20} />
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-white text-white hover:bg-white/10"
            >
              Watch Demo
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-75">
            No credit card required • Free forever • 2 minute setup
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-neutral-900 text-neutral-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mascot mood="happy" size="sm" />
                <span className="font-heading text-xl font-bold text-white">
                  CodeCraft
                </span>
              </div>
              <p className="text-sm">
                Turn your GitHub into interview gold with AI-powered career
                tools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Demo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Guides
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center text-sm">
            <p>© 2024 CodeCraft. Built with ❤️ for developers everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Components
function FeatureCard({
  icon,
  color,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode;
  color: "primary" | "growth" | "energy" | "joy";
  title: string;
  description: string;
  badge?: string;
}) {
  const colorClasses = {
    primary: "bg-primary-100 text-primary-600",
    growth: "bg-growth-100 text-growth-600",
    energy: "bg-energy-100 text-energy-600",
    joy: "bg-joy-100 text-joy-600",
  };

  return (
    <Card hoverable glowColor={color} padding="lg">
      {badge && (
        <Badge variant={color} size="sm" className="mb-4">
          {badge}
        </Badge>
      )}
      <div
        className={`w-14 h-14 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-4`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-xl mb-3">{title}</h3>
      <p className="text-neutral-600 leading-relaxed">{description}</p>
    </Card>
  );
}

function StepCard({
  step,
  title,
  description,
  icon,
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card variant="elevated" padding="lg" className="text-center relative">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-growth-500 text-white flex items-center justify-center font-bold">
        {step}
      </div>
      <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4 mt-4">
        {icon}
      </div>
      <h3 className="font-semibold text-xl mb-3">{title}</h3>
      <p className="text-neutral-600 leading-relaxed">{description}</p>
    </Card>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  company,
}: {
  quote: string;
  author: string;
  role: string;
  company: string;
}) {
  return (
    <Card padding="lg" className="relative">
      <div className="text-4xl text-primary-200 mb-4">&quot;</div>
      <p className="text-neutral-700 mb-6 leading-relaxed">{quote}</p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary-400 to-joy-400" />
        <div>
          <div className="font-semibold text-neutral-900">{author}</div>
          <div className="text-sm text-neutral-600">
            {role} • {company}
          </div>
        </div>
      </div>
    </Card>
  );
}
