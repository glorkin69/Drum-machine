"use client";

import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";
import { Button } from "@/components/ui/button";
import {
  Music,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronRight,
  Brain,
  Zap,
  RefreshCw,
} from "lucide-react";
import type {
  VirtualBandMember,
  VirtualInstrument,
  MusicalKey,
  MusicalScale,
  AIIntelligenceLevel,
} from "@/lib/collab-types";

interface VirtualBandPanelProps {
  members: VirtualBandMember[];
  enabledCount: number;
  onToggle: (instrument: VirtualInstrument) => void;
  onVolumeChange: (instrument: VirtualInstrument, volume: number) => void;
  onKeyChange: (instrument: VirtualInstrument, key: MusicalKey) => void;
  onScaleChange: (instrument: VirtualInstrument, scale: MusicalScale) => void;
  onIntelligenceChange: (instrument: VirtualInstrument, level: AIIntelligenceLevel) => void;
  onOctaveChange: (instrument: VirtualInstrument, octave: number) => void;
  onFollowIntensityChange: (instrument: VirtualInstrument, intensity: number) => void;
  onRegenerateAll: () => void;
}

const INSTRUMENT_ICONS: Record<VirtualInstrument, string> = {
  bass: "🎸",
  melody: "🎹",
  harmony: "🎵",
  percussion: "🥁",
};

const INSTRUMENT_COLORS: Record<VirtualInstrument, string> = {
  bass: "#E74C3C",
  melody: "#3498DB",
  harmony: "#9B59B6",
  percussion: "#F39C12",
};

const KEYS: MusicalKey[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SCALES: { value: MusicalScale; label: string }[] = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
  { value: "pentatonic", label: "Penta" },
  { value: "blues", label: "Blues" },
  { value: "dorian", label: "Dorian" },
  { value: "mixolydian", label: "Mixo" },
];
const INTELLIGENCE_LEVELS: { value: AIIntelligenceLevel; label: string; icon: typeof Brain }[] = [
  { value: "basic", label: "Basic", icon: Zap },
  { value: "intermediate", label: "Mid", icon: Brain },
  { value: "advanced", label: "Adv", icon: Brain },
];

