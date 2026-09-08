import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { AUDIO_BEDS, SOUND_PREF_KEY } from "./audio";
import { SceneAudioContext, type SceneAudio } from "./sceneAudioContext";

/**
 * Scroll-driven music director. Creates one <audio> element per bed (routed
 * through a Web Audio GainNode) and crossfades their gains as the story's
 * scrollYProgress moves. Audio is OFF until the visitor flips the sound toggle
 * (browsers block autoplay) — `enabled` + `toggle` are exposed for the Navbar.
 *
 * Phase-A note: this is functional but degrades to silence when no audio files
 * are present in `assets/welcome/audio/` yet. `agent-audio` supplies the files
 * and may refine the fade curve; the public shape here (`useSceneAudio`) is
 * stable.
 */

function readPref(): boolean {
  try {
    return localStorage.getItem(SOUND_PREF_KEY) === "on";
  } catch {
    return false;
  }
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

  const available = useMemo(
    () => AUDIO_BEDS.some((b) => b.src || b.fallbackSrc),
    [],
  );

  // Build the graph lazily on first enable (needs a user gesture anyway).
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
      if (b.src) el.src = b.src;
      else if (b.fallbackSrc) el.src = b.fallbackSrc;
      const source = ctx.createMediaElementSource(el);
      const gain = ctx.createGain();
      gain.gain.value = 0;
      source.connect(gain).connect(ctx.destination);
      void el.play().catch(() => {});
      return { el, gain, bedGain: b.gain, range: b.range };
    });
  }, [available]);

  const applyMix = useCallback(
    (p: number) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      for (const n of nodesRef.current) {
        const [s, e] = n.range;
        const mid = (s + e) / 2;
        const half = Math.max((e - s) / 2, 0.0001);
        // Triangular window: full at the bed's midpoint, 0 at its edges + a
        // little beyond, so neighbours overlap into a crossfade.
        const t = 1 - Math.min(Math.abs(p - mid) / (half * 1.6), 1);
        const target = enabled ? t * n.bedGain : 0;
        n.gain.gain.setTargetAtTime(target, ctx.currentTime, 0.25);
      }
    },
    [enabled],
  );

  useMotionValueEvent(progress, "change", (p) => applyMix(p));

  useEffect(() => {
    if (!enabled) {
      applyMix(progress.get());
      return;
    }
    ensureGraph();
    ctxRef.current?.resume().catch(() => {});
    applyMix(progress.get());
  }, [enabled, ensureGraph, applyMix, progress]);

  useEffect(() => {
    return () => {
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
