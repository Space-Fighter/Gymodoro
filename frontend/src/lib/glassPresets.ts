import controls from "@/frontend controls.json";
import type { LiquidGlassOptions } from "@/hooks/useLiquidGlass";

/**
 * Every liquid-glass / chroma value lives in `src/frontend controls.json`;
 * this file only reads it. Edit the JSON to experiment — nothing is
 * hard-coded at the call sites.
 */

const { liquidGlass, dressing } = controls;

/** Big panels/cards: sidebars, settings panels, stat tiles, auth cards. Pair with `.glass`. */
export const GLASS_PANEL: LiquidGlassOptions = liquidGlass.panel;

/** Small interactive controls: buttons, inputs, pills, chips. Pair with `.glass-tight`. */
export const GLASS_TIGHT: LiquidGlassOptions = liquidGlass.tight;

/** Welcome page cards (sharp, unblurred backdrop). Pair with `.glass`. */
export const GLASS_WELCOME_CARD: LiquidGlassOptions = liquidGlass.welcomeCard;

/** Welcome page navbar + footer bars (transparent). Pair with `.glass-clear`. */
export const GLASS_WELCOME_BAR: LiquidGlassOptions = liquidGlass.welcomeBar;

/** Push the `dressing` block onto :root as CSS variables read by `.glass*` in index.css. */
function applyDressing() {
  const root = document.documentElement;
  for (const [preset, values] of Object.entries(dressing)) {
    for (const [key, value] of Object.entries(values)) {
      const name = key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
      root.style.setProperty(`--glass-${preset}-${name}`, value);
    }
  }
}
applyDressing();
