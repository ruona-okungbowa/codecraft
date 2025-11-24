"use client";

import { Box } from "@mui/material";
import ModernNavbar from "@/components/ModernNavbar";
import HeroSection from "@/components/HeroSection";
import SeparatorSection from "@/components/SeparatorSection";
import FeaturesSection from "@/components/FeaturesSection";
import WhySection from "@/components/WhySection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <Box sx={{ bgcolor: "#ffffff", minHeight: "100vh" }}>
      <ModernNavbar />

      <HeroSection />

      <SeparatorSection />

      <FeaturesSection />

      <WhySection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </Box>
  );
}
