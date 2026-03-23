/**
 * Emotion-Driven Adaptive Intelligence Engine
 *
 * Analyzes drum patterns for emotional content, provides psychoacoustic optimization,
 * and generates contextual arrangement recommendations.
 */

import type { DrumPattern, Genre, SongPart, Emotion, PatternLength } from "./drum-patterns";
import { EMOTIONS, INSTRUMENTS } from "./drum-patterns";

// ─── Types ──────────────────────────────────────────────────────────────────

/** Emotional dimensions for pattern analysis */
export interface EmotionalProfile {
  tension: number;       // 0-1, how tense/unresolved the pattern feels
  energy: number;        // 0-1, overall energy level
  valence: number;       // 0-1, positive (happy) vs negative (sad) emotional quality
  arousal: number;       // 0-1, calm vs excited (psychoacoustic activation)
  complexity: number;    // 0-1, perceived complexity/busyness
  groove: number;        // 0-1, how much the pattern "grooves" (swing/pocket feel)
  heaviness: number;     // 0-1, low-frequency dominance (kick/tom weight)
  brightness: number;    // 0-1, high-frequency presence (hats/ride/clap)
}

/** Emotional intensity level for UI */
export type EmotionIntensity = 1 | 2 | 3 | 4 | 5;

/** Extended emotion with intensity */
export interface EmotionWithIntensity {
  emotion: Emotion;
  intensity: EmotionIntensity;
}

/** Contextual use case for pattern recommendations */
export type UseContext =
  | "workout"
  | "relaxation"
  | "focus"
  | "party"
  | "meditation"
  | "cinematic"
  | "gaming";

/** Context recommendation settings */
export interface ContextSettings {
  label: string;
  description: string;
  icon: string;
  bpmRange: [number, number];
  targetProfile: Partial<EmotionalProfile>;
  preferredEmotions: Emotion[];
  complexityRange: [number, number];
}

/** Suggestion category for grouping */
export type SuggestionCategory = "groove" | "dynamic" | "genre" | "emotional";

/** Category metadata */
export const SUGGESTION_CATEGORIES: Record<SuggestionCategory, { label: string; icon: string; color: string }> = {
  groove: { label: "Groove Enhancement", icon: "🎵", color: "#E8732A" },
  dynamic: { label: "Dynamic Control", icon: "📊", color: "#27AE60" },
  genre: { label: "Genre Authenticity", icon: "🎸", color: "#8E44AD" },
  emotional: { label: "Emotional Impact", icon: "💫", color: "#2980B9" },
};

/** Arrangement suggestion from the intelligence engine */
export interface ArrangementSuggestion {
  id: string;
  type: "add_tension" | "release" | "build_energy" | "strip_back" | "add_groove" | "add_brightness" | "add_weight" | "transition" | "climax" | "resolve" | "syncopate" | "genre_authentic" | "emotion_shift" | "balance" | "variation";
  category: SuggestionCategory;
  label: string;
  description: string;
  reasoning: string; // Musical explanation for why this works
  priority: number; // 0-1, how strongly recommended
  icon: string;
  modifications: PatternModification[];
}

/** History entry for applied suggestions */
export interface SuggestionHistoryEntry {
  suggestion: ArrangementSuggestion;
  appliedAt: number;
  genre: string;
  songPart: string;
  emotion: string | null;
}

/** A specific modification to apply to the pattern */
export interface PatternModification {
  instrument: string;
  action: "add" | "remove" | "shift";
  steps: number[];
  velocityMultiplier?: number;
}

/** Emotional arc point for song timeline */
export interface EmotionalArcPoint {
  position: number;  // 0-1 position in the song
  tension: number;
  energy: number;
  valence: number;
  label: string;
}

/** Psychoacoustic optimization suggestion */
export interface PsychoacousticHint {
  id: string;
  label: string;
  description: string;
  parameter: "bpm" | "swing" | "velocity" | "density" | "frequency";
  suggestedValue: number;
  currentValue: number;
  emotionalImpact: string;
  icon: string;
}

/** Biometric data input (optional) */
export interface BiometricData {
  heartRate?: number;        // BPM
  heartRateVariability?: number; // ms
  timestamp: number;
}

/** Real-time emotional impact score */
export interface EmotionalImpactScore {
  overall: number;        // 0-100
  tensionLevel: number;   // 0-100
  energyLevel: number;    // 0-100
  emotionalFit: number;   // 0-100, how well pattern matches target emotion
  grooveFactor: number;   // 0-100
  dynamicRange: number;   // 0-100
}

// ─── Context Presets ────────────────────────────────────────────────────────

export const USE_CONTEXTS: Record<UseContext, ContextSettings> = {
  workout: {
    label: "Workout",
    description: "High-energy patterns for exercise",
    icon: "💪",
    bpmRange: [120, 160],
    targetProfile: { energy: 0.85, arousal: 0.9, tension: 0.4, heaviness: 0.7 },
    preferredEmotions: ["aggressive", "happy"],
    complexityRange: [4, 7],
  },
  relaxation: {
    label: "Relaxation",
    description: "Gentle patterns for unwinding",
    icon: "🧘",
    bpmRange: [60, 90],
    targetProfile: { energy: 0.2, arousal: 0.15, tension: 0.1, groove: 0.6 },
    preferredEmotions: ["calm", "romantic"],
    complexityRange: [1, 4],
  },
  focus: {
    label: "Focus",
    description: "Steady, non-distracting beats",
    icon: "🎯",
    bpmRange: [85, 110],
    targetProfile: { energy: 0.4, arousal: 0.3, tension: 0.15, groove: 0.7, complexity: 0.3 },
    preferredEmotions: ["calm"],
    complexityRange: [2, 5],
  },
  party: {
    label: "Party",
    description: "Danceable, crowd-moving grooves",
    icon: "🎉",
    bpmRange: [118, 135],
    targetProfile: { energy: 0.8, arousal: 0.75, valence: 0.85, groove: 0.9 },
    preferredEmotions: ["happy"],
    complexityRange: [4, 8],
  },
  meditation: {
    label: "Meditation",
    description: "Minimal, ambient rhythms",
    icon: "🕉",
    bpmRange: [50, 75],
    targetProfile: { energy: 0.1, arousal: 0.05, tension: 0.05, complexity: 0.15 },
    preferredEmotions: ["calm"],
    complexityRange: [1, 3],
  },
  cinematic: {
    label: "Cinematic",
    description: "Dramatic, film-score percussion",
    icon: "🎬",
    bpmRange: [80, 130],
    targetProfile: { tension: 0.7, heaviness: 0.6, complexity: 0.6, brightness: 0.5 },
    preferredEmotions: ["anxious", "aggressive", "sad"],
    complexityRange: [5, 9],
  },
  gaming: {
    label: "Gaming",
    description: "Intense, adrenaline-pumping beats",
    icon: "🎮",
    bpmRange: [130, 170],
    targetProfile: { energy: 0.9, arousal: 0.85, tension: 0.6, heaviness: 0.7, brightness: 0.6 },
    preferredEmotions: ["aggressive", "anxious"],
    complexityRange: [5, 8],
  },
};

// ─── Psychoacoustic Database ────────────────────────────────────────────────

/**
 * Neuroacoustic frequency/rhythm combinations and their emotional effects.
 * Based on psychoacoustic research on rhythm perception and emotional response.
 */
