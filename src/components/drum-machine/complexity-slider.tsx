"use client";

import { useCallback, useRef } from "react";
import { Layers, Info } from "lucide-react";
import { getComplexityLabel } from "@/lib/complexity-engine";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";

interface ComplexitySliderProps {
  complexity: number;
  onComplexityChange: (value: number) => void;
}

export function ComplexitySlider({
  complexity,
  onComplexityChange,
}: ComplexitySliderProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);
  const sliderRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onComplexityChange(Number(e.target.value));
    },
    [onComplexityChange]
  );

  const label = getComplexityLabel(complexity);

  // Color gradient based on complexity
  const getSliderColor = () => {
    if (complexity <= 3) return tc.accentGreen;
    if (complexity <= 5) return tc.stepBorder;
    if (complexity <= 7) return tc.accentOrange;
    return tc.accentRed;
  };

  const sliderColor = getSliderColor();
  const fillPercent = ((complexity - 1) / 9) * 100;

  return (
    <div className="space-y-2" data-tour="complexity-slider">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Layers className="w-3.5 h-3.5" style={{ color: sliderColor }} />
        <span className="vintage-label" style={{ color: sliderColor }}>
          PATTERN COMPLEXITY
        </span>
        <div className="relative group">
          <Info className="w-3 h-3 cursor-help" style={{ color: tc.mutedBorder }} />
          <div className="absolute left-0 bottom-full mb-2 z-50 hidden group-hover:block">
            <div className="rounded-md p-3 shadow-lg min-w-[220px]" style={{ backgroundColor: tc.panelBg, border: `1px solid ${tc.panelBorder}` }}>
              <p className="text-[0.65rem] font-mono leading-relaxed" style={{ color: tc.stepBorder }}>
                Adjusts pattern density and intricacy.
                <br />
                <span style={{ color: tc.accentGreen }}>Simple:</span> Basic kick &
                snare, clear structure.
                <br />
                <span style={{ color: tc.stepBorder }}>Medium:</span> Standard preset
                pattern.
                <br />
                <span style={{ color: tc.accentOrange }}>Complex:</span> Ghost notes,
                syncopation, fills.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Slider row */}
      <div className="flex items-center gap-3">
        <span className="text-[0.55rem] font-mono tracking-wider whitespace-nowrap uppercase" style={{ color: tc.mutedBorder }}>
          Simple
        </span>

        <div className="flex-1 relative">
          <div className="relative h-6 flex items-center">
            <div className="absolute inset-x-0 h-2 rounded-full" style={{ backgroundColor: tc.bodyBg, border: `1px solid ${tc.inputBg}` }}>
              <div
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-150"
                style={{
                  width: `${fillPercent}%`,
                  backgroundColor: `${sliderColor}44`,
                  boxShadow: `0 0 6px ${sliderColor}33`,
                }}
              />
            </div>

            <div className="absolute inset-x-0 flex justify-between px-[2px]">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full transition-colors duration-150"
                  style={{ backgroundColor: i + 1 <= complexity ? sliderColor : tc.inputBg }}
                />
              ))}
            </div>

            <input
              ref={sliderRef}
              type="range"
              min={1}
              max={10}
              step={1}
              value={complexity}
              onChange={handleChange}
              className="complexity-range-input absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
              aria-label="Pattern Complexity"
              title={`Complexity: ${complexity} (${label})`}
            />

            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 pointer-events-none transition-all duration-150"
              style={{
                left: `calc(${fillPercent}% - 8px)`,
                backgroundColor: tc.panelBg,
                borderColor: sliderColor,
                boxShadow: `0 0 8px ${sliderColor}55, inset 0 0 4px ${sliderColor}22`,
              }}
            />
          </div>
        </div>

        <span className="text-[0.55rem] font-mono tracking-wider whitespace-nowrap uppercase" style={{ color: tc.mutedBorder }}>
          Complex
        </span>
      </div>

      {/* Level indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="w-1.5 h-3 rounded-sm transition-all duration-150"
                style={{
                  backgroundColor: i + 1 <= complexity ? sliderColor : tc.bodyBg,
                  opacity: i + 1 <= complexity ? 1 : 0.3,
                  boxShadow: i + 1 <= complexity ? `0 0 3px ${sliderColor}66` : "none",
                }}
              />
            ))}
          </div>
        </div>

        <div className="vintage-display inline-block px-3 py-0.5 rounded">
          <span
            className="text-[0.6rem] font-mono font-bold tracking-wider"
            style={{ color: sliderColor }}
          >
            {complexity}/10 &middot; {label.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
