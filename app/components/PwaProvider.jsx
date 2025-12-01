"use client";

import { useEffect, useState } from "react";

export default function PwaProvider() {
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);

  // Keep theme-color meta consistent (fixed white per request).
  const applyThemeColor = () => {
    if (typeof document === "undefined") return;
    const ensureMeta = (media) => {
      const selector = media
        ? `meta[name="theme-color"][media="${media}"]`
        : 'meta[name="theme-color"]:not([media])';
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "theme-color");
        if (media) meta.setAttribute("media", media);
        document.head.appendChild(meta);
      }
      return meta;
    };
    const metas = [
      ensureMeta(null),
      ensureMeta("(prefers-color-scheme: light)"),
      ensureMeta("(prefers-color-scheme: dark)")
    ];
    metas.forEach((meta) => meta.setAttribute("content", "#ffffff"));
  };

  const syncBodyTheme = () => {
    if (typeof document === "undefined") return;
    const stored = typeof window !== "undefined" ? localStorage.getItem("activeTheme") : null;
    const theme = stored === "food" ? "food" : "clothing";
    document.body.classList.remove("theme-food", "theme-clothing");
    document.body.classList.add(theme === "food" ? "theme-food" : "theme-clothing");
    applyThemeColor();
  };

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return undefined;

    let observer = null;

    const promptUpdate = (worker) => {
      setWaitingWorker(worker);
      setShowUpdate(true);
    };

    const onThemeEvent = () => {
      syncBodyTheme();
    };

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        if (registration.waiting) {
          promptUpdate(registration.waiting);
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && registration.waiting) {
              promptUpdate(registration.waiting);
            }
          });
        });

        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        });
      } catch (err) {
        console.error("Service worker registration failed:", err);
      }
    };

    register();
    syncBodyTheme();
    observer = new MutationObserver(() => applyThemeColor());
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("storage", onThemeEvent);
    window.addEventListener("vm-theme-change", onThemeEvent);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("storage", onThemeEvent);
      window.removeEventListener("vm-theme-change", onThemeEvent);
    };
  }, []);

  const updateApp = () => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  };

  if (!showUpdate || !waitingWorker) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: "90px",
        transform: "translateX(-50%)",
        zIndex: 15000,
        maxWidth: "480px",
        width: "calc(100% - 32px)",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          background: "#0d3b66",
          color: "#fff",
          padding: "12px 14px",
          borderRadius: "14px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <strong style={{ fontSize: "0.98rem" }}>Update available</strong>
          <span style={{ fontSize: "0.87rem", color: "rgba(255,255,255,0.9)" }}>
            Reload to get the latest Vendors Market.
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={updateApp}
            style={{
              background: "#c58a64",
              color: "#fff",
              border: "none",
              padding: "9px 12px",
              borderRadius: "10px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Reload
          </button>
          <button
            aria-label="Dismiss update prompt"
            onClick={() => setShowUpdate(false)}
            style={{
              background: "transparent",
              color: "rgba(255,255,255,0.9)",
              border: "none",
              padding: "8px",
              fontSize: "18px",
              cursor: "pointer"
            }}
          >
            x
          </button>
        </div>
      </div>
    </div>
  );
}
