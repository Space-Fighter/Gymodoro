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
 * Welcome-story sound. Sound is "on" by default (unless the visitor muted it
 * before); the context is unlocked and started on their first real gesture
 * (browsers require one). `unlocked` bumps then, which re-runs every track's
 * play effect so playback actually starts. The top-right toggle also unlocks.
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
  const [enabled, setEnabled] = useState(() => readPref() !== "off");
  const [unlocked, setUnlocked] = useState(0);

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

  const unlock = useCallback(() => {
    const ctx = ensureCtx();
    ctx?.resume().catch(() => {});
    setUnlocked((n) => n + 1);
  }, [ensureCtx]);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (enabled) ctx.resume().catch(() => {});
    else ctx.suspend().catch(() => {});
  }, [enabled, unlocked]);

  // First real gesture unlocks + starts the context.
  useEffect(() => {
    const kick = () => {
      unlock();
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
      window.removeEventListener("touchstart", kick);
    };
    window.addEventListener("pointerdown", kick);
    window.addEventListener("keydown", kick);
    window.addEventListener("touchstart", kick);
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
      window.removeEventListener("touchstart", kick);
    };
  }, [unlock]);

  // Note: the AudioContext is intentionally NOT closed on unmount — React
  // StrictMode double-invokes effects in dev, and closing it there leaves a
  // dead context behind. It lives for the page and the browser reclaims it.

  const toggle = useCallback(() => {
    setEnabled((v) => {
      const next = !v;
      try {
        localStorage.setItem(SOUND_PREF_KEY, next ? "on" : "off");
      } catch {
        /* ignore */
      }
      if (next) unlock();
      return next;
    });
  }, [unlock]);

  const value = useMemo<SceneAudio>(
    () => ({
      enabled,
      unlocked,
      toggle,
      available,
      getContext: () => ensureCtx(),
      getMaster: () => masterRef.current,
    }),
    [enabled, unlocked, toggle, ensureCtx],
  );

  return (
    <SceneAudioContext.Provider value={value}>{children}</SceneAudioContext.Provider>
  );
}
