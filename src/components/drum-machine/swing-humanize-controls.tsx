"use client";

import { useCallback } from "react";
import { Activity, Info } from "lucide-react";
import type { HumanizeSettings } from "@/lib/humanize";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";

interface SwingHumanizeControlsProps {
  settings: HumanizeSettings;
  onSettingsChange: (settings: HumanizeSettings) => void;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  color,
  description,
  onChange,
  trackBg,
  trackBorder,
  thumbBg,
  labelColor,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: string;
  description: string;
  onChange: (v: number) => void;
  trackBg: string;
  trackBorder: string;
  thumbBg: string;
  labelColor: string;
}) {
  const fillPercent = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[0.6rem] font-mono tracking-wider uppercase" style={{ color: labelColor }}>
          {label}
        </span>
        <div className="vintage-display inline-block px-2 py-0.5 rounded">
          <span
            className="text-[0.55rem] font-mono font-bold tracking-wider"
            style={{ color }}
          >
            {value}
            {unit}
          </span>
        </div>
      </div>

      <div className="relative h-5 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full" style={{ backgroundColor: trackBg, border: `1px solid ${trackBorder}` }}>
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-100"
            style={{
              width: `${fillPercent}%`,
              backgroundColor: `${color}44`,
              boxShadow: `0 0 4px ${color}22`,
            }}
          />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
          aria-label={label}
          title={`${label}: ${value}${unit} - ${description}`}
        />

        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 pointer-events-none transition-all duration-100"
          style={{
            left: `calc(${fillPercent}% - 6px)`,
            backgroundColor: thumbBg,
            borderColor: color,
            boxShadow: `0 0 6px ${color}44`,
          }}
        />
      </div>
    </div>
  );
}

export function SwingHumanizeControls({
  settings,
  onSettingsChange,
}: SwingHumanizeControlsProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);

  const handleSwingChange = useCallback(
    (v: number) => onSettingsChange({ ...settings, swing: v }),
    [settings, onSettingsChange]
  );

  const handleTimingChange = useCallback(
    (v: number) => onSettingsChange({ ...settings, timingHumanize: v }),
    [settings, onSettingsChange]
  );

  const handleVelocityChange = useCallback(
    (v: number) => onSettingsChange({ ...settings, velocityHumanize: v }),
    [settings, onSettingsChange]
  );

  const anyActive = settings.swing > 0 || settings.timingHumanize > 0 || settings.velocityHumanize > 0;
  const accentColor = anyActive ? tc.accentOrange : tc.mutedBorder;

  // Slider colors adapt to theme
  const swingColor = tc.accentOrange;
  const timingColor = tc.accentBlue;
  const velocityColor = tc.accentGreen;

  return (
    <div className="space-y-2" data-tour="swing-humanize">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Activity className="w-3.5 h-3.5" style={{ color: accentColor }} />
        <span className="vintage-label" style={{ color: accentColor }}>
          SWING &amp; HUMANIZE
        </span>
        <div className="relative group">
          <Info className="w-3 h-3 cursor-help" style={{ color: tc.mutedBorder }} />
          <div className="absolute left-0 bottom-full mb-2 z-50 hidden group-hover:block">
            <div className="rounded-md p-3 shadow-lg min-w-[240px]" style={{ backgroundColor: tc.panelBg, border: `1px solid ${tc.panelBorder}` }}>
              <p className="text-[0.65rem] font-mono leading-relaxed" style={{ color: tc.stepBorder }}>
                Make beats feel more natural and less robotic.
                <br />
                <span style={{ color: swingColor }}>Swing:</span> Delays off-beat
                steps for shuffle feel.
                <br />
                <span style={{ color: timingColor }}>Timing:</span> Random &plusmn;ms
                offset per step.
                <br />
                <span style={{ color: velocityColor }}>Velocity:</span> Subtle volume
                variations per hit.
              </p>
            </div>
          </div>
        </div>
        {anyActive && (
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: tc.accentOrange, boxShadow: `0 0 4px ${tc.accentOrange}66` }}
          />
        )}
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SliderRow
          label="Swing"
          value={settings.swing}
          min={0}
          max={100}
          step={1}
          unit="%"
          color={swingColor}
          description="Delays off-beat 16th notes for shuffle feel"
          onChange={handleSwingChange}
          trackBg={tc.bodyBg}
          trackBorder={tc.inputBg}
          thumbBg={tc.panelBg}
          labelColor={tc.textMuted}
        />
        <SliderRow
          label="Timing"
          value={settings.timingHumanize}
          min={0}
          max={20}
          step={1}
          unit="ms"
          color={timingColor}
          description="Random timing variation per step"
          onChange={handleTimingChange}
          trackBg={tc.bodyBg}
          trackBorder={tc.inputBg}
          thumbBg={tc.panelBg}
          labelColor={tc.textMuted}
        />
        <SliderRow
          label="Velocity"
          value={settings.velocityHumanize}
          min={0}
          max={30}
          step={1}
          unit="%"
          color={velocityColor}
          description="Random velocity variation per hit"
          onChange={handleVelocityChange}
          trackBg={tc.bodyBg}
          trackBorder={tc.inputBg}
          thumbBg={tc.panelBg}
          labelColor={tc.textMuted}
        />
      </div>
    </div>
  );
}
