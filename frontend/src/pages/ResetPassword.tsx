import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "@/assets/brand/gymodoro-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { getBackgroundById } from "@/components/timer/backgrounds";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { GLASS_PANEL, GLASS_TIGHT } from "@/lib/glassPresets";

const CAFE_BACKGROUND = getBackgroundById("rainy-cafe");

export default function ResetPassword() {
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cardGlassRef = useLiquidGlass<HTMLDivElement>(GLASS_PANEL);
  const footerGlassRef = useLiquidGlass<HTMLElement>(GLASS_TIGHT);
  const tokenErrorGlassRef = useLiquidGlass<HTMLDivElement>(GLASS_TIGHT);
  const errorGlassRef = useLiquidGlass<HTMLDivElement>(GLASS_TIGHT);

  useEffect(() => {
    if (!successMessage) return;
    const timeout = setTimeout(() => navigate("/signin?reset=1"), 2000);
    return () => clearTimeout(timeout);
  }, [successMessage, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!token) {
      setLocalError("This reset link is missing its token. Please request a new one.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await resetPassword(token, password);
      setSuccessMessage(result.message);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-emerald-500/30">
      <img
        src={CAFE_BACKGROUND.imageUrl}
        alt={CAFE_BACKGROUND.name}
        className="fixed inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-background/30 via-background/50 to-background/70" />

      <Link
        to="/welcome"
        className="absolute top-0 left-0 z-30 flex items-center gap-1 transition-transform duration-200 hover:-translate-y-0.5"
      >
        <img src={logo} alt="Gymodoro" className="w-[135px] h-[135px] object-contain" />
        <span className="text-foreground font-extrabold tracking-wide text-2xl font-poppins">
          GYMODORO
        </span>
      </Link>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
          <div className="w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div
          ref={cardGlassRef}
          className="glass w-full max-w-md border border-border/60 rounded-2xl p-6 sm:p-10 relative z-10"
        >
          {successMessage ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">✅</div>
              <h1 className="font-heading font-extrabold text-2xl text-foreground tracking-tight">
                Password reset
              </h1>
              <p className="text-sm text-muted-foreground">{successMessage}</p>
              <p className="text-xs text-muted-foreground">Redirecting you to Sign In…</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-heading font-extrabold text-3xl text-foreground tracking-tight mb-2">
                  Set a new password
                </h1>
                <p className="text-sm text-muted-foreground">
                  Choose a new password for your account.
                </p>
              </div>

              {!token && (
                <div
                  ref={tokenErrorGlassRef}
                  className="glass-tight mb-4 p-3 rounded-lg border border-red-500/30 text-red-400 text-sm"
                >
                  This reset link is missing its token. Please request a new one from the{" "}
                  <Link to="/forgot-password" className="underline font-semibold">
                    forgot password
                  </Link>{" "}
                  page.
                </div>
              )}

              {localError && (
                <div
                  ref={errorGlassRef}
                  className="glass-tight mb-4 p-3 rounded-lg border border-red-500/30 text-red-400 text-sm"
                >
                  {localError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="password"
                    className="block text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-150"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-150"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || submitting || !token}
                  className="w-full py-3.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <div className="text-center mt-8 text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link
                  to="/signin"
                  className="text-emerald-500 font-semibold hover:underline ml-1"
                >
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

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
