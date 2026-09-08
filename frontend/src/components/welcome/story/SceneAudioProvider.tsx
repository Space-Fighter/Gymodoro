import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SOUND_PREF_KEY, PART1_TRACK, PART2_TRACK } from "./audio";
import { SceneAudioContext, type SceneAudio } from "./sceneAudioContext";

/**
 * Owns the shared AudioContext + master gain and the on/off state for all
 * Welcome-story sound. Sound turns ON automatically on the visitor's first real
 * gesture (pointer/key) — unless they've explicitly muted it before — and the
 * top-right toggle flips it either way. Each Part pulls the context off
 * `useSceneAudio()` and plays its own track (see `useStoryAudio`).
 */

const available = Boolean(PART1_TRACK.ogg || PART1_TRACK.mp3 || PART2_TRACK.ogg || PART2_TRACK.mp3);

function readPref(): "on" | "off" | null {
  try {
    const v = localStorage.getItem(SOUND_PREF_KEY);
    return v === "on" || v === "off" ? v : null;
  } catch {
    return null;
  }
}

export function SceneAudioProvider({ children }: { children: ReactNode }) {
  // Start enabled unless the visitor has explicitly turned it off before.
  const [enabled, setEnabled] = useState(() => readPref() !== "off");

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  const ensureCtx = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    ctxRef.current = ctx;
    masterRef.current = master;
    return ctx;
  }, []);

  // Resume/suspend the context as `enabled` changes.
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (enabled) ctx.resume().catch(() => {});
    else ctx.suspend().catch(() => {});
  }, [enabled]);

  // Auto-enable on the first real user gesture (needed to start the context).
  useEffect(() => {
    if (readPref() === "off") return;
    const kick = () => {
      ensureCtx();
      ctxRef.current?.resume().catch(() => {});
      setEnabled((v) => v || readPref() !== "off");
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
      window.removeEventListener("touchstart", kick);
    };
    window.addEventListener("pointerdown", kick, { once: false });
    window.addEventListener("keydown", kick, { once: false });
    window.addEventListener("touchstart", kick, { once: false });
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
      window.removeEventListener("touchstart", kick);
    };
  }, [ensureCtx]);

  useEffect(() => {
    return () => {
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
      if (next) {
        ensureCtx();
        ctxRef.current?.resume().catch(() => {});
      }
      return next;
    });
  }, [ensureCtx]);

  const value = useMemo<SceneAudio>(
    () => ({
      enabled,
      toggle,
      available,
      getContext: () => ensureCtx(),
      getMaster: () => masterRef.current,
    }),
    [enabled, toggle, ensureCtx],
  );

  return (
    <SceneAudioContext.Provider value={value}>{children}</SceneAudioContext.Provider>
  );
}
