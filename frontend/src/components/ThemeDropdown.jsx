// src/components/ThemeDropdown.jsx
import React, { useState } from "react";

// Mock Authentication Functions 
const isLogin = () => true; 
const isPro = () => isLogin() && true; 

export default function ThemeDropdown({ lightThemes, darkThemes, updatePreference }) {
  const [isOpen, setIsOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const freeThemes = ["bumblebee", "halloween"];

  const handleThemeSelect = (modeType, themeName) => {
    if (freeThemes.includes(themeName)) {
      updatePreference(modeType, themeName);
      setIsOpen(false);
      setAuthMessage("");
      return;
    }

    if (!isLogin()) {
      setAuthMessage("Log in to access more themes. 🔒");
      return;
    }

    if (!isPro()) {
      setAuthMessage("Subscribe to Pro for this theme! 💎");
      return;
    }

    updatePreference(modeType, themeName);
    setIsOpen(false);
    setAuthMessage("");
  };

  return (
    <div className="relative inline-block">
      {/* ⌄ Dropdown Arrow Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setAuthMessage(""); 
        }}
        className="w-11 h-11 flex items-center justify-center rounded-full bg-base-200 border border-base-300 text-base-content shadow-md hover:bg-base-300 transition-colors"
      >
        {isOpen ? "🔽" : "▶️"}
      </button>

      {/* 📋 Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-60 bg-base-100 border border-base-300 shadow-2xl rounded-box z-50 overflow-hidden">
          
          {authMessage && (
            <div className="bg-error text-error-content text-xs font-bold p-3 text-center">
              {authMessage}
            </div>
          )}

          <ul className="menu menu-sm p-2 max-h-80 overflow-y-auto">
            <li className="menu-title text-base-content/50"><span>Light Themes</span></li>
            {lightThemes.map((theme) => (
              <li key={theme}>
                <button 
                  onClick={() => handleThemeSelect("light", theme)}
                  className="flex justify-between w-full"
                >
                  <span className="capitalize">{theme}</span>
                  {!freeThemes.includes(theme) && <span className="text-xs opacity-50">💎</span>}
                </button>
              </li>
            ))}

            <div className="divider my-0"></div>

            <li className="menu-title text-base-content/50"><span>Dark Themes</span></li>
            {darkThemes.map((theme) => (
              <li key={theme}>
                <button 
                  onClick={() => handleThemeSelect("dark", theme)}
                  className="flex justify-between w-full"
                >
                  <span className="capitalize">{theme}</span>
                  {!freeThemes.includes(theme) && <span className="text-xs opacity-50">💎</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}