// Drum fill patterns and smart fill generation
// Provides genre-specific fills at 3 intensity levels plus algorithmic generation
// Supports 3 fill categories: transition, rising-energy, and signature (vintage machine)

import type { Genre, SongPart, Emotion, DrumPattern } from "./drum-patterns";
import { INSTRUMENTS } from "./drum-patterns";

// Fill intensity level
export type FillIntensity = "subtle" | "moderate" | "heavy";

// Fill type classification
export type FillType = "short" | "full";

// Fill category: defines the musical purpose of the fill
export type FillCategory = "transition" | "rising-energy" | "signature";

export const FILL_CATEGORIES = {
  transition: {
    id: "transition" as FillCategory,
    name: "Transition",
    shortName: "TRANS",
    description: "Smooth section changes - subtle shifts that alert the listener",
    color: "#3498db",
  },
  "rising-energy": {
    id: "rising-energy" as FillCategory,
    name: "Rising Energy",
    shortName: "RISE",
    description: "Building intensity fills that crescendo to a climax",
    color: "#e74c3c",
  },
  signature: {
    id: "signature" as FillCategory,
    name: "Signature",
    shortName: "808",
    description: "Vintage drum machine fills with classic 808 character",
    color: "#f39c12",
  },
} as const;

export interface FillPattern {
  id: string;
  name: string;
  genre: Genre;
  intensity: FillIntensity;
  fillType: FillType;
  category: FillCategory;
  pattern: DrumPattern;
}

// Helper: create a 16-step array from step indices
function s(...steps: number[]): boolean[] {
  const pattern = Array(16).fill(false) as boolean[];
  for (const step of steps) pattern[step] = true;
  return pattern;
}
const _ = (): boolean[] => Array(16).fill(false) as boolean[];

// =====================================================================
// GENRE-SPECIFIC FILL PATTERNS
// =====================================================================

const FILL_LIBRARY: FillPattern[] = [
  // ====================================================================
  // TRANSITION FILLS - Smooth section changes, subtle groove shifts
  // ====================================================================

  // ---- ROCK TRANSITION FILLS ----
  {
    id: "rock-trans-subtle-1", name: "Snare Tap", genre: "rock",
    intensity: "subtle", fillType: "short", category: "transition",
    pattern: {
      kick: s(0, 8), snare: s(4, 12, 13, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-trans-subtle-2", name: "Hi-Hat Roll", genre: "rock",
    intensity: "subtle", fillType: "short", category: "transition",
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 11, 12, 13, 14, 15), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-trans-mod-1", name: "Tom Cascade", genre: "rock",
    intensity: "moderate", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 4, 8), snare: s(4, 10),
      "hihat-closed": s(0, 2, 4, 6), "hihat-open": _(),
      clap: s(15), "tom-high": s(8, 9, 12, 13), "tom-low": s(10, 11, 14, 15), ride: _(),
    },
  },
  {
    id: "rock-trans-mod-2", name: "Snare Build", genre: "rock",
    intensity: "moderate", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 8), snare: s(4, 8, 10, 12, 13, 14, 15),
      "hihat-closed": s(0, 2, 4, 6), "hihat-open": _(),
      clap: s(15), "tom-high": _(), "tom-low": _(), ride: s(0),
    },
  },
  {
    id: "rock-trans-heavy-1", name: "Full Tom Roll", genre: "rock",
    intensity: "heavy", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 15), snare: s(4, 7),
      "hihat-closed": _(), "hihat-open": _(),
      clap: s(15), "tom-high": s(8, 9, 10, 11), "tom-low": s(12, 13, 14, 15), ride: s(0),
    },
  },
  {
    id: "rock-trans-heavy-2", name: "Bonham Fill", genre: "rock",
    intensity: "heavy", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 8, 12, 14), snare: s(2, 4, 6, 10),
      "hihat-closed": _(), "hihat-open": s(0),
      clap: s(15), "tom-high": s(8, 10, 12), "tom-low": s(9, 11, 13, 14, 15), ride: _(),
    },
  },

  // ---- HOUSE TRANSITION FILLS ----
  {
    id: "house-trans-subtle-1", name: "Hat Flurry", genre: "house",
    intensity: "subtle", fillType: "short", category: "transition",
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 11, 12, 13, 14, 15), "hihat-open": s(3, 7),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-trans-subtle-2", name: "Clap Roll", genre: "house",
    intensity: "subtle", fillType: "short", category: "transition",
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12, 13, 14, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-trans-mod-1", name: "Tribal Toms", genre: "house",
    intensity: "moderate", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 4, 8), snare: _(),
      "hihat-closed": s(2, 6, 10), "hihat-open": s(14, 15),
      clap: s(4, 12), "tom-high": s(10, 12, 14), "tom-low": s(11, 13, 15), ride: _(),
    },
  },
  {
    id: "house-trans-mod-2", name: "Ride Wash", genre: "house",
    intensity: "moderate", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(14, 15),
      "hihat-closed": _(), "hihat-open": s(2, 6, 10, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  {
    id: "house-trans-heavy-1", name: "Build & Drop", genre: "house",
    intensity: "heavy", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 2, 4, 6, 8, 10, 12, 14), snare: s(12, 13, 14, 15),
      "hihat-closed": s(1, 3, 5, 7, 9, 11, 13, 15), "hihat-open": _(),
      clap: s(4, 8, 12, 14, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-trans-heavy-2", name: "Percussion Storm", genre: "house",
    intensity: "heavy", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(14, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(7, 15),
      clap: s(4, 8, 12, 13, 14, 15), "tom-high": s(10, 12, 14), "tom-low": s(11, 13, 15), ride: _(),
    },
  },

  // ---- ELECTRONIC TRANSITION FILLS ----
  {
    id: "elec-trans-subtle-1", name: "Filter Sweep", genre: "electronic",
    intensity: "subtle", fillType: "short", category: "transition",
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-trans-subtle-2", name: "Snare Roll", genre: "electronic",
    intensity: "subtle", fillType: "short", category: "transition",
    pattern: {
      kick: s(0, 4, 8), snare: s(10, 11, 12, 13, 14, 15),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": _(),
      clap: s(4), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-trans-mod-1", name: "Glitch Fill", genre: "electronic",
    intensity: "moderate", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 3, 5, 8, 11), snare: s(2, 6, 10, 14),
      "hihat-closed": s(1, 4, 7, 9, 12, 15), "hihat-open": s(3, 11),
      clap: s(5, 13), "tom-high": s(8, 14), "tom-low": s(10, 15), ride: _(),
    },
  },
  {
    id: "elec-trans-mod-2", name: "Riser Build", genre: "electronic",
    intensity: "moderate", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 4, 8, 10, 12, 13, 14, 15), snare: s(4, 12, 14),
      "hihat-closed": s(2, 6, 10, 12, 14), "hihat-open": s(15),
      clap: s(4, 12, 15), "tom-high": _(), "tom-low": _(), ride: s(0, 8),
    },
  },
  {
    id: "elec-trans-heavy-1", name: "Drop Build", genre: "electronic",
    intensity: "heavy", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), snare: s(8, 10, 12, 13, 14, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": _(),
      clap: s(4, 8, 12, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-trans-heavy-2", name: "Chaos Break", genre: "electronic",
    intensity: "heavy", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 3, 6, 8, 11, 14), snare: s(1, 4, 7, 9, 12, 15),
      "hihat-closed": s(2, 5, 8, 10, 13), "hihat-open": s(3, 7, 11, 15),
      clap: s(0, 4, 8, 12), "tom-high": s(6, 10, 14), "tom-low": s(7, 11, 15), ride: _(),
    },
  },

  // ---- LO-FI TRANSITION FILLS ----
  {
    id: "lofi-trans-subtle-1", name: "Lazy Roll", genre: "lo-fi",
    intensity: "subtle", fillType: "short", category: "transition",
    pattern: {
      kick: s(0, 3, 10), snare: s(4, 12, 14),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(7, 15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 3, 4, 6, 8, 11, 12, 14),
    },
  },
  {
    id: "lofi-trans-subtle-2", name: "Ghost Shuffle", genre: "lo-fi",
    intensity: "subtle", fillType: "short", category: "transition",
    pattern: {
      kick: s(0, 3, 10), snare: s(4, 11, 12, 15),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "lofi-trans-mod-1", name: "Dusty Toms", genre: "lo-fi",
    intensity: "moderate", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 10), snare: s(4),
      "hihat-closed": s(0, 4, 8), "hihat-open": _(),
      clap: _(), "tom-high": s(8, 10, 12), "tom-low": s(11, 13, 14, 15), ride: s(0, 4),
    },
  },
  {
    id: "lofi-trans-mod-2", name: "Jazz Break", genre: "lo-fi",
    intensity: "moderate", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 6, 10), snare: s(4, 8, 14),
      "hihat-closed": s(0, 3, 6, 11), "hihat-open": s(14),
      clap: _(), "tom-high": s(12), "tom-low": s(15), ride: s(0, 3, 6, 8, 11, 14),
    },
  },
  {
    id: "lofi-trans-heavy-1", name: "Boom Bap Break", genre: "lo-fi",
    intensity: "heavy", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 3, 6, 10), snare: s(4, 8, 12, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(7, 15),
      clap: s(4, 12), "tom-high": s(10, 13), "tom-low": s(11, 14), ride: _(),
    },
  },
  {
    id: "lofi-trans-heavy-2", name: "Vinyl Crackle Fill", genre: "lo-fi",
    intensity: "heavy", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 3, 6, 8, 11, 14), snare: s(2, 4, 7, 10, 12, 15),
      "hihat-closed": s(1, 3, 5, 9, 11, 13), "hihat-open": s(7, 15),
      clap: _(), "tom-high": s(8, 12), "tom-low": s(10, 14), ride: s(0, 4),
    },
  },

  // ---- HIP-HOP TRANSITION FILLS ----
  {
    id: "hiphop-trans-subtle-1", name: "Ghost Tap", genre: "hip-hop",
    intensity: "subtle", fillType: "short", category: "transition",
    pattern: {
      kick: s(0, 3, 8, 12), snare: s(4, 12, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(7, 15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-trans-subtle-2", name: "Swing Roll", genre: "hip-hop",
    intensity: "subtle", fillType: "short", category: "transition",
    pattern: {
      kick: s(0, 3, 10), snare: s(4, 12, 13),
      "hihat-closed": s(0, 2, 3, 4, 6, 8, 10, 11, 12, 14), "hihat-open": _(),
      clap: s(4), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "hiphop-trans-mod-1", name: "Boom Bap Break", genre: "hip-hop",
    intensity: "moderate", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 3, 6, 10), snare: s(4, 8, 12, 14),
      "hihat-closed": s(0, 2, 4, 6, 8), "hihat-open": s(14),
      clap: s(4, 12), "tom-high": s(10, 12), "tom-low": s(14, 15), ride: _(),
    },
  },
  {
    id: "hiphop-trans-mod-2", name: "Scratch Fill", genre: "hip-hop",
    intensity: "moderate", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 3, 8, 11), snare: s(4, 10, 12, 14),
      "hihat-closed": s(0, 2, 4, 6), "hihat-open": s(7, 15),
      clap: s(4, 15), "tom-high": s(8, 12), "tom-low": s(10, 14), ride: _(),
    },
  },
  {
    id: "hiphop-trans-heavy-1", name: "Cypher Break", genre: "hip-hop",
    intensity: "heavy", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 3, 6, 8, 11, 14), snare: s(2, 4, 7, 10, 12, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(7, 15),
      clap: s(4, 8, 12), "tom-high": s(10, 13), "tom-low": s(11, 14, 15), ride: _(),
    },
  },
  {
    id: "hiphop-trans-heavy-2", name: "Freestyle Fill", genre: "hip-hop",
    intensity: "heavy", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 3, 5, 8, 10, 14), snare: s(4, 6, 9, 12, 15),
      "hihat-closed": s(1, 3, 5, 7, 9, 11, 13, 15), "hihat-open": s(0, 4, 8, 12),
      clap: s(4, 12, 15), "tom-high": s(8, 10, 12), "tom-low": s(9, 11, 13, 14, 15), ride: _(),
    },
  },

  // ---- TRAP TRANSITION FILLS ----
  {
    id: "trap-trans-subtle-1", name: "Hat Roll", genre: "trap",
    intensity: "subtle", fillType: "short", category: "transition",
    pattern: {
      kick: s(0, 7, 10), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(14, 15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-trans-subtle-2", name: "808 Slide", genre: "trap",
    intensity: "subtle", fillType: "short", category: "transition",
    pattern: {
      kick: s(0, 7, 10, 14), snare: s(4, 12, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-trans-mod-1", name: "Triplet Storm", genre: "trap",
    intensity: "moderate", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 6, 8, 14), snare: s(4, 10, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12, 15), "tom-high": s(8, 10), "tom-low": s(12, 14), ride: _(),
    },
  },
  {
    id: "trap-trans-mod-2", name: "808 Drop", genre: "trap",
    intensity: "moderate", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 3, 6, 8, 10, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(1, 5, 9, 13),
      clap: s(4, 12, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-trans-heavy-1", name: "Drill Break", genre: "trap",
    intensity: "heavy", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 2, 4, 6, 8, 10, 12, 14), snare: s(1, 3, 5, 7, 9, 11, 13, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 8, 12, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-trans-heavy-2", name: "Lex Luger Fill", genre: "trap",
    intensity: "heavy", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 3, 6, 8, 11, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 8, 10, 12, 14, 15), "tom-high": s(6, 8, 10), "tom-low": s(12, 13, 14, 15), ride: _(),
    },
  },

  // ---- POP TRANSITION FILLS ----
  {
    id: "pop-trans-subtle-1", name: "Snare Lift", genre: "pop",
    intensity: "subtle", fillType: "short", category: "transition",
    pattern: {
      kick: s(0, 8), snare: s(4, 12, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-trans-subtle-2", name: "Hat Accent", genre: "pop",
    intensity: "subtle", fillType: "short", category: "transition",
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 13, 14, 15), "hihat-open": s(15),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-trans-mod-1", name: "Pop Tom Fill", genre: "pop",
    intensity: "moderate", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 8), snare: s(4, 10),
      "hihat-closed": s(0, 2, 4, 6), "hihat-open": _(),
      clap: s(15), "tom-high": s(8, 10, 12, 14), "tom-low": s(9, 11, 13, 15), ride: _(),
    },
  },
  {
    id: "pop-trans-mod-2", name: "Stadium Build", genre: "pop",
    intensity: "moderate", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 4, 8), snare: s(4, 10, 12, 13, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8), "hihat-open": s(15),
      clap: s(4, 12, 15), "tom-high": _(), "tom-low": _(), ride: s(0),
    },
  },
  {
    id: "pop-trans-heavy-1", name: "Anthem Fill", genre: "pop",
    intensity: "heavy", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 4, 8, 14, 15), snare: s(4, 8, 10, 12),
      "hihat-closed": _(), "hihat-open": s(0),
      clap: s(4, 8, 12, 15), "tom-high": s(10, 12, 14), "tom-low": s(11, 13, 15), ride: s(0),
    },
  },
  {
    id: "pop-trans-heavy-2", name: "Power Build", genre: "pop",
    intensity: "heavy", fillType: "full", category: "transition",
    pattern: {
      kick: s(0, 2, 4, 6, 8, 10, 12, 14), snare: s(1, 3, 5, 7, 9, 11, 13, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": _(),
      clap: s(4, 8, 12, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },

  // ====================================================================
  // RISING ENERGY FILLS - Build intensity, crescendo patterns
  // Start sparse → build to 16th note density toward the end
  // ====================================================================

  // ---- ROCK RISING ENERGY FILLS ----
  {
    id: "rock-rise-subtle-1", name: "Quarter Build", genre: "rock",
    intensity: "subtle", fillType: "short", category: "rising-energy",
    pattern: {
      kick: s(0, 8), snare: s(4, 10, 12, 14),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(15),
      clap: s(15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-rise-subtle-2", name: "Snare Crescendo", genre: "rock",
    intensity: "subtle", fillType: "short", category: "rising-energy",
    pattern: {
      kick: s(0, 8), snare: s(4, 12, 13, 14, 15),
      "hihat-closed": s(0, 4, 8), "hihat-open": _(),
      clap: s(15), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8),
    },
  },
  {
    id: "rock-rise-mod-1", name: "Accelerating Toms", genre: "rock",
    intensity: "moderate", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 4), snare: s(4),
      "hihat-closed": s(0, 4), "hihat-open": _(),
      clap: s(15), "tom-high": s(8, 10, 12, 13), "tom-low": s(9, 11, 14, 15), ride: _(),
    },
  },
  {
    id: "rock-rise-mod-2", name: "Snare-Tom Ramp", genre: "rock",
    intensity: "moderate", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 15), snare: s(4, 8, 10),
      "hihat-closed": s(0, 4), "hihat-open": _(),
      clap: s(15), "tom-high": s(12, 13), "tom-low": s(14, 15), ride: _(),
    },
  },
  {
    id: "rock-rise-heavy-1", name: "Full Crescendo", genre: "rock",
    intensity: "heavy", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 4, 14, 15), snare: s(2, 4, 6, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-closed": _(), "hihat-open": s(0),
      clap: s(15), "tom-high": s(4, 6, 8, 10), "tom-low": s(5, 7, 9, 11, 12, 13, 14, 15), ride: _(),
    },
  },
  {
    id: "rock-rise-heavy-2", name: "Thunder Roll", genre: "rock",
    intensity: "heavy", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 2, 4, 12, 14), snare: s(1, 3, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-closed": _(), "hihat-open": _(),
      clap: s(15), "tom-high": s(0, 2, 4, 6), "tom-low": s(8, 10, 12, 13, 14, 15), ride: s(0),
    },
  },

  // ---- HOUSE RISING ENERGY FILLS ----
  {
    id: "house-rise-subtle-1", name: "Filtered Lift", genre: "house",
    intensity: "subtle", fillType: "short", category: "rising-energy",
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 4, 8, 10, 12, 13, 14, 15), "hihat-open": s(15),
      clap: s(4, 12, 14, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-rise-subtle-2", name: "Clap Ramp", genre: "house",
    intensity: "subtle", fillType: "short", category: "rising-energy",
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": _(),
      clap: s(4, 8, 12, 13, 14, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-rise-mod-1", name: "Kick Build", genre: "house",
    intensity: "moderate", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 4, 8, 10, 12, 13, 14, 15), snare: s(14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(15),
      clap: s(4, 8, 12, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-rise-mod-2", name: "Percussion Swell", genre: "house",
    intensity: "moderate", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(15),
      clap: s(4, 8, 10, 12, 14, 15), "tom-high": s(12, 14), "tom-low": s(13, 15), ride: _(),
    },
  },
  {
    id: "house-rise-heavy-1", name: "Four-Floor Surge", genre: "house",
    intensity: "heavy", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 2, 4, 6, 8, 9, 10, 11, 12, 13, 14, 15), snare: s(12, 13, 14, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(15),
      clap: s(4, 8, 10, 12, 13, 14, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-rise-heavy-2", name: "Tribal Ascent", genre: "house",
    intensity: "heavy", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 4, 8, 12, 14), snare: s(10, 12, 13, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(15),
      clap: s(4, 8, 12, 15), "tom-high": s(6, 8, 10, 12), "tom-low": s(7, 9, 11, 13, 14, 15), ride: _(),
    },
  },

  // ---- ELECTRONIC RISING ENERGY FILLS ----
  {
    id: "elec-rise-subtle-1", name: "Stutter Lift", genre: "electronic",
    intensity: "subtle", fillType: "short", category: "rising-energy",
    pattern: {
      kick: s(0, 4, 8, 12, 14), snare: s(13, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 13, 14, 15), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-rise-subtle-2", name: "Synth Riser", genre: "electronic",
    intensity: "subtle", fillType: "short", category: "rising-energy",
    pattern: {
      kick: s(0, 4, 8, 10, 12, 14), snare: _(),
      "hihat-closed": s(0, 4, 8, 12, 13, 14, 15), "hihat-open": s(15),
      clap: s(4, 12, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-rise-mod-1", name: "EDM Build", genre: "electronic",
    intensity: "moderate", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 4, 8, 10, 12, 13, 14, 15), snare: s(4, 8, 12, 13, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(4, 8, 12, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-rise-mod-2", name: "Tension Ramp", genre: "electronic",
    intensity: "moderate", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(8, 10, 12, 13, 14, 15),
      "hihat-closed": s(0, 4, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(15),
      clap: s(4, 12, 14, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-rise-heavy-1", name: "Drop Countdown", genre: "electronic",
    intensity: "heavy", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 2, 4, 6, 8, 9, 10, 11, 12, 13, 14, 15), snare: s(4, 6, 8, 10, 11, 12, 13, 14, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": _(),
      clap: s(4, 8, 12, 13, 14, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-rise-heavy-2", name: "Maximum Riser", genre: "electronic",
    intensity: "heavy", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), snare: s(8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(15),
      clap: s(0, 4, 8, 12, 13, 14, 15), "tom-high": s(8, 10, 12), "tom-low": s(9, 11, 13, 14, 15), ride: _(),
    },
  },

  // ---- LO-FI RISING ENERGY FILLS ----
  {
    id: "lofi-rise-subtle-1", name: "Dusty Swell", genre: "lo-fi",
    intensity: "subtle", fillType: "short", category: "rising-energy",
    pattern: {
      kick: s(0, 3, 10, 14), snare: s(4, 12, 14, 15),
      "hihat-closed": s(0, 4, 8, 12, 14), "hihat-open": s(15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "lofi-rise-subtle-2", name: "Tape Warmup", genre: "lo-fi",
    intensity: "subtle", fillType: "short", category: "rising-energy",
    pattern: {
      kick: s(0, 3, 8, 12), snare: s(4, 12, 13, 15),
      "hihat-closed": s(0, 3, 6, 8, 11, 14), "hihat-open": s(15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 3, 6, 8, 11, 14),
    },
  },
  {
    id: "lofi-rise-mod-1", name: "Vinyl Build", genre: "lo-fi",
    intensity: "moderate", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 3, 10, 14), snare: s(4, 8, 12, 14, 15),
      "hihat-closed": s(0, 3, 6, 8, 10, 12, 14), "hihat-open": s(15),
      clap: s(12, 15), "tom-high": s(10, 12), "tom-low": s(14, 15), ride: s(0, 4),
    },
  },
  {
    id: "lofi-rise-mod-2", name: "Jazz Swell", genre: "lo-fi",
    intensity: "moderate", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 6, 10, 14), snare: s(4, 8, 10, 12, 15),
      "hihat-closed": s(0, 3, 6, 8, 11, 14), "hihat-open": s(15),
      clap: _(), "tom-high": s(8, 12), "tom-low": s(14, 15), ride: s(0, 3, 6, 8, 11, 14),
    },
  },
  {
    id: "lofi-rise-heavy-1", name: "Boom Bap Surge", genre: "lo-fi",
    intensity: "heavy", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 3, 6, 8, 10, 12, 14), snare: s(4, 6, 8, 10, 12, 13, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(15),
      clap: s(4, 12, 15), "tom-high": s(8, 10, 12), "tom-low": s(13, 14, 15), ride: _(),
    },
  },
  {
    id: "lofi-rise-heavy-2", name: "Dusty Crescendo", genre: "lo-fi",
    intensity: "heavy", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 3, 6, 8, 10, 12, 14), snare: s(2, 4, 7, 9, 11, 13, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 13, 14, 15), "hihat-open": s(15),
      clap: s(4, 12), "tom-high": s(6, 8, 10), "tom-low": s(12, 13, 14, 15), ride: s(0),
    },
  },

  // ---- HIP-HOP RISING ENERGY FILLS ----
  {
    id: "hiphop-rise-subtle-1", name: "Snare Ramp", genre: "hip-hop",
    intensity: "subtle", fillType: "short", category: "rising-energy",
    pattern: {
      kick: s(0, 3, 8, 14), snare: s(4, 12, 13, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-rise-subtle-2", name: "Hat Ramp", genre: "hip-hop",
    intensity: "subtle", fillType: "short", category: "rising-energy",
    pattern: {
      kick: s(0, 3, 8), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 11, 12, 13, 14, 15), "hihat-open": s(15),
      clap: s(4, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-rise-mod-1", name: "Boom Build", genre: "hip-hop",
    intensity: "moderate", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 3, 6, 8, 12, 14), snare: s(4, 8, 10, 12, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(15),
      clap: s(4, 12, 15), "tom-high": s(10, 12), "tom-low": s(14, 15), ride: _(),
    },
  },
  {
    id: "hiphop-rise-mod-2", name: "Scratch Riser", genre: "hip-hop",
    intensity: "moderate", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 3, 8, 11, 14), snare: s(4, 10, 12, 13, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(15),
      clap: s(4, 12, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-rise-heavy-1", name: "Cypher Surge", genre: "hip-hop",
    intensity: "heavy", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 3, 6, 8, 10, 12, 14), snare: s(2, 4, 6, 8, 10, 11, 12, 13, 14, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(15),
      clap: s(4, 8, 12, 15), "tom-high": s(8, 10, 12), "tom-low": s(13, 14, 15), ride: _(),
    },
  },
  {
    id: "hiphop-rise-heavy-2", name: "Full Court Press", genre: "hip-hop",
    intensity: "heavy", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 3, 5, 8, 10, 12, 14), snare: s(4, 6, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 13, 14, 15), "hihat-open": s(15),
      clap: s(4, 12, 14, 15), "tom-high": s(8, 10), "tom-low": s(12, 13, 14, 15), ride: _(),
    },
  },

  // ---- TRAP RISING ENERGY FILLS ----
  {
    id: "trap-rise-subtle-1", name: "808 Ramp", genre: "trap",
    intensity: "subtle", fillType: "short", category: "rising-energy",
    pattern: {
      kick: s(0, 7, 10, 12, 14), snare: s(4, 12, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(15),
      clap: s(4, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-rise-subtle-2", name: "Hat Acceleration", genre: "trap",
    intensity: "subtle", fillType: "short", category: "rising-energy",
    pattern: {
      kick: s(0, 7, 10), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(14, 15),
      clap: s(4, 12, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-rise-mod-1", name: "808 Surge", genre: "trap",
    intensity: "moderate", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 6, 8, 10, 12, 13, 14, 15), snare: s(4, 10, 12, 14),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(3, 7, 15),
      clap: s(4, 12, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-rise-mod-2", name: "Triplet Riser", genre: "trap",
    intensity: "moderate", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 3, 6, 8, 10, 12, 14), snare: s(4, 12, 14, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(11, 15),
      clap: s(4, 12, 15), "tom-high": s(8, 10), "tom-low": s(12, 14), ride: _(),
    },
  },
  {
    id: "trap-rise-heavy-1", name: "Drill Surge", genre: "trap",
    intensity: "heavy", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 2, 4, 6, 8, 10, 11, 12, 13, 14, 15), snare: s(1, 3, 5, 7, 9, 11, 13, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 8, 12, 14, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-rise-heavy-2", name: "Maximum 808", genre: "trap",
    intensity: "heavy", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), snare: s(4, 8, 12, 13, 14, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 8, 10, 12, 14, 15), "tom-high": s(6, 8, 10), "tom-low": s(12, 13, 14, 15), ride: _(),
    },
  },

  // ---- POP RISING ENERGY FILLS ----
  {
    id: "pop-rise-subtle-1", name: "Gentle Lift", genre: "pop",
    intensity: "subtle", fillType: "short", category: "rising-energy",
    pattern: {
      kick: s(0, 8, 14), snare: s(4, 12, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(15),
      clap: s(4, 12, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-rise-subtle-2", name: "Clap Build", genre: "pop",
    intensity: "subtle", fillType: "short", category: "rising-energy",
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(4, 12, 13, 14, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-rise-mod-1", name: "Stadium Swell", genre: "pop",
    intensity: "moderate", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 4, 8, 12, 14), snare: s(4, 8, 10, 12, 13, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(15),
      clap: s(4, 8, 12, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-rise-mod-2", name: "Tom Ascent", genre: "pop",
    intensity: "moderate", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 8, 15), snare: s(4, 10),
      "hihat-closed": s(0, 2, 4, 6), "hihat-open": _(),
      clap: s(15), "tom-high": s(8, 10, 12, 13), "tom-low": s(9, 11, 14, 15), ride: _(),
    },
  },
  {
    id: "pop-rise-heavy-1", name: "Anthem Surge", genre: "pop",
    intensity: "heavy", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 4, 8, 10, 12, 13, 14, 15), snare: s(4, 8, 10, 11, 12, 13, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(15),
      clap: s(4, 8, 12, 14, 15), "tom-high": s(8, 10, 12), "tom-low": s(13, 14, 15), ride: _(),
    },
  },
  {
    id: "pop-rise-heavy-2", name: "Festival Build", genre: "pop",
    intensity: "heavy", fillType: "full", category: "rising-energy",
    pattern: {
      kick: s(0, 2, 4, 6, 8, 10, 12, 13, 14, 15), snare: s(1, 3, 5, 7, 9, 11, 13, 14, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(15),
      clap: s(4, 8, 12, 15), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },

  // ====================================================================
  // SIGNATURE "VINTAGE MACHINE" FILLS - Classic drum machine character
  // 808-style electronic fills, simple but satisfying patterns
  // ====================================================================

  // ---- ROCK SIGNATURE FILLS ----
  {
    id: "rock-sig-subtle-1", name: "Amen Lite", genre: "rock",
    intensity: "subtle", fillType: "short", category: "signature",
    pattern: {
      kick: s(0, 4, 10), snare: s(4, 6, 10, 14, 15),
      "hihat-closed": s(0, 2, 8, 12), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "rock-sig-subtle-2", name: "Classic Break", genre: "rock",
    intensity: "subtle", fillType: "short", category: "signature",
    pattern: {
      kick: s(0, 8, 10), snare: s(4, 12, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": s(14), "tom-low": s(15), ride: _(),
    },
  },
  {
    id: "rock-sig-mod-1", name: "Amen Roll", genre: "rock",
    intensity: "moderate", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 4, 10), snare: s(4, 6, 10, 14, 15),
      "hihat-closed": s(0, 8), "hihat-open": s(2, 6, 10, 14),
      clap: s(15), "tom-high": s(12, 13), "tom-low": s(14, 15), ride: _(),
    },
  },
  {
    id: "rock-sig-mod-2", name: "Funky Drummer", genre: "rock",
    intensity: "moderate", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 3, 6, 10), snare: s(4, 7, 12, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 11),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-sig-heavy-1", name: "Full Amen", genre: "rock",
    intensity: "heavy", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 4, 6, 10, 12), snare: s(2, 4, 6, 9, 10, 14, 15),
      "hihat-closed": _(), "hihat-open": s(0, 2, 6, 8, 10, 14),
      clap: s(15), "tom-high": s(8, 12), "tom-low": s(13, 14, 15), ride: _(),
    },
  },
  {
    id: "rock-sig-heavy-2", name: "Impeach the Pres", genre: "rock",
    intensity: "heavy", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 3, 6, 8, 11, 14), snare: s(4, 7, 9, 12, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },

  // ---- HOUSE SIGNATURE FILLS ----
  {
    id: "house-sig-subtle-1", name: "909 Clap", genre: "house",
    intensity: "subtle", fillType: "short", category: "signature",
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": _(),
      clap: s(4, 12, 14, 15), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "house-sig-subtle-2", name: "Cowbell Groove", genre: "house",
    intensity: "subtle", fillType: "short", category: "signature",
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 11),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(2, 6, 10, 14),
    },
  },
  {
    id: "house-sig-mod-1", name: "909 Tom Pattern", genre: "house",
    intensity: "moderate", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": s(3, 11),
      clap: s(4, 12), "tom-high": s(8, 10, 12), "tom-low": s(9, 11, 14, 15), ride: _(),
    },
  },
  {
    id: "house-sig-mod-2", name: "Latin Machine", genre: "house",
    intensity: "moderate", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 3, 4, 6, 8, 10, 12, 14), "hihat-open": s(7, 15),
      clap: s(4, 12), "tom-high": s(3, 6, 10), "tom-low": s(7, 14), ride: s(0, 8),
    },
  },
  {
    id: "house-sig-heavy-1", name: "Full 909", genre: "house",
    intensity: "heavy", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(12, 14),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 8, 12, 14, 15), "tom-high": s(6, 10, 14), "tom-low": s(7, 11, 15), ride: _(),
    },
  },
  {
    id: "house-sig-heavy-2", name: "Machine Gun", genre: "house",
    intensity: "heavy", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(2, 6, 10, 14),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": _(),
      clap: s(4, 8, 12, 15), "tom-high": s(1, 5, 9, 13), "tom-low": s(3, 7, 11, 15), ride: _(),
    },
  },

  // ---- ELECTRONIC SIGNATURE FILLS ----
  {
    id: "elec-sig-subtle-1", name: "808 Clave", genre: "electronic",
    intensity: "subtle", fillType: "short", category: "signature",
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 3, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(4, 12), "tom-high": s(3, 10), "tom-low": _(), ride: s(6, 14),
    },
  },
  {
    id: "elec-sig-subtle-2", name: "Kraftwerk Pulse", genre: "electronic",
    intensity: "subtle", fillType: "short", category: "signature",
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "elec-sig-mod-1", name: "808 State", genre: "electronic",
    intensity: "moderate", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 3, 8, 11), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(3, 6, 11), "tom-low": s(7, 14, 15), ride: _(),
    },
  },
  {
    id: "elec-sig-mod-2", name: "TB-303 Groove", genre: "electronic",
    intensity: "moderate", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 6, 8, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": _(),
      clap: s(4, 12), "tom-high": s(6, 10), "tom-low": s(14, 15), ride: _(),
    },
  },
  {
    id: "elec-sig-heavy-1", name: "Acid Machine", genre: "electronic",
    intensity: "heavy", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 3, 6, 8, 11, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 8, 12, 15), "tom-high": s(2, 6, 10, 14), "tom-low": s(3, 7, 11, 15), ride: _(),
    },
  },
  {
    id: "elec-sig-heavy-2", name: "Roland Legacy", genre: "electronic",
    intensity: "heavy", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 4, 6, 8, 12, 14), snare: s(2, 4, 10, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(6, 14),
      clap: s(4, 8, 12), "tom-high": s(1, 5, 9, 13), "tom-low": s(3, 7, 11, 15), ride: _(),
    },
  },

  // ---- LO-FI SIGNATURE FILLS ----
  {
    id: "lofi-sig-subtle-1", name: "SP-1200 Tap", genre: "lo-fi",
    intensity: "subtle", fillType: "short", category: "signature",
    pattern: {
      kick: s(0, 3, 10), snare: s(4, 7, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 3, 6, 8, 11, 14),
    },
  },
  {
    id: "lofi-sig-subtle-2", name: "MPC Groove", genre: "lo-fi",
    intensity: "subtle", fillType: "short", category: "signature",
    pattern: {
      kick: s(0, 3, 6, 10), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(7, 15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "lofi-sig-mod-1", name: "SP-12 Pattern", genre: "lo-fi",
    intensity: "moderate", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 3, 6, 10), snare: s(4, 7, 12, 15),
      "hihat-closed": s(0, 3, 6, 8, 11, 14), "hihat-open": s(7, 15),
      clap: _(), "tom-high": s(10, 14), "tom-low": s(11, 15), ride: s(0, 4, 8),
    },
  },
  {
    id: "lofi-sig-mod-2", name: "Cassette Fill", genre: "lo-fi",
    intensity: "moderate", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 6, 10, 14), snare: s(4, 8, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 11),
      clap: _(), "tom-high": s(6, 12), "tom-low": s(14, 15), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "lofi-sig-heavy-1", name: "Vintage Sampler", genre: "lo-fi",
    intensity: "heavy", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 3, 6, 8, 10, 14), snare: s(4, 7, 9, 12, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12), "tom-high": s(6, 10, 14), "tom-low": s(8, 11, 15), ride: _(),
    },
  },
  {
    id: "lofi-sig-heavy-2", name: "Chopped Breakbeat", genre: "lo-fi",
    intensity: "heavy", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 4, 6, 10, 12), snare: s(2, 4, 6, 9, 12, 15),
      "hihat-closed": s(0, 3, 6, 8, 11, 14), "hihat-open": s(7, 15),
      clap: s(4, 12), "tom-high": s(8, 10), "tom-low": s(13, 14, 15), ride: _(),
    },
  },

  // ---- HIP-HOP SIGNATURE FILLS ----
  {
    id: "hiphop-sig-subtle-1", name: "Boom Bap Classic", genre: "hip-hop",
    intensity: "subtle", fillType: "short", category: "signature",
    pattern: {
      kick: s(0, 3, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-sig-subtle-2", name: "MPC Chop", genre: "hip-hop",
    intensity: "subtle", fillType: "short", category: "signature",
    pattern: {
      kick: s(0, 3, 6, 10), snare: s(4, 12, 15),
      "hihat-closed": s(0, 2, 4, 8, 10, 12, 14), "hihat-open": s(6),
      clap: s(4), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-sig-mod-1", name: "DJ Premier Break", genre: "hip-hop",
    intensity: "moderate", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 3, 6, 10), snare: s(4, 7, 12, 14),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 7, 11),
      clap: s(4, 12), "tom-high": s(10), "tom-low": s(14, 15), ride: _(),
    },
  },
  {
    id: "hiphop-sig-mod-2", name: "Pete Rock Flip", genre: "hip-hop",
    intensity: "moderate", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 3, 8, 11), snare: s(4, 10, 12, 15),
      "hihat-closed": s(0, 3, 6, 8, 11, 14), "hihat-open": s(7, 15),
      clap: s(4, 12), "tom-high": s(6, 14), "tom-low": s(10, 15), ride: _(),
    },
  },
  {
    id: "hiphop-sig-heavy-1", name: "Breakbeat Science", genre: "hip-hop",
    intensity: "heavy", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 4, 6, 10, 12), snare: s(2, 4, 7, 10, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 8, 12), "tom-high": s(6, 10, 14), "tom-low": s(8, 12, 15), ride: _(),
    },
  },
  {
    id: "hiphop-sig-heavy-2", name: "Golden Era Break", genre: "hip-hop",
    intensity: "heavy", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 3, 6, 8, 11, 14), snare: s(4, 7, 9, 12, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12, 15), "tom-high": s(8, 10), "tom-low": s(13, 14, 15), ride: _(),
    },
  },

  // ---- TRAP SIGNATURE FILLS ----
  {
    id: "trap-sig-subtle-1", name: "808 Classic", genre: "trap",
    intensity: "subtle", fillType: "short", category: "signature",
    pattern: {
      kick: s(0, 7, 10, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-sig-subtle-2", name: "Metro Pattern", genre: "trap",
    intensity: "subtle", fillType: "short", category: "signature",
    pattern: {
      kick: s(0, 3, 7, 10), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-sig-mod-1", name: "808 Mafia", genre: "trap",
    intensity: "moderate", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 3, 7, 8, 10, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12, 15), "tom-high": s(8, 10), "tom-low": s(14, 15), ride: _(),
    },
  },
  {
    id: "trap-sig-mod-2", name: "Zaytoven Bounce", genre: "trap",
    intensity: "moderate", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 6, 8, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(3, 10), "tom-low": s(6, 14), ride: _(),
    },
  },
  {
    id: "trap-sig-heavy-1", name: "Southside 808", genre: "trap",
    intensity: "heavy", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 3, 6, 8, 10, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 8, 12, 15), "tom-high": s(6, 10, 14), "tom-low": s(7, 11, 15), ride: _(),
    },
  },
  {
    id: "trap-sig-heavy-2", name: "ATL Machine", genre: "trap",
    intensity: "heavy", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 3, 5, 7, 8, 10, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(1, 5, 9, 13),
      clap: s(4, 8, 10, 12, 14, 15), "tom-high": s(6, 8), "tom-low": s(13, 14, 15), ride: _(),
    },
  },

  // ---- POP SIGNATURE FILLS ----
  {
    id: "pop-sig-subtle-1", name: "Linn Classic", genre: "pop",
    intensity: "subtle", fillType: "short", category: "signature",
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(4, 12), "tom-high": s(14), "tom-low": s(15), ride: _(),
    },
  },
  {
    id: "pop-sig-subtle-2", name: "LM-1 Pattern", genre: "pop",
    intensity: "subtle", fillType: "short", category: "signature",
    pattern: {
      kick: s(0, 6, 8), snare: s(4, 12, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "pop-sig-mod-1", name: "80s Machine Fill", genre: "pop",
    intensity: "moderate", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12, 15), "tom-high": s(8, 10, 12, 14), "tom-low": s(9, 11, 13, 15), ride: _(),
    },
  },
  {
    id: "pop-sig-mod-2", name: "Gated Reverb", genre: "pop",
    intensity: "moderate", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 8, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(4, 8, 12, 15), "tom-high": s(10, 14), "tom-low": s(11, 15), ride: s(0),
    },
  },
  {
    id: "pop-sig-heavy-1", name: "Phil Collins Fill", genre: "pop",
    intensity: "heavy", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 6, 8, 10, 12, 14),
      "hihat-closed": _(), "hihat-open": s(0),
      clap: s(4, 8, 12, 15), "tom-high": s(6, 8, 10, 12), "tom-low": s(7, 9, 13, 14, 15), ride: _(),
    },
  },
  {
    id: "pop-sig-heavy-2", name: "Synth Pop Blast", genre: "pop",
    intensity: "heavy", fillType: "full", category: "signature",
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(2, 4, 6, 8, 10, 12, 14),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": _(),
      clap: s(4, 8, 12, 15), "tom-high": s(1, 5, 9, 13), "tom-low": s(3, 7, 11, 15), ride: _(),
    },
  },
];

