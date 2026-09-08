import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import ParallaxImage from "./ParallaxImage";
import { GlassPanel } from "./motion";
import { useCalm } from "./storyScroll";
import { STORY_ASSETS } from "./assets";

/**
 * Part 2 — The Solution. Beats 8–10 of the scroll story:
 *
 *  8. Swiss work    — man working happily at a picnic table in a Swiss-style
 *     meadow, a cow peeking over his shoulder, a crystal-clear stream running
 *     beside him (living motion: looping <video>, or an animated SVG-turbulence
 *     fallback over the still).
 *  9. Swiss workout — same meadow, cat-cow then push-ups, cow grazing, water
 *     running. Deck's "IMPACT OF GYMODORO" stats roll up as counters when
 *     scrolled into view.
 * 10. The payoff   — the emotional peak of the whole page, and its biggest
 *     section: man ripped / Greek-statue aesthetic at the beach by the VW van
 *     near the rainforest, best friends having the time of their lives. Camera
 *     pulls back so the sand becomes a ground strip that hands off to Part 3.
 *
 * Continuous life: 3 drifting cumulus layers + a grass sway, independent of
 * scroll, all frozen under `useCalm()`.
 *
 * Animates only transform / opacity / clip-path.
 */

// ── Deck: IMPACT OF GYMODORO (GYMODORO.pdf p.14) ────────────────────────────
const IMPACT_STATS = [
  { target: 2.5, decimals: 1, suffix: " hrs", label: "of deep work reclaimed every day" },
  { target: 7, decimals: 0, suffix: "", label: "movement breaks a day, not doom-scrolls" },
  { target: 41, decimals: 0, suffix: "%", label: "sharper focus after an active break" },
  { target: 68, decimals: 0, suffix: "%", label: "fewer afternoon distraction spirals" },
  { target: 100, decimals: 0, suffix: "%", label: "productive, healthy and happy" },
] as const;

const CLOUD_LAYERS = [
  { asset: STORY_ASSETS.cloudA, top: "6%", width: 300, duration: 92, opacity: 0.9 },
  { asset: STORY_ASSETS.cloudB, top: "16%", width: 420, duration: 128, opacity: 0.8 },
  { asset: STORY_ASSETS.cloudA, top: "27%", width: 220, duration: 68, opacity: 0.65 },
] as const;

