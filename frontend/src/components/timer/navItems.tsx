import { BarChart3, Clock, Dumbbell, Palette, Settings } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const getNavItems = (size = 18): NavItem[] => [
  { id: "timer", label: "Timer", icon: <Clock size={size} /> },
  { id: "workout", label: "Workout Library", icon: <Dumbbell size={size} /> },
  { id: "stats", label: "Activities Summary", icon: <BarChart3 size={size} /> },
  { id: "background", label: "Background", icon: <Palette size={size} /> },
  { id: "settings", label: "Settings", icon: <Settings size={size} /> },
];