// =====================================================================
// FILL SELECTION
// =====================================================================

/** Get all fills for a genre */
export function getGenreFills(genre: Genre): FillPattern[] {
  return FILL_LIBRARY.filter((f) => f.genre === genre);
}

/** Get fills by genre and intensity */
export function getFillsByIntensity(genre: Genre, intensity: FillIntensity): FillPattern[] {
  return FILL_LIBRARY.filter((f) => f.genre === genre && f.intensity === intensity);
}

/** Get fills by genre, intensity, and category */
export function getFillsByCategory(
  genre: Genre,
  intensity: FillIntensity,
  category: FillCategory,
): FillPattern[] {
  return FILL_LIBRARY.filter(
    (f) => f.genre === genre && f.intensity === intensity && f.category === category,
  );
}

/** Get a random fill for a genre at the given intensity */
export function getRandomFill(genre: Genre, intensity: FillIntensity): FillPattern {
  const fills = getFillsByIntensity(genre, intensity);
  if (fills.length === 0) {
    const genreFills = getGenreFills(genre);
    return genreFills[Math.floor(Math.random() * genreFills.length)];
  }
  return fills[Math.floor(Math.random() * fills.length)];
}

/** Get a random fill filtered by category */
export function getRandomFillByCategory(
  genre: Genre,
  intensity: FillIntensity,
  category: FillCategory,
): FillPattern {
  const fills = getFillsByCategory(genre, intensity, category);
  if (fills.length === 0) {
    // Fallback: any fill for this genre and category
    const genreCatFills = FILL_LIBRARY.filter((f) => f.genre === genre && f.category === category);
    if (genreCatFills.length > 0) {
      return genreCatFills[Math.floor(Math.random() * genreCatFills.length)];
    }
    // Final fallback: any fill for this genre
    return getRandomFill(genre, intensity);
  }
  return fills[Math.floor(Math.random() * fills.length)];
}

