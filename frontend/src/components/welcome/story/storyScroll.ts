import { createContext, useContext } from "react";
import { useReducedMotion, type MotionValue } from "framer-motion";

/**
 * Shared scroll progress for the whole story page — the `scrollYProgress` (0→1)
 * of the outer story container. Scenes read it to drive scrubbed / pinned motion
 * off one timeline so the seams between parts stay continuous.
 *
 * Non-component exports live here (not in `motion.tsx`) so the component file
 * stays Fast-Refresh-clean — same split as `context/auth-context-value.ts`.
 */
export interface StoryScroll {
  progress: MotionValue<number>;
}

export const StoryScrollContext = createContext<StoryScroll | null>(null);

export function useStoryScroll(): StoryScroll {
  const ctx = useContext(StoryScrollContext);
  if (!ctx) throw new Error("useStoryScroll must be used inside <StoryScrollProvider>");
  return ctx;
}

/** True when the visitor asked for reduced motion — freeze parallax/loops. */
export function useCalm() {
  return useReducedMotion() ?? false;
}
