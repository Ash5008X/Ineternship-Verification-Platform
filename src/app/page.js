import AnimatedBackground from "@/components/landing/AnimatedBackground";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import VerificationSection from "@/components/landing/VerificationSection";
import MatchingSection from "@/components/landing/MatchingSection";
import ExperienceSection from "@/components/landing/ExperienceSection";
import EasyApplySection from "@/components/landing/EasyApplySection";
import ApplicationTimeline from "@/components/landing/ApplicationTimeline";
import RecruiterSection from "@/components/landing/RecruiterSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "InternCheck — Discover, Verify & Apply for Legitimate Internships",
  description:
    "Discover verified internships, inspect risk signals, compare your CV skills, and apply with confidence.",
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-text antialiased font-ui overflow-x-hidden selection:bg-rose selection:text-white">
      {/* 1. Animated background with moving orbs and perspective grid (passes behind navbar) */}
      <AnimatedBackground />

      {/* 2. Floating liquid-glass navbar */}
      <Navbar />

      {/* 3. Main content sections */}
      <main className="relative z-10">
        <Hero />
        <ProblemSection />
        <VerificationSection />
        <MatchingSection />
        <ExperienceSection />
        <EasyApplySection />
        <ApplicationTimeline />
        <RecruiterSection />
        <FinalCTA />
      </main>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}
