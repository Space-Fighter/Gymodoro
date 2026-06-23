import { useState, useEffect } from "react";

// 🎨 All DaisyUI Themes categorized
const lightThemes = [
  "light", "cupcake", "bumblebee", "emerald", "corporate", "retro", 
  "cyberpunk", "valentine", "garden", "lofi", "pastel", "fantasy", 
  "wireframe", "cmyk", "autumn", "acid", "lemonade", "winter", "nord", "caramellatte"
];

const darkThemes = [
  "dark", "synthwave", "halloween", "forest", "aqua", "black", 
  "luxury", "dracula", "business", "night", "coffee", "dim", "abyss", "silk"
];

// Mock function for your testing
function ispro() {
  return false; // Set to false to test the free tier
}

// src/hooks/useTheme.jsx

// ... (Keep your lightThemes and darkThemes arrays the same as before)

export function useTheme() {
  const [currLightTheme, setCurrLightTheme] = useState(lightThemes[0]);
  const [currDarkTheme, setCurrDarkTheme] = useState(darkThemes[0]);
  const [currentMode, setCurrentMode] = useState("dark");
  const [currTheme, setCurrTheme] = useState(darkThemes[0]);

  // ... (Keep your initial useEffect hook for localStorage the same)

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currTheme);
  }, [currTheme]);

  // Regular button toggle (Flipped between saved preferences)
  const toggleMode = () => {
    const nextMode = currentMode === "light" ? "dark" : "light";
    const nextTheme = nextMode === "light" ? currLightTheme : currDarkTheme;
    
    setCurrentMode(nextMode);
    setCurrTheme(nextTheme);
    localStorage.setItem("last_used_mode", nextMode);
  };

  // 🔥 UPDATED: Now automatically updates mode and active theme string on dropdown click
  const updatePreference = (modeType, themeName) => {
    if (modeType === "light" && lightThemes.includes(themeName)) {
      setCurrLightTheme(themeName);
      setCurrentMode("light"); // 👈 Automatically switch toggle emoji to ☀️
      setCurrTheme(themeName);  // 👈 Instantly apply UI theme
      
      localStorage.setItem("preferred_light_theme", themeName);
      localStorage.setItem("last_used_mode", "light");
    } else if (modeType === "dark" && darkThemes.includes(themeName)) {
      setCurrDarkTheme(themeName);
      setCurrentMode("dark");  // 👈 Automatically switch toggle emoji to 🌙
      setCurrTheme(themeName);   // 👈 Instantly apply UI theme
      
      localStorage.setItem("preferred_dark_theme", themeName);
      localStorage.setItem("last_used_mode", "dark");
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