/**
 * Get the recommended fill category based on song part and emotion context.
 * Used for smart fill selection when no category is explicitly chosen.
 */
export function getContextualCategory(
  songPart?: SongPart | null,
  emotion?: Emotion | null,
): FillCategory {
  // Emotion takes priority over song part for category selection
  if (emotion) {
    switch (emotion) {
      case "aggressive":
        return "rising-energy";
      case "calm":
      case "romantic":
        return "transition";
      case "happy":
      case "anxious":
        return "signature";
      case "sad":
        return "transition";
      default:
        break;
    }
  }

  // Song part-based selection
  if (songPart) {
    switch (songPart) {
      case "intro":
      case "outro":
        return "transition";
      case "verse":
        return "transition";
      case "chorus":
        return "rising-energy";
      case "bridge":
        return "signature";
      default:
        break;
    }
  }

  // Default: random category
  const categories: FillCategory[] = ["transition", "rising-energy", "signature"];
  return categories[Math.floor(Math.random() * categories.length)];
}

// =====================================================================
// SMART FILL GENERATION (category-aware)
// =====================================================================

/**
 * Algorithmically generate a fill that complements the given pattern.
 * Now supports category-specific generation algorithms.
 */
export function generateSmartFill(
  currentPattern: DrumPattern,
  intensity: FillIntensity,
  patternLength: number = 16,
  category?: FillCategory,
): DrumPattern {
  // Dispatch to category-specific generator if provided
  if (category === "rising-energy") {
    return generateRisingEnergyFill(currentPattern, intensity, patternLength);
  }
  if (category === "signature") {
    return generateSignatureFill(intensity, patternLength);
  }
  // Default / transition: use the original smart fill algorithm
  return generateTransitionFill(currentPattern, intensity, patternLength);
}

