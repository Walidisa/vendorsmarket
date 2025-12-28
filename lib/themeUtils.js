"use client";

const THEME_KEY = "activeTheme";
const DARK_KEY = "darkMode";

export function getStoredTheme(defaultTheme = "clothing") {
  if (typeof window === "undefined") return defaultTheme;
  const stored = localStorage.getItem(THEME_KEY);
  return stored === "food" || stored === "clothing" ? stored : defaultTheme;
}

export function getStoredDarkMode() {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(DARK_KEY);
  if (stored === "true") return true;
  if (stored === "false") return false;
  // Default to dark to avoid flash when no preference is stored
  return (
    !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ||
    true
  );
}

export function getInitialPreferences(defaultTheme = "clothing") {
  return {
    theme: getStoredTheme(defaultTheme),
    isDark: getStoredDarkMode()
  };
}

export function persistTheme(theme) {
  if (typeof window === "undefined") return;
  const next = theme === "food" ? "food" : "clothing";
  localStorage.setItem(THEME_KEY, next);
  document.cookie = `activeTheme=${next};path=/;max-age=31536000`;
}

export function persistDarkMode(isDark) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DARK_KEY, String(!!isDark));
}

// Centralized icon role → asset map
const clothingDarkIcons = {
  home: "/icons/home-clothing-dark.png",
  search: "/icons/search-clothing-dark.png",
  profile: "/icons/profile-clothing-dark.png",
  back: "/icons/back-button-clothing-dark.png",
  add: "/icons/add-clothing-dark.png",
  edit: "/icons/edit-clothing-dark.png"
};

const clothingLightIcons = {
  home: "/icons/home.png",
  search: "/icons/search.png",
  profile: "/icons/profile.png",
  back: "/icons/back.png",
  add: "/icons/add.png",
  edit: "/icons/edit.png"
};

const foodIcons = {
  home: "/icons/home-lightbrown.png",
  search: "/icons/search-lightbrown.png",
  profile: "/icons/profile-lightbrown.png",
  back: "/icons/back-orange.png",
  add: "/icons/add-orange.png",
  edit: "/icons/edit-orange.png"
};

export function resolveIcon(role, theme, isDark) {
  if (!role) return null;
  const key = role.toLowerCase();
  if (theme === "clothing" && isDark) return clothingDarkIcons[key] || null;
  if (theme === "clothing") return clothingLightIcons[key] || null;
  return foodIcons[key] || null;
}

// Expose to legacy scripts if running in the browser
if (typeof window !== "undefined") {
  window.__vmResolveIcon = resolveIcon;
}

export function applyThemeClasses(theme = "clothing", isDark = false) {
  if (typeof document === "undefined") return;
  const next = theme === "food" ? "food" : "clothing";
  document.body.classList.remove("theme-food", "theme-clothing", "dark");
  document.body.classList.add(next === "food" ? "theme-food" : "theme-clothing");
  if (isDark) document.body.classList.add("dark");
  document.documentElement.classList.toggle("dark", !!isDark);
}

export function applyThemeAndBroadcast(theme, isDark) {
  applyThemeClasses(theme, isDark);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("vm-theme-change"));
  }
}
