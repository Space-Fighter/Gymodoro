import { motion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCalm } from "./storyScroll";
import type { StoryAsset } from "./assets";

interface Props {
  asset: StoryAsset;
  /** A 0→1 driver (usually a section-local scroll progress) for the parallax. */
  driver?: MotionValue<number>;
  /** Vertical travel in px across the driver's 0→1 range. Default 80. */
  shift?: number;
  /** Extra scale at driver=1 (Ken Burns). Default 0.08. */
  zoom?: number;
  className?: string;
  /** object-position, e.g. "center", "bottom". */
  position?: string;
  priority?: boolean;
}

/**
 * A photoreal plate with a scroll-linked parallax/Ken-Burns move — animates
 * only `transform`, never layout. Renders a labelled gradient placeholder when
 * the real asset hasn't been delivered yet (`asset.src` undefined). Freezes to
 * a static frame under `prefers-reduced-motion`.
 */
export default function ParallaxImage({
  asset,
  driver,
  shift = 80,
  zoom = 0.08,
  className,
  position = "center",
  priority = false,
}: Props) {
  const calm = useCalm();

  // Hooks must run unconditionally; when there's no driver we feed a constant.
  const zero = useTransform(() => 0);
  const source = driver ?? zero;
  const y = useTransform(source, [0, 1], [0, calm ? 0 : -shift]);
  const scale = useTransform(source, [0, 1], [1, calm ? 1 : 1 + zoom]);

  return (
    <motion.div
      aria-hidden={!asset.alt}
      className={cn("absolute inset-0 h-full w-full", className)}
      style={{ y, scale }}
    >
      {asset.src ? (
        <img
          src={asset.src}
          alt={asset.alt}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover"
          style={{ objectPosition: position }}
        />
      ) : (
        <div
          className="flex h-full w-full items-end justify-center p-4"
          style={{ background: asset.fallback }}
        >
          {asset.alt && (
            <span className="rounded bg-black/40 px-2 py-1 text-[11px] font-medium text-white/80">
              {asset.alt}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
