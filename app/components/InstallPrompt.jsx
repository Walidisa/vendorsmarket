"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [colors, setColors] = useState({
    primary: "#0d3b66",
    accent: "#c58a64"
  });

  const refreshColors = () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("activeTheme");
    const activeTheme = stored ||
      (document.body.classList.contains("theme-food") ? "food" : "clothing");

    const style = getComputedStyle(document.body);
    const foodPrimary =
      style.getPropertyValue("--color-primary-lightbrown")?.trim() || "#8A624A";
    const clothingPrimary =
      style.getPropertyValue("--color-primary")?.trim() || "#0d3b66";

    const primary = activeTheme === "food" ? foodPrimary : clothingPrimary;
    const accent =
      (activeTheme === "food"
        ? foodPrimary
        : style.getPropertyValue("--color-primary-light")?.trim() || clothingPrimary) ||
      (activeTheme === "food" ? "#A98163" : "#c58a64");

    setColors({ primary, accent });
  };

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setVisible(true);
    };
    refreshColors();
    const onThemeChange = () => refreshColors();
    const observer = new MutationObserver(() => refreshColors());
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("vm-theme-change", onThemeChange);
    window.addEventListener("storage", onThemeChange);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("vm-theme-change", onThemeChange);
      window.removeEventListener("storage", onThemeChange);
      observer.disconnect();
    };
  }, []);

  if (!visible || !deferredPrompt) return null;

  const triggerInstall = async () => {
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch (err) {
      // ignore errors, user may dismiss
    } finally {
      setDeferredPrompt(null);
      setVisible(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: "16px",
        transform: "translateX(-50%)",
        zIndex: 15000,
        maxWidth: "480px",
        width: "calc(100% - 32px)",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          background: "#f7f7f7",
          color: "#1d1d1d",
          padding: "12px 14px",
          borderRadius: "14px",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <strong style={{ fontSize: "0.98rem" }}>Install Vendors Market</strong>
          <span style={{ fontSize: "0.87rem", color: "#3c4043" }}>
            Add the app to your home screen for quick access.
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={triggerInstall}
            style={{
              background: colors.primary,
              color: "#fff",
              border: "none",
              padding: "9px 12px",
              borderRadius: "10px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(0,0,0,0.15)"
            }}
          >
            Install
          </button>
          <button
            aria-label="Close install prompt"
            onClick={() => setVisible(false)}
            style={{
              background: "transparent",
              color: "#3c4043",
              border: "none",
              padding: "8px",
              fontSize: "18px",
              cursor: "pointer"
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
