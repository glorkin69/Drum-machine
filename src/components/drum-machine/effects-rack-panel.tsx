"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Power,
  X,
  ChevronDown,
  Volume2,
  Globe,
  Drum,
} from "lucide-react";
import { useEffectsRack } from "@/hooks/use-effects-rack";
import {
  EFFECT_DEFINITIONS,
  getEffectDefinition,
  type RackEffectType,
  type EffectSlot,
} from "@/lib/effects-rack-types";
import { INSTRUMENTS } from "@/lib/drum-patterns";
import type { ThemeColors } from "@/lib/theme-colors";

// Group effects by category for the dropdown
const EFFECT_CATEGORIES = EFFECT_DEFINITIONS.reduce<
  { category: string; effects: typeof EFFECT_DEFINITIONS }[]
>((acc, def) => {
  const existing = acc.find((c) => c.category === def.category);
  if (existing) {
    existing.effects.push(def);
  } else {
    acc.push({ category: def.category, effects: [def] });
  }
  return acc;
}, []);

interface EffectsRackPanelProps {
  tc: ThemeColors;
}

export function EffectsRackPanel({ tc }: EffectsRackPanelProps) {
  const {
    slots,
    masterEnabled,
    toggleMaster,
    setSlotEffect,
    toggleSlotEnabled,
    updateSlotParams,
    clearSlot,
    setSlotTargetMode,
    setSlotTargetInstrument,
  } = useEffectsRack();

  return (
    <div className="vintage-panel rounded-lg p-2 space-y-2" data-tour="effects-rack">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleMaster}
            className={`vintage-button rounded-md px-1.5 py-1 flex items-center gap-1 text-[0.65rem] font-mono tracking-wider transition-all ${
              masterEnabled
                ? "border-[#27AE60]/60 text-[#27AE60] shadow-[0_0_8px_rgba(39,174,96,0.3)]"
                : "text-[#A08060] hover:text-[#D4A574]"
            }`}
            style={masterEnabled ? { borderColor: `${tc.accentGreen}60`, color: tc.accentGreen } : { color: tc.textMuted }}
          >
            <Power className="w-3 h-3" />
            <span>FX RACK</span>
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: masterEnabled ? tc.accentGreen : tc.mutedBorder,
                boxShadow: masterEnabled ? `0 0 4px ${tc.accentGreen}` : "none",
              }}
            />
          </button>
        </div>
        <span className="text-[0.5rem] font-mono tracking-wider" style={{ color: tc.textMuted }}>
          3-SLOT EFFECTS CHAIN
        </span>
      </div>

      {/* Effect Slots */}
      <div className="space-y-1.5">
        {slots.map((slot, index) => (
          <EffectSlotRow
            key={slot.id}
            slot={slot}
            index={index}
            masterEnabled={masterEnabled}
            tc={tc}
            onSetEffect={setSlotEffect}
            onToggleEnabled={toggleSlotEnabled}
            onUpdateParams={updateSlotParams}
            onClear={clearSlot}
            onSetTargetMode={setSlotTargetMode}
            onSetTargetInstrument={setSlotTargetInstrument}
          />
        ))}
      </div>

      {/* Signal flow indicator */}
      <div className="flex items-center justify-center gap-1 pt-0.5">
        <span className="text-[0.42rem] font-mono tracking-wider" style={{ color: tc.textMuted }}>
          INPUT
        </span>
        {slots.map((slot, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="text-[0.42rem]" style={{ color: tc.mutedBorder }}>&#9654;</span>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  slot.effectType && slot.enabled && masterEnabled
                    ? getEffectDefinition(slot.effectType).color
                    : tc.mutedBorder,
                boxShadow:
                  slot.effectType && slot.enabled && masterEnabled
                    ? `0 0 4px ${getEffectDefinition(slot.effectType).color}`
                    : "none",
              }}
            />
          </span>
        ))}
        <span className="text-[0.42rem]" style={{ color: tc.mutedBorder }}>&#9654;</span>
        <span className="text-[0.42rem] font-mono tracking-wider" style={{ color: tc.textMuted }}>
          OUTPUT
        </span>
      </div>
    </div>
  );
}

// --- Individual Effect Slot Row ---

