import { type ReactNode, type RefObject } from "react";

/** Kicker label + hairline progress rule + big title, shared by both pinned rows. */
export default function SectionHeading({
  kicker,
  kickerColor = "#5c6478",
  fillRef,
  fillColor = "#f6efe7",
  children,
  subtitle,
}: {
  kicker: string;
  kickerColor?: string;
  fillRef: RefObject<HTMLDivElement | null>;
  fillColor?: string;
  children: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-2.5 px-[5vw] pt-[clamp(56px,9vh,80px)] pb-[clamp(18px,3vh,28px)]">
      <div className="flex flex-wrap items-center gap-3.5">
        <div
          className="font-mono text-[11px] tracking-[0.2em] uppercase"
          style={{ color: kickerColor }}
        >
          {kicker}
        </div>
        <div className="relative h-px min-w-[60px] flex-1 overflow-hidden bg-[#1b1f2b]">
          <div
            ref={fillRef}
            className="absolute inset-y-0 left-0 w-0"
            style={{ background: fillColor }}
          />
        </div>
      </div>
      <h2
        className="m-0 font-heading text-[clamp(34px,6.4vw,78px)] leading-[0.92] font-extrabold tracking-[-0.03em] text-white uppercase"
      >
        {children}
      </h2>
      {subtitle && (
        <p className="mt-1.5 max-w-[46ch] text-[17px] leading-[1.55] text-[#9aa3b5] normal-case">
          {subtitle}
        </p>
      )}
    </div>
  );
}
