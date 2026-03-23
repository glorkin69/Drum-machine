"use client";

import { Play, Square, SkipBack, BarChart3, VolumeX } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";

import type { FillCategory } from "@/lib/fill-patterns";
import { FILL_CATEGORIES } from "@/lib/fill-patterns";
import type { AudioIssue } from "@/lib/audio-context-manager";

interface TransportControlsProps {
  isPlaying: boolean;
  bpm: number;
  onPlay: () => void;
  onStop: () => void;
  onBpmChange: (bpm: number) => void;
  fillQueued?: boolean;
  fillActive?: boolean;
  fillCategory?: FillCategory;
  onFillTrigger?: () => void;
  stepsUntilFill?: number | null;
  audioIssue?: AudioIssue;
  onAudioUnlock?: () => void;
}

export function TransportControls({
  isPlaying,
  bpm,
  onPlay,
  onStop,
  onBpmChange,
  fillQueued = false,
  fillActive = false,
  fillCategory = "transition",
  onFillTrigger,
  stepsUntilFill = null,
  audioIssue = "none",
  onAudioUnlock,
}: TransportControlsProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);

  return (
    <div className="flex items-center gap-4" data-tour="transport-controls">
      {/* Play/Stop buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onStop}
          className="vintage-button rounded-lg p-3 transition-colors"
          style={{ color: tc.stepBorder }}
          title="Stop & Reset"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={onPlay}
          className="rounded-lg p-3 transition-all text-white"
          style={{
            backgroundColor: isPlaying ? tc.accentRed : tc.accentGreen,
            boxShadow: isPlaying ? `0 0 12px ${tc.accentRed}66` : `0 0 12px ${tc.accentGreen}66`,
          }}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        {/* Fill trigger button (inline in transport) */}
        {onFillTrigger && (
          <button
            onClick={onFillTrigger}
            className={`rounded-lg p-3 transition-all flex items-center gap-1 ${
              fillActive ? "animate-pulse" : !fillQueued ? "vintage-button" : ""
            }`}
            style={
              fillActive
                ? { backgroundColor: tc.accentOrange, color: "white", boxShadow: `0 0 12px ${tc.padActiveGlow}` }
                : fillQueued
                  ? { backgroundColor: `${tc.accentOrange}B3`, color: "white", boxShadow: `0 0 8px ${tc.padActiveGlow}`, border: `1px solid ${tc.accentOrange}` }
                  : { color: tc.accentOrange, border: `1px solid ${tc.accentOrange}66` }
            }
            title={fillActive ? "Turn off fill preview (F)" : fillQueued ? "Cancel fill (F)" : "Toggle fill preview (F)"}
          >
            <BarChart3 className="w-5 h-5" />
            {fillQueued && stepsUntilFill !== null && (
              <span className="text-[0.6rem] font-mono font-bold min-w-[16px]">{stepsUntilFill}</span>
            )}
          </button>
        )}
      </div>

      {/* BPM Control */}
      <div className="flex items-center gap-3">
        <div className="vintage-display px-3 py-2 rounded min-w-[80px] text-center">
          <span className="text-lg font-mono font-bold">{bpm}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="vintage-label">TEMPO</span>
          <div className="flex items-center gap-1">
            {[-5, -1, 1, 5].map((delta) => (
              <button
                key={delta}
                onClick={() => onBpmChange(delta > 0 ? Math.min(200, bpm + delta) : Math.max(60, bpm + delta))}
                className="vintage-button rounded px-2 py-0.5 text-xs font-mono"
                style={{ color: tc.stepBorder }}
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audio Issue Indicator */}
      {audioIssue !== "none" && (
        <button
          onClick={onAudioUnlock}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold tracking-wider transition-all animate-pulse"
          style={{
            backgroundColor: audioIssue === "silent-mode" ? `${tc.accentRed}20` : `${tc.accentOrange}20`,
            color: audioIssue === "silent-mode" ? tc.accentRed : tc.accentOrange,
            border: `1px solid ${audioIssue === "silent-mode" ? tc.accentRed : tc.accentOrange}40`,
          }}
          title={audioIssue === "silent-mode" ? "Silent mode is on" : "Tap to enable audio"}
        >
          <VolumeX className="w-3.5 h-3.5" />
          {audioIssue === "silent-mode" ? "MUTED" : "NO AUDIO"}
        </button>
      )}

      {/* Status LED */}
      <div className="flex items-center gap-2 ml-auto">
        <div className={`vintage-led ${isPlaying ? "active" : ""}`} />
        <span className="vintage-label">
          {fillActive ? `${FILL_CATEGORIES[fillCategory].shortName} FILL` : isPlaying ? "PLAYING" : "STOPPED"}
        </span>
      </div>
    </div>
  );
}
