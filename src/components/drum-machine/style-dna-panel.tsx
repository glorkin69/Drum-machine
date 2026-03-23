"use client";

import { useState } from "react";
import { Dna, ThumbsUp, ThumbsDown, Sparkles, Wand2, ChevronDown, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";
import type { ArtistDNA, StyleFingerprint } from "@/lib/style-dna";
import { ARTIST_DNA_LIBRARY } from "@/lib/style-dna";

interface StyleDNAPanelProps {
  selectedArtist: ArtistDNA | null;
  onSelectArtist: (artistId: string | null) => void;
  activeFingerprint: StyleFingerprint;
  feedbackCount: number;
  lastFeedback: "liked" | "disliked" | null;
  isFeedbackLoading: boolean;
  onEvolvePattern: () => void;
  onGeneratePattern: () => void;
  onFeedback: (liked: boolean) => void;
  isGuest?: boolean;
}

export function StyleDNAPanel({
  selectedArtist,
  onSelectArtist,
  activeFingerprint,
  feedbackCount,
  lastFeedback,
  isFeedbackLoading,
  onEvolvePattern,
  onGeneratePattern,
  onFeedback,
  isGuest = false,
}: StyleDNAPanelProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);
  const [expanded, setExpanded] = useState(false);

  // Style strength metrics for visual display
  const styleMetrics = [
    { label: "DENSITY", value: activeFingerprint.density, color: tc.accentOrange },
    { label: "SYNCOPATION", value: activeFingerprint.syncopation, color: tc.accentBlue },
    { label: "SWING", value: activeFingerprint.swingTendency, color: "#8E44AD" },
    { label: "COMPLEXITY", value: activeFingerprint.complexity, color: tc.accentGreen },
    { label: "LAYERING", value: activeFingerprint.layering, color: "#E91E63" },
  ];

  return (
    <div data-tour="style-dna">
      {/* Section Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-2"
      >
        <div className="flex items-center gap-2">
          <Dna className="w-4 h-4" style={{ color: "#8E44AD" }} />
          <span
            className="text-[0.65rem] font-mono uppercase tracking-[0.15em] font-bold"
            style={{ color: tc.textMuted }}
          >
            STYLE DNA
          </span>
          {selectedArtist && (
            <span
              className="text-[0.6rem] font-mono px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${selectedArtist.color}20`,
                color: selectedArtist.color,
                border: `1px solid ${selectedArtist.color}40`,
              }}
            >
              {selectedArtist.icon} {selectedArtist.name.toUpperCase()}
            </span>
          )}
          {!selectedArtist && feedbackCount > 0 && (
            <span
              className="text-[0.6rem] font-mono px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${tc.accentGreen}15`,
                color: tc.accentGreen,
                border: `1px solid ${tc.accentGreen}40`,
              }}
            >
              PERSONAL ({feedbackCount} learned)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Quick Evolve button (always visible) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEvolvePattern();
            }}
            className="text-[0.6rem] font-mono h-6 px-2"
            style={{ color: "#8E44AD" }}
            title="Evolve pattern with current style DNA"
          >
            <Wand2 className="w-3 h-3 mr-1" />
            EVOLVE
          </Button>
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5" style={{ color: tc.textMuted }} />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" style={{ color: tc.textMuted }} />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="space-y-4 pt-2 pb-1">
          {/* Artist DNA Selector */}
          <div>
            <div className="vintage-label mb-2">ARTIST DNA PRESETS</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {ARTIST_DNA_LIBRARY.map((artist) => {
                const isSelected = selectedArtist?.id === artist.id;
                return (
                  <button
                    key={artist.id}
                    onClick={() => onSelectArtist(isSelected ? null : artist.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all"
                    style={{
                      backgroundColor: isSelected ? `${artist.color}20` : tc.bodyBg,
                      border: `1px solid ${isSelected ? `${artist.color}80` : tc.panelBorder}`,
                      boxShadow: isSelected ? `0 0 12px ${artist.color}30` : "none",
                    }}
                  >
                    <span className="text-lg">{artist.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-[0.65rem] font-mono font-bold truncate"
                        style={{ color: isSelected ? artist.color : tc.textPrimary }}
                      >
                        {artist.name}
                      </div>
                      <div
                        className="text-[0.5rem] font-mono truncate"
                        style={{ color: tc.textMuted }}
                      >
                        {artist.genres.join(" / ")}
                      </div>
                    </div>
                    {isSelected && (
                      <X className="w-3 h-3 flex-shrink-0" style={{ color: artist.color }} />
                    )}
                  </button>
                );
              })}
            </div>
            {selectedArtist && (
              <p
                className="text-[0.6rem] font-mono mt-2 px-1"
                style={{ color: tc.textMuted }}
              >
                {selectedArtist.description}
              </p>
            )}
          </div>

          {/* Style Strength Indicators */}
          <div>
            <div className="vintage-label mb-2">
              {selectedArtist ? `${selectedArtist.name.toUpperCase()} STYLE DNA` : "YOUR STYLE DNA"}
            </div>
            <div className="space-y-1.5">
              {styleMetrics.map((metric) => (
                <div key={metric.label} className="flex items-center gap-2">
                  <span
                    className="text-[0.55rem] font-mono w-24 text-right flex-shrink-0"
                    style={{ color: tc.textMuted }}
                  >
                    {metric.label}
                  </span>
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: `${tc.panelBorder}80` }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(metric.value * 100)}%`,
                        backgroundColor: metric.color,
                        boxShadow: `0 0 6px ${metric.color}60`,
                      }}
                    />
                  </div>
                  <span
                    className="text-[0.5rem] font-mono w-8 text-right flex-shrink-0"
                    style={{ color: tc.textMuted }}
                  >
                    {Math.round(metric.value * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEvolvePattern}
              className="text-xs font-mono"
              style={{
                color: "#8E44AD",
                backgroundColor: "#8E44AD15",
                border: "1px solid #8E44AD40",
              }}
              title="Transform the current pattern to match the selected style"
            >
              <Wand2 className="w-3.5 h-3.5 mr-1" />
              EVOLVE PATTERN
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onGeneratePattern}
              className="text-xs font-mono"
              style={{
                color: tc.accentBlue,
                backgroundColor: `${tc.accentBlue}15`,
                border: `1px solid ${tc.accentBlue}40`,
              }}
              title="Generate a new pattern entirely from the style DNA"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              GENERATE NEW
            </Button>

            {/* Feedback buttons */}
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-[0.55rem] font-mono mr-1" style={{ color: tc.textMuted }}>
                RATE:
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFeedback(true)}
                disabled={isFeedbackLoading}
                className="h-7 w-7 p-0"
                style={{
                  color: lastFeedback === "liked" ? tc.accentGreen : tc.textMuted,
                  backgroundColor: lastFeedback === "liked" ? `${tc.accentGreen}15` : "transparent",
                  border: lastFeedback === "liked" ? `1px solid ${tc.accentGreen}40` : "1px solid transparent",
                }}
                title="Like this pattern (trains your style DNA)"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFeedback(false)}
                disabled={isFeedbackLoading}
                className="h-7 w-7 p-0"
                style={{
                  color: lastFeedback === "disliked" ? tc.accentRed : tc.textMuted,
                  backgroundColor: lastFeedback === "disliked" ? `${tc.accentRed}15` : "transparent",
                  border: lastFeedback === "disliked" ? `1px solid ${tc.accentRed}40` : "1px solid transparent",
                }}
                title="Dislike this pattern (adjusts your style DNA)"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Learning progress indicator */}
          {feedbackCount > 0 && !selectedArtist && (
            <div
              className="flex items-center gap-2 px-2 py-1.5 rounded text-[0.55rem] font-mono"
              style={{
                backgroundColor: `${tc.accentGreen}08`,
                border: `1px solid ${tc.accentGreen}20`,
                color: tc.textMuted,
              }}
            >
              <Dna className="w-3 h-3" style={{ color: tc.accentGreen }} />
              <span>
                Style DNA trained on {feedbackCount} pattern{feedbackCount !== 1 ? "s" : ""}.
                {feedbackCount < 10
                  ? " Keep rating patterns to improve recommendations!"
                  : feedbackCount < 50
                    ? " Your style is taking shape."
                    : " Strong style profile established."}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
