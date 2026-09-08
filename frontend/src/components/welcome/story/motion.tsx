import { type ReactNode } from "react";
import { motion, type MotionValue } from "framer-motion";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { cn } from "@/lib/utils";
import { StoryScrollContext } from "./storyScroll";

export function StoryScrollProvider({
  progress,
  children,
}: {
  progress: MotionValue<number>;
  children: ReactNode;
}) {
  return (
    <StoryScrollContext.Provider value={{ progress }}>
      {children}
    </StoryScrollContext.Provider>
  );
}

/**
 * A liquid-glass panel: SVG refraction (Chromium) + `.glass` material dressing,
 * animated only on `transform`/`opacity` per the skill's hard rules. Keep it
 * under ~800px per side (refraction map generation is O(w×h)).
 */
export function GlassPanel({
  children,
  className,
  tight = false,
  scale = -90,
}: {
  children: ReactNode;
  className?: string;
  tight?: boolean;
  scale?: number;
}) {
  const ref = useLiquidGlass<HTMLDivElement>({ scale, chroma: 5 });
  return (
    <motion.div
      ref={ref}
      className={cn(
        tight ? "glass-tight" : "glass",
        "rounded-3xl backdrop-blur-md text-white",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
