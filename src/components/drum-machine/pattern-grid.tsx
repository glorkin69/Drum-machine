"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { INSTRUMENTS } from "@/lib/drum-patterns";
import type { DrumPattern, VelocityMap, ProbabilityMap, MultiHitMap, PatternLength, Genre } from "@/lib/drum-patterns";
import type { EditorMode } from "@/hooks/use-pattern-editor";
import type { SelectedVariations } from "@/lib/drum-sound-variations";
import { Trash2 } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";
import { DrumSoundSelector } from "./drum-sound-selector";

interface PatternGridProps {
  pattern: DrumPattern;
  velocity: VelocityMap;
  probability: ProbabilityMap;
  multiHit: MultiHitMap;
  patternLength: PatternLength;
  currentStep: number;
  isPlaying: boolean;
  editorMode: EditorMode;
  onPadClick: (instrumentId: string, step: number) => void;
  onInstrumentPlay: (instrumentId: string) => void;
  onVelocityChange: (instrumentId: string, step: number, value: number) => void;
  onProbabilityChange: (instrumentId: string, step: number, value: number) => void;
  onMultiHitChange: (instrumentId: string, step: number, hits: number) => void;
  onClearTrack: (instrumentId: string) => void;
  fillPreviewActive?: boolean;
  genre: Genre;
  soundVariations: SelectedVariations;
  onSoundVariationChange: (instrumentId: string, variationId: string) => void;
  onPreviewSoundVariation: (instrumentId: string, variationId: string) => void;
}

// Velocity bar color based on value (theme-aware)
function getVelocityColor(vel: number, high: string, med: string, low: string, vlow: string): string {
  if (vel >= 100) return high;
  if (vel >= 70) return med;
  if (vel >= 40) return low;
  return vlow;
}

// Probability display opacity
function getProbabilityOpacity(prob: number): number {
  return 0.3 + (prob / 100) * 0.7;
}

// Multi-hit dots component
function MultiHitDots({ count, color }: { count: number; color: string }) {
  if (count <= 1) return null;
  return (
    <div className="absolute top-0.5 left-0.5 flex flex-col gap-px pointer-events-none">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: color, opacity: 0.9 }}
        />
      ))}
    </div>
  );
}

