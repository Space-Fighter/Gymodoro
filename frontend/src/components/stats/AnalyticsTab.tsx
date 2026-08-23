import { useState } from "react";
import { Activity, CheckCircle2, Clock3, Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessionStats } from "@/hooks/useSessionStats";
import StatTile from "@/components/stats/StatTile";
import HourlyChart from "@/components/stats/HourlyChart";
import type { StatsRange } from "@/types/session";

const RANGE_OPTIONS: { id: StatsRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

function formatFocusTime(minutes: number) {
  if (minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export default function AnalyticsTab() {
  const [range, setRange] = useState<StatsRange>("today");
  const { stats, loading } = useSessionStats(range);
  const rangeLabel = RANGE_OPTIONS.find((opt) => opt.id === range)!.label;

  const summary = stats?.summary;
  // 0-5 heuristic derived from completion rate — the backend doesn't compute
  // a "focus score" field, so this is the closest real signal available.
  const focusScore = summary ? Math.round((summary.completionRate / 100) * 5) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 p-1.5 rounded-full border border-white/20 bg-white/8 backdrop-blur-xl w-fit">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setRange(opt.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold font-poppins transition-colors",
              range === opt.id
                ? "bg-white/25 text-white"
                : "text-white/60 hover:text-white/85"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="text-white/50 text-sm -mb-2">
        Showing stats for <span className="text-white font-semibold">{rangeLabel}</span>
      </p>

      <div className="grid grid-cols-3 gap-4">
        <StatTile
          icon={<Activity size={20} />}
          label="Total Sessions"
          value={loading ? "…" : summary?.totalSessions ?? 0}
        />
        <StatTile
          icon={<Clock3 size={20} />}
          label="Focused Time"
          value={loading ? "…" : formatFocusTime(summary?.totalFocusMinutes ?? 0)}
        />
        <StatTile
          icon={<Flame size={20} />}
          label="Calories Burnt"
          value={loading ? "…" : Math.round(summary?.totalCaloriesBurned ?? 0)}
        />
        <StatTile
          icon={<CheckCircle2 size={20} />}
          label="Completed Sessions"
          value={loading ? "…" : summary?.completedSessions ?? 0}
        />
        <StatTile
          icon={<Star size={20} />}
          label="Focus Score"
          value={
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i < focusScore
                      ? "fill-amber-400 text-amber-400"
                      : "text-white/25"
                  }
                />
              ))}
            </div>
          }
        />
      </div>

      {stats && <HourlyChart byHour={stats.byHour} rangeLabel={rangeLabel} />}
    </div>
  );
}
