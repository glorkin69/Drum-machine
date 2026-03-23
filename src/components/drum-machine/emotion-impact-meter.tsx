"use client";

import { useState } from "react";
import { Activity, Brain, Flame, Heart, Music2, Waves, ChevronDown, ChevronRight, Zap } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";
import type { EmotionalProfile, EmotionalImpactScore, PsychoacousticHint } from "@/lib/emotion-intelligence";

interface EmotionImpactMeterProps {
  profile: EmotionalProfile | null;
  impactScore: EmotionalImpactScore | null;
  psychoacousticHints: PsychoacousticHint[];
  onApplyHint?: (hint: PsychoacousticHint) => void;
}

export function EmotionImpactMeter({
  profile,
  impactScore,
  psychoacousticHints,
  onApplyHint,
}: EmotionImpactMeterProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);
  const [showHints, setShowHints] = useState(false);

  if (!profile || !impactScore) {
    return (
      <div
        className="rounded-lg border p-3 opacity-60"
        style={{ backgroundColor: tc.panelBg, borderColor: tc.panelBorder }}
      >
        <div className="vintage-label mb-2">EMOTIONAL IMPACT</div>
        <div className="text-center text-xs font-mono py-4" style={{ color: tc.textMuted }}>
          Select an emotion to see impact analysis
        </div>
      </div>
    );
  }

  const dimensions = [
    { label: "TENSION", value: profile.tension, icon: <Zap className="w-3 h-3" />, color: "#E74C3C" },
    { label: "ENERGY", value: profile.energy, icon: <Flame className="w-3 h-3" />, color: "#F39C12" },
    { label: "VALENCE", value: profile.valence, icon: <Heart className="w-3 h-3" />, color: "#E8729A" },
    { label: "AROUSAL", value: profile.arousal, icon: <Activity className="w-3 h-3" />, color: "#9B59B6" },
    { label: "GROOVE", value: profile.groove, icon: <Music2 className="w-3 h-3" />, color: "#2ECC71" },
    { label: "WEIGHT", value: profile.heaviness, icon: <Waves className="w-3 h-3" />, color: "#3498DB" },
  ];

  const overallColor = impactScore.overall > 70 ? tc.accentGreen :
    impactScore.overall > 40 ? tc.accentAmber : tc.accentRed;

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ backgroundColor: tc.panelBg, borderColor: tc.panelBorder }}
    >
      {/* Header with overall score */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="vintage-label flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" style={{ color: tc.textAccent }} />
            EMOTIONAL IMPACT
          </div>
          <div className="flex items-center gap-2">
            <div
              className="text-lg font-bold font-mono leading-none"
              style={{ color: overallColor }}
            >
              {impactScore.overall}
            </div>
            <div className="text-[0.5rem] font-mono" style={{ color: tc.textMuted }}>/ 100</div>
          </div>
        </div>

        {/* Score breakdown badges */}
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {[
            { label: "FIT", value: impactScore.emotionalFit },
            { label: "GROOVE", value: impactScore.grooveFactor },
            { label: "ENERGY", value: impactScore.energyLevel },
            { label: "RANGE", value: impactScore.dynamicRange },
          ].map(badge => (
            <div
              key={badge.label}
              className="rounded px-1.5 py-1 text-center"
              style={{
                backgroundColor: `${tc.panelBorder}66`,
                borderLeft: `2px solid ${badge.value > 60 ? tc.accentGreen : badge.value > 30 ? tc.accentAmber : tc.accentRed}`,
              }}
            >
              <div className="text-[0.5rem] font-mono" style={{ color: tc.textMuted }}>{badge.label}</div>
              <div className="text-xs font-bold font-mono" style={{ color: tc.textPrimary }}>{badge.value}</div>
            </div>
          ))}
        </div>

        {/* Emotional dimension bars */}
        <div className="space-y-1.5">
          {dimensions.map(dim => (
            <div key={dim.label} className="flex items-center gap-2">
              <div className="flex items-center gap-1 w-[72px]" style={{ color: dim.color }}>
                {dim.icon}
                <span className="text-[0.5rem] font-mono font-bold">{dim.label}</span>
              </div>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${tc.panelBorder}88` }}>
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.round(dim.value * 100)}%`,
                    backgroundColor: dim.color,
                    boxShadow: `0 0 6px ${dim.color}66`,
                  }}
                />
              </div>
              <span className="text-[0.5rem] font-mono w-7 text-right" style={{ color: tc.textMuted }}>
                {Math.round(dim.value * 100)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Psychoacoustic hints */}
      {psychoacousticHints.length > 0 && (
        <div style={{ borderTop: `1px solid ${tc.panelBorder}` }}>
          <button
            onClick={() => setShowHints(!showHints)}
            className="w-full flex items-center gap-1.5 px-3 py-2 text-[0.6rem] font-mono font-bold transition-colors"
            style={{ color: tc.textAccent }}
          >
            {showHints ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            PSYCHOACOUSTIC HINTS ({psychoacousticHints.length})
          </button>
          {showHints && (
            <div className="px-3 pb-3 space-y-2">
              {psychoacousticHints.map(hint => (
                <div
                  key={hint.id}
                  className="rounded p-2 cursor-pointer transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor: `${tc.panelBorder}44`,
                    border: `1px solid ${tc.panelBorder}`,
                  }}
                  onClick={() => onApplyHint?.(hint)}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{hint.icon}</span>
                    <span className="text-[0.6rem] font-mono font-bold" style={{ color: tc.textPrimary }}>
                      {hint.label}
                    </span>
                  </div>
                  <div className="text-[0.5rem] font-mono mb-1" style={{ color: tc.textMuted }}>
                    {hint.description}
                  </div>
                  <div className="flex items-center gap-2 text-[0.5rem] font-mono">
                    <span style={{ color: tc.accentRed }}>{hint.currentValue}</span>
                    <span style={{ color: tc.textMuted }}>→</span>
                    <span style={{ color: tc.accentGreen }}>{hint.suggestedValue}</span>
                    <span className="opacity-60" style={{ color: tc.textMuted }}>({hint.emotionalImpact})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
