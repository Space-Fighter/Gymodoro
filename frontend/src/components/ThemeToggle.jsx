import React from 'react';
import { useTheme } from '../hooks/useTheme'; // Adjust path based on your file structure
import './ThemeToggle.css';             // Optional standalone styles

export default function ThemeToggle() {
  // Destructure the necessary values from your hook
  const { currentMode, toggleMode } = useTheme();

  // Determine if the current mode is dark
  const isDark = currentMode === 'dark';

  return (
    <button
      onClick={toggleMode}
      className={`theme-toggle-btn ${isDark ? 'dark-active' : ''}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
}
