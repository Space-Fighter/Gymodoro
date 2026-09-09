import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useCalm } from "./storyScroll";
import ScrubVideo from "./ScrubVideo";
import { useTrack } from "./useStoryAudio";
import { STORY_ASSETS, SOLUTION_VIDEO_MP4 } from "./assets";
import { PART2_TRACK } from "./audio";

/**
 * Part 2 — The Solution. The whole scene IS the transformation clip, scrubbed by
 * scroll (Swiss picnic work with the cow → shirtless workout → beach payoff). No
 * overlays. An uplifting music bed plays while it's on screen.
 *
 * Seam: this section is pulled up ~80vh over the end of Part 1 and its sticky
 * child fades in over that overlap, so Part 2 cross-dissolves over Part 1's last
 * frame — no hard cut, no background flash.
 */
export default function PartSolution() {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const inView = useInView(ref, { amount: "some" });
  useTrack(PART2_TRACK, inView, { volume: 0.7 });

  // Cross-dissolve Part 2's footage in over Part 1's last frame (the section is
  // pulled up so this overlap sits on top of Part 1's end). No background layer —
  // it's a straight video-to-video dissolve, dark eye → bright meadow.
  const fadeIn = useTransform(scrollYProgress, [0, 0.14], [0, 1]);

  return (
    <section ref={ref} id="solution" className="relative -mt-[85vh] h-[600vh]">
      <motion.div
        style={{ opacity: calm ? 1 : fadeIn }}
        className="sticky top-0 h-screen w-full overflow-hidden"
      >
        <ScrubVideo
          progress={scrollYProgress}
          calm={calm}
          src={SOLUTION_VIDEO_MP4}
          poster={STORY_ASSETS.solutionPoster.src}
          alt={STORY_ASSETS.solutionPoster.alt}
        />
      </motion.div>
    </section>
  );
}
