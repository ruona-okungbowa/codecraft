/**
 * Design System Demo Page
 *
 * Showcases all CodeCraft design system components
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Button,
  Card,
  Badge,
  ProgressBar,
  EmptyState,
  Mascot,
  MascotWithMessage,
  Input,
  Toast,
} from "@/components/design-system";
import { staggerContainer, fadeInUp } from "@/lib/design-system/animations";
import { Search, Github, Sparkles } from "lucide-react";

export default function DesignSystemDemo() {
  const [showToast, setShowToast] = useState(false);
  const [progress, setProgress] = useState(65);

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 via-primary-50 to-growth-50 py-12 px-4">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-16"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center">
          <h1 className="font-heading text-6xl font-bold text-neutral-900 mb-4">
            CodeCraft Design System
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            A vibrant, inclusive design system that empowers developers to grow
            their careers
          </p>
        </motion.div>

        {/* Colors */}
        <motion.section variants={fadeInUp}>
          <h2 className="font-heading text-4xl font-bold text-neutral-900 mb-6">
            Colors
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <ColorSwatch name="Primary" color="bg-primary-500" />
            <ColorSwatch name="Growth" color="bg-growth-500" />
            <ColorSwatch name="Energy" color="bg-energy-500" />
            <ColorSwatch name="Joy" color="bg-joy-500" />
            <ColorSwatch name="Coral" color="bg-coral-500" />
          </div>
        </motion.section>

        {/* Buttons */}
        <motion.section variants={fadeInUp}>
          <h2 className="font-heading text-4xl font-bold text-neutral-900 mb-6">
            Buttons
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="lg">
              Primary
            </Button>
            <Button variant="secondary" size="lg">
              Secondary
            </Button>
            <Button variant="growth" size="lg">
              Growth
            </Button>
            <Button variant="energy" size="lg">
              Energy
            </Button>
            <Button variant="outline" size="lg">
              Outline
            </Button>
            <Button variant="ghost" size="lg">
              Ghost
            </Button>
            <Button variant="primary" size="lg" isLoading>
              Loading
            </Button>
          </div>
        </motion.section>

        {/* Cards */}
        <motion.section variants={fadeInUp}>
          <h2 className="font-heading text-4xl font-bold text-neutral-900 mb-6">
            Cards
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card hoverable glowColor="primary">
              <h3 className="font-semibold text-xl mb-2">Default Card</h3>
              <p className="text-neutral-600">
                Hover me to see the lift effect
              </p>
            </Card>
            <Card variant="elevated" hoverable glowColor="growth">
              <h3 className="font-semibold text-xl mb-2">Elevated Card</h3>
              <p className="text-neutral-600">With stronger shadow</p>
            </Card>
            <Card variant="outlined" hoverable glowColor="energy">
              <h3 className="font-semibold text-xl mb-2">Outlined Card</h3>
              <p className="text-neutral-600">Transparent background</p>
            </Card>
          </div>
        </motion.section>

        {/* Badges */}
        <motion.section variants={fadeInUp}>
          <h2 className="font-heading text-4xl font-bold text-neutral-900 mb-6">
            Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="primary" dot>
              Primary
            </Badge>
            <Badge variant="growth" dot>
              Success
            </Badge>
            <Badge variant="energy" dot>
              Warning
            </Badge>
            <Badge variant="joy" dot>
              New!
            </Badge>
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="outline" size="lg">
              Outline
            </Badge>
          </div>
        </motion.section>

        {/* Progress Bars */}
        <motion.section variants={fadeInUp}>
          <h2 className="font-heading text-4xl font-bold text-neutral-900 mb-6">
            Progress Bars
          </h2>
          <div className="space-y-6 max-w-2xl">
            <ProgressBar
              value={progress}
              variant="growth"
              showLabel
              label="Portfolio Score"
            />
            <ProgressBar
              value={45}
              variant="primary"
              showLabel
              label="Skills"
            />
            <ProgressBar
              value={80}
              variant="energy"
              showLabel
              label="Projects"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setProgress(Math.max(0, progress - 10))}
              >
                -10
              </Button>
              <Button
                size="sm"
                onClick={() => setProgress(Math.min(100, progress + 10))}
              >
                +10
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Mascot */}
        <motion.section variants={fadeInUp}>
          <h2 className="font-heading text-4xl font-bold text-neutral-900 mb-6">
            Mascot
          </h2>
          <div className="flex flex-wrap gap-8 items-end">
            <Mascot mood="happy" size="sm" />
            <Mascot mood="excited" size="md" />
            <Mascot mood="celebrating" size="lg" />
            <Mascot
              mood="encouraging"
              size="lg"
              message="You're doing great!"
              showSpeechBubble
            />
          </div>
          <div className="mt-8 max-w-2xl">
            <MascotWithMessage mood="thinking">
              <p className="font-medium">
                Did you know? Adding detailed READMEs to your projects can
                increase your portfolio score by up to 20 points!
              </p>
            </MascotWithMessage>
          </div>
        </motion.section>

        {/* Input */}
        <motion.section variants={fadeInUp}>
          <h2 className="font-heading text-4xl font-bold text-neutral-900 mb-6">
            Inputs
          </h2>
          <div className="space-y-4 max-w-md">
            <Input
              label="Project Name"
              placeholder="Enter project name"
              helperText="Choose a memorable name"
            />
            <Input
              label="Search"
              placeholder="Search projects..."
              leftIcon={<Search size={18} />}
            />
            <Input
              label="GitHub URL"
              placeholder="https://github.com/..."
              leftIcon={<Github size={18} />}
              error="Please enter a valid GitHub URL"
            />
          </div>
        </motion.section>

        {/* Empty State */}
        <motion.section variants={fadeInUp}>
          <h2 className="font-heading text-4xl font-bold text-neutral-900 mb-6">
            Empty States
          </h2>
          <Card>
            <EmptyState
              illustration="plant"
              title="No projects yet"
              description="Connect your GitHub account to start growing your portfolio and unlock personalized insights."
              actionLabel="Connect GitHub"
              onAction={() => alert("Connecting...")}
              secondaryActionLabel="Learn More"
              onSecondaryAction={() => alert("Learning...")}
            />
          </Card>
        </motion.section>

        {/* Toast */}
        <motion.section variants={fadeInUp}>
          <h2 className="font-heading text-4xl font-bold text-neutral-900 mb-6">
            Toast Notifications
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="growth"
              onClick={() => setShowToast(true)}
              leftIcon={<Sparkles size={18} />}
            >
              Show Toast
            </Button>
          </div>
        </motion.section>
      </motion.div>

      {/* Toast Component */}
      <Toast
        variant="success"
        title="Design System Loaded!"
        message="All components are ready to use in your CodeCraft app"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

function ColorSwatch({ name, color }: { name: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`${color} h-24 rounded-2xl shadow-lg mb-2`} />
      <p className="text-sm font-medium text-neutral-700">{name}</p>
    </div>
  );
}
