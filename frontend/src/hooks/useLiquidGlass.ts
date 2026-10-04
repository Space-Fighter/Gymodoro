import { useCallback, useEffect, useRef } from "react";
import "@/lib/liquid-glass.js";

export interface LiquidGlassOptions {
  /** false = skip the SVG refraction filter (tinted glass only). Default true. */
  refraction?: boolean;
  /** Displacement strength; negative = magnifying bulge. -60 subtle … -180 dramatic. Default -112. */
  scale?: number;
  /** Per-channel scale stagger (prism fringe); 0 disables it. Default 6. */
  chroma?: number;
  /** Neutral interior inset, fraction of the smaller side. Default 0.07. */
  border?: number;
  /** Curvature of the bulge: small = hard rim, large = dome. Default 12. */
  mapBlur?: number;
  /** Backdrop blur (px) inside the glass. Default 3. */
  blur?: number;
  /** Backdrop saturation boost. Default 1.5. */
  saturate?: number;
  /** Corner radius override (px); defaults to the element's computed border-radius. */
  radius?: number | null;
  /** Frosted blur (px) fallback on Safari/Firefox. Default 16. */
  fallbackBlur?: number;
}

interface LiquidGlassInstance {
  supported: boolean;
  refresh: () => void;
  destroy: () => void;
}

declare global {
  interface Window {
    liquidGlass: (el: Element, opts?: LiquidGlassOptions) => LiquidGlassInstance;
  }
}

/**
 * Applies the Apple-style liquid glass refraction effect (vendored from
 * https://github.com/deepika-builds/liquid-glass) to whichever element the
 * returned callback ref is attached to. Chromium gets real SVG-filter
 * refraction; Safari/Firefox get a frosted-blur fallback automatically.
 * Pair with a `.glass`/`.glass-tight` class for the tint/highlight/shadow
 * dressing (see `index.css`) — the module only owns the optics.
 *
 * A callback ref (not a RefObject) so it re-fires correctly on elements that
 * mount/unmount conditionally (dropdowns, toggled panels) — a plain
 * `useRef` + mount-only `useEffect` misses every remount after the first.
 */
export function useLiquidGlass<T extends HTMLElement>(opts?: LiquidGlassOptions) {
  const instanceRef = useRef<LiquidGlassInstance | null>(null);
  const optsRef = useRef(opts);
  // Kept current after each render; the callback ref below only reads it at attach time.
  useEffect(() => {
    optsRef.current = opts;
  });

  return useCallback((node: T | null) => {
    instanceRef.current?.destroy();
    const { refraction = true, ...optics } = optsRef.current ?? {};
    instanceRef.current = node && refraction ? window.liquidGlass(node, optics) : null;
  }, []);
}
