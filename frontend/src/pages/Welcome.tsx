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
import logo from "@/assets/gymodoro-logo.png";

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

      {/* Brand — sits above the Hero section in normal page flow, so it
          scrolls away with the page instead of staying pinned like the
          fixed navbar. */}
      <a
        href="#top"
        className="absolute -top-[71px] left-[calc(50vw-532px)] z-30 flex flex-col items-center gap-0 text-foreground"
        aria-label="Gymodoro Home"
      >
        <img src={logo} alt="Gymodoro" className="w-[270px] h-[270px] object-contain" />
        <span className="font-extrabold tracking-wide text-xl font-poppins -mt-[68px]">
          GYMODORO
        </span>
      </a>

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