"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { applyThemeClasses, getInitialPreferences } from "../../lib/themeUtils";

export default function RouteLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true); // cover immediately
  const [fading, setFading] = useState(false);
  const [colors, setColors] = useState(null);
  const timers = useRef([]);

  const refreshThemeAndColors = () => {
    if (typeof window === "undefined") return;
    const { theme, isDark } = getInitialPreferences("clothing");
    applyThemeClasses(theme, isDark);
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
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        zIndex: 12000,
        background: "transparent",
        pointerEvents: "none",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.25s ease-out"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, ${spinnerColors.primary}, ${spinnerColors.primaryLight})`,
          transformOrigin: "0 50%",
          transform: fading ? "scaleX(0)" : "scaleX(1)",
          transition: "transform 0.4s ease-out",
          boxShadow: `0 0 12px ${spinnerColors.primaryLight}66`
        }}
      />
    </div>
  );
}
