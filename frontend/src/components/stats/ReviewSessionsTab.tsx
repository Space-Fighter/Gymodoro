import type { ReactNode } from "react";
import { CheckCircle2, CircleDashed, Dumbbell, SkipForward, XCircle } from "lucide-react";
import { useSessions } from "@/hooks/useSessions";
import type { SessionStatus } from "@/types/session";

const STATUS_META: Record<
  SessionStatus,
  { label: string; icon: ReactNode; className: string }
> = {
  completed: {
    label: "Completed",
    icon: <CheckCircle2 size={16} />,
    className: "text-emerald-400",
  },
  in_progress: {
    label: "In Progress",
    icon: <CircleDashed size={16} />,
    className: "text-sky-400",
  },
  break: {
    label: "On Break",
    icon: <CircleDashed size={16} />,
    className: "text-amber-400",
  },
  skipped: {
    label: "Skipped",
    icon: <SkipForward size={16} />,
    className: "text-white/50",
  },
  abandoned: {
    label: "Abandoned",
    icon: <XCircle size={16} />,
    className: "text-red-400",
  },
};

export default function ReviewSessionsTab() {
  const { sessions, loading } = useSessions(30);

  if (loading) {
    return <div className="text-white/50 text-center py-12">Loading sessions…</div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="text-white/50 text-center py-12">
        No sessions yet — start a focus timer to see it here.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {sessions.map((session) => {
        const meta = STATUS_META[session.status];
        return (
          <div
            key={session.id}
            className="rounded-xl border border-white/25 bg-white/12 backdrop-blur-xl p-4 flex items-center justify-between gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.15)]"
          >
            <div className="flex flex-col gap-1">
              <div className="text-white font-semibold font-poppins">
                {new Date(session.startedAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
              <div className="flex items-center gap-3 text-white/50 text-sm">
                <span>{session.workMinutes}m focus</span>
                <span>{session.breakMinutes}m break</span>
                {session.exercise && (
                  <span className="flex items-center gap-1">
                    <Dumbbell size={14} />
                    {session.exercise.name}
                  </span>
                )}
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-sm font-semibold ${meta.className}`}>
              {meta.icon}
              {meta.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
