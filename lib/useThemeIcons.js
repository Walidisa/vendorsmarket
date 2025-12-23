"use client";

import { useEffect, useState } from "react";

function applyThemeToDom(theme) {
  if (typeof document === "undefined") return;
  const t = theme === "clothing" ? "clothing" : "food";
  // Body class
  document.body.classList.remove("theme-food", "theme-clothing");
  document.body.classList.add(t === "food" ? "theme-food" : "theme-clothing");

  // Check for dark mode
  const isDark = document.body.classList.contains("dark");

  // Nav icons / generic icons with data-brown / data-blue
  const swap = (selector) => {
    document.querySelectorAll(selector).forEach((icon) => {
      const brown = icon.getAttribute("data-brown");
      const blue = icon.getAttribute("data-blue");
      // New logic for clothing dark mode icons
      if (t === "clothing" && isDark) {
        if (icon.src.includes("home")) icon.src = "/icons/home-clothing-dark.png";
        if (icon.src.includes("search")) icon.src = "/icons/search-clothing-dark.png";
        if (icon.src.includes("profile")) icon.src = "/icons/profile-clothing-dark.png";
        // Specific back button icon
        if (icon.classList.contains("back-icon")) icon.src = "/icons/back-button-clothing-dark.png";
        // Specific add button icon
        if (icon.src.includes("add.png")) icon.src = "/icons/add-clothing-dark.png";
      } else {
        // Fallback to standard theme logic
        if (t === "food" && brown) icon.src = brown;
        if (t === "clothing" && blue) icon.src = blue;
      }
    });
  };
  swap(".nav-icon");
  swap(".profile-add-product-card-icon");
  swap(".back-icon");
  swap(".profile-card-btn-icon");
  swap(".profile-shop-edit-icon");
}

export function useThemeIcons(defaultTheme = "clothing") {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("activeTheme") || defaultTheme;
    const next = saved === "clothing" ? "clothing" : "food";
    setTheme(next);
    // Prefer global helpers if present; otherwise our fallback
    if (typeof window.applySavedBodyTheme === "function" && typeof window.updateNavIconsByTheme === "function") {
      window.applySavedBodyTheme();
      window.updateNavIconsByTheme();
    } else {
      applyThemeToDom(next);
    }
  }, [defaultTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial apply
    if (typeof window.applySavedBodyTheme === "function" && typeof window.updateNavIconsByTheme === "function") {
      window.applySavedBodyTheme();
      window.updateNavIconsByTheme();
    } else {
      applyThemeToDom(theme);
    }

    // Listen for dark mode toggles or other theme changes
    const handleThemeChange = () => {
      // Re-apply logic with current theme state
      applyThemeToDom(theme);
    };

    window.addEventListener("vm-theme-change", handleThemeChange);
    return () => window.removeEventListener("vm-theme-change", handleThemeChange);
  }, [theme]);

  return { theme, setTheme };
}
