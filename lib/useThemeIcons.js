"use client";

import { useEffect, useState } from "react";
import { resolveIcon } from "./themeUtils";

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
      const isBack = icon.classList.contains("back-icon");
      const isAdd = icon.classList.contains("profile-add-product-card-icon") || (icon.src || "").includes("add.png");
      const srcRef = icon.getAttribute("data-blue") || icon.getAttribute("src") || "";
      const baseName = (srcRef.split("/").pop() || "").split(".")[0];
      const roleAttr = icon.getAttribute("data-icon");
      const role = roleAttr || (isBack ? "back" : isAdd ? "add" : baseName);

      const resolved = resolveIcon(role, t, isDark);
      if (resolved) {
        icon.src = resolved;
      } else {
        if (role === "back") {
          if (t === "food" && brown) icon.src = brown;
          else if (t === "clothing") icon.src = blue || "/icons/back.png";
        } else {
          if (t === "food" && brown) icon.src = brown;
          if (t === "clothing" && blue) icon.src = blue;
        }
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
    return () => {
      window.removeEventListener("vm-theme-change", handleThemeChange);
    };
  }, [theme]);

  return { theme, setTheme };
}
