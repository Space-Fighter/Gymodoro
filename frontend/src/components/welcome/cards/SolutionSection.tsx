import { useCallback, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import GlassArticle from "./GlassArticle";
import PinnedRow from "./PinnedRow";
import { assetUrl, STORY_ASSETS, type StoryAsset } from "../assets";

const TITLE = "m-0 font-heading text-[30px] leading-[1.08] font-bold text-white max-md:text-[22px]";
const BODY = "m-0 text-[21px] leading-[1.4] text-white max-md:text-[17px]";

/** Same card as the Science row: photo (or visual) on top with the headline stat over it, text below. */
function FixCard({
  image,
  position = "center",
  tall = false,
  visual,
  stat,
  title,
  children,
  footer,
}: {
  image?: StoryAsset;
  /** CSS object-position for the photo crop. */
  position?: string;
  /** Taller photo area, for portrait photos that would otherwise be cropped hard. */
  tall?: boolean;
  visual?: ReactNode;
  stat: string;
  title: string;
  children: ReactNode;
  footer?: string;
}) {
  return (
    <GlassArticle className="h-full w-[min(84vw,400px)] max-md:h-auto !gap-3 !p-3.5">
      <div
        className={`relative min-h-[110px] flex-none overflow-hidden rounded-[18px] bg-[#141824] ${tall ? "h-[46%] max-md:h-[240px]" : "h-[27%] max-md:h-[170px]"}`}
      >
        {image && (
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            className="h-full w-full object-cover"
            style={{ objectPosition: position }}
          />
        )}
        {visual}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3.5 pt-8 pb-2">
          <div className="font-heading text-[clamp(34px,4.4vw,48px)] leading-[0.95] font-extrabold tracking-[-0.04em] text-[#4be277]">
            {stat}
          </div>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-1.5 max-md:overflow-visible">
        <h3 className={TITLE}>{title}</h3>
        {children}
        {footer && <footer className="mt-auto text-[16px] tracking-wide text-white/55 max-md:text-[13px]">{footer}</footer>}
      </div>
    </GlassArticle>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[20px] leading-[1.3] text-white max-md:text-[16px]">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-0.5 text-[#4be277]">●</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function Callout({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className="m-0 rounded-2xl border border-[#4be277]/30 bg-[#4be277]/10 p-3 text-[20px] leading-[1.35] text-white max-md:text-[16px]">
      <b className="text-[#4be277]">{label} </b>
      {children}
    </p>
  );
}

const LAWS = [
  ["Make it obvious", "the timer is the cue"],
  ["Make it attractive", "roll the dice"],
  ["Make it easy", "5 min, no kit"],
  ["Make it satisfying", "see the win"],
];

type CycleTone = "work" | "break";
/** Four 25/5 rounds, then one long break, mirroring the app's default cadence. `min` is shown under each bar. */
const CYCLE_BARS: { min: number; tone: CycleTone }[] = [
  { min: 25, tone: "work" },
  { min: 5, tone: "break" },
  { min: 25, tone: "work" },
  { min: 5, tone: "break" },
  { min: 25, tone: "work" },
  { min: 5, tone: "break" },
  { min: 25, tone: "work" },
  { min: 15, tone: "break" },
];
const TONE_COLOR: Record<CycleTone, string> = { work: "#f6efe7", break: "#4be277" };

function CycleVisual() {
  return (
    <div className="flex h-full w-full gap-1.5 px-4 pt-4 pb-16">
      {CYCLE_BARS.map((bar, i) => (
        <div key={i} className="flex min-w-0 flex-col items-center gap-1" style={{ flex: bar.min }}>
          <div className="flex w-full flex-1 items-end">
            <span
              className="w-full rounded-t-sm"
              style={{ height: `${Math.max((bar.min / 25) * 100, 30)}%`, background: TONE_COLOR[bar.tone] }}
            />
          </div>
          <span className="text-[14px] leading-none font-bold text-white">{bar.min}</span>
        </div>
      ))}
    </div>
  );
}

const OUTCOME_ROWS = ["Productivity", "Enjoyment", "Satisfaction", "Activeness"];

function SignUpCard() {
  const { googleLogin } = useAuth();
  const [err, setErr] = useState<string | null>(null);

  const onCredential = useCallback(
    async (idToken: string) => {
      setErr(null);
      try {
        await googleLogin(idToken, "signup");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Google sign-in failed");
      }
    },
    [googleLogin],
  );

  return (
    <FixCard
      image={{ src: assetUrl("hero/cta-bg.webp"), alt: "A man working in a sunny alpine meadow", fallback: "" }}
      stat="Free"
      title="Start your first cycle."
    >
      <p className={BODY}>One focus block. One real break.</p>
      {err && <p className="m-0 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100">{err}</p>}
      <div className="mt-auto flex flex-col gap-2">
        <GoogleSignInButton onCredential={onCredential} text="continue_with" theme="outline" />
        <Link
          to="/signup"
          className="rounded-lg border border-white/40 px-4 py-3 text-center text-[19px] max-md:text-[16px] font-bold text-white"
        >
          Sign up with email
        </Link>
      </div>
    </FixCard>
  );
}

/** Section 02 — the fix: pinned row of cards in the same format as the Science row. */
export default function SolutionSection() {
  return (
    <PinnedRow kicker="02 — the fix" title="Work in blocks. Move in the gaps.">
      <FixCard
        image={STORY_ASSETS.photoFocus}
        position="50% 28%"
        stat="25 min"
        title="One focus block"
        footer="Some people call this a Pomodoro"
      >
        <p className={BODY}>
          One task, twenty-five minutes, nothing else on the desk. The timer decides when you stop.
        </p>
        <Callout label="With Gymodoro:">it starts in one tap.</Callout>
      </FixCard>

      <FixCard image={STORY_ASSETS.photoMove} stat="5 min" title="Take a break. MOVE!">
        <p className={BODY}>The best break is an active one:</p>
        <Bullets
          items={[
            <><b>More blood and oxygen</b> to the brain.</>,
            <><b>Sharper focus</b> for the next block.</>,
            <><b>Better mood,</b> less stress.</>,
            <><b>More ideas:</b> walking lifted creativity ~60%.</>,
          ]}
        />
      </FixCard>

      <FixCard image={STORY_ASSETS.photoHabit} stat="4 laws" title="How we break the doom-scroll habit" footer="Built on Atomic Habits">
        <p className={BODY}>Same cue, new routine: move, don't scroll.</p>
        <ol className="m-0 flex list-none flex-col gap-2 p-0 text-[20px] leading-[1.3] text-white max-md:text-[16px]">
          {LAWS.map(([law, how], i) => (
            <li key={law} className="flex gap-2.5">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#4be277] text-[15px] font-extrabold text-black">
                {i + 1}
              </span>
              <span>
                <b>{law}:</b> {how}
              </span>
            </li>
          ))}
        </ol>
      </FixCard>

      <FixCard image={STORY_ASSETS.photoSwap} stat="1 tap" title="Five minutes, spent on your body">
        <p className={BODY}>
          One real exercise, with a demo video, the moment your break starts.
        </p>
        <Callout label="Or:">pick your own.</Callout>
      </FixCard>

      <FixCard visual={<CycleVisual />} stat="4 + 1" title="Four rounds, then a long one">
        <p className={BODY}>
          Four focus blocks, four movement breaks, then a long one.
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[17px] font-bold tracking-[0.04em]">
          <span className="text-[#f6efe7]">■ 25 focus</span>
          <span className="text-[#4be277]">■ 5 active break</span>
          <span className="text-[#4be277]">■ 15 long break</span>
        </div>
      </FixCard>

      <FixCard image={STORY_ASSETS.photoOutcome} position="50% 22%" tall stat="Both ↑" title="Both halves go up">
        <dl className="m-0 flex flex-col gap-2 font-heading text-[24px] font-bold max-md:text-[19px]">
          {OUTCOME_ROWS.map((label) => (
            <div key={label} className="flex items-center justify-between gap-3 border-b border-white/10 pb-2 last:border-0">
              <dt className="uppercase">{label}</dt>
              <dd className="m-0 text-[#4be277]">Up ↑</dd>
            </div>
          ))}
        </dl>
      </FixCard>

      <SignUpCard />
    </PinnedRow>
  );
}
