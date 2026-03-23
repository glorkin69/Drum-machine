"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Lock, Unlock, Power, ChevronDown } from "lucide-react";
import { type EffectType, type EffectTarget, audioEffects } from "@/lib/audio-effects";
import { drumAudio } from "@/lib/audio-engine";
import { INSTRUMENTS } from "@/lib/drum-patterns";

// Comprehensive effect categories based on real Kaoss Pad models
type EffectCategory = {
  name: string;
  effects: { type: EffectType; label: string; xLabel: string; yLabel: string; color: string }[];
};

const EFFECT_CATEGORIES: EffectCategory[] = [
  {
    name: "FILTERS",
    effects: [
      { type: "filter", label: "Low Pass", xLabel: "CUTOFF", yLabel: "RESONANCE", color: "#E8732A" },
      { type: "filter", label: "High Pass", xLabel: "CUTOFF", yLabel: "RESONANCE", color: "#E67E22" },
      { type: "filter", label: "Band Pass", xLabel: "CUTOFF", yLabel: "RESONANCE", color: "#D35400" },
      { type: "filter", label: "Morphing", xLabel: "MORPH", yLabel: "RESONANCE", color: "#E59866" },
    ]
  },
  {
    name: "MODULATION",
    effects: [
      { type: "distortion", label: "Vinyl Break", xLabel: "DRIVE", yLabel: "TONE", color: "#C0392B" },
      { type: "distortion", label: "Ring Mod", xLabel: "FREQ", yLabel: "DEPTH", color: "#E74C3C" },
      { type: "distortion", label: "Decimator", xLabel: "BITS", yLabel: "RATE", color: "#EC7063" },
      { type: "distortion", label: "Distortion", xLabel: "DRIVE", yLabel: "TONE", color: "#CD6155" },
    ]
  },
  {
    name: "LFO EFFECTS",
    effects: [
      { type: "filter", label: "LFO Filter", xLabel: "RATE", yLabel: "DEPTH", color: "#8E44AD" },
      { type: "delay", label: "Flanger", xLabel: "RATE", yLabel: "FEEDBACK", color: "#9B59B6" },
      { type: "delay", label: "Auto Pan", xLabel: "RATE", yLabel: "WIDTH", color: "#AF7AC5" },
      { type: "stutter", label: "Slicer", xLabel: "RATE", yLabel: "INTENSITY", color: "#BB8FCE" },
    ]
  },
  {
    name: "DELAY",
    effects: [
      { type: "delay", label: "Smooth Delay", xLabel: "TIME", yLabel: "FEEDBACK", color: "#27AE60" },
      { type: "delay", label: "Ping Pong", xLabel: "TIME", yLabel: "FEEDBACK", color: "#2ECC71" },
      { type: "delay", label: "Multi Tap", xLabel: "SPACING", yLabel: "FEEDBACK", color: "#58D68D" },
      { type: "delay", label: "Tape Echo", xLabel: "TIME", yLabel: "FEEDBACK", color: "#82E0AA" },
    ]
  },
  {
    name: "REVERB",
    effects: [
      { type: "reverb", label: "Hall", xLabel: "SIZE", yLabel: "WET/DRY", color: "#2980B9" },
      { type: "reverb", label: "Room", xLabel: "SIZE", yLabel: "WET/DRY", color: "#3498DB" },
      { type: "reverb", label: "Spring", xLabel: "SIZE", yLabel: "WET/DRY", color: "#5DADE2" },
      { type: "reverb", label: "Pump Reverb", xLabel: "SIZE", yLabel: "PUMP", color: "#85C1E2" },
    ]
  },
  {
    name: "LOOPER",
    effects: [
      { type: "stutter", label: "Forward Loop", xLabel: "LENGTH", yLabel: "SPEED", color: "#16A085" },
      { type: "stutter", label: "Reverse Loop", xLabel: "LENGTH", yLabel: "SPEED", color: "#1ABC9C" },
      { type: "stutter", label: "Slice Loop", xLabel: "SLICES", yLabel: "SHUFFLE", color: "#48C9B0" },
      { type: "stutter", label: "Break Loop", xLabel: "RATE", yLabel: "INTENSITY", color: "#76D7C4" },
    ]
  },
  {
    name: "VOCODER",
    effects: [
      { type: "filter", label: "Unison", xLabel: "VOICES", yLabel: "DETUNE", color: "#F39C12" },
      { type: "filter", label: "Chord", xLabel: "INTERVAL", yLabel: "MIX", color: "#F4D03F" },
      { type: "filter", label: "Noise Voc", xLabel: "BANDS", yLabel: "NOISE", color: "#F8C471" },
    ]
  },
  {
    name: "SYNTHESIZER",
    effects: [
      { type: "filter", label: "Rez Noise", xLabel: "PITCH", yLabel: "RESONANCE", color: "#E91E63" },
      { type: "filter", label: "Pump Noise", xLabel: "RATE", yLabel: "DEPTH", color: "#F06292" },
      { type: "distortion", label: "Disco Siren", xLabel: "PITCH", yLabel: "SWEEP", color: "#EC407A" },
    ]
  },
];

