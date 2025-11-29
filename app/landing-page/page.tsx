"use client";

import ModernNavbar from "@/components/ModernNavbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AboutSection from "@/components/AboutSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: "#f6f7f8" }} className="min-h-screen">
      <ModernNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AboutSection />
      <CTASection />
      <Footer />
    </div>
  );
}
