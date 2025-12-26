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
    const activeTheme = stored || (document.body.classList.contains("theme-food") ? "food" : "clothing");

    const style = getComputedStyle(document.body);
    const foodPrimary = style.getPropertyValue("--color-primary-lightbrown")?.trim() || "#8A624A";
    const clothingPrimary = style.getPropertyValue("--color-primary")?.trim() || "#0d3b66";

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

      // Check dismissal timestamp
      const dismissed = localStorage.getItem("install_dismissed");
      if (dismissed) {
        const timePassed = Date.now() - parseInt(dismissed, 10);
        // 24 hours = 86400000 ms
        if (timePassed < 86400000) {
          setVisible(false);
          return;
        }
      }
      setVisible(true);
    };

    refreshColors();
    // Show by default if not dismissed in last 24h, even if beforeinstallprompt hasn't fired yet.
    const dismissed = localStorage.getItem("install_dismissed");
    const suppressed = dismissed ? Date.now() - parseInt(dismissed, 10) < 86400000 : false;
    if (!suppressed) setVisible(true);

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

  if (!visible) return null;

  const triggerInstall = async () => {
    if (!deferredPrompt) {
      // No native prompt available; dismiss after surfacing manual guidance.
      localStorage.setItem("install_dismissed", Date.now().toString());
      setVisible(false);
      return;
    }
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
        className="install-prompt-card"
        style={{
          background: "var(--card-bg)",
          color: "var(--color-text)",
          padding: "14px 16px",
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.12)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          gap: "12px"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <strong style={{ fontSize: "1.05rem", lineHeight: 1.2 }}>Download Vendors Market</strong>
          <span className="install-prompt-sub" style={{ fontSize: "0.95rem", color: "var(--color-muted)" }}>
            {deferredPrompt
              ? "Add the app to your home screen for quick access."
              : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", flexWrap: "wrap", lineHeight: 1.35 }}>
                  <span>Open menu (⋮) or</span>
                  <span className="install-share-wrap">
                    <span>Share button</span>
                    <img src="/icons/share.png" alt="Share" className="install-share-icon" />
                  </span>
                  <span>and tap <b>"Add to Home screen"</b> to install.</span>
                </span>
              )}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            justifyContent: "flex-end",
            flexWrap: "nowrap"
          }}
        >
          {deferredPrompt && (
            <button
              onClick={triggerInstall}
              style={{
                background: colors.primary,
                color: "#fff",
                border: "none",
                padding: "9px 14px",
                borderRadius: "12px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                whiteSpace: "nowrap",
                minWidth: "88px",
                flexShrink: 0,
                marginRight: "40px"
              }}
            >
              Install
            </button>
          )}
          <button
            className="install-prompt-close feedback-close"
            onClick={() => {
              setVisible(false);
              localStorage.setItem("install_dismissed", Date.now().toString());
            }}
            style={{
              background: "transparent",
              color: "var(--color-text)",
              border: "1px solid rgba(0,0,0,0.16)",
              padding: "6px",
              fontSize: "16px",
              cursor: "pointer",
              minWidth: "32px",
              minHeight: "32px",
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <img src="/icons/close.png" alt="Close" className="feedback-close-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}

