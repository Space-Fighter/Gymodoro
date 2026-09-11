import { motion, useTransform, type MotionValue } from "framer-motion";

export interface Caption {
  /** [start, end] as a 0→1 fraction of the section's own scroll progress. */
  at: [number, number];
  text: string;
}

const FADE = 0.03;

function CaptionLine({
  progress,
  at,
  text,
}: {
  progress: MotionValue<number>;
  at: [number, number];
  text: string;
}) {
  const [start, end] = at;
  const opacity = useTransform(
    progress,
    [Math.max(0, start - FADE), start, end, Math.min(1, end + FADE)],
    [0, 1, 1, 0],
  );
  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute inset-x-0 bottom-[14%] z-10 flex justify-center px-6"
    >
      <p
        className="max-w-3xl text-center text-2xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] sm:text-4xl"
      >
        {text}
      </p>
    </motion.div>
  );
}

/**
 * Scroll-synced captions rendered as large plain text over a scrubbed scene,
 * one line visible at a time (ranges shouldn't overlap). Each line fades
 * in/out around its own [start, end] window of the section's own
 * `scrollYProgress`.
 */
export default function SceneCaptions({
  progress,
  captions,
}: {
  progress: MotionValue<number>;
  captions: Caption[];
}) {
  return (
    <>
      {captions.map((c) => (
        <CaptionLine key={c.text} progress={progress} at={c.at} text={c.text} />
      ))}
    </>
  );
}
