"use client";

import { useEffect } from "react";

/**
 * ThemeInitializer - Applies theme before hydration to prevent flash
 * This component runs its effect as soon as it mounts (during hydration)
 */
export function ThemeInitializer() {
  useEffect(() => {
    // Apply theme immediately on hydration
    try {
      const stored = localStorage.getItem("nigris-theme");
      const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      const theme = stored === "light" || stored === "dark" ? stored : preferred;

      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch (e) {
      console.error("Theme initialization error:", e);
    }
  }, []);

  return null;
}
