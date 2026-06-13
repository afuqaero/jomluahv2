"use client";

import { useEffect, useState } from "react";

export const THEME_STORAGE_KEY = "jomluah-theme";
export const SIDEBAR_COLLAPSED_KEY = "jomluah-sidebar-collapsed";

export type ThemeTokens = {
  bg: string;
  card: string;
  textHeading: string;
  textMuted: string;
  subtleBg: string;
  sidebar: string;
};

// Shared dark/light + sidebar-collapse state, persisted under the same keys
// the dashboard uses so the preference stays in sync across pages.
export function useAppTheme() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Restore saved desktop sidebar collapse preference
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSidebarCollapsed(true);
    }
  }, []);

  // Persist sidebar collapse preference whenever it changes
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Restore saved theme preference, falling back to system preference.
  // Light mode is the default unless the user (or their system) opts into dark.
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDarkMode(stored === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Persist theme preference whenever it changes
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const theme: ThemeTokens = {
    bg: isDarkMode ? "bg-stone-950 text-stone-200" : "bg-[#F0F2F6] text-[#4a5568]",
    card: isDarkMode ? "bg-stone-900/80 border-white/5 shadow-2xl" : "bg-white border border-neutral-200/50 shadow-lg shadow-neutral-100",
    textHeading: isDarkMode ? "text-stone-50" : "text-[#1a202c]",
    textMuted: isDarkMode ? "text-stone-400" : "text-neutral-500",
    subtleBg: isDarkMode ? "bg-white/2 border-white/5" : "bg-neutral-50 border-neutral-150",
    sidebar: isDarkMode ? "bg-stone-900 border-white/5 text-stone-200" : "bg-white border-neutral-200 text-[#4a5568]",
  };

  return { isDarkMode, setIsDarkMode, isSidebarCollapsed, setIsSidebarCollapsed, theme };
}
