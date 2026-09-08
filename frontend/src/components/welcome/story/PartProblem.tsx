import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import ParallaxImage from "./ParallaxImage";
import { GlassPanel } from "./motion";
import { useCalm } from "./storyScroll";
import { STORY_ASSETS } from "./assets";

/**
 * Part 1 — The Problem. Beats 1–7 (see plan / GYMODORO.pdf pp. 1–3).
 *
 * One tall pinned section (`h-[600vh]` with an inner `sticky top-0 h-screen`),
 * scrubbed off its own `useScroll`. In order:
 *   1. Grind + boss scolding      (0.00–0.13)  — deck: "Work a ton"
 *   2. Phone opens, apps load     (0.13–0.27)  — deck: "Tired takes a break"
 *   3. Head-lid → microwave       (0.27–0.42)  — deck: "Your brain is hacked"
 *   4. Keep scrolling, sky grades (0.42–0.57)  — deck: "The Doom Scroll Aftermath"
 *   5. Zoom to iris + 3 lines     (0.57–0.75)
 *   6. Assessment → all LOW       (0.75–0.88)
 *   7. The Turn — clip-path wipe  (0.88–1.00)
 *
 * Part 1 is the single HOT / WRONG look: oversaturated sun, sickly tones.
 * Only `transform`/`opacity`/`clip-path` animate. `useCalm()` kills the iris
 * zoom, parallax and the looping sun pulse, and settles beats to their end
 * state.
 */

const AFTERMATH = [
  "Ahh I did it again.",
  "I feel like a piece of crap now.",
  "I guess I'll work tomorrow.",
];

const ASSESSMENT = ["Productivity", "Enjoyment", "Satisfaction", "Activeness"];

const PHONE_APPS = [
  { name: "Instagram", bg: "linear-gradient(140deg,#7b2ff7,#f107a3 55%,#ffb84d)" },
  { name: "Facebook", bg: "linear-gradient(180deg,#0866ff,#0a52cc)" },
  { name: "YouTube", bg: "linear-gradient(180deg,#0f0f0f,#2a0a0a)" },
];

/* ── beat wrapper: crossfade (opacity + small y) across a scroll window ─────── */
function Beat({
  progress,
  enter,
  exit,
  y = 26,
  hold = false,
  calm,
  className,
  children,
}: {
  progress: MotionValue<number>;
  enter: number;
  exit: number;
  /** vertical travel px; ignored under calm */
  y?: number;
  /** keep fully visible after `enter` instead of fading out at `exit` */
  hold?: boolean;
  calm: boolean;
  className?: string;
  children: ReactNode;
}) {
  // Fade window kept strictly inside [0,1] and strictly increasing — framer's
  // interpolate() (and the WAAPI path it can hand off to) rejects ranges that
  // dip below 0, exceed 1, or repeat a value.
  const pad = 0.03;
  const a = Math.max(0, enter - pad);
  const b = Math.max(a + 0.001, enter);
  const c = Math.max(b + 0.001, exit);
  const d = Math.min(1, Math.max(c + 0.001, exit + pad));
  const opacity = useTransform(
    progress,
    [a, b, c, d],
    hold ? [0, 1, 1, 1] : [0, 1, 1, 0],
  );
  const eStart = Math.min(enter, exit - 0.001);
  const ty = useTransform(progress, [eStart, exit], calm ? [0, 0] : [y, -y]);
  return (
    <motion.div style={{ opacity, y: ty }} className={className}>
      {children}
    </motion.div>
  );
}

/* ── deck story card (one per sub-beat) ────────────────────────────────────── */
function DeckCard({
  progress,
  enter,
  exit,
  calm,
  kicker,
  title,
  lines,
}: {
  progress: MotionValue<number>;
  enter: number;
  exit: number;
  calm: boolean;
  kicker: string;
  title: string;
  lines: string[];
}) {
  return (
    <Beat
      progress={progress}
      enter={enter}
      exit={exit}
      calm={calm}
      className="pointer-events-none absolute bottom-10 left-1/2 w-[min(92vw,26rem)] -translate-x-1/2"
    >
      <GlassPanel tight className="p-5">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/90">
          {kicker}
        </p>
        <p className="text-lg font-extrabold text-white">{title}</p>
        {lines.map((l) => (
          <p key={l} className="mt-1.5 text-sm leading-snug text-white/80">
            {l}
          </p>
        ))}
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-white/55">
          State of body: Sedentary
        </p>
      </GlassPanel>
    </Beat>
  );
}