const PSYCHOACOUSTIC_DB = {
  /** BPM ranges and their psychological associations */
  bpmEffects: [
    { range: [50, 70] as [number, number], effect: "meditative", arousal: 0.1, valence: 0.5 },
    { range: [70, 90] as [number, number], effect: "melancholic / reflective", arousal: 0.25, valence: 0.35 },
    { range: [90, 110] as [number, number], effect: "relaxed groove", arousal: 0.4, valence: 0.6 },
    { range: [110, 125] as [number, number], effect: "uplifting / danceable", arousal: 0.65, valence: 0.8 },
    { range: [125, 140] as [number, number], effect: "energetic / euphoric", arousal: 0.8, valence: 0.75 },
    { range: [140, 160] as [number, number], effect: "intense / aggressive", arousal: 0.9, valence: 0.4 },
    { range: [160, 200] as [number, number], effect: "frantic / extreme", arousal: 0.95, valence: 0.3 },
  ],

  /** Rhythmic density effects */
  densityEffects: {
    sparse: { threshold: 0.2, tension: -0.2, energy: -0.3, description: "Open space creates calm" },
    moderate: { threshold: 0.4, tension: 0, energy: 0.1, description: "Balanced rhythmic activity" },
    busy: { threshold: 0.6, tension: 0.2, energy: 0.3, description: "Driving rhythmic momentum" },
    dense: { threshold: 0.8, tension: 0.4, energy: 0.5, description: "Intense, relentless energy" },
    maximal: { threshold: 1.0, tension: 0.6, energy: 0.7, description: "Overwhelming density" },
  },

  /** Syncopation effects on groove perception */
  syncopationEffects: {
    straight: { threshold: 0.1, groove: 0.3, description: "Metronomic, mechanical feel" },
    light: { threshold: 0.25, groove: 0.6, description: "Subtle swing, human feel" },
    moderate: { threshold: 0.4, groove: 0.85, description: "Strong pocket groove" },
    heavy: { threshold: 0.6, groove: 0.95, description: "Deep syncopation, head-nodding" },
    extreme: { threshold: 1.0, groove: 0.7, description: "Disorienting, tension-building" },
  },

  /** Frequency range dominance effects */
  frequencyBalance: {
    low: { instruments: ["kick", "tom-low"], weight: "heaviness", emotionalEffect: "power, depth, physical impact" },
    mid: { instruments: ["snare", "clap", "tom-high"], weight: "body", emotionalEffect: "presence, rhythm anchor" },
    high: { instruments: ["hihat-closed", "hihat-open", "ride"], weight: "brightness", emotionalEffect: "air, shimmer, energy" },
  },

  /** Emotional resonance frequencies (concepts mapped to pattern traits) */
  emotionFrequencyMap: {
    happy: { kickWeight: 0.5, hihatPresence: 0.7, syncopation: 0.4, bpmCenter: 120 },
    sad: { kickWeight: 0.3, hihatPresence: 0.3, syncopation: 0.15, bpmCenter: 72 },
    aggressive: { kickWeight: 0.9, hihatPresence: 0.9, syncopation: 0.3, bpmCenter: 140 },
    calm: { kickWeight: 0.2, hihatPresence: 0.4, syncopation: 0.1, bpmCenter: 85 },
    anxious: { kickWeight: 0.6, hihatPresence: 0.7, syncopation: 0.7, bpmCenter: 135 },
    romantic: { kickWeight: 0.35, hihatPresence: 0.5, syncopation: 0.3, bpmCenter: 95 },
  } as Record<Emotion, { kickWeight: number; hihatPresence: number; syncopation: number; bpmCenter: number }>,
};

// ─── Pattern Analysis ───────────────────────────────────────────────────────

/** Calculate pattern density (ratio of active steps) */
export function getPatternDensity(pattern: DrumPattern, length: number = 16): number {
  let active = 0;
  let total = 0;
  for (const inst of INSTRUMENTS) {
    const steps = pattern[inst.id];
    if (!steps) continue;
    for (let i = 0; i < Math.min(length, steps.length); i++) {
      total++;
      if (steps[i]) active++;
    }
  }
  return total > 0 ? active / total : 0;
}

/** Calculate syncopation score */
export function getSyncopation(pattern: DrumPattern, length: number = 16): number {
  let offBeat = 0;
  let onBeat = 0;
  const strongBeats = new Set([0, 4, 8, 12]); // downbeats in 16th-note grid
  const weakBeats = new Set([1, 3, 5, 7, 9, 11, 13, 15]); // off-beats

  for (const inst of INSTRUMENTS) {
    const steps = pattern[inst.id];
    if (!steps) continue;
    for (let i = 0; i < Math.min(length, steps.length); i++) {
      if (steps[i]) {
        if (strongBeats.has(i % 16)) onBeat++;
        if (weakBeats.has(i % 16)) offBeat++;
      }
    }
  }
  const total = onBeat + offBeat;
  return total > 0 ? offBeat / total : 0;
}

/** Calculate frequency balance (low/mid/high instrument presence) */
function getFrequencyBalance(pattern: DrumPattern, length: number = 16): { low: number; mid: number; high: number } {
  const count = (ids: string[]) => {
    let active = 0;
    let total = 0;
    for (const id of ids) {
      const steps = pattern[id];
      if (!steps) continue;
      for (let i = 0; i < Math.min(length, steps.length); i++) {
        total++;
        if (steps[i]) active++;
      }
    }
    return total > 0 ? active / total : 0;
  };

  return {
    low: count(["kick", "tom-low"]),
    mid: count(["snare", "clap", "tom-high"]),
    high: count(["hihat-closed", "hihat-open", "ride"]),
  };
}

/** Get backbeat strength (emphasis on beats 2 & 4) */
function getBackbeatStrength(pattern: DrumPattern): number {
  const backbeatPositions = [4, 12]; // beats 2 & 4 in 16th-note grid
  let backbeatHits = 0;
  let totalInstruments = 0;

  for (const inst of ["snare", "clap"]) {
    const steps = pattern[inst];
    if (!steps) continue;
    totalInstruments++;
    for (const pos of backbeatPositions) {
      if (steps[pos]) backbeatHits++;
    }
  }
  return totalInstruments > 0 ? backbeatHits / (totalInstruments * backbeatPositions.length) : 0;
}

// ─── Core Analysis Functions ────────────────────────────────────────────────

/**
 * Analyze a drum pattern and compute its emotional profile.
 */
