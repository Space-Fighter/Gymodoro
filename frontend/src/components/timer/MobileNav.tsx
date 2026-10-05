import { useState } from "react";
import { Compass, X } from "lucide-react";
import logo from "@/assets/brand/gymodoro-logo.png";
import { cn } from "@/lib/utils";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { GLASS_BOTTOM_BAR, GLASS_PANEL, GLASS_TIGHT } from "@/lib/glassPresets";
import { getNavItems } from "./navItems";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Phone replacement for the sidebar: a liquid-glass bar fixed to the very
// bottom of the screen, showing the current tab on the left and an Explore
// (compass) button on the right that opens a pane of rounded, translucent
// tiles for every tab. Note: no ancestor of a glass element may use
// backdrop-filter, or the refraction on the child stops working.
export default function MobileNav({ activeTab, onTabChange }: Props) {
  const [open, setOpen] = useState(false);
  const items = getNavItems(22);
  const current = items.find((i) => i.id === activeTab) ?? items[0];

  const barGlassRef = useLiquidGlass<HTMLElement>(GLASS_BOTTOM_BAR);
  const compassGlassRef = useLiquidGlass<HTMLButtonElement>(GLASS_TIGHT);
  const panelGlassRef = useLiquidGlass<HTMLDivElement>(GLASS_PANEL);

  const choose = (id: string) => {
    onTabChange(id);
    setOpen(false);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/30" onClick={() => setOpen(false)}>
          <div
            ref={panelGlassRef}
            className="glass mx-3 mb-[88px] rounded-3xl border border-white/15 p-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Explore"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="font-poppins text-lg font-bold text-white">Explore</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/80"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => choose(item.id)}
                  className={cn(
                    "flex min-h-[64px] flex-row items-center justify-start gap-3 rounded-2xl border p-3.5 text-left font-poppins font-semibold transition-colors",
                    activeTab === item.id
                      ? "border-emerald-400/60 bg-white/20 text-white"
                      : "border-white/15 bg-white/10 text-white/80 active:bg-white/20",
                  )}
                >
                  {item.icon}
                  <span className="text-sm leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav
        ref={barGlassRef}
        className="glass-tight fixed inset-x-0 bottom-0 z-50 flex items-center gap-3 rounded-t-3xl border-t border-white/15 px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex h-12 min-w-0 flex-1 items-center gap-2.5 font-poppins font-bold text-white">
          <img src={logo} alt="Gymodoro" className="h-9 w-auto shrink-0 object-contain" />
          <span className="h-6 w-px shrink-0 bg-white/25" />
          {current.icon}
          <span className="truncate text-base">{current.label}</span>
        </div>
        <button
          ref={compassGlassRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Explore"
          aria-expanded={open}
          className={cn(
            "glass-tight flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 transition-colors",
            open ? "bg-emerald-500/80 text-slate-950" : "text-white",
          )}
        >
          <Compass size={24} />
        </button>
      </nav>
    </>
  );
}