/** Fat cumulus that drift across forever, at different speeds for depth. */
function DriftingClouds() {
  const calm = useCalm();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {CLOUD_LAYERS.map((c, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: c.top,
            width: c.width,
            height: c.width * 0.5,
            left: 0,
            opacity: c.opacity,
            background: c.asset.src ? undefined : c.asset.fallback,
            borderRadius: "50%",
            filter: c.asset.src ? undefined : "blur(6px)",
          }}
          initial={{ x: "-25vw" }}
          animate={calm ? { x: "20vw" } : { x: ["-25vw", "120vw"] }}
          transition={
            calm
              ? { duration: 0 }
              : { duration: c.duration, repeat: Infinity, ease: "linear" }
          }
        >
          {c.asset.src && (
            <img src={c.asset.src} alt="" className="h-full w-full object-contain" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * The stream, as living motion. Real loop clip when delivered; otherwise the
 * still plate under an animated feTurbulence/feDisplacementMap that fakes flow.
 * Everything stops (no autoplay, static poster, no SMIL) under `useCalm()`.
 */
function LivingStream() {
  const calm = useCalm();
  const webm: string | undefined = STORY_ASSETS.streamLoopWebm.src;
  const mp4: string | undefined = STORY_ASSETS.streamLoopMp4.src;
  const still: string | undefined = STORY_ASSETS.streamStill.src;

  const band = "absolute inset-x-0 bottom-0 h-[42%] overflow-hidden";

  if (webm || mp4) {
    return (
      <div className={band} aria-hidden>
        <video
          className="h-full w-full object-cover"
          autoPlay={!calm}
          muted
          loop
          playsInline
          preload="none"
          poster={still}
        >
          {webm && <source src={webm} type="video/webm" />}
          {mp4 && <source src={mp4} type="video/mp4" />}
        </video>
      </div>
    );
  }

  // Fallback: still (or gradient) under an animated displacement filter.
  return (
    <div className={band} aria-hidden>
      <svg className="absolute h-0 w-0">
        <filter id="stream-flow">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.04"
            numOctaves={2}
            seed={4}
            result="noise"
          >
            {!calm && (
              <animate
                attributeName="baseFrequency"
                dur="7s"
                values="0.012 0.04;0.016 0.05;0.012 0.04"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" />
        </filter>
      </svg>
      <div
        className="h-full w-full"
        style={{
          filter: calm ? undefined : "url(#stream-flow)",
          background: still
            ? `url(${still}) center/cover`
            : STORY_ASSETS.streamStill.fallback,
        }}
      />
      <div className={calm ? "absolute inset-0" : "wd-water absolute inset-0"} />
    </div>
  );
}

/** A single IMPACT stat that rolls up from 0 the first time it's on screen. */
function StatCounter({
  target,
  decimals,
  suffix,
  label,
}: {
  target: number;
  decimals: number;
  suffix: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const calm = useCalm();
  const mv = useMotionValue(0);
  const [value, setValue] = useState(0);

  useEffect(() => {
    // Roll up only when scrolled into view and motion is allowed; the calm
    // branch renders `target` directly below, so no effect work is needed.
    if (!inView || calm) return;
    const controls = animate(mv, target, { duration: 1.6, ease: "easeOut" });
    const unsub = mv.on("change", (v) => setValue(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [inView, calm, target, mv]);

  return (
    <div ref={ref}>
      <GlassPanel className="p-5 text-center" tight>
        <div className="font-[var(--font-poppins)] text-4xl font-extrabold tabular-nums text-white">
          {(calm ? target : value).toFixed(decimals)}
          {suffix}
        </div>
        <div className="mt-2 text-xs leading-snug text-white/85">{label}</div>
      </GlassPanel>
    </div>
  );
}

export default function PartSolution() {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Beat 9 crossfade: cat-cow → push-ups.
  const catCowOpacity = useTransform(scrollYProgress, [0.28, 0.36, 0.5, 0.58], [0, 1, 1, 0]);
  const pushupsOpacity = useTransform(scrollYProgress, [0.5, 0.58], [0, 1]);

  // Beat 10: camera pulls back (scale eases down) as the payoff resolves, so the
  // beach sand reads as continuing into Part 3.
  const payoffScale = useTransform(
    scrollYProgress,
    calm ? [0, 1] : [0.6, 1],
    calm ? [1, 1] : [1.14, 1],
  );
  const payoffTextY = useTransform(scrollYProgress, [0.64, 0.8], [48, 0]);
  const payoffTextOpacity = useTransform(scrollYProgress, [0.62, 0.76], [0, 1]);

  return (
    <section ref={ref} id="solution" className="relative">
      {/* Continuous sky → horizon gradient behind every beat; carries into Part 3. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg,#4a8fd6 0%,#7cc0ee 34%,#bfe3ff 55%,#dfeecb 78%,#8fd0a6 100%)",
        }}
      />

      {/* ── Beat 8 — Swiss work ──────────────────────────────────────────── */}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <ParallaxImage asset={STORY_ASSETS.picnicScene} driver={scrollYProgress} shift={60} />
        <DriftingClouds />
        <LivingStream />
        <div
          aria-hidden
          className={
            calm
              ? "absolute inset-x-0 bottom-0 h-[16vh]"
              : "wd-grass absolute inset-x-0 bottom-0 h-[16vh]"
          }
          style={{ background: "linear-gradient(180deg,rgba(75,226,119,0),#2f9e52)" }}
        />
        <div className="relative z-10 mx-auto max-w-xl px-6 text-center">
          <h2 className="text-4xl font-extrabold sm:text-6xl">Keep the rhythm. Fix the break.</h2>
          <GlassPanel className="mt-8 p-6 text-left">
            <p className="text-sm leading-relaxed text-white/90">
              Same Pomodoro framework you already trust — 25 minutes on, a short
              break off, a long one every four rounds. Gymodoro keeps the exact
              productivity loop and turns every one of those breaks into movement
              instead of a chair and a screen.
            </p>
            <p className="mt-4 text-sm font-semibold italic text-white">
              &ldquo;We aren&rsquo;t asking you to change how you work. We&rsquo;re
              transforming how you recover.&rdquo;
            </p>
          </GlassPanel>
        </div>
      </div>

      {/* ── Beat 9 — Swiss workout + IMPACT counters ─────────────────────── */}
      <div className="relative flex min-h-[150vh] flex-col items-center justify-center overflow-hidden py-24">
        <motion.div style={{ opacity: catCowOpacity }} className="absolute inset-0">
          <ParallaxImage asset={STORY_ASSETS.catCow} driver={scrollYProgress} shift={50} position="bottom" />
        </motion.div>
        <motion.div style={{ opacity: pushupsOpacity }} className="absolute inset-0">
          <ParallaxImage asset={STORY_ASSETS.pushups} driver={scrollYProgress} shift={50} position="bottom" />
        </motion.div>
        <DriftingClouds />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extrabold sm:text-5xl">Cat-cow. Push-ups. Repeat.</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/90">
            Five to eight short bouts of real movement, spaced through the day —
            enough to change how the whole day feels.
          </p>
        </div>

        <div className="relative z-10 mt-12 grid w-full max-w-5xl grid-cols-2 gap-4 px-6 sm:grid-cols-3 lg:grid-cols-5">
          {IMPACT_STATS.map((s) => (
            <StatCounter
              key={s.label}
              target={s.target}
              decimals={s.decimals}
              suffix={s.suffix}
              label={s.label}
            />
          ))}
        </div>
      </div>

      {/* ── Beat 10 — the payoff (THE peak — most vertical space) ─────────── */}
      <div className="relative flex min-h-[160vh] items-center justify-center overflow-hidden">
        <motion.div style={{ scale: payoffScale }} className="absolute inset-0">
          <ParallaxImage
            asset={STORY_ASSETS.vanBeach}
            shift={0}
            zoom={0}
            position="center"
            priority
          />
        </motion.div>
        <DriftingClouds />

        <motion.div
          style={{ y: payoffTextY, opacity: payoffTextOpacity }}
          className="relative z-10 mx-auto max-w-4xl px-6 text-center"
        >
          <GlassPanel className="inline-block px-8 py-7 sm:px-12 sm:py-10">
            <h2 className="text-4xl font-extrabold leading-[1.05] sm:text-7xl">
              This is what recovered looks like.
            </h2>
          </GlassPanel>
          <p className="mx-auto mt-6 max-w-lg text-base text-white/90 sm:text-lg">
            Ripped, rested, and still shipping the work. Best friends, salt air,
            nothing left to catch up on. The break stopped costing you your body.
          </p>
        </motion.div>

        {/* Seam → Part 3: the sand becomes a lush ground strip, camera pulled
            back, sky gradient continuous. Part 3 picks the horizon up from here. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[26vh]"
          style={{
            background:
              "linear-gradient(180deg,rgba(232,214,168,0) 0%,#e8d6a8 30%,#a9cf82 68%,#3ba85c 100%)",
          }}
        />
        <div
          aria-hidden
          className={
            calm
              ? "pointer-events-none absolute inset-x-0 bottom-0 h-[9vh]"
              : "wd-grass pointer-events-none absolute inset-x-0 bottom-0 h-[9vh]"
          }
          style={{ background: "linear-gradient(180deg,rgba(59,168,92,0),#2f9e52)" }}
        />
      </div>
    </section>
  );
}
