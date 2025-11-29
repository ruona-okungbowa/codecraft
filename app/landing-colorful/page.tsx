/**
 * CodeCraft Landing Page - Colorful Version
 *
 * Vibrant, inclusive, growth-focused landing page
 */

"use client";

import { motion } from "framer-motion";
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
  Star,
} from "lucide-react";

export default function LandingColorful() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b-4 border-linear-to-r from-primary-400 via-joy-400 to-energy-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/icon-logo.png"
              alt="CodeCraft Logo"
              width={44}
              height={44}
              className="w-11 h-11"
            />
            <span className="font-heading text-2xl font-bold bg-linear-to-r from-primary-600 via-joy-600 to-energy-600 bg-clip-text text-transparent">
              CodeCraft
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-neutral-700 hover:text-primary-600 transition-colors font-semibold"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-neutral-700 hover:text-joy-600 transition-colors font-semibold"
            >
              How It Works
            </a>
            <Button variant="primary" size="md" className="shadow-primary">
              <Github size={18} />
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-linear-to-br from-primary-100 via-joy-100 to-energy-100">
        {/* Animated colorful blobs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-linear-to-br from-joy-400 to-coral-400 rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-linear-to-br from-growth-400 to-primary-400 rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-linear-to-br from-energy-400 to-joy-400 rounded-full blur-3xl opacity-25"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto relative z-10"
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              <motion.div variants={fadeInUp}>
                <Badge
                  variant="joy"
                  size="lg"
                  className="mb-6 shadow-xl border-2 border-joy-300"
                >
                  <Sparkles size={16} />
                  AI-Powered Career Growth
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="font-heading text-6xl md:text-7xl font-bold leading-[0.95] mb-6"
              >
                Turn Your GitHub Into{" "}
                <span className="relative inline-block">
                  <span className="bg-linear-to-r from-primary-600 via-joy-600 to-energy-600 bg-clip-text text-transparent">
                    Interview Gold
                  </span>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -right-8 -top-4"
                  >
                    <Sparkles className="text-energy-500" size={32} />
                  </motion.div>
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-neutral-700 leading-relaxed mb-8 max-w-xl font-medium"
              >
                Stop wondering if your portfolio is good enough. CodeCraft
                analyzes your repos, generates professional content, and shows
                you exactly what to build next.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-4 mb-8"
              >
                <Button
                  variant="primary"
                  size="xl"
                  className="shadow-2xl shadow-primary-400/50"
                >
                  <Github size={20} />
                  Start Free with GitHub
                </Button>
                <Button
                  variant="energy"
                  size="xl"
                  className="shadow-2xl shadow-energy-400/50"
                >
                  <Sparkles size={20} />
                  See Demo
                </Button>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-6 text-sm font-semibold"
              >
                <div className="flex items-center gap-2 text-growth-700">
                  <CheckCircle size={18} className="text-growth-500" />
                  Free forever
                </div>
                <div className="flex items-center gap-2 text-primary-700">
                  <CheckCircle size={18} className="text-primary-500" />
                  No credit card
                </div>
                <div className="flex items-center gap-2 text-energy-700">
                  <CheckCircle size={18} className="text-energy-500" />2 min
                  setup
                </div>
              </motion.div>
            </div>

            {/* Right: Visual */}
            <motion.div variants={growIn} className="relative">
              <Card
                variant="elevated"
                padding="lg"
                className="relative z-10 border-4 border-primary-300 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary-500 to-joy-500 flex items-center justify-center shadow-xl">
                    <Github size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Your Portfolio</h3>
                    <p className="text-sm text-neutral-600 font-medium">
                      Real-time analysis ✨
                    </p>
                  </div>
                </div>

                <ProgressBar
                  value={75}
                  variant="growth"
                  showLabel
                  label="Portfolio Score"
                  className="mb-5"
                />
                <ProgressBar
                  value={60}
                  variant="primary"
                  showLabel
                  label="Skills Coverage"
                  className="mb-5"
                />
                <ProgressBar
                  value={85}
                  variant="energy"
                  showLabel
                  label="Documentation Quality"
                  className="mb-6"
                />

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-4 bg-linear-to-br from-growth-200 to-growth-300 rounded-2xl border-3 border-growth-400 shadow-lg">
                    <div className="text-3xl font-bold text-growth-800">12</div>
                    <div className="text-xs text-growth-700 font-bold">
                      Projects
                    </div>
                  </div>
                  <div className="text-center p-4 bg-linear-to-br from-primary-200 to-primary-300 rounded-2xl border-3 border-primary-400 shadow-lg">
                    <div className="text-3xl font-bold text-primary-800">8</div>
                    <div className="text-xs text-primary-700 font-bold">
                      Skills
                    </div>
                  </div>
                  <div className="text-center p-4 bg-linear-to-br from-energy-200 to-energy-300 rounded-2xl border-3 border-energy-400 shadow-lg">
                    <div className="text-3xl font-bold text-energy-800">3</div>
                    <div className="text-xs text-energy-700 font-bold">
                      Gaps
                    </div>
                  </div>
                </div>
              </Card>

              {/* Floating colorful sparkles */}
              <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 z-20"
              >
                <Star className="text-joy-500 fill-joy-500" size={40} />
              </motion.div>
              <motion.div
                animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-4 -left-4 z-20"
              >
                <Star className="text-growth-500 fill-growth-500" size={32} />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white border-y-4 border-linear-to-r from-primary-300 via-joy-300 to-energy-300">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-neutral-600 font-semibold mb-8 text-lg">
            Trusted by developers from
          </p>
          <div className="flex flex-wrap justify-center items-center gap-16">
            <div className="text-3xl font-bold text-primary-400">Google</div>
            <div className="text-3xl font-bold text-joy-400">Meta</div>
            <div className="text-3xl font-bold text-growth-400">Amazon</div>
            <div className="text-3xl font-bold text-energy-400">Microsoft</div>
            <div className="text-3xl font-bold text-coral-400">Stripe</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-24 px-6 bg-linear-to-br from-growth-50 via-primary-50 to-joy-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="primary"
              size="lg"
              className="mb-6 shadow-lg border-2 border-primary-300"
            >
              <Zap size={16} />
              Features
            </Badge>
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
              Everything You Need to{" "}
              <span className="bg-linear-to-r from-growth-600 to-primary-600 bg-clip-text text-transparent">
                Stand Out
              </span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto font-medium">
              AI-powered tools that transform your GitHub from a code dump into
              a career-launching portfolio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<TrendingUp size={32} />}
              color="growth"
              title="Portfolio Scoring"
              description="Get a 0-100 score with actionable feedback on what to improve"
              badge="Most Popular"
            />
            <FeatureCard
              icon={<Sparkles size={32} />}
              color="primary"
              title="AI README Generator"
              description="Professional documentation written in seconds, not hours"
              badge="AI-Powered"
            />
            <FeatureCard
              icon={<MessageSquare size={32} />}
              color="energy"
              title="STAR Stories"
              description="Turn your projects into interview-ready behavioral stories"
            />
            <FeatureCard
              icon={<Target size={32} />}
              color="joy"
              title="Skill Gap Analysis"
              description="See exactly what skills you're missing for your dream role"
            />
            <FeatureCard
              icon={<Code size={32} />}
              color="primary"
              title="Project Recommendations"
              description="Get personalized project ideas that fill your skill gaps"
            />
            <FeatureCard
              icon={<Briefcase size={32} />}
              color="growth"
              title="Job Matching"
              description="Match your portfolio to job descriptions and see your fit score"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="growth"
              size="lg"
              className="mb-6 shadow-lg border-2 border-growth-300"
            >
              <TrendingUp size={16} />
              How It Works
            </Badge>
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
              From GitHub to Job Offer in{" "}
              <span className="bg-linear-to-r from-energy-600 to-coral-600 bg-clip-text text-transparent">
                3 Steps
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              step={1}
              title="Connect GitHub"
              description="Sign in with GitHub. We'll analyze your repos in under 2 minutes."
              icon={<Github size={36} />}
              color="primary"
            />
            <StepCard
              step={2}
              title="Get Insights"
              description="See your portfolio score, skill gaps, and personalized recommendations."
              icon={<Zap size={36} />}
              color="joy"
            />
            <StepCard
              step={3}
              title="Level Up"
              description="Generate READMEs, practice interviews, and build the right projects."
              icon={<TrendingUp size={36} />}
              color="growth"
            />
          </div>

          <div className="text-center mt-16">
            <Button
              variant="growth"
              size="xl"
              className="shadow-2xl shadow-growth-400/50"
            >
              Start Your Journey
              <ArrowRight size={20} />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-linear-to-br from-primary-600 via-joy-600 to-energy-600 text-white relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-heading text-5xl md:text-6xl font-bold mb-6">
            Ready to Transform Your GitHub?
          </h2>
          <p className="text-2xl mb-10 opacity-95 font-medium">
            Join thousands of developers who are landing better jobs with
            CodeCraft
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant="primary"
              size="xl"
              className="bg-white text-primary-600 hover:bg-neutral-100 shadow-2xl"
            >
              <Github size={20} />
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-3 border-white text-white hover:bg-white/20 shadow-2xl"
            >
              Watch Demo
            </Button>
          </div>
          <p className="text-sm mt-8 opacity-90 font-medium">
            No credit card required • Free forever • 2 minute setup
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-neutral-900 text-neutral-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/icon-logo.png"
                  alt="CodeCraft Logo"
                  width={36}
                  height={36}
                  className="w-9 h-9"
                />
                <span className="font-heading text-2xl font-bold text-white">
                  CodeCraft
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                Turn your GitHub into interview gold with AI-powered career
                tools.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-lg">Product</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-joy-400 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-growth-400 transition-colors"
                  >
                    Demo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-lg">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-joy-400 transition-colors">
                    Guides
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-growth-400 transition-colors"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-lg">Company</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-400 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-joy-400 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-growth-400 transition-colors"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center text-sm">
            <p>
              © 2024 CodeCraft. Built with{" "}
              <Heart
                className="inline text-coral-500 fill-coral-500"
                size={16}
              />{" "}
              for developers everywhere.
            </p>
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
    primary: {
      bg: "bg-linear-to-br from-primary-200 to-primary-300",
      text: "text-primary-700",
      border: "border-primary-400",
      badge: "primary" as const,
    },
    growth: {
      bg: "bg-linear-to-br from-growth-200 to-growth-300",
      text: "text-growth-700",
      border: "border-growth-400",
      badge: "growth" as const,
    },
    energy: {
      bg: "bg-linear-to-br from-energy-200 to-energy-300",
      text: "text-energy-700",
      border: "border-energy-400",
      badge: "energy" as const,
    },
    joy: {
      bg: "bg-linear-to-br from-joy-200 to-joy-300",
      text: "text-joy-700",
      border: "border-joy-400",
      badge: "joy" as const,
    },
  };

  const styles = colorClasses[color];

  return (
    <Card
      hoverable
      glowColor={color}
      padding="lg"
      className="border-3 border-neutral-200"
    >
      {badge && (
        <Badge variant={styles.badge} size="sm" className="mb-4 shadow-md">
          {badge}
        </Badge>
      )}
      <div
        className={`w-16 h-16 rounded-2xl ${styles.bg} ${styles.text} flex items-center justify-center mb-4 shadow-lg border-2 ${styles.border}`}
      >
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <p className="text-neutral-600 leading-relaxed font-medium">
        {description}
      </p>
    </Card>
  );
}

