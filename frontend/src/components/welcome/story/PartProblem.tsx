import { useEffect, useRef } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useCalm } from "./storyScroll";
import { useSceneAudio } from "./sceneAudioContext";
import ScrubVideo from "./ScrubVideo";
import {
  STORY_ASSETS,
  PROBLEM_VIDEO_MP4,
  PROBLEM_DING_OGG,
  PROBLEM_DING_MP3,
} from "./assets";

/**
 * Part 1 — The Problem. The whole scene IS the generated clip, scrubbed by
 * scroll (cluttered hillside desk → phone → head-lid → microwave → the day
 * burning down). No HTML overlays, no tint — the clip carries the story. It
 * ends on a clip-path wipe that reveals Part 2 underneath.
 */
export default function PartProblem() {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // The Turn — one continuous clip-path inset wipe revealing Part 2 underneath.
  const wipe = useTransform(
    scrollYProgress,
    [0.9, 1],
    ["inset(0 0 0 0)", "inset(0 0 100% 0)"],
  );

  // Notification "ding" sliced from the clip audio — one-shot at the app-open
  // beat, only when the visitor has enabled sound. Re-arms above the beat.
  const { enabled: soundOn } = useSceneAudio();
  const dingRef = useRef<HTMLAudioElement | null>(null);
  const dingArmed = useRef(true);
  useEffect(() => {
    const a = new Audio();
    a.preload = "auto";
    if (a.canPlayType("audio/ogg") && PROBLEM_DING_OGG) a.src = PROBLEM_DING_OGG;
    else if (PROBLEM_DING_MP3) a.src = PROBLEM_DING_MP3;
    a.volume = 0.7;
    dingRef.current = a;
    return () => {
      a.pause();
      dingRef.current = null;
    };
  }, []);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (p < 0.28) dingArmed.current = true;
    if (p >= 0.36 && dingArmed.current && soundOn && dingRef.current) {
      dingArmed.current = false;
      dingRef.current.currentTime = 0;
      void dingRef.current.play().catch(() => {});
    }
  });

  return (
    <motion.section
      ref={ref}
      id="problem"
      className="relative h-[600vh]"
      style={{ clipPath: wipe }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0b1020]">
        <ScrubVideo
          progress={scrollYProgress}
          calm={calm}
          src={PROBLEM_VIDEO_MP4}
          poster={STORY_ASSETS.problemPoster.src}
          alt={STORY_ASSETS.problemPoster.alt}
        />
      </div>
    </motion.section>
  );
}
