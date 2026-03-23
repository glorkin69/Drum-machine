"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Music } from "lucide-react";
import type { Genre, SongPart } from "@/lib/drum-patterns";
import { getPatternVariants, type PatternVariant } from "@/lib/pattern-library";

interface PatternVariationSelectorProps {
  genre: Genre;
  songPart: SongPart;
  selectedVariationId: string | null;
  onVariationSelect: (variant: PatternVariant) => void;
}

const complexityLabels: Record<number, string> = {
  1: "Simple",
  2: "Medium",
  3: "Advanced",
};

export function PatternVariationSelector({
  genre,
  songPart,
  selectedVariationId,
  onVariationSelect,
}: PatternVariationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const variants = getPatternVariants(genre, songPart);
  const selectedVariant = variants.find((v) => v.id === selectedVariationId);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown when genre/songPart changes
  useEffect(() => {
    setIsOpen(false);
  }, [genre, songPart]);

  return (
    <div className="space-y-2" data-tour="pattern-variation">
      <div className="vintage-label">PATTERN VARIATION</div>
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between gap-2
            px-4 py-2.5 rounded-lg font-mono text-xs tracking-wider transition-all border
            bg-[#2C1E14] border-[#4A3728] hover:border-[#6B5040]
            ${selectedVariant ? "text-[#F5E6D3]" : "text-[#A08060]"}
          `}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Music className="w-3.5 h-3.5 shrink-0 text-[#E8732A]" />
            <span className="truncate">
              {selectedVariant ? selectedVariant.name : "Select variation..."}
            </span>
            {selectedVariant && (
              <span className="shrink-0 text-[0.55rem] px-1.5 py-0.5 rounded bg-[#E8732A]/10 text-[#E8732A] border border-[#E8732A]/30">
                {complexityLabels[selectedVariant.complexity]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[0.6rem] text-[#A08060]">
              {variants.length} variations
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#A08060] transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg bg-[#1A1410] border border-[#4A3728] shadow-xl">
            {variants.map((variant) => {
              const isSelected = variant.id === selectedVariationId;
              return (
                <button
                  key={variant.id}
                  onClick={() => {
                    onVariationSelect(variant);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left
                    font-mono text-xs tracking-wider transition-all border-b border-[#4A3728]/50
                    last:border-b-0
                    ${isSelected
                      ? "bg-[#E8732A]/10 text-[#F5E6D3]"
                      : "text-[#A08060] hover:bg-[#2C1E14] hover:text-[#D4A574]"
                    }
                  `}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#E8732A] shrink-0" />
                    )}
                    <span className="truncate">{variant.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {variant.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[0.5rem] px-1 py-0.5 rounded bg-[#3D2B1F] text-[#A08060] border border-[#4A3728]/50"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className={`text-[0.55rem] px-1.5 py-0.5 rounded border ${
                      variant.complexity === 3
                        ? "bg-[#E74C3C]/10 text-[#E74C3C] border-[#E74C3C]/30"
                        : variant.complexity === 2
                          ? "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/30"
                          : "bg-[#27AE60]/10 text-[#27AE60] border-[#27AE60]/30"
                    }`}>
                      {complexityLabels[variant.complexity]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
