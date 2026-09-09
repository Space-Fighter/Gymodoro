import { useRef } from "react";
import { useInView, useMotionValueEvent, useScroll } from "framer-motion";
import { useCalm } from "./storyScroll";
import ScrubVideo from "./ScrubVideo";
import { useTrack, useSfx } from "./useStoryAudio";
import { STORY_ASSETS, PROBLEM_VIDEO_MP4 } from "./assets";
import { PART1_TRACK, PROBLEM_DING, DING_AT } from "./audio";

/**
 * Part 1 — The Problem. The whole scene IS the generated clip, scrubbed by
 * scroll (cluttered hillside desk → phone/apps → head-lid → microwave →
 * nightfall → the eye). No HTML overlays. A tense music bed plays while it's on
 * screen; the notification ding rings once as the scrub reaches the app-open
 * moment (~12% in). Part 2 fades in over the top at the end (see PartSolution).
 */
export default function PartProblem() {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // "some" = any part of the (very tall) section intersects the viewport. An
  // `amount` fraction can never be satisfied by a 600vh element.
  const inView = useInView(ref, { amount: "some" });
  useTrack(PART1_TRACK, inView, { volume: 0.6 });

  const ding = useSfx(PROBLEM_DING, { volume: 0.85 });
  const armed = useRef(true);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (p < DING_AT - 0.06) armed.current = true;
    if (p >= DING_AT && armed.current) {
      armed.current = false;
      ding();
    }
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
      </div>
    </section>
  );
}
