import { useRef } from "react";
import { useScroll } from "framer-motion";
import { useCalm } from "./storyScroll";
import ScrubVideo from "./ScrubVideo";
import { STORY_ASSETS, SOLUTION_VIDEO_MP4 } from "./assets";

/**
 * Part 2 — The Solution. The whole scene IS the transformation clip, scrubbed by
 * scroll (Swiss picnic work with the cow → shirtless workout in the meadow). No
 * overlays — the footage carries it. Hands off to Part 3 at the bottom.
 */
export default function PartSolution() {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={ref} id="solution" className="relative h-[600vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0b1020]">
        <ScrubVideo
          progress={scrollYProgress}
          calm={calm}
          src={SOLUTION_VIDEO_MP4}
          poster={STORY_ASSETS.solutionPoster.src}
          alt={STORY_ASSETS.solutionPoster.alt}
        />
      </div>
    </section>
  );
}
