"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";
import type { Genre } from "@/lib/drum-patterns";
import {
  getVariationsForInstrument,
  DEFAULT_VARIATION_ID,
  type DrumSoundVariation,
} from "@/lib/drum-sound-variations";

interface DrumSoundSelectorProps {
  instrumentId: string;
  instrumentName: string;
  genre: Genre;
  selectedVariationId: string;
  onVariationChange: (instrumentId: string, variationId: string) => void;
  onPreviewSound: (instrumentId: string, variationId: string) => void;
}

export function DrumSoundSelector({
  instrumentId,
  instrumentName,
  genre,
  selectedVariationId,
  onVariationChange,
  onPreviewSound,
}: DrumSoundSelectorProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);

  const variations = getVariationsForInstrument(genre, instrumentId);
  const selectedVariation = variations.find((v) => v.id === selectedVariationId);
  const isNonDefault = selectedVariationId !== DEFAULT_VARIATION_ID;

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (variationId: string) => {
      onVariationChange(instrumentId, variationId);
      setIsOpen(false);
    },
    [instrumentId, onVariationChange]
  );

  const handleItemHover = useCallback(
    (variation: DrumSoundVariation) => {
      setHoveredItem(variation.id);

      // Show tooltip after brief delay
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = setTimeout(() => {
        setTooltipText(variation.description);
        setTooltipVisible(true);
        // Auto-dismiss tooltip after 2 seconds
        tooltipTimerRef.current = setTimeout(() => {
          setTooltipVisible(false);
        }, 2000);
      }, 300);

      // Preview sound on hover with small delay
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      previewTimerRef.current = setTimeout(() => {
        onPreviewSound(instrumentId, variation.id);
      }, 150);
    },
    [instrumentId, onPreviewSound]
  );

  const handleItemLeave = useCallback(() => {
    setHoveredItem(null);
    setTooltipVisible(false);
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
  }, []);

  // Shift+click on the main label to cycle variations
  const handleShiftClick = useCallback(
    (e: React.MouseEvent) => {
      if (!e.shiftKey) return false;
      e.stopPropagation();
      e.preventDefault();
      const currentIdx = variations.findIndex((v) => v.id === selectedVariationId);
      const nextIdx = (currentIdx + 1) % variations.length;
      onVariationChange(instrumentId, variations[nextIdx].id);
      onPreviewSound(instrumentId, variations[nextIdx].id);
      return true;
    },
    [variations, selectedVariationId, instrumentId, onVariationChange, onPreviewSound]
  );

  if (variations.length <= 1) return null;

  return (
    <div ref={dropdownRef} className="relative inline-flex items-center">
      {/* Dropdown trigger - subtle chevron */}
      <button
        onClick={handleToggle}
        onMouseDown={(e) => {
          if (handleShiftClick(e)) return;
        }}
        className="group flex items-center gap-0.5 rounded px-0.5 py-0.5 transition-all duration-150"
        style={{
          color: isNonDefault ? tc.accentOrange : tc.mutedBorder,
          backgroundColor: isOpen ? `${tc.inputBg}` : "transparent",
        }}
        title={
          selectedVariation
            ? `Sound: ${selectedVariation.name} (Shift+click to cycle)`
            : "Select sound variation"
        }
      >
        <ChevronDown
          className={`w-2.5 h-2.5 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          style={{
            opacity: isOpen || isNonDefault ? 1 : 0.5,
          }}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-1 z-50 min-w-[160px] rounded-lg border shadow-xl overflow-hidden"
          style={{
            backgroundColor: tc.panelBg,
            borderColor: tc.panelBorder,
            boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 1px ${tc.panelBorder}`,
          }}
        >
          {/* Header */}
          <div
            className="px-2.5 py-1.5 text-[0.55rem] font-mono uppercase tracking-wider border-b"
            style={{ color: tc.textMuted, borderColor: tc.panelBorder }}
          >
            {instrumentName} Sound
          </div>

          {/* Variation items */}
          <div className="py-0.5">
            {variations.map((variation) => {
              const isSelected = variation.id === selectedVariationId;
              const isHovered = hoveredItem === variation.id;

              return (
                <button
                  key={variation.id}
                  onClick={() => handleSelect(variation.id)}
                  onMouseEnter={() => handleItemHover(variation)}
                  onMouseLeave={handleItemLeave}
                  className="w-full text-left px-2.5 py-1.5 flex items-center gap-2 transition-colors duration-75"
                  style={{
                    backgroundColor: isHovered
                      ? tc.buttonHoverBg
                      : isSelected
                        ? `${tc.inputBg}`
                        : "transparent",
                    color: isSelected ? tc.accentOrange : tc.textPrimary,
                  }}
                >
                  {/* Selection indicator */}
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: isSelected ? tc.accentOrange : "transparent",
                      border: isSelected ? "none" : `1px solid ${tc.mutedBorder}`,
                    }}
                  />
                  <span className="text-[0.6rem] font-mono tracking-wide truncate">
                    {variation.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tooltip overlay */}
          {tooltipVisible && tooltipText && (
            <div
              className="px-2.5 py-1.5 text-[0.5rem] font-mono border-t"
              style={{
                color: tc.textMuted,
                borderColor: tc.panelBorder,
                backgroundColor: tc.bodyBg,
              }}
            >
              {tooltipText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
