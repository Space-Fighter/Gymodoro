import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/welcome/Navbar";
import Hero from "@/components/welcome/Hero";
import TheProblem from "@/components/welcome/TheProblem";
import ActiveBreakCarousel from "@/components/welcome/ActiveBreakCarousel";
import TheLoop from "@/components/welcome/TheLoop";
import ThreePillars from "@/components/welcome/ThreePillars";
import VoiceAI from "@/components/welcome/VoiceAI";
import FinalCTA from "@/components/welcome/FinalCTA";
import Footer from "@/components/welcome/Footer";

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
    <div id="top" className="min-h-screen bg-background text-foreground flex flex-col selection:bg-emerald-500/30 selection:text-foreground">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TheProblem />
        <ActiveBreakCarousel />
        <TheLoop />
        <ThreePillars />
        <VoiceAI />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}