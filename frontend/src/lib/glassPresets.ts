import type { LiquidGlassOptions } from "@/hooks/useLiquidGlass";

/**
 * Single source of truth for `useLiquidGlass` tuning across the app. Tweak
 * these two presets to change the glass/chroma look everywhere at once;
 * call sites override only what genuinely differs per element (radius,
 * a slightly different scale, etc).
 */

/** Big panels/cards: sidebars, settings panels, stat tiles, welcome cards, auth cards. Pair with the `.glass` CSS class. */
export const GLASS_PANEL: LiquidGlassOptions = {
  scale: -70,
  chroma: 8,
  mapBlur: 18,
  blur: 5,
  saturate: 1.4,
};

/** Small interactive controls: buttons, inputs, pills, chips. Pair with the `.glass-tight` CSS class. */
export const GLASS_TIGHT: LiquidGlassOptions = {
  scale: -60,
  chroma: 5,
  blur: 4,
};
