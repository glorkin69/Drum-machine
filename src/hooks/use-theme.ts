"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ThemeName = "default" | "dark-neon" | "light-neon";

export interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "default",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = "beatforge-theme";

export function useThemeProvider(): ThemeContextType {
  const [theme, setThemeState] = useState<ThemeName>("default");

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
      if (saved && ["default", "dark-neon", "light-neon"].includes(saved)) {
        setThemeState(saved);
        applyThemeClass(saved);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const setTheme = useCallback((newTheme: ThemeName) => {
    setThemeState(newTheme);
    applyThemeClass(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // localStorage not available
    }
  }, []);

  return { theme, setTheme };
}

function applyThemeClass(theme: ThemeName) {
  const html = document.documentElement;
  html.classList.remove("theme-default", "theme-dark-neon", "theme-light-neon");
  html.classList.add(`theme-${theme}`);

  // For light-neon, remove "dark" class so Tailwind dark mode is off
  // For others, ensure "dark" class is present
  if (theme === "light-neon") {
    html.classList.remove("dark");
  } else {
    html.classList.add("dark");
  }
}
