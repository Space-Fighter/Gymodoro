import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/welcome/Navbar";
import Footer from "@/components/welcome/Footer";
import StoryWelcome from "@/components/welcome/story/StoryWelcome";
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
    <div
      id="top"
      className="welcome-daylight relative isolate flex min-h-screen flex-col selection:bg-emerald-500/30"
    >
      {/* Brand — scrolls away with the page (the Navbar takes over when it does). */}
      <a
        href="#top"
        className="absolute left-4 top-2 z-30 flex items-center gap-1 text-white drop-shadow"
        aria-label="Gymodoro Home"
      >
        <img src={logo} alt="Gymodoro" className="h-24 w-24 object-contain" />
        <span className="font-poppins text-xl font-extrabold tracking-wide">GYMODORO</span>
      </a>

      <Navbar />
      <main className="flex-1">
        <StoryWelcome />
      </main>
      <Footer />
    </div>
  );
}
