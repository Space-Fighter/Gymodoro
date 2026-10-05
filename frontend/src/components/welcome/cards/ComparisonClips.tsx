import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PROBLEM_VIDEO_MP4, SOLUTION_VIDEO_MP4 } from "../assets";

function Clip({ src, children }: { src?: string; children: ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  // Decode only while visible: two 1080p clips plus the background reel is too much to run at once.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className="flex min-w-0 flex-col gap-5"
      onMouseEnter={() => setMuted(false)}
      onMouseLeave={() => setMuted(true)}
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/15 bg-[#141824] shadow-2xl shadow-black/50">
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
      </div>
      {children}
    </div>
  );
}

const PAINS = ["Doom scrolling", "Unproductive work output", "A sedentary life"];

/** Hero: what the product is (tagline), the two clips, and the problem → promise copy beneath them. */
export default function ComparisonClips() {
  return (
    <div className="px-[5vw] pt-28 pb-16">
      <header className="mx-auto flex max-w-4xl flex-col items-center gap-5 pb-14 text-center">
        <span className="rounded-full border border-white/25 bg-black/30 px-4 py-1.5 font-mono text-[11px] tracking-[0.2em] text-[#4be277] uppercase backdrop-blur">
          Pomodoro timer + built-in workouts
        </span>
        <h1 className="m-0 font-heading text-[clamp(38px,7vw,84px)] leading-[0.95] font-extrabold tracking-[-0.03em] text-white [text-shadow:0_4px_30px_rgba(0,0,0,.5)]">
          Stay productive and fit.
        </h1>
        <p className="m-0 max-w-[58ch] text-[clamp(17px,2vw,21px)] leading-[1.55] text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,.5)]">
          Work in 25-minute blocks. When the timer rings, Gymodoro hands you a 5-minute exercise to do right
          where you sit, so you finish the day sharper, stronger and off your phone.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/signup"
            className="rounded-full bg-white px-7 py-3.5 text-base font-bold text-slate-900 shadow-lg transition hover:-translate-y-0.5"
          >
            Start your first cycle, free
          </Link>
          <a
            href="#solution"
            className="rounded-full border border-white/40 bg-black/20 px-7 py-3.5 text-base font-bold text-white backdrop-blur transition hover:bg-white/10"
          >
            See how it works
          </a>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-2">
        <Clip src={PROBLEM_VIDEO_MP4}>
          <div>
            <h2 className="m-0 mb-3 font-heading text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-0.02em] text-white">
              Do you struggle with…
            </h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {PAINS.map((p) => (
                <li key={p} className="flex items-center gap-3 text-lg text-white">
                  <span className="text-[#e8734a]">✕</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </Clip>
        <Clip src={SOLUTION_VIDEO_MP4}>
          <div>
            <h2 className="m-0 mb-3 font-heading text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-0.02em] text-[#4be277]">
              Not anymore.
            </h2>
            <p className="m-0 max-w-[52ch] text-lg leading-[1.55] text-white">
              With Gymodoro we <strong>force you to be productive and active</strong>. You work in 25-minute
              blocks, and in the 5-minute break we remind you to move and exercise.
            </p>
          </div>
        </Clip>
      </div>

      <p className="mx-auto mt-16 max-w-3xl text-center font-heading text-[clamp(22px,3.2vw,36px)] leading-[1.25] font-bold tracking-[-0.01em] text-white [text-shadow:0_2px_20px_rgba(0,0,0,.5)]">
        Being productive was never about being sedentary, and being active never meant being unproductive. With
        Gymodoro you discover how beautifully the two go hand in hand.
      </p>
    </div>
  );
}