export function VirtualBandPanel({
  members,
  enabledCount,
  onToggle,
  onVolumeChange,
  onKeyChange,
  onScaleChange,
  onIntelligenceChange,
  onOctaveChange,
  onFollowIntensityChange,
  onRegenerateAll,
}: VirtualBandPanelProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);

  const [expanded, setExpanded] = useState(false);
  const [expandedMember, setExpandedMember] = useState<VirtualInstrument | null>(null);

  return (
    <div className="vintage-panel" style={{ borderColor: tc.panelBorder }} data-tour="virtual-band">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3"
        style={{ color: tc.textPrimary }}
      >
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4" style={{ color: tc.accentAmber }} />
          <span className="vintage-label" style={{ color: tc.textPrimary, fontSize: "0.75rem" }}>
            VIRTUAL BAND
          </span>
          {enabledCount > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-mono"
              style={{ backgroundColor: tc.accentGreen, color: "#000" }}
            >
              {enabledCount} ON
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4" style={{ color: tc.textMuted }} />
        ) : (
          <ChevronRight className="w-4 h-4" style={{ color: tc.textMuted }} />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-[10px]" style={{ color: tc.textMuted }}>
            AI musicians that respond to your drum patterns in real-time.
          </p>

          {/* Regenerate button */}
          {enabledCount > 0 && (
            <Button
              size="sm"
              className="w-full text-xs vintage-button"
              onClick={onRegenerateAll}
              style={{
                backgroundColor: tc.accentAmber,
                color: "#000",
                border: `1px solid ${tc.accentAmber}`,
              }}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Regenerate All Parts
            </Button>
          )}

          {/* Band members */}
          {members.map((member) => (
            <MemberCard
              key={member.instrument}
              member={member}
              tc={tc}
              isExpanded={expandedMember === member.instrument}
              onToggleExpand={() =>
                setExpandedMember(
                  expandedMember === member.instrument ? null : member.instrument
                )
              }
              onToggle={() => onToggle(member.instrument)}
              onVolumeChange={(v) => onVolumeChange(member.instrument, v)}
              onKeyChange={(k) => onKeyChange(member.instrument, k)}
              onScaleChange={(s) => onScaleChange(member.instrument, s)}
              onIntelligenceChange={(l) => onIntelligenceChange(member.instrument, l)}
              onOctaveChange={(o) => onOctaveChange(member.instrument, o)}
              onFollowIntensityChange={(i) => onFollowIntensityChange(member.instrument, i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MemberCard({
  member,
  tc,
  isExpanded,
  onToggleExpand,
  onToggle,
  onVolumeChange,
  onKeyChange,
  onScaleChange,
  onIntelligenceChange,
  onOctaveChange,
  onFollowIntensityChange,
}: {
  member: VirtualBandMember;
  tc: ReturnType<typeof getThemeColors>;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggle: () => void;
  onVolumeChange: (v: number) => void;
  onKeyChange: (k: MusicalKey) => void;
  onScaleChange: (s: MusicalScale) => void;
  onIntelligenceChange: (l: AIIntelligenceLevel) => void;
  onOctaveChange: (o: number) => void;
  onFollowIntensityChange: (i: number) => void;
}) {
  const instColor = INSTRUMENT_COLORS[member.instrument];

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        border: `1px solid ${member.enabled ? instColor : tc.panelBorder}`,
        backgroundColor: member.enabled ? `${instColor}10` : tc.displayBg,
      }}
    >
      {/* Member header */}
      <div className="flex items-center gap-2 p-2">
        <button
          onClick={onToggle}
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all"
          style={{
            backgroundColor: member.enabled ? instColor : "transparent",
            border: `2px solid ${instColor}`,
            color: member.enabled ? "#fff" : instColor,
            boxShadow: member.enabled ? `0 0 8px ${instColor}60` : "none",
          }}
          title={member.enabled ? "Disable" : "Enable"}
        >
          {member.enabled ? "●" : "○"}
        </button>

        <span className="text-sm flex-shrink-0">{INSTRUMENT_ICONS[member.instrument]}</span>

        <div className="flex-1 min-w-0">
          <span className="text-xs font-mono truncate block" style={{ color: tc.textPrimary }}>
            {member.name}
          </span>
        </div>

        {member.enabled && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onVolumeChange(member.volume > 0 ? 0 : 0.7)}
              title={member.volume > 0 ? "Mute" : "Unmute"}
            >
              {member.volume > 0 ? (
                <Volume2 className="w-3 h-3" style={{ color: tc.textMuted }} />
              ) : (
                <VolumeX className="w-3 h-3" style={{ color: tc.accentRed }} />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(member.volume * 100)}
              onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
              className="w-12 h-1 accent-current"
              style={{ accentColor: instColor }}
            />
          </div>
        )}

        <button onClick={onToggleExpand} className="flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" style={{ color: tc.textMuted }} />
          ) : (
            <ChevronRight className="w-3 h-3" style={{ color: tc.textMuted }} />
          )}
        </button>
      </div>

      {/* Expanded settings */}
      {isExpanded && member.enabled && (
        <div className="px-2 pb-2 space-y-2">
          {/* Key & Scale */}
          <div className="flex gap-2">
            <div className="flex-1">
              <span className="text-[9px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
                Key
              </span>
              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {KEYS.map((k) => (
                  <button
                    key={k}
                    onClick={() => onKeyChange(k)}
                    className="px-1 py-0.5 rounded text-[9px] font-mono"
                    style={{
                      backgroundColor: member.key === k ? instColor : "transparent",
                      color: member.key === k ? "#fff" : tc.textMuted,
                      border: `1px solid ${member.key === k ? instColor : tc.panelBorder}`,
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scale */}
          <div>
            <span className="text-[9px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
              Scale
            </span>
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {SCALES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => onScaleChange(s.value)}
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono"
                  style={{
                    backgroundColor: member.scale === s.value ? instColor : "transparent",
                    color: member.scale === s.value ? "#fff" : tc.textMuted,
                    border: `1px solid ${member.scale === s.value ? instColor : tc.panelBorder}`,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Intelligence */}
          <div>
            <span className="text-[9px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
              Intelligence
            </span>
            <div className="flex gap-1 mt-0.5">
              {INTELLIGENCE_LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => onIntelligenceChange(l.value)}
                  className="flex-1 flex items-center justify-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-mono"
                  style={{
                    backgroundColor: member.intelligence === l.value ? instColor : "transparent",
                    color: member.intelligence === l.value ? "#fff" : tc.textMuted,
                    border: `1px solid ${member.intelligence === l.value ? instColor : tc.panelBorder}`,
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Octave */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
              Octave
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onOctaveChange(Math.max(1, member.octave - 1))}
                className="w-5 h-5 rounded text-xs font-mono"
                style={{ backgroundColor: tc.inputBg, color: tc.textPrimary, border: `1px solid ${tc.panelBorder}` }}
              >
                -
              </button>
              <span className="text-xs font-mono w-4 text-center" style={{ color: tc.textPrimary }}>
                {member.octave}
              </span>
              <button
                onClick={() => onOctaveChange(Math.min(7, member.octave + 1))}
                className="w-5 h-5 rounded text-xs font-mono"
                style={{ backgroundColor: tc.inputBg, color: tc.textPrimary, border: `1px solid ${tc.panelBorder}` }}
              >
                +
              </button>
            </div>
          </div>

          {/* Follow Intensity */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
                Follow Drums
              </span>
              <span className="text-[9px] font-mono" style={{ color: instColor }}>
                {Math.round(member.followIntensity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(member.followIntensity * 100)}
              onChange={(e) => onFollowIntensityChange(Number(e.target.value) / 100)}
              className="w-full h-1"
              style={{ accentColor: instColor }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
