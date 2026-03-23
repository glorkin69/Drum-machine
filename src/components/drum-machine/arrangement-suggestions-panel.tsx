"use client";

import { useState, useCallback } from "react";
import {
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Check,
  RefreshCw,
  Info,
  Undo2,
  History,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";
import type {
  ArrangementSuggestion,
  UseContext,
  EmotionalProfile,
  SuggestionCategory,
  SuggestionHistoryEntry,
} from "@/lib/emotion-intelligence";
import { USE_CONTEXTS, SUGGESTION_CATEGORIES } from "@/lib/emotion-intelligence";

interface ArrangementSuggestionsPanelProps {
  suggestions: ArrangementSuggestion[];
  activeContext: UseContext | null;
  lastAppliedSuggestion: string | null;
  profile: EmotionalProfile | null;
  genre: string;
  songPart: string;
  suggestionHistory: SuggestionHistoryEntry[];
  suggestionsAppliedCount: number;
  onApplySuggestion: (suggestion: ArrangementSuggestion) => void;
  onUndoSuggestion: () => void;
  onSetContext: (context: UseContext | null) => void;
  onApplyContext: () => void;
  onRefreshSuggestions: () => void;
}

/** Category filter tabs */
const CATEGORY_FILTERS: { key: SuggestionCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "groove", label: "Groove" },
  { key: "dynamic", label: "Dynamic" },
  { key: "genre", label: "Genre" },
  { key: "emotional", label: "Emotion" },
];

