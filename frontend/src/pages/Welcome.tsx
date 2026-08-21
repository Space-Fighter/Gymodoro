import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/welcome/Navbar";
import Hero from "@/components/welcome/Hero";
import TheProblem from "@/components/welcome/TheProblem";
import ActiveBreakCarousel from "@/components/welcome/ActiveBreakCarousel";
import TheLoop from "@/components/welcome/TheLoop";
import ThreePillars from "@/components/welcome/ThreePillars";
import Impact from "@/components/welcome/Impact";
import VideoDemo from "@/components/welcome/VideoDemo";
import Audience from "@/components/welcome/Audience";
import FinalCTA from "@/components/welcome/FinalCTA";
import Footer from "@/components/welcome/Footer";
import { WELCOME_BACKGROUND_URL, WELCOME_BACKGROUND_ALT } from "@/components/welcome/backgrounds";

export default function Welcome() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div id="top" className="relative isolate min-h-screen bg-background text-foreground flex flex-col selection:bg-emerald-500/30 selection:text-foreground">
      {/* Shared mountain background — fixed behind every section, with a
          gradient scrim so text stays legible and it blends into the
          Footer's plain background at the bottom. */}
      <img
        src={WELCOME_BACKGROUND_URL}
        alt={WELCOME_BACKGROUND_ALT}
        className="fixed inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-background/10 via-background/25 to-background/60" />

      <Navbar />
      <main className="flex-1">
        <Hero />
        <TheProblem />
        <ActiveBreakCarousel />
        <TheLoop />
        <ThreePillars />
        <Impact />
        <VideoDemo />
        <Audience />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}