/**
 * Transition fill: smooth, tasteful section changes.
 * Maintains groove structure, adds subtle variation at the end.
 */
function generateTransitionFill(
  currentPattern: DrumPattern,
  intensity: FillIntensity,
  patternLength: number,
): DrumPattern {
  const fill: DrumPattern = {};

  const density: Record<string, number> = {};
  for (const inst of INSTRUMENTS) {
    const steps = currentPattern[inst.id] || [];
    density[inst.id] = steps.filter(Boolean).length / patternLength;
  }

  // Transition fills start late - keep most of the groove intact
  const fillStart = intensity === "subtle" ? 12 : intensity === "moderate" ? 8 : 4;

  for (const inst of INSTRUMENTS) {
    const steps = Array(patternLength).fill(false) as boolean[];
    const original = currentPattern[inst.id] || [];

    // Copy original pattern up to fill start
    for (let i = 0; i < fillStart && i < patternLength; i++) {
      steps[i] = original[i] || false;
    }

    const id = inst.id;

    if (id === "kick") {
      if (fillStart <= 0) steps[0] = true;
      if (fillStart <= 8) steps[8] = true;
      if (intensity === "heavy") {
        for (let i = Math.max(fillStart, 12); i < patternLength; i += 2) {
          steps[i] = true;
        }
      }
      steps[patternLength - 1] = intensity === "heavy";
    } else if (id === "snare") {
      if (intensity === "subtle") {
        if (fillStart <= 4) steps[4] = true;
        steps[patternLength - 2] = true;
        steps[patternLength - 1] = true;
      } else if (intensity === "moderate") {
        for (let i = fillStart; i < patternLength; i += 2) {
          steps[i] = true;
        }
      } else {
        for (let i = fillStart; i < patternLength; i++) {
          steps[i] = Math.random() > 0.3;
        }
      }
    } else if (id === "hihat-closed") {
      if (intensity === "subtle") {
        for (let i = 0; i < patternLength; i += 2) steps[i] = true;
      } else if (intensity === "moderate") {
        for (let i = 0; i < fillStart; i += 2) steps[i] = true;
      }
    } else if (id === "hihat-open") {
      if (intensity === "subtle") {
        steps[patternLength - 1] = true;
      }
    } else if (id === "clap") {
      steps[patternLength - 1] = true;
      if (intensity !== "subtle" && fillStart <= 12) {
        steps[12] = true;
      }
    } else if (id === "tom-high") {
      if (intensity !== "subtle") {
        const tomStart = intensity === "heavy" ? fillStart : fillStart + 4;
        for (let i = tomStart; i < patternLength - 2; i += 2) {
          if (i < patternLength * 0.75) steps[i] = true;
        }
      }
    } else if (id === "tom-low") {
      if (intensity !== "subtle") {
        const tomStart = intensity === "heavy" ? fillStart + 1 : fillStart + 5;
        for (let i = tomStart; i < patternLength; i += 2) {
          if (i >= patternLength * 0.75) steps[i] = true;
        }
      }
    } else if (id === "ride") {
      steps[0] = density.ride > 0.1;
    }

    fill[inst.id] = steps;
  }

  return fill;
}