/* ── roast-meter ring: a circular fill that climbs as the day burns away ───── */
function RoastMeter({
  progress,
  calm,
}: {
  progress: MotionValue<number>;
  calm: boolean;
}) {
  const fill = useTransform(progress, [0.28, 0.82], [0.02, 1]);
  return (
    <Beat
      progress={progress}
      enter={0.29}
      exit={0.86}
      calm={calm}
      className="absolute right-6 top-20 flex flex-col items-center gap-1.5"
    >
      <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-orange-300/80">
        <div className="absolute inset-0 bg-black/45" />
        <motion.div
          style={{ scaleY: fill }}
          className="absolute inset-0 origin-bottom bg-gradient-to-t from-orange-600 via-orange-500 to-amber-300"
        />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-orange-200">
        Roast meter
      </span>
    </Beat>
  );
}

/* ── phone that fills the frame; app splash screens load in sequence ───────── */
function PhoneOverlay({
  progress,
  calm,
}: {
  progress: MotionValue<number>;
  calm: boolean;
}) {
  const igO = useTransform(progress, [0.15, 0.165, 0.19, 0.2], [0, 1, 1, 0]);
  const fbO = useTransform(progress, [0.19, 0.2, 0.215, 0.225], [0, 1, 1, 0]);
  const ytO = useTransform(progress, [0.215, 0.225, 0.25, 0.26], [0, 1, 1, 1]);
  const opacities = [igO, fbO, ytO];

  return (
    <Beat
      progress={progress}
      enter={0.14}
      exit={0.26}
      y={0}
      calm={calm}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="relative h-[78vh] max-h-[620px] w-[min(88vw,340px)] overflow-hidden rounded-[2.75rem] border-[10px] border-neutral-900 bg-black shadow-2xl">
        {PHONE_APPS.map((app, i) => (
          <motion.div
            key={app.name}
            style={{ opacity: opacities[i], background: app.bg }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-2xl font-black tracking-tight text-white">
              {app.name}
            </span>
          </motion.div>
        ))}
      </div>
    </Beat>
  );
}

/* ── the 3 aftermath lines, surfacing one at a time inside the dark iris ───── */
function IrisLines({
  progress,
  calm,
}: {
  progress: MotionValue<number>;
  calm: boolean;
}) {
  const l0 = useTransform(progress, [0.6, 0.63, 0.73, 0.75], [0, 1, 1, 0]);
  const l1 = useTransform(progress, [0.645, 0.675, 0.73, 0.75], [0, 1, 1, 0]);
  const l2 = useTransform(progress, [0.69, 0.72, 0.745, 0.75], [0, 1, 1, 0]);
  const lineO = [l0, l1, l2];
  return (
    <Beat
      progress={progress}
      enter={0.6}
      exit={0.75}
      y={0}
      calm={calm}
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center"
    >
      {AFTERMATH.map((line, i) => (
        <motion.p
          key={line}
          style={{ opacity: lineO[i] }}
          className="text-xl font-bold text-white/85 sm:text-2xl"
        >
          {line}
        </motion.p>
      ))}
    </Beat>
  );
}

/* ── ASSESSMENT OF THE DAY — every readout animates to LOW ─────────────────── */
function AssessmentPanel({
  progress,
  calm,
}: {
  progress: MotionValue<number>;
  calm: boolean;
}) {
  // shared timing for all four rows: bar shrinks toward "LOW", label fades in
  const bar = useTransform(progress, [0.77, 0.87], [0.9, 0.16]);
  const labelO = useTransform(progress, [0.8, 0.88], [0, 1]);
  return (
    <Beat
      progress={progress}
      enter={0.76}
      exit={0.9}
      hold
      calm={calm}
      className="absolute inset-0 flex flex-col items-center justify-center px-6"
    >
      <GlassPanel className="w-[min(92vw,28rem)] p-6">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/70">
          Assessment of the day
        </p>
        <ul className="space-y-3">
          {ASSESSMENT.map((k) => (
            <li key={k}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-white/85">{k}</span>
                <motion.span
                  style={{ opacity: labelO }}
                  className="font-bold text-red-300"
                >
                  LOW
                </motion.span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/15">
                <motion.div
                  style={{ scaleX: bar }}
                  className="h-full origin-left rounded-full bg-red-400/80"
                />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm font-semibold text-amber-200/90">
          Your breaks are cooking you.
        </p>
      </GlassPanel>
    </Beat>
  );
}

/* ── boss speech-bubble that slides in on scroll ──────────────────────────── */
function BossBubble({
  progress,
  calm,
}: {
  progress: MotionValue<number>;
  calm: boolean;
}) {
  const x = useTransform(progress, [0.04, 0.09], calm ? [0, 0] : [150, 0]);
  return (
    <Beat
      progress={progress}
      enter={0.04}
      exit={0.11}
      y={0}
      calm={calm}
      className="absolute right-6 top-1/4 w-[min(80vw,20rem)]"
    >
      <motion.div style={{ x }}>
        <GlassPanel tight className="rounded-2xl rounded-br-sm p-4">
          <p className="text-sm font-semibold text-white">
            &ldquo;This was due yesterday. Where are we on it?&rdquo;
          </p>
          <p className="mt-1 text-xs text-white/60">— your boss</p>
        </GlassPanel>
      </motion.div>
    </Beat>
  );
}

export default function PartProblem() {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Sky grades ONCE through hot-day → dusk → night (monotonic, no repeat).
  const sky = useTransform(
    scrollYProgress,
    [0, 0.42, 0.49, 0.57, 1],
    [
      "linear-gradient(180deg,#7db8e0,#f2d24a)",
      "linear-gradient(180deg,#7db8e0,#f2d24a)",
      "linear-gradient(180deg,#c9683f,#e8a24a)",
      "linear-gradient(180deg,#111a33,#241722)",
      "linear-gradient(180deg,#0b1020,#160f14)",
    ],
  );

  // Oversaturated, wrong-feeling sun — burns out toward night.
  const sunOpacity = useTransform(scrollYProgress, [0.42, 0.57], [1, 0.12]);

  // Beat 5 — camera pushes into his iris (upper-centre of frame).
  const irisScale = useTransform(
    scrollYProgress,
    [0.57, 0.72],
    [1, calm ? 1 : 5.5],
  );
  const irisVignette = useTransform(
    scrollYProgress,
    [0.56, 0.66],
    [0, calm ? 0.5 : 1],
  );

  // Beat 7 — one continuous clip-path inset wipe on the whole section,
  // revealing Part 2 underneath. Man's silhouette holds position across it.
  const wipe = useTransform(
    scrollYProgress,
    [0.88, 1],
    ["inset(0 0 0 0)", "inset(0 0 100% 0)"],
  );
  const holdSilhouette = useTransform(scrollYProgress, [0.8, 0.9], [0, 0.55]);

  return (
    <motion.section
      ref={ref}
      id="problem"
      className="relative h-[600vh]"
      style={{ clipPath: wipe }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* sky */}
        <motion.div className="absolute inset-0" style={{ background: sky }} />

        {/* oversaturated sun */}
        <motion.div
          style={{ opacity: sunOpacity }}
          animate={calm ? undefined : { scale: [1, 1.06, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[12%] top-[8%] h-64 w-64 rounded-full mix-blend-screen"
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background:
                "radial-gradient(circle,#fffdf0 0%,#ffe08a 38%,rgba(255,224,138,0) 72%)",
            }}
          />
        </motion.div>

        {/* the scene — man at a cluttered hillside desk beside the tree.
            Wrapped so the iris zoom scales it toward his eye. */}
        <motion.div
          className="absolute inset-0"
          style={{ scale: irisScale, transformOrigin: "50% 42%" }}
        >
          <ParallaxImage
            asset={STORY_ASSETS.problemComposite}
            driver={scrollYProgress}
            shift={40}
            zoom={0.06}
          />
        </motion.div>

        {/* dark iris vignette that closes in during the zoom */}
        <motion.div
          style={{ opacity: irisVignette }}
          className="pointer-events-none absolute inset-0"
        >
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(circle at 50% 46%,rgba(0,0,0,0) 8%,rgba(0,0,0,0.55) 26%,#050608 46%)",
            }}
          />
        </motion.div>

        {/* silhouette that holds position through the wipe (same place healing) */}
        <motion.div
          style={{ opacity: holdSilhouette }}
          className="pointer-events-none absolute bottom-0 left-1/2 h-[46%] w-[26%] -translate-x-1/2 rounded-t-[45%] bg-black/70 blur-[2px]"
        />

        {/* Beat 1 — grind headline */}
        <Beat
          progress={scrollYProgress}
          enter={0.02}
          exit={0.12}
          calm={calm}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <h2 className="max-w-3xl text-4xl font-extrabold sm:text-6xl">
            You work a ton. Then you &ldquo;take a break.&rdquo;
          </h2>
        </Beat>

        {/* Beat 1 — boss scolding */}
        <BossBubble progress={scrollYProgress} calm={calm} />

        {/* Beat 2 — phone fills the frame, apps load in sequence */}
        <PhoneOverlay progress={scrollYProgress} calm={calm} />

        {/* Beat 3 — roast-meter ring (head-lid → microwave cabled to the tree) */}
        <RoastMeter progress={scrollYProgress} calm={calm} />
        <Beat
          progress={scrollYProgress}
          enter={0.29}
          exit={0.4}
          calm={calm}
          className="absolute inset-x-0 top-[18%] flex justify-center px-6 text-center"
        >
          <h2 className="max-w-2xl text-3xl font-extrabold sm:text-5xl">
            He pops the lid of his head and sets his brain in the microwave.
          </h2>
        </Beat>

        {/* Beat 5 — the 3 aftermath lines inside the dark iris */}
        <IrisLines progress={scrollYProgress} calm={calm} />

        {/* Beat 6 — ASSESSMENT OF THE DAY */}
        <AssessmentPanel progress={scrollYProgress} calm={calm} />

        {/* Deck story cards — one per sub-beat, crossfading */}
        <DeckCard
          progress={scrollYProgress}
          enter={0.02}
          exit={0.12}
          calm={calm}
          kicker="Work a ton"
          title="Most of your day goes on the desk."
          lines={[
            "Student or working professional — the hours pile up in a chair.",
          ]}
        />
        <DeckCard
          progress={scrollYProgress}
          enter={0.14}
          exit={0.26}
          calm={calm}
          kicker="Tired takes a break"
          title="The easiest break? Pick up your phone."
          lines={["“Just a few minutes,” you say to yourself."]}
        />
        <DeckCard
          progress={scrollYProgress}
          enter={0.28}
          exit={0.41}
          calm={calm}
          kicker="Your brain is hacked"
          title="&ldquo;I've scrolled a lot — I need to get back to work.&rdquo;"
          lines={["Productivity: Dipped."]}
        />
        <DeckCard
          progress={scrollYProgress}
          enter={0.43}
          exit={0.56}
          calm={calm}
          kicker="The Doom Scroll Aftermath"
          title="A whole day, gone — day to dusk to night."
          lines={[
            "“I feel like a piece of crap now. We'll work tomorrow.”",
          ]}
        />

        {/* Beat 7 — the Turn */}
        <Beat
          progress={scrollYProgress}
          enter={0.88}
          exit={1}
          hold
          calm={calm}
          className="absolute inset-x-0 bottom-16 flex justify-center px-6 text-center"
        >
          <p className="text-lg font-semibold text-white/80">
            Let&rsquo;s fix the break.
          </p>
        </Beat>
      </div>
    </motion.section>
  );
}
