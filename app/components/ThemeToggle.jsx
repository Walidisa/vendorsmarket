"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [darkMode, setDarkMode] = useState(false);

    const updateStyleTag = (isDark) => {
        const isFood = document.body.classList.contains("theme-food");
        const bg = "#1a1a1a"; // Dark gray for all themes
        const fg = isFood ? "#c49a7a" : "#e1e1e1";

        let styleTag = document.getElementById("dark-mode-override");
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = "dark-mode-override";
            document.head.appendChild(styleTag);
        }

        if (isDark) {
            document.body.classList.add("dark");
            document.documentElement.classList.add("dark");
            styleTag.innerHTML = `
                html body.dark.theme-food, html body.dark.theme-clothing {
                    background-color: ${bg} !important;
                }
                html body.dark.theme-food { color: #c49a7a !important; }
                html body.dark.theme-clothing { color: #e1e1e1 !important; }
            `;
        } else {
            document.body.classList.remove("dark");
            document.documentElement.classList.remove("dark");
            styleTag.innerHTML = "";
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const isDark = localStorage.getItem("darkMode") === "true";
            setDarkMode(isDark);
            updateStyleTag(isDark);
        }
    }, []);

    const toggleDarkMode = () => {
        const newVal = !darkMode;
        setDarkMode(newVal);
        localStorage.setItem("darkMode", newVal);
        updateStyleTag(newVal);
        window.dispatchEvent(new Event("vm-theme-change"));
    };

    // Standard render with hydration warning suppressed just in case, though ssr: false prevents it.
    return (
        <button
            onClick={toggleDarkMode}
            className="theme-toggle-btn"
            suppressHydrationWarning
        >
            {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
    );
}
