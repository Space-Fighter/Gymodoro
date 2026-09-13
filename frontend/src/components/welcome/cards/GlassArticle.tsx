import { type ReactNode } from "react";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { GLASS_PANEL } from "@/lib/glassPresets";
import { cn } from "@/lib/utils";

/**
 * One card in a pinned horizontal track: the same `useLiquidGlass` hook and
 * `.glass` dressing used everywhere else in this app (`Sidebar.tsx`'s nav
 * rail, `Timer.tsx`'s logout button, `WorkoutLibrary.tsx`'s search field) —
 * there is only one glass implementation in this codebase. Tuned like
 * `Sidebar.tsx`'s rail (the closest precedent for a large panel, rather than
 * a small pill/button) since this is the biggest glass surface in the app.
 * No per-card background color — every card reads as the same glass over
 * the page, not a colored panel.
 */
export default function GlassArticle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useLiquidGlass<HTMLElement>({ ...GLASS_PANEL, radius: 26 });
  return (
    <article
      ref={ref}
      className={cn(
        "glass flex flex-shrink-0 flex-col gap-4 rounded-[26px] border border-white/10 p-[22px] text-white",
        className,
      )}
    >
      {children}
    </article>
  );
}