export function PatternGrid({
  pattern,
  velocity,
  probability,
  multiHit,
  patternLength,
  currentStep,
  isPlaying,
  editorMode,
  onPadClick,
  onInstrumentPlay,
  onVelocityChange,
  onProbabilityChange,
  onMultiHitChange,
  onClearTrack,
  fillPreviewActive = false,
  genre,
  soundVariations,
  onSoundVariationChange,
  onPreviewSoundVariation,
}: PatternGridProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);
  const [editingCell, setEditingCell] = useState<{ inst: string; step: number } | null>(null);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const [dragStartY, setDragStartY] = useState<number>(0);

  // Context menu state for multi-hit
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; inst: string; step: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const steps = Array.from({ length: patternLength });

  // Close context menu when clicking outside
  useEffect(() => {
    if (!contextMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleScroll = () => setContextMenu(null);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [contextMenu]);

  // Handle right-click context menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, instrumentId: string, step: number) => {
      const isActive = pattern[instrumentId]?.[step] ?? false;
      if (!isActive) return; // Only show for active steps
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, inst: instrumentId, step });
    },
    [pattern]
  );

  // Handle multi-hit selection from context menu
  const handleMultiHitSelect = useCallback(
    (hits: number) => {
      if (contextMenu) {
        onMultiHitChange(contextMenu.inst, contextMenu.step, hits);
        setContextMenu(null);
      }
    },
    [contextMenu, onMultiHitChange]
  );

  // Handle velocity/probability drag editing
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, instrumentId: string, step: number) => {
      if (editorMode === "toggle") {
        onPadClick(instrumentId, step);
        return;
      }

      const isActive = pattern[instrumentId]?.[step] ?? false;
      if (!isActive) return; // Can only edit velocity/probability on active steps

      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setEditingCell({ inst: instrumentId, step });
      setDragStartY(e.clientY);

      const currentVal =
        editorMode === "velocity"
          ? velocity[instrumentId]?.[step] ?? 100
          : probability[instrumentId]?.[step] ?? 100;
      setDragValue(currentVal);
    },
    [editorMode, pattern, velocity, probability, onPadClick]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!editingCell || dragValue === null) return;

      const deltaY = dragStartY - e.clientY;
      const sensitivity = editorMode === "velocity" ? 1 : 0.8;
      const delta = Math.round(deltaY * sensitivity);

      if (editorMode === "velocity") {
        const baseVal = velocity[editingCell.inst]?.[editingCell.step] ?? 100;
        const newVal = Math.max(1, Math.min(127, baseVal + delta));
        setDragValue(newVal);
      } else if (editorMode === "probability") {
        const baseVal = probability[editingCell.inst]?.[editingCell.step] ?? 100;
        const newVal = Math.max(0, Math.min(100, baseVal + delta));
        setDragValue(newVal);
      }
    },
    [editingCell, dragValue, dragStartY, editorMode, velocity, probability]
  );

  const handlePointerUp = useCallback(() => {
    if (editingCell && dragValue !== null) {
      if (editorMode === "velocity") {
        onVelocityChange(editingCell.inst, editingCell.step, dragValue);
      } else if (editorMode === "probability") {
        onProbabilityChange(editingCell.inst, editingCell.step, dragValue);
      }
    }
    setEditingCell(null);
    setDragValue(null);
  }, [editingCell, dragValue, editorMode, onVelocityChange, onProbabilityChange]);

  return (
    <div className="space-y-1" data-tour="pattern-grid">
      {/* Step numbers header */}
      <div className="flex items-center gap-1">
        <div className="w-20 shrink-0" />
        {steps.map((_, i) => (
          <div
            key={i}
            className="flex-1 text-center text-[0.55rem] font-mono"
            style={{ color: i % 4 === 0 ? tc.stepBorder : tc.mutedBorder }}
          >
            {i + 1}
          </div>
        ))}
        {/* Clear column header */}
        <div className="w-7 shrink-0" />
      </div>

      {/* Beat indicator LEDs */}
      <div className="flex items-center gap-1 mb-1">
        <div className="w-20 shrink-0" />
        {steps.map((_, i) => (
          <div key={i} className="flex-1 flex justify-center">
            <div
              className="w-1.5 h-1.5 rounded-full transition-all duration-75"
              style={
                isPlaying && currentStep === i
                  ? i % 4 === 0
                    ? { backgroundColor: tc.ledActive, boxShadow: `0 0 6px ${tc.padActiveGlow}` }
                    : { backgroundColor: tc.stepBorder, boxShadow: `0 0 4px ${tc.stepBorder}99` }
                  : { backgroundColor: tc.inputBg }
              }
            />
          </div>
        ))}
        <div className="w-7 shrink-0" />
      </div>

      {/* Instrument rows */}
      {INSTRUMENTS.map((instrument) => (
        <div key={instrument.id} className="flex items-center gap-1">
          {/* Instrument label + sound selector */}
          <div className="w-20 shrink-0 flex items-center gap-0">
            <button
              onClick={() => onInstrumentPlay(instrument.id)}
              className="flex-1 text-left px-1.5 py-1.5 vintage-button rounded-l text-[0.6rem] font-mono tracking-wider truncate"
              style={{ color: tc.stepBorder }}
              title={`Preview ${instrument.name} (Shift+click chevron to cycle sounds)`}
            >
              {instrument.name}
            </button>
            <DrumSoundSelector
              instrumentId={instrument.id}
              instrumentName={instrument.name}
              genre={genre}
              selectedVariationId={soundVariations[instrument.id] ?? "default"}
              onVariationChange={onSoundVariationChange}
              onPreviewSound={onPreviewSoundVariation}
            />
          </div>

          {/* Step pads */}
          {steps.map((_, step) => {
            const isActive = pattern[instrument.id]?.[step] ?? false;
            const isCurrent = isPlaying && currentStep === step;
            const isBeatStart = step % 4 === 0;
            const vel = velocity[instrument.id]?.[step] ?? 100;
            const prob = probability[instrument.id]?.[step] ?? 100;
            const hits = multiHit[instrument.id]?.[step] ?? 1;

            // Check if currently being edited
            const isEditingThis =
              editingCell?.inst === instrument.id && editingCell?.step === step;
            const displayValue = isEditingThis && dragValue !== null ? dragValue : null;

            return (
              <button
                key={step}
                onPointerDown={(e) => handlePointerDown(e, instrument.id, step)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onContextMenu={(e) => handleContextMenu(e, instrument.id, step)}
                className={`
                  flex-1 aspect-square rounded-sm transition-all duration-75 border relative select-none touch-none
                  ${fillPreviewActive && isActive && !isCurrent ? "animate-pulse" : ""}
                  ${editorMode !== "toggle" && isActive ? "cursor-ns-resize" : "cursor-pointer"}
                `}
                style={
                  isActive
                    ? isCurrent
                      ? { backgroundColor: tc.textPrimary, borderColor: tc.textPrimary, boxShadow: `0 0 12px ${tc.textPrimary}99` }
                      : {
                          backgroundColor: fillPreviewActive
                            ? tc.padActive
                            : editorMode === "probability"
                              ? tc.padActive
                              : getVelocityColor(vel, tc.velocityHigh, tc.stepBorder, tc.textMuted, tc.mutedBorder),
                          borderColor: tc.accentOrange,
                          boxShadow: fillPreviewActive ? `0 0 8px ${tc.padActiveGlow}` : `0 0 6px ${tc.padActiveGlow}44`,
                          opacity: editorMode === "probability" ? getProbabilityOpacity(prob) : 1,
                        }
                    : isCurrent
                      ? { backgroundColor: tc.inputBg, borderColor: tc.stepBorder, boxShadow: `0 0 4px ${tc.stepBorder}4D` }
                      : { backgroundColor: isBeatStart ? tc.panelBg : tc.bodyBg, borderColor: isBeatStart ? tc.panelBorder : tc.inputBg }
                }
                aria-label={`${instrument.name} step ${step + 1} ${isActive ? "on" : "off"}${
                  isActive ? ` vel:${vel} prob:${prob}% hits:${hits}` : ""
                }`}
              >
                {/* Multi-hit dots indicator */}
                {isActive && !isCurrent && (
                  <MultiHitDots count={hits} color={tc.textPrimary} />
                )}

                {/* Velocity/Probability indicator for active steps */}
                {isActive && editorMode === "velocity" && !isCurrent && (
                  <div className="absolute inset-x-0 bottom-0 flex justify-center">
                    <div
                      className="w-full rounded-b-sm"
                      style={{ height: `${(vel / 127) * 100}%`, backgroundColor: `${tc.textPrimary}4D` }}
                    />
                  </div>
                )}

                {/* Show value tooltip when editing */}
                {displayValue !== null && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded px-1 py-0.5 text-[0.5rem] font-mono whitespace-nowrap z-10" style={{ backgroundColor: tc.bodyBg, border: `1px solid ${tc.stepBorder}`, color: tc.accentOrange }}>
                    {editorMode === "velocity" ? displayValue : `${displayValue}%`}
                  </div>
                )}

                {/* Probability indicator dot */}
                {isActive && editorMode === "probability" && prob < 100 && !isCurrent && (
                  <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full" style={{ backgroundColor: `${tc.textPrimary}99` }} />
                )}
              </button>
            );
          })}

          {/* Clear track button */}
          <button
            onClick={() => onClearTrack(instrument.id)}
            className="w-7 shrink-0 flex items-center justify-center p-1 rounded transition-colors"
            style={{ color: tc.mutedBorder }}
            title={`Clear ${instrument.name}`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}

      {/* Mode hint */}
      <div className="text-center mt-1">
        <span className={`text-[0.55rem] font-mono ${fillPreviewActive ? "animate-pulse font-bold" : ""}`} style={{ color: fillPreviewActive ? tc.accentOrange : tc.mutedBorder }}>
          {fillPreviewActive && "FILL PREVIEW ON — Press F to turn off"}
          {!fillPreviewActive && editorMode === "toggle" && "Click pads to toggle notes | Right-click active pads for multi-hit"}
          {!fillPreviewActive && editorMode === "velocity" && "Drag up/down on active pads to adjust velocity (1-127)"}
          {!fillPreviewActive && editorMode === "probability" && "Drag up/down on active pads to adjust probability (0-100%)"}
        </span>
      </div>

      {/* Multi-hit context menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-[100] rounded-lg shadow-xl overflow-hidden"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: "#1A1008",
            border: `1px solid ${tc.panelBorder}`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 1px ${tc.accentOrange}40`,
          }}
        >
          <div className="px-3 py-1.5 text-[0.55rem] font-mono tracking-wider" style={{ color: tc.mutedBorder, borderBottom: `1px solid ${tc.panelBorder}` }}>
            MULTI-HIT
          </div>
          <div className="flex">
            {[1, 2, 3, 4].map((hits) => {
              const currentHits = multiHit[contextMenu.inst]?.[contextMenu.step] ?? 1;
              const isSelected = currentHits === hits;
              return (
                <button
                  key={hits}
                  onClick={() => handleMultiHitSelect(hits)}
                  className="px-3 py-2 text-[0.65rem] font-mono tracking-wider transition-colors hover:bg-[#2A1A10]"
                  style={{
                    color: isSelected ? tc.accentOrange : tc.stepBorder,
                    backgroundColor: isSelected ? `${tc.accentOrange}15` : "transparent",
                    borderRight: hits < 4 ? `1px solid ${tc.panelBorder}` : "none",
                  }}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span>{hits}x</span>
                    <div className="flex gap-px">
                      {Array.from({ length: hits }, (_, i) => (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: isSelected ? tc.accentOrange : tc.mutedBorder }}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