function StepCard({
  step,
  title,
  description,
  icon,
  color,
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "primary" | "joy" | "growth";
}) {
  const colorClasses = {
    primary: {
      badge: "bg-primary-500",
      icon: "bg-linear-to-br from-primary-200 to-primary-300 text-primary-700 border-primary-400",
    },
    joy: {
      badge: "bg-joy-500",
      icon: "bg-linear-to-br from-joy-200 to-joy-300 text-joy-700 border-joy-400",
    },
    growth: {
      badge: "bg-growth-500",
      icon: "bg-linear-to-br from-growth-200 to-growth-300 text-growth-700 border-growth-400",
    },
  };

  const styles = colorClasses[color];

  return (
    <Card
      variant="elevated"
      padding="lg"
      className="text-center relative border-3 border-neutral-200"
    >
      <div
        className={`absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full ${styles.badge} text-white flex items-center justify-center font-bold text-lg shadow-xl`}
      >
        {step}
      </div>
      <div
        className={`w-20 h-20 rounded-2xl ${styles.icon} flex items-center justify-center mx-auto mb-4 mt-6 shadow-lg border-3`}
      >
        {icon}
      </div>
      <h3 className="font-bold text-2xl mb-3">{title}</h3>
      <p className="text-neutral-600 leading-relaxed font-medium text-lg">
        {description}
      </p>
    </Card>
  );
}