const TARGET_OPTIONS: { value: EffectTarget; label: string }[] = [
  { value: "master", label: "Whole Pattern" },
  ...INSTRUMENTS.map((inst) => ({ value: inst.id, label: inst.name })),
];

const LED_COUNT = 12;

interface XYPadProps {
  bpm?: number;
}

export function XYPad({ bpm = 120 }: XYPadProps) {
  const [enabled, setEnabled] = useState(false);
  const [categoryIndex, setCategoryIndex] = useState(0); // FILTERS category
  const [effectIndex, setEffectIndex] = useState(0); // first effect in category
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const [locked, setLocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [effectTarget, setEffectTarget] = useState<EffectTarget>("master");
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [showEffectDropdown, setShowEffectDropdown] = useState(false);

  const padRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0.5, y: 0.5 });
  const animFrameRef = useRef<number>(0);
  const targetDropdownRef = useRef<HTMLDivElement>(null);
  const effectDropdownRef = useRef<HTMLDivElement>(null);

  const currentCategory = EFFECT_CATEGORIES[categoryIndex];
  const effect = currentCategory.effects[effectIndex];
  const isStutter = effect.type === "stutter";

  // Initialize effects when enabled
  useEffect(() => {
    if (enabled) {
      // Ensure audio context exists
      drumAudio.init();
      const ctx = drumAudio.getAudioContext();
      if (ctx) {
        audioEffects.init(ctx);
      }
    }
    audioEffects.setEnabled(enabled);
  }, [enabled]);

  // Update effect type
  useEffect(() => {
    audioEffects.setEffectType(effect.type);
  }, [effect.type]);

  // Sync BPM to effects engine
  useEffect(() => {
    audioEffects.setBpm(bpm);
  }, [bpm]);

  // Sync effect target
  useEffect(() => {
    audioEffects.setEffectTarget(effectTarget);
  }, [effectTarget]);

  // Send params on position change
  useEffect(() => {
    if (enabled) {
      audioEffects.updateParams(position.x, position.y);
    }
  }, [position.x, position.y, enabled]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    if (!showTargetDropdown && !showEffectDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (targetDropdownRef.current && !targetDropdownRef.current.contains(e.target as Node)) {
        setShowTargetDropdown(false);
      }
      if (effectDropdownRef.current && !effectDropdownRef.current.contains(e.target as Node)) {
        setShowEffectDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTargetDropdown, showEffectDropdown]);

  const getPositionFromEvent = useCallback((clientX: number, clientY: number) => {
    if (!padRef.current) return null;
    const rect = padRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height)); // Invert Y so bottom=0, top=1
    return { x, y };
  }, []);

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (locked) return;
    const pos = getPositionFromEvent(clientX, clientY);
    if (pos) {
      positionRef.current = pos;
      // Use RAF for smooth visual updates
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(() => {
        setPosition({ ...positionRef.current });
      });
    }
  }, [locked, getPositionFromEvent]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enabled) return;
    e.preventDefault();
    setIsDragging(true);
    audioEffects.setEngaged(true);
    updatePosition(e.clientX, e.clientY);
  }, [enabled, updatePosition]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      updatePosition(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      audioEffects.setEngaged(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, updatePosition]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    e.preventDefault();
    setIsDragging(true);
    audioEffects.setEngaged(true);
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  }, [enabled, updatePosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !enabled) return;
    e.preventDefault();
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  }, [isDragging, enabled, updatePosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    audioEffects.setEngaged(false);
  }, []);

  // Cleanup animation frame
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleToggleEnabled = useCallback(() => {
    setEnabled(prev => !prev);
  }, []);

  const handleToggleLock = useCallback(() => {
    setLocked(prev => !prev);
  }, []);

  const handleCategoryChange = useCallback((catIdx: number, effIdx: number) => {
    setCategoryIndex(catIdx);
    setEffectIndex(effIdx);
    setShowEffectDropdown(false);
  }, []);

  // Get stutter rate label for display
  const stutterRateLabel = isStutter ? audioEffects.getStutterRateLabel(position.x) : "";

  // LED intensity based on position
  const xLeds = Array.from({ length: LED_COUNT }, (_, i) => {
    const threshold = (i + 1) / LED_COUNT;
    return enabled && position.x >= threshold;
  });
  const yLeds = Array.from({ length: LED_COUNT }, (_, i) => {
    const threshold = (i + 1) / LED_COUNT;
    return enabled && position.y >= threshold;
  });

  const currentTargetLabel = TARGET_OPTIONS.find(t => t.value === effectTarget)?.label ?? "All";

  return (
    <div className="vintage-panel rounded-lg p-2 space-y-1.5" data-tour="xy-pad">
      {/* Header Row - Power, Title, Effect Selector */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleEnabled}
            className={`vintage-button rounded-md px-1.5 py-1 flex items-center gap-1 text-[0.65rem] font-mono tracking-wider transition-all ${
              enabled
                ? "border-[#27AE60]/60 text-[#27AE60] shadow-[0_0_8px_rgba(39,174,96,0.3)]"
                : "text-[#A08060] hover:text-[#D4A574]"
            }`}
          >
            <Power className="w-3 h-3" />
            <span>FX</span>
            <div className={`vintage-led ${enabled ? "green" : ""}`} />
          </button>
          <span className="vintage-label text-[0.6rem]">KAOSS PAD</span>
        </div>

        {/* Effect Categories Dropdown */}
        <div className="relative flex-1 max-w-[10rem]" ref={effectDropdownRef}>
          <button
            onClick={() => setShowEffectDropdown(prev => !prev)}
            disabled={!enabled}
            className={`w-full vintage-button rounded-md px-1.5 py-1 flex items-center justify-between gap-1 text-[0.58rem] font-mono tracking-wider transition-all ${
              !enabled ? "opacity-40 cursor-not-allowed" : ""
            }`}
            style={enabled ? {
              color: effect.color,
              borderColor: `${effect.color}40`,
            } : undefined}
          >
            <span className="truncate">{effect.label}</span>
            <ChevronDown className="w-2.5 h-2.5 shrink-0" />
          </button>
          {showEffectDropdown && enabled && (
            <div className="absolute left-0 top-full mt-1 z-50 w-full min-w-[11rem] max-h-[18rem] overflow-y-auto rounded-md shadow-lg"
              style={{ backgroundColor: "#1A1008", border: "1px solid #4A3728" }}>
              {EFFECT_CATEGORIES.map((category, catIdx) => (
                <div key={category.name}>
                  <div className="px-1.5 py-0.5 text-[0.48rem] font-mono tracking-wider text-[#6A5540] bg-[#0F0805] sticky top-0">
                    {category.name}
                  </div>
                  {category.effects.map((fx, effIdx) => (
                    <button
                      key={`${catIdx}-${effIdx}`}
                      onClick={() => handleCategoryChange(catIdx, effIdx)}
                      className={`w-full text-left px-2 py-1 text-[0.55rem] font-mono tracking-wider transition-colors hover:bg-[#2A1A10] ${
                        catIdx === categoryIndex && effIdx === effectIndex ? "text-[#E8732A]" : "text-[#A08060]"
                      }`}
                    >
                      {catIdx === categoryIndex && effIdx === effectIndex && <span className="mr-1">&#9654;</span>}
                      {fx.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls Row - Target, Lock */}
        <div className="flex items-center gap-1">
          {/* Target selector dropdown */}
          <div className="relative" ref={targetDropdownRef}>
            <button
              onClick={() => setShowTargetDropdown(prev => !prev)}
              disabled={!enabled}
              className={`vintage-button rounded-md px-1.5 py-1 flex items-center gap-0.5 text-[0.48rem] font-mono tracking-wider transition-all ${
                effectTarget !== "master"
                  ? "text-[#8E44AD] border-[#8E44AD]/40"
                  : "text-[#A08060] hover:text-[#D4A574]"
              } ${!enabled ? "opacity-40 cursor-not-allowed" : ""}`}
              title="Effect target"
            >
              <span className="max-w-[3rem] truncate">{currentTargetLabel}</span>
              <ChevronDown className="w-2.5 h-2.5 shrink-0" />
            </button>
            {showTargetDropdown && enabled && (
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[7.5rem] rounded-md overflow-hidden shadow-lg"
                style={{ backgroundColor: "#1A1008", border: "1px solid #4A3728" }}>
                {TARGET_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setEffectTarget(opt.value);
                      setShowTargetDropdown(false);
                    }}
                    className={`w-full text-left px-2 py-1 text-[0.52rem] font-mono tracking-wider transition-colors hover:bg-[#2A1A10] ${
                      effectTarget === opt.value ? "text-[#E8732A]" : "text-[#A08060]"
                    }`}
                  >
                    {effectTarget === opt.value && <span className="mr-1">&#9654;</span>}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lock toggle */}
          <button
            onClick={handleToggleLock}
            disabled={!enabled}
            className={`vintage-button rounded-md p-1 transition-all ${
              locked
                ? "border-[#E8732A]/60 text-[#E8732A]"
                : "text-[#A08060] hover:text-[#D4A574]"
            } ${!enabled ? "opacity-40 cursor-not-allowed" : ""}`}
            title={locked ? "Unlock position" : "Lock position"}
          >
            {locked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
          </button>
        </div>
      </div>

      {/* Engaged indicator */}
      {enabled && isDragging && (
        <div className="flex justify-center -my-0.5">
          <span className="text-[0.48rem] font-mono tracking-wider px-1.5 py-0.5 rounded-md animate-pulse"
            style={{
              color: effect.color,
              backgroundColor: `${effect.color}15`,
              border: `1px solid ${effect.color}40`
            }}>
            ENGAGED
          </span>
        </div>
      )}

      {/* XY Pad Area */}
      <div className="flex gap-1 justify-center">
        {/* Y-axis LEDs (left side) */}
        <div className="flex flex-col-reverse justify-between py-0.5">
          {yLeds.map((active, i) => (
            <div
              key={`y-${i}`}
              className="w-0.5 h-0.5 rounded-full transition-all duration-75"
              style={{
                backgroundColor: active ? effect.color : "#333",
                boxShadow: active ? `0 0 3px ${effect.color}` : "none",
              }}
            />
          ))}
        </div>

        {/* Main pad */}
        <div className="flex flex-col">
          <div
            ref={padRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`xy-pad-surface relative w-28 h-28 rounded-md cursor-crosshair select-none touch-none overflow-hidden ${
              !enabled ? "opacity-40 cursor-not-allowed" : ""
            } ${isDragging ? "xy-pad-active" : ""}`}
            style={{
              background: `radial-gradient(circle at ${position.x * 100}% ${(1 - position.y) * 100}%, ${effect.color}${isDragging ? '25' : '10'} 0%, #0A0A0A 70%)`,
              boxShadow: isDragging ? `inset 0 0 20px ${effect.color}30, 0 0 12px ${effect.color}20` : 'none',
            }}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Vertical grid lines */}
              {[0.25, 0.5, 0.75].map((pos) => (
                <div
                  key={`vg-${pos}`}
                  className="absolute top-0 bottom-0 w-px"
                  style={{ left: `${pos * 100}%`, backgroundColor: "rgba(74, 55, 40, 0.3)" }}
                />
              ))}
              {/* Horizontal grid lines */}
              {[0.25, 0.5, 0.75].map((pos) => (
                <div
                  key={`hg-${pos}`}
                  className="absolute left-0 right-0 h-px"
                  style={{ top: `${pos * 100}%`, backgroundColor: "rgba(74, 55, 40, 0.3)" }}
                />
              ))}
            </div>

            {/* Stutter rate zone indicators */}
            {isStutter && enabled && (
              <div className="absolute inset-0 pointer-events-none">
                {[0.25, 0.5, 0.75].map((boundary) => (
                  <div
                    key={`sb-${boundary}`}
                    className="absolute top-0 bottom-0 w-px"
                    style={{ left: `${boundary * 100}%`, backgroundColor: `${effect.color}40` }}
                  />
                ))}
                {/* Rate zone labels */}
                {[
                  { x: 0.125, label: "1/4" },
                  { x: 0.375, label: "1/8" },
                  { x: 0.625, label: "1/16" },
                  { x: 0.875, label: "1/32" },
                ].map(({ x, label }) => (
                  <span
                    key={label}
                    className="absolute top-1 text-[0.4rem] font-mono pointer-events-none -translate-x-1/2"
                    style={{ left: `${x * 100}%`, color: `${effect.color}50` }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}

            {/* Crosshair / Position indicator */}
            {enabled && (
              <>
                {/* Vertical line */}
                <div
                  className="absolute top-0 bottom-0 w-px pointer-events-none transition-[left] duration-75"
                  style={{
                    left: `${position.x * 100}%`,
                    backgroundColor: `${effect.color}50`,
                  }}
                />
                {/* Horizontal line */}
                <div
                  className="absolute left-0 right-0 h-px pointer-events-none transition-[top] duration-75"
                  style={{
                    top: `${(1 - position.y) * 100}%`,
                    backgroundColor: `${effect.color}50`,
                  }}
                />
                {/* Center dot */}
                <div
                  className="absolute w-2.5 h-2.5 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
                  style={{
                    left: `${position.x * 100}%`,
                    top: `${(1 - position.y) * 100}%`,
                    backgroundColor: effect.color,
                    boxShadow: `0 0 8px ${effect.color}, 0 0 16px ${effect.color}60`,
                    opacity: isDragging ? 1 : 0.8,
                    transform: `translate(-50%, -50%) scale(${isDragging ? 1.3 : 1})`,
                  }}
                />
                {/* Outer ring */}
                <div
                  className="absolute w-5 h-5 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 border transition-all duration-75"
                  style={{
                    left: `${position.x * 100}%`,
                    top: `${(1 - position.y) * 100}%`,
                    borderColor: `${effect.color}40`,
                    opacity: isDragging ? 1 : 0.5,
                    transform: `translate(-50%, -50%) scale(${isDragging ? 1.2 : 1})`,
                  }}
                />
              </>
            )}

            {/* Axis labels inside pad */}
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[0.4rem] font-mono tracking-wider pointer-events-none"
              style={{ color: `${effect.color}60` }}>
              {effect.xLabel}
            </span>
            <span className="absolute left-0.5 top-1/2 -translate-y-1/2 -rotate-90 text-[0.4rem] font-mono tracking-wider pointer-events-none whitespace-nowrap"
              style={{ color: `${effect.color}60` }}>
              {effect.yLabel}
            </span>

            {/* Lock overlay */}
            {locked && enabled && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Lock className="w-4 h-4" style={{ color: `${effect.color}30` }} />
              </div>
            )}
          </div>

          {/* X-axis LEDs (bottom) */}
          <div className="flex justify-between px-0.5 pt-0.5">
            {xLeds.map((active, i) => (
              <div
                key={`x-${i}`}
                className="w-0.5 h-0.5 rounded-full transition-all duration-75"
                style={{
                  backgroundColor: active ? effect.color : "#333",
                  boxShadow: active ? `0 0 3px ${effect.color}` : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Parameter readout */}
      <div className="flex gap-1 justify-center">
        <div className="vintage-display px-1.5 py-0.5 text-[0.5rem] font-mono text-center min-w-[5.5rem]"
          style={{ color: enabled ? effect.color : "#555" }}>
          {isStutter && enabled
            ? `${stutterRateLabel}`
            : `${enabled ? Math.round(position.x * 100) : "--"}%`
          }
        </div>
        <div className="vintage-display px-1.5 py-0.5 text-[0.5rem] font-mono text-center min-w-[5.5rem]"
          style={{ color: enabled ? effect.color : "#555" }}>
          {enabled ? Math.round(position.y * 100) : "--"}%
        </div>
      </div>

      {/* Target indicator when not "master" */}
      {effectTarget !== "master" && enabled && (
        <div className="text-center -mt-0.5">
          <span className="text-[0.45rem] font-mono tracking-wider px-1.5 py-0.5 rounded"
            style={{ color: "#8E44AD", backgroundColor: "#8E44AD15", border: "1px solid #8E44AD30" }}>
            {currentTargetLabel.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
