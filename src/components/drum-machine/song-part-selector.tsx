"use client";

import { SONG_PARTS, type SongPart } from "@/lib/drum-patterns";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";

interface SongPartSelectorProps {
  selectedPart: SongPart;
  onPartChange: (part: SongPart) => void;
}

export function SongPartSelector({ selectedPart, onPartChange }: SongPartSelectorProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);

  return (
    <div className="space-y-2" data-tour="song-part-selector">
      <div className="vintage-label">SONG PART</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {(Object.keys(SONG_PARTS) as SongPart[]).map((part) => {
          const isSelected = selectedPart === part;
          return (
            <button
              key={part}
              onClick={() => onPartChange(part)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg font-mono text-xs tracking-wider transition-all border"
              style={isSelected ? {
                backgroundColor: tc.stepBorder,
                borderColor: tc.stepBorder,
                color: tc.bodyBg,
                boxShadow: `0 0 8px ${tc.stepBorder}66`,
              } : {
                backgroundColor: tc.panelBg,
                borderColor: tc.panelBorder,
                color: tc.textMuted,
              }}
            >
              <div className="font-semibold">{SONG_PARTS[part].name}</div>
              <div className="text-[0.5rem] sm:text-[0.55rem] mt-0.5 opacity-70 leading-tight">
                {SONG_PARTS[part].description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
