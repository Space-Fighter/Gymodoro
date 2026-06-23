import { useState, useEffect } from "react";

const lightThemes = ["bumblebee", "cupcake", "emerald", "retro"];
const darkThemes = ["halloween", "synthwave", "cyberpunk", "night"];

// Temporary mock function for your testing
function ispro() {
  return true;
}

export function useTheme() {
  const [currLightTheme, setCurrLightTheme] = useState(lightThemes[0]);
  const [currDarkTheme, setCurrDarkTheme] = useState(darkThemes[0]);
  const [currTheme, setCurrTheme] = useState(darkThemes[0]);
  const [currentMode, setCurrentMode] = useState("dark");

  // Load themes on initial mount
  useEffect(() => {
    const savedLight = localStorage.getItem("preferred_light_theme");
    const savedDark = localStorage.getItem("preferred_dark_theme");
    const lastUsedMode = localStorage.getItem("last_used_mode") || "dark";

    let resolvedLight = lightThemes[0];
    let resolvedDark = darkThemes[0];

    if (ispro()) {
      if (savedLight && lightThemes.includes(savedLight)) {
        resolvedLight = savedLight;
      }
      if (savedDark && darkThemes.includes(savedDark)) {
        resolvedDark = savedDark;
      }
    } else {
      localStorage.setItem("preferred_light_theme", lightThemes[0]);
      localStorage.setItem("preferred_dark_theme", darkThemes[0]);
    }

    setCurrLightTheme(resolvedLight);
    setCurrDarkTheme(resolvedDark);
    setCurrentMode(lastUsedMode);
    setCurrTheme(lastUsedMode === "light" ? resolvedLight : resolvedDark);
  }, []);

  // Sync the theme string with the HTML document attribute (DaisyUI/Tailwind style)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currTheme);
  }, [currTheme]);

  // Expose an easy function to switch light/dark modes
  const toggleMode = () => {
    const nextMode = currentMode === "light" ? "dark" : "light";
    const nextTheme = nextMode === "light" ? currLightTheme : currDarkTheme;
    
    setCurrentMode(nextMode);
    setCurrTheme(nextTheme);
    localStorage.setItem("last_used_mode", nextMode);
  };

  // Expose an easy function to update a specific light/dark preference selection
  const updatePreference = (modeType, themeName) => {
    if (modeType === "light" && lightThemes.includes(themeName)) {
      setCurrLightTheme(themeName);
      localStorage.setItem("preferred_light_theme", themeName);
      if (currentMode === "light") setCurrTheme(themeName);
    } else if (modeType === "dark" && darkThemes.includes(themeName)) {
      setCurrDarkTheme(themeName);
      localStorage.setItem("preferred_dark_theme", themeName);
      if (currentMode === "dark") setCurrTheme(themeName);
    }
  };

  return {
    currTheme,
    currentMode,
    currLightTheme,
    currDarkTheme,
    lightThemes,
    darkThemes,
    toggleMode,
    updatePreference,
  };
}
