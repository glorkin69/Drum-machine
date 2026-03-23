// Types for the multi-slot effects rack system

export type RackEffectType =
  | "reverb"
  | "delay"
  | "distortion"
  | "lowpass"
  | "highpass"
  | "bandpass"
  | "chorus"
  | "flanger"
  | "phaser"
  | "compressor"
  | "bitcrusher";

export type EffectTargetMode = "global" | "instrument";

export type EffectTargetInstrument = string; // instrumentId or "master"

export interface EffectSlotParams {
  mix: number;       // 0-1 wet/dry
  param1: number;    // 0-1 effect-specific primary param
  param2: number;    // 0-1 effect-specific secondary param
}

export interface EffectSlot {
  id: number;        // 0, 1, 2
  effectType: RackEffectType | null;
  enabled: boolean;
  params: EffectSlotParams;
  targetMode: EffectTargetMode;
  targetInstrument: string; // instrumentId or "master"
}

export interface EffectDefinition {
  type: RackEffectType;
  name: string;
  category: string;
  color: string;
  param1Label: string;
  param2Label: string;
  param1Default: number;
  param2Default: number;
  mixDefault: number;
}

export const EFFECT_DEFINITIONS: EffectDefinition[] = [
  {
    type: "reverb",
    name: "Reverb",
    category: "Space",
    color: "#2980B9",
    param1Label: "Size",
    param2Label: "Damping",
    param1Default: 0.4,
    param2Default: 0.5,
    mixDefault: 0.35,
  },
  {
    type: "delay",
    name: "Delay",
    category: "Space",
    color: "#27AE60",
    param1Label: "Time",
    param2Label: "Feedback",
    param1Default: 0.3,
    param2Default: 0.3,
    mixDefault: 0.3,
  },
  {
    type: "distortion",
    name: "Distortion",
    category: "Drive",
    color: "#C0392B",
    param1Label: "Drive",
    param2Label: "Tone",
    param1Default: 0.4,
    param2Default: 0.6,
    mixDefault: 0.5,
  },
  {
    type: "lowpass",
    name: "Low-Pass Filter",
    category: "Filter",
    color: "#E8732A",
    param1Label: "Cutoff",
    param2Label: "Resonance",
    param1Default: 0.7,
    param2Default: 0.2,
    mixDefault: 1.0,
  },
  {
    type: "highpass",
    name: "High-Pass Filter",
    category: "Filter",
    color: "#E67E22",
    param1Label: "Cutoff",
    param2Label: "Resonance",
    param1Default: 0.3,
    param2Default: 0.2,
    mixDefault: 1.0,
  },
  {
    type: "bandpass",
    name: "Band-Pass Filter",
    category: "Filter",
    color: "#D35400",
    param1Label: "Center",
    param2Label: "Width",
    param1Default: 0.5,
    param2Default: 0.4,
    mixDefault: 1.0,
  },
  {
    type: "chorus",
    name: "Chorus",
    category: "Modulation",
    color: "#8E44AD",
    param1Label: "Rate",
    param2Label: "Depth",
    param1Default: 0.3,
    param2Default: 0.5,
    mixDefault: 0.4,
  },
  {
    type: "flanger",
    name: "Flanger",
    category: "Modulation",
    color: "#9B59B6",
    param1Label: "Rate",
    param2Label: "Depth",
    param1Default: 0.2,
    param2Default: 0.5,
    mixDefault: 0.4,
  },
  {
    type: "phaser",
    name: "Phaser",
    category: "Modulation",
    color: "#AF7AC5",
    param1Label: "Rate",
    param2Label: "Depth",
    param1Default: 0.3,
    param2Default: 0.6,
    mixDefault: 0.4,
  },
  {
    type: "compressor",
    name: "Compressor",
    category: "Dynamics",
    color: "#3498db",
    param1Label: "Threshold",
    param2Label: "Ratio",
    param1Default: 0.5,
    param2Default: 0.4,
    mixDefault: 1.0,
  },
  {
    type: "bitcrusher",
    name: "Bitcrusher",
    category: "Lo-Fi",
    color: "#E91E63",
    param1Label: "Bits",
    param2Label: "Rate",
    param1Default: 0.6,
    param2Default: 0.5,
    mixDefault: 0.5,
  },
];

export function getEffectDefinition(type: RackEffectType): EffectDefinition {
  return EFFECT_DEFINITIONS.find((d) => d.type === type)!;
}

export function createDefaultSlot(id: number): EffectSlot {
  return {
    id,
    effectType: null,
    enabled: false,
    params: { mix: 0.5, param1: 0.5, param2: 0.5 },
    targetMode: "global",
    targetInstrument: "master",
  };
}
