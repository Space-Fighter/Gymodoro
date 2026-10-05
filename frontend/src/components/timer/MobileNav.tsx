import { useEffect, useState } from "react";
import { ChevronLeft, Compass, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/brand/gymodoro-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { GLASS_BOTTOM_BAR, GLASS_TIGHT } from "@/lib/glassPresets";
import { getNavItems } from "./navItems";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Phone replacement for the sidebar: a liquid-glass bar fixed to the very
// bottom of the screen, showing the current tab on the left and an Explore
// (compass) button on the right. Explore opens a full-screen page listing
// every tab; Back (or the phone's back gesture) returns to the page you were
// on. The page is a history entry so the system back button closes it
// instead of leaving the app.
export default function MobileNav({ activeTab, onTabChange }: Props) {
  const [exploring, setExploring] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const items = getNavItems(22);
  const current = items.find((i) => i.id === activeTab) ?? items[0];

  const barGlassRef = useLiquidGlass<HTMLElement>(GLASS_BOTTOM_BAR);
  const compassGlassRef = useLiquidGlass<HTMLButtonElement>(GLASS_TIGHT);

  const openExplore = () => {
    window.history.pushState({ ...window.history.state, explore: true }, "");
    setExploring(true);
  };

  // Back = pop the history entry we pushed; the popstate listener closes the page.
  const closeExplore = () => {
    if (window.history.state?.explore) window.history.back();
    else setExploring(false);
  };

  useEffect(() => {
    if (!exploring) return;
    const onPop = () => {
      setExploring(false);
      setConfirmingLogout(false);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [exploring]);

  const choose = (id: string) => {
    onTabChange(id);
    closeExplore();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/welcome", { replace: true });
  };

  return (
    <>
      {exploring && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-black/75 backdrop-blur-xl"
          role="dialog"
          aria-label="Explore"
        >
          <header className="flex items-center gap-1 px-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
            <button
              type="button"
              onClick={closeExplore}
              aria-label="Back"
              className="flex h-11 items-center gap-1 rounded-xl pr-3 pl-1 font-poppins text-base font-semibold text-white"
            >
              <ChevronLeft size={26} />
              Back
            </button>
            <h2 className="flex-1 pr-16 text-center font-poppins text-lg font-bold text-white">Explore</h2>
          </header>

          <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
            <div className="grid grid-cols-1 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => choose(item.id)}
                  className={cn(
                    "flex min-h-[64px] flex-row items-center justify-start gap-3 rounded-2xl border p-4 text-left font-poppins font-semibold transition-colors",
                    activeTab === item.id
                      ? "border-emerald-400/60 bg-white/20 text-white"
                      : "border-white/15 bg-white/10 text-white/80 active:bg-white/20",
                  )}
                >
                  {item.icon}
                  <span className="text-base leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Logout sits at the very bottom, apart from the tabs, and needs a second tap */}
          <div className="border-t border-white/15 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {confirmingLogout ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmingLogout(false)}
                  className="h-12 flex-1 rounded-xl border border-white/20 bg-white/10 font-poppins text-sm font-semibold text-white/85"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="h-12 flex-1 rounded-xl border border-red-400/60 bg-red-500/30 font-poppins text-sm font-bold text-red-100"
                >
                  Yes, log out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingLogout(true)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-transparent font-poppins text-sm font-semibold text-red-300/90"
              >
                <LogOut size={16} />
                Log out
              </button>
            )}
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
          onClick={openExplore}
          aria-label="Explore"
          className="glass-tight flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 text-white transition-colors"
        >
          <Compass size={24} />
        </button>
      </nav>
    </>
  );
}
