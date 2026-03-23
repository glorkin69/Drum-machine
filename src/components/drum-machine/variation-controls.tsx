"use client";

import { Zap, BarChart3, Settings2 } from "lucide-react";
import type { FillIntensity, FillCategory } from "@/lib/fill-patterns";
import { FILL_CATEGORIES } from "@/lib/fill-patterns";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";

export type ActiveVariation = "A" | "B" | "fill";

interface VariationControlsProps {
  activeVariation: ActiveVariation;
  onVariationChange: (variation: ActiveVariation) => void;
  fillIntensity: FillIntensity;
  onFillIntensityChange: (intensity: FillIntensity) => void;
  fillCategory: FillCategory;
  onFillCategoryChange: (category: FillCategory) => void;
  fillQueued: boolean;
  onQueueFill: () => void;
  onCancelFill: () => void;
  stepsUntilFill: number | null;
  autoSwitchBars: number;
  onAutoSwitchBarsChange: (bars: number) => void;
  isPlaying: boolean;
}

const INTENSITY_CONFIG: { value: FillIntensity; label: string; colorKey: "accentGreen" | "accentAmber" | "accentRed" }[] = [
  { value: "subtle", label: "S", colorKey: "accentGreen" },
  { value: "moderate", label: "M", colorKey: "accentAmber" },
  { value: "heavy", label: "H", colorKey: "accentRed" },
];

const CATEGORY_CONFIG: { value: FillCategory; label: string; color: string }[] = [
  { value: "transition", label: FILL_CATEGORIES.transition.shortName, color: FILL_CATEGORIES.transition.color },
  { value: "rising-energy", label: FILL_CATEGORIES["rising-energy"].shortName, color: FILL_CATEGORIES["rising-energy"].color },
  { value: "signature", label: FILL_CATEGORIES.signature.shortName, color: FILL_CATEGORIES.signature.color },
];

const AUTO_SWITCH_OPTIONS = [0, 2, 4, 8, 16];

