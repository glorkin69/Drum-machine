"use client";

import { GENRES, type Genre } from "@/lib/drum-patterns";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";

interface GenreSelectorProps {
  selectedGenre: Genre;
  onGenreChange: (genre: Genre) => void;
}

const genreColors: Record<Genre, string> = {
  house: "#9B59B6",      // Purple - classic house vibe
  electronic: "#3498DB", // Blue - modern EDM
  "lo-fi": "#95A5A6",    // Gray - dusty/vintage aesthetic
  pop: "#E91E63",        // Pink - bright pop energy
  rock: "#E74C3C",       // Red - classic rock power
  "hip-hop": "#8E44AD",  // Deep purple - hip-hop culture
  trap: "#F39C12",       // Gold/amber - trap energy
};

export function GenreSelector({ selectedGenre, onGenreChange }: GenreSelectorProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);

  return (
    <div className="space-y-2" data-tour="genre-selector">
      <div className="vintage-label">GENRE</div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(GENRES) as Genre[]).map((genre) => {
          const isSelected = selectedGenre === genre;
          const color = genreColors[genre];
          return (
            <button
              key={genre}
              onClick={() => onGenreChange(genre)}
              className="px-4 py-2 rounded-lg font-mono text-xs tracking-wider transition-all border"
              style={isSelected ? {
                backgroundColor: color,
                borderColor: color,
                color: "white",
                boxShadow: `0 0 12px ${color}66`,
              } : {
                backgroundColor: tc.panelBg,
                borderColor: tc.panelBorder,
                color: tc.textMuted,
              }}
            >
              {GENRES[genre].name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
