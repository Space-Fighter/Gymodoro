import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  className?: string;
}

export default function StatTile({ icon, label, value, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/25 bg-white/12 backdrop-blur-xl p-5 flex flex-col gap-3",
        "shadow-[0_4px_24px_rgba(0,0,0,0.15)]",
        className
      )}
    >
      <div className="text-white/75">{icon}</div>
      <div className="text-white/70 text-sm">{label}</div>
      <div className="text-white text-2xl font-bold font-poppins">{value}</div>
    </div>
  );
}
