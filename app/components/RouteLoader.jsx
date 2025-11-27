"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function RouteLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true); // cover immediately
  const [fading, setFading] = useState(false);
  const [colors, setColors] = useState(null);
  const timers = useRef([]);

  const refreshThemeAndColors = () => {
    if (typeof window === "undefined") return;
    const theme = localStorage.getItem("activeTheme") || "clothing";
    document.body.classList.remove("theme-food", "theme-clothing");
    document.body.classList.add(theme === "food" ? "theme-food" : "theme-clothing");
    const style = getComputedStyle(document.body);
    const primaryVar = style.getPropertyValue("--color-primary").trim();
    const primaryLightVar = style.getPropertyValue("--color-primary-light").trim();
    const primary = primaryVar || "#0d3b66";
    const primaryLight = primaryLightVar || "#144a82";
    setColors({ primary, primaryLight });
  };

  const showThenHide = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    refreshThemeAndColors();
    setVisible(true);
    setFading(false);
    // fade after a short delay to let new route render
    const fadeTimer = setTimeout(() => setFading(true), 250);
    const hideTimer = setTimeout(() => setVisible(false), 600);
    timers.current.push(fadeTimer, hideTimer);
  };

  useLayoutEffect(() => {
    refreshThemeAndColors();
    showThenHide();
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [pathname]);

  const spinnerColors = colors || { primary: "#888888", primaryLight: "#b5b5b5" };
  if (!visible) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 12000,
        transition: "opacity 0.25s ease-out",
        opacity: fading ? 0 : 1,
        pointerEvents: "auto"
      }}
    >
      <div
        style={{
          display: "inline-block",
          animation: "vm-spin 0.9s linear infinite"
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: `4px solid ${spinnerColors.primaryLight}`,
            borderTopColor: "transparent",
            borderRightColor: spinnerColors.primary,
            borderBottomColor: spinnerColors.primaryLight,
            borderLeftColor: spinnerColors.primary,
            animation: "vm-pulse 1.4s ease-in-out infinite"
          }}
        />
      </div>
    </div>
  );
}
