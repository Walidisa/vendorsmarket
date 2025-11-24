"use client";

import { useEffect, useState } from "react";

function applyThemeToDom(theme) {
  if (typeof document === "undefined") return;
  const t = theme === "clothing" ? "clothing" : "food";
  // Body class
  document.body.classList.remove("theme-food", "theme-clothing");
  document.body.classList.add(t === "food" ? "theme-food" : "theme-clothing");

  // Nav icons / generic icons with data-brown / data-blue
  const swap = (selector) => {
    document.querySelectorAll(selector).forEach((icon) => {
      const brown = icon.getAttribute("data-brown");
      const blue = icon.getAttribute("data-blue");
      if (t === "food" && brown) icon.src = brown;
      if (t === "clothing" && blue) icon.src = blue;
    });
  };
  swap(".nav-icon");
  swap(".profile-add-product-card-icon");
  swap(".back-icon");
  swap(".profile-card-btn-icon");
  swap(".profile-shop-edit-icon");
}

export function useThemeIcons(defaultTheme = "food") {
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
    if (typeof window.applySavedBodyTheme === "function" && typeof window.updateNavIconsByTheme === "function") {
      window.applySavedBodyTheme();
      window.updateNavIconsByTheme();
    } else {
      applyThemeToDom(theme);
    }
  }, [theme]);

  return { theme, setTheme };
}
