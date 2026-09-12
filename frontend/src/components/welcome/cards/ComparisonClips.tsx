import { useEffect, useRef, useState } from "react";
import { PROBLEM_VIDEO_MP4, SOLUTION_VIDEO_MP4 } from "../assets";

interface ClipProps {
  src?: string;
  label: string;
  labelColor: string;
  title: string;
  copy: string;
  copyColor: string;
}

function Clip({ src, label, labelColor, title, copy, copyColor }: ClipProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  return (
    <div
      className="flex min-w-0 flex-col gap-3.5"
      onMouseEnter={() => setMuted(false)}
      onMouseLeave={() => setMuted(true)}
    >
      <div className="relative aspect-video overflow-hidden rounded-[10px] border border-[#1b1f2b] bg-[#141824]">
        {src && (
          <video
            ref={videoRef}
            src={src}
            autoPlay
            loop
            muted={muted}
            playsInline
            className="block h-full w-full object-cover"
          />
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMuted((m) => !m);
          }}
          className="absolute right-3 bottom-3 z-10 flex h-[38px] w-[38px] items-center justify-center rounded-full border border-white/20 bg-[#07080d]/70 text-base text-[#f6efe7]"
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>
      <div
        className="font-mono text-[11px] tracking-[0.2em] uppercase [text-shadow:0_1px_6px_rgba(0,0,0,.4)]"
        style={{ color: labelColor }}
      >
        {label}
      </div>
      <div className="font-heading text-[clamp(24px,3vw,32px)] leading-[1.05] font-extrabold tracking-[-0.02em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,.35)]">
        {title}
      </div>
      <div
        className="max-w-[52ch] text-base leading-[1.55] [text-shadow:0_1px_6px_rgba(0,0,0,.4)]"
        style={{ color: copyColor }}
      >
        {copy}
      </div>
    </div>
  );
}

/** Top-of-page render comparison: the two hero clips, side by side, hover-to-unmute. */
export default function ComparisonClips() {
  return (
    <div className="flex flex-col gap-7 border-b border-[#1b1f2b] px-[5vw] pt-12 pb-20">
      <div className="font-mono text-[11px] tracking-[0.2em] text-white/80 uppercase [text-shadow:0_1px_6px_rgba(0,0,0,.4)]">
        Two states, side by side
      </div>
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <Clip
          src={PROBLEM_VIDEO_MP4}
          label="clip a · the grind"
          labelColor="#f0d9c0"
          title="The grind, the phone, the spiral"
          copy="Hunched at the cluttered desk, scrolling instead of resting. The sedentary loop starting. Hover to hear it."
          copyColor="#f6efe7"
        />
        <Clip
          src={SOLUTION_VIDEO_MP4}
          label="clip b · the turn"
          labelColor="#d8f0c8"
          title="The turn, into the active state"
          copy="The shift into the meadow — same man, body no longer sedentary. Hover to hear it."
          copyColor="#f0f8ea"
        />
      </div>
    </div>
  );
}
