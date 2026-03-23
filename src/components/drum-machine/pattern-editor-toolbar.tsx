"use client";

import { useState, useEffect } from "react";
import {
  Undo2,
  Redo2,
  Copy,
  ClipboardPaste,
  Trash2,
  Pencil,
  Gauge,
  Dice5,
  MousePointer,
  Wand2,
} from "lucide-react";
import { type EditorMode } from "@/hooks/use-pattern-editor";
import { type PatternLength, PATTERN_LENGTHS } from "@/lib/drum-patterns";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";

interface PatternEditorToolbarProps {
  editorMode: EditorMode;
  onEditorModeChange: (mode: EditorMode) => void;
  patternLength: PatternLength;
  onPatternLengthChange: (length: PatternLength) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onCopySection: () => void;
  onPasteSection: () => void;
  hasClipboard: boolean;
  onClearAll: () => void;
  isEdited: boolean;
  isHumanized: boolean;
  onAutoHumanize: () => void;
}

export function PatternEditorToolbar({
  editorMode,
  onEditorModeChange,
  patternLength,
  onPatternLengthChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onCopySection,
  onPasteSection,
  hasClipboard,
  onClearAll,
  isEdited,
  isHumanized,
  onAutoHumanize,
}: PatternEditorToolbarProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);
  const [humanizePulse, setHumanizePulse] = useState(false);

  // Brief pulse animation when humanization is applied
  useEffect(() => {
    if (humanizePulse) {
      const timer = setTimeout(() => setHumanizePulse(false), 600);
      return () => clearTimeout(timer);
    }
  }, [humanizePulse]);

  const handleAutoHumanize = () => {
    onAutoHumanize();
    setHumanizePulse(true);
  };

  const modeButtons: { mode: EditorMode; icon: typeof MousePointer; label: string; title: string }[] = [
    { mode: "toggle", icon: MousePointer, label: "PAD", title: "Toggle pads on/off" },
    { mode: "velocity", icon: Gauge, label: "VEL", title: "Edit step velocity (1-127)" },
    { mode: "probability", icon: Dice5, label: "PROB", title: "Edit step probability (0-100%)" },
  ];

  return (
    <div className="space-y-2" data-tour="editor-toolbar">
      {/* Editor mode and status row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Pencil className="w-3.5 h-3.5" style={{ color: tc.accentOrange }} />
          <span className="vintage-label" style={{ color: tc.accentOrange }}>EDITOR</span>
          {isEdited && (
            <span className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: `${tc.accentOrange}20`, color: tc.accentOrange, border: `1px solid ${tc.accentOrange}4D` }}>
              MODIFIED
            </span>
          )}
        </div>

        {/* Pattern length selector */}
        <div className="flex items-center gap-2">
          <span className="vintage-label">LENGTH</span>
          <div className="flex items-center gap-1">
            {PATTERN_LENGTHS.map((len) => (
              <button
                key={len}
                onClick={() => onPatternLengthChange(len)}
                className={`px-2 py-1 text-[0.6rem] font-mono rounded transition-all ${
                  patternLength !== len ? "vintage-button" : ""
                }`}
                style={patternLength === len
                  ? { backgroundColor: tc.accentOrange, color: "white", boxShadow: `0 0 6px ${tc.padActiveGlow}` }
                  : { color: tc.textMuted }
                }
                title={`${len} steps`}
              >
                {len}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools row */}
      <div className="flex items-center gap-1 flex-wrap">
        {/* Mode buttons */}
        <div className="flex items-center gap-1 mr-2">
          {modeButtons.map(({ mode, icon: Icon, label, title }) => (
            <button
              key={mode}
              onClick={() => onEditorModeChange(mode)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded text-[0.6rem] font-mono transition-all ${
                editorMode !== mode ? "vintage-button" : ""
              }`}
              style={editorMode === mode
                ? { backgroundColor: tc.stepBorder, color: tc.bodyBg, boxShadow: `0 0 6px ${tc.stepBorder}66` }
                : { color: tc.textMuted }
              }
              title={title}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="w-px h-5 mx-1" style={{ backgroundColor: tc.panelBorder }} />

        {/* Undo/Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded vintage-button transition-all"
          style={{ color: canUndo ? tc.stepBorder : tc.inputBg }}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded vintage-button transition-all"
          style={{ color: canRedo ? tc.stepBorder : tc.inputBg }}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        {/* Separator */}
        <div className="w-px h-5 mx-1" style={{ backgroundColor: tc.panelBorder }} />

        {/* Copy/Paste */}
        <button
          onClick={onCopySection}
          className="p-1.5 rounded vintage-button transition-all"
          style={{ color: tc.stepBorder }}
          title="Copy pattern (copies all steps)"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onPasteSection}
          disabled={!hasClipboard}
          className="p-1.5 rounded vintage-button transition-all"
          style={{ color: hasClipboard ? tc.stepBorder : tc.inputBg }}
          title="Paste pattern at step 1"
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
        </button>

        {/* Separator */}
        <div className="w-px h-5 mx-1" style={{ backgroundColor: tc.panelBorder }} />

        {/* Auto Humanize */}
        <button
          onClick={handleAutoHumanize}
          className={`flex items-center gap-1 px-2 py-1.5 rounded text-[0.6rem] font-mono transition-all ${
            humanizePulse ? "scale-105" : ""
          } ${!isHumanized ? "vintage-button" : ""}`}
          style={{
            color: isHumanized ? tc.bodyBg : tc.accentOrange,
            backgroundColor: isHumanized ? tc.accentOrange : undefined,
            boxShadow: humanizePulse
              ? `0 0 12px ${tc.accentOrange}88, 0 0 24px ${tc.accentOrange}44`
              : isHumanized
                ? `0 0 6px ${tc.accentOrange}66`
                : undefined,
            transition: "all 0.3s ease",
          }}
          title="Auto Humanize — intelligently applies velocity variation, probability changes, and swing based on genre and BPM for a natural feel"
        >
          <Wand2 className={`w-3 h-3 ${humanizePulse ? "animate-spin" : ""}`} style={{ animationDuration: "0.6s" }} />
          HUMANIZE
          {isHumanized && (
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ backgroundColor: tc.bodyBg, opacity: 0.7 }}
            />
          )}
        </button>

        {/* Separator */}
        <div className="w-px h-5 mx-1" style={{ backgroundColor: tc.panelBorder }} />

        {/* Clear all */}
        <button
          onClick={onClearAll}
          className="flex items-center gap-1 px-2 py-1.5 rounded vintage-button transition-all text-[0.6rem] font-mono"
          style={{ color: tc.accentRed }}
          title="Clear all tracks"
        >
          <Trash2 className="w-3 h-3" />
          CLEAR
        </button>
      </div>
    </div>
  );
}
