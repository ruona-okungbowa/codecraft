"use client";

import HeroSection from "@/components/landing/HeroSection";
import InteractiveFeatureCard from "@/components/landing/InteractiveFeatureCard";
import AnimatedStatsCard from "@/components/landing/AnimatedStatsCard";
import FloatingActionButton from "@/components/landing/FloatingActionButton";
import ScrollProgress from "@/components/landing/ScrollProgress";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button, Card, Badge } from "@/components/design-system";
import { fadeInUp, staggerContainer } from "@/lib/design-system/animations";
import {
  TrendingUp,
  Sparkles,
  MessageSquare,
  Target,
  Code,
  Briefcase,
  Github,
  ArrowRight,
  Heart,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <ScrollProgress />
      <FloatingActionButton />

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
            <a
              href="#testimonials"
              className="text-neutral-700 hover:text-growth-600 transition-colors font-semibold"
            >
              Success Stories
            </a>
            <Button variant="primary" size="md" className="shadow-primary">
              <Github size={18} />
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Social Proof */}
      <section className="py-16 bg-white border-y-4 border-linear-to-r from-primary-300 via-joy-300 to-energy-300">
        <div className="max-w-7xl mx-auto px-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-neutral-600 font-semibold mb-8 text-lg"
          >
            Trusted by developers from
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center items-center gap-16"
          >
            <CompanyLogo name="Google" color="primary" />
            <CompanyLogo name="Meta" color="joy" />
            <CompanyLogo name="Amazon" color="growth" />
            <CompanyLogo name="Microsoft" color="energy" />
            <CompanyLogo name="Stripe" color="coral" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-linear-to-br from-primary-50 via-joy-50 to-energy-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Developers Love CodeCraft
            </h2>
            <p className="text-xl text-neutral-600">
              Real results from real developers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            <AnimatedStatsCard
              value={10000}
              suffix="+"
              label="Active Users"
              color="primary"
            />
            <AnimatedStatsCard
              value={50000}
              suffix="+"
              label="READMEs Generated"
              color="growth"
            />
            <AnimatedStatsCard
              value={85}
              suffix="%"
              label="Got Interviews"
              color="energy"
            />
            <AnimatedStatsCard
              value={4.9}
              suffix="/5"
              label="User Rating"
              color="joy"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge
                variant="primary"
                size="lg"
                className="mb-6 shadow-lg border-2 border-primary-300"
              >
                <Zap size={16} />
                Features
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="font-heading text-5xl md:text-6xl font-bold text-neutral-900 mb-6"
            >
              Everything You Need to{" "}
              <span className="bg-linear-to-r from-growth-600 to-primary-600 bg-clip-text text-transparent">
                Stand Out
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-neutral-600 max-w-3xl mx-auto font-medium"
            >
              AI-powered tools that transform your GitHub from a code dump into
              a career-launching portfolio
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InteractiveFeatureCard
              icon={<TrendingUp size={32} />}
              color="growth"
              title="Portfolio Scoring"
              description="Get a 0-100 score with actionable feedback on what to improve"
              badge="Most Popular"
            />
            <InteractiveFeatureCard
              icon={<Sparkles size={32} />}
              color="primary"
              title="AI README Generator"
              description="Professional documentation written in seconds, not hours"
              badge="AI-Powered"
            />
            <InteractiveFeatureCard
              icon={<MessageSquare size={32} />}
              color="energy"
              title="STAR Stories"
              description="Turn your projects into interview-ready behavioral stories"
            />
            <InteractiveFeatureCard
              icon={<Target size={32} />}
              color="joy"
              title="Skill Gap Analysis"
              description="See exactly what skills you're missing for your dream role"
            />
            <InteractiveFeatureCard
              icon={<Code size={32} />}
              color="primary"
              title="Project Recommendations"
              description="Get personalized project ideas that fill your skill gaps"
            />
            <InteractiveFeatureCard
              icon={<Briefcase size={32} />}
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
        className="py-24 px-6 bg-linear-to-br from-growth-50 via-primary-50 to-joy-50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
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
          </motion.div>

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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Button
              variant="growth"
              size="xl"
              className="shadow-2xl shadow-growth-400/50"
            >
              Start Your Journey
              <ArrowRight size={20} />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge
              variant="joy"
              size="lg"
              className="mb-6 shadow-lg border-2 border-joy-300"
            >
              <Heart size={16} />
              Loved by Developers
            </Badge>
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
              Real Results from Real Developers
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="CodeCraft helped me identify gaps I didn't even know I had. Landed 3 interviews in 2 weeks!"
              author="Sarah Chen"
              role="Frontend Developer"
              company="Hired at Stripe"
              color="primary"
            />
            <TestimonialCard
              quote="The AI-generated READMEs are incredible. Saved me hours and made my projects look so much more professional."
              author="Marcus Johnson"
              role="Full Stack Developer"
              company="Hired at Meta"
              color="growth"
            />
            <TestimonialCard
              quote="Finally, a tool that gets it. As a woman in tech, I love how inclusive and encouraging CodeCraft feels."
              author="Priya Patel"
              role="Software Engineer"
              company="Hired at Google"
              color="joy"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-5xl md:text-6xl font-bold mb-6"
          >
            Ready to Transform Your GitHub?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl mb-10 opacity-95 font-medium"
          >
            Join thousands of developers who are landing better jobs with
            CodeCraft
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4 justify-center"
          >
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
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-sm mt-8 opacity-90 font-medium"
          >
            No credit card required • Free forever • 2 minute setup
          </motion.p>
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
function CompanyLogo({
  name,
  color,
}: {
  name: string;
  color: "primary" | "joy" | "growth" | "energy" | "coral";
}) {
  const colorClasses = {
    primary: "text-primary-400",
    joy: "text-joy-400",
    growth: "text-growth-400",
    energy: "text-energy-400",
    coral: "text-coral-400",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1, y: -5 }}
      className={`text-3xl font-bold ${colorClasses[color]} cursor-pointer`}
    >
      {name}
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: step * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card
        variant="elevated"
        padding="lg"
        className="text-center relative border-3 border-neutral-200 h-full"
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
    </motion.div>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  company,
  color,
}: {
  quote: string;
  author: string;
  role: string;
  company: string;
  color: "primary" | "growth" | "joy";
}) {
  const colorClasses = {
    primary: "from-primary-400 to-joy-400",
    growth: "from-growth-400 to-primary-400",
    joy: "from-joy-400 to-coral-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <Card
        padding="lg"
        className="relative h-full border-2 border-neutral-200"
      >
        <div className="text-5xl text-primary-200 mb-4">&quot;</div>
        <p className="text-neutral-700 mb-6 leading-relaxed font-medium">
          {quote}
        </p>
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full bg-linear-to-br ${colorClasses[color]} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
          >
            {author.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-neutral-900">{author}</div>
            <div className="text-sm text-neutral-600">
              {role} • {company}
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <CheckCircle2 className="text-growth-500 fill-growth-100" size={24} />
        </div>
      </Card>
    </motion.div>
  );
}
