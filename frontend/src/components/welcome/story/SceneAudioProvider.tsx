import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { type MotionValue } from "framer-motion";
import { AUDIO_BEDS, SOUND_PREF_KEY } from "./audio";
import { SceneAudioContext, type SceneAudio } from "./sceneAudioContext";

/**
 * Scroll-driven music director. One looping <audio> per bed, each through a
 * GainNode. A rAF loop (running the whole time sound is enabled) reads the
 * story's scroll progress every frame and crossfades the bed gains — so the
 * score keeps playing and stays correct even when the visitor stops scrolling.
 * Audio is OFF until the sound toggle is pressed (browsers block autoplay).
 *
 * Bed ranges overlap (see `audio.ts`); within `[start,end]` a bed is at full
 * gain, ramping over `FADE` on each side, so neighbours always crossfade and
 * there is never a silent gap.
 */

const FADE = 0.07;

function readPref(): boolean {
  try {
    return localStorage.getItem(SOUND_PREF_KEY) === "on";
  } catch {
    return false;
  }
}

/** Bed level at scroll `p`: 1 inside [s,e], linear ramp over FADE outside. */
function windowLevel(p: number, s: number, e: number): number {
  if (p >= s && p <= e) return 1;
  if (p < s) return Math.max(0, 1 - (s - p) / FADE);
  return Math.max(0, 1 - (p - e) / FADE);
}

export function SceneAudioProvider({
  progress,
  children,
}: {
  progress: MotionValue<number>;
  children: ReactNode;
}) {
  const [enabled, setEnabled] = useState(readPref);

  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<
    { el: HTMLAudioElement; gain: GainNode; bedGain: number; range: [number, number] }[]
  >([]);
  const rafRef = useRef(0);

  const available = useMemo(
    () => AUDIO_BEDS.some((b) => b.src || b.fallbackSrc),
    [],
  );

  const ensureGraph = useCallback(() => {
    if (ctxRef.current || !available) return;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    ctxRef.current = ctx;
    nodesRef.current = AUDIO_BEDS.filter((b) => b.src || b.fallbackSrc).map((b) => {
      const el = new Audio();
      el.loop = true;
      el.preload = "auto";
      el.crossOrigin = "anonymous";
      el.src = (b.src || b.fallbackSrc) as string;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      ctx.createMediaElementSource(el).connect(gain).connect(ctx.destination);
      return { el, gain, bedGain: b.gain, range: b.range };
    });
  }, [available]);

  // Continuous mix — runs every frame while enabled so the score tracks scroll
  // and never freezes when scrolling stops.
  useEffect(() => {
    if (!enabled) {
      const ctx = ctxRef.current;
      nodesRef.current.forEach((n) => {
        if (ctx) n.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      });
      cancelAnimationFrame(rafRef.current);
      return;
    }

    ensureGraph();
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.resume().catch(() => {});
    nodesRef.current.forEach((n) => void n.el.play().catch(() => {}));

    const loop = () => {
      const p = progress.get();
      for (const n of nodesRef.current) {
        const lvl = windowLevel(p, n.range[0], n.range[1]);
        n.gain.gain.setTargetAtTime(lvl * n.bedGain, ctx.currentTime, 0.12);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, ensureGraph, progress]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      nodesRef.current.forEach((n) => {
        n.el.pause();
        n.el.src = "";
      });
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  const toggle = useCallback(() => {
    setEnabled((v) => {
      const next = !v;
      try {
        localStorage.setItem(SOUND_PREF_KEY, next ? "on" : "off");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo<SceneAudio>(
    () => ({ enabled, toggle, available }),
    [enabled, toggle, available],
  );

  return (
    <SceneAudioContext.Provider value={value}>{children}</SceneAudioContext.Provider>
  );
}
