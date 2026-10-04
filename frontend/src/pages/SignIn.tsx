import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "@/assets/brand/gymodoro-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import { getBackgroundById } from "@/components/timer/backgrounds";
import GoogleIcon from "@/components/GoogleIcon";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { GLASS_PANEL, GLASS_TIGHT } from "@/lib/glassPresets";

const CAFE_BACKGROUND = getBackgroundById("rainy-cafe");

export default function SignIn() {
  const navigate = useNavigate();
  const { login, googleLogin, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  // Set by the backend's GET /api/auth/verify-email redirect (?verified=1|0),
  // or by ResetPassword.tsx's redirect after a successful reset (?reset=1).
  const verificationNotice = useMemo(() => {
    const verified = searchParams.get("verified");
    if (verified === "1") {
      return { kind: "success" as const, text: "Email verified! You can now sign in." };
    }
    if (verified === "0") {
      return {
        kind: "error" as const,
        text: "That verification link is invalid or expired. Please request a new one.",
      };
    }
    if (searchParams.get("reset") === "1") {
      return { kind: "success" as const, text: "Password reset! Please sign in with your new password." };
    }
    return null;
  }, [searchParams]);

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
        await googleLogin(idToken, "login");
        navigate("/");
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : "Google sign-in failed");
      }
    },
    [googleLogin, navigate]
  );

  const { promptGoogleSignIn } = useGoogleSignIn(handleGoogleCredential);

  const cardGlassRef = useLiquidGlass<HTMLDivElement>(GLASS_PANEL);
  const dividerGlassRef = useLiquidGlass<HTMLSpanElement>(GLASS_TIGHT);
  const footerGlassRef = useLiquidGlass<HTMLElement>(GLASS_TIGHT);
  const noticeGlassRef = useLiquidGlass<HTMLDivElement>(GLASS_TIGHT);
  const errorGlassRef = useLiquidGlass<HTMLDivElement>(GLASS_TIGHT);

  return (
    <div className="relative isolate min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-emerald-500/30">
      {/* Cafe background — fixed behind the whole page, with a scrim for legibility */}
      <img
        src={CAFE_BACKGROUND.imageUrl}
        alt={CAFE_BACKGROUND.name}
        className="fixed inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-background/30 via-background/50 to-background/70" />

      {/* Logo — matches the Timer page's floating logo treatment */}
      <Link
        to="/welcome"
        className="absolute top-0 left-0 z-30 flex items-center gap-1 transition-transform duration-200 hover:-translate-y-0.5"
      >
        <img src={logo} alt="Gymodoro" className="w-[135px] h-[135px] object-contain" />
        <span className="text-foreground font-extrabold tracking-wide text-2xl font-poppins">
          GYMODORO
        </span>
      </Link>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
          <div className="w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div
          ref={cardGlassRef}
          className="glass w-full max-w-md border border-border/60 rounded-2xl p-6 sm:p-10 relative z-10"
        >
          <div className="text-center mb-8">
            <h1 className="font-heading font-extrabold text-3xl text-foreground tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue your productive rhythm.
            </p>
          </div>

          {verificationNotice && (
            <div
              ref={noticeGlassRef}
              className={
                verificationNotice.kind === "success"
                  ? "glass-tight mb-4 p-3 rounded-lg border border-emerald-500/30 text-emerald-400 text-sm"
                  : "glass-tight mb-4 p-3 rounded-lg border border-red-500/30 text-red-400 text-sm"
              }
            >
              {verificationNotice.text}
            </div>
          )}

          {(error || localError) && (
            <div
              ref={errorGlassRef}
              className="glass-tight mb-4 p-3 rounded-lg border border-red-500/30 text-red-400 text-sm"
            >
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
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-emerald-500 font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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
            <span
              ref={dividerGlassRef}
              className="glass-tight relative px-4 text-[11px] font-mono uppercase tracking-widest text-muted-foreground"
            >
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
              <GoogleIcon className="w-4 h-4" />
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
      <footer
        ref={footerGlassRef}
        className="glass-tight w-full py-6 px-6 sm:px-12 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3"
      >
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-5 h-5 object-contain" />
          <span>Gymodoro</span>
        </div>
        <div>© {new Date().getFullYear()} Gymodoro. All rights reserved.</div>
      </footer>

    </div>
  );
}