interface EffectSlotRowProps {
  slot: EffectSlot;
  index: number;
  masterEnabled: boolean;
  tc: ThemeColors;
  onSetEffect: (slotIndex: number, effectType: RackEffectType | null) => void;
  onToggleEnabled: (slotIndex: number) => void;
  onUpdateParams: (slotIndex: number, params: { mix?: number; param1?: number; param2?: number }) => void;
  onClear: (slotIndex: number) => void;
  onSetTargetMode: (slotIndex: number, mode: "global" | "instrument") => void;
  onSetTargetInstrument: (slotIndex: number, instrumentId: string) => void;
}

function EffectSlotRow({
  slot,
  index,
  masterEnabled,
  tc,
  onSetEffect,
  onToggleEnabled,
  onUpdateParams,
  onClear,
  onSetTargetMode,
  onSetTargetInstrument,
}: EffectSlotRowProps) {
  const [showEffectDropdown, setShowEffectDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const targetDropdownRef = useRef<HTMLDivElement>(null);

  const effectDef = slot.effectType ? getEffectDefinition(slot.effectType) : null;
  const effectColor = effectDef?.color ?? tc.mutedBorder;
  const isActive = slot.effectType !== null && slot.enabled && masterEnabled;
  const disabled = !masterEnabled;

  // Close dropdowns on outside click
  useEffect(() => {
    if (!showEffectDropdown && !showTargetDropdown) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowEffectDropdown(false);
      }
      if (targetDropdownRef.current && !targetDropdownRef.current.contains(e.target as Node)) {
        setShowTargetDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEffectDropdown, showTargetDropdown]);

  const handleSelectEffect = useCallback(
    (effectType: RackEffectType) => {
      onSetEffect(index, effectType);
      setShowEffectDropdown(false);
    },
    [index, onSetEffect]
  );

  const targetLabel =
    slot.targetMode === "global"
      ? "Global"
      : INSTRUMENTS.find((i) => i.id === slot.targetInstrument)?.name ?? "Select";

  return (
    <div
      className="rounded-md p-1.5 transition-all"
      style={{
        backgroundColor: isActive ? `${effectColor}08` : `${tc.panelBorder}20`,
        border: `1px solid ${isActive ? `${effectColor}40` : tc.panelBorder}`,
      }}
    >
      {/* Slot header: number, enable toggle, effect selector, target, clear */}
      <div className="flex items-center gap-1">
        {/* Slot number LED */}
        <div
          className="w-4 h-4 rounded-sm flex items-center justify-center text-[0.5rem] font-mono font-bold flex-shrink-0"
          style={{
            backgroundColor: isActive ? `${effectColor}20` : `${tc.panelBorder}40`,
            color: isActive ? effectColor : tc.textMuted,
            border: `1px solid ${isActive ? effectColor : tc.panelBorder}`,
            boxShadow: isActive ? `0 0 6px ${effectColor}40` : "none",
          }}
        >
          {index + 1}
        </div>

        {/* Enable/bypass toggle */}
        <button
          onClick={() => onToggleEnabled(index)}
          disabled={disabled || !slot.effectType}
          className="flex-shrink-0 vintage-button rounded-sm p-0.5 transition-all"
          style={{
            color: isActive ? tc.accentGreen : tc.textMuted,
            borderColor: isActive ? `${tc.accentGreen}40` : "transparent",
            opacity: disabled || !slot.effectType ? 0.3 : 1,
          }}
          title={slot.enabled ? "Bypass" : "Enable"}
        >
          <Power className="w-2.5 h-2.5" />
        </button>

        {/* Effect selector dropdown */}
        <div className="relative flex-1 min-w-0" ref={dropdownRef}>
          <button
            onClick={() => !disabled && setShowEffectDropdown((p) => !p)}
            disabled={disabled}
            className="w-full vintage-button rounded-sm px-1.5 py-0.5 flex items-center justify-between gap-0.5 text-[0.55rem] font-mono tracking-wider transition-all"
            style={{
              color: slot.effectType ? effectColor : tc.textMuted,
              borderColor: slot.effectType ? `${effectColor}30` : tc.panelBorder,
              opacity: disabled ? 0.4 : 1,
            }}
          >
            <span className="truncate">
              {effectDef ? effectDef.name : "Select Effect..."}
            </span>
            <ChevronDown className="w-2.5 h-2.5 flex-shrink-0" />
          </button>

          {showEffectDropdown && !disabled && (
            <div
              className="absolute left-0 top-full mt-0.5 z-50 w-full min-w-[10rem] max-h-[16rem] overflow-y-auto rounded-md shadow-lg"
              style={{ backgroundColor: tc.bodyBg, border: `1px solid ${tc.panelBorder}` }}
            >
              {EFFECT_CATEGORIES.map((cat) => (
                <div key={cat.category}>
                  <div
                    className="px-1.5 py-0.5 text-[0.45rem] font-mono tracking-wider sticky top-0"
                    style={{ color: tc.textMuted, backgroundColor: tc.panelBg }}
                  >
                    {cat.category.toUpperCase()}
                  </div>
                  {cat.effects.map((def) => {
                    const isSelected = slot.effectType === def.type;
                    return (
                      <button
                        key={def.type}
                        onClick={() => handleSelectEffect(def.type)}
                        className="w-full text-left px-2 py-1 text-[0.52rem] font-mono tracking-wider transition-colors"
                        style={{
                          color: isSelected ? def.color : tc.textMuted,
                          backgroundColor: isSelected ? `${def.color}10` : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.backgroundColor = `${tc.panelBorder}40`;
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.backgroundColor = isSelected
                            ? `${def.color}10`
                            : "transparent";
                        }}
                      >
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                          style={{ backgroundColor: def.color }}
                        />
                        {def.name}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Target mode toggle */}
        <div className="relative flex-shrink-0" ref={targetDropdownRef}>
          <button
            onClick={() => !disabled && slot.effectType && setShowTargetDropdown((p) => !p)}
            disabled={disabled || !slot.effectType}
            className="vintage-button rounded-sm px-1 py-0.5 flex items-center gap-0.5 text-[0.45rem] font-mono tracking-wider transition-all"
            style={{
              color: slot.targetMode === "instrument" ? "#8E44AD" : tc.textMuted,
              borderColor: slot.targetMode === "instrument" ? "#8E44AD40" : "transparent",
              opacity: disabled || !slot.effectType ? 0.3 : 1,
            }}
            title="Effect target"
          >
            {slot.targetMode === "global" ? (
              <Globe className="w-2.5 h-2.5" />
            ) : (
              <Drum className="w-2.5 h-2.5" />
            )}
            <span className="max-w-[2.5rem] truncate hidden sm:inline">{targetLabel}</span>
            <ChevronDown className="w-2 h-2" />
          </button>

          {showTargetDropdown && !disabled && slot.effectType && (
            <div
              className="absolute right-0 top-full mt-0.5 z-50 min-w-[8rem] rounded-md shadow-lg overflow-hidden"
              style={{ backgroundColor: tc.bodyBg, border: `1px solid ${tc.panelBorder}` }}
            >
              {/* Global option */}
              <button
                onClick={() => {
                  onSetTargetMode(index, "global");
                  setShowTargetDropdown(false);
                }}
                className="w-full text-left px-2 py-1 text-[0.5rem] font-mono tracking-wider flex items-center gap-1.5 transition-colors"
                style={{
                  color: slot.targetMode === "global" ? tc.accentOrange : tc.textMuted,
                  backgroundColor: slot.targetMode === "global" ? `${tc.accentOrange}10` : "transparent",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = `${tc.panelBorder}40`;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor =
                    slot.targetMode === "global" ? `${tc.accentOrange}10` : "transparent";
                }}
              >
                <Globe className="w-2.5 h-2.5 flex-shrink-0" />
                <span>Global (All)</span>
              </button>

              {/* Separator */}
              <div className="h-px mx-1.5" style={{ backgroundColor: tc.panelBorder }} />

              {/* Individual drum options */}
              <div
                className="px-1.5 py-0.5 text-[0.42rem] font-mono tracking-wider"
                style={{ color: tc.textMuted }}
              >
                INDIVIDUAL DRUMS
              </div>
              {INSTRUMENTS.map((inst) => {
                const isSelected =
                  slot.targetMode === "instrument" && slot.targetInstrument === inst.id;
                return (
                  <button
                    key={inst.id}
                    onClick={() => {
                      onSetTargetMode(index, "instrument");
                      onSetTargetInstrument(index, inst.id);
                      setShowTargetDropdown(false);
                    }}
                    className="w-full text-left px-2 py-0.5 text-[0.5rem] font-mono tracking-wider transition-colors"
                    style={{
                      color: isSelected ? "#8E44AD" : tc.textMuted,
                      backgroundColor: isSelected ? "#8E44AD10" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = `${tc.panelBorder}40`;
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = isSelected
                        ? "#8E44AD10"
                        : "transparent";
                    }}
                  >
                    {isSelected && <span className="mr-1">&#9654;</span>}
                    {inst.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Clear button */}
        <button
          onClick={() => onClear(index)}
          disabled={disabled || !slot.effectType}
          className="flex-shrink-0 vintage-button rounded-sm p-0.5 transition-all"
          style={{
            color: tc.textMuted,
            opacity: disabled || !slot.effectType ? 0.2 : 0.6,
          }}
          title="Remove effect"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Parameter sliders - only show when effect is loaded */}
      {slot.effectType && effectDef && (
        <div className="mt-1.5 space-y-1">
          {/* Mix slider */}
          <ParamSlider
            label="MIX"
            value={slot.params.mix}
            color={effectColor}
            tc={tc}
            disabled={disabled || !slot.enabled}
            onChange={(v) => onUpdateParams(index, { mix: v })}
            icon={<Volume2 className="w-2.5 h-2.5" />}
          />

          {/* Param 1 */}
          <ParamSlider
            label={effectDef.param1Label.toUpperCase()}
            value={slot.params.param1}
            color={effectColor}
            tc={tc}
            disabled={disabled || !slot.enabled}
            onChange={(v) => onUpdateParams(index, { param1: v })}
          />

          {/* Param 2 */}
          <ParamSlider
            label={effectDef.param2Label.toUpperCase()}
            value={slot.params.param2}
            color={effectColor}
            tc={tc}
            disabled={disabled || !slot.enabled}
            onChange={(v) => onUpdateParams(index, { param2: v })}
          />
        </div>
      )}
    </div>
  );
}

// --- Parameter Slider ---

interface ParamSliderProps {
  label: string;
  value: number;
  color: string;
  tc: ThemeColors;
  disabled: boolean;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
}

function ParamSlider({ label, value, color, tc, disabled, onChange, icon }: ParamSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const getValueFromEvent = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return value;
      const rect = sliderRef.current.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    },
    [value]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      draggingRef.current = true;
      onChange(getValueFromEvent(e.clientX));
    },
    [disabled, onChange, getValueFromEvent]
  );

  useEffect(() => {
    if (!draggingRef.current) return;

    const handleMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      onChange(getValueFromEvent(e.clientX));
    };
    const handleUp = () => {
      draggingRef.current = false;
    };

    // Need to capture the ref since draggingRef is checked
    const check = setInterval(() => {
      // Cleanup interval when not dragging
      if (!draggingRef.current) clearInterval(check);
    }, 500);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      clearInterval(check);
    };
  }, [onChange, getValueFromEvent]);

  // Touch support
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      e.preventDefault();
      draggingRef.current = true;
      onChange(getValueFromEvent(e.touches[0].clientX));
    },
    [disabled, onChange, getValueFromEvent]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!draggingRef.current || disabled) return;
      onChange(getValueFromEvent(e.touches[0].clientX));
    },
    [disabled, onChange, getValueFromEvent]
  );

  const handleTouchEnd = useCallback(() => {
    draggingRef.current = false;
  }, []);

  return (
    <div
      className="flex items-center gap-1.5"
      style={{ opacity: disabled ? 0.35 : 1 }}
    >
      {/* Label */}
      <div className="flex items-center gap-0.5 w-[3.5rem] flex-shrink-0">
        {icon && <span style={{ color: tc.textMuted }}>{icon}</span>}
        <span
          className="text-[0.42rem] font-mono tracking-wider truncate"
          style={{ color: tc.textMuted }}
        >
          {label}
        </span>
      </div>

      {/* Slider track */}
      <div
        ref={sliderRef}
        className="flex-1 h-3 rounded-sm relative cursor-pointer select-none touch-none"
        style={{
          backgroundColor: `${tc.panelBorder}60`,
          border: `1px solid ${tc.panelBorder}`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-sm transition-[width] duration-75"
          style={{
            width: `${value * 100}%`,
            background: `linear-gradient(90deg, ${color}40, ${color}90)`,
          }}
        />
        {/* Thumb */}
        <div
          className="absolute top-0 bottom-0 w-1 rounded-sm transition-[left] duration-75"
          style={{
            left: `calc(${value * 100}% - 2px)`,
            backgroundColor: color,
            boxShadow: `0 0 4px ${color}80`,
          }}
        />
      </div>

      {/* Value readout */}
      <span
        className="text-[0.42rem] font-mono w-[2rem] text-right flex-shrink-0"
        style={{ color }}
      >
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}