export function ArrangementSuggestionsPanel({
  suggestions,
  activeContext,
  lastAppliedSuggestion,
  profile,
  genre,
  songPart,
  suggestionHistory,
  suggestionsAppliedCount,
  onApplySuggestion,
  onUndoSuggestion,
  onSetContext,
  onApplyContext,
  onRefreshSuggestions,
}: ArrangementSuggestionsPanelProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);
  const [expanded, setExpanded] = useState(false);
  const [showContexts, setShowContexts] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SuggestionCategory | "all">("all");
  const [expandedReasoning, setExpandedReasoning] = useState<string | null>(null);
  const [recentlyApplied, setRecentlyApplied] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const contextEntries = Object.entries(USE_CONTEXTS) as [UseContext, (typeof USE_CONTEXTS)[UseContext]][];

  const filteredSuggestions = activeFilter === "all"
    ? suggestions
    : suggestions.filter(s => s.category === activeFilter);

  // Count suggestions per category
  const categoryCounts: Record<string, number> = {};
  for (const s of suggestions) {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  }

  const handleApply = useCallback((suggestion: ArrangementSuggestion) => {
    onApplySuggestion(suggestion);
    setRecentlyApplied(suggestion.id);
    // Clear the flash after animation
    setTimeout(() => setRecentlyApplied(null), 1500);
  }, [onApplySuggestion]);

  const toggleReasoning = useCallback((id: string) => {
    setExpandedReasoning(prev => prev === id ? null : id);
  }, []);

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ backgroundColor: tc.panelBg, borderColor: tc.panelBorder }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 transition-colors"
        style={{ color: tc.textPrimary }}
      >
        <div className="flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5" style={{ color: tc.accentAmber }} />
          <span className="vintage-label">ARRANGEMENT AI</span>
          {suggestions.length > 0 && (
            <span
              className="text-[0.5rem] font-mono px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${tc.accentAmber}22`, color: tc.accentAmber }}
            >
              {suggestions.length}
            </span>
          )}
          {suggestionsAppliedCount > 0 && (
            <span
              className="text-[0.45rem] font-mono px-1 py-0.5 rounded-full flex items-center gap-0.5"
              style={{ backgroundColor: `${tc.accentGreen}18`, color: tc.accentGreen }}
            >
              <Zap className="w-2 h-2" />
              {suggestionsAppliedCount}
            </span>
          )}
        </div>
        {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div style={{ borderTop: `1px solid ${tc.panelBorder}` }}>
          {/* Pattern Analysis Summary */}
          {profile && (
            <div className="px-3 pt-3">
              <div className="text-[0.6rem] font-mono font-bold mb-1.5" style={{ color: tc.textMuted }}>
                PATTERN ANALYSIS
              </div>
              <div
                className="rounded-md p-2 mb-3 grid grid-cols-4 gap-1.5"
                style={{ backgroundColor: `${tc.panelBorder}44` }}
              >
                {([
                  { label: "Energy", value: profile.energy, color: "#E8732A" },
                  { label: "Groove", value: profile.groove, color: "#27AE60" },
                  { label: "Tension", value: profile.tension, color: "#C0392B" },
                  { label: "Complex", value: profile.complexity, color: "#2980B9" },
                ] as const).map(dim => (
                  <div key={dim.label} className="flex flex-col items-center gap-0.5">
                    <div
                      className="w-full rounded-full overflow-hidden"
                      style={{ backgroundColor: `${tc.panelBorder}66`, height: "3px" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round(dim.value * 100)}%`,
                          backgroundColor: dim.color,
                        }}
                      />
                    </div>
                    <span className="text-[0.45rem] font-mono" style={{ color: tc.textMuted }}>
                      {dim.label} {Math.round(dim.value * 100)}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Additional analysis: Heaviness & Brightness */}
              <div
                className="rounded-md p-2 mb-3 grid grid-cols-2 gap-2"
                style={{ backgroundColor: `${tc.panelBorder}33` }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[0.45rem] font-mono" style={{ color: tc.textMuted }}>Bass</span>
                  <div className="flex-1 rounded-full overflow-hidden" style={{ backgroundColor: `${tc.panelBorder}66`, height: "2px" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.round(profile.heaviness * 100)}%`, backgroundColor: "#9B59B6" }}
                    />
                  </div>
                  <span className="text-[0.4rem] font-mono" style={{ color: tc.textMuted }}>{Math.round(profile.heaviness * 100)}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[0.45rem] font-mono" style={{ color: tc.textMuted }}>Bright</span>
                  <div className="flex-1 rounded-full overflow-hidden" style={{ backgroundColor: `${tc.panelBorder}66`, height: "2px" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.round(profile.brightness * 100)}%`, backgroundColor: "#F1C40F" }}
                    />
                  </div>
                  <span className="text-[0.4rem] font-mono" style={{ color: tc.textMuted }}>{Math.round(profile.brightness * 100)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Context Selector */}
          <div className="px-3">
            <button
              onClick={() => setShowContexts(!showContexts)}
              className="w-full flex items-center justify-between mb-2"
            >
              <span className="text-[0.6rem] font-mono font-bold" style={{ color: tc.textMuted }}>
                USE CONTEXT
              </span>
              <span className="text-[0.5rem] font-mono" style={{ color: tc.textAccent }}>
                {activeContext ? USE_CONTEXTS[activeContext].label : "None"}
              </span>
            </button>

            {showContexts && (
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mb-3">
                {contextEntries.map(([key, ctx]) => {
                  const isActive = activeContext === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        onSetContext(isActive ? null : key);
                        setShowContexts(false);
                      }}
                      className="flex flex-col items-center gap-0.5 rounded-md px-1 py-1.5 transition-all border text-center"
                      style={isActive ? {
                        backgroundColor: `${tc.accentAmber}18`,
                        borderColor: tc.accentAmber,
                        color: tc.accentAmber,
                      } : {
                        backgroundColor: "transparent",
                        borderColor: tc.panelBorder,
                        color: tc.textMuted,
                      }}
                    >
                      <span className="text-base leading-none">{ctx.icon}</span>
                      <span className="text-[0.5rem] font-mono font-bold">{ctx.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {activeContext && (
              <div
                className="flex items-center justify-between rounded p-2 mb-3"
                style={{ backgroundColor: `${tc.accentAmber}10`, border: `1px solid ${tc.accentAmber}33` }}
              >
                <div>
                  <div className="text-[0.6rem] font-mono font-bold" style={{ color: tc.accentAmber }}>
                    {USE_CONTEXTS[activeContext].icon} {USE_CONTEXTS[activeContext].label}
                  </div>
                  <div className="text-[0.5rem] font-mono" style={{ color: tc.textMuted }}>
                    {USE_CONTEXTS[activeContext].description}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={onApplyContext}
                  className="text-[0.6rem] h-6 px-2"
                  style={{ backgroundColor: tc.accentAmber, color: "#000" }}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Apply
                </Button>
              </div>
            )}
          </div>

          {/* Suggestions Section */}
          <div className="px-3 pb-3">
            {/* Section header with refresh, history and undo */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-[0.6rem] font-mono font-bold" style={{ color: tc.textMuted }}>
                SMART SUGGESTIONS
              </div>
              <div className="flex items-center gap-1">
                {suggestionHistory.length > 0 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-0.5 text-[0.5rem] font-mono px-1.5 py-0.5 rounded transition-colors"
                    style={{
                      color: showHistory ? tc.accentAmber : tc.textMuted,
                      backgroundColor: showHistory ? `${tc.accentAmber}15` : "transparent",
                    }}
                    title="Suggestion history"
                  >
                    <History className="w-2.5 h-2.5" />
                    {suggestionHistory.length}
                  </button>
                )}
                {lastAppliedSuggestion && (
                  <button
                    onClick={onUndoSuggestion}
                    className="flex items-center gap-0.5 text-[0.5rem] font-mono px-1.5 py-0.5 rounded transition-colors"
                    style={{ color: tc.accentAmber, backgroundColor: `${tc.accentAmber}15` }}
                    title="Undo last suggestion"
                  >
                    <Undo2 className="w-2.5 h-2.5" />
                    Undo
                  </button>
                )}
                <button
                  onClick={onRefreshSuggestions}
                  className="flex items-center gap-0.5 text-[0.5rem] font-mono px-1.5 py-0.5 rounded transition-colors hover:opacity-80"
                  style={{ color: tc.textMuted }}
                  title="Refresh suggestions"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Suggestion History (collapsible) */}
            {showHistory && suggestionHistory.length > 0 && (
              <div
                className="rounded-md p-2 mb-2 space-y-1"
                style={{ backgroundColor: `${tc.panelBorder}33`, border: `1px solid ${tc.panelBorder}55` }}
              >
                <div className="text-[0.5rem] font-mono font-bold mb-1" style={{ color: tc.textMuted }}>
                  RECENTLY APPLIED
                </div>
                {suggestionHistory.slice(0, 5).map((entry, i) => (
                  <div
                    key={`${entry.appliedAt}-${i}`}
                    className="flex items-center justify-between text-[0.5rem] font-mono"
                    style={{ color: tc.textMuted }}
                  >
                    <div className="flex items-center gap-1 min-w-0">
                      <span>{entry.suggestion.icon}</span>
                      <span className="truncate" style={{ color: tc.textPrimary }}>
                        {entry.suggestion.label}
                      </span>
                      <span
                        className="text-[0.4rem] px-1 rounded-full shrink-0"
                        style={{ backgroundColor: `${SUGGESTION_CATEGORIES[entry.suggestion.category].color}22`, color: SUGGESTION_CATEGORIES[entry.suggestion.category].color }}
                      >
                        {entry.suggestion.category}
                      </span>
                    </div>
                    <span className="text-[0.4rem] shrink-0 ml-1">
                      {formatTimeAgo(entry.appliedAt)}
                    </span>
                  </div>
                ))}
                {suggestionHistory.length > 5 && (
                  <div className="text-[0.4rem] font-mono text-center pt-0.5" style={{ color: tc.textMuted }}>
                    +{suggestionHistory.length - 5} more
                  </div>
                )}
              </div>
            )}

            {/* Category filter tabs */}
            {suggestions.length > 0 && (
              <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                {CATEGORY_FILTERS.map(f => {
                  const isActive = activeFilter === f.key;
                  const count = f.key === "all" ? suggestions.length : (categoryCounts[f.key] || 0);
                  if (f.key !== "all" && count === 0) return null;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setActiveFilter(f.key)}
                      className="flex items-center gap-0.5 text-[0.5rem] font-mono px-2 py-1 rounded-full whitespace-nowrap transition-all border"
                      style={isActive ? {
                        backgroundColor: `${tc.accentAmber}20`,
                        borderColor: tc.accentAmber,
                        color: tc.accentAmber,
                      } : {
                        backgroundColor: "transparent",
                        borderColor: tc.panelBorder,
                        color: tc.textMuted,
                      }}
                    >
                      {f.label}
                      <span
                        className="text-[0.4rem] ml-0.5 px-1 py-0 rounded-full"
                        style={{ backgroundColor: isActive ? `${tc.accentAmber}30` : `${tc.panelBorder}66` }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Suggestions list */}
            {filteredSuggestions.length === 0 ? (
              <div
                className="text-center py-4 rounded-md"
                style={{ backgroundColor: `${tc.panelBorder}22` }}
              >
                <Lightbulb className="w-5 h-5 mx-auto mb-1.5 opacity-30" style={{ color: tc.accentAmber }} />
                <div className="text-[0.6rem] font-mono" style={{ color: tc.textMuted }}>
                  {suggestions.length === 0
                    ? "Adjust your pattern or select a genre for AI suggestions"
                    : "No suggestions in this category"}
                </div>
                <div className="text-[0.45rem] font-mono mt-0.5" style={{ color: tc.textMuted, opacity: 0.6 }}>
                  {suggestions.length === 0
                    ? "Try selecting an emotion for targeted recommendations"
                    : "Switch filter to see other suggestions"}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredSuggestions.map(sug => {
                  const wasApplied = lastAppliedSuggestion === sug.id;
                  const justApplied = recentlyApplied === sug.id;
                  const isReasoningOpen = expandedReasoning === sug.id;
                  const catMeta = SUGGESTION_CATEGORIES[sug.category];
                  const priorityColor = sug.priority > 0.7 ? tc.accentOrange :
                    sug.priority > 0.4 ? tc.accentAmber : tc.accentGreen;

                  return (
                    <div
                      key={sug.id}
                      className="rounded-md overflow-hidden transition-all"
                      style={{
                        border: `1px solid ${wasApplied ? tc.accentGreen : justApplied ? tc.accentAmber : tc.panelBorder}`,
                        backgroundColor: wasApplied ? `${tc.accentGreen}12` : justApplied ? `${tc.accentAmber}12` : `${tc.panelBorder}33`,
                      }}
                    >
                      {/* Main suggestion row */}
                      <div className="flex items-start gap-2 p-2">
                        <button
                          onClick={() => handleApply(sug)}
                          className="flex-1 flex items-start gap-2 text-left group min-w-0"
                        >
                          <span className="text-sm leading-none mt-0.5">{sug.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[0.6rem] font-mono font-bold group-hover:underline" style={{ color: tc.textPrimary }}>
                                {sug.label}
                              </span>
                              <span
                                className="text-[0.4rem] font-mono px-1 py-0 rounded-full"
                                style={{ backgroundColor: `${catMeta.color}22`, color: catMeta.color }}
                              >
                                {catMeta.label}
                              </span>
                              {wasApplied && <Check className="w-3 h-3" style={{ color: tc.accentGreen }} />}
                            </div>
                            <div className="text-[0.5rem] font-mono" style={{ color: tc.textMuted }}>
                              {sug.description}
                            </div>
                          </div>
                        </button>

                        {/* Priority + info toggle */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => toggleReasoning(sug.id)}
                            className="p-0.5 rounded transition-colors"
                            style={{
                              color: isReasoningOpen ? tc.accentAmber : tc.textMuted,
                              backgroundColor: isReasoningOpen ? `${tc.accentAmber}15` : "transparent",
                            }}
                            title="Why this suggestion?"
                          >
                            <Info className="w-3 h-3" />
                          </button>
                          <div className="flex flex-col items-center gap-0.5">
                            <div
                              className="w-1 rounded-full"
                              style={{
                                height: `${Math.round(sug.priority * 16 + 4)}px`,
                                backgroundColor: priorityColor,
                              }}
                            />
                            <span className="text-[0.4rem] font-mono" style={{ color: tc.textMuted }}>
                              {Math.round(sug.priority * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Reasoning panel (collapsible) */}
                      {isReasoningOpen && (
                        <div
                          className="px-2.5 pb-2 pt-0.5"
                          style={{ borderTop: `1px solid ${tc.panelBorder}44` }}
                        >
                          <div
                            className="text-[0.5rem] font-mono leading-relaxed rounded p-1.5"
                            style={{ color: tc.textMuted, backgroundColor: `${tc.panelBorder}33` }}
                          >
                            <span style={{ color: tc.accentAmber }}>Why: </span>
                            {sug.reasoning}
                          </div>
                          {/* Modification preview */}
                          <div className="mt-1 flex flex-wrap gap-1">
                            {sug.modifications.map((mod, i) => (
                              <span
                                key={i}
                                className="text-[0.4rem] font-mono px-1 py-0.5 rounded"
                                style={{
                                  backgroundColor: mod.action === "add" ? `${tc.accentGreen}15` : `${tc.accentOrange}15`,
                                  color: mod.action === "add" ? tc.accentGreen : tc.accentOrange,
                                  border: `1px solid ${mod.action === "add" ? tc.accentGreen : tc.accentOrange}33`,
                                }}
                              >
                                {mod.action === "add" ? "+" : mod.action === "remove" ? "-" : "~"} {mod.instrument} ({mod.steps.length} steps)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick stats footer */}
            {profile && suggestions.length > 0 && (
              <div
                className="mt-2 pt-2 flex items-center justify-between text-[0.45rem] font-mono"
                style={{ borderTop: `1px solid ${tc.panelBorder}33`, color: tc.textMuted }}
              >
                <span>
                  {genre.toUpperCase()} / {songPart.toUpperCase()}
                </span>
                <span>
                  {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""} available
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
