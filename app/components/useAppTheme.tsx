"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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

interface ThemeContextType {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean) => void;
  theme: ThemeTokens;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Restore preferences on mount
  useEffect(() => {
    const storedSidebar = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (storedSidebar === "true") {
      setIsSidebarCollapsed(true);
    }
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "dark" || storedTheme === "light") {
      setIsDarkMode(storedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Sync sidebar preference
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Sync theme preference
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const theme: ThemeTokens = {
    bg: isDarkMode ? "bg-stone-950 text-stone-200" : "bg-[#F0F2F6] text-[#4a5568]",
    card: isDarkMode ? "bg-stone-900/80 border-white/5 shadow-2xl" : "bg-white border border-neutral-200/50 shadow-lg shadow-neutral-100",
    textHeading: isDarkMode ? "text-stone-50" : "text-[#1a202c]",
    textMuted: isDarkMode ? "text-stone-400" : "text-neutral-500",
    subtleBg: isDarkMode ? "bg-white/2 border-white/5" : "bg-neutral-50 border-neutral-150",
    sidebar: isDarkMode ? "bg-stone-900 border-white/5 text-stone-200" : "bg-white border-neutral-200 text-[#4a5568]",
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, isSidebarCollapsed, setIsSidebarCollapsed, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
}
