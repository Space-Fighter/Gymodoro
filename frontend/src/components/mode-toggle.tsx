import { useTheme } from "@/components/theme-provider";

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();

  // In system mode or explicit dark mode, check if effective theme is dark
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full flex items-center justify-center text-lg text-foreground hover:text-emerald-500 bg-transparent border border-border hover:border-emerald-500/50 hover:bg-secondary transition-all duration-200 cursor-pointer"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span className="transition-transform duration-200 transform hover:scale-110">
        {isDark ? "☀" : "☾"}
      </span>
    </button>
  );
}