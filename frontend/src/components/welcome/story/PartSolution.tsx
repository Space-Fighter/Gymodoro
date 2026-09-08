import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ParallaxImage from "./ParallaxImage";
import { GlassPanel } from "./motion";
import { STORY_ASSETS } from "./assets";

/**
 * Part 2 — The Solution. Beats 8–10 (see plan): Swiss picnic work (cow peeking,
 * stream flowing) → Swiss workout (cat-cow, push-ups, impact stats) → the beach
 * payoff peak (ripped guy + friends + VW van + rainforest). Beat 10 is the
 * single biggest section on the page.
 *
 * Phase-A stub: structure + copy + parallax. `agent-solution` adds the looping
 * <video> stream, drifting clouds, SVG-turbulence water fallback, grass sway,
 * animated impact counters, and the full-bleed payoff hero.
 */

const IMPACT = [
  { n: "+2 hrs", label: "focused work reclaimed daily" },
  { n: "5–8", label: "movement breaks a day" },
  { n: "-40%", label: "afternoon energy crashes" },
];

export default function PartSolution() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const payoffText = useTransform(scrollYProgress, [0.72, 0.85], [40, 0]);

  return (
    <section ref={ref} id="solution" className="relative">
      {/* Beat 8 — Swiss work */}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <ParallaxImage asset={STORY_ASSETS.picnicScene} driver={scrollYProgress} />
        <div className="relative z-10 max-w-xl px-6 text-center">
          <h2 className="text-4xl font-extrabold sm:text-6xl">Keep the rhythm. Fix the break.</h2>
          <GlassPanel className="mt-6 p-6 text-left">
            <p className="text-sm text-white/90">
              Same Pomodoro framework you already trust — 25 on, 5 off, a long break
              every four rounds. Gymodoro just turns every one of those breaks into
              movement instead of a chair and a screen.
            </p>
          </GlassPanel>
        </div>
      </div>

      {/* Beat 9 — Swiss workout + impact */}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <ParallaxImage asset={STORY_ASSETS.pushups} driver={scrollYProgress} position="bottom" />
        <div className="relative z-10 grid w-full max-w-3xl grid-cols-1 gap-4 px-6 sm:grid-cols-3">
          {IMPACT.map((s) => (
            <GlassPanel key={s.label} className="p-5 text-center" tight>
              <div className="text-3xl font-extrabold text-white">{s.n}</div>
              <div className="mt-1 text-xs text-white/80">{s.label}</div>
            </GlassPanel>
          ))}
        </div>
      </div>

      {/* Beat 10 — the beach payoff peak (biggest section) */}
      <div className="relative flex min-h-[140vh] items-center justify-center overflow-hidden">
        <ParallaxImage asset={STORY_ASSETS.vanBeach} driver={scrollYProgress} shift={120} zoom={0.12} priority />
        <motion.div style={{ y: payoffText }} className="relative z-10 px-6 text-center">
          <h2 className="text-5xl font-extrabold drop-shadow-lg sm:text-8xl">
            This is what recovered looks like.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/90">
            Healthy. Productive. Actually living. The work still gets done —
            you just don't pay for it with your body.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
