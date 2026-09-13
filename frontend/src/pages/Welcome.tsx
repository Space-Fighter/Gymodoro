import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/welcome/Navbar";
import Footer from "@/components/welcome/Footer";
import WelcomeCards from "@/components/welcome/cards/WelcomeCards";
import { getBackgroundById } from "@/components/timer/backgrounds";

const MOUNTAIN_BACKGROUND = getBackgroundById("mountain-pass-718");

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
    <div
      id="top"
      className="relative isolate flex min-h-screen flex-col bg-black selection:bg-emerald-500/30"
    >
      {/* Mountain background — fixed behind the whole page, with a scrim for legibility */}
      <img
        src={MOUNTAIN_BACKGROUND.imageUrl}
        alt={MOUNTAIN_BACKGROUND.name}
        className="fixed inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />

      <Navbar />
      <main className="flex-1">
        <WelcomeCards />
      </main>
      <Footer />
    </div>
  );
}
