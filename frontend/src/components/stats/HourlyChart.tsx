import { useState } from "react";
import type { StatsHourEntry } from "@/types/session";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { GLASS_PANEL, GLASS_TIGHT } from "@/lib/glassPresets";

interface Props {
  byHour: StatsHourEntry[];
  rangeLabel: string;
}

function formatHourLabel(hour: number) {
  if (hour === 0) return "12AM";
  if (hour === 12) return "12PM";
  return hour < 12 ? `${hour}AM` : `${hour - 12}PM`;
}

export default function HourlyChart({ byHour, rangeLabel }: Props) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const glassRef = useLiquidGlass<HTMLDivElement>(GLASS_PANEL);
  const tooltipGlassRef = useLiquidGlass<HTMLDivElement>(GLASS_TIGHT);

  const maxMinutes = Math.max(1, ...byHour.map((h) => h.focusMinutes));
  const totalFocusMinutes = byHour.reduce((sum, h) => sum + h.focusMinutes, 0);
  const hovered = hoveredHour !== null ? byHour[hoveredHour] : null;

  return (
    <div ref={glassRef} className="glass rounded-2xl border border-white/25 p-5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-white font-semibold text-sm">
          Focus Minutes by Hour — <span className="text-white/70">{rangeLabel}</span>
        </span>
        <span className="text-white/70 text-sm">
          Total Time:{" "}
          <span className="text-white font-semibold">
            {Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m
          </span>
        </span>
      </div>
      <p className="text-white/40 text-xs mb-5">
        Minutes of focused work, by the hour your sessions started ({rangeLabel.toLowerCase()})
      </p>

      {totalFocusMinutes === 0 ? (
        <div className="h-48 flex items-center justify-center text-white/40 text-sm">
          No focus sessions {rangeLabel.toLowerCase()} yet
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            {/* Y-axis: minutes scale */}
            <div className="flex flex-col justify-between h-48 text-white/40 text-xs text-right shrink-0 w-8">
              <span>{maxMinutes}m</span>
              <span>{Math.round(maxMinutes / 2)}m</span>
              <span>0m</span>
            </div>

            <div className="relative h-48 flex items-end gap-1 flex-1">
              {byHour.map((entry) => {
                const heightPct = (entry.focusMinutes / maxMinutes) * 100;
                return (
                  <div
                    key={entry.hour}
                    className="relative flex-1 h-full flex items-end"
                    onMouseEnter={() => setHoveredHour(entry.hour)}
                    onMouseLeave={() => setHoveredHour((h) => (h === entry.hour ? null : h))}
                  >
                    <div
                      className="w-full rounded-sm bg-white/60 hover:bg-white transition-colors cursor-pointer"
                      style={{ height: `${Math.max(heightPct, entry.focusMinutes > 0 ? 4 : 1)}%` }}
                    />
                    {hovered?.hour === entry.hour && (
                      <div
                        ref={tooltipGlassRef}
                        className="glass-tight absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-40 rounded-xl border border-white/25 p-3 pointer-events-none"
                      >
                        <div className="text-white font-semibold text-sm mb-1">
                          {formatHourLabel(entry.hour)}
                        </div>
                        <div className="text-emerald-300 text-sm">
                          Focus: {entry.focusMinutes} minutes
                        </div>
                        <div className="text-sky-300 text-sm">
                          Sessions: {entry.totalSessions}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between mt-2 ml-10 text-white/40 text-xs">
            <span>12AM</span>
            <span>4AM</span>
            <span>8AM</span>
            <span>12PM</span>
            <span>4PM</span>
            <span>8PM</span>
          </div>
          <div className="text-center text-white/30 text-[11px] mt-1 ml-10">
            Hour of day
          </div>
        </>
      )}
    </div>
  );
}
