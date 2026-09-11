import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCalm } from "./storyScroll";
import ScrubVideo from "./ScrubVideo";
import { STORY_ASSETS, FEATURES_VIDEO_MP4 } from "./assets";

/**
 * Part 3 — A day with the app. Same treatment as Parts 1 & 2: the scene is a
 * scroll-scrubbed clip (the guy walking his dog, using Gymodoro through the day).
 * Falls back to the poster still until `features-scrub.mp4` is dropped in.
 * Cross-dissolves in over Part 2's end.
 */
export default function PartFeatures() {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const fadeIn = useTransform(scrollYProgress, [0, 0.14], [0, 1]);

  return (
    <section ref={ref} id="features" className="relative -mt-[85vh] h-[600vh]">
      <motion.div
        style={{ opacity: calm ? 1 : fadeIn }}
        className="sticky top-0 h-screen w-full overflow-hidden"
      >
        <ScrubVideo
          progress={scrollYProgress}
          calm={calm}
          src={FEATURES_VIDEO_MP4}
          poster={STORY_ASSETS.featuresPoster.src}
          alt={STORY_ASSETS.featuresPoster.alt}
        />
      </motion.div>
    </section>
  );
}
