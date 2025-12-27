"use client";

import { useEffect, useState } from "react";
import {
  applyThemeAndBroadcast,
  applyThemeClasses,
  getInitialPreferences,
  getStoredTheme,
  persistDarkMode
} from "../../lib/themeUtils";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  const updateStyleTag = (isDark) => {
    if (typeof document === "undefined") return;
    const bg = "#1a1a1a"; // Dark gray for all themes
    const fg = "#e1e1e1"; // Unified light text for dark mode

    let styleTag = document.getElementById("dark-mode-override");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "dark-mode-override";
      document.head.appendChild(styleTag);
    }

    if (isDark) {
      styleTag.innerHTML = `
                html body.dark.theme-food, html body.dark.theme-clothing {
                    background-color: ${bg} !important;
                }
                html body.dark.theme-food { color: ${fg} !important; }
                html body.dark.theme-clothing { color: ${fg} !important; }
            `;
    } else {
      styleTag.innerHTML = "";
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { theme, isDark } = getInitialPreferences("clothing");
    setDarkMode(isDark);
    applyThemeClasses(theme, isDark);
    updateStyleTag(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    persistDarkMode(newVal);
    const theme = getStoredTheme("clothing");
    applyThemeAndBroadcast(theme, newVal);
    updateStyleTag(newVal);
  };

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className={`theme-toggle-slider${darkMode ? " is-dark" : ""}`}
      suppressHydrationWarning
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-thumb" aria-hidden="true">
          {darkMode ? "🌙" : "☀️"}
        </span>
      </span>
    </button>
  );
}
