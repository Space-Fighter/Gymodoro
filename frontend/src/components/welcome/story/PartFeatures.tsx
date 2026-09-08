import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import ParallaxImage from "./ParallaxImage";
import { GlassPanel } from "./motion";
import { useCalm } from "./storyScroll";
import { STORY_ASSETS, type StoryAsset } from "./assets";

/**
 * Part 3 — The Features, told as ONE continuous, unbroken left→right walk
 * (beat 11). Not a feature grid: the man strolls his dog past the real in-app
 * screenshots, which stand along the path as framed "stations" he passes
 * through. Three layers move at their own rates over one continuous ground
 * strip so it reads as a single stroll:
 *
 *   - the ground strip drifts slowest (far parallax),
 *   - the screenshot track travels 0% → -80% with scroll (the "walk"),
 *   - the walking-man-with-dog cut-out + his one glass caption drift together
 *     at an in-between rate, so he appears to move along the path.
 *
 * The active station is tracked with a single `useMotionValueEvent` listener +
 * `useState` (never `useTransform` inside `.map`); the caption text swaps per
 * station. Under `useCalm()` the horizontal travel is dropped for a plain
 * vertical stack. `<ActCTA/>` follows, rendered by `<StoryWelcome/>`.
 */

interface Station {
  asset: StoryAsset;
  guy: StoryAsset;
  label: string;
  caption: string;
}

const STATIONS: Station[] = [
  {
    asset: STORY_ASSETS.shotTimerFocus,
    guy: STORY_ASSETS.walkGuyCoffee,
    label: "Focus timer",
    caption: "The focus timer runs. He sips his coffee and keeps walking.",
  },
  {
    asset: STORY_ASSETS.shotTimerBreak,
    guy: STORY_ASSETS.walkGuyPlank,
    label: "Break timer",
    caption: "Break time. He drops into planks while the dog waits.",
  },
  {
    asset: STORY_ASSETS.shotWorkoutLibrary,
    guy: STORY_ASSETS.walkGuyCoffee,
    label: "Workout Library",
    caption: "He thumbs the Workout Library for the next move.",
  },
  {
    asset: STORY_ASSETS.shotStats,
    guy: STORY_ASSETS.walkGuyBench,
    label: "Stats",
    caption: "On a bench he reads his stats — focus and health both trending up.",
  },
  {
    asset: STORY_ASSETS.shotBackground,
    guy: STORY_ASSETS.walkGuyCoffee,
    label: "Wallpaper",
    caption: "He grins, swaps his wallpaper, and walks on.",
  },
];

/** A transparent walking-man cut-out, or a labelled placeholder until delivered. */
function WalkGuy({ asset }: { asset: StoryAsset }) {
  if (asset.src) {
    return (
      <img
        src={asset.src}
        alt={asset.alt}
        className="h-full w-full object-contain object-bottom"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-end justify-center">
      <span className="mb-2 rounded bg-black/45 px-2 py-1 text-[11px] font-medium text-white/80">
        walking man + dog
      </span>
    </div>
  );
}

export default function PartFeatures() {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // The screenshot track travels furthest; the man and the ground drift slower
  // so the layers separate into depth and he reads as walking along the path.
  const trackX = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);
  const manX = useTransform(scrollYProgress, [0, 1], ["2%", "-46%"]);
  const groundX = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);

  const [station, setStation] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(STATIONS.length - 1, Math.max(0, Math.floor(p * STATIONS.length)));
    setStation(next);
  });

  const ground = STORY_ASSETS.walkGround;
  const groundStyle = ground.src
    ? { backgroundImage: `url(${ground.src})`, backgroundSize: "auto 100%", backgroundRepeat: "repeat-x" }
    : { background: ground.fallback };

  // ── Reduced motion: no lateral travel, plain vertical stack ────────────────
  if (calm) {
    return (
      <section id="features" className="relative bg-gradient-to-b from-[#8fd0a6] to-[#3ba85c] px-6 py-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-16">
          {STATIONS.map((s) => (
            <div key={s.label} className="flex flex-col gap-4">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/40 shadow-2xl">
                <ParallaxImage asset={s.asset} />
              </div>
              <GlassPanel className="w-full p-4 text-center" tight>
                <p className="text-sm text-white">{s.caption}</p>
              </GlassPanel>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="features" className="relative h-[500vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-gradient-to-b from-[#bfe3ff] via-[#8fd0a6] to-[#3ba85c]">
        {/* far layer — one continuous ground strip, drifts slowest */}
        <motion.div
          aria-hidden
          style={{ x: groundX, ...groundStyle }}
          className="absolute bottom-0 left-0 h-[22vh] w-[300%] will-change-transform"
        />

        {/* mid layer — the screenshot "stations" along the path */}
        <motion.div
          style={{ x: trackX }}
          className="absolute top-1/2 left-0 flex -translate-y-[58%] items-center gap-[8vw] px-[10vw] will-change-transform"
        >
          {STATIONS.map((s) => (
            <figure
              key={s.label}
              className="relative m-0 aspect-[16/10] w-[72vw] shrink-0 overflow-hidden rounded-2xl border border-white/40 bg-[#12241c] shadow-2xl sm:w-[44vw]"
            >
              <ParallaxImage asset={s.asset} />
              <figcaption className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white/85">
                {s.label}
              </figcaption>
            </figure>
          ))}
        </motion.div>

        {/* near layer — the walking man + his one travelling caption */}
        <motion.div
          style={{ x: manX }}
          className="absolute bottom-0 left-[6vw] flex w-[38vw] max-w-[22rem] flex-col items-center will-change-transform"
        >
          <GlassPanel className="mb-3 w-[min(80vw,22rem)] p-3 text-center" tight>
            <p className="text-sm text-white">{STATIONS[station].caption}</p>
          </GlassPanel>
          <div className="h-[46vh] w-full">
            <WalkGuy asset={STATIONS[station].guy} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
