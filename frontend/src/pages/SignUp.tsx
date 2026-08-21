import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/gymodoro-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import { getBackgroundById } from "@/components/timer/backgrounds";
import GoogleIcon from "@/components/GoogleIcon";

const CAFE_BACKGROUND = getBackgroundById("rainy-cafe");

export default function SignUp() {
  const navigate = useNavigate();
  const { register, resendVerification, googleLogin, isLoading, error } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const handleResend = async () => {
    setResending(true);
    setResendMessage(null);
    try {
      const result = await resendVerification(email);
      setResendMessage(result.message);
    } catch (err) {
      setResendMessage(err instanceof Error ? err.message : "Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      const result = await register(email, password, name);
      setVerificationMessage(result.message);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Registration failed");
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

        <div className="w-full max-w-md bg-card/70 backdrop-blur-xl border border-border/60 rounded-2xl p-6 sm:p-10 shadow-2xl relative z-10">
          {verificationMessage ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📬</div>
              <h1 className="font-heading font-extrabold text-2xl text-foreground tracking-tight">
                Check your inbox
              </h1>
              <p className="text-sm text-muted-foreground">{verificationMessage}</p>

              {resendMessage && (
                <p className="text-sm text-emerald-500">{resendMessage}</p>
              )}

              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full py-3 px-4 rounded-lg border border-border hover:border-emerald-500/60 bg-background/50 hover:bg-secondary text-foreground text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? "Sending..." : "Resend verification email"}
              </button>

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
                  Create an account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Start your active productivity journey with Gymodoro.
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
                    htmlFor="name"
                    className="block text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-150"
                  />
                </div>

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
                  {isLoading ? "Creating account..." : "Get Started Free"}
                </button>
              </form>

              {/* Social Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <span className="relative bg-card/70 backdrop-blur-xl px-4 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  or sign up with
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
                  <span>Sign up with Google</span>
                </button>
              </div>

              <div className="text-center mt-8 text-sm text-muted-foreground">
                Already have an account?{" "}
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

      {/* Footer */}
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
