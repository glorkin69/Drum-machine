"use client";

import { EMOTIONS, type Emotion } from "@/lib/drum-patterns";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";
import type { EmotionIntensity } from "@/lib/emotion-intelligence";

interface EmotionSelectorProps {
  selectedEmotion: Emotion | null;
  onEmotionChange: (emotion: Emotion | null) => void;
  intensity?: EmotionIntensity;
  onIntensityChange?: (intensity: EmotionIntensity) => void;
}

const INTENSITY_LABELS: Record<EmotionIntensity, string> = {
  1: "Subtle",
  2: "Light",
  3: "Medium",
  4: "Strong",
  5: "Intense",
};

export function EmotionSelector({
  selectedEmotion,
  onEmotionChange,
  intensity = 3,
  onIntensityChange,
}: EmotionSelectorProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);

  const selectedInfo = selectedEmotion ? EMOTIONS[selectedEmotion] : null;

  return (
    <div className="space-y-2" data-tour="emotion-selector">
      <div className="flex items-center justify-between">
        <div className="vintage-label">MOOD / EMOTION</div>
        {selectedEmotion && (
          <button
            onClick={() => onEmotionChange(null)}
            className="text-[0.6rem] font-mono px-2 py-0.5 rounded transition-all"
            style={{ color: tc.textMuted, border: `1px solid ${tc.panelBorder}` }}
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Emotion Selector Wheel */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {(Object.keys(EMOTIONS) as Emotion[]).map((emotion) => {
          const info = EMOTIONS[emotion];
          const isSelected = selectedEmotion === emotion;
          const intensityScale = isSelected ? intensity / 5 : 0;
          return (
            <button
              key={emotion}
              onClick={() => onEmotionChange(isSelected ? null : emotion)}
              className="px-2 py-2.5 rounded-lg font-mono text-xs tracking-wider transition-all border flex flex-col items-center gap-1"
              style={isSelected ? {
                backgroundColor: `${info.color}${Math.round(intensityScale * 40 + 10).toString(16).padStart(2, '0')}`,
                borderColor: info.color,
                boxShadow: `0 0 ${Math.round(intensityScale * 20 + 4)}px ${info.color}${Math.round(intensityScale * 80 + 20).toString(16).padStart(2, '0')}, inset 0 0 ${Math.round(intensityScale * 30)}px ${info.color}11`,
                color: info.color,
              } : {
                backgroundColor: tc.panelBg,
                borderColor: tc.panelBorder,
                color: tc.textMuted,
              }}
            >
              <span className="text-base leading-none" role="img" aria-label={info.name}>
                {info.icon}
              </span>
              <span className="text-[0.6rem] font-bold">{info.name}</span>
              <span className="text-[0.5rem] opacity-70 leading-tight">{info.description}</span>
            </button>
          );
        })}
      </div>

      {/* Intensity Control (shows when emotion is selected) */}
      {selectedEmotion && onIntensityChange && selectedInfo && (
        <div
          className="rounded-lg border p-2.5 mt-1"
          style={{
            backgroundColor: `${selectedInfo.color}08`,
            borderColor: `${selectedInfo.color}33`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.6rem] font-mono font-bold" style={{ color: tc.textMuted }}>
              INTENSITY
            </span>
            <span
              className="text-[0.6rem] font-mono font-bold px-1.5 py-0.5 rounded"
              style={{
                color: selectedInfo.color,
                backgroundColor: `${selectedInfo.color}18`,
              }}
            >
              {INTENSITY_LABELS[intensity]}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {([1, 2, 3, 4, 5] as EmotionIntensity[]).map(level => {
              const isActive = level <= intensity;
              const barHeight = 6 + level * 4;
              return (
                <button
                  key={level}
                  onClick={() => onIntensityChange(level)}
                  className="flex-1 flex items-end justify-center transition-all rounded-sm"
                  style={{ height: "30px" }}
                  title={INTENSITY_LABELS[level]}
                >
                  <div
                    className="w-full rounded-sm transition-all duration-200"
                    style={{
                      height: `${barHeight}px`,
                      backgroundColor: isActive ? selectedInfo.color : `${tc.panelBorder}88`,
                      boxShadow: isActive ? `0 0 6px ${selectedInfo.color}44` : "none",
                      opacity: isActive ? 0.5 + (level / 10) : 0.3,
                    }}
                  />
                </button>
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[0.45rem] font-mono" style={{ color: tc.textMuted }}>Subtle</span>
            <span className="text-[0.45rem] font-mono" style={{ color: tc.textMuted }}>Intense</span>
          </div>
        </div>
      )}
    </div>
  );
}