export function analyzeEmotionalProfile(
  pattern: DrumPattern,
  bpm: number,
  patternLength: number = 16
): EmotionalProfile {
  const density = getPatternDensity(pattern, patternLength);
  const syncopation = getSyncopation(pattern, patternLength);
  const freq = getFrequencyBalance(pattern, patternLength);
  const backbeat = getBackbeatStrength(pattern);

  // BPM-derived arousal
  const bpmNorm = Math.max(0, Math.min(1, (bpm - 50) / 150));
  const arousal = bpmNorm * 0.4 + density * 0.35 + freq.high * 0.25;

  // Tension: syncopation + density + lack of backbeat creates tension
  const tension = syncopation * 0.35 + density * 0.25 + (1 - backbeat) * 0.2 + bpmNorm * 0.2;

  // Energy: density + bpm + high-frequency content
  const energy = density * 0.3 + bpmNorm * 0.35 + freq.high * 0.2 + freq.low * 0.15;

  // Valence: backbeat + moderate density + brightness = positive
  const valence = backbeat * 0.3 + (1 - Math.abs(density - 0.4)) * 0.25 + freq.high * 0.2 +
    (1 - Math.abs(bpmNorm - 0.5)) * 0.25;

  // Groove: moderate syncopation + backbeat + appropriate density
  const groove = (syncopation > 0.15 && syncopation < 0.6 ? syncopation * 2 : syncopation * 0.5) * 0.4 +
    backbeat * 0.3 + (1 - Math.abs(density - 0.35)) * 0.3;

  // Heaviness: low-frequency dominance
  const heaviness = freq.low * 0.6 + density * 0.2 + (1 - freq.high) * 0.2;

  // Brightness: high-frequency presence
  const brightness = freq.high * 0.6 + (1 - freq.low) * 0.2 + density * 0.2;

  // Complexity: unique timing positions + instrument count
  const activeInstruments = INSTRUMENTS.filter(i => {
    const steps = pattern[i.id];
    return steps && steps.some(Boolean);
  }).length;
  const instrumentDiversity = activeInstruments / INSTRUMENTS.length;
  const complexity = density * 0.3 + syncopation * 0.3 + instrumentDiversity * 0.4;

  return {
    tension: clamp(tension),
    energy: clamp(energy),
    valence: clamp(valence),
    arousal: clamp(arousal),
    complexity: clamp(complexity),
    groove: clamp(groove),
    heaviness: clamp(heaviness),
    brightness: clamp(brightness),
  };
}

/**
 * Compute emotional impact score (0-100 for each dimension).
 */
export function computeEmotionalImpact(
  profile: EmotionalProfile,
  targetEmotion: Emotion | null,
  intensity: EmotionIntensity = 3
): EmotionalImpactScore {
  const intensityMul = intensity / 5;

  let emotionalFit = 50; // default if no target
  if (targetEmotion) {
    const target = getTargetProfile(targetEmotion);
    const dimensions = ["tension", "energy", "valence", "arousal", "heaviness", "brightness"] as const;
    let totalDiff = 0;
    for (const dim of dimensions) {
      const diff = Math.abs((profile[dim] || 0) - (target[dim] || 0));
      totalDiff += diff;
    }
    emotionalFit = Math.round((1 - totalDiff / dimensions.length) * 100);
  }

  return {
    overall: Math.round((profile.energy * 0.25 + profile.groove * 0.25 + profile.arousal * 0.2 +
      (emotionalFit / 100) * 0.3) * 100 * intensityMul + (1 - intensityMul) * 50),
    tensionLevel: Math.round(profile.tension * 100),
    energyLevel: Math.round(profile.energy * 100),
    emotionalFit,
    grooveFactor: Math.round(profile.groove * 100),
    dynamicRange: Math.round((profile.heaviness * 0.5 + profile.brightness * 0.5) * 100),
  };
}

/**
 * Get target emotional profile for a given emotion.
 */
export function getTargetProfile(emotion: Emotion): EmotionalProfile {
  const targets: Record<Emotion, EmotionalProfile> = {
    happy: { tension: 0.15, energy: 0.7, valence: 0.9, arousal: 0.65, complexity: 0.5, groove: 0.8, heaviness: 0.4, brightness: 0.7 },
    sad: { tension: 0.3, energy: 0.2, valence: 0.15, arousal: 0.2, complexity: 0.25, groove: 0.4, heaviness: 0.3, brightness: 0.3 },
    aggressive: { tension: 0.7, energy: 0.95, valence: 0.3, arousal: 0.9, complexity: 0.7, groove: 0.5, heaviness: 0.9, brightness: 0.7 },
    calm: { tension: 0.05, energy: 0.15, valence: 0.65, arousal: 0.1, complexity: 0.15, groove: 0.5, heaviness: 0.2, brightness: 0.4 },
    anxious: { tension: 0.85, energy: 0.7, valence: 0.2, arousal: 0.8, complexity: 0.75, groove: 0.3, heaviness: 0.5, brightness: 0.6 },
    romantic: { tension: 0.1, energy: 0.35, valence: 0.75, arousal: 0.35, complexity: 0.35, groove: 0.7, heaviness: 0.3, brightness: 0.55 },
  };
  return targets[emotion];
}

// ─── Arrangement Intelligence ───────────────────────────────────────────────

/** Genre-specific pattern traits for authentic suggestions */
const GENRE_TRAITS: Record<string, {
  kickPattern: number[];
  hihatStyle: string;
  syncopationLevel: number;
  tips: string[];
}> = {
  house: {
    kickPattern: [0, 4, 8, 12],
    hihatStyle: "offbeat-open",
    syncopationLevel: 0.3,
    tips: ["four-on-the-floor kick", "offbeat open hi-hats", "clap on 2 & 4"],
  },
  electronic: {
    kickPattern: [0, 4, 8, 12],
    hihatStyle: "16th-notes",
    syncopationLevel: 0.4,
    tips: ["driving 16th hi-hats", "syncopated kick variations", "layered clap/snare"],
  },
  "lo-fi": {
    kickPattern: [0, 6, 10],
    hihatStyle: "swing-8th",
    syncopationLevel: 0.5,
    tips: ["lazy swing feel", "ghost note snares", "soft hi-hat shuffle"],
  },
  pop: {
    kickPattern: [0, 8],
    hihatStyle: "8th-notes",
    syncopationLevel: 0.2,
    tips: ["simple kick/snare backbone", "steady 8th hi-hats", "clap layering on backbeat"],
  },
  rock: {
    kickPattern: [0, 8],
    hihatStyle: "8th-notes",
    syncopationLevel: 0.15,
    tips: ["driving kick/snare", "crash on downbeat 1", "strong backbeat snare"],
  },
  "hip-hop": {
    kickPattern: [0, 5, 8, 13],
    hihatStyle: "trap-rolls",
    syncopationLevel: 0.6,
    tips: ["syncopated boom-bap kicks", "snare on 2 & 4", "hi-hat rolls for energy"],
  },
  trap: {
    kickPattern: [0, 3, 8, 11],
    hihatStyle: "trap-rolls",
    syncopationLevel: 0.7,
    tips: ["808 kick patterns", "rapid hi-hat rolls", "sparse but impactful snare"],
  },
};

/**
 * Generate arrangement suggestions based on current pattern, genre, and emotional context.
 * Returns categorized suggestions with musical reasoning.
 */
