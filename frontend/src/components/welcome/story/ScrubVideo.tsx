import { useEffect, useRef } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";

/**
 * A clip whose playhead is driven by scroll. The <video> is never played — it
 * stays paused and we only set `currentTime` from a 0→1 progress value
 * (rAF-throttled, and only once the previous seek settled), so scrolling
 * transports the footage frame-by-frame. The source must be encoded with a
 * short keyframe interval so seeks are cheap. Under reduced motion we hold the
 * poster still instead.
 */
export default function ScrubVideo({
  progress,
  calm,
  src,
  poster,
  alt = "",
  className = "h-full w-full object-cover",
}: {
  progress: MotionValue<number>;
  calm: boolean;
  src?: string;
  poster?: string;
  alt?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const target = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || calm) return;
    v.muted = true;
    // Prime the decoder (Safari/iOS won't paint currentTime seeks otherwise).
    const prime = v.play().then(() => v.pause()).catch(() => {});
    let stopped = false;
    const tick = () => {
      if (stopped) return;
      const dur = v.duration || 0;
      if (dur && !v.seeking) {
        const want = target.current * dur;
        if (Math.abs(want - v.currentTime) > 0.02) v.currentTime = want;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf.current);
      void prime;
    };
  }, [calm]);

  useMotionValueEvent(progress, "change", (p) => {
    target.current = p < 0 ? 0 : p > 1 ? 1 : p;
  });

  if (calm || !src) {
    return <img src={poster} alt={alt} className={className} />;
  }
  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      playsInline
      preload="auto"
      className={className}
    />
  );
}
