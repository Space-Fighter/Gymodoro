// src/components/ThemeDropdown.jsx
import React, { useState } from "react";

// Mock Authentication Functions 
const isLogin = () => false; 
const isPro = () => isLogin() && false; 

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

  // 🎨 Reusable Theme Card Component
  const ThemeCard = ({ theme, modeType }) => (
    <button
      onClick={() => handleThemeSelect(modeType, theme)}
      data-theme={theme} // 👈 The magic: Scopes this card to the specific theme
      className="relative w-full text-left bg-base-100 text-base-content border-base-content/20 hover:border-primary outline-base-content overflow-hidden rounded-lg border transition-all shadow-sm"
    >
      {/* Pro Badge */}
      {!freeThemes.includes(theme) && (
        <span className="absolute top-2 right-2 text-xs z-10 drop-shadow-md">💎</span>
      )}
      
      {/* Card Content */}
      <div className="w-full cursor-pointer font-sans p-3">
        <div className="font-bold text-sm capitalize mb-2">{theme}</div>
        
        {/* Color Swatches */}
        <div className="flex flex-wrap gap-1">
          <div className="bg-primary flex aspect-square w-5 items-center justify-center rounded lg:w-6">
            <span className="text-primary-content text-[10px] font-bold">A</span>
          </div>
          <div className="bg-secondary flex aspect-square w-5 items-center justify-center rounded lg:w-6">
            <span className="text-secondary-content text-[10px] font-bold">A</span>
          </div>
          <div className="bg-accent flex aspect-square w-5 items-center justify-center rounded lg:w-6">
            <span className="text-accent-content text-[10px] font-bold">A</span>
          </div>
          <div className="bg-neutral flex aspect-square w-5 items-center justify-center rounded lg:w-6">
            <span className="text-neutral-content text-[10px] font-bold">A</span>
          </div>
        </div>
      </div>
    </button>
  );

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
        {isOpen ? "⌄" : ">"}
      </button>

      {/* 📋 Dropdown Menu (Expanded Width for Grid) */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-[22rem] md:w-[32rem] bg-base-100 border border-base-300 shadow-2xl rounded-box z-50 overflow-hidden">
          
          {authMessage && (
            <div className="bg-error text-error-content text-sm font-bold p-3 text-center">
              {authMessage}
            </div>
          )}

          <div className="p-4 max-h-[75vh] overflow-y-auto">
            
            {/* Light Themes Section */}
            <h3 className="font-bold text-base-content/50 mb-3 uppercase text-xs tracking-wider">Light Themes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {lightThemes.map((theme) => (
                <ThemeCard key={theme} theme={theme} modeType="light" />
              ))}
            </div>

            <div className="divider"></div>

            {/* Dark Themes Section */}
            <h3 className="font-bold text-base-content/50 mb-3 uppercase text-xs tracking-wider">Dark Themes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {darkThemes.map((theme) => (
                <ThemeCard key={theme} theme={theme} modeType="dark" />
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}