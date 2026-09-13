import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { GLASS_PANEL } from "@/lib/glassPresets";

interface Props {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  className?: string;
}

export default function StatTile({ icon, label, value, className }: Props) {
  const glassRef = useLiquidGlass<HTMLDivElement>(GLASS_PANEL);
  return (
    <div
      ref={glassRef}
      className={cn(
        "glass rounded-2xl border border-white/25 p-5 flex flex-col gap-3",
        className
      )}
    >
      <div className="text-white/75">{icon}</div>
      <div className="text-white/70 text-sm">{label}</div>
      <div className="text-white text-2xl font-bold font-poppins">{value}</div>
    </div>
  );
}
