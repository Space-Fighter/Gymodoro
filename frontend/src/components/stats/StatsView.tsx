import { useState } from "react";
import { BarChart3, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import AnalyticsTab from "@/components/stats/AnalyticsTab";
import ReviewSessionsTab from "@/components/stats/ReviewSessionsTab";

type StatsTab = "analytics" | "sessions";

interface Props {
  contentLeft: string;
}

export default function StatsView({ contentLeft }: Props) {
  const [tab, setTab] = useState<StatsTab>("analytics");

  return (
    <div
      className="absolute inset-0 overflow-y-auto p-6 pt-36 max-md:p-4 max-md:pt-6 max-md:pb-24"
      style={{ left: contentLeft, transition: "left 0.25s ease" }}
    >
      <div>
        <h2 className="text-3xl font-bold text-white font-poppins mb-2">
          Activities Summary
        </h2>
        <p className="text-sm text-white/50 mb-6">Your focus and workout stats</p>
      </div>

      <div className="flex items-center gap-6 mb-6 border-b border-white/10">
        <button
          onClick={() => setTab("analytics")}
          className={cn(
            "flex items-center gap-2 pb-3 text-sm font-semibold font-poppins border-b-2 -mb-px transition-colors",
            tab === "analytics"
              ? "text-white border-white"
              : "text-white/50 border-transparent hover:text-white/80"
          )}
        >
          <BarChart3 size={16} />
          Analytics
        </button>
        <button
          onClick={() => setTab("sessions")}
          className={cn(
            "flex items-center gap-2 pb-3 text-sm font-semibold font-poppins border-b-2 -mb-px transition-colors",
            tab === "sessions"
              ? "text-white border-white"
              : "text-white/50 border-transparent hover:text-white/80"
          )}
        >
          <ListChecks size={16} />
          Review Sessions
        </button>
      </div>

      <div className="max-w-5xl">
        {tab === "analytics" ? <AnalyticsTab /> : <ReviewSessionsTab />}
      </div>
    </div>
  );
}
