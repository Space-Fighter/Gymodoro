import React from "react";

export default function ThemeToggle({ currentMode, toggleMode }) {
  // Determine if the current mode is dark
  const isDark = currentMode === "dark";

  return (
    <button
      onClick={toggleMode}
      className={`w-14 h-14 rounded-full text-2xl flex items-center justify-center border shadow-md transition-all duration-300 hover:scale-110 focus:outline-none
        ${isDark 
          ? "bg-neutral border-neutral-focus text-neutral-content" 
          : "bg-base-200 border-base-300 text-base-content"
        }`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}
