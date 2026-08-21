import { ChevronLeft, Clock, Dumbbell, Palette, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  open: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({
  open,
  onToggle,
  activeTab,
  onTabChange,
}: Props) {
  const navItems: NavItem[] = [
    { id: "timer", label: "Timer", icon: <Clock size={18} /> },
    {
      id: "workout",
      label: "Workout Library",
      icon: <Dumbbell size={18} />,
    },
    { id: "background", label: "Background", icon: <Palette size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <div
      className={cn(
        "fixed left-1 top-[106px] bottom-4 w-68 rounded-3xl",
        "bg-black/42 border border-white/15",
        "flex flex-col p-6 gap-2 z-20",
        "transition-all duration-300 ease-in-out",
        open
          ? "opacity-100 translate-x-0 pointer-events-auto"
          : "opacity-0 -translate-x-4 pointer-events-none"
      )}
    >
      {/* Collapse Button */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute top-3 right-3 w-8 h-8 rounded-lg",
          "border border-white/20 bg-white/8 hover:bg-white/14",
          "flex items-center justify-center text-white transition-colors"
        )}
      >
        <ChevronLeft size={16} className="stroke-2" />
      </button>

      {/* Nav Items */}
      <div className="mt-8 flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex items-center gap-2.5 px-3.5 py-3 rounded-2xl",
              "border-none font-bold text-xl font-poppins",
              "transition-all hover:bg-white/12 cursor-pointer",
              activeTab === item.id
                ? "bg-white/12 text-white"
                : "bg-transparent text-white/50"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
