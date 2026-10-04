import { useEffect, useRef, useState } from "react";
import controls from "@/frontend controls.json";

/**
 * Real footage only: drop .mp4/.webm clips into `assets/welcome/bg/` and they
 * play back-to-back (filename order, cross-faded) behind the whole page.
 * Until clips exist the page sits on a dark gradient — no stills.
 */
const CLIPS = Object.entries(
  import.meta.glob("../../assets/welcome/bg/*.{mp4,webm}", {
    eager: true,
    query: "?url",
    import: "default",
  }) as Record<string, string>,
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

const FADE_MS = 1400;

/** Dark overlay above the video; toggled and tuned in `frontend controls.json` (welcomeBackground.tint). */
const tint = controls.welcomeBackground.tint;

/** Two stacked <video>s: while one plays, the other preloads the next clip, then they swap with a fade. */
function VideoReel() {
  const refs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const [front, setFront] = useState(0);
  const [index, setIndex] = useState([0, 1 % CLIPS.length]);

  useEffect(() => {
    refs[front].current?.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [front]);

  const advance = () => {
    const next = 1 - front;
    refs[next].current?.play().catch(() => {});
    setFront(next);
    // After the fade, point the now-hidden video at the clip after the one that just started.
    window.setTimeout(() => {
      setIndex((cur) => {
        const copy = [...cur];
        copy[1 - next] = (cur[next] + 1) % CLIPS.length;
        return copy;
      });
    }, FADE_MS);
  };

  return (
    <>
      {[0, 1].map((slot) => (
        <video
          key={slot}
          ref={refs[slot]}
          src={CLIPS[index[slot]]}
          autoPlay={slot === 0}
          muted
          playsInline
          preload="auto"
          loop={CLIPS.length === 1}
          onEnded={slot === front ? advance : undefined}
          style={{ transitionDuration: `${FADE_MS}ms` }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out ${
            slot === front ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}

/** Fixed full-page ambience: looping real footage of cafes, coastlines and people moving. */
export default function SceneryBackground() {
  return (
    <>
      <div
        className="fixed inset-0 -z-20 overflow-hidden bg-[linear-gradient(160deg,#0d1f17,#08090d_60%,#10161f)]"
        aria-hidden
      >
        {CLIPS.length > 0 && <VideoReel />}
      </div>
      {tint.enabled && (
        <div
          aria-hidden
          className="fixed inset-0 -z-10"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, rgba(0,0,0,${tint.opacity * 0.4}), rgba(0,0,0,${tint.opacity + tint.vignette * 0.3})), rgba(0,0,0,${tint.opacity})`,
          }}
        />
      )}
    </>
  );
}
