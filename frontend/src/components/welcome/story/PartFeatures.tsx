import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import ParallaxImage from "./ParallaxImage";
import { GlassPanel } from "./motion";
import { useCalm } from "./storyScroll";
import { STORY_ASSETS } from "./assets";

/**
 * Part 3 — The Features, told as ONE continuous left→right walk (beat 11). The
 * guy strolls his dog past real in-app screenshots that act as "stations": a
 * single unbroken stroll, not a feature grid. One .glass caption travels with
 * him, its text swapping per station.
 *
 * Phase-A stub: horizontal pan mechanic + real-screenshot slots + captions.
 * `agent-features` composites the walking-guy-with-dog layer drifting at its own
 * rate and refines the per-station choreography, then resolves into <ActCTA>.
 */

const STATIONS = [
  { asset: STORY_ASSETS.shotTimerFocus, caption: "Focus timer running — he sips his coffee and keeps walking." },
  { asset: STORY_ASSETS.shotTimerBreak, caption: "Break timer hits — he drops into a plank while the dog waits." },
  { asset: STORY_ASSETS.shotWorkoutLibrary, caption: "Picks the next move from the Workout Library." },
  { asset: STORY_ASSETS.shotStats, caption: "Reads his stats on a bench — focus and health both trending up." },
  { asset: STORY_ASSETS.shotBackground, caption: "Swaps his wallpaper, grins, walks on." },
];

export default function PartFeatures() {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Inner track travels left as you scroll down (the "walk").
  const x = useTransform(scrollYProgress, [0, 1], ["0%", calm ? "0%" : "-80%"]);
  const [station, setStation] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setStation(Math.min(STATIONS.length - 1, Math.floor(p * STATIONS.length)));
  });

  return (
    <section ref={ref} id="features" className="relative h-[500vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden bg-gradient-to-b from-[#8fd0a6] to-[#3ba85c]">
        <motion.div style={{ x }} className="flex items-center gap-[6vw] px-[10vw] will-change-transform">
          {STATIONS.map((s, i) => (
            <div
              key={i}
              className="relative aspect-[16/10] w-[70vw] shrink-0 overflow-hidden rounded-2xl border border-white/40 shadow-2xl sm:w-[46vw]"
            >
              <ParallaxImage asset={s.asset} />
            </div>
          ))}
        </motion.div>

        {/* traveling caption */}
        <GlassPanel className="absolute bottom-10 left-1/2 w-[min(90vw,32rem)] -translate-x-1/2 p-4 text-center" tight>
          <p className="text-sm text-white">{STATIONS[station].caption}</p>
        </GlassPanel>
      </div>
    </section>
  );
}
