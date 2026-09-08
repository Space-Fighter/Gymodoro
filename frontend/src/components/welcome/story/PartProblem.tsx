import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ParallaxImage from "./ParallaxImage";
import { GlassPanel } from "./motion";
import { useCalm } from "./storyScroll";
import { STORY_ASSETS } from "./assets";

/**
 * Part 1 — The Problem. Beats 1–7 (see plan). Scorched XP-Bliss hill turned
 * surreal: grind + boss scolding → phone apps load → head-lid + brain-in-
 * microwave → keep scrolling as day→dusk→night → zoom to iris + 3 aftermath
 * lines → ASSESSMENT all LOW → clip-path Turn wipe into Part 2.
 *
 * Phase-A stub: establishes the pinned structure, copy, and the scroll driver.
 * `agent-problem` fleshes out the composite layers, roast-meter ring, day→night
 * sky grade, and the iris zoom.
 */

const AFTERMATH = [
  "Ahh I did it again.",
  "I feel like a piece of crap now.",
  "I guess I'll work tomorrow.",
];

const ASSESSMENT = ["PRODUCTIVITY", "ENJOYMENT", "SATISFACTION", "ACTIVENESS"];

export default function PartProblem() {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Sky grade: day → dusk → night across the section.
  const sky = useTransform(
    scrollYProgress,
    [0, 0.45, 0.7, 1],
    [
      "linear-gradient(180deg,#5aa0dd,#e7c94f)",
      "linear-gradient(180deg,#c96f4a,#e7a24d)",
      "linear-gradient(180deg,#1c2a44,#3a2f2a)",
      "linear-gradient(180deg,#0b1020,#160f14)",
    ],
  );
  const roast = useTransform(scrollYProgress, [0.2, 0.85], ["0%", "100%"]);
  const irisScale = useTransform(scrollYProgress, [0.55, 0.8], [1, calm ? 1 : 6]);
  // clip-path Turn wipe hand-off — Part 2 sits underneath in the DOM.
  const wipe = useTransform(
    scrollYProgress,
    [0.88, 1],
    ["inset(0 0 0 0)", "inset(0 0 100% 0)"],
  );

  return (
    <motion.section
      ref={ref}
      id="problem"
      className="relative h-[600vh]"
      style={{ clipPath: wipe }}
    >
      <motion.div className="sticky top-0 h-screen w-full overflow-hidden" style={{ background: sky }}>
        <motion.div style={{ scale: irisScale }} className="absolute inset-0">
          <ParallaxImage
            asset={STORY_ASSETS.problemComposite}
            driver={scrollYProgress}
            shift={40}
            className="opacity-90 mix-blend-luminosity"
          />
        </motion.div>

        {/* roast meter */}
        <div className="absolute left-6 top-24 h-2 w-40 overflow-hidden rounded-full bg-black/40">
          <motion.div className="h-full bg-orange-400" style={{ width: roast }} />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
          <h2 className="max-w-3xl text-4xl font-extrabold sm:text-6xl">
            You work like hell. Then you "take a break."
          </h2>
          <div className="flex flex-col gap-1 text-lg font-semibold text-white/90">
            {AFTERMATH.map((line) => (
              <span key={line}>“{line}”</span>
            ))}
          </div>

          <GlassPanel className="mt-4 w-full max-w-md p-6" tight>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/70">
              Assessment of the day
            </p>
            <ul className="space-y-1 text-sm">
              {ASSESSMENT.map((k) => (
                <li key={k} className="flex justify-between">
                  <span className="text-white/80">{k}</span>
                  <span className="font-bold text-red-300">LOW</span>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>
      </motion.div>
    </motion.section>
  );
}
