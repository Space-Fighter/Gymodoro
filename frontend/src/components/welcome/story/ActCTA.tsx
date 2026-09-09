import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import GoogleIcon from "@/components/GoogleIcon";
import { GlassPanel } from "./motion";
import { STORY_ASSETS } from "./assets";

/**
 * Resolve & hold. The story ends on a real sign-in, never a fade to nothing: a
 * glass card holds over the last frame of Part 2's clip (the beach payoff).
 *
 * Google mirrors `SignIn.tsx` — `useAuth().googleLogin` + `useGoogleSignIn`,
 * called with mode "signup". On success we do nothing: the `<Welcome>` auth
 * guard re-renders and `<Navigate to="/"/>` fires on its own. Email routes to
 * the existing `/signup` and `/signin` pages.
 */
export default function ActCTA() {
  const { googleLogin } = useAuth();
  const [err, setErr] = useState<string | null>(null);

  const onCredential = useCallback(
    async (idToken: string) => {
      setErr(null);
      try {
        await googleLogin(idToken, "signup");
        // success: Welcome.tsx's guard redirects — nothing to do here.
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Google sign-in failed");
      }
    },
    [googleLogin],
  );

  const { promptGoogleSignIn } = useGoogleSignIn(onCredential);

  return (
    <section
      id="start"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <img
        src={STORY_ASSETS.ctaBg.src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ background: STORY_ASSETS.ctaBg.fallback }}
      />
      {/* legibility scrim over the frame */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/55"
      />

      <GlassPanel className="relative z-10 mx-6 w-full max-w-md p-8 text-center">
        <h2 className="font-heading text-3xl font-extrabold tracking-tight text-white">
          Start your first cycle
        </h2>
        <p className="mt-2 text-sm font-medium tracking-wide text-white/85">
          GYMODORO — Work. Move. Repeat.
        </p>

        {err && (
          <p className="mt-4 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100">
            {err}
          </p>
        )}

        <button
          type="button"
          onClick={promptGoogleSignIn}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
        >
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </button>

        <div className="mt-3 flex gap-3">
          <Link
            to="/signup"
            className="flex-1 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            Sign up with email
          </Link>
          <Link
            to="/signin"
            className="flex-1 rounded-lg border border-white/40 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>
      </GlassPanel>
    </section>
  );
}
