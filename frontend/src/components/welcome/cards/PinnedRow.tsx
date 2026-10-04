import { type ReactNode } from "react";
import { usePinnedCardTrack } from "./usePinnedCardTrack";

/**
 * Full-viewport pinned row: the section sticks to the screen, vertical wheel
 * scrolling slides the cards sideways, and once the last card is reached the
 * page scrolls vertically again. Cards fill the height under the heading
 * (give them `h-full`).
 */
export default function PinnedRow({
  kicker,
  kickerColor = "#4be277",
  title,
  children,
}: {
  kicker: string;
  kickerColor?: string;
  title: ReactNode;
  children: ReactNode;
}) {
  const { sectionRef, trackRef, fillRef } = usePinnedCardTrack();

  return (
    <section ref={sectionRef} className="relative">
      <div className="sticky top-0 flex h-screen min-h-[560px] flex-col pt-[68px] pb-5">
        <div className="flex flex-col gap-1.5 px-[5vw] pb-3">
          <div className="flex items-center gap-3.5">
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: kickerColor }}>
              {kicker}
            </div>
            <div className="relative h-px min-w-[60px] flex-1 overflow-hidden bg-white/15">
              <div ref={fillRef} className="absolute inset-0 origin-left" style={{ background: kickerColor, transform: "scaleX(0)" }} />
            </div>
          </div>
          <h2 className="m-0 font-heading text-[clamp(24px,3.4vw,42px)] leading-[0.95] font-extrabold tracking-[-0.03em] text-white uppercase [text-shadow:0_2px_24px_rgba(0,0,0,.5)]">
            {title}
          </h2>
        </div>

        <div className="flex min-h-0 flex-1 overflow-x-hidden">
          <div
            ref={trackRef}
            className="relative flex h-full items-stretch gap-[clamp(16px,2vw,28px)] px-[5vw] will-change-transform"
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
