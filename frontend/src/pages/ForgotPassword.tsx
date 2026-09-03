import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/gymodoro-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { getBackgroundById } from "@/components/timer/backgrounds";

const CAFE_BACKGROUND = getBackgroundById("rainy-cafe");

export default function ForgotPassword() {
  const { forgotPassword, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);
    try {
      const result = await forgotPassword(email);
      setSentMessage(result.message);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to send reset email");
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

        <div className="w-full max-w-md bg-card/70 backdrop-blur-xl border border-border/60 rounded-2xl p-6 sm:p-10 shadow-2xl relative z-10">
          {sentMessage ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📬</div>
              <h1 className="font-heading font-extrabold text-2xl text-foreground tracking-tight">
                Check your inbox
              </h1>
              <p className="text-sm text-muted-foreground">{sentMessage}</p>

              <Link
                to="/signin"
                className="inline-block mt-2 text-emerald-500 font-semibold hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-heading font-extrabold text-3xl text-foreground tracking-tight mb-2">
                  Forgot password?
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we&apos;ll send you a link to reset it.
                </p>
              </div>

              {localError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {localError}
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

                <button
                  type="submit"
                  disabled={isLoading || submitting}
                  className="w-full py-3.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending..." : "Send Reset Link"}
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

      <footer className="w-full py-6 px-6 sm:px-12 border-t border-border/20 bg-background/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-5 h-5 object-contain" />
          <span>Gymodoro</span>
        </div>
        <div>© {new Date().getFullYear()} Gymodoro. All rights reserved.</div>
      </footer>
    </div>
  );
}
