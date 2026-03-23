"use client";

import { useTheme, type ThemeName } from "@/hooks/use-theme";
import { Palette } from "lucide-react";

const THEMES: { id: ThemeName; label: string; icon: string; description: string }[] = [
  { id: "default", label: "VINTAGE", icon: "🎛️", description: "Classic drum machine" },
  { id: "dark-neon", label: "DARK NEON", icon: "🌃", description: "Synthwave nights" },
  { id: "light-neon", label: "LIGHT NEON", icon: "🌅", description: "Retro sunrise" },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1.5">
      <Palette className="w-3.5 h-3.5 theme-muted-text" />
      <div className="flex items-center gap-1">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={`${t.label} — ${t.description}`}
            className={`
              px-2 py-1 rounded text-[0.6rem] font-mono tracking-wider transition-all duration-200
              ${theme === t.id
                ? "theme-selector-active"
                : "theme-selector-inactive"
              }
            `}
          >
            <span className="mr-1">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
