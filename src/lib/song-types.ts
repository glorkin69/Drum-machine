/**
 * Song Mode Types for BeatForge 808
 *
 * Defines the data structures for song mode — arranging multiple
 * pattern blocks into a complete song sequence.
 */

import type {
  Genre,
  SongPart,
  Emotion,
  DrumPattern,
  VelocityMap,
  ProbabilityMap,
  PatternLength,
} from "./drum-patterns";
import type { FillIntensity, FillCategory } from "./fill-patterns";

/** Fill timing options for block-level fills */
export type FillTiming = "last-2-bars" | "last-1-bar" | "last-2-beats" | "none";

export const FILL_TIMING_OPTIONS: { value: FillTiming; label: string; shortLabel: string }[] = [
  { value: "none", label: "No Fill", shortLabel: "OFF" },
  { value: "last-2-beats", label: "Last 2 Beats", shortLabel: "2 BT" },
  { value: "last-1-bar", label: "Last 1 Bar", shortLabel: "1 BAR" },
  { value: "last-2-bars", label: "Last 2 Bars", shortLabel: "2 BAR" },
];

/** Fill configuration per song block */
export interface BlockFillSettings {
  /** When the fill triggers relative to block end */
  timing: FillTiming;
  /** Fill intensity (1-10 scale) */
  intensity: number;
  /** Fill category for generation */
  category: FillCategory;
  /** Whether to auto-generate contextual fills or use a specific pattern */
  autoGenerate: boolean;
  /** Optional manually selected fill pattern (DrumPattern JSON) */
  manualPattern: DrumPattern | null;
}

/** Default fill settings for new blocks */
export const DEFAULT_FILL_SETTINGS: BlockFillSettings = {
  timing: "none",
  intensity: 5,
  category: "transition",
  autoGenerate: true,
  manualPattern: null,
};

/** A single pattern block in the song timeline */
export interface SongBlock {
  id: string;
  /** Display name for the block */
  name: string;
  /** The drum pattern grid data */
  pattern: DrumPattern;
  /** Per-step velocity values */
  velocity: VelocityMap;
  /** Per-step probability values */
  probability: ProbabilityMap;
  /** Number of steps in this pattern */
  patternLength: PatternLength;
  /** Genre used for this block */
  genre: Genre;
  /** Song part used for this block */
  songPart: SongPart;
  /** Optional emotion/mood tag */
  emotion: Emotion | null;
  /** Tempo in BPM */
  bpm: number;
  /** Complexity level (1-10) */
  complexity: number;
  /** Number of times to repeat this block (default 1) */
  repeats: number;
  /** Fill settings for this block */
  fillSettings: BlockFillSettings;
}

/** Full song structure */
export interface Song {
  /** Ordered list of pattern blocks */
  blocks: SongBlock[];
  /** Song name */
  name: string;
  /** Whether to loop the entire song */
  loop: boolean;
}

/** Song playback state */
export interface SongPlaybackState {
  /** Whether the song is currently playing */
  isPlaying: boolean;
  /** Index of the currently playing block */
  currentBlockIndex: number;
  /** Current repeat count within the active block */
  currentRepeat: number;
  /** Current step within the active pattern */
  currentStep: number;
  /** Whether song is looping */
  loop: boolean;
}

/** Data sent to API for saving a song */
export interface SavedSongData {
  name: string;
  blocks: SongBlock[];
  loop: boolean;
}

/** Genre color map for visual differentiation */
export const GENRE_COLORS: Record<Genre, string> = {
  house: "#9b59b6",
  electronic: "#3498db",
  "lo-fi": "#95a5a6",
  pop: "#e91e63",
  rock: "#e74c3c",
  "hip-hop": "#8E44AD",
  trap: "#F39C12",
};

/** Song part abbreviations for compact display */
export const SONG_PART_LABELS: Record<SongPart, string> = {
  intro: "INT",
  verse: "VRS",
  chorus: "CHR",
  bridge: "BRG",
  outro: "OUT",
};

/** Generate a unique block ID */
export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Calculate the step within a pattern where the fill should start.
 * Returns -1 if no fill (timing is "none").
 * The fill occupies the last N steps of the LAST repeat of the block.
 */
export function getFillStartStep(
  timing: FillTiming,
  patternLength: number,
): number {
  switch (timing) {
    case "last-2-bars":
      // 2 full bars = 2 × patternLength worth of steps, but capped to pattern
      // In 16-step context, 2 bars = 32 steps. Since we're within one pattern,
      // we treat "bars" as half-pattern chunks. 2 bars ≈ full pattern.
      return 0;
    case "last-1-bar":
      // Last half of the pattern (1 bar in a 2-bar pattern context)
      return Math.floor(patternLength / 2);
    case "last-2-beats":
      // Last 4 steps (2 beats = 4 sixteenth notes)
      return Math.max(0, patternLength - 4);
    case "none":
    default:
      return -1;
  }
}

/**
 * Map block fill intensity (1-10) to the fill pattern system's intensity levels
 */
export function mapFillIntensity(intensity: number): "subtle" | "moderate" | "heavy" {
  if (intensity <= 3) return "subtle";
  if (intensity <= 7) return "moderate";
  return "heavy";
}
