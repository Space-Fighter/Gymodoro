import { useRef } from "react";
import { useScroll } from "framer-motion";
import { useCalm } from "./storyScroll";
import ScrubVideo from "./ScrubVideo";
import SceneCaptions, { type Caption } from "./SceneCaptions";
import { STORY_ASSETS, PROBLEM_VIDEO_MP4 } from "./assets";

const CAPTIONS: Caption[] = [
  { at: [0.02, 0.14], text: "Work a ton. Most of your day goes on the desk." },
  { at: [0.17, 0.3], text: "Tired? Take a break — just a few minutes, you say." },
  { at: [0.33, 0.47], text: "Your brain is hacked. Back to work now." },
  { at: [0.51, 0.63], text: "The doom-scroll aftermath." },
];

/**
 * Part 1 — The Problem. The whole scene IS the generated clip, scrubbed by
 * scroll (cluttered hillside desk → phone/apps → head-lid → microwave →
 * nightfall → the eye). Captions from the pitch deck's problem-statement
 * beats fade in over the matching stretch of footage. Part 2 fades in over
 * the top at the end (see PartSolution).
 */
export default function PartProblem() {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={ref} id="problem" className="relative h-[600vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <ScrubVideo
          progress={scrollYProgress}
          calm={calm}
          src={PROBLEM_VIDEO_MP4}
          poster={STORY_ASSETS.problemPoster.src}
          alt={STORY_ASSETS.problemPoster.alt}
        />
        <SceneCaptions progress={scrollYProgress} captions={CAPTIONS} />
      </div>
    </section>
  );
}