/**
 * Rising energy fill: builds from sparse to dense.
 * Starts with quarter notes and accelerates to 16th notes.
 */
function generateRisingEnergyFill(
  currentPattern: DrumPattern,
  intensity: FillIntensity,
  patternLength: number,
): DrumPattern {
  const fill: DrumPattern = {};

  // Rising energy: progressive density increase across the bar
  const fillStart = intensity === "subtle" ? 8 : intensity === "moderate" ? 4 : 0;

  for (const inst of INSTRUMENTS) {
    const steps = Array(patternLength).fill(false) as boolean[];
    const original = currentPattern[inst.id] || [];
    const id = inst.id;

    // Copy original before fill start
    for (let i = 0; i < fillStart && i < patternLength; i++) {
      steps[i] = original[i] || false;
    }

    if (id === "kick") {
      // Kick accelerates: quarter → 8th → 16th
      if (fillStart <= 0) steps[0] = true;
      if (fillStart <= 4) steps[4] = true;
      if (fillStart <= 8) steps[8] = true;
      if (intensity !== "subtle") {
        steps[10] = true;
        steps[12] = true;
      }
      if (intensity === "heavy") {
        steps[13] = true;
        steps[14] = true;
        steps[15] = true;
      }
    } else if (id === "snare") {
      // Snare: sparse → rapid roll
      if (intensity === "subtle") {
        steps[patternLength - 4] = true;
        steps[patternLength - 2] = true;
        steps[patternLength - 1] = true;
      } else if (intensity === "moderate") {
        // 8th notes in middle, 16ths at end
        for (let i = fillStart; i < patternLength - 4; i += 2) steps[i] = true;
        for (let i = patternLength - 4; i < patternLength; i++) steps[i] = true;
      } else {
        // Quarter → 8th → 16th
        for (let i = fillStart; i < 8; i += 4) steps[i] = true;
        for (let i = 8; i < 12; i += 2) steps[i] = true;
        for (let i = 12; i < patternLength; i++) steps[i] = true;
      }
    } else if (id === "hihat-closed") {
      // Hats: sparse early, dense late
      if (intensity === "subtle") {
        for (let i = 0; i < patternLength; i += 4) steps[i] = true;
        for (let i = patternLength - 4; i < patternLength; i += 2) steps[i] = true;
      } else if (intensity === "moderate") {
        for (let i = 0; i < 8; i += 4) steps[i] = true;
        for (let i = 8; i < 12; i += 2) steps[i] = true;
        for (let i = 12; i < patternLength; i++) steps[i] = true;
      } else {
        for (let i = 0; i < patternLength; i++) steps[i] = true;
      }
    } else if (id === "hihat-open") {
      steps[patternLength - 1] = true; // Crash at end for resolution
    } else if (id === "clap") {
      steps[patternLength - 1] = true;
      if (intensity === "heavy") {
        steps[patternLength - 2] = true;
        steps[patternLength - 3] = true;
      }
    } else if (id === "tom-high") {
      if (intensity !== "subtle") {
        // Toms enter in the middle section
        const tomStart = intensity === "heavy" ? fillStart + 2 : Math.max(fillStart, 8);
        for (let i = tomStart; i < patternLength - 3; i += 2) steps[i] = true;
      }
    } else if (id === "tom-low") {
      if (intensity !== "subtle") {
        // Low toms take over in the final quarter
        for (let i = patternLength - 4; i < patternLength; i += 2) steps[i] = true;
      }
    } else if (id === "ride") {
      steps[0] = true; // Crash cymbal at start
    }

    fill[inst.id] = steps;
  }

  return fill;
}