export function VariationControls({
  activeVariation,
  onVariationChange,
  fillIntensity,
  onFillIntensityChange,
  fillCategory,
  onFillCategoryChange,
  fillQueued,
  onQueueFill,
  onCancelFill,
  stepsUntilFill,
  autoSwitchBars,
  onAutoSwitchBarsChange,
  isPlaying,
}: VariationControlsProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);

  return (
    <div className="space-y-2" data-tour="variation-controls">
      {/* Header row */}
      <div className="flex items-center gap-2">
        <Zap className="w-3.5 h-3.5" style={{ color: tc.accentBlue }} />
        <span className="vintage-label" style={{ color: tc.accentBlue }}>VARIATIONS</span>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-1 flex-wrap">
        {/* A/B Variation buttons */}
        <div className="flex items-center gap-1 mr-2">
          <button
            onClick={() => onVariationChange("A")}
            className={`px-3 py-1.5 rounded text-[0.65rem] font-mono font-bold transition-all ${
              activeVariation !== "A" ? "vintage-button" : ""
            }`}
            style={activeVariation === "A" ? {
              backgroundColor: tc.accentGreen,
              color: "white",
              boxShadow: `0 0 8px ${tc.accentGreen}66`,
            } : { color: tc.textMuted }}
            title="Main pattern (A)"
          >
            A
          </button>
          <button
            onClick={() => onVariationChange("B")}
            className={`px-3 py-1.5 rounded text-[0.65rem] font-mono font-bold transition-all ${
              activeVariation !== "B" ? "vintage-button" : ""
            }`}
            style={activeVariation === "B" ? {
              backgroundColor: tc.accentBlue,
              color: "white",
              boxShadow: `0 0 8px ${tc.accentBlue}66`,
            } : { color: tc.textMuted }}
            title="Variation pattern (B)"
          >
            B
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-5 mx-1" style={{ backgroundColor: tc.panelBorder }} />

        {/* Fill trigger button */}
        <button
          onClick={fillQueued ? onCancelFill : onQueueFill}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[0.65rem] font-mono font-bold transition-all ${
            activeVariation === "fill" ? "animate-pulse" : !fillQueued ? "vintage-button" : ""
          }`}
          style={
            activeVariation === "fill"
              ? { backgroundColor: tc.accentOrange, color: "white", boxShadow: `0 0 10px ${tc.padActiveGlow}` }
              : fillQueued
                ? { backgroundColor: `${tc.accentOrange}CC`, color: "white", boxShadow: `0 0 8px ${tc.padActiveGlow}`, border: `1px solid ${tc.accentOrange}` }
                : { color: tc.accentOrange, border: `1px solid ${tc.accentOrange}4D` }
          }
          title={fillQueued ? "Cancel queued fill (F)" : "Queue fill for next bar (F)"}
        >
          <BarChart3 className="w-3 h-3" />
          {activeVariation === "fill"
            ? "FILL \u25B6"
            : fillQueued
              ? `FILL (${stepsUntilFill !== null ? stepsUntilFill : "..."})`
              : "FILL"
          }
        </button>

        {/* Separator */}
        <div className="w-px h-5 mx-1" style={{ backgroundColor: tc.panelBorder }} />

        {/* Fill category selector */}
        <div className="flex items-center gap-1">
          <span className="vintage-label text-[0.55rem]">TYPE</span>
          {CATEGORY_CONFIG.map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => onFillCategoryChange(value)}
              className={`px-2 py-1 rounded text-[0.6rem] font-mono transition-all ${
                fillCategory !== value ? "vintage-button" : ""
              }`}
              style={fillCategory === value
                ? { backgroundColor: color, color: "white", boxShadow: `0 0 6px ${color}66` }
                : { color: tc.textMuted }
              }
              title={`${FILL_CATEGORIES[value].name}: ${FILL_CATEGORIES[value].description}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="w-px h-5 mx-1" style={{ backgroundColor: tc.panelBorder }} />

        {/* Fill intensity selector */}
        <div className="flex items-center gap-1">
          <span className="vintage-label text-[0.55rem]">INTENSITY</span>
          {INTENSITY_CONFIG.map(({ value, label, colorKey }) => {
            const color = tc[colorKey];
            return (
              <button
                key={value}
                onClick={() => onFillIntensityChange(value)}
                className={`px-2 py-1 rounded text-[0.6rem] font-mono transition-all ${
                  fillIntensity !== value ? "vintage-button" : ""
                }`}
                style={fillIntensity === value
                  ? { backgroundColor: color, color: "white", boxShadow: `0 0 6px ${color}66` }
                  : { color: tc.textMuted }
                }
                title={`${value} fill intensity`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="w-px h-5 mx-1" style={{ backgroundColor: tc.panelBorder }} />

        {/* Auto-switch control */}
        <div className="flex items-center gap-1">
          <Settings2 className="w-3 h-3" style={{ color: tc.textMuted }} />
          <span className="vintage-label text-[0.55rem]">AUTO</span>
          <select
            value={autoSwitchBars}
            onChange={(e) => onAutoSwitchBarsChange(Number(e.target.value))}
            className="rounded px-1.5 py-0.5 text-[0.6rem] font-mono focus:outline-none"
            style={{ backgroundColor: tc.bodyBg, border: `1px solid ${tc.panelBorder}`, color: tc.stepBorder }}
            title="Auto-switch A/B every N bars (0 = off)"
          >
            {AUTO_SWITCH_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "OFF" : `${n} BAR${n > 1 ? "S" : ""}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active fill indicator */}
      {(activeVariation === "fill" || fillQueued) && isPlaying && (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${activeVariation === "fill" ? "animate-pulse" : ""}`} style={{ backgroundColor: activeVariation === "fill" ? tc.accentOrange : `${tc.accentOrange}80` }} />
          <span className="text-[0.55rem] font-mono" style={{ color: tc.accentOrange }}>
            {activeVariation === "fill"
              ? `${FILL_CATEGORIES[fillCategory].name.toUpperCase()} FILL PLAYING \u2014 returns to main pattern after`
              : `${FILL_CATEGORIES[fillCategory].name.toUpperCase()} FILL QUEUED \u2014 triggers in ${stepsUntilFill ?? "?"} steps`
            }
          </span>
        </div>
      )}
    </div>
  );
}
