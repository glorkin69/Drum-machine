// Expanded drum pattern library — 25+ unique patterns per genre
// Organized by genre → song part → variations with complexity metadata

import type { Genre, SongPart, DrumPattern } from "./drum-patterns";

// Helper: create a 16-step array from step indices
function s(...steps: number[]): boolean[] {
  const pattern = Array(16).fill(false) as boolean[];
  for (const step of steps) pattern[step] = true;
  return pattern;
}
const _ = (): boolean[] => Array(16).fill(false) as boolean[];

export interface PatternVariant {
  id: string;
  name: string;
  genre: Genre;
  songPart: SongPart;
  complexity: 1 | 2 | 3; // 1=simple, 2=medium, 3=advanced
  tags: string[]; // e.g. "syncopated", "ghost-notes", "half-time"
  bpmRange: [number, number]; // suggested BPM range
  pattern: DrumPattern;
}

// =====================================================================
// ROCK PATTERNS
// =====================================================================
const rockPatterns: PatternVariant[] = [
  // --- INTRO (4) ---
  {
    id: "rock-i1", name: "Minimal Start", genre: "rock", songPart: "intro",
    complexity: 1, tags: ["minimal", "kick-only", "DJ-friendly"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-i2", name: "Build-Up Intro", genre: "rock", songPart: "intro",
    complexity: 2, tags: ["build-up", "gradual", "anticipation"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": s(14, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-i3", name: "Drop Intro", genre: "rock", songPart: "intro",
    complexity: 2, tags: ["drop", "immediate", "full-energy"], bpmRange: [115, 135],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "rock-i4", name: "Ambient Intro", genre: "rock", songPart: "intro",
    complexity: 1, tags: ["ambient", "soft", "atmospheric"], bpmRange: [100, 120],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(4, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "rock-i5", name: "Reverse Cymbal Build", genre: "rock", songPart: "intro",
    complexity: 2, tags: ["reverse", "build", "cinematic"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(15),
      clap: _(), "tom-high": s(12, 14), "tom-low": s(13, 15), ride: s(12, 13, 14, 15),
    },
  },
  {
    id: "rock-i6", name: "Filtered Build", genre: "rock", songPart: "intro",
    complexity: 2, tags: ["filter", "sweep", "build"], bpmRange: [115, 130],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(0, 4, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(8, 10, 12, 14, 15),
    },
  },
  {
    id: "rock-i7", name: "Percussion Roll Intro", genre: "rock", songPart: "intro",
    complexity: 2, tags: ["percussion", "roll", "dynamic"], bpmRange: [110, 130],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": s(8, 9, 10, 11, 12, 13), "tom-low": s(14, 15), ride: _(),
    },
  },
  {
    id: "rock-i8", name: "Minimal Kick Build", genre: "rock", songPart: "intro",
    complexity: 1, tags: ["minimal", "sparse", "kick"], bpmRange: [100, 125],
    pattern: {
      kick: s(0, 12, 14), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // --- VERSE (8) ---
  {
    id: "rock-v1", name: "Standard Rock", genre: "rock", songPart: "verse",
    complexity: 1, tags: ["straight", "classic"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-v2", name: "Driving Rock", genre: "rock", songPart: "verse",
    complexity: 2, tags: ["driving", "kick-heavy"], bpmRange: [115, 135],
    pattern: {
      kick: s(0, 6, 8, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-v3", name: "Punk Rock", genre: "rock", songPart: "verse",
    complexity: 1, tags: ["fast", "punk", "straight"], bpmRange: [150, 180],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": _(), clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-v4", name: "Indie Shuffle", genre: "rock", songPart: "verse",
    complexity: 2, tags: ["shuffle", "syncopated"], bpmRange: [105, 125],
    pattern: {
      kick: s(0, 3, 8, 11), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "rock-v5", name: "Garage Rock", genre: "rock", songPart: "verse",
    complexity: 2, tags: ["loose", "garage"], bpmRange: [120, 140],
    pattern: {
      kick: s(0, 5, 8, 13), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-v6", name: "Power Ballad Verse", genre: "rock", songPart: "verse",
    complexity: 1, tags: ["ballad", "sparse"], bpmRange: [70, 90],
    pattern: {
      kick: s(0, 10), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  {
    id: "rock-v7", name: "Grunge Verse", genre: "rock", songPart: "verse",
    complexity: 2, tags: ["grunge", "heavy"], bpmRange: [100, 120],
    pattern: {
      kick: s(0, 3, 8, 10), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-v8", name: "Country Rock", genre: "rock", songPart: "verse",
    complexity: 2, tags: ["country", "train-beat"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 8), snare: s(2, 4, 10, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // --- CHORUS (8) ---
  {
    id: "rock-c1", name: "Rock Chorus", genre: "rock", songPart: "chorus",
    complexity: 2, tags: ["driving", "open-hats"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 3, 6, 8, 11), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "rock-c2", name: "Anthem Chorus", genre: "rock", songPart: "chorus",
    complexity: 2, tags: ["anthem", "big"], bpmRange: [115, 135],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": _(), "hihat-open": s(0, 2, 4, 6, 8, 10, 12, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "rock-c3", name: "Punk Chorus", genre: "rock", songPart: "chorus",
    complexity: 1, tags: ["fast", "punk", "relentless"], bpmRange: [150, 180],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(2, 4, 6, 8, 10, 12, 14),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": _(), clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-c4", name: "Stomp Chorus", genre: "rock", songPart: "chorus",
    complexity: 3, tags: ["syncopated", "heavy"], bpmRange: [105, 125],
    pattern: {
      kick: s(0, 2, 5, 8, 10, 13), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(2, 10),
      clap: s(4, 12), "tom-high": s(14), "tom-low": s(15), ride: _(),
    },
  },
  {
    id: "rock-c5", name: "Arena Rock", genre: "rock", songPart: "chorus",
    complexity: 2, tags: ["arena", "big-beat"], bpmRange: [115, 130],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": _(), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(),
      ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  {
    id: "rock-c6", name: "Power Ballad Chorus", genre: "rock", songPart: "chorus",
    complexity: 2, tags: ["ballad", "build"], bpmRange: [70, 90],
    pattern: {
      kick: s(0, 6, 8, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "rock-c7", name: "Grunge Chorus", genre: "rock", songPart: "chorus",
    complexity: 3, tags: ["grunge", "heavy", "aggressive"], bpmRange: [100, 120],
    pattern: {
      kick: s(0, 2, 5, 8, 10, 13), snare: s(4, 7, 12, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 11),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-c8", name: "Southern Rock Chorus", genre: "rock", songPart: "chorus",
    complexity: 3, tags: ["southern", "shuffle", "swing"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 3, 6, 8, 11, 14), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  // --- BRIDGE (9) ---
  {
    id: "rock-b1", name: "Half-Time Bridge", genre: "rock", songPart: "bridge",
    complexity: 2, tags: ["half-time", "toms"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 10), snare: s(8),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": s(12, 13), "tom-low": s(14, 15),
      ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  {
    id: "rock-b2", name: "Breakdown", genre: "rock", songPart: "bridge",
    complexity: 1, tags: ["sparse", "minimal"], bpmRange: [100, 130],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-b3", name: "Tom Groove Bridge", genre: "rock", songPart: "bridge",
    complexity: 3, tags: ["toms", "tribal"], bpmRange: [100, 120],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: s(4, 12), "tom-high": s(2, 6, 10, 14), "tom-low": s(0, 4, 8, 12),
      ride: _(),
    },
  },
  {
    id: "rock-b4", name: "Ride Texture Bridge", genre: "rock", songPart: "bridge",
    complexity: 1, tags: ["ride", "mellow"], bpmRange: [105, 125],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(),
      ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  {
    id: "rock-b5", name: "Build-Up Bridge", genre: "rock", songPart: "bridge",
    complexity: 3, tags: ["build", "crescendo"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 2, 4, 6, 8, 9, 10, 11, 12, 13, 14, 15), snare: s(8, 10, 12, 13, 14, 15),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": s(10, 12, 14), "tom-low": s(11, 13, 15), ride: _(),
    },
  },
  {
    id: "rock-b6", name: "Ambient Bridge", genre: "rock", songPart: "bridge",
    complexity: 1, tags: ["ambient", "sparse"], bpmRange: [90, 120],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": _(), "hihat-open": s(4, 12),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "rock-b7", name: "Syncopated Bridge", genre: "rock", songPart: "bridge",
    complexity: 3, tags: ["syncopated", "off-beat"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 3, 5, 8, 11, 13), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-b8", name: "March Bridge", genre: "rock", songPart: "bridge",
    complexity: 2, tags: ["march", "military"], bpmRange: [100, 120],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(2, 6, 10, 14),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-b9", name: "Dropping Bridge", genre: "rock", songPart: "bridge",
    complexity: 2, tags: ["drop", "tension"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 12), snare: s(4),
      "hihat-closed": s(0, 2, 4, 6), "hihat-open": s(8),
      clap: _(), "tom-high": s(10), "tom-low": s(14), ride: _(),
    },
  },
  // --- NEW VERSE VARIATIONS (3) ---
  {
    id: "rock-v9", name: "Post-Punk Verse", genre: "rock", songPart: "verse",
    complexity: 2, tags: ["post-punk", "driving", "angular"], bpmRange: [125, 145],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": s(3, 11), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-v10", name: "Blues Rock Shuffle", genre: "rock", songPart: "verse",
    complexity: 2, tags: ["blues", "shuffle", "swing"], bpmRange: [85, 105],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(3, 7, 11, 15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 3, 4, 8, 11, 12),
    },
  },
  {
    id: "rock-v11", name: "Math Rock", genre: "rock", songPart: "verse",
    complexity: 3, tags: ["math-rock", "complex", "odd-time"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 5, 8, 13), snare: s(4, 10),
      "hihat-closed": s(0, 2, 3, 5, 7, 8, 10, 11, 13, 15), "hihat-open": s(5, 13),
      clap: _(), "tom-high": s(7, 15), "tom-low": s(3, 11), ride: _(),
    },
  },
  // --- NEW CHORUS VARIATIONS (4) ---
  {
    id: "rock-c9", name: "Hard Rock Chorus", genre: "rock", songPart: "chorus",
    complexity: 2, tags: ["hard-rock", "heavy", "driving"], bpmRange: [115, 130],
    pattern: {
      kick: s(0, 3, 6, 8, 11, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "rock-c10", name: "Prog Rock Epic", genre: "rock", songPart: "chorus",
    complexity: 3, tags: ["progressive", "epic", "complex"], bpmRange: [105, 125],
    pattern: {
      kick: s(0, 5, 8, 11, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12), "tom-high": s(2, 6, 10, 14), "tom-low": s(3, 7, 11, 15), ride: _(),
    },
  },
  {
    id: "rock-c11", name: "Stoner Rock Groove", genre: "rock", songPart: "chorus",
    complexity: 2, tags: ["stoner", "heavy", "groove"], bpmRange: [80, 100],
    pattern: {
      kick: s(0, 6, 8, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "rock-c12", name: "Emo Anthem", genre: "rock", songPart: "chorus",
    complexity: 2, tags: ["emo", "emotional", "driving"], bpmRange: [140, 160],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": _(), "hihat-open": s(0, 2, 4, 6, 8, 10, 12, 14),
      clap: s(4, 12), "tom-high": s(15), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  // --- NEW BRIDGE VARIATIONS (3) ---
  {
    id: "rock-b10", name: "Acoustic Break", genre: "rock", songPart: "bridge",
    complexity: 1, tags: ["acoustic", "stripped", "minimal"], bpmRange: [100, 120],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  {
    id: "rock-b11", name: "Double Bass Build", genre: "rock", songPart: "bridge",
    complexity: 3, tags: ["metal", "double-bass", "intense"], bpmRange: [130, 160],
    pattern: {
      kick: s(0, 2, 4, 6, 8, 10, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": s(13, 14, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-b12", name: "Cymbal Swell", genre: "rock", songPart: "bridge",
    complexity: 2, tags: ["crescendo", "build", "cymbal"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 8, 12, 14), snare: s(4, 10, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6, 14),
      clap: s(12), "tom-high": s(11, 13, 15), "tom-low": s(10, 12, 14), ride: s(0, 4, 8, 12),
    },
  },
  // --- ADDITIONAL BRIDGE VARIATIONS (4) ---
  {
    id: "rock-b13", name: "Breakdown Bridge", genre: "rock", songPart: "bridge",
    complexity: 1, tags: ["breakdown", "simplified", "minimal"], bpmRange: [100, 130],
    pattern: {
      kick: s(0, 8), snare: s(12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-b14", name: "Intensity Build Bridge", genre: "rock", songPart: "bridge",
    complexity: 2, tags: ["build", "intensity", "crescendo"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 4, 8, 10, 12, 14), snare: s(4, 8, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(14),
      clap: s(12), "tom-high": s(13, 14, 15), "tom-low": s(10, 11, 12), ride: _(),
    },
  },
  {
    id: "rock-b15", name: "Rhythmic Shift Bridge", genre: "rock", songPart: "bridge",
    complexity: 3, tags: ["rhythmic-shift", "odd-time", "experimental"], bpmRange: [105, 125],
    pattern: {
      kick: s(0, 3, 5, 8, 11, 13), snare: s(5, 13),
      "hihat-closed": s(0, 3, 5, 8, 11, 13), "hihat-open": s(2, 10),
      clap: _(), "tom-high": s(3, 11), "tom-low": s(5, 13), ride: _(),
    },
  },
  {
    id: "rock-b16", name: "Ride Solo Bridge", genre: "rock", songPart: "bridge",
    complexity: 1, tags: ["solo", "ride-focus", "atmospheric"], bpmRange: [100, 120],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  {
    id: "rock-b17", name: "Double-Time Intensity", genre: "rock", songPart: "bridge",
    complexity: 3, tags: ["double-time", "intense", "fast"], bpmRange: [120, 140],
    pattern: {
      kick: s(0, 2, 4, 6, 8, 10, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(7, 15), clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-b18", name: "Percussion Break", genre: "rock", songPart: "bridge",
    complexity: 2, tags: ["percussion", "toms", "break"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: s(4, 12), "tom-high": s(2, 6, 10, 14), "tom-low": s(3, 7, 11, 15), ride: _(),
    },
  },
  {
    id: "rock-b19", name: "Minimal Stripped", genre: "rock", songPart: "bridge",
    complexity: 1, tags: ["minimal", "stripped", "sparse"], bpmRange: [100, 120],
    pattern: {
      kick: s(0), snare: s(8),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-b20", name: "Reverse Pattern Bridge", genre: "rock", songPart: "bridge",
    complexity: 2, tags: ["reverse", "experimental", "creative"], bpmRange: [105, 125],
    pattern: {
      kick: s(1, 9), snare: s(3, 11),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6, 14),
      clap: _(), "tom-high": s(15, 14, 13), "tom-low": _(), ride: s(2, 6, 10, 14),
    },
  },
  // --- OUTRO (4) ---
  {
    id: "rock-o1", name: "Fade Outro", genre: "rock", songPart: "outro",
    complexity: 1, tags: ["fade", "gradual", "ending"], bpmRange: [110, 130],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-o2", name: "Hard Stop Outro", genre: "rock", songPart: "outro",
    complexity: 1, tags: ["hard-stop", "immediate", "abrupt"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0),
    },
  },
  {
    id: "rock-o3", name: "Echo Outro", genre: "rock", songPart: "outro",
    complexity: 2, tags: ["echo", "reverb-tail", "atmospheric"], bpmRange: [100, 120],
    pattern: {
      kick: s(0, 8), snare: s(12),
      "hihat-closed": s(4, 12), "hihat-open": _(),
      clap: _(), "tom-high": s(15), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "rock-o4", name: "Loop Outro", genre: "rock", songPart: "outro",
    complexity: 1, tags: ["loop", "minimal", "repetitive"], bpmRange: [110, 130],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rock-o5", name: "Reverse Pattern Ending", genre: "rock", songPart: "outro",
    complexity: 2, tags: ["reverse", "experimental", "ending"], bpmRange: [105, 125],
    pattern: {
      kick: s(15, 13, 11, 9), snare: s(14, 12),
      "hihat-closed": s(15, 14, 13, 12, 11, 10, 9, 8), "hihat-open": _(),
      clap: _(), "tom-high": s(15), "tom-low": s(14), ride: _(),
    },
  },
  {
    id: "rock-o6", name: "Gradual Element Removal", genre: "rock", songPart: "outro",
    complexity: 1, tags: ["gradual", "fade", "strip"], bpmRange: [110, 130],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(0, 4), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0),
    },
  },
  {
    id: "rock-o7", name: "Reverb Tail Outro", genre: "rock", songPart: "outro",
    complexity: 2, tags: ["reverb", "atmospheric", "tail"], bpmRange: [100, 120],
    pattern: {
      kick: s(0, 12), snare: s(8),
      "hihat-closed": _(), "hihat-open": s(14),
      clap: _(), "tom-high": s(15), "tom-low": _(), ride: s(0, 8, 12, 14),
    },
  },
  {
    id: "rock-o8", name: "Echo Fade Outro", genre: "rock", songPart: "outro",
    complexity: 2, tags: ["echo", "fade", "decay"], bpmRange: [105, 125],
    pattern: {
      kick: s(0, 8), snare: s(12),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: s(4), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
];

// =====================================================================
// HOUSE PATTERNS
// =====================================================================
const housePatterns: PatternVariant[] = [
  // --- INTRO (4) ---
  {
    id: "house-i1", name: "Minimal Start", genre: "house", songPart: "intro",
    complexity: 1, tags: ["minimal", "kick-only", "DJ-friendly"], bpmRange: [120, 128],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-i2", name: "Build-Up Intro", genre: "house", songPart: "intro",
    complexity: 2, tags: ["build-up", "gradual", "anticipation"], bpmRange: [122, 128],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 10), "hihat-open": _(),
      clap: _(), "tom-high": s(14, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-i3", name: "Drop Intro", genre: "house", songPart: "intro",
    complexity: 2, tags: ["drop", "immediate", "full-energy"], bpmRange: [124, 130],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-i4", name: "Ambient Intro", genre: "house", songPart: "intro",
    complexity: 1, tags: ["ambient", "soft", "atmospheric"], bpmRange: [120, 125],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(4, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "house-i5", name: "Reverse Cymbal Build", genre: "house", songPart: "intro",
    complexity: 2, tags: ["reverse", "build", "cinematic"], bpmRange: [122, 128],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(15),
      clap: _(), "tom-high": s(12, 14), "tom-low": s(13, 15), ride: s(12, 13, 14, 15),
    },
  },
  {
    id: "house-i6", name: "Filtered Build", genre: "house", songPart: "intro",
    complexity: 2, tags: ["filter", "sweep", "build"], bpmRange: [120, 128],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 4, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(8, 10, 12, 14, 15),
    },
  },
  {
    id: "house-i7", name: "Percussion Roll Intro", genre: "house", songPart: "intro",
    complexity: 2, tags: ["percussion", "roll", "dynamic"], bpmRange: [122, 126],
    pattern: {
      kick: s(0, 4), snare: _(),
      "hihat-closed": s(8, 10, 12, 14), "hihat-open": _(),
      clap: s(12, 13, 14, 15), "tom-high": s(8, 9, 10, 11, 12, 13), "tom-low": s(14, 15), ride: _(),
    },
  },
  {
    id: "house-i8", name: "Minimal Kick Build", genre: "house", songPart: "intro",
    complexity: 1, tags: ["minimal", "sparse", "kick"], bpmRange: [120, 126],
    pattern: {
      kick: s(0, 12, 14), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // --- VERSE (9) ---
  {
    id: "house-v1", name: "Classic Deep House", genre: "house", songPart: "verse",
    complexity: 1, tags: ["four-on-the-floor", "deep", "classic"], bpmRange: [120, 124],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-v2", name: "Tech House Minimal", genre: "house", songPart: "verse",
    complexity: 2, tags: ["four-on-the-floor", "tech", "minimal"], bpmRange: [124, 126],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(10),
      "hihat-closed": s(1, 3, 5, 7, 9, 11, 13, 15), "hihat-open": s(3, 11),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-v3", name: "Progressive House Build", genre: "house", songPart: "verse",
    complexity: 2, tags: ["four-on-the-floor", "progressive", "syncopated"], bpmRange: [122, 126],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(7, 15),
      clap: s(4, 12), "tom-high": s(3, 11), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-v4", name: "Jackin House", genre: "house", songPart: "verse",
    complexity: 2, tags: ["jackin", "groovy", "shuffled"], bpmRange: [120, 124],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 3, 6, 7, 10, 11, 14, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 6, 12, 14), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-v5", name: "Garage House Shuffle", genre: "house", songPart: "verse",
    complexity: 3, tags: ["garage", "shuffled", "syncopated"], bpmRange: [122, 126],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(1, 3, 5, 7, 9, 11, 13, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 6, 12, 14), "tom-high": _(), "tom-low": _(), ride: s(0, 2, 8, 10),
    },
  },
  {
    id: "house-v6", name: "Deep House 909", genre: "house", songPart: "verse",
    complexity: 1, tags: ["four-on-the-floor", "909", "classic"], bpmRange: [120, 122],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-v7", name: "Tech House Syncopated", genre: "house", songPart: "verse",
    complexity: 3, tags: ["tech", "syncopated", "groovy"], bpmRange: [124, 126],
    pattern: {
      kick: s(0, 4, 6, 8, 12, 14), snare: _(),
      "hihat-closed": s(1, 3, 5, 7, 9, 11, 13, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12), "tom-high": s(10), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-v8", name: "Progressive Atmospheric", genre: "house", songPart: "verse",
    complexity: 2, tags: ["progressive", "atmospheric", "four-on-the-floor"], bpmRange: [122, 124],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": s(3, 11, 15),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "house-v9", name: "Garage 2-Step", genre: "house", songPart: "verse",
    complexity: 3, tags: ["garage", "2-step", "syncopated"], bpmRange: [124, 126],
    pattern: {
      kick: s(0, 3, 8, 11), snare: _(),
      "hihat-closed": s(1, 3, 5, 7, 9, 11, 13, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // --- CHORUS (8) ---
  {
    id: "house-c1", name: "Deep House Full", genre: "house", songPart: "chorus",
    complexity: 2, tags: ["four-on-the-floor", "deep", "groovy"], bpmRange: [120, 124],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12), "tom-high": s(3, 11), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-c2", name: "Tech House Energy", genre: "house", songPart: "chorus",
    complexity: 3, tags: ["tech", "four-on-the-floor", "energetic"], bpmRange: [124, 126],
    pattern: {
      kick: s(0, 4, 6, 8, 12, 14), snare: s(10),
      "hihat-closed": s(1, 2, 3, 5, 7, 9, 11, 13, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 6, 12, 14), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-c3", name: "Progressive Peak", genre: "house", songPart: "chorus",
    complexity: 2, tags: ["progressive", "four-on-the-floor", "build-up"], bpmRange: [122, 126],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(7, 11, 15),
      clap: s(4, 12), "tom-high": s(3, 7, 11, 15), "tom-low": s(1, 5, 9, 13), ride: _(),
    },
  },
  {
    id: "house-c4", name: "Jackin Chorus", genre: "house", songPart: "chorus",
    complexity: 3, tags: ["jackin", "groovy", "shuffled"], bpmRange: [120, 124],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 6, 8, 12, 14), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-c5", name: "Garage Full Energy", genre: "house", songPart: "chorus",
    complexity: 3, tags: ["garage", "shuffled", "four-on-the-floor"], bpmRange: [122, 126],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(1, 3, 5, 7, 9, 11, 13, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 6, 12, 14), "tom-high": s(2, 10), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "house-c6", name: "Deep House 909 Full", genre: "house", songPart: "chorus",
    complexity: 2, tags: ["909", "four-on-the-floor", "classic"], bpmRange: [120, 122],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 6, 11, 14),
      clap: s(4, 8, 12), "tom-high": s(7, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-c7", name: "Tech House Drop", genre: "house", songPart: "chorus",
    complexity: 3, tags: ["tech", "syncopated", "groovy"], bpmRange: [124, 126],
    pattern: {
      kick: s(0, 3, 4, 7, 8, 11, 12, 15), snare: s(10),
      "hihat-closed": s(1, 3, 5, 7, 9, 11, 13, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12), "tom-high": s(6, 14), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-c8", name: "Progressive Anthem", genre: "house", songPart: "chorus",
    complexity: 2, tags: ["progressive", "anthemic", "four-on-the-floor"], bpmRange: [122, 126],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 8, 12), "tom-high": s(3, 7, 11, 15), "tom-low": s(2, 6, 10, 14), ride: _(),
    },
  },
  // --- BRIDGE (8) ---
  {
    id: "house-b1", name: "Deep House Breakdown", genre: "house", songPart: "bridge",
    complexity: 1, tags: ["breakdown", "atmospheric", "minimal"], bpmRange: [120, 124],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": s(3, 11, 15),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-b2", name: "Tech House Stripped", genre: "house", songPart: "bridge",
    complexity: 2, tags: ["stripped", "minimal", "tech"], bpmRange: [124, 126],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(3, 7, 11, 15), "hihat-open": s(7, 15),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-b3", name: "Progressive Filter Sweep", genre: "house", songPart: "bridge",
    complexity: 2, tags: ["progressive", "atmospheric", "build-up"], bpmRange: [122, 126],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(7, 15),
      clap: s(12), "tom-high": s(11, 15), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "house-b4", name: "Jackin Bridge", genre: "house", songPart: "bridge",
    complexity: 2, tags: ["jackin", "groovy", "sparse"], bpmRange: [120, 124],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(3, 7, 11, 15), "hihat-open": s(3, 11),
      clap: s(6, 14), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-b5", name: "Garage Breakdown", genre: "house", songPart: "bridge",
    complexity: 2, tags: ["garage", "atmospheric", "shuffled"], bpmRange: [122, 126],
    pattern: {
      kick: s(0, 12), snare: _(),
      "hihat-closed": s(3, 7, 11, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(8), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "house-b6", name: "Deep House Ambient", genre: "house", songPart: "bridge",
    complexity: 1, tags: ["ambient", "minimal", "atmospheric"], bpmRange: [120, 122],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": _(), "hihat-open": s(4, 8, 12),
      clap: s(8), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "house-b7", name: "Tech House Build", genre: "house", songPart: "bridge",
    complexity: 3, tags: ["tech", "build-up", "tension"], bpmRange: [124, 126],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(14),
      "hihat-closed": s(1, 3, 5, 7, 9, 11, 13, 15), "hihat-open": s(15),
      clap: s(8, 10, 12, 14), "tom-high": s(9, 11, 13, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-b8", name: "Progressive Riser", genre: "house", songPart: "bridge",
    complexity: 2, tags: ["progressive", "build-up", "riser"], bpmRange: [122, 126],
    pattern: {
      kick: s(0, 2, 4, 6, 8, 10, 12, 14), snare: _(),
      "hihat-closed": s(1, 3, 5, 7, 9, 11, 13, 15), "hihat-open": s(15),
      clap: s(4, 8, 12), "tom-high": s(7, 11, 13, 15), "tom-low": s(6, 10, 12, 14), ride: _(),
    },
  },
  // --- NEW VERSE VARIATIONS (3) ---
  {
    id: "house-v10", name: "Soulful House Groove", genre: "house", songPart: "verse",
    complexity: 2, tags: ["soulful", "groovy", "warm"], bpmRange: [118, 122],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 3, 4, 7, 8, 11, 12, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 6, 12, 14), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "house-v11", name: "Tribal House Percussion", genre: "house", songPart: "verse",
    complexity: 3, tags: ["tribal", "percussion", "organic"], bpmRange: [122, 125],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": s(3, 11),
      clap: s(4, 12), "tom-high": s(3, 7, 11), "tom-low": s(1, 5, 9, 13), ride: _(),
    },
  },
  {
    id: "house-v12", name: "Filtered House", genre: "house", songPart: "verse",
    complexity: 2, tags: ["filtered", "disco", "funky"], bpmRange: [120, 124],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(7, 15), clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // --- NEW CHORUS VARIATIONS (4) ---
  {
    id: "house-c9", name: "Electro House Pump", genre: "house", songPart: "chorus",
    complexity: 2, tags: ["electro", "pumping", "sidechain"], bpmRange: [124, 128],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12), "tom-high": s(14, 15), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "house-c10", name: "Future House Drop", genre: "house", songPart: "chorus",
    complexity: 3, tags: ["future", "bouncy", "syncopated"], bpmRange: [124, 126],
    pattern: {
      kick: s(0, 4, 6, 8, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(10, 11), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-c11", name: "Afro House Rhythm", genre: "house", songPart: "chorus",
    complexity: 3, tags: ["afro", "polyrhythmic", "organic"], bpmRange: [120, 124],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(1, 3, 5, 7, 9, 11, 13, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12), "tom-high": s(2, 6, 10, 14), "tom-low": s(1, 5, 9, 13), ride: _(),
    },
  },
  {
    id: "house-c12", name: "Bass House Groove", genre: "house", songPart: "chorus",
    complexity: 2, tags: ["bass-house", "heavy", "groovy"], bpmRange: [123, 126],
    pattern: {
      kick: s(0, 3, 4, 7, 8, 11, 12, 15), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // --- NEW BRIDGE VARIATIONS (3) ---
  {
    id: "house-b9", name: "Minimal Break", genre: "house", songPart: "bridge",
    complexity: 1, tags: ["minimal", "sparse", "tension"], bpmRange: [122, 125],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(4, 12), "hihat-open": s(6, 14),
      clap: s(12), "tom-high": _(), "tom-low": _(), ride: s(0, 8),
    },
  },
  {
    id: "house-b10", name: "Percussive Bridge", genre: "house", songPart: "bridge",
    complexity: 3, tags: ["percussion", "layered", "complex"], bpmRange: [120, 124],
    pattern: {
      kick: s(0, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": s(7, 15),
      clap: s(4), "tom-high": s(3, 7, 11, 15), "tom-low": s(2, 6, 10, 14), ride: _(),
    },
  },
  {
    id: "house-b11", name: "Filter Build", genre: "house", songPart: "bridge",
    complexity: 2, tags: ["filter", "build", "sweep"], bpmRange: [122, 126],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": _(), clap: s(8, 12, 14), "tom-high": s(13, 14, 15), "tom-low": _(), ride: _(),
    },
  },
  // --- ADDITIONAL BRIDGE VARIATIONS (4) ---
  {
    id: "house-b12", name: "Breakdown Bridge", genre: "house", songPart: "bridge",
    complexity: 1, tags: ["breakdown", "simplified", "minimal"], bpmRange: [120, 128],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 10), "hihat-open": _(),
      clap: s(12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-b13", name: "Intensity Build Bridge", genre: "house", songPart: "bridge",
    complexity: 2, tags: ["build", "intensity", "crescendo"], bpmRange: [122, 128],
    pattern: {
      kick: s(0, 4, 8, 10, 12, 14), snare: s(12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(14),
      clap: s(4, 8, 12), "tom-high": s(13, 14, 15), "tom-low": s(10, 11, 12), ride: _(),
    },
  },
  {
    id: "house-b14", name: "Rhythmic Shift Bridge", genre: "house", songPart: "bridge",
    complexity: 3, tags: ["rhythmic-shift", "syncopated", "experimental"], bpmRange: [120, 126],
    pattern: {
      kick: s(0, 3, 6, 9, 12, 15), snare: s(6, 14),
      "hihat-closed": s(0, 3, 6, 9, 12, 15), "hihat-open": s(7, 15),
      clap: _(), "tom-high": s(3, 9), "tom-low": s(6, 12), ride: _(),
    },
  },
  {
    id: "house-b15", name: "Hat Solo Bridge", genre: "house", songPart: "bridge",
    complexity: 1, tags: ["solo", "hat-focus", "minimal"], bpmRange: [120, 125],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": s(3, 7, 11, 15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-b16", name: "Double-Time Intensity", genre: "house", songPart: "bridge",
    complexity: 3, tags: ["double-time", "intense", "fast"], bpmRange: [124, 130],
    pattern: {
      kick: s(0, 2, 4, 6, 8, 10, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(7, 15), clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-b17", name: "Percussion Break", genre: "house", songPart: "bridge",
    complexity: 2, tags: ["percussion", "toms", "break"], bpmRange: [122, 128],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: s(4, 12), "tom-high": s(2, 6, 10, 14), "tom-low": s(3, 7, 11, 15), ride: _(),
    },
  },
  {
    id: "house-b18", name: "Minimal Stripped", genre: "house", songPart: "bridge",
    complexity: 1, tags: ["minimal", "stripped", "sparse"], bpmRange: [120, 126],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(2, 10), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-b19", name: "Reverse Pattern Bridge", genre: "house", songPart: "bridge",
    complexity: 2, tags: ["reverse", "experimental", "creative"], bpmRange: [120, 128],
    pattern: {
      kick: s(1, 5, 9, 13), snare: s(3, 11),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6, 14),
      clap: _(), "tom-high": s(15, 14, 13), "tom-low": _(), ride: s(2, 6, 10, 14),
    },
  },
  // --- OUTRO (4) ---
  {
    id: "house-o1", name: "Fade Outro", genre: "house", songPart: "outro",
    complexity: 1, tags: ["fade", "gradual", "ending"], bpmRange: [120, 128],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(4, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-o2", name: "Hard Stop Outro", genre: "house", songPart: "outro",
    complexity: 1, tags: ["hard-stop", "immediate", "abrupt"], bpmRange: [120, 128],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0),
    },
  },
  {
    id: "house-o3", name: "Echo Outro", genre: "house", songPart: "outro",
    complexity: 2, tags: ["echo", "reverb-tail", "atmospheric"], bpmRange: [118, 125],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(2, 10), "hihat-open": s(6, 14),
      clap: s(12), "tom-high": s(15), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "house-o4", name: "Loop Outro", genre: "house", songPart: "outro",
    complexity: 1, tags: ["loop", "minimal", "repetitive"], bpmRange: [120, 126],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 10), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-o5", name: "Reverse Pattern Ending", genre: "house", songPart: "outro",
    complexity: 2, tags: ["reverse", "experimental", "ending"], bpmRange: [120, 126],
    pattern: {
      kick: s(15, 13, 11, 9, 7, 5, 3, 1), snare: s(14, 12),
      "hihat-closed": s(15, 14, 13, 12, 11, 10, 9, 8), "hihat-open": _(),
      clap: _(), "tom-high": s(15), "tom-low": s(14), ride: _(),
    },
  },
  {
    id: "house-o6", name: "Gradual Element Removal", genre: "house", songPart: "outro",
    complexity: 1, tags: ["gradual", "fade", "strip"], bpmRange: [120, 126],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(2, 10), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "house-o7", name: "Reverb Tail Outro", genre: "house", songPart: "outro",
    complexity: 2, tags: ["reverb", "atmospheric", "tail"], bpmRange: [118, 124],
    pattern: {
      kick: s(0, 12), snare: _(),
      "hihat-closed": _(), "hihat-open": s(14),
      clap: s(4), "tom-high": s(15), "tom-low": _(), ride: s(0, 8, 12, 14),
    },
  },
  {
    id: "house-o8", name: "Echo Fade Outro", genre: "house", songPart: "outro",
    complexity: 2, tags: ["echo", "fade", "decay"], bpmRange: [120, 126],
    pattern: {
      kick: s(0, 8), snare: s(12),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
];

// =====================================================================
// LO-FI PATTERNS
// =====================================================================
const loFiPatterns: PatternVariant[] = [
  // --- INTRO (4) ---
  {
    id: "lofi-i1", name: "Minimal Start", genre: "lo-fi", songPart: "intro",
    complexity: 1, tags: ["minimal", "kick-only", "chill"], bpmRange: [70, 80],
    pattern: {
      kick: s(0, 10), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "lofi-i2", name: "Build-Up Intro", genre: "lo-fi", songPart: "intro",
    complexity: 2, tags: ["build-up", "gradual", "jazzy"], bpmRange: [72, 80],
    pattern: {
      kick: s(0, 10), snare: _(),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "lofi-i3", name: "Drop Intro", genre: "lo-fi", songPart: "intro",
    complexity: 2, tags: ["drop", "immediate", "full-groove"], bpmRange: [75, 82],
    pattern: {
      kick: s(0, 3, 10), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(7, 15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "lofi-i4", name: "Ambient Intro", genre: "lo-fi", songPart: "intro",
    complexity: 1, tags: ["ambient", "soft", "atmospheric"], bpmRange: [68, 75],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(4, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 6, 12),
    },
  },
  {
    id: "lofi-i5", name: "Reverse Cymbal Build", genre: "lo-fi", songPart: "intro",
    complexity: 2, tags: ["reverse", "build", "cinematic"], bpmRange: [70, 78],
    pattern: {
      kick: s(0, 10), snare: _(),
      "hihat-closed": s(8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(15),
      clap: _(), "tom-high": s(12, 14), "tom-low": s(13, 15), ride: s(12, 13, 14, 15),
    },
  },
  {
    id: "lofi-i6", name: "Filtered Build", genre: "lo-fi", songPart: "intro",
    complexity: 2, tags: ["filter", "sweep", "build"], bpmRange: [70, 78],
    pattern: {
      kick: s(0, 10), snare: _(),
      "hihat-closed": s(0, 4, 8, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(8, 10, 12, 14, 15),
    },
  },
  {
    id: "lofi-i7", name: "Percussion Roll Intro", genre: "lo-fi", songPart: "intro",
    complexity: 2, tags: ["percussion", "roll", "dynamic"], bpmRange: [70, 76],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(8, 10, 12, 14), "hihat-open": _(),
      clap: s(12, 13, 14, 15), "tom-high": s(8, 9, 10, 11, 12, 13), "tom-low": s(14, 15), ride: _(),
    },
  },
  {
    id: "lofi-i8", name: "Minimal Kick Build", genre: "lo-fi", songPart: "intro",
    complexity: 1, tags: ["minimal", "sparse", "kick"], bpmRange: [68, 75],
    pattern: {
      kick: s(0, 10, 14), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // --- VERSE (9) ---
  {
    id: "lofi-v1", name: "Classic Boom Bap", genre: "lo-fi", songPart: "verse",
    complexity: 1, tags: ["boom-bap", "chill", "classic"], bpmRange: [70, 85],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "lofi-v2", name: "Jazzy Swing", genre: "lo-fi", songPart: "verse",
    complexity: 2, tags: ["swing", "jazzy", "atmospheric"], bpmRange: [75, 90],
    pattern: {
      kick: s(0, 5, 8, 13), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "lofi-v3", name: "Study Beats", genre: "lo-fi", songPart: "verse",
    complexity: 1, tags: ["chill", "atmospheric", "minimal"], bpmRange: [60, 75],
    pattern: {
      kick: s(0, 10), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  {
    id: "lofi-v4", name: "Nostalgic Groove", genre: "lo-fi", songPart: "verse",
    complexity: 2, tags: ["boom-bap", "swing", "nostalgic"], bpmRange: [70, 85],
    pattern: {
      kick: s(0, 3, 8, 11), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "lofi-v5", name: "Dusty Vinyl", genre: "lo-fi", songPart: "verse",
    complexity: 2, tags: ["boom-bap", "atmospheric", "jazzy"], bpmRange: [75, 90],
    pattern: {
      kick: s(0, 5, 8), snare: s(4, 12),
      "hihat-closed": s(0, 3, 6, 8, 11, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 3, 4, 8, 11, 12),
    },
  },
  {
    id: "lofi-v6", name: "Ambient Chill", genre: "lo-fi", songPart: "verse",
    complexity: 1, tags: ["ambient", "chill", "atmospheric"], bpmRange: [60, 75],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "lofi-v7", name: "Triplet Swing", genre: "lo-fi", songPart: "verse",
    complexity: 3, tags: ["swing", "jazzy", "triplet"], bpmRange: [70, 85],
    pattern: {
      kick: s(0, 6, 8, 14), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(3, 11),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "lofi-v8", name: "Coffee Shop", genre: "lo-fi", songPart: "verse",
    complexity: 2, tags: ["chill", "jazzy", "atmospheric"], bpmRange: [75, 85],
    pattern: {
      kick: s(0, 7, 8), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": s(10), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "lofi-v9", name: "Late Night", genre: "lo-fi", songPart: "verse",
    complexity: 1, tags: ["chill", "atmospheric", "minimal"], bpmRange: [65, 80],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 4, 6, 8, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  // --- CHORUS (8) ---
  {
    id: "lofi-c1", name: "Boom Bap Full", genre: "lo-fi", songPart: "chorus",
    complexity: 2, tags: ["boom-bap", "chill", "full"], bpmRange: [70, 85],
    pattern: {
      kick: s(0, 3, 8, 11), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": s(3, 11), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "lofi-c2", name: "Jazzy Chorus", genre: "lo-fi", songPart: "chorus",
    complexity: 2, tags: ["jazzy", "swing", "atmospheric"], bpmRange: [75, 90],
    pattern: {
      kick: s(0, 5, 8, 13), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(3, 11),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 3, 4, 6, 8, 11, 12, 14),
    },
  },
  {
    id: "lofi-c3", name: "Study Full Energy", genre: "lo-fi", songPart: "chorus",
    complexity: 2, tags: ["chill", "atmospheric", "energetic"], bpmRange: [70, 85],
    pattern: {
      kick: s(0, 5, 8, 10), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(7, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "lofi-c4", name: "Nostalgic Full", genre: "lo-fi", songPart: "chorus",
    complexity: 3, tags: ["boom-bap", "swing", "nostalgic"], bpmRange: [70, 85],
    pattern: {
      kick: s(0, 3, 5, 8, 11, 13), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": s(10), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "lofi-c5", name: "Vinyl Groove Chorus", genre: "lo-fi", songPart: "chorus",
    complexity: 2, tags: ["boom-bap", "jazzy", "groovy"], bpmRange: [75, 90],
    pattern: {
      kick: s(0, 5, 8, 13), snare: s(4, 12),
      "hihat-closed": s(0, 3, 6, 8, 11, 14), "hihat-open": s(3, 11),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 3, 4, 8, 11, 12),
    },
  },
  {
    id: "lofi-c6", name: "Ambient Full", genre: "lo-fi", songPart: "chorus",
    complexity: 2, tags: ["ambient", "atmospheric", "chill"], bpmRange: [65, 80],
    pattern: {
      kick: s(0, 5, 8, 13), snare: s(4, 12),
      "hihat-closed": s(0, 4, 6, 8, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": s(3, 11), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "lofi-c7", name: "Triplet Chorus", genre: "lo-fi", songPart: "chorus",
    complexity: 3, tags: ["swing", "jazzy", "triplet"], bpmRange: [70, 85],
    pattern: {
      kick: s(0, 3, 6, 8, 11, 14), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(3, 7, 11, 15),
      clap: _(), "tom-high": s(7, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "lofi-c8", name: "Coffee Shop Full", genre: "lo-fi", songPart: "chorus",
    complexity: 2, tags: ["chill", "jazzy", "groovy"], bpmRange: [75, 85],
    pattern: {
      kick: s(0, 5, 7, 8, 13), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": s(10, 15), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  // --- BRIDGE (8) ---
  {
    id: "lofi-b1", name: "Minimal Bridge", genre: "lo-fi", songPart: "bridge",
    complexity: 1, tags: ["minimal", "atmospheric", "sparse"], bpmRange: [70, 85],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "lofi-b2", name: "Jazzy Breakdown", genre: "lo-fi", songPart: "bridge",
    complexity: 2, tags: ["jazzy", "atmospheric", "breakdown"], bpmRange: [75, 90],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 3, 8, 11), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 3, 4, 8, 11, 12),
    },
  },
  {
    id: "lofi-b3", name: "Ambient Space", genre: "lo-fi", songPart: "bridge",
    complexity: 1, tags: ["ambient", "atmospheric", "space"], bpmRange: [60, 75],
    pattern: {
      kick: s(0), snare: s(12),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "lofi-b4", name: "Ride Focus", genre: "lo-fi", songPart: "bridge",
    complexity: 2, tags: ["jazzy", "atmospheric", "ride"], bpmRange: [70, 85],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 3, 4, 6, 8, 11, 12, 14),
    },
  },
  {
    id: "lofi-b5", name: "Kick Groove Bridge", genre: "lo-fi", songPart: "bridge",
    complexity: 2, tags: ["boom-bap", "minimal", "groove"], bpmRange: [70, 85],
    pattern: {
      kick: s(0, 3, 8, 11), snare: _(),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "lofi-b6", name: "Triplet Breakdown", genre: "lo-fi", songPart: "bridge",
    complexity: 3, tags: ["swing", "jazzy", "breakdown"], bpmRange: [70, 85],
    pattern: {
      kick: s(0, 6, 12), snare: s(8),
      "hihat-closed": s(0, 3, 6, 8, 11), "hihat-open": s(3, 11),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "lofi-b7", name: "Atmospheric Build", genre: "lo-fi", songPart: "bridge",
    complexity: 2, tags: ["atmospheric", "build-up", "chill"], bpmRange: [65, 80],
    pattern: {
      kick: s(0, 8), snare: s(12),
      "hihat-closed": s(0, 4, 6, 8, 12, 14), "hihat-open": s(14),
      clap: s(12), "tom-high": s(11, 15), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "lofi-b8", name: "Vinyl Crackle Bridge", genre: "lo-fi", songPart: "bridge",
    complexity: 1, tags: ["nostalgic", "atmospheric", "minimal"], bpmRange: [70, 85],
    pattern: {
      kick: s(0, 10), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  // --- NEW VERSE VARIATIONS (3) ---
  {
    id: "lofi-v10", name: "Dusty Breaks", genre: "lo-fi", songPart: "verse",
    complexity: 2, tags: ["dusty", "vintage", "sampled"], bpmRange: [72, 85],
    pattern: {
      kick: s(0, 5, 10), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 15), "hihat-open": s(7, 15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "lofi-v11", name: "Study Session", genre: "lo-fi", songPart: "verse",
    complexity: 1, tags: ["chill", "minimal", "focus"], bpmRange: [65, 75],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  {
    id: "lofi-v12", name: "Jazzy Pocket", genre: "lo-fi", songPart: "verse",
    complexity: 3, tags: ["jazzy", "syncopated", "swing"], bpmRange: [75, 90],
    pattern: {
      kick: s(0, 3, 7, 10, 14), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(3, 7, 11, 15),
      clap: _(), "tom-high": s(15), "tom-low": _(), ride: s(0, 3, 8, 11),
    },
  },
  // --- NEW CHORUS VARIATIONS (4) ---
  {
    id: "lofi-c9", name: "Anime Montage", genre: "lo-fi", songPart: "chorus",
    complexity: 2, tags: ["upbeat", "energetic", "anime"], bpmRange: [80, 95],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(3, 11), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "lofi-c10", name: "Rainy Day Groove", genre: "lo-fi", songPart: "chorus",
    complexity: 2, tags: ["chill", "rainy", "cozy"], bpmRange: [70, 80],
    pattern: {
      kick: s(0, 6, 8, 14), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 8, 11, 12), "hihat-open": s(7, 15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "lofi-c11", name: "Vinyl Loop", genre: "lo-fi", songPart: "chorus",
    complexity: 1, tags: ["loop", "vintage", "nostalgic"], bpmRange: [75, 85],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  {
    id: "lofi-c12", name: "Summer Breeze", genre: "lo-fi", songPart: "chorus",
    complexity: 2, tags: ["warm", "sunny", "uplifting"], bpmRange: [78, 88],
    pattern: {
      kick: s(0, 5, 8, 13), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 7, 8, 11, 12, 15), "hihat-open": s(7, 15),
      clap: s(4, 12), "tom-high": s(11), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  // --- NEW BRIDGE VARIATIONS (3) ---
  {
    id: "lofi-b9", name: "Reverb Space", genre: "lo-fi", songPart: "bridge",
    complexity: 1, tags: ["spacious", "reverb", "atmospheric"], bpmRange: [70, 80],
    pattern: {
      kick: s(0, 8), snare: s(12),
      "hihat-closed": s(0, 8), "hihat-open": s(4, 12),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "lofi-b10", name: "Dreamy Interlude", genre: "lo-fi", songPart: "bridge",
    complexity: 2, tags: ["dreamy", "ethereal", "floating"], bpmRange: [65, 75],
    pattern: {
      kick: s(0, 10), snare: s(8),
      "hihat-closed": s(0, 6, 12), "hihat-open": s(14),
      clap: s(4), "tom-high": _(), "tom-low": s(6), ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  {
    id: "lofi-b11", name: "Tape Stop", genre: "lo-fi", songPart: "bridge",
    complexity: 2, tags: ["glitch", "tape-stop", "experimental"], bpmRange: [75, 85],
    pattern: {
      kick: s(0, 12), snare: s(4),
      "hihat-closed": s(0, 4, 8), "hihat-open": s(14),
      clap: s(8, 12), "tom-high": s(10), "tom-low": s(14), ride: _(),
    },
  },
  // --- ADDITIONAL BRIDGE VARIATIONS (4) ---
  {
    id: "lofi-b12", name: "Breakdown Bridge", genre: "lo-fi", songPart: "bridge",
    complexity: 1, tags: ["breakdown", "simplified", "minimal"], bpmRange: [70, 80],
    pattern: {
      kick: s(0, 10), snare: s(12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "lofi-b13", name: "Intensity Build Bridge", genre: "lo-fi", songPart: "bridge",
    complexity: 2, tags: ["build", "intensity", "crescendo"], bpmRange: [72, 80],
    pattern: {
      kick: s(0, 3, 7, 10, 12), snare: s(4, 8, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(14),
      clap: s(12), "tom-high": s(13, 14, 15), "tom-low": s(10, 11, 12), ride: _(),
    },
  },
  {
    id: "lofi-b14", name: "Rhythmic Shift Bridge", genre: "lo-fi", songPart: "bridge",
    complexity: 3, tags: ["rhythmic-shift", "triplet", "experimental"], bpmRange: [70, 78],
    pattern: {
      kick: s(0, 5, 10), snare: s(7, 15),
      "hihat-closed": s(0, 5, 10), "hihat-open": s(3, 13),
      clap: _(), "tom-high": s(3, 8), "tom-low": s(5, 13), ride: s(0, 6, 12),
    },
  },
  {
    id: "lofi-b15", name: "Ride Solo Bridge", genre: "lo-fi", songPart: "bridge",
    complexity: 1, tags: ["solo", "ride-focus", "jazzy"], bpmRange: [68, 75],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 3, 4, 6, 8, 11, 12, 14),
    },
  },
  {
    id: "lofi-b16", name: "Double-Time Intensity", genre: "lo-fi", songPart: "bridge",
    complexity: 3, tags: ["double-time", "intense", "fast"], bpmRange: [75, 85],
    pattern: {
      kick: s(0, 2, 4, 6, 8, 10, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(7, 15), clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "lofi-b17", name: "Percussion Break", genre: "lo-fi", songPart: "bridge",
    complexity: 2, tags: ["percussion", "toms", "break"], bpmRange: [70, 78],
    pattern: {
      kick: s(0, 10), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: s(4, 12), "tom-high": s(2, 6, 10, 14), "tom-low": s(3, 7, 11, 15), ride: _(),
    },
  },
  {
    id: "lofi-b18", name: "Minimal Stripped", genre: "lo-fi", songPart: "bridge",
    complexity: 1, tags: ["minimal", "stripped", "sparse"], bpmRange: [68, 75],
    pattern: {
      kick: s(0), snare: s(12),
      "hihat-closed": s(0, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "lofi-b19", name: "Reverse Pattern Bridge", genre: "lo-fi", songPart: "bridge",
    complexity: 2, tags: ["reverse", "experimental", "creative"], bpmRange: [70, 76],
    pattern: {
      kick: s(1, 11), snare: s(3),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6, 14),
      clap: _(), "tom-high": s(15, 14, 13), "tom-low": _(), ride: s(0, 3, 4, 6, 8, 11, 12, 14),
    },
  },
  // --- OUTRO (4) ---
  {
    id: "lofi-o1", name: "Fade Outro", genre: "lo-fi", songPart: "outro",
    complexity: 1, tags: ["fade", "gradual", "ending"], bpmRange: [70, 80],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 12),
    },
  },
  {
    id: "lofi-o2", name: "Hard Stop Outro", genre: "lo-fi", songPart: "outro",
    complexity: 1, tags: ["hard-stop", "immediate", "abrupt"], bpmRange: [70, 80],
    pattern: {
      kick: s(0, 3, 10), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(7, 15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0),
    },
  },
  {
    id: "lofi-o3", name: "Echo Outro", genre: "lo-fi", songPart: "outro",
    complexity: 2, tags: ["echo", "reverb-tail", "atmospheric"], bpmRange: [68, 75],
    pattern: {
      kick: s(0, 10), snare: s(12),
      "hihat-closed": s(4, 12), "hihat-open": _(),
      clap: _(), "tom-high": s(15), "tom-low": _(), ride: s(0, 6, 12),
    },
  },
  {
    id: "lofi-o4", name: "Loop Outro", genre: "lo-fi", songPart: "outro",
    complexity: 1, tags: ["loop", "minimal", "repetitive"], bpmRange: [70, 78],
    pattern: {
      kick: s(0, 10), snare: _(),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "lofi-o5", name: "Reverse Pattern Ending", genre: "lo-fi", songPart: "outro",
    complexity: 2, tags: ["reverse", "experimental", "ending"], bpmRange: [68, 75],
    pattern: {
      kick: s(15, 13, 11, 9), snare: s(14, 12),
      "hihat-closed": s(15, 14, 13, 12, 11, 10, 9, 8), "hihat-open": _(),
      clap: _(), "tom-high": s(15), "tom-low": s(14), ride: _(),
    },
  },
  {
    id: "lofi-o6", name: "Gradual Element Removal", genre: "lo-fi", songPart: "outro",
    complexity: 1, tags: ["gradual", "fade", "strip"], bpmRange: [68, 75],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0),
    },
  },
  {
    id: "lofi-o7", name: "Reverb Tail Outro", genre: "lo-fi", songPart: "outro",
    complexity: 2, tags: ["reverb", "atmospheric", "tail"], bpmRange: [68, 75],
    pattern: {
      kick: s(0, 10), snare: s(12),
      "hihat-closed": _(), "hihat-open": s(14),
      clap: _(), "tom-high": s(15), "tom-low": _(), ride: s(0, 6, 12, 14),
    },
  },
  {
    id: "lofi-o8", name: "Echo Fade Outro", genre: "lo-fi", songPart: "outro",
    complexity: 2, tags: ["echo", "fade", "decay"], bpmRange: [70, 78],
    pattern: {
      kick: s(0, 10), snare: s(12),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: s(4), "tom-high": _(), "tom-low": _(), ride: s(0, 3, 4, 6, 8, 11, 12, 14),
    },
  },
];

// =====================================================================
// ELECTRONIC PATTERNS
// =====================================================================
const electronicPatterns: PatternVariant[] = [
  // --- INTRO (4) ---
  {
    id: "elec-i1", name: "Minimal Start", genre: "electronic", songPart: "intro",
    complexity: 1, tags: ["minimal", "kick-only", "DJ-friendly"], bpmRange: [125, 135],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-i2", name: "Build-Up Intro", genre: "electronic", songPart: "intro",
    complexity: 2, tags: ["build-up", "gradual", "anticipation"], bpmRange: [128, 135],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": _(),
      clap: _(), "tom-high": s(13, 14, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-i3", name: "Drop Intro", genre: "electronic", songPart: "intro",
    complexity: 2, tags: ["drop", "immediate", "full-energy"], bpmRange: [130, 140],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": s(7, 15),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-i4", name: "Ambient Intro", genre: "electronic", songPart: "intro",
    complexity: 1, tags: ["ambient", "soft", "atmospheric"], bpmRange: [120, 130],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(4, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "elec-i5", name: "Reverse Cymbal Build", genre: "electronic", songPart: "intro",
    complexity: 2, tags: ["reverse", "build", "cinematic"], bpmRange: [125, 135],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(15),
      clap: _(), "tom-high": s(12, 14), "tom-low": s(13, 15), ride: s(12, 13, 14, 15),
    },
  },
  {
    id: "elec-i6", name: "Filtered Build", genre: "electronic", songPart: "intro",
    complexity: 2, tags: ["filter", "sweep", "build"], bpmRange: [125, 135],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 4, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(8, 10, 12, 14, 15),
    },
  },
  {
    id: "elec-i7", name: "Percussion Roll Intro", genre: "electronic", songPart: "intro",
    complexity: 2, tags: ["percussion", "roll", "dynamic"], bpmRange: [128, 135],
    pattern: {
      kick: s(0, 4), snare: _(),
      "hihat-closed": s(8, 10, 12, 14), "hihat-open": _(),
      clap: s(12, 13, 14, 15), "tom-high": s(8, 9, 10, 11, 12, 13), "tom-low": s(14, 15), ride: _(),
    },
  },
  {
    id: "elec-i8", name: "Minimal Kick Build", genre: "electronic", songPart: "intro",
    complexity: 1, tags: ["minimal", "sparse", "kick"], bpmRange: [120, 130],
    pattern: {
      kick: s(0, 12, 14), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // --- VERSE (9) ---
  {
    id: "elec-v1", name: "Four on the Floor", genre: "electronic", songPart: "verse",
    complexity: 1, tags: ["four-on-floor", "house", "classic"], bpmRange: [120, 130],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-v2", name: "Deep House", genre: "electronic", songPart: "verse",
    complexity: 2, tags: ["deep-house", "groove"], bpmRange: [118, 125],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 11),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-v3", name: "Techno Minimal", genre: "electronic", songPart: "verse",
    complexity: 1, tags: ["techno", "minimal"], bpmRange: [128, 135],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "elec-v4", name: "Garage 2-Step", genre: "electronic", songPart: "verse",
    complexity: 3, tags: ["garage", "2-step", "syncopated"], bpmRange: [128, 135],
    pattern: {
      kick: s(0, 7, 10), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 11),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-v5", name: "Electro Verse", genre: "electronic", songPart: "verse",
    complexity: 2, tags: ["electro", "robotic"], bpmRange: [125, 135],
    pattern: {
      kick: s(0, 3, 8, 11), snare: _(),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": _(), clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-v6", name: "Ambient Techno", genre: "electronic", songPart: "verse",
    complexity: 1, tags: ["ambient", "dub-techno"], bpmRange: [118, 128],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": _(),
      clap: s(12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "elec-v7", name: "Trance Verse", genre: "electronic", songPart: "verse",
    complexity: 2, tags: ["trance", "driving"], bpmRange: [135, 145],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(2, 10),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-v8", name: "Breaks Verse", genre: "electronic", songPart: "verse",
    complexity: 3, tags: ["breakbeat", "breaks", "funky"], bpmRange: [125, 135],
    pattern: {
      kick: s(0, 5, 8, 13), snare: s(4, 10, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-v9", name: "Synthwave Verse", genre: "electronic", songPart: "verse",
    complexity: 2, tags: ["synthwave", "retro", "80s"], bpmRange: [100, 118],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": s(14), "tom-low": _(), ride: _(),
    },
  },
  // --- CHORUS (8) ---
  {
    id: "elec-c1", name: "House Chorus", genre: "electronic", songPart: "chorus",
    complexity: 2, tags: ["house", "full"], bpmRange: [120, 130],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(2, 6, 10, 14), clap: s(4, 12),
      "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "elec-c2", name: "Techno Peak", genre: "electronic", songPart: "chorus",
    complexity: 3, tags: ["techno", "peak-time", "relentless"], bpmRange: [130, 140],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(2, 6, 10, 14), clap: s(4, 12),
      "tom-high": s(3, 11), "tom-low": s(7, 15), ride: _(),
    },
  },
  {
    id: "elec-c3", name: "EDM Drop", genre: "electronic", songPart: "chorus",
    complexity: 2, tags: ["edm", "drop", "big-room"], bpmRange: [126, 132],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(2, 6, 10, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-c4", name: "Trance Chorus", genre: "electronic", songPart: "chorus",
    complexity: 2, tags: ["trance", "euphoric"], bpmRange: [135, 145],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "elec-c5", name: "Breaks Chorus", genre: "electronic", songPart: "chorus",
    complexity: 3, tags: ["breaks", "funky", "peak"], bpmRange: [125, 135],
    pattern: {
      kick: s(0, 3, 5, 8, 11, 13), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(1, 5, 9, 13),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-c6", name: "Garage Chorus", genre: "electronic", songPart: "chorus",
    complexity: 3, tags: ["garage", "2-step"], bpmRange: [128, 135],
    pattern: {
      kick: s(0, 5, 7, 10, 14), snare: _(),
      "hihat-closed": s(0, 2, 3, 4, 6, 8, 10, 11, 12, 14), "hihat-open": s(7, 15),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-c7", name: "Synthwave Chorus", genre: "electronic", songPart: "chorus",
    complexity: 2, tags: ["synthwave", "retro"], bpmRange: [100, 118],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": _(), clap: s(4, 12), "tom-high": s(14, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-c8", name: "Deep House Groove", genre: "electronic", songPart: "chorus",
    complexity: 2, tags: ["deep-house", "percussive"], bpmRange: [118, 125],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12), "tom-high": s(3, 11), "tom-low": s(7, 15), ride: _(),
    },
  },
  // --- BRIDGE (8) ---
  {
    id: "elec-b1", name: "Breakdown", genre: "electronic", songPart: "bridge",
    complexity: 1, tags: ["breakdown", "minimal", "atmospheric"], bpmRange: [120, 135],
    pattern: {
      kick: s(0, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": s(14),
      clap: s(12), "tom-high": s(8), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-b2", name: "Build-Up", genre: "electronic", songPart: "bridge",
    complexity: 3, tags: ["build", "snare-roll", "rising"], bpmRange: [120, 145],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(0, 2, 4, 6, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-b3", name: "Filter Sweep", genre: "electronic", songPart: "bridge",
    complexity: 1, tags: ["filter", "sweep", "tension"], bpmRange: [120, 135],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-b4", name: "Dub Techno Bridge", genre: "electronic", songPart: "bridge",
    complexity: 2, tags: ["dub", "echo", "space"], bpmRange: [118, 128],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": _(),
      clap: s(4), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "elec-b5", name: "Percussion Bridge", genre: "electronic", songPart: "bridge",
    complexity: 3, tags: ["percussion", "tribal", "organic"], bpmRange: [120, 135],
    pattern: {
      kick: _(), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 11),
      clap: s(4, 12), "tom-high": s(1, 5, 9, 13), "tom-low": s(3, 7, 11, 15), ride: _(),
    },
  },
  {
    id: "elec-b6", name: "Half-Speed Bridge", genre: "electronic", songPart: "bridge",
    complexity: 1, tags: ["half-speed", "slow-down"], bpmRange: [120, 135],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": _(), "hihat-open": s(4, 12),
      clap: s(8), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-b7", name: "Acid Bridge", genre: "electronic", songPart: "bridge",
    complexity: 2, tags: ["acid", "303", "squelch"], bpmRange: [125, 135],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(4, 12), "tom-high": s(3, 7, 11, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-b8", name: "Ambient Pad Bridge", genre: "electronic", songPart: "bridge",
    complexity: 1, tags: ["ambient", "pad", "ethereal"], bpmRange: [110, 130],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": _(), "hihat-open": s(8),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  // --- NEW VERSE VARIATIONS (3) ---
  {
    id: "elec-v10", name: "IDM Glitch", genre: "electronic", songPart: "verse",
    complexity: 3, tags: ["idm", "glitch", "experimental"], bpmRange: [125, 140],
    pattern: {
      kick: s(0, 3, 7, 10, 13), snare: s(5, 11),
      "hihat-closed": s(0, 1, 3, 5, 6, 8, 10, 11, 13, 15), "hihat-open": s(2, 14),
      clap: s(4, 12), "tom-high": s(9), "tom-low": s(7), ride: _(),
    },
  },
  {
    id: "elec-v11", name: "Electro Funk", genre: "electronic", songPart: "verse",
    complexity: 2, tags: ["electro", "funk", "groovy"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 6, 8, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(3, 11), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-v12", name: "Future Bass", genre: "electronic", songPart: "verse",
    complexity: 2, tags: ["future-bass", "melodic", "syncopated"], bpmRange: [135, 145],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 7, 8, 11, 12, 15), "hihat-open": s(7, 15),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // --- NEW CHORUS VARIATIONS (4) ---
  {
    id: "elec-c9", name: "Big Room Drop", genre: "electronic", songPart: "chorus",
    complexity: 2, tags: ["big-room", "festival", "heavy"], bpmRange: [125, 130],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(3, 7, 11, 15), clap: s(4, 12),
      "tom-high": s(14, 15), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "elec-c10", name: "Melodic Dubstep", genre: "electronic", songPart: "chorus",
    complexity: 3, tags: ["dubstep", "melodic", "half-time"], bpmRange: [135, 145],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(6, 14), clap: s(4, 12),
      "tom-high": s(3, 7, 11, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-c11", name: "Hard Electro", genre: "electronic", songPart: "chorus",
    complexity: 2, tags: ["hard", "aggressive", "industrial"], bpmRange: [128, 135],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 10, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(2, 6, 10, 14),
      clap: s(4, 12), "tom-high": s(13, 14), "tom-low": s(15), ride: _(),
    },
  },
  {
    id: "elec-c12", name: "Synthwave Drive", genre: "electronic", songPart: "chorus",
    complexity: 2, tags: ["synthwave", "retro", "driving"], bpmRange: [110, 120],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  // --- NEW BRIDGE VARIATIONS (3) ---
  {
    id: "elec-b9", name: "Glitch Break", genre: "electronic", songPart: "bridge",
    complexity: 3, tags: ["glitch", "stutter", "experimental"], bpmRange: [125, 140],
    pattern: {
      kick: s(0, 14), snare: s(6, 10),
      "hihat-closed": s(0, 1, 4, 5, 8, 9, 12, 13), "hihat-open": s(7, 15),
      clap: s(12), "tom-high": s(3, 7, 11), "tom-low": s(5, 9), ride: _(),
    },
  },
  {
    id: "elec-b10", name: "Trance Arpeggio", genre: "electronic", songPart: "bridge",
    complexity: 2, tags: ["trance", "melodic", "build"], bpmRange: [130, 140],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(12, 13, 14, 15), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "elec-b11", name: "Minimal Techno Space", genre: "electronic", songPart: "bridge",
    complexity: 1, tags: ["minimal", "techno", "sparse"], bpmRange: [120, 130],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 10), "hihat-open": s(6, 14),
      clap: s(12), "tom-high": _(), "tom-low": _(), ride: s(0, 8),
    },
  },
  // --- ADDITIONAL BRIDGE VARIATIONS (4) ---
  {
    id: "elec-b12", name: "Breakdown Bridge", genre: "electronic", songPart: "bridge",
    complexity: 1, tags: ["breakdown", "simplified", "minimal"], bpmRange: [125, 135],
    pattern: {
      kick: s(0, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": _(),
      clap: s(12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-b13", name: "Intensity Build Bridge", genre: "electronic", songPart: "bridge",
    complexity: 2, tags: ["build", "intensity", "crescendo"], bpmRange: [128, 138],
    pattern: {
      kick: s(0, 4, 8, 10, 12, 14), snare: s(4, 8, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": _(), clap: s(4, 8, 12), "tom-high": s(13, 14, 15), "tom-low": s(10, 11, 12), ride: _(),
    },
  },
  {
    id: "elec-b14", name: "Rhythmic Shift Bridge", genre: "electronic", songPart: "bridge",
    complexity: 3, tags: ["rhythmic-shift", "syncopated", "experimental"], bpmRange: [125, 135],
    pattern: {
      kick: s(0, 3, 6, 9, 12, 15), snare: s(6, 14),
      "hihat-closed": s(0, 3, 6, 9, 12, 15), "hihat-open": s(7, 15),
      clap: _(), "tom-high": s(3, 9), "tom-low": s(6, 12), ride: _(),
    },
  },
  {
    id: "elec-b15", name: "Synth Solo Bridge", genre: "electronic", songPart: "bridge",
    complexity: 1, tags: ["solo", "minimal", "atmospheric"], bpmRange: [120, 130],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(2, 10), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-b16", name: "Double-Time Intensity", genre: "electronic", songPart: "bridge",
    complexity: 3, tags: ["double-time", "intense", "fast"], bpmRange: [130, 140],
    pattern: {
      kick: s(0, 2, 4, 6, 8, 10, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(7, 15), clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-b17", name: "Percussion Break", genre: "electronic", songPart: "bridge",
    complexity: 2, tags: ["percussion", "toms", "break"], bpmRange: [125, 135],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: s(4, 12), "tom-high": s(2, 6, 10, 14), "tom-low": s(3, 7, 11, 15), ride: _(),
    },
  },
  {
    id: "elec-b18", name: "Minimal Stripped", genre: "electronic", songPart: "bridge",
    complexity: 1, tags: ["minimal", "stripped", "sparse"], bpmRange: [120, 130],
    pattern: {
      kick: s(0, 12), snare: _(),
      "hihat-closed": s(2, 10), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-b19", name: "Reverse Pattern Bridge", genre: "electronic", songPart: "bridge",
    complexity: 2, tags: ["reverse", "experimental", "creative"], bpmRange: [125, 135],
    pattern: {
      kick: s(1, 5, 9, 13), snare: s(3, 11),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6, 14),
      clap: _(), "tom-high": s(15, 14, 13), "tom-low": _(), ride: s(2, 6, 10, 14),
    },
  },
  // --- OUTRO (4) ---
  {
    id: "elec-o1", name: "Fade Outro", genre: "electronic", songPart: "outro",
    complexity: 1, tags: ["fade", "gradual", "ending"], bpmRange: [125, 135],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(2, 10), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-o2", name: "Hard Stop Outro", genre: "electronic", songPart: "outro",
    complexity: 1, tags: ["hard-stop", "immediate", "abrupt"], bpmRange: [125, 135],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": s(7, 15),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0),
    },
  },
  {
    id: "elec-o3", name: "Echo Outro", genre: "electronic", songPart: "outro",
    complexity: 2, tags: ["echo", "reverb-tail", "atmospheric"], bpmRange: [120, 130],
    pattern: {
      kick: s(0, 12), snare: _(),
      "hihat-closed": s(2, 10), "hihat-open": s(14),
      clap: s(12), "tom-high": s(15), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "elec-o4", name: "Loop Outro", genre: "electronic", songPart: "outro",
    complexity: 1, tags: ["loop", "minimal", "repetitive"], bpmRange: [125, 133],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 10), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-o5", name: "Reverse Pattern Ending", genre: "electronic", songPart: "outro",
    complexity: 2, tags: ["reverse", "experimental", "ending"], bpmRange: [125, 135],
    pattern: {
      kick: s(15, 13, 11, 9, 7, 5, 3, 1), snare: s(14, 12),
      "hihat-closed": s(15, 14, 13, 12, 11, 10, 9, 8), "hihat-open": _(),
      clap: _(), "tom-high": s(15), "tom-low": s(14), ride: _(),
    },
  },
  {
    id: "elec-o6", name: "Gradual Element Removal", genre: "electronic", songPart: "outro",
    complexity: 1, tags: ["gradual", "fade", "strip"], bpmRange: [125, 133],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(2, 10), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "elec-o7", name: "Reverb Tail Outro", genre: "electronic", songPart: "outro",
    complexity: 2, tags: ["reverb", "atmospheric", "tail"], bpmRange: [120, 130],
    pattern: {
      kick: s(0, 12), snare: _(),
      "hihat-closed": _(), "hihat-open": s(14),
      clap: s(4), "tom-high": s(15), "tom-low": _(), ride: s(0, 8, 12, 14),
    },
  },
  {
    id: "elec-o8", name: "Echo Fade Outro", genre: "electronic", songPart: "outro",
    complexity: 2, tags: ["echo", "fade", "decay"], bpmRange: [125, 133],
    pattern: {
      kick: s(0, 8), snare: s(12),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
];

// =====================================================================
// POP PATTERNS
// =====================================================================
const popPatterns: PatternVariant[] = [
  // --- INTRO (4) ---
  {
    id: "pop-i1", name: "Minimal Start", genre: "pop", songPart: "intro",
    complexity: 1, tags: ["minimal", "kick-only", "clean"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-i2", name: "Build-Up Intro", genre: "pop", songPart: "intro",
    complexity: 2, tags: ["build-up", "gradual", "anticipation"], bpmRange: [118, 125],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": s(14, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-i3", name: "Drop Intro", genre: "pop", songPart: "intro",
    complexity: 2, tags: ["drop", "immediate", "full-energy"], bpmRange: [120, 128],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "pop-i4", name: "Ambient Intro", genre: "pop", songPart: "intro",
    complexity: 1, tags: ["ambient", "soft", "atmospheric"], bpmRange: [110, 120],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(4, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "pop-i5", name: "Reverse Cymbal Build", genre: "pop", songPart: "intro",
    complexity: 2, tags: ["reverse", "build", "cinematic"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(15),
      clap: _(), "tom-high": s(12, 14), "tom-low": s(13, 15), ride: s(12, 13, 14, 15),
    },
  },
  {
    id: "pop-i6", name: "Filtered Build", genre: "pop", songPart: "intro",
    complexity: 2, tags: ["filter", "sweep", "build"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(0, 4, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(8, 10, 12, 14, 15),
    },
  },
  {
    id: "pop-i7", name: "Percussion Roll Intro", genre: "pop", songPart: "intro",
    complexity: 2, tags: ["percussion", "roll", "dynamic"], bpmRange: [115, 122],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(8, 10, 12, 14), "hihat-open": _(),
      clap: s(12, 13, 14, 15), "tom-high": s(8, 9, 10, 11, 12, 13), "tom-low": s(14, 15), ride: _(),
    },
  },
  {
    id: "pop-i8", name: "Minimal Kick Build", genre: "pop", songPart: "intro",
    complexity: 1, tags: ["minimal", "sparse", "kick"], bpmRange: [110, 120],
    pattern: {
      kick: s(0, 12, 14), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // --- VERSE (9) ---
  {
    id: "pop-v1", name: "Clean Pop Verse", genre: "pop", songPart: "verse",
    complexity: 1, tags: ["clean", "polished", "classic"], bpmRange: [110, 120],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-v2", name: "Dance Pop Verse", genre: "pop", songPart: "verse",
    complexity: 2, tags: ["dance", "energetic", "syncopated"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 6, 8, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-v3", name: "Indie Pop Sparse", genre: "pop", songPart: "verse",
    complexity: 1, tags: ["indie", "clean", "minimal"], bpmRange: [100, 115],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-v4", name: "Synth Pop 80s", genre: "pop", songPart: "verse",
    complexity: 2, tags: ["synth", "80s", "clean"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-v5", name: "Power Pop Verse", genre: "pop", songPart: "verse",
    complexity: 2, tags: ["power", "energetic", "driving"], bpmRange: [120, 130],
    pattern: {
      kick: s(0, 6, 8, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-v6", name: "Ballad Pop Soft", genre: "pop", songPart: "verse",
    complexity: 1, tags: ["ballad", "clean", "minimal"], bpmRange: [70, 90],
    pattern: {
      kick: s(0, 10), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  {
    id: "pop-v7", name: "Modern Pop Trap", genre: "pop", songPart: "verse",
    complexity: 2, tags: ["modern", "trap", "syncopated"], bpmRange: [110, 120],
    pattern: {
      kick: s(0, 7, 8), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-v8", name: "Funk Pop Groove", genre: "pop", songPart: "verse",
    complexity: 3, tags: ["funk", "groovy", "syncopated"], bpmRange: [105, 120],
    pattern: {
      kick: s(0, 3, 8, 11), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-v9", name: "Electro Pop Verse", genre: "pop", songPart: "verse",
    complexity: 2, tags: ["electro", "clean", "polished"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // --- CHORUS (8) ---
  {
    id: "pop-c1", name: "Dance Pop Energy", genre: "pop", songPart: "chorus",
    complexity: 2, tags: ["dance", "energetic", "four-on-the-floor"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(3, 11), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-c2", name: "Power Pop Full", genre: "pop", songPart: "chorus",
    complexity: 2, tags: ["power", "energetic", "build-up"], bpmRange: [120, 130],
    pattern: {
      kick: s(0, 6, 8, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(7, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-c3", name: "Anthemic Chorus", genre: "pop", songPart: "chorus",
    complexity: 3, tags: ["anthemic", "dynamic", "build-up"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(7, 15),
      clap: s(4, 8, 12), "tom-high": s(3, 7, 11, 15), "tom-low": s(2, 6, 10, 14), ride: _(),
    },
  },
  {
    id: "pop-c4", name: "Indie Pop Full", genre: "pop", songPart: "chorus",
    complexity: 2, tags: ["indie", "clean", "energetic"], bpmRange: [105, 120],
    pattern: {
      kick: s(0, 5, 8, 13), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(3, 11), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-c5", name: "Synth Pop Chorus", genre: "pop", songPart: "chorus",
    complexity: 2, tags: ["synth", "80s", "four-on-the-floor"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 8, 12), "tom-high": s(7, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-c6", name: "Ballad Pop Powerful", genre: "pop", songPart: "chorus",
    complexity: 2, tags: ["ballad", "powerful", "dynamic"], bpmRange: [75, 95],
    pattern: {
      kick: s(0, 5, 8, 13), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(3, 11), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "pop-c7", name: "Modern Pop Drop", genre: "pop", songPart: "chorus",
    complexity: 3, tags: ["modern", "drop", "dynamic"], bpmRange: [110, 120],
    pattern: {
      kick: s(0, 3, 4, 7, 8, 11, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(3, 7, 11, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-c8", name: "Electro Pop Full", genre: "pop", songPart: "chorus",
    complexity: 2, tags: ["electro", "four-on-the-floor", "polished"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 4, 8, 12), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": s(6, 14),
      clap: s(4, 8, 12), "tom-high": s(3, 7, 11, 15), "tom-low": _(), ride: _(),
    },
  },
  // --- BRIDGE (8) ---
  {
    id: "pop-b1", name: "Minimal Bridge", genre: "pop", songPart: "bridge",
    complexity: 1, tags: ["minimal", "clean", "breakdown"], bpmRange: [110, 120],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-b2", name: "Dance Pop Breakdown", genre: "pop", songPart: "bridge",
    complexity: 2, tags: ["dance", "breakdown", "atmospheric"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 8), snare: s(12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-b3", name: "Build-Up Bridge", genre: "pop", songPart: "bridge",
    complexity: 3, tags: ["build-up", "dynamic", "tension"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(14),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(14),
      clap: s(8, 10, 12, 14), "tom-high": s(9, 11, 13, 15), "tom-low": s(8, 10, 12), ride: _(),
    },
  },
  {
    id: "pop-b4", name: "Indie Pop Bridge", genre: "pop", songPart: "bridge",
    complexity: 1, tags: ["indie", "clean", "sparse"], bpmRange: [100, 115],
    pattern: {
      kick: s(0, 10), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-b5", name: "Synth Pop Bridge", genre: "pop", songPart: "bridge",
    complexity: 2, tags: ["synth", "atmospheric", "clean"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(2, 6, 10, 14), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-b6", name: "Ballad Pop Bridge", genre: "pop", songPart: "bridge",
    complexity: 1, tags: ["ballad", "minimal", "atmospheric"], bpmRange: [70, 90],
    pattern: {
      kick: s(0), snare: s(12),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "pop-b7", name: "Riser Bridge", genre: "pop", songPart: "bridge",
    complexity: 3, tags: ["build-up", "riser", "tension"], bpmRange: [110, 125],
    pattern: {
      kick: s(0, 2, 4, 6, 8, 10, 12, 14), snare: _(),
      "hihat-closed": s(1, 3, 5, 7, 9, 11, 13, 15), "hihat-open": s(15),
      clap: s(4, 8, 12), "tom-high": s(7, 11, 13, 15), "tom-low": s(6, 10, 12, 14), ride: _(),
    },
  },
  {
    id: "pop-b8", name: "Filter Sweep Bridge", genre: "pop", songPart: "bridge",
    complexity: 2, tags: ["atmospheric", "clean", "build-up"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(14),
      clap: s(12), "tom-high": s(11, 15), "tom-low": _(), ride: _(),
    },
  },
  // --- NEW VERSE VARIATIONS (3) ---
  {
    id: "pop-v10", name: "K-Pop Groove", genre: "pop", songPart: "verse",
    complexity: 2, tags: ["k-pop", "energetic", "syncopated"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 6, 8, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-v11", name: "Bedroom Pop", genre: "pop", songPart: "verse",
    complexity: 1, tags: ["bedroom", "indie", "minimal"], bpmRange: [105, 115],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  {
    id: "pop-v12", name: "Electropop Verse", genre: "pop", songPart: "verse",
    complexity: 2, tags: ["electropop", "synth", "modern"], bpmRange: [118, 128],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(7, 15),
      clap: s(4, 12), "tom-high": s(3, 11), "tom-low": _(), ride: _(),
    },
  },
  // --- NEW CHORUS VARIATIONS (4) ---
  {
    id: "pop-c9", name: "Power Pop Anthem", genre: "pop", songPart: "chorus",
    complexity: 2, tags: ["power-pop", "anthem", "big"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(14, 15), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "pop-c10", name: "Tropical Pop", genre: "pop", songPart: "chorus",
    complexity: 2, tags: ["tropical", "summer", "upbeat"], bpmRange: [110, 120],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 7, 8, 11, 12, 15), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12), "tom-high": s(2, 6, 10, 14), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-c11", name: "Hyperpop Chaos", genre: "pop", songPart: "chorus",
    complexity: 3, tags: ["hyperpop", "glitchy", "experimental"], bpmRange: [140, 160],
    pattern: {
      kick: s(0, 4, 6, 8, 12, 14), snare: s(4, 10, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(3, 7, 11, 15), clap: s(4, 12),
      "tom-high": s(13, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-c12", name: "Stadium Pop", genre: "pop", songPart: "chorus",
    complexity: 2, tags: ["stadium", "epic", "massive"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": _(), "hihat-open": s(0, 2, 4, 6, 8, 10, 12, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  // --- NEW BRIDGE VARIATIONS (3) ---
  {
    id: "pop-b9", name: "Vocal Break", genre: "pop", songPart: "bridge",
    complexity: 1, tags: ["minimal", "vocal-focus", "sparse"], bpmRange: [110, 120],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: s(8), "tom-high": _(), "tom-low": _(), ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  {
    id: "pop-b10", name: "Half-Time Bridge", genre: "pop", songPart: "bridge",
    complexity: 2, tags: ["half-time", "dramatic", "contrast"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 8), snare: s(8),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6, 14),
      clap: s(8), "tom-high": s(12, 14), "tom-low": s(13, 15), ride: _(),
    },
  },
  {
    id: "pop-b11", name: "Pre-Drop Tension", genre: "pop", songPart: "bridge",
    complexity: 2, tags: ["tension", "build", "anticipation"], bpmRange: [118, 128],
    pattern: {
      kick: s(0, 4, 8, 10, 12, 14), snare: s(12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": _(), clap: s(4, 8, 10, 12, 14),
      "tom-high": s(10, 11, 13, 14, 15), "tom-low": _(), ride: _(),
    },
  },
  // --- ADDITIONAL BRIDGE VARIATIONS (4) ---
  {
    id: "pop-b12", name: "Breakdown Bridge", genre: "pop", songPart: "bridge",
    complexity: 1, tags: ["breakdown", "simplified", "minimal"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 8), snare: s(12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-b13", name: "Intensity Build Bridge", genre: "pop", songPart: "bridge",
    complexity: 2, tags: ["build", "intensity", "crescendo"], bpmRange: [118, 125],
    pattern: {
      kick: s(0, 4, 6, 8, 10, 12, 14), snare: s(4, 8, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(14),
      clap: s(4, 12), "tom-high": s(13, 14, 15), "tom-low": s(10, 11, 12), ride: _(),
    },
  },
  {
    id: "pop-b14", name: "Rhythmic Shift Bridge", genre: "pop", songPart: "bridge",
    complexity: 3, tags: ["rhythmic-shift", "syncopated", "experimental"], bpmRange: [115, 123],
    pattern: {
      kick: s(0, 3, 6, 8, 11, 14), snare: s(5, 13),
      "hihat-closed": s(0, 3, 6, 8, 11, 14), "hihat-open": s(2, 10),
      clap: _(), "tom-high": s(3, 11), "tom-low": s(6, 14), ride: _(),
    },
  },
  {
    id: "pop-b15", name: "Vocal Solo Bridge", genre: "pop", songPart: "bridge",
    complexity: 1, tags: ["solo", "minimal", "vocal-focus"], bpmRange: [110, 120],
    pattern: {
      kick: s(0), snare: s(12),
      "hihat-closed": s(4), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-b16", name: "Double-Time Intensity", genre: "pop", songPart: "bridge",
    complexity: 3, tags: ["double-time", "intense", "fast"], bpmRange: [118, 128],
    pattern: {
      kick: s(0, 2, 4, 6, 8, 10, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(7, 15), clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-b17", name: "Percussion Break", genre: "pop", songPart: "bridge",
    complexity: 2, tags: ["percussion", "toms", "break"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: s(4, 12), "tom-high": s(2, 6, 10, 14), "tom-low": s(3, 7, 11, 15), ride: _(),
    },
  },
  {
    id: "pop-b18", name: "Minimal Stripped", genre: "pop", songPart: "bridge",
    complexity: 1, tags: ["minimal", "stripped", "sparse"], bpmRange: [110, 120],
    pattern: {
      kick: s(0), snare: s(8),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-b19", name: "Reverse Pattern Bridge", genre: "pop", songPart: "bridge",
    complexity: 2, tags: ["reverse", "experimental", "creative"], bpmRange: [115, 125],
    pattern: {
      kick: s(1, 9), snare: s(3, 11),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6, 14),
      clap: _(), "tom-high": s(15, 14, 13), "tom-low": _(), ride: s(2, 6, 10, 14),
    },
  },
  // --- OUTRO (4) ---
  {
    id: "pop-o1", name: "Fade Outro", genre: "pop", songPart: "outro",
    complexity: 1, tags: ["fade", "gradual", "ending"], bpmRange: [115, 125],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-o2", name: "Hard Stop Outro", genre: "pop", songPart: "outro",
    complexity: 1, tags: ["hard-stop", "immediate", "abrupt"], bpmRange: [115, 125],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0),
    },
  },
  {
    id: "pop-o3", name: "Echo Outro", genre: "pop", songPart: "outro",
    complexity: 2, tags: ["echo", "reverb-tail", "atmospheric"], bpmRange: [110, 120],
    pattern: {
      kick: s(0, 8), snare: s(12),
      "hihat-closed": s(4, 12), "hihat-open": _(),
      clap: _(), "tom-high": s(15), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "pop-o4", name: "Loop Outro", genre: "pop", songPart: "outro",
    complexity: 1, tags: ["loop", "minimal", "repetitive"], bpmRange: [115, 123],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-o5", name: "Reverse Pattern Ending", genre: "pop", songPart: "outro",
    complexity: 2, tags: ["reverse", "experimental", "ending"], bpmRange: [115, 125],
    pattern: {
      kick: s(15, 13, 11, 9), snare: s(14, 12),
      "hihat-closed": s(15, 14, 13, 12, 11, 10, 9, 8), "hihat-open": _(),
      clap: _(), "tom-high": s(15), "tom-low": s(14), ride: _(),
    },
  },
  {
    id: "pop-o6", name: "Gradual Element Removal", genre: "pop", songPart: "outro",
    complexity: 1, tags: ["gradual", "fade", "strip"], bpmRange: [115, 123],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "pop-o7", name: "Reverb Tail Outro", genre: "pop", songPart: "outro",
    complexity: 2, tags: ["reverb", "atmospheric", "tail"], bpmRange: [110, 120],
    pattern: {
      kick: s(0, 12), snare: s(8),
      "hihat-closed": _(), "hihat-open": s(14),
      clap: _(), "tom-high": s(15), "tom-low": _(), ride: s(0, 8, 12, 14),
    },
  },
  {
    id: "pop-o8", name: "Echo Fade Outro", genre: "pop", songPart: "outro",
    complexity: 2, tags: ["echo", "fade", "decay"], bpmRange: [115, 123],
    pattern: {
      kick: s(0, 8), snare: s(12),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: s(4), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
];

// =====================================================================
// EXPANDED EMOTION PATTERNS (multiple per emotion)
// =====================================================================
export interface EmotionVariant {
  id: string;
  emotion: string;
  name: string;
  pattern: DrumPattern;
  bpm: number;
}

export const EMOTION_PATTERN_LIBRARY: EmotionVariant[] = [
  // Happy (5 variants)
  {
    id: "happy-1", emotion: "happy", name: "Sunny Bounce", bpm: 120,
    pattern: {
      kick: s(0, 4, 8, 10, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(3, 11), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "happy-2", emotion: "happy", name: "Party Groove", bpm: 115,
    pattern: {
      kick: s(0, 3, 8, 11), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(2, 10),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "happy-3", emotion: "happy", name: "Jubilant March", bpm: 125,
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(2, 4, 10, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(4, 12), "tom-high": s(14), "tom-low": s(15), ride: _(),
    },
  },
  {
    id: "happy-4", emotion: "happy", name: "Funky Joy", bpm: 110,
    pattern: {
      kick: s(0, 6, 8, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": s(3, 11), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "happy-5", emotion: "happy", name: "Bright Pop", bpm: 118,
    pattern: {
      kick: s(0, 4, 6, 8, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  // Sad (5 variants)
  {
    id: "sad-1", emotion: "sad", name: "Rain Drops", bpm: 72,
    pattern: {
      kick: s(0, 10), snare: s(8),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": s(14), ride: s(0, 6, 12),
    },
  },
  {
    id: "sad-2", emotion: "sad", name: "Lonely Night", bpm: 68,
    pattern: {
      kick: s(0, 12), snare: s(8),
      "hihat-closed": _(), "hihat-open": s(4, 12),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "sad-3", emotion: "sad", name: "Funeral March", bpm: 60,
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": s(2, 10), ride: _(),
    },
  },
  {
    id: "sad-4", emotion: "sad", name: "Distant Memory", bpm: 75,
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: s(12), "tom-high": _(), "tom-low": _(), ride: s(0, 6, 8, 14),
    },
  },
  {
    id: "sad-5", emotion: "sad", name: "Fading Light", bpm: 65,
    pattern: {
      kick: s(0, 10), snare: s(4),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: _(), "tom-high": s(12), "tom-low": s(14), ride: _(),
    },
  },
  // Aggressive (5 variants)
  {
    id: "agg-1", emotion: "aggressive", name: "Relentless", bpm: 140,
    pattern: {
      kick: s(0, 2, 4, 6, 8, 10, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(3, 7, 11, 15), clap: s(4, 8, 12),
      "tom-high": s(13, 14), "tom-low": s(15), ride: _(),
    },
  },
  {
    id: "agg-2", emotion: "aggressive", name: "War March", bpm: 135,
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(0, 2, 4, 6, 8, 10, 12, 14),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "agg-3", emotion: "aggressive", name: "Blast Beat", bpm: 160,
    pattern: {
      kick: s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      snare: s(1, 3, 5, 7, 9, 11, 13, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": _(), clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "agg-4", emotion: "aggressive", name: "Chaos Engine", bpm: 145,
    pattern: {
      kick: s(0, 3, 5, 8, 10, 13, 15), snare: s(4, 7, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(1, 5, 9, 13),
      clap: s(4, 12), "tom-high": s(6, 14), "tom-low": s(7, 15), ride: _(),
    },
  },
  {
    id: "agg-5", emotion: "aggressive", name: "Demolition", bpm: 150,
    pattern: {
      kick: s(0, 2, 6, 8, 10, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(3, 11), clap: s(4, 8, 12, 15),
      "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // Calm (5 variants)
  {
    id: "calm-1", emotion: "calm", name: "Gentle Pulse", bpm: 85,
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(4, 12), "hihat-open": _(),
      clap: s(8), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "calm-2", emotion: "calm", name: "Morning Dew", bpm: 80,
    pattern: {
      kick: s(0, 10), snare: _(),
      "hihat-closed": _(), "hihat-open": s(4, 12),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "calm-3", emotion: "calm", name: "Zen Garden", bpm: 75,
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(8), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": s(12), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "calm-4", emotion: "calm", name: "Floating", bpm: 90,
    pattern: {
      kick: s(0, 8), snare: s(12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "calm-5", emotion: "calm", name: "Still Water", bpm: 70,
    pattern: {
      kick: s(0, 12), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": s(4), "tom-low": s(8), ride: s(0, 8),
    },
  },
  // Anxious (5 variants)
  {
    id: "anx-1", emotion: "anxious", name: "Nervous Tick", bpm: 135,
    pattern: {
      kick: s(0, 3, 5, 9, 11, 14), snare: s(2, 7, 13),
      "hihat-closed": s(0, 1, 3, 4, 6, 8, 9, 11, 12, 14), "hihat-open": s(5, 10, 15),
      clap: s(1, 7, 11), "tom-high": s(3, 9), "tom-low": s(6, 14), ride: _(),
    },
  },
  {
    id: "anx-2", emotion: "anxious", name: "Racing Thoughts", bpm: 140,
    pattern: {
      kick: s(0, 1, 5, 8, 9, 13), snare: s(4, 10),
      "hihat-closed": s(0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15), "hihat-open": s(3, 11),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "anx-3", emotion: "anxious", name: "Restless", bpm: 130,
    pattern: {
      kick: s(0, 2, 7, 8, 10, 15), snare: s(5, 13),
      "hihat-closed": s(0, 1, 2, 4, 6, 8, 9, 10, 12, 14), "hihat-open": s(3, 7, 11),
      clap: s(6, 14), "tom-high": s(1), "tom-low": s(9), ride: _(),
    },
  },
  {
    id: "anx-4", emotion: "anxious", name: "Paranoia", bpm: 138,
    pattern: {
      kick: s(0, 4, 6, 10, 12), snare: s(3, 9, 15),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": _(), clap: s(2, 8, 14), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "anx-5", emotion: "anxious", name: "Jittery", bpm: 142,
    pattern: {
      kick: s(0, 5, 11), snare: s(3, 7, 13),
      "hihat-closed": s(0, 2, 4, 5, 6, 8, 10, 12, 13, 14), "hihat-open": s(1, 9),
      clap: s(7, 15), "tom-high": s(4, 12), "tom-low": s(8), ride: _(),
    },
  },
  // Romantic (5 variants)
  {
    id: "rom-1", emotion: "romantic", name: "Heartbeat", bpm: 95,
    pattern: {
      kick: s(0, 6, 10), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 3, 4, 6, 8, 11, 12, 14),
    },
  },
  {
    id: "rom-2", emotion: "romantic", name: "Candlelight", bpm: 90,
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "rom-3", emotion: "romantic", name: "Slow Dance", bpm: 85,
    pattern: {
      kick: s(0, 6, 8, 14), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "rom-4", emotion: "romantic", name: "Serenade", bpm: 100,
    pattern: {
      kick: s(0, 5, 8, 13), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 3, 4, 6, 8, 11, 12, 14),
    },
  },
  {
    id: "rom-5", emotion: "romantic", name: "Embrace", bpm: 92,
    pattern: {
      kick: s(0, 10), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": s(3), "tom-low": _(), ride: _(),
    },
  },
];

// =====================================================================
// HIP-HOP PATTERNS
// =====================================================================
const hipHopPatterns: PatternVariant[] = [
  // --- INTRO (4) ---
  {
    id: "hiphop-i1", name: "Minimal Start", genre: "hip-hop", songPart: "intro",
    complexity: 1, tags: ["minimal", "kick-only", "boom-bap"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-i2", name: "Build-Up Intro", genre: "hip-hop", songPart: "intro",
    complexity: 2, tags: ["build-up", "gradual", "anticipation"], bpmRange: [88, 98],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": s(14, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-i3", name: "Drop Intro", genre: "hip-hop", songPart: "intro",
    complexity: 2, tags: ["drop", "immediate", "full-groove"], bpmRange: [90, 100],
    pattern: {
      kick: s(0, 3, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(7, 15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-i4", name: "Ambient Intro", genre: "hip-hop", songPart: "intro",
    complexity: 1, tags: ["ambient", "soft", "atmospheric"], bpmRange: [80, 95],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(4, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "hiphop-i5", name: "Reverse Cymbal Build", genre: "hip-hop", songPart: "intro",
    complexity: 2, tags: ["reverse", "build", "cinematic"], bpmRange: [88, 98],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(15),
      clap: _(), "tom-high": s(12, 14), "tom-low": s(13, 15), ride: s(12, 13, 14, 15),
    },
  },
  {
    id: "hiphop-i6", name: "Filtered Build", genre: "hip-hop", songPart: "intro",
    complexity: 2, tags: ["filter", "sweep", "build"], bpmRange: [88, 98],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(0, 4, 8, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(8, 10, 12, 14, 15),
    },
  },
  {
    id: "hiphop-i7", name: "Percussion Roll Intro", genre: "hip-hop", songPart: "intro",
    complexity: 2, tags: ["percussion", "roll", "dynamic"], bpmRange: [90, 98],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(8, 10, 12, 14), "hihat-open": _(),
      clap: s(12, 13, 14, 15), "tom-high": s(8, 9, 10, 11, 12, 13), "tom-low": s(14, 15), ride: _(),
    },
  },
  {
    id: "hiphop-i8", name: "Minimal Kick Build", genre: "hip-hop", songPart: "intro",
    complexity: 1, tags: ["minimal", "sparse", "kick"], bpmRange: [85, 95],
    pattern: {
      kick: s(0, 10, 14), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // --- VERSE (8) ---
  {
    id: "hiphop-v1", name: "Classic Boom Bap", genre: "hip-hop", songPart: "verse",
    complexity: 1, tags: ["boom-bap", "classic", "swing"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 3, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(7, 15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-v2", name: "Modern Hip-Hop", genre: "hip-hop", songPart: "verse",
    complexity: 2, tags: ["modern", "punchy"], bpmRange: [90, 105],
    pattern: {
      kick: s(0, 5, 8, 13), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 11),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-v3", name: "Jazzy Flow", genre: "hip-hop", songPart: "verse",
    complexity: 3, tags: ["jazzy", "swing", "ghost-notes"], bpmRange: [80, 95],
    pattern: {
      kick: s(0, 3, 7, 10), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(7, 15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 3, 4, 6, 8, 11, 12, 14),
    },
  },
  {
    id: "hiphop-v4", name: "Hard Knock", genre: "hip-hop", songPart: "verse",
    complexity: 2, tags: ["hard", "aggressive", "punchy"], bpmRange: [90, 110],
    pattern: {
      kick: s(0, 3, 6, 8, 11, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-v5", name: "Boom Bap Swing", genre: "hip-hop", songPart: "verse",
    complexity: 2, tags: ["boom-bap", "swing", "unexpected"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 5, 8, 11), snare: s(4, 13),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(7),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "hiphop-v6", name: "West Coast Groove", genre: "hip-hop", songPart: "verse",
    complexity: 2, tags: ["west-coast", "funky", "groove"], bpmRange: [90, 105],
    pattern: {
      kick: s(0, 4, 8, 10, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-v7", name: "East Coast Raw", genre: "hip-hop", songPart: "verse",
    complexity: 2, tags: ["east-coast", "raw", "gritty"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 3, 9, 11), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 7, 11, 15),
      clap: s(12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-v8", name: "Chopped Soul", genre: "hip-hop", songPart: "verse",
    complexity: 3, tags: ["chopped", "soulful", "kanye"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 6, 8, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(4, 12), "tom-high": s(14), "tom-low": _(), ride: _(),
    },
  },
  // --- CHORUS (8) ---
  {
    id: "hiphop-c1", name: "Classic Full", genre: "hip-hop", songPart: "chorus",
    complexity: 2, tags: ["full", "energetic", "boom-bap"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 3, 6, 8, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12), "tom-high": s(14), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "hiphop-c2", name: "Boom Bap Power", genre: "hip-hop", songPart: "chorus",
    complexity: 2, tags: ["boom-bap", "powerful", "heavy"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 3, 5, 8, 11, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(7, 15),
      clap: s(4, 12), "tom-high": s(6, 14), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-c3", name: "Modern Anthem", genre: "hip-hop", songPart: "chorus",
    complexity: 3, tags: ["modern", "anthem", "big"], bpmRange: [90, 105],
    pattern: {
      kick: s(0, 4, 8, 10, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(6, 14), clap: s(4, 8, 12),
      "tom-high": s(3, 11), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-c4", name: "Jazzy Hook", genre: "hip-hop", songPart: "chorus",
    complexity: 3, tags: ["jazzy", "swing", "melodic"], bpmRange: [80, 95],
    pattern: {
      kick: s(0, 3, 7, 10, 14), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(7, 15),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 3, 4, 6, 8, 11, 12, 14),
    },
  },
  {
    id: "hiphop-c5", name: "Hard Chorus", genre: "hip-hop", songPart: "chorus",
    complexity: 2, tags: ["hard", "aggressive"], bpmRange: [90, 110],
    pattern: {
      kick: s(0, 2, 6, 8, 10, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 8, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-c6", name: "West Coast Party", genre: "hip-hop", songPart: "chorus",
    complexity: 2, tags: ["west-coast", "party", "funky"], bpmRange: [90, 105],
    pattern: {
      kick: s(0, 4, 6, 8, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(3, 11), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-c7", name: "Soul Sample", genre: "hip-hop", songPart: "chorus",
    complexity: 2, tags: ["soulful", "groovy"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 3, 8, 10, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(7, 15),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "hiphop-c8", name: "Chopped Hook", genre: "hip-hop", songPart: "chorus",
    complexity: 3, tags: ["chopped", "dynamic"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 5, 8, 13), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(3, 11),
      clap: s(4, 12), "tom-high": s(14, 15), "tom-low": _(), ride: _(),
    },
  },
  // --- BRIDGE (9) ---
  {
    id: "hiphop-b1", name: "Stripped Back", genre: "hip-hop", songPart: "bridge",
    complexity: 1, tags: ["minimal", "sparse"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 10), snare: s(8),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: s(12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "hiphop-b2", name: "Half-Time Boom", genre: "hip-hop", songPart: "bridge",
    complexity: 1, tags: ["half-time", "atmospheric"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 8), snare: s(8),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(14),
      clap: _(), "tom-high": _(), "tom-low": s(6), ride: _(),
    },
  },
  {
    id: "hiphop-b3", name: "Jazz Interlude", genre: "hip-hop", songPart: "bridge",
    complexity: 3, tags: ["jazzy", "interlude"], bpmRange: [80, 95],
    pattern: {
      kick: s(0, 7, 10), snare: s(4),
      "hihat-closed": s(0, 3, 6, 11, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 3, 4, 6, 8, 11, 12, 14),
    },
  },
  {
    id: "hiphop-b4", name: "Cymbal Ride", genre: "hip-hop", songPart: "bridge",
    complexity: 2, tags: ["ride", "mellow"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 10), snare: s(4, 12),
      "hihat-closed": _(), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  {
    id: "hiphop-b5", name: "Breakdown Beat", genre: "hip-hop", songPart: "bridge",
    complexity: 2, tags: ["breakdown", "sparse"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 6, 14), snare: s(8),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(14),
      clap: s(12), "tom-high": s(10), "tom-low": s(14), ride: _(),
    },
  },
  {
    id: "hiphop-b6", name: "Atmospheric Break", genre: "hip-hop", songPart: "bridge",
    complexity: 1, tags: ["atmospheric", "ethereal"], bpmRange: [80, 95],
    pattern: {
      kick: s(0, 12), snare: _(),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6),
      clap: s(8), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "hiphop-b7", name: "Tom Groove", genre: "hip-hop", songPart: "bridge",
    complexity: 2, tags: ["toms", "tribal"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 8), snare: s(12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": s(4, 10), "tom-low": s(6, 14), ride: _(),
    },
  },
  {
    id: "hiphop-b8", name: "Lo-Fi Bridge", genre: "hip-hop", songPart: "bridge",
    complexity: 2, tags: ["lo-fi", "dusty"], bpmRange: [75, 90],
    pattern: {
      kick: s(0, 3, 10), snare: s(4),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "hiphop-b9", name: "Clap Accent", genre: "hip-hop", songPart: "bridge",
    complexity: 1, tags: ["clap", "minimal"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 2, 4, 6, 8, 10, 12, 14),
    },
  },
  // --- NEW VERSE VARIATIONS (3) ---
  {
    id: "hiphop-v10", name: "G-Funk Bounce", genre: "hip-hop", songPart: "verse",
    complexity: 2, tags: ["g-funk", "west-coast", "bounce"], bpmRange: [88, 98],
    pattern: {
      kick: s(0, 3, 8, 11), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(3, 7, 11, 15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-v11", name: "Drill Beat", genre: "hip-hop", songPart: "verse",
    complexity: 2, tags: ["drill", "dark", "sliding-808"], bpmRange: [135, 145],
    pattern: {
      kick: s(0, 6, 10, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(7, 15), clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-v12", name: "Jazz Rap Groove", genre: "hip-hop", songPart: "verse",
    complexity: 3, tags: ["jazz-rap", "sophisticated", "swing"], bpmRange: [85, 95],
    pattern: {
      kick: s(0, 5, 8, 13), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(3, 7, 11, 15),
      clap: _(), "tom-high": s(7, 15), "tom-low": _(), ride: s(0, 3, 4, 8, 11, 12),
    },
  },
  // --- NEW CHORUS VARIATIONS (4) ---
  {
    id: "hiphop-c10", name: "Hype Chorus", genre: "hip-hop", songPart: "chorus",
    complexity: 2, tags: ["hype", "energetic", "club"], bpmRange: [95, 105],
    pattern: {
      kick: s(0, 4, 6, 8, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": s(14, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-c11", name: "West Coast Anthem", genre: "hip-hop", songPart: "chorus",
    complexity: 2, tags: ["west-coast", "anthem", "groovy"], bpmRange: [90, 100],
    pattern: {
      kick: s(0, 3, 8, 11), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 6, 8, 11, 12, 14), "hihat-open": s(3, 7, 11, 15),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "hiphop-c12", name: "Brooklyn Drill", genre: "hip-hop", songPart: "chorus",
    complexity: 3, tags: ["drill", "brooklyn", "aggressive"], bpmRange: [140, 150],
    pattern: {
      kick: s(0, 5, 7, 10, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(6, 14), clap: s(4, 12),
      "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-c13", name: "Trap Soul", genre: "hip-hop", songPart: "chorus",
    complexity: 2, tags: ["trap-soul", "melodic", "smooth"], bpmRange: [70, 85],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 3, 4, 7, 8, 11, 12, 15), "hihat-open": s(7, 15),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  // --- NEW BRIDGE VARIATIONS (3) ---
  {
    id: "hiphop-b10", name: "Acapella Break", genre: "hip-hop", songPart: "bridge",
    complexity: 1, tags: ["acapella", "minimal", "vocal-focus"], bpmRange: [90, 100],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: s(4, 8, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-b11", name: "Turntable Scratch", genre: "hip-hop", songPart: "bridge",
    complexity: 2, tags: ["scratch", "dj", "turntablism"], bpmRange: [88, 98],
    pattern: {
      kick: s(0, 8), snare: s(4, 12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6, 14),
      clap: s(2, 6, 10, 14), "tom-high": s(3, 7, 11, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-b12", name: "Orchestral Build", genre: "hip-hop", songPart: "bridge",
    complexity: 2, tags: ["orchestral", "cinematic", "epic"], bpmRange: [85, 95],
    pattern: {
      kick: s(0, 12), snare: s(8),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: s(4, 12), "tom-high": s(10, 11, 13, 14), "tom-low": s(12, 13, 15), ride: s(0, 4, 8, 12),
    },
  },
  // --- ADDITIONAL BRIDGE VARIATIONS (4) ---
  {
    id: "hiphop-b13", name: "Breakdown Bridge", genre: "hip-hop", songPart: "bridge",
    complexity: 1, tags: ["breakdown", "simplified", "minimal"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 10), snare: s(12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-b14", name: "Intensity Build Bridge", genre: "hip-hop", songPart: "bridge",
    complexity: 2, tags: ["build", "intensity", "crescendo"], bpmRange: [88, 98],
    pattern: {
      kick: s(0, 3, 6, 8, 10, 12), snare: s(4, 8, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(14),
      clap: s(4, 12), "tom-high": s(13, 14, 15), "tom-low": s(10, 11, 12), ride: _(),
    },
  },
  {
    id: "hiphop-b15", name: "Rhythmic Shift Bridge", genre: "hip-hop", songPart: "bridge",
    complexity: 3, tags: ["rhythmic-shift", "triplet", "experimental"], bpmRange: [85, 95],
    pattern: {
      kick: s(0, 5, 10), snare: s(8),
      "hihat-closed": s(0, 5, 10), "hihat-open": s(3, 13),
      clap: _(), "tom-high": s(3, 8), "tom-low": s(5, 13), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "hiphop-b16", name: "Sample Solo Bridge", genre: "hip-hop", songPart: "bridge",
    complexity: 1, tags: ["solo", "minimal", "sample-focus"], bpmRange: [80, 95],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "hiphop-b17", name: "Double-Time Intensity", genre: "hip-hop", songPart: "bridge",
    complexity: 3, tags: ["double-time", "intense", "fast"], bpmRange: [95, 105],
    pattern: {
      kick: s(0, 2, 4, 6, 8, 10, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(7, 15), clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-b18", name: "Percussion Break", genre: "hip-hop", songPart: "bridge",
    complexity: 2, tags: ["percussion", "toms", "break"], bpmRange: [88, 98],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: s(4, 12), "tom-high": s(2, 6, 10, 14), "tom-low": s(3, 7, 11, 15), ride: _(),
    },
  },
  {
    id: "hiphop-b19", name: "Minimal Stripped", genre: "hip-hop", songPart: "bridge",
    complexity: 1, tags: ["minimal", "stripped", "sparse"], bpmRange: [85, 95],
    pattern: {
      kick: s(0, 10), snare: s(12),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-b20", name: "Reverse Pattern Bridge", genre: "hip-hop", songPart: "bridge",
    complexity: 2, tags: ["reverse", "experimental", "creative"], bpmRange: [88, 98],
    pattern: {
      kick: s(1, 11), snare: s(3),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6, 14),
      clap: _(), "tom-high": s(15, 14, 13), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  // --- OUTRO (4) ---
  {
    id: "hiphop-o1", name: "Fade Outro", genre: "hip-hop", songPart: "outro",
    complexity: 1, tags: ["fade", "gradual", "ending"], bpmRange: [85, 100],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "hiphop-o2", name: "Hard Stop Outro", genre: "hip-hop", songPart: "outro",
    complexity: 1, tags: ["hard-stop", "immediate", "abrupt"], bpmRange: [85, 100],
    pattern: {
      kick: s(0, 3, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(7, 15),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0),
    },
  },
  {
    id: "hiphop-o3", name: "Echo Outro", genre: "hip-hop", songPart: "outro",
    complexity: 2, tags: ["echo", "reverb-tail", "atmospheric"], bpmRange: [80, 95],
    pattern: {
      kick: s(0, 10), snare: s(12),
      "hihat-closed": s(4, 12), "hihat-open": _(),
      clap: _(), "tom-high": s(15), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
  {
    id: "hiphop-o4", name: "Loop Outro", genre: "hip-hop", songPart: "outro",
    complexity: 1, tags: ["loop", "minimal", "repetitive"], bpmRange: [85, 98],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "hiphop-o5", name: "Reverse Pattern Ending", genre: "hip-hop", songPart: "outro",
    complexity: 2, tags: ["reverse", "experimental", "ending"], bpmRange: [85, 98],
    pattern: {
      kick: s(15, 13, 11, 9), snare: s(14, 12),
      "hihat-closed": s(15, 14, 13, 12, 11, 10, 9, 8), "hihat-open": _(),
      clap: _(), "tom-high": s(15), "tom-low": s(14), ride: _(),
    },
  },
  {
    id: "hiphop-o6", name: "Gradual Element Removal", genre: "hip-hop", songPart: "outro",
    complexity: 1, tags: ["gradual", "fade", "strip"], bpmRange: [85, 95],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: s(0),
    },
  },
  {
    id: "hiphop-o7", name: "Reverb Tail Outro", genre: "hip-hop", songPart: "outro",
    complexity: 2, tags: ["reverb", "atmospheric", "tail"], bpmRange: [85, 95],
    pattern: {
      kick: s(0, 10), snare: s(12),
      "hihat-closed": _(), "hihat-open": s(14),
      clap: _(), "tom-high": s(15), "tom-low": _(), ride: s(0, 4, 8, 12, 14),
    },
  },
  {
    id: "hiphop-o8", name: "Echo Fade Outro", genre: "hip-hop", songPart: "outro",
    complexity: 2, tags: ["echo", "fade", "decay"], bpmRange: [85, 98],
    pattern: {
      kick: s(0, 8), snare: s(12),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: s(4), "tom-high": _(), "tom-low": _(), ride: s(0, 4, 8, 12),
    },
  },
];

// =====================================================================
// TRAP PATTERNS
// =====================================================================
const trapPatterns: PatternVariant[] = [
  // --- INTRO (4) ---
  {
    id: "trap-i1", name: "Minimal Start", genre: "trap", songPart: "intro",
    complexity: 1, tags: ["minimal", "kick-only", "808"], bpmRange: [135, 150],
    pattern: {
      kick: s(0, 10), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-i2", name: "Build-Up Intro", genre: "trap", songPart: "intro",
    complexity: 2, tags: ["build-up", "gradual", "anticipation"], bpmRange: [138, 150],
    pattern: {
      kick: s(0, 10), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": s(14, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-i3", name: "Drop Intro", genre: "trap", songPart: "intro",
    complexity: 2, tags: ["drop", "immediate", "full-energy"], bpmRange: [140, 155],
    pattern: {
      kick: s(0, 7, 10), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(6, 14), clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-i4", name: "Ambient Intro", genre: "trap", songPart: "intro",
    complexity: 1, tags: ["ambient", "soft", "atmospheric"], bpmRange: [130, 145],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(4, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-i5", name: "Reverse Cymbal Build", genre: "trap", songPart: "intro",
    complexity: 2, tags: ["reverse", "build", "cinematic"], bpmRange: [140, 150],
    pattern: {
      kick: s(0, 10), snare: _(),
      "hihat-closed": s(8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": s(15),
      clap: _(), "tom-high": s(12, 14), "tom-low": s(13, 15), ride: _(),
    },
  },
  {
    id: "trap-i6", name: "Filtered Build", genre: "trap", songPart: "intro",
    complexity: 2, tags: ["filter", "sweep", "build"], bpmRange: [140, 150],
    pattern: {
      kick: s(0, 10), snare: _(),
      "hihat-closed": s(0, 4, 8, 12, 14), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-i7", name: "Percussion Roll Intro", genre: "trap", songPart: "intro",
    complexity: 2, tags: ["percussion", "roll", "dynamic"], bpmRange: [140, 148],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(8, 9, 10, 11, 12, 13, 14, 15), "hihat-open": _(),
      clap: s(12, 13, 14, 15), "tom-high": s(8, 9, 10, 11, 12, 13), "tom-low": s(14, 15), ride: _(),
    },
  },
  {
    id: "trap-i8", name: "Minimal Kick Build", genre: "trap", songPart: "intro",
    complexity: 1, tags: ["minimal", "sparse", "kick"], bpmRange: [135, 145],
    pattern: {
      kick: s(0, 10, 14), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // --- VERSE (8) ---
  {
    id: "trap-v1", name: "Classic Trap", genre: "trap", songPart: "verse",
    complexity: 2, tags: ["classic", "half-time", "rolling-hats"], bpmRange: [135, 155],
    pattern: {
      kick: s(0, 7, 10), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(6, 14), clap: _(),
      "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-v2", name: "Roll Heavy", genre: "trap", songPart: "verse",
    complexity: 3, tags: ["rolling-hats", "hi-hat-rolls", "rhythmic"], bpmRange: [140, 155],
    pattern: {
      kick: s(0, 10), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(3, 7, 11, 15), clap: s(4, 12),
      "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-v3", name: "Triplet Flow", genre: "trap", songPart: "verse",
    complexity: 3, tags: ["triplet", "bounce", "hi-hat-triplets"], bpmRange: [135, 150],
    pattern: {
      kick: s(0, 5, 10), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14),
      "hihat-open": s(3, 7, 11, 15), clap: _(),
      "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-v4", name: "808 Heavy", genre: "trap", songPart: "verse",
    complexity: 2, tags: ["808", "heavy-bass", "deep"], bpmRange: [130, 150],
    pattern: {
      kick: s(0, 3, 7, 8, 11, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-v5", name: "Minimal Trap", genre: "trap", songPart: "verse",
    complexity: 1, tags: ["minimal", "sparse", "atmospheric"], bpmRange: [135, 150],
    pattern: {
      kick: s(0, 10), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-v6", name: "Double Time", genre: "trap", songPart: "verse",
    complexity: 3, tags: ["double-time", "fast", "energetic"], bpmRange: [140, 160],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(2, 6, 10, 14),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(3, 7, 11, 15), clap: s(4, 12),
      "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-v7", name: "Drill Verse", genre: "trap", songPart: "verse",
    complexity: 2, tags: ["drill", "dark", "sliding-808"], bpmRange: [140, 150],
    pattern: {
      kick: s(0, 5, 8, 13), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(7, 15), clap: s(4, 12),
      "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-v8", name: "Atlanta Bounce", genre: "trap", songPart: "verse",
    complexity: 2, tags: ["atlanta", "bounce", "crunk"], bpmRange: [130, 145],
    pattern: {
      kick: s(0, 3, 6, 8, 10, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(6, 14), clap: s(4, 12),
      "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // --- CHORUS (9) ---
  {
    id: "trap-c1", name: "Classic Drop", genre: "trap", songPart: "chorus",
    complexity: 2, tags: ["drop", "heavy", "full"], bpmRange: [135, 155],
    pattern: {
      kick: s(0, 3, 7, 8, 10, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(3, 7, 11, 15), clap: s(4, 12),
      "tom-high": s(14, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-c2", name: "Roll Heavy Drop", genre: "trap", songPart: "chorus",
    complexity: 3, tags: ["rolling-hats", "heavy", "intense"], bpmRange: [140, 155],
    pattern: {
      kick: s(0, 5, 8, 10, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(2, 6, 10, 14), clap: s(4, 8, 12),
      "tom-high": s(14), "tom-low": s(15), ride: _(),
    },
  },
  {
    id: "trap-c3", name: "Triplet Chorus", genre: "trap", songPart: "chorus",
    complexity: 3, tags: ["triplet", "bounce", "energetic"], bpmRange: [135, 150],
    pattern: {
      kick: s(0, 3, 5, 8, 10, 13), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14),
      "hihat-open": s(3, 7, 11, 15), clap: s(4, 12),
      "tom-high": s(6, 14), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-c4", name: "808 Anthem", genre: "trap", songPart: "chorus",
    complexity: 2, tags: ["808", "anthem", "hard"], bpmRange: [130, 150],
    pattern: {
      kick: s(0, 2, 6, 8, 10, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(6, 14), clap: s(4, 8, 12),
      "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-c5", name: "Minimal Hard", genre: "trap", songPart: "chorus",
    complexity: 1, tags: ["minimal", "hard", "sparse"], bpmRange: [135, 150],
    pattern: {
      kick: s(0, 7, 10, 14), snare: s(4, 12),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-c6", name: "Double Time Chorus", genre: "trap", songPart: "chorus",
    complexity: 3, tags: ["double-time", "fast", "aggressive"], bpmRange: [140, 160],
    pattern: {
      kick: s(0, 4, 6, 8, 12, 14), snare: s(2, 6, 10, 14),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(3, 11), clap: s(4, 12),
      "tom-high": s(14, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-c7", name: "Drill Hook", genre: "trap", songPart: "chorus",
    complexity: 2, tags: ["drill", "dark", "hook"], bpmRange: [140, 150],
    pattern: {
      kick: s(0, 5, 8, 11, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(7, 15), clap: s(4, 12),
      "tom-high": s(6, 14), "tom-low": s(7, 15), ride: _(),
    },
  },
  {
    id: "trap-c8", name: "Atlanta Banger", genre: "trap", songPart: "chorus",
    complexity: 2, tags: ["atlanta", "banger", "crunk"], bpmRange: [130, 145],
    pattern: {
      kick: s(0, 3, 6, 8, 10, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(3, 7, 11, 15), clap: s(4, 8, 12),
      "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-c9", name: "Festival Trap", genre: "trap", songPart: "chorus",
    complexity: 3, tags: ["festival", "build", "epic"], bpmRange: [140, 155],
    pattern: {
      kick: s(0, 4, 8, 12), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(2, 6, 10, 14), clap: s(4, 8, 12, 14),
      "tom-high": s(13, 14), "tom-low": s(15), ride: _(),
    },
  },
  // --- BRIDGE (8) ---
  {
    id: "trap-b1", name: "Atmospheric Break", genre: "trap", songPart: "bridge",
    complexity: 1, tags: ["atmospheric", "sparse", "dark"], bpmRange: [135, 150],
    pattern: {
      kick: s(0, 14), snare: s(8),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(6, 14),
      clap: s(12), "tom-high": _(), "tom-low": s(10), ride: _(),
    },
  },
  {
    id: "trap-b2", name: "Half-Time Hats", genre: "trap", songPart: "bridge",
    complexity: 1, tags: ["half-time", "minimal"], bpmRange: [135, 150],
    pattern: {
      kick: s(0, 10), snare: s(8),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(14),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-b3", name: "808 Breath", genre: "trap", songPart: "bridge",
    complexity: 2, tags: ["808", "breathing", "space"], bpmRange: [135, 150],
    pattern: {
      kick: s(0, 8, 14), snare: _(),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-b4", name: "Tension Build", genre: "trap", songPart: "bridge",
    complexity: 2, tags: ["tension", "build", "crescendo"], bpmRange: [135, 150],
    pattern: {
      kick: s(0, 12), snare: s(4, 8, 12, 14),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": _(), clap: s(4, 12),
      "tom-high": s(10), "tom-low": s(14), ride: _(),
    },
  },
  {
    id: "trap-b5", name: "Drill Bridge", genre: "trap", songPart: "bridge",
    complexity: 2, tags: ["drill", "dark", "bridge"], bpmRange: [140, 150],
    pattern: {
      kick: s(0, 5, 14), snare: s(8),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(7, 15), clap: s(12),
      "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-b6", name: "Synth Trap Break", genre: "trap", songPart: "bridge",
    complexity: 1, tags: ["synth", "melodic", "break"], bpmRange: [135, 145],
    pattern: {
      kick: s(0, 8), snare: _(),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6, 14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-b7", name: "Tom Drop", genre: "trap", songPart: "bridge",
    complexity: 2, tags: ["toms", "percussion"], bpmRange: [135, 150],
    pattern: {
      kick: s(0, 14), snare: s(8),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(12), "tom-high": s(4, 10), "tom-low": s(6, 14), ride: _(),
    },
  },
  {
    id: "trap-b8", name: "Ghost Trap", genre: "trap", songPart: "bridge",
    complexity: 3, tags: ["ghost-notes", "subtle"], bpmRange: [135, 150],
    pattern: {
      kick: s(0, 7, 10), snare: s(4, 13),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(3, 11), clap: _(),
      "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // --- NEW VERSE VARIATIONS (3) ---
  {
    id: "trap-v9", name: "Future Trap", genre: "trap", songPart: "verse",
    complexity: 2, tags: ["future", "melodic", "atmospheric"], bpmRange: [135, 145],
    pattern: {
      kick: s(0, 6, 10), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(7, 15), clap: _(), "tom-high": s(11), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-v10", name: "Latin Trap", genre: "trap", songPart: "verse",
    complexity: 2, tags: ["latin", "reggaeton", "dembow"], bpmRange: [140, 150],
    pattern: {
      kick: s(0, 3, 6, 10, 13), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(6, 14), clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-v11", name: "Memphis Trap", genre: "trap", songPart: "verse",
    complexity: 2, tags: ["memphis", "dark", "horrorcore"], bpmRange: [135, 145],
    pattern: {
      kick: s(0, 5, 8, 13), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(3, 7, 11, 15), clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  // --- NEW CHORUS VARIATIONS (4) ---
  {
    id: "trap-c9", name: "Rage Trap", genre: "trap", songPart: "chorus",
    complexity: 3, tags: ["rage", "synth-heavy", "distorted"], bpmRange: [140, 155],
    pattern: {
      kick: s(0, 4, 6, 8, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(3, 7, 11, 15), clap: s(4, 12),
      "tom-high": s(14, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-c10", name: "Cloud Trap", genre: "trap", songPart: "chorus",
    complexity: 2, tags: ["cloud", "ethereal", "dreamy"], bpmRange: [130, 140],
    pattern: {
      kick: s(0, 7, 10), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(7, 15), clap: s(4, 12),
      "tom-high": s(3, 11), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-c11", name: "Hard Trap", genre: "trap", songPart: "chorus",
    complexity: 2, tags: ["hard", "aggressive", "heavy"], bpmRange: [145, 160],
    pattern: {
      kick: s(0, 3, 7, 8, 11, 15), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(6, 14), clap: s(4, 12),
      "tom-high": s(13, 14, 15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-c12", name: "Reggaeton Trap", genre: "trap", songPart: "chorus",
    complexity: 2, tags: ["reggaeton", "dembow", "latin"], bpmRange: [140, 150],
    pattern: {
      kick: s(0, 3, 6, 8, 11, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(3, 7, 11, 15), clap: s(4, 12),
      "tom-high": _(), "tom-low": s(6, 14), ride: _(),
    },
  },
  // --- NEW BRIDGE VARIATIONS (3) ---
  {
    id: "trap-b9", name: "Vocal Chop Break", genre: "trap", songPart: "bridge",
    complexity: 2, tags: ["vocal-chop", "minimal", "glitchy"], bpmRange: [135, 145],
    pattern: {
      kick: s(0, 8), snare: s(12),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6, 14),
      clap: s(4, 10, 12), "tom-high": s(10), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-b10", name: "808 Slide", genre: "trap", songPart: "bridge",
    complexity: 2, tags: ["808-slide", "melodic", "bass"], bpmRange: [135, 145],
    pattern: {
      kick: s(0, 5, 7, 12), snare: s(8),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": s(14),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-b11", name: "Reverse Build", genre: "trap", songPart: "bridge",
    complexity: 3, tags: ["reverse", "build", "cinematic"], bpmRange: [140, 150],
    pattern: {
      kick: s(0, 4, 8, 10, 12, 14), snare: s(4, 8, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(15), clap: s(4, 8, 10, 12, 14),
      "tom-high": s(11, 13, 15), "tom-low": s(10, 12, 14), ride: _(),
    },
  },
  // --- ADDITIONAL BRIDGE VARIATIONS (4) ---
  {
    id: "trap-b12", name: "Breakdown Bridge", genre: "trap", songPart: "bridge",
    complexity: 1, tags: ["breakdown", "simplified", "minimal"], bpmRange: [135, 150],
    pattern: {
      kick: s(0, 14), snare: s(8),
      "hihat-closed": s(0, 2, 4, 6, 8, 10, 12, 14), "hihat-open": _(),
      clap: s(12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-b13", name: "Intensity Build Bridge", genre: "trap", songPart: "bridge",
    complexity: 2, tags: ["build", "intensity", "crescendo"], bpmRange: [138, 150],
    pattern: {
      kick: s(0, 4, 7, 8, 10, 12, 14), snare: s(4, 8, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(14), clap: s(4, 8, 12), "tom-high": s(13, 14, 15), "tom-low": s(10, 11, 12), ride: _(),
    },
  },
  {
    id: "trap-b14", name: "Rhythmic Shift Bridge", genre: "trap", songPart: "bridge",
    complexity: 3, tags: ["rhythmic-shift", "triplet", "experimental"], bpmRange: [135, 145],
    pattern: {
      kick: s(0, 5, 10), snare: s(8),
      "hihat-closed": s(0, 2, 5, 7, 10, 12), "hihat-open": s(3, 13),
      clap: _(), "tom-high": s(5, 10), "tom-low": s(3, 13), ride: _(),
    },
  },
  {
    id: "trap-b15", name: "808 Solo Bridge", genre: "trap", songPart: "bridge",
    complexity: 1, tags: ["solo", "808-focus", "minimal"], bpmRange: [130, 145],
    pattern: {
      kick: s(0, 7, 10), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-b16", name: "Double-Time Intensity", genre: "trap", songPart: "bridge",
    complexity: 3, tags: ["double-time", "intense", "fast"], bpmRange: [145, 160],
    pattern: {
      kick: s(0, 2, 4, 6, 8, 10, 12, 14), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(7, 15), clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-b17", name: "Percussion Break", genre: "trap", songPart: "bridge",
    complexity: 2, tags: ["percussion", "toms", "break"], bpmRange: [140, 150],
    pattern: {
      kick: s(0, 10), snare: _(),
      "hihat-closed": _(), "hihat-open": _(),
      clap: s(4, 12), "tom-high": s(2, 6, 10, 14), "tom-low": s(3, 7, 11, 15), ride: _(),
    },
  },
  {
    id: "trap-b18", name: "Minimal Stripped", genre: "trap", songPart: "bridge",
    complexity: 1, tags: ["minimal", "stripped", "sparse"], bpmRange: [135, 145],
    pattern: {
      kick: s(0, 14), snare: s(8),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-b19", name: "Reverse Pattern Bridge", genre: "trap", songPart: "bridge",
    complexity: 2, tags: ["reverse", "experimental", "creative"], bpmRange: [140, 150],
    pattern: {
      kick: s(1, 11), snare: s(3),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": s(6, 14),
      clap: _(), "tom-high": s(15, 14, 13), "tom-low": _(), ride: _(),
    },
  },
  // --- OUTRO (4) ---
  {
    id: "trap-o1", name: "Fade Outro", genre: "trap", songPart: "outro",
    complexity: 1, tags: ["fade", "gradual", "ending"], bpmRange: [135, 150],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(0, 4, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-o2", name: "Hard Stop Outro", genre: "trap", songPart: "outro",
    complexity: 1, tags: ["hard-stop", "immediate", "abrupt"], bpmRange: [135, 150],
    pattern: {
      kick: s(0, 7, 10), snare: s(4, 12),
      "hihat-closed": s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      "hihat-open": s(6, 14), clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: s(0),
    },
  },
  {
    id: "trap-o3", name: "Echo Outro", genre: "trap", songPart: "outro",
    complexity: 2, tags: ["echo", "reverb-tail", "atmospheric"], bpmRange: [130, 145],
    pattern: {
      kick: s(0, 14), snare: s(12),
      "hihat-closed": s(4, 12), "hihat-open": s(14),
      clap: _(), "tom-high": s(15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-o4", name: "Loop Outro", genre: "trap", songPart: "outro",
    complexity: 1, tags: ["loop", "minimal", "repetitive"], bpmRange: [135, 148],
    pattern: {
      kick: s(0, 10), snare: _(),
      "hihat-closed": s(0, 4, 8, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-o5", name: "Reverse Pattern Ending", genre: "trap", songPart: "outro",
    complexity: 2, tags: ["reverse", "experimental", "ending"], bpmRange: [135, 150],
    pattern: {
      kick: s(15, 13, 11, 9, 7, 5), snare: s(14, 12),
      "hihat-closed": s(15, 14, 13, 12, 11, 10, 9, 8), "hihat-open": _(),
      clap: _(), "tom-high": s(15), "tom-low": s(14), ride: _(),
    },
  },
  {
    id: "trap-o6", name: "Gradual Element Removal", genre: "trap", songPart: "outro",
    complexity: 1, tags: ["gradual", "fade", "strip"], bpmRange: [135, 148],
    pattern: {
      kick: s(0), snare: _(),
      "hihat-closed": s(0, 12), "hihat-open": _(),
      clap: _(), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-o7", name: "Reverb Tail Outro", genre: "trap", songPart: "outro",
    complexity: 2, tags: ["reverb", "atmospheric", "tail"], bpmRange: [130, 145],
    pattern: {
      kick: s(0, 10), snare: s(12),
      "hihat-closed": _(), "hihat-open": s(14),
      clap: s(4), "tom-high": s(15), "tom-low": _(), ride: _(),
    },
  },
  {
    id: "trap-o8", name: "Echo Fade Outro", genre: "trap", songPart: "outro",
    complexity: 2, tags: ["echo", "fade", "decay"], bpmRange: [135, 148],
    pattern: {
      kick: s(0, 10), snare: s(12),
      "hihat-closed": s(0, 8), "hihat-open": _(),
      clap: s(4, 12), "tom-high": _(), "tom-low": _(), ride: _(),
    },
  },
];

// =====================================================================
// MASTER LIBRARY — all genre patterns combined
// =====================================================================
export const PATTERN_LIBRARY: Record<Genre, PatternVariant[]> = {
  house: housePatterns,
  electronic: electronicPatterns,
  "lo-fi": loFiPatterns,
  pop: popPatterns,
  rock: rockPatterns,
  "hip-hop": hipHopPatterns,
  trap: trapPatterns,
};

// Get all patterns for a specific genre + song part
export function getPatternVariants(genre: Genre, songPart: SongPart): PatternVariant[] {
  return PATTERN_LIBRARY[genre].filter((p) => p.songPart === songPart);
}

// Get all emotion variants
export function getEmotionVariants(emotion: string): EmotionVariant[] {
  return EMOTION_PATTERN_LIBRARY.filter((p) => p.emotion === emotion);
}