/**
 * Signature "vintage machine" fill: classic 808/909 patterns.
 * Simple but satisfying - emphasizes the drum machine aesthetic.
 */
function generateSignatureFill(
  intensity: FillIntensity,
  patternLength: number,
): DrumPattern {
  const fill: DrumPattern = {};

  // Classic drum machine patterns - structured, mechanical, rhythmic
  for (const inst of INSTRUMENTS) {
    const steps = Array(patternLength).fill(false) as boolean[];
    const id = inst.id;

    if (id === "kick") {
      // Classic 808 kick patterns
      steps[0] = true;
      if (intensity !== "subtle") {
        steps[3] = true;
        steps[6] = true;
      }
      steps[8] = true;
      if (intensity === "heavy") {
        steps[10] = true;
        steps[12] = true;
        steps[14] = true;
      }
    } else if (id === "snare") {
      // Machine-precise snare
      steps[4] = true;
      steps[12] = true;
      if (intensity !== "subtle") {
        steps[7] = true; // Syncopated ghost note
      }
      if (intensity === "heavy") {
        steps[14] = true;
        steps[15] = true;
      }
    } else if (id === "hihat-closed") {
      // Mechanical hi-hat pattern
      if (intensity === "subtle") {
        for (let i = 0; i < patternLength; i += 2) steps[i] = true;
      } else {
        for (let i = 0; i < patternLength; i++) steps[i] = true;
      }
    } else if (id === "hihat-open") {
      // Programmed open hat accents
      if (intensity !== "subtle") {
        steps[6] = true;
        steps[14] = true;
      }
    } else if (id === "clap") {
      // Classic clap on 2 and 4
      steps[4] = true;
      steps[12] = true;
      if (intensity === "heavy") steps[15] = true;
    } else if (id === "tom-high") {
      // Machine tom accents (clave-like)
      if (intensity !== "subtle") {
        steps[3] = true;
        steps[10] = true;
      }
      if (intensity === "heavy") {
        steps[6] = true;
        steps[14] = true;
      }
    } else if (id === "tom-low") {
      // Low tom on offbeats
      if (intensity === "heavy") {
        steps[7] = true;
        steps[11] = true;
        steps[15] = true;
      }
    } else if (id === "ride") {
      // Cowbell/ride pattern (clave)
      if (intensity !== "subtle") {
        steps[0] = true;
        steps[3] = true;
        steps[6] = true;
        steps[10] = true;
      }
    }

    fill[inst.id] = steps;
  }

  return fill;
}

