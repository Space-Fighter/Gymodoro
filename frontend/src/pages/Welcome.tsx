import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/welcome/Navbar";
import Footer from "@/components/welcome/Footer";
import StoryWelcome from "@/components/welcome/story/StoryWelcome";

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
      <Navbar />
      <main className="flex-1">
        <StoryWelcome />
      </main>
      <Footer />
    </div>
  );
}
