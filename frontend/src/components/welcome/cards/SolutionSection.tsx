import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import GoogleIcon from "@/components/GoogleIcon";
import GlassArticle from "./GlassArticle";
import SectionHeading from "./SectionHeading";
import { usePinnedCardTrack } from "./usePinnedCardTrack";

type CycleTone = "work" | "break";

interface CycleBar {
  flex: number;
  height: string;
  tone: CycleTone;
}

/** Four work/break rounds, then one long break — mirrors the app's default 25/5×4 + 15 cadence. */
const CYCLE_BARS: CycleBar[] = [
  { flex: 5, height: "100%", tone: "work" },
  { flex: 1, height: "34%", tone: "break" },
  { flex: 5, height: "100%", tone: "work" },
  { flex: 1, height: "34%", tone: "break" },
  { flex: 5, height: "100%", tone: "work" },
  { flex: 1, height: "34%", tone: "break" },
  { flex: 5, height: "100%", tone: "work" },
  { flex: 3, height: "62%", tone: "break" },
];

const TONE_COLOR: Record<CycleTone, string> = {
  work: "#f6efe7",
  break: "#4be277",
};

const OUTCOME_ROWS = ["Productivity", "Enjoyment", "Satisfaction", "Activeness"];

function SignUpCard() {
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

function FocusBlockCard() {
  return (
    <GlassArticle className="w-[clamp(260px,30vw,360px)]">
      <div className="font-heading text-[clamp(52px,7vw,76px)] leading-[0.9] font-extrabold tracking-[-0.04em] text-white">
        25<span className="text-[0.35em] font-normal tracking-normal text-white/70"> min</span>
      </div>
      <h3 className="m-0 font-heading text-2xl leading-[1.1] font-bold text-white">One focus block</h3>
      <p className="m-0 text-base leading-[1.55] text-white">
        Pick one task. Work it for twenty-five minutes with nothing else on the desk. No method to learn, no
        setup — the timer decides when you stop.
      </p>
      <footer className="mt-auto border-t border-white/10 pt-3.5 text-[13px] font-bold tracking-[0.04em] text-white/60">
        Some people call this a Pomodoro
      </footer>
    </GlassArticle>
  );
}

function LeakCard() {
  return (
    <GlassArticle className="w-[clamp(260px,30vw,360px)]">
      <div className="font-heading text-[clamp(52px,7vw,76px)] leading-[0.9] font-extrabold tracking-[-0.04em] text-white">
        5<span className="text-[0.35em] font-normal tracking-normal text-white/70"> min</span>
      </div>
      <h3 className="m-0 font-heading text-2xl leading-[1.1] font-bold text-white">Where it leaks</h3>
      <p className="m-0 text-base leading-[1.55] text-white">
        Then you stop — and nothing tells you what to do with the five minutes. So the phone fills it, and you
        come back to the desk more tired than you left it. Still sitting.
      </p>
    </GlassArticle>
  );
}

function SwapCard() {
  return (
    <GlassArticle className="w-[clamp(260px,30vw,360px)]">
      <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#4be277] uppercase">
        The swap
      </span>
      <h3 className="m-0 font-heading text-2xl leading-[1.1] font-bold text-white">
        The same five minutes, spent on your body.
      </h3>
      <p className="m-0 text-base leading-[1.55] text-white">
        When the break timer fires, Gymodoro hands you one real exercise — push-ups, cat-cow, a plank — with a
        video and a difficulty. You do it where you are. No gym, no kit, no scheduling.
      </p>
      <div className="mt-auto flex flex-wrap gap-2 text-[13px] font-bold tracking-[0.04em] text-white/70">
        <span className="rounded-full border border-white/20 px-3 py-1">Roll the dice</span>
        <span className="rounded-full border border-white/20 px-3 py-1">Or pick your own</span>
      </div>
    </GlassArticle>
  );
}

function CycleChartCard() {
  return (
    <GlassArticle className="w-[clamp(260px,30vw,360px)]">
      <h3 className="m-0 font-heading text-2xl leading-[1.1] font-bold text-white">
        Four rounds, then a long one
      </h3>
      <div className="flex h-28 items-end gap-1.5">
        {CYCLE_BARS.map((bar, i) => (
          <span
            key={i}
            className="rounded-t-sm"
            style={{ flex: bar.flex, height: bar.height, background: TONE_COLOR[bar.tone] }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-bold tracking-[0.04em] text-white/70">
        <span>25 focus</span>
        <span>5 active break</span>
        <span>15 long break</span>
      </div>
      <p className="m-0 text-base leading-[1.55] text-white">
        Four cycles, then fifteen minutes. That's four short movement sets and one longer one before lunch — a
        workout you never scheduled.
      </p>
    </GlassArticle>
  );
}

function OutcomesCard() {
  return (
    <GlassArticle className="w-[clamp(260px,30vw,360px)] text-white">
      <h3 className="m-0 font-heading text-[27px] leading-[1.05] font-extrabold tracking-[-0.01em]">
        Both halves go up
      </h3>
      <dl className="m-0 flex flex-col gap-3 font-heading text-[19px] font-bold">
        {OUTCOME_ROWS.map((label) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5 last:border-0"
          >
            <dt className="uppercase">{label}</dt>
            <dd className="m-0 text-[#4be277]">Up</dd>
          </div>
        ))}
      </dl>
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
            className="relative flex items-start gap-[clamp(16px,2vw,28px)] px-[5vw] will-change-transform"
          >
            <FocusBlockCard />
            <LeakCard />
            <SwapCard />
            <CycleChartCard />
            <OutcomesCard />
            <SignUpCard />
          </div>
        </div>
      </div>
    </section>
  );
}