export function getArrangementSuggestions(
  pattern: DrumPattern,
  profile: EmotionalProfile,
  targetEmotion: Emotion | null,
  songPart: SongPart,
  patternLength: number = 16,
  genre?: string,
): ArrangementSuggestion[] {
  const suggestions: ArrangementSuggestion[] = [];
  const target = targetEmotion ? getTargetProfile(targetEmotion) : null;
  let idCounter = 0;
  // Use a seed based on pattern content for stable-but-refreshable IDs
  const seed = Date.now();

  const makeId = () => `sug_${seed}_${++idCounter}`;

  // ── GROOVE ENHANCEMENT CATEGORY ──

  if (profile.groove < 0.5) {
    suggestions.push({
      id: makeId(),
      type: "add_groove",
      category: "groove",
      label: "Deepen the Pocket",
      description: "Add ghost notes and off-beat accents for swing",
      reasoning: `Your groove score is ${Math.round(profile.groove * 100)}% — adding syncopated ghost kicks and off-beat hi-hats creates the "head-nod" feeling that makes patterns feel alive rather than mechanical.`,
      priority: Math.min(1, (0.7 - profile.groove) * 1.5),
      icon: "🎵",
      modifications: generateGrooveMods(pattern, patternLength),
    });
  }

  // Syncopation suggestion when pattern is too straight
  const syncopation = getSyncopation(pattern, patternLength);
  if (syncopation < 0.2) {
    suggestions.push({
      id: makeId(),
      type: "syncopate",
      category: "groove",
      label: "Add Syncopation",
      description: "Move hits off the grid for human feel",
      reasoning: `Current syncopation is only ${Math.round(syncopation * 100)}%. Placing kick and snare hits on unexpected beats creates rhythmic tension that keeps listeners engaged — the "push and pull" that defines great grooves.`,
      priority: 0.55,
      icon: "🔀",
      modifications: generateSyncopationMods(pattern, patternLength),
    });
  }

  // ── DYNAMIC CONTROL CATEGORY ──

  if (target && profile.energy < target.energy - 0.15) {
    suggestions.push({
      id: makeId(),
      type: "build_energy",
      category: "dynamic",
      label: "Build Energy",
      description: "Layer hi-hats and kick density for drive",
      reasoning: `Energy is at ${Math.round(profile.energy * 100)}% but target is ${Math.round(target.energy * 100)}%. Adding 8th-note hi-hats and an extra kick creates forward momentum — the pattern will feel more driving and urgent.`,
      priority: Math.min(1, (target.energy - profile.energy) * 2),
      icon: "🔥",
      modifications: generateEnergyBuildMods(pattern, patternLength),
    });
  } else if (!target && profile.energy < 0.35) {
    // No emotion selected — still suggest energy boost for sparse patterns
    suggestions.push({
      id: makeId(),
      type: "build_energy",
      category: "dynamic",
      label: "Build Energy",
      description: "Layer hi-hats and kick density for drive",
      reasoning: `Pattern energy is only ${Math.round(profile.energy * 100)}%. Adding 8th-note hi-hats and extra kicks creates forward momentum — the beat will feel more alive and urgent.`,
      priority: 0.55,
      icon: "🔥",
      modifications: generateEnergyBuildMods(pattern, patternLength),
    });
  }

  if (target && profile.energy > target.energy + 0.2) {
    suggestions.push({
      id: makeId(),
      type: "strip_back",
      category: "dynamic",
      label: "Strip Back",
      description: "Remove layers for breathing room",
      reasoning: `Energy (${Math.round(profile.energy * 100)}%) exceeds target (${Math.round(target.energy * 100)}%). Thinning hi-hats to quarter notes and removing percussion layers creates space — less is more when you need the pattern to breathe.`,
      priority: Math.min(1, (profile.energy - target.energy) * 2),
      icon: "🍃",
      modifications: generateStripBackMods(pattern, patternLength),
    });
  } else if (!target && profile.energy > 0.8) {
    suggestions.push({
      id: makeId(),
      type: "strip_back",
      category: "dynamic",
      label: "Strip Back",
      description: "Remove layers for breathing room",
      reasoning: `Energy is very high at ${Math.round(profile.energy * 100)}%. Thinning layers creates space — sometimes less is more for a pattern that breathes and grooves.`,
      priority: 0.5,
      icon: "🍃",
      modifications: generateStripBackMods(pattern, patternLength),
    });
  }

  // Brightness
  if (target && profile.brightness < target.brightness - 0.2) {
    suggestions.push({
      id: makeId(),
      type: "add_brightness",
      category: "dynamic",
      label: "Add Shimmer",
      description: "Open hi-hats and ride for air and sparkle",
      reasoning: `Brightness is low at ${Math.round(profile.brightness * 100)}%. Open hi-hats on the &'s and ride cymbal on downbeats add high-frequency shimmer that lifts the entire mix — like sunlight breaking through.`,
      priority: 0.5,
      icon: "✨",
      modifications: generateBrightnessMods(pattern, patternLength),
    });
  } else if (!target && profile.brightness < 0.3) {
    suggestions.push({
      id: makeId(),
      type: "add_brightness",
      category: "dynamic",
      label: "Add Shimmer",
      description: "Open hi-hats and ride for air and sparkle",
      reasoning: `Brightness is only ${Math.round(profile.brightness * 100)}%. Adding open hi-hats and ride cymbal adds high-frequency shimmer that brings air and life to the pattern.`,
      priority: 0.45,
      icon: "✨",
      modifications: generateBrightnessMods(pattern, patternLength),
    });
  }

  // Weight
  if (target && profile.heaviness < target.heaviness - 0.2) {
    suggestions.push({
      id: makeId(),
      type: "add_weight",
      category: "dynamic",
      label: "Add Weight",
      description: "More kick and low tom for physical impact",
      reasoning: `Heaviness at ${Math.round(profile.heaviness * 100)}% vs target ${Math.round(target.heaviness * 100)}%. Adding kick on all strong beats and low tom fills creates the chest-thumping sub-frequency presence that makes patterns hit hard.`,
      priority: 0.5,
      icon: "🔨",
      modifications: generateWeightMods(pattern, patternLength),
    });
  } else if (!target && profile.heaviness < 0.3) {
    suggestions.push({
      id: makeId(),
      type: "add_weight",
      category: "dynamic",
      label: "Add Weight",
      description: "More kick and low tom for physical impact",
      reasoning: `Low-end presence is only ${Math.round(profile.heaviness * 100)}%. Adding kick on strong beats and low tom accents creates the chest-thumping bass that makes patterns hit hard.`,
      priority: 0.45,
      icon: "🔨",
      modifications: generateWeightMods(pattern, patternLength),
    });
  }

  // Balance suggestion (no emotion needed) — when pattern is heavily lopsided
  if (profile.heaviness > 0.7 && profile.brightness < 0.3) {
    suggestions.push({
      id: makeId(),
      type: "balance",
      category: "dynamic",
      label: "Balance Frequencies",
      description: "Add high-frequency elements to balance the heavy low end",
      reasoning: `Pattern is bottom-heavy (${Math.round(profile.heaviness * 100)}% heaviness, only ${Math.round(profile.brightness * 100)}% brightness). Adding hi-hats and ride provides tonal balance — great beats have both weight and shimmer.`,
      priority: 0.55,
      icon: "⚖️",
      modifications: generateBrightnessMods(pattern, patternLength),
    });
  } else if (profile.brightness > 0.7 && profile.heaviness < 0.3) {
    suggestions.push({
      id: makeId(),
      type: "balance",
      category: "dynamic",
      label: "Balance Frequencies",
      description: "Add low-frequency elements to anchor the bright top end",
      reasoning: `Pattern is top-heavy (${Math.round(profile.brightness * 100)}% brightness, only ${Math.round(profile.heaviness * 100)}% heaviness). Adding kick and low tom anchors the rhythm — a solid foundation makes hi-hats shine brighter.`,
      priority: 0.55,
      icon: "⚖️",
      modifications: generateWeightMods(pattern, patternLength),
    });
  }

  // Variation suggestion (no emotion needed) — add rhythmic interest
  if (profile.complexity < 0.25 && profile.groove < 0.4) {
    suggestions.push({
      id: makeId(),
      type: "variation",
      category: "groove",
      label: "Add Rhythmic Interest",
      description: "Break up the repetition with unexpected accents",
      reasoning: `Pattern complexity is low (${Math.round(profile.complexity * 100)}%) and groove is minimal (${Math.round(profile.groove * 100)}%). Adding a few surprise ghost notes and off-beat hits transforms a basic loop into a pattern that holds attention.`,
      priority: 0.5,
      icon: "🎲",
      modifications: [
        ...generateGrooveMods(pattern, patternLength),
        ...generateSyncopationMods(pattern, patternLength),
      ],
    });
  }

  // ── EMOTIONAL IMPACT CATEGORY ──

  if (target && profile.tension < target.tension - 0.15) {
    suggestions.push({
      id: makeId(),
      type: "add_tension",
      category: "emotional",
      label: "Raise Tension",
      description: "Syncopated off-beat hits for unease",
      reasoning: `Tension is ${Math.round(profile.tension * 100)}% but ${targetEmotion} needs ${Math.round(target.tension * 100)}%. Off-beat kicks and tom accents on weak beats create rhythmic instability — the listener feels something unresolved, building anticipation.`,
      priority: Math.min(1, (target.tension - profile.tension) * 2),
      icon: "⚡",
      modifications: generateTensionMods(pattern, patternLength),
    });
  }

  if (target && profile.tension > target.tension + 0.2) {
    suggestions.push({
      id: makeId(),
      type: "release",
      category: "emotional",
      label: "Release Tension",
      description: "Simplify the groove and remove clutter",
      reasoning: `Tension (${Math.round(profile.tension * 100)}%) is too high for ${targetEmotion}. Removing off-beat accents and simplifying to core downbeats resolves the rhythmic anxiety — letting the pattern settle into comfort.`,
      priority: Math.min(1, (profile.tension - target.tension) * 2),
      icon: "🌊",
      modifications: generateReleaseMods(pattern, patternLength),
    });
  }

  // Song-part emotional suggestions (work regardless of emotion selection)
  if (songPart === "verse" && profile.energy > 0.7) {
    suggestions.push({
      id: makeId(),
      type: "strip_back",
      category: "emotional",
      label: "Verse Pocket",
      description: "Pull back for vocal-friendly dynamics",
      reasoning: "Verses need space for vocals and melody to breathe. Stripping back percussion keeps the groove moving while leaving room for the song's narrative — save the fireworks for the chorus.",
      priority: 0.6,
      icon: "🎤",
      modifications: generateStripBackMods(pattern, patternLength),
    });
  }

  if (songPart === "chorus" && profile.energy < 0.7) {
    suggestions.push({
      id: makeId(),
      type: "climax",
      category: "emotional",
      label: "Chorus Lift",
      description: "Full energy for maximum impact",
      reasoning: "Choruses need to feel like arrival moments. Adding full kick pattern, 8th-note hi-hats, and layered claps creates the explosive energy that makes the chorus stand out from the verse.",
      priority: 0.75,
      icon: "🚀",
      modifications: generateClimaxMods(pattern, patternLength),
    });
  }

  if (songPart === "bridge" && profile.tension < 0.5) {
    suggestions.push({
      id: makeId(),
      type: "transition",
      category: "emotional",
      label: "Bridge Contrast",
      description: "Create tension before the final chorus",
      reasoning: "Bridges work best as tension-building passages. Dropping the kick and switching to ride creates a sense of floating — the listener craves resolution, making the next chorus feel even more powerful.",
      priority: 0.65,
      icon: "🌉",
      modifications: generateTransitionMods(pattern, patternLength),
    });
  }

  if ((songPart === "outro" || songPart === "intro") && profile.energy > 0.5) {
    suggestions.push({
      id: makeId(),
      type: "resolve",
      category: "emotional",
      label: songPart === "intro" ? "Gentle Intro" : "Gentle Outro",
      description: `Ease ${songPart === "intro" ? "into" : "out of"} the track gracefully`,
      reasoning: songPart === "intro"
        ? "Intros should invite the listener in. Stripping to just kick and a simple hi-hat pattern builds anticipation — each new element that enters feels like a reward."
        : "Outros need to wind down organically. Removing percussion layers one by one creates a natural fadeout feeling that satisfies the listener's sense of completion.",
      priority: 0.6,
      icon: "🎭",
      modifications: generateStripBackMods(pattern, patternLength),
    });
  }

  // ── GENRE AUTHENTICITY CATEGORY ──

  if (genre) {
    const genreSuggestions = generateGenreAuthenticSuggestions(pattern, profile, genre, patternLength, makeId);
    suggestions.push(...genreSuggestions);
  }

  // Sort by priority, return top 4
  return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

/**
 * Generate genre-specific authenticity suggestions.
 */
function generateGenreAuthenticSuggestions(
  pattern: DrumPattern,
  profile: EmotionalProfile,
  genre: string,
  patternLength: number,
  makeId: () => string,
): ArrangementSuggestion[] {
  const traits = GENRE_TRAITS[genre];
  if (!traits) return [];

  const suggestions: ArrangementSuggestion[] = [];

  // Check if kick matches genre pattern
  const kickSteps = pattern["kick"] || [];
  const missingKicks = traits.kickPattern.filter(p => p < patternLength && !kickSteps[p]);
  const extraKicks = Array.from({ length: patternLength }, (_, i) => i)
    .filter(i => kickSteps[i] && !traits.kickPattern.includes(i));

  if (missingKicks.length >= 2 || extraKicks.length >= 3) {
    const mods: PatternModification[] = [];
    if (missingKicks.length > 0) {
      mods.push({ instrument: "kick", action: "add", steps: missingKicks });
    }
    if (extraKicks.length > 2) {
      mods.push({ instrument: "kick", action: "remove", steps: extraKicks.slice(0, 2) });
    }

    suggestions.push({
      id: makeId(),
      type: "genre_authentic",
      category: "genre",
      label: `${capitalizeFirst(genre)} Kick Pattern`,
      description: `Reshape kick for authentic ${genre} feel`,
      reasoning: `Classic ${genre} relies on ${traits.tips[0]}. Aligning your kick pattern to the genre's foundation will immediately make the beat sound more authentic and professional.`,
      priority: 0.7,
      icon: "🥁",
      modifications: mods,
    });
  }

  // Hi-hat style suggestions
  if (traits.hihatStyle === "offbeat-open" && genre === "house") {
    const openHats = [2, 6, 10, 14].filter(p => p < patternLength);
    const missingOpen = openHats.filter(p => !pattern["hihat-open"]?.[p]);
    if (missingOpen.length >= 2) {
      suggestions.push({
        id: makeId(),
        type: "genre_authentic",
        category: "genre",
        label: "Offbeat Open Hats",
        description: "Classic house offbeat open hi-hat pattern",
        reasoning: `House music's signature sound comes from ${traits.tips[1]}. The offbeat open hi-hats create the driving, pulsing energy that defines the genre and keeps dancers moving.`,
        priority: 0.65,
        icon: "🏠",
        modifications: [
          { instrument: "hihat-open", action: "add", steps: missingOpen },
          { instrument: "hihat-closed", action: "remove", steps: missingOpen.filter(p => pattern["hihat-closed"]?.[p]) },
        ],
      });
    }
  }

  if ((genre === "trap" || genre === "hip-hop") && profile.complexity < 0.5) {
    const rapidHats = [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15].filter(p => p < patternLength);
    const missingHats = rapidHats.filter(p => !pattern["hihat-closed"]?.[p]).slice(0, 4);
    if (missingHats.length >= 2) {
      suggestions.push({
        id: makeId(),
        type: "genre_authentic",
        category: "genre",
        label: "Hi-Hat Rolls",
        description: `Add rapid hi-hat patterns for ${genre} energy`,
        reasoning: `${capitalizeFirst(genre)} uses ${traits.tips[2]} as a signature element. Adding rapid hi-hat patterns between the kicks creates the rhythmic intensity the genre is known for.`,
        priority: 0.6,
        icon: genre === "trap" ? "🔊" : "🎤",
        modifications: [
          { instrument: "hihat-closed", action: "add", steps: missingHats },
        ],
      });
    }
  }

  return suggestions;
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Generate syncopation modifications */
function generateSyncopationMods(pattern: DrumPattern, length: number): PatternModification[] {
  const mods: PatternModification[] = [];

  // Move a kick hit to an off-beat position for syncopation
  const offBeats = [3, 5, 11, 13].filter(p => p < length && !pattern["kick"]?.[p]);
  if (offBeats.length > 0) {
    mods.push({ instrument: "kick", action: "add", steps: offBeats.slice(0, 1), velocityMultiplier: 0.7 });
  }

  // Add ghost snare on an unexpected beat
  const ghostSnare = [3, 7, 11, 15].filter(p => p < length && !pattern["snare"]?.[p]);
  if (ghostSnare.length > 0) {
    mods.push({ instrument: "snare", action: "add", steps: ghostSnare.slice(0, 1), velocityMultiplier: 0.4 });
  }

  return mods;
}

/**
 * Apply a suggestion's modifications to a pattern.
 */
export function applySuggestion(
  pattern: DrumPattern,
  suggestion: ArrangementSuggestion,
  patternLength: number = 16
): DrumPattern {
  const result: DrumPattern = {};
  for (const key of Object.keys(pattern)) {
    result[key] = [...pattern[key]];
  }

  for (const mod of suggestion.modifications) {
    if (!result[mod.instrument]) {
      result[mod.instrument] = new Array(patternLength).fill(false);
    }
    const steps = result[mod.instrument];
    for (const step of mod.steps) {
      if (step >= 0 && step < patternLength) {
        if (mod.action === "add") {
          steps[step] = true;
        } else if (mod.action === "remove") {
          steps[step] = false;
        }
      }
    }
  }

  return result;
}

// ─── Psychoacoustic Optimization ────────────────────────────────────────────

/**
 * Get psychoacoustic optimization hints for the current pattern.
 */
export function getPsychoacousticHints(
  profile: EmotionalProfile,
  targetEmotion: Emotion | null,
  currentBpm: number,
  currentSwing: number,
  intensity: EmotionIntensity = 3
): PsychoacousticHint[] {
  const hints: PsychoacousticHint[] = [];
  if (!targetEmotion) return hints;

  const emFreq = PSYCHOACOUSTIC_DB.emotionFrequencyMap[targetEmotion];
  const targetBpm = emFreq.bpmCenter;
  const intensityScale = intensity / 5;

  // BPM optimization
  const bpmDiff = Math.abs(currentBpm - targetBpm);
  if (bpmDiff > 10) {
    const optimalBpm = Math.round(targetBpm + (currentBpm - targetBpm) * (1 - intensityScale));
    hints.push({
      id: "bpm_opt",
      label: "BPM Optimization",
      description: `${targetEmotion} patterns resonate best around ${targetBpm} BPM`,
      parameter: "bpm",
      suggestedValue: optimalBpm,
      currentValue: currentBpm,
      emotionalImpact: getBpmEffect(optimalBpm),
      icon: "🎯",
    });
  }

  // Swing optimization
  const targetSwing = targetEmotion === "happy" || targetEmotion === "romantic" ? 35 :
    targetEmotion === "calm" ? 20 : targetEmotion === "aggressive" ? 5 : 15;
  if (Math.abs(currentSwing - targetSwing) > 10) {
    hints.push({
      id: "swing_opt",
      label: "Swing Feel",
      description: `A ${targetSwing}% swing enhances the ${targetEmotion} mood`,
      parameter: "swing",
      suggestedValue: targetSwing,
      currentValue: currentSwing,
      emotionalImpact: targetSwing > 25 ? "Organic, human groove feel" : "Tight, precise rhythm",
      icon: "🎶",
    });
  }

  // Density optimization
  const targetDensity = emFreq.kickWeight * 0.5 + emFreq.hihatPresence * 0.5;
  const currentDensity = (profile.heaviness + profile.brightness) / 2;
  if (Math.abs(currentDensity - targetDensity) > 0.15) {
    hints.push({
      id: "density_opt",
      label: "Pattern Density",
      description: currentDensity > targetDensity
        ? "Reducing hits will increase emotional clarity"
        : "Adding rhythmic layers will intensify the mood",
      parameter: "density",
      suggestedValue: Math.round(targetDensity * 100),
      currentValue: Math.round(currentDensity * 100),
      emotionalImpact: targetDensity > 0.5
        ? "Dense patterns drive momentum"
        : "Space between notes creates breathing room",
      icon: "📊",
    });
  }

  return hints;
}

// ─── Emotion-Based Pattern Generation ───────────────────────────────────────

/**
 * Generate a pattern optimized for a specific emotion at a given intensity.
 */
export function generateEmotionPattern(
  emotion: Emotion,
  intensity: EmotionIntensity,
  genre: Genre,
  patternLength: PatternLength = 16
): DrumPattern {
  const target = getTargetProfile(emotion);
  const intensityScale = intensity / 5;
  const emFreq = PSYCHOACOUSTIC_DB.emotionFrequencyMap[emotion];

  const pattern: DrumPattern = {};
  for (const inst of INSTRUMENTS) {
    pattern[inst.id] = new Array(patternLength).fill(false);
  }

  // Kick pattern based on emotion
  const kickDensity = Math.round(emFreq.kickWeight * intensityScale * (patternLength / 4));
  const kickPositions = selectPositions(patternLength, kickDensity, target.groove > 0.5);
  for (const pos of kickPositions) {
    pattern["kick"][pos] = true;
  }

  // Snare on backbeats (intensity controls presence)
  if (intensityScale > 0.2) {
    const snarePositions = [4, 12].filter(p => p < patternLength);
    for (const pos of snarePositions) {
      pattern["snare"][pos] = true;
    }
  }

  // Hi-hat density based on brightness target
  const hihatDensity = Math.round(emFreq.hihatPresence * intensityScale * (patternLength / 2));
  const hihatPositions = selectPositions(patternLength, hihatDensity, false);
  for (const pos of hihatPositions) {
    pattern["hihat-closed"][pos] = true;
  }

  // Open hi-hat for brightness (on off-beats)
  if (target.brightness > 0.5 && intensityScale > 0.4) {
    const openPositions = [6, 14].filter(p => p < patternLength);
    for (const pos of openPositions) {
      pattern["hihat-open"][pos] = true;
      pattern["hihat-closed"][pos] = false;
    }
  }

  // Clap layering at higher intensities
  if (intensityScale > 0.5 && target.energy > 0.5) {
    for (const pos of [4, 12].filter(p => p < patternLength)) {
      pattern["clap"][pos] = true;
    }
  }

  // Percussion for tension/complexity
  if (target.tension > 0.4 && intensityScale > 0.5) {
    const tomPositions = selectSyncopatedPositions(patternLength, Math.round(2 * intensityScale));
    for (const pos of tomPositions) {
      pattern["tom-high"][pos] = true;
    }
  }

  // Ride for calm/romantic moods
  if ((emotion === "calm" || emotion === "romantic") && intensityScale > 0.3) {
    for (let i = 0; i < patternLength; i += 4) {
      pattern["ride"][i] = true;
    }
  }

  return pattern;
}

/**
 * Adapt BPM and complexity based on emotional context and optional biometric data.
 */
export function getAdaptiveSettings(
  emotion: Emotion,
  intensity: EmotionIntensity,
  biometricData?: BiometricData
): { suggestedBpm: number; suggestedComplexity: number; suggestedSwing: number } {
  const emFreq = PSYCHOACOUSTIC_DB.emotionFrequencyMap[emotion];
  const intensityScale = intensity / 5;

  let suggestedBpm = emFreq.bpmCenter;
  let suggestedComplexity = 5;
  let suggestedSwing = 25;

  // Adjust based on intensity
  suggestedBpm += Math.round((intensityScale - 0.5) * 20);
  suggestedComplexity = Math.round(3 + intensityScale * 5);

  // Adjust swing per emotion
  switch (emotion) {
    case "happy": suggestedSwing = 30 + Math.round(intensityScale * 15); break;
    case "sad": suggestedSwing = 15 + Math.round(intensityScale * 10); break;
    case "aggressive": suggestedSwing = Math.round(intensityScale * 10); break;
    case "calm": suggestedSwing = 20 + Math.round(intensityScale * 5); break;
    case "anxious": suggestedSwing = 10 + Math.round(intensityScale * 15); break;
    case "romantic": suggestedSwing = 30 + Math.round(intensityScale * 20); break;
  }

  // Biometric adaptation
  if (biometricData?.heartRate) {
    const hr = biometricData.heartRate;
    // Sync BPM to heart rate multiples for entrainment
    const ratio = suggestedBpm / hr;
    if (ratio > 1.8 && ratio < 2.2) {
      suggestedBpm = hr * 2; // lock to 2x heart rate
    } else if (ratio > 0.9 && ratio < 1.1) {
      suggestedBpm = hr; // lock to 1x heart rate
    }
  }

  return {
    suggestedBpm: Math.round(Math.max(50, Math.min(200, suggestedBpm))),
    suggestedComplexity: Math.max(1, Math.min(10, suggestedComplexity)),
    suggestedSwing: Math.max(0, Math.min(100, suggestedSwing)),
  };
}

// ─── Emotional Arc / Timeline ───────────────────────────────────────────────

/**
 * Generate a suggested emotional arc for a song structure.
 */
export function generateEmotionalArc(
  songParts: SongPart[],
  targetEmotion: Emotion | null
): EmotionalArcPoint[] {
  const partCount = songParts.length;
  if (partCount === 0) return [];

  const arcTemplates: Record<string, Partial<EmotionalArcPoint>> = {
    intro: { tension: 0.2, energy: 0.3, valence: 0.5, label: "Build anticipation" },
    verse: { tension: 0.4, energy: 0.55, valence: 0.6, label: "Establish groove" },
    chorus: { tension: 0.3, energy: 0.9, valence: 0.85, label: "Peak energy" },
    bridge: { tension: 0.7, energy: 0.5, valence: 0.4, label: "Create contrast" },
    outro: { tension: 0.15, energy: 0.25, valence: 0.55, label: "Resolve" },
  };

  return songParts.map((part, index) => {
    const template = arcTemplates[part] || arcTemplates.verse;
    const position = partCount > 1 ? index / (partCount - 1) : 0.5;

    // Adjust based on target emotion
    let tensionMod = 0;
    let energyMod = 0;
    let valenceMod = 0;
    if (targetEmotion) {
      const tp = getTargetProfile(targetEmotion);
      tensionMod = (tp.tension - 0.4) * 0.3;
      energyMod = (tp.energy - 0.5) * 0.3;
      valenceMod = (tp.valence - 0.5) * 0.3;
    }

    return {
      position,
      tension: clamp((template.tension || 0.4) + tensionMod),
      energy: clamp((template.energy || 0.5) + energyMod),
      valence: clamp((template.valence || 0.5) + valenceMod),
      label: template.label || part,
    };
  });
}

/**
 * Get emotional transition suggestions between two song parts.
 */
export function getTransitionSuggestion(
  fromProfile: EmotionalProfile,
  toProfile: EmotionalProfile
): string {
  const tensionDiff = toProfile.tension - fromProfile.tension;
  const energyDiff = toProfile.energy - fromProfile.energy;

  if (tensionDiff > 0.3) return "Build tension with fills and syncopation before the next section";
  if (tensionDiff < -0.3) return "Release tension with a cymbal crash and simplified groove";
  if (energyDiff > 0.3) return "Gradually add layers to build energy into the next section";
  if (energyDiff < -0.3) return "Strip back instruments for a smooth energy drop";
  if (Math.abs(tensionDiff) < 0.1 && Math.abs(energyDiff) < 0.1) return "Maintain the current feel with subtle variation";
  return "Use a short fill to signal the section change";
}

// ─── Context-Based Recommendations ──────────────────────────────────────────

/**
 * Get pattern recommendations for a specific use context.
 */
export function getContextRecommendations(context: UseContext): {
  emotion: Emotion;
  bpm: number;
  complexity: number;
  swing: number;
  description: string;
} {
  const settings = USE_CONTEXTS[context];
  const [bpmLow, bpmHigh] = settings.bpmRange;
  const [cxLow, cxHigh] = settings.complexityRange;
  const emotion = settings.preferredEmotions[0];

  return {
    emotion,
    bpm: Math.round((bpmLow + bpmHigh) / 2),
    complexity: Math.round((cxLow + cxHigh) / 2),
    swing: emotion === "happy" || emotion === "romantic" ? 30 : emotion === "calm" ? 20 : 10,
    description: settings.description,
  };
}

// ─── Helper functions ───────────────────────────────────────────────────────

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function selectPositions(length: number, count: number, preferDownbeats: boolean): number[] {
  const positions: number[] = [];
  const downbeats = [0, 4, 8, 12].filter(p => p < length);
  const allPositions = Array.from({ length }, (_, i) => i);

  if (preferDownbeats) {
    for (const db of downbeats) {
      if (positions.length < count) positions.push(db);
    }
  }

  // Fill remaining with evenly spaced positions
  const step = Math.max(1, Math.floor(length / Math.max(1, count - positions.length)));
  for (let i = 0; i < length && positions.length < count; i += step) {
    if (!positions.includes(i)) positions.push(i);
  }

  return positions.slice(0, count);
}

function selectSyncopatedPositions(length: number, count: number): number[] {
  const offBeats = [1, 3, 5, 7, 9, 11, 13, 15].filter(p => p < length);
  const shuffled = offBeats.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getBpmEffect(bpm: number): string {
  for (const entry of PSYCHOACOUSTIC_DB.bpmEffects) {
    if (bpm >= entry.range[0] && bpm < entry.range[1]) {
      return entry.effect;
    }
  }
  return "rhythmic";
}

// ─── Modification Generators ────────────────────────────────────────────────

function generateTensionMods(pattern: DrumPattern, length: number): PatternModification[] {
  const mods: PatternModification[] = [];
  const offBeats = [1, 3, 5, 7, 9, 11, 13, 15].filter(p => p < length);

  // Add syncopated kicks
  const emptyOffBeats = offBeats.filter(p => !pattern["kick"]?.[p]);
  if (emptyOffBeats.length > 0) {
    mods.push({ instrument: "kick", action: "add", steps: emptyOffBeats.slice(0, 2) });
  }

  // Add tom accents
  const tomSteps = [3, 7, 11].filter(p => p < length && !pattern["tom-high"]?.[p]);
  if (tomSteps.length > 0) {
    mods.push({ instrument: "tom-high", action: "add", steps: tomSteps.slice(0, 2) });
  }

  return mods;
}

function generateReleaseMods(pattern: DrumPattern, length: number): PatternModification[] {
  const mods: PatternModification[] = [];
  const offBeats = [1, 3, 5, 7, 9, 11, 13, 15].filter(p => p < length);

  // Remove off-beat kicks
  const activeOffBeatKicks = offBeats.filter(p => pattern["kick"]?.[p]);
  if (activeOffBeatKicks.length > 0) {
    mods.push({ instrument: "kick", action: "remove", steps: activeOffBeatKicks });
  }

  // Remove toms
  const activeToms = Array.from({ length }, (_, i) => i).filter(p => pattern["tom-high"]?.[p]);
  if (activeToms.length > 0) {
    mods.push({ instrument: "tom-high", action: "remove", steps: activeToms });
  }

  return mods;
}

function generateEnergyBuildMods(pattern: DrumPattern, length: number): PatternModification[] {
  const mods: PatternModification[] = [];

  // Add 8th note hi-hats
  const hihatSteps: number[] = [];
  for (let i = 0; i < length; i += 2) {
    if (!pattern["hihat-closed"]?.[i]) hihatSteps.push(i);
  }
  if (hihatSteps.length > 0) {
    mods.push({ instrument: "hihat-closed", action: "add", steps: hihatSteps });
  }

  // Add kick on beat 3
  if (!pattern["kick"]?.[8] && 8 < length) {
    mods.push({ instrument: "kick", action: "add", steps: [8] });
  }

  return mods;
}

function generateStripBackMods(pattern: DrumPattern, length: number): PatternModification[] {
  const mods: PatternModification[] = [];

  // Remove toms and claps
  for (const inst of ["tom-high", "tom-low", "clap"]) {
    const active = Array.from({ length }, (_, i) => i).filter(p => pattern[inst]?.[p]);
    if (active.length > 0) {
      mods.push({ instrument: inst, action: "remove", steps: active });
    }
  }

  // Thin out hi-hats to quarter notes
  const hihatRemove = Array.from({ length }, (_, i) => i)
    .filter(p => pattern["hihat-closed"]?.[p] && p % 4 !== 0);
  if (hihatRemove.length > 0) {
    mods.push({ instrument: "hihat-closed", action: "remove", steps: hihatRemove });
  }

  return mods;
}

function generateGrooveMods(pattern: DrumPattern, length: number): PatternModification[] {
  const mods: PatternModification[] = [];

  // Add ghost note kicks on off-beats
  const ghostKicks = [3, 11].filter(p => p < length && !pattern["kick"]?.[p]);
  if (ghostKicks.length > 0) {
    mods.push({ instrument: "kick", action: "add", steps: ghostKicks, velocityMultiplier: 0.5 });
  }

  // Add off-beat hi-hat accents
  const accentHats = [2, 6, 10, 14].filter(p => p < length && !pattern["hihat-closed"]?.[p]);
  if (accentHats.length > 0) {
    mods.push({ instrument: "hihat-closed", action: "add", steps: accentHats });
  }

  return mods;
}

function generateBrightnessMods(pattern: DrumPattern, length: number): PatternModification[] {
  const mods: PatternModification[] = [];

  // Add open hi-hats
  const openSteps = [6, 14].filter(p => p < length && !pattern["hihat-open"]?.[p]);
  if (openSteps.length > 0) {
    mods.push({ instrument: "hihat-open", action: "add", steps: openSteps });
  }

  // Add ride
  const rideSteps = [0, 4, 8, 12].filter(p => p < length && !pattern["ride"]?.[p]);
  if (rideSteps.length > 0) {
    mods.push({ instrument: "ride", action: "add", steps: rideSteps });
  }

  return mods;
}

function generateWeightMods(pattern: DrumPattern, length: number): PatternModification[] {
  const mods: PatternModification[] = [];

  // Add kick on all strong beats
  const kickSteps = [0, 4, 8, 12].filter(p => p < length && !pattern["kick"]?.[p]);
  if (kickSteps.length > 0) {
    mods.push({ instrument: "kick", action: "add", steps: kickSteps });
  }

  // Add low tom
  const tomSteps = [6, 14].filter(p => p < length && !pattern["tom-low"]?.[p]);
  if (tomSteps.length > 0) {
    mods.push({ instrument: "tom-low", action: "add", steps: tomSteps });
  }

  return mods;
}

function generateClimaxMods(pattern: DrumPattern, length: number): PatternModification[] {
  const mods: PatternModification[] = [];

  // Full kick pattern
  const kickSteps = [0, 4, 8, 10, 12].filter(p => p < length && !pattern["kick"]?.[p]);
  if (kickSteps.length > 0) {
    mods.push({ instrument: "kick", action: "add", steps: kickSteps });
  }

  // 8th note hi-hats
  const hihatSteps: number[] = [];
  for (let i = 0; i < length; i += 2) {
    if (!pattern["hihat-closed"]?.[i]) hihatSteps.push(i);
  }
  if (hihatSteps.length > 0) {
    mods.push({ instrument: "hihat-closed", action: "add", steps: hihatSteps });
  }

  // Clap layers
  const clapSteps = [4, 12].filter(p => p < length && !pattern["clap"]?.[p]);
  if (clapSteps.length > 0) {
    mods.push({ instrument: "clap", action: "add", steps: clapSteps });
  }

  return mods;
}

function generateTransitionMods(pattern: DrumPattern, length: number): PatternModification[] {
  const mods: PatternModification[] = [];

  // Remove kick on some beats for contrast
  const kickRemove = [4, 12].filter(p => p < length && pattern["kick"]?.[p]);
  if (kickRemove.length > 0) {
    mods.push({ instrument: "kick", action: "remove", steps: kickRemove });
  }

  // Add ride for texture change
  const rideSteps = [0, 2, 4, 6, 8, 10, 12, 14].filter(p => p < length && !pattern["ride"]?.[p]);
  if (rideSteps.length > 0) {
    mods.push({ instrument: "ride", action: "add", steps: rideSteps.slice(0, 4) });
  }

  return mods;
}
