import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import GoogleIcon from "@/components/GoogleIcon";
import GlassArticle from "./GlassArticle";
import SectionHeading from "./SectionHeading";
import { usePinnedCardTrack } from "./usePinnedCardTrack";

const BARS = [
  { flex: 5, height: "100%", color: "#f6efe7" },
  { flex: 1, height: "34%", color: "#4be277" },
  { flex: 5, height: "100%", color: "#f6efe7" },
  { flex: 1, height: "34%", color: "#4be277" },
  { flex: 5, height: "100%", color: "#f6efe7" },
  { flex: 1, height: "34%", color: "#4be277" },
  { flex: 5, height: "100%", color: "#f6efe7" },
  { flex: 3, height: "62%", color: "#4be277" },
];

/** Final card of the row: real Google + email sign-up, styled to match the track. */
function StartCycleCard() {
  const { googleLogin } = useAuth();
  const [err, setErr] = useState<string | null>(null);

  const onCredential = useCallback(
    async (idToken: string) => {
      setErr(null);
      try {
        await googleLogin(idToken, "signup");
        // success: Welcome.tsx's auth guard redirects — nothing to do here.
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Google sign-in failed");
      }
    },
    [googleLogin],
  );
  const { promptGoogleSignIn } = useGoogleSignIn(onCredential);

  return (
    <GlassArticle className="w-[clamp(260px,30vw,360px)] justify-center">
      <h3 className="m-0 font-heading text-[clamp(26px,3.4vw,34px)] leading-none font-extrabold tracking-[-0.02em] text-white">
        Start your first cycle.
      </h3>
      <p className="m-0 text-base leading-[1.5] text-white">
        Twenty-five minutes of work and one real break. Nothing to configure.
      </p>
      {err && (
        <p className="m-0 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100">{err}</p>
      )}
      <div className="mt-1.5 flex flex-col gap-2">
        <button
          type="button"
          onClick={promptGoogleSignIn}
          className="flex items-center justify-center gap-2.5 rounded-lg bg-white px-4 py-3 text-[15px] font-bold text-[#07080d]"
        >
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </button>
        <Link
          to="/signup"
          className="rounded-lg border border-white/40 px-4 py-3 text-center text-[15px] font-bold text-white"
        >
          Sign up with email
        </Link>
      </div>
    </GlassArticle>
  );
}

/** Section 02 — the fix: pinned horizontal card row ending on the sign-up card. */
export default function SolutionSection() {
  const { sectionRef, trackRef, fillRef } = usePinnedCardTrack();

  return (
    <section ref={sectionRef} className="relative">
      <div className="sticky top-0 flex min-h-screen flex-col">
        <SectionHeading
          kicker="02 — the fix"
          kickerColor="#4be277"
          fillRef={fillRef}
          fillColor="#4be277"
          subtitle="If you've never used a focus timer, here's the whole idea in four cards — and the one part of it we changed."
        >
          Work in blocks.
          <br />
          Move in the gaps.
        </SectionHeading>

        <div className="flex flex-none items-center overflow-x-hidden overflow-y-visible py-6">
          <div
            ref={trackRef}
            className="flex items-start gap-[clamp(16px,2vw,28px)] px-[5vw] will-change-transform"
          >
            <GlassArticle className="w-[clamp(260px,30vw,360px)]">
              <div className="font-heading text-[clamp(52px,7vw,76px)] leading-[0.9] font-extrabold tracking-[-0.04em] text-white">
                25<span className="text-[0.35em] tracking-normal text-white/70"> min</span>
              </div>
              <h3 className="m-0 font-heading text-2xl leading-[1.1] font-bold text-white">
                One focus block
              </h3>
              <p className="m-0 text-base leading-[1.55] text-white">
                Pick one task. Work it for twenty-five minutes with nothing else on the desk. No
                method to learn, no setup — the timer decides when you stop.
              </p>
              <div className="mt-auto border-t border-[#1b1f2b] pt-3.5 text-[13px] text-white/70">
                Some people call this a Pomodoro
              </div>
            </GlassArticle>

            <GlassArticle className="w-[clamp(260px,30vw,360px)]">
              <div className="font-heading text-[clamp(52px,7vw,76px)] leading-[0.9] font-extrabold tracking-[-0.04em] text-[#e8734a]">
                5<span className="text-[0.35em] tracking-normal text-white/70"> min</span>
              </div>
              <h3 className="m-0 font-heading text-2xl leading-[1.1] font-bold text-white">
                Where it leaks
              </h3>
              <p className="m-0 text-base leading-[1.55] text-white">
                Then you stop — and nothing tells you what to do with the five minutes. So the
                phone fills it, and you come back to the desk more tired than you left it. Still
                sitting.
              </p>
              <div className="mt-auto border-t border-[#2b1d18] pt-3.5 text-[13px] font-bold text-white">
                State of body: <span className="text-[#e8734a]">Sedentary</span>
              </div>
            </GlassArticle>

            <GlassArticle className="w-[clamp(280px,34vw,420px)]">
              <div className="text-[11px] tracking-[0.2em] text-white/60 uppercase">
                The swap
              </div>
              <h3 className="m-0 font-heading text-[clamp(28px,3.6vw,38px)] leading-none font-extrabold tracking-[-0.02em] text-white">
                The same five minutes, spent on your body.
              </h3>
              <p className="m-0 text-base leading-[1.55] text-white">
                When the break timer fires, Gymodoro hands you one real exercise — push-ups,
                cat-cow, a plank — with a video and a difficulty. You do it where you are. No gym,
                no kit, no scheduling.
              </p>
              <div className="mt-auto flex flex-wrap gap-2">
                <span className="rounded-full border border-white/30 px-3 py-1.5 text-[13px] font-bold text-white">
                  Roll the dice
                </span>
                <span className="rounded-full border border-white/30 px-3 py-1.5 text-[13px] font-bold text-white">
                  Or pick your own
                </span>
              </div>
            </GlassArticle>

            <GlassArticle className="w-[clamp(280px,34vw,420px)]">
              <h3 className="m-0 font-heading text-2xl leading-[1.1] font-bold text-white">
                Four rounds, then a long one
              </h3>
              <div className="flex h-24 items-end gap-1">
                {BARS.map((b, i) => (
                  <div
                    key={i}
                    className="rounded-[3px]"
                    style={{ flex: b.flex, height: b.height, background: b.color }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-[13px] text-white">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#f6efe7]" />
                  25 focus
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#4be277]" />5 active break
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#4be277]" />
                  15 long break
                </span>
              </div>
              <p className="m-0 mt-auto text-base leading-[1.55] text-white">
                Four cycles, then fifteen minutes. That's four short movement sets and one longer
                one before lunch — a workout you never scheduled.
              </p>
            </GlassArticle>

            <GlassArticle className="w-[clamp(260px,30vw,360px)]">
              <h3 className="m-0 font-heading text-2xl leading-[1.1] font-bold text-white">
                Both halves go up
              </h3>
              <div className="flex flex-col gap-3 font-heading text-lg font-bold text-white">
                {["Productivity", "Enjoyment", "Satisfaction", "Activeness"].map((row) => (
                  <div
                    key={row}
                    className="flex items-center justify-between gap-3 border-b border-[#16301f] pb-2.5 last:border-0"
                  >
                    <span className="uppercase">{row}</span>
                    <span className="text-[#4be277]">Up</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto border-t border-[#16301f] pt-3.5 text-[13px] font-bold text-white">
                State of body: <span className="text-[#4be277]">Active</span>
              </div>
            </GlassArticle>

            <StartCycleCard />
          </div>
        </div>
      </div>
    </section>
  );
}
