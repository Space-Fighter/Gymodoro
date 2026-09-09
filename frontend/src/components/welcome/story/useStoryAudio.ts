import { useCallback, useEffect, useRef } from "react";
import { useSceneAudio } from "./sceneAudioContext";
import { pickSrc } from "./audio";

/**
 * Play one looping music bed for a scene. It fades in whenever `active` is true
 * and sound is enabled, and fades out otherwise — so each Part's track plays
 * only while that Part is on screen. Routed through the shared master gain.
 */
export function useTrack(
  track: { ogg?: string; mp3?: string },
  active: boolean,
  { volume = 0.7 }: { volume?: number } = {},
) {
  const { enabled, unlocked, getContext, getMaster } = useSceneAudio();
  const elRef = useRef<HTMLAudioElement | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const wiredRef = useRef(false);

  const wire = useCallback(() => {
    if (wiredRef.current) return;
    const ctx = getContext();
    const master = getMaster();
    const src = pickSrc(track);
    if (!ctx || !master || !src) return;
    const el = new Audio(src);
    el.loop = true;
    el.preload = "auto";
    el.crossOrigin = "anonymous";
    const gain = ctx.createGain();
    gain.gain.value = 0;
    ctx.createMediaElementSource(el).connect(gain).connect(master);
    elRef.current = el;
    gainRef.current = gain;
    wiredRef.current = true;
  }, [getContext, getMaster, track]);

  useEffect(() => {
    const on = active && enabled;
    if (on) wire();
    const ctx = getContext();
    const el = elRef.current;
    const gain = gainRef.current;
    if (!ctx || !el || !gain) return;

    if (on) {
      ctx.resume().then(() => {
        void el.play().catch(() => {});
      }).catch(() => {
        void el.play().catch(() => {});
      });
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.6);
    } else {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
      const t = window.setTimeout(() => el.pause(), 1400);
      return () => window.clearTimeout(t);
    }
  }, [active, enabled, unlocked, volume, wire, getContext]);

  useEffect(() => {
    return () => {
      // StrictMode double-invokes this in dev — tear the graph down fully so the
      // remount rebuilds it (don't just clear src on a ref we then reuse).
      elRef.current?.pause();
      elRef.current = null;
      gainRef.current = null;
      wiredRef.current = false;
    };
  }, []);
}

/**
 * A one-shot sound effect (e.g. the notification ding). Returns a `play()` that
 * fires it once through the master gain, no-op until sound is enabled.
 */
export function useSfx(track: { ogg?: string; mp3?: string }, { volume = 0.8 } = {}) {
  const { enabled, unlocked, getContext, getMaster } = useSceneAudio();
  const bufRef = useRef<AudioBuffer | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (bufRef.current || loadingRef.current) return;
    const src = pickSrc(track);
    const ctx = getContext();
    if (!src || !ctx) return;
    loadingRef.current = true;
    fetch(src)
      .then((r) => r.arrayBuffer())
      .then((b) => ctx.decodeAudioData(b))
      .then((buf) => {
        bufRef.current = buf;
      })
      .catch(() => {})
      .finally(() => {
        loadingRef.current = false;
      });
  }, [track, getContext, unlocked]);

  return useCallback(() => {
    if (!enabled) return;
    const ctx = getContext();
    const master = getMaster();
    if (!ctx || !master || !bufRef.current) return;
    ctx.resume().catch(() => {});
    const s = ctx.createBufferSource();
    s.buffer = bufRef.current;
    const g = ctx.createGain();
    g.gain.value = volume;
    s.connect(g).connect(master);
    s.start();
  }, [enabled, getContext, getMaster, volume]);
}
