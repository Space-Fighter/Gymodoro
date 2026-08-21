import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/gymodoro-logo.png";
import ModeToggle from "@/components/mode-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";

export default function SignIn() {
  const navigate = useNavigate();
  const { login, googleLogin, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Sign in failed");
    }
  };

  const handleGoogleCredential = useCallback(
    async (idToken: string) => {
      setLocalError(null);
      try {
        await googleLogin(idToken);
        navigate("/");
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : "Google sign-in failed");
      }
    },
    [googleLogin, navigate]
  );

  const { promptGoogleSignIn } = useGoogleSignIn(handleGoogleCredential);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-emerald-500/30">

      {/* Auth Navbar */}
      <header className="w-full px-6 sm:px-12 h-20 flex items-center justify-between border-b border-border/20 backdrop-blur-sm">
        <Link
          to="/welcome"
          className="flex items-center gap-3 font-extrabold text-xl tracking-tight text-foreground transition-transform duration-200 hover:-translate-y-0.5"
        >
          <img
            src={logo}
            alt="Gymodoro Logo"
            className="w-10 h-10 object-contain rounded-xl"
          />
          <span className="font-heading font-extrabold text-2xl tracking-tight">
            Gymodoro
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <Link
            to="/signup"
            className="text-sm font-semibold px-4 py-2 rounded-full border border-border hover:border-primary text-foreground transition-all duration-200"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
          <div className="w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <h1 className="font-heading font-extrabold text-3xl text-foreground tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue your productive rhythm.
            </p>
          </div>

          {(error || localError) && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error || localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="email"
                className="block text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-150"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label
                htmlFor="password"
                className="block text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <span className="relative bg-card px-4 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              or continue with
            </span>
          </div>

          {/* Alternative Auth Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={promptGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg border border-border hover:border-emerald-500/60 bg-background/50 hover:bg-secondary text-foreground text-sm font-medium flex items-center justify-center gap-3 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>🌐</span>
              <span>Sign in with Google</span>
            </button>
          </div>

          <div className="text-center mt-8 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-emerald-500 font-semibold hover:underline ml-1"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 sm:px-12 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-5 h-5 object-contain" />
          <span>Gymodoro</span>
        </div>
        <div>© {new Date().getFullYear()} Gymodoro. All rights reserved.</div>
      </footer>

    </div>
  );
}