// =====================================================================
// A/B PATTERN VARIATION GENERATION
// =====================================================================

/**
 * Generate a subtle variation of the given pattern.
 * Adds/removes ghost notes, shifts some hits, or changes accent patterns.
 */
export function generateVariation(
  basePattern: DrumPattern,
  patternLength: number = 16,
): DrumPattern {
  const variation: DrumPattern = {};

  for (const inst of INSTRUMENTS) {
    const original = basePattern[inst.id] || Array(patternLength).fill(false);
    const varied = [...original];

    const id = inst.id;

    if (id === "kick" || id === "snare") {
      const activeSteps = varied.reduce((acc, v, i) => (v ? [...acc, i] : acc), [] as number[]);
      if (activeSteps.length > 0 && Math.random() > 0.5) {
        const refStep = activeSteps[Math.floor(Math.random() * activeSteps.length)];
        const ghostStep = (refStep + (Math.random() > 0.5 ? 1 : -1) + patternLength) % patternLength;
        if (!varied[ghostStep]) {
          varied[ghostStep] = true;
        }
      } else if (activeSteps.length > 2 && Math.random() > 0.6) {
        const essentialBeats = id === "kick" ? [0, 8] : [4, 12];
        const removable = activeSteps.filter((s) => !essentialBeats.includes(s));
        if (removable.length > 0) {
          const removeIdx = removable[Math.floor(Math.random() * removable.length)];
          varied[removeIdx] = false;
        }
      }
    } else if (id === "hihat-closed" || id === "hihat-open") {
      for (let i = 0; i < patternLength; i++) {
        if (Math.random() > 0.85 && !varied[i]) {
          varied[i] = true;
        } else if (Math.random() > 0.9 && varied[i] && i % 4 !== 0) {
          varied[i] = false;
        }
      }
    } else {
      for (let i = 0; i < patternLength; i++) {
        if (Math.random() > 0.92) {
          varied[i] = !varied[i];
        }
      }
    }

    variation[inst.id] = varied;
  }

  return variation;
}

/** Count of fills per genre */
export function getFillCount(genre: Genre): number {
  return FILL_LIBRARY.filter((f) => f.genre === genre).length;
}

/** Count of fills per genre and category */
export function getCategoryFillCount(genre: Genre, category: FillCategory): number {
  return FILL_LIBRARY.filter((f) => f.genre === genre && f.category === category).length;
}

export { FILL_LIBRARY };
