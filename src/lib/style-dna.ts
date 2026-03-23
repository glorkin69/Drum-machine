/**
 * Style DNA - Core analysis algorithms for drum pattern style profiling
 *
 * Extracts a "fingerprint" from any drum pattern to characterize its style,
 * and provides a library of pre-built artist DNA profiles for famous drummers.
 */

import { INSTRUMENTS, type DrumPattern, type Genre, type SongPart } from "./drum-patterns";

// ============================================================================
// TYPES
// ============================================================================

/** Numerical fingerprint describing a pattern's style characteristics */
export interface StyleFingerprint {
  /** Overall pattern density (0-1): ratio of active steps to total possible */
  density: number;
  /** Syncopation score (0-1): how much the pattern emphasizes off-beats */
  syncopation: number;
  /** Kick density (0-1): how busy the kick drum is */
  kickDensity: number;
  /** Snare density (0-1): how busy the snare is */
  snareDensity: number;
  /** Hi-hat density (0-1): combined closed + open hi-hat activity */
  hihatDensity: number;
  /** Percussion density (0-1): clap, tom, ride activity */
  percDensity: number;
  /** Backbeat strength (0-1): emphasis on beats 2 and 4 */
  backbeatStrength: number;
  /** Downbeat strength (0-1): emphasis on beats 1 and 3 */
  downbeatStrength: number;
  /** Layering score (0-1): how many instruments play simultaneously */
  layering: number;
  /** Swing tendency (0-1): preference for off-grid/swing patterns */
  swingTendency: number;
  /** Complexity score (0-1): overall pattern complexity */
  complexity: number;
  /** Genre affinity scores (0-1 each) */
  genreAffinity: Record<string, number>;
  /** Per-instrument weight preferences (0-1 each) */
  instrumentWeights: Record<string, number>;
}

/** Artist DNA profile: a pre-built style fingerprint + metadata */
export interface ArtistDNA {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  /** Genres this artist is known for */
  genres: Genre[];
  /** Style fingerprint representing this artist */
  fingerprint: StyleFingerprint;
  /** Pattern transformation hints (applied during evolvePattern) */
  transformHints: {
    /** Preferred kick pattern positions (16-step) */
    kickBias: number[];
    /** Preferred snare positions */
    snareBias: number[];
    /** Hi-hat style: "straight" | "swing" | "rolls" | "sparse" */
    hihatStyle: "straight" | "swing" | "rolls" | "sparse";
    /** Ghost note amount (0-1) */
    ghostNoteAmount: number;
    /** Preferred BPM range */
    bpmRange: [number, number];
  };
}

// ============================================================================
// PATTERN ANALYSIS
// ============================================================================

/**
 * Analyze a drum pattern and extract its style fingerprint.
 */
export function analyzePattern(pattern: DrumPattern, patternLength: number = 16): StyleFingerprint {
  const totalSteps = patternLength;
  const instrumentCount = INSTRUMENTS.length;

  // Count hits per instrument
  const hitCounts: Record<string, number> = {};
  let totalHits = 0;
  for (const inst of INSTRUMENTS) {
    const steps = pattern[inst.id] || [];
    const count = steps.slice(0, totalSteps).filter(Boolean).length;
    hitCounts[inst.id] = count;
    totalHits += count;
  }

  // Overall density
  const density = totalHits / (totalSteps * instrumentCount);

  // Per-instrument densities
  const kickDensity = (hitCounts["kick"] || 0) / totalSteps;
  const snareDensity = (hitCounts["snare"] || 0) / totalSteps;
  const hihatClosed = (hitCounts["hihat-closed"] || 0) / totalSteps;
  const hihatOpen = (hitCounts["hihat-open"] || 0) / totalSteps;
  const hihatDensity = (hihatClosed + hihatOpen) / 2;
  const clapDensity = (hitCounts["clap"] || 0) / totalSteps;
  const tomHighDensity = (hitCounts["tom-high"] || 0) / totalSteps;
  const tomLowDensity = (hitCounts["tom-low"] || 0) / totalSteps;
  const rideDensity = (hitCounts["ride"] || 0) / totalSteps;
  const percDensity = (clapDensity + tomHighDensity + tomLowDensity + rideDensity) / 4;

  // Syncopation: count hits on off-beat 16th positions (odd steps in 0-indexed)
  let syncopatedHits = 0;
  let onBeatHits = 0;
  for (const inst of INSTRUMENTS) {
    const steps = pattern[inst.id] || [];
    for (let i = 0; i < totalSteps; i++) {
      if (steps[i]) {
        if (i % 2 !== 0) {
          syncopatedHits++;
        } else {
          onBeatHits++;
        }
      }
    }
  }
  const syncopation = totalHits > 0 ? syncopatedHits / totalHits : 0;

  // Backbeat strength: hits on steps 4 and 12 (beats 2 and 4 in 16th grid)
  let backbeatHits = 0;
  let backbeatMax = 0;
  for (const inst of INSTRUMENTS) {
    const steps = pattern[inst.id] || [];
    for (const pos of [4, 12]) {
      if (pos < totalSteps) {
        backbeatMax++;
        if (steps[pos]) backbeatHits++;
      }
    }
  }
  const backbeatStrength = backbeatMax > 0 ? backbeatHits / backbeatMax : 0;

  // Downbeat strength: hits on steps 0 and 8 (beats 1 and 3)
  let downbeatHits = 0;
  let downbeatMax = 0;
  for (const inst of INSTRUMENTS) {
    const steps = pattern[inst.id] || [];
    for (const pos of [0, 8]) {
      if (pos < totalSteps) {
        downbeatMax++;
        if (steps[pos]) downbeatHits++;
      }
    }
  }
  const downbeatStrength = downbeatMax > 0 ? downbeatHits / downbeatMax : 0;

  // Layering: average simultaneous instrument count per step
  let totalLayering = 0;
  let activeSteps = 0;
  for (let i = 0; i < totalSteps; i++) {
    let layerCount = 0;
    for (const inst of INSTRUMENTS) {
      if (pattern[inst.id]?.[i]) layerCount++;
    }
    if (layerCount > 0) {
      totalLayering += layerCount;
      activeSteps++;
    }
  }
  const layering = activeSteps > 0 ? totalLayering / (activeSteps * instrumentCount) : 0;

  // Swing tendency: hits on "swing" positions (steps 3, 7, 11, 15)
  let swingHits = 0;
  let swingMax = 0;
  for (const inst of INSTRUMENTS) {
    const steps = pattern[inst.id] || [];
    for (const pos of [3, 7, 11, 15]) {
      if (pos < totalSteps) {
        swingMax++;
        if (steps[pos]) swingHits++;
      }
    }
  }
  const swingTendency = swingMax > 0 ? swingHits / swingMax : 0;

  // Complexity: weighted composite score
  const complexity = Math.min(1, (
    density * 0.3 +
    syncopation * 0.2 +
    layering * 0.2 +
    percDensity * 0.15 +
    swingTendency * 0.15
  ));

  // Genre affinity (heuristic based on pattern characteristics)
  const genreAffinity = calculateGenreAffinity(
    kickDensity, snareDensity, hihatDensity, percDensity,
    syncopation, density, backbeatStrength, swingTendency
  );

  // Instrument weights
  const instrumentWeights: Record<string, number> = {};
  for (const inst of INSTRUMENTS) {
    instrumentWeights[inst.id] = (hitCounts[inst.id] || 0) / totalSteps;
  }

  return {
    density,
    syncopation,
    kickDensity,
    snareDensity,
    hihatDensity,
    percDensity,
    backbeatStrength,
    downbeatStrength,
    layering,
    swingTendency,
    complexity,
    genreAffinity,
    instrumentWeights,
  };
}

function calculateGenreAffinity(
  kickDensity: number, snareDensity: number, hihatDensity: number,
  percDensity: number, syncopation: number, density: number,
  backbeatStrength: number, swingTendency: number
): Record<string, number> {
  // House: four-on-the-floor kick, moderate hi-hat, low syncopation
  const house = clamp(kickDensity * 0.4 + (1 - syncopation) * 0.3 + hihatDensity * 0.3);
  // Electronic: high hi-hat density, high overall density
  const electronic = clamp(hihatDensity * 0.4 + density * 0.3 + kickDensity * 0.3);
  // Lo-fi: moderate density, high swing, sparse
  const lofi = clamp(swingTendency * 0.4 + (1 - density) * 0.3 + (1 - kickDensity) * 0.3);
  // Pop: strong backbeat, moderate density
  const pop = clamp(backbeatStrength * 0.4 + (1 - syncopation) * 0.3 + snareDensity * 0.3);
  // Rock: strong backbeat, steady hi-hat, moderate kick
  const rock = clamp(backbeatStrength * 0.35 + hihatDensity * 0.35 + snareDensity * 0.3);
  // Hip-hop: syncopated kick, backbeat snare, moderate density
  const hipHop = clamp(syncopation * 0.35 + backbeatStrength * 0.35 + kickDensity * 0.3);
  // Trap: high hi-hat density, syncopated kick, sparse snare
  const trap = clamp(hihatDensity * 0.4 + syncopation * 0.3 + kickDensity * 0.3);

  return {
    house, electronic, "lo-fi": lofi, pop, rock, "hip-hop": hipHop, trap,
  };
}

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}

// ============================================================================
// STYLE SIMILARITY
// ============================================================================

/**
 * Calculate similarity between two style fingerprints (0-1, higher = more similar).
 */
export function calculateStyleSimilarity(a: StyleFingerprint, b: StyleFingerprint): number {
  const keys: (keyof StyleFingerprint)[] = [
    "density", "syncopation", "kickDensity", "snareDensity",
    "hihatDensity", "percDensity", "backbeatStrength", "downbeatStrength",
    "layering", "swingTendency", "complexity",
  ];

  let sumSquaredDiff = 0;
  for (const key of keys) {
    const av = a[key] as number;
    const bv = b[key] as number;
    sumSquaredDiff += (av - bv) ** 2;
  }

  // Euclidean distance normalized to 0-1
  const distance = Math.sqrt(sumSquaredDiff / keys.length);
  return 1 - distance;
}

/**
 * Merge a new pattern fingerprint into an existing profile DNA.
 * Uses exponential moving average for progressive learning.
 */
export function mergeFingerprints(
  existing: StyleFingerprint,
  newFp: StyleFingerprint,
  weight: number = 0.15
): StyleFingerprint {
  const merge = (a: number, b: number) => a * (1 - weight) + b * weight;

  const merged: StyleFingerprint = {
    density: merge(existing.density, newFp.density),
    syncopation: merge(existing.syncopation, newFp.syncopation),
    kickDensity: merge(existing.kickDensity, newFp.kickDensity),
    snareDensity: merge(existing.snareDensity, newFp.snareDensity),
    hihatDensity: merge(existing.hihatDensity, newFp.hihatDensity),
    percDensity: merge(existing.percDensity, newFp.percDensity),
    backbeatStrength: merge(existing.backbeatStrength, newFp.backbeatStrength),
    downbeatStrength: merge(existing.downbeatStrength, newFp.downbeatStrength),
    layering: merge(existing.layering, newFp.layering),
    swingTendency: merge(existing.swingTendency, newFp.swingTendency),
    complexity: merge(existing.complexity, newFp.complexity),
    genreAffinity: {},
    instrumentWeights: {},
  };

  // Merge genre affinity
  const allGenres = new Set([...Object.keys(existing.genreAffinity), ...Object.keys(newFp.genreAffinity)]);
  for (const g of allGenres) {
    merged.genreAffinity[g] = merge(existing.genreAffinity[g] || 0, newFp.genreAffinity[g] || 0);
  }

  // Merge instrument weights
  const allInst = new Set([...Object.keys(existing.instrumentWeights), ...Object.keys(newFp.instrumentWeights)]);
  for (const i of allInst) {
    merged.instrumentWeights[i] = merge(existing.instrumentWeights[i] || 0, newFp.instrumentWeights[i] || 0);
  }

  return merged;
}

/**
 * Create a default empty fingerprint for new users.
 */
export function createDefaultFingerprint(): StyleFingerprint {
  return {
    density: 0.3,
    syncopation: 0.3,
    kickDensity: 0.25,
    snareDensity: 0.15,
    hihatDensity: 0.4,
    percDensity: 0.1,
    backbeatStrength: 0.5,
    downbeatStrength: 0.5,
    layering: 0.25,
    swingTendency: 0.2,
    complexity: 0.3,
    genreAffinity: { house: 0.5, electronic: 0.5, "lo-fi": 0.5, pop: 0.5, rock: 0.5, "hip-hop": 0.5, trap: 0.5 },
    instrumentWeights: { kick: 0.3, snare: 0.2, "hihat-closed": 0.5, "hihat-open": 0.1, clap: 0.1, "tom-high": 0.05, "tom-low": 0.05, ride: 0.1 },
  };
}

/**
 * Generate a simple hash of a pattern for deduplication.
 */
export function hashPattern(pattern: DrumPattern, patternLength: number = 16): string {
  let hash = "";
  for (const inst of INSTRUMENTS) {
    const steps = pattern[inst.id] || [];
    for (let i = 0; i < patternLength; i++) {
      hash += steps[i] ? "1" : "0";
    }
  }
  // Simple numeric hash
  let h = 0;
  for (let i = 0; i < hash.length; i++) {
    h = ((h << 5) - h + hash.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

// ============================================================================
// ARTIST DNA LIBRARY
// ============================================================================

export const ARTIST_DNA_LIBRARY: ArtistDNA[] = [
  {
    id: "j-dilla",
    name: "J Dilla",
    description: "Laid-back swing, off-grid timing, soulful boom-bap",
    icon: "\uD83C\uDFB5",
    color: "#8E44AD",
    genres: ["hip-hop", "lo-fi"],
    fingerprint: {
      density: 0.28,
      syncopation: 0.55,
      kickDensity: 0.22,
      snareDensity: 0.15,
      hihatDensity: 0.45,
      percDensity: 0.08,
      backbeatStrength: 0.6,
      downbeatStrength: 0.4,
      layering: 0.2,
      swingTendency: 0.75,
      complexity: 0.45,
      genreAffinity: { "hip-hop": 0.9, "lo-fi": 0.85, house: 0.2, pop: 0.15, rock: 0.05, electronic: 0.1, trap: 0.15 },
      instrumentWeights: { kick: 0.25, snare: 0.2, "hihat-closed": 0.5, "hihat-open": 0.15, clap: 0.05, "tom-high": 0.02, "tom-low": 0.02, ride: 0.15 },
    },
    transformHints: {
      kickBias: [0, 3, 10],
      snareBias: [4, 12],
      hihatStyle: "swing",
      ghostNoteAmount: 0.4,
      bpmRange: [72, 98],
    },
  },
  {
    id: "travis-barker",
    name: "Travis Barker",
    description: "Aggressive punk energy, fast fills, heavy hitting",
    icon: "\uD83E\uDD18",
    color: "#E74C3C",
    genres: ["rock", "pop"],
    fingerprint: {
      density: 0.48,
      syncopation: 0.35,
      kickDensity: 0.35,
      snareDensity: 0.25,
      hihatDensity: 0.55,
      percDensity: 0.25,
      backbeatStrength: 0.75,
      downbeatStrength: 0.6,
      layering: 0.35,
      swingTendency: 0.1,
      complexity: 0.65,
      genreAffinity: { rock: 0.95, pop: 0.6, "hip-hop": 0.3, electronic: 0.2, house: 0.05, "lo-fi": 0.05, trap: 0.2 },
      instrumentWeights: { kick: 0.35, snare: 0.3, "hihat-closed": 0.5, "hihat-open": 0.2, clap: 0.15, "tom-high": 0.2, "tom-low": 0.2, ride: 0.15 },
    },
    transformHints: {
      kickBias: [0, 3, 6, 8, 11],
      snareBias: [4, 12],
      hihatStyle: "straight",
      ghostNoteAmount: 0.6,
      bpmRange: [130, 190],
    },
  },
  {
    id: "questlove",
    name: "Questlove",
    description: "Deep pocket groove, neo-soul feel, tasteful dynamics",
    icon: "\uD83C\uDFB6",
    color: "#2ECC71",
    genres: ["hip-hop", "pop"],
    fingerprint: {
      density: 0.3,
      syncopation: 0.45,
      kickDensity: 0.2,
      snareDensity: 0.18,
      hihatDensity: 0.5,
      percDensity: 0.1,
      backbeatStrength: 0.7,
      downbeatStrength: 0.55,
      layering: 0.22,
      swingTendency: 0.5,
      complexity: 0.4,
      genreAffinity: { "hip-hop": 0.85, pop: 0.7, "lo-fi": 0.6, rock: 0.3, house: 0.15, electronic: 0.1, trap: 0.1 },
      instrumentWeights: { kick: 0.25, snare: 0.25, "hihat-closed": 0.55, "hihat-open": 0.1, clap: 0.05, "tom-high": 0.05, "tom-low": 0.05, ride: 0.2 },
    },
    transformHints: {
      kickBias: [0, 6, 10],
      snareBias: [4, 12],
      hihatStyle: "swing",
      ghostNoteAmount: 0.5,
      bpmRange: [85, 115],
    },
  },
  {
    id: "metro-boomin",
    name: "Metro Boomin",
    description: "Trap architect, 808 patterns, rolling hi-hats",
    icon: "\uD83D\uDD25",
    color: "#F39C12",
    genres: ["trap", "hip-hop"],
    fingerprint: {
      density: 0.42,
      syncopation: 0.5,
      kickDensity: 0.3,
      snareDensity: 0.15,
      hihatDensity: 0.8,
      percDensity: 0.1,
      backbeatStrength: 0.5,
      downbeatStrength: 0.35,
      layering: 0.25,
      swingTendency: 0.2,
      complexity: 0.55,
      genreAffinity: { trap: 0.95, "hip-hop": 0.8, electronic: 0.3, pop: 0.2, house: 0.1, "lo-fi": 0.15, rock: 0.05 },
      instrumentWeights: { kick: 0.35, snare: 0.15, "hihat-closed": 0.85, "hihat-open": 0.25, clap: 0.15, "tom-high": 0.05, "tom-low": 0.05, ride: 0.02 },
    },
    transformHints: {
      kickBias: [0, 3, 7, 10, 14],
      snareBias: [4, 12],
      hihatStyle: "rolls",
      ghostNoteAmount: 0.2,
      bpmRange: [130, 160],
    },
  },
  {
    id: "four-tet",
    name: "Four Tet",
    description: "Organic electronic textures, polyrhythmic, subtle",
    icon: "\uD83C\uDF3F",
    color: "#3498DB",
    genres: ["electronic", "house"],
    fingerprint: {
      density: 0.32,
      syncopation: 0.4,
      kickDensity: 0.22,
      snareDensity: 0.1,
      hihatDensity: 0.5,
      percDensity: 0.2,
      backbeatStrength: 0.35,
      downbeatStrength: 0.55,
      layering: 0.2,
      swingTendency: 0.35,
      complexity: 0.5,
      genreAffinity: { electronic: 0.9, house: 0.7, "lo-fi": 0.5, "hip-hop": 0.3, pop: 0.15, trap: 0.1, rock: 0.05 },
      instrumentWeights: { kick: 0.25, snare: 0.1, "hihat-closed": 0.45, "hihat-open": 0.2, clap: 0.15, "tom-high": 0.15, "tom-low": 0.1, ride: 0.25 },
    },
    transformHints: {
      kickBias: [0, 4, 8, 12],
      snareBias: [4, 12],
      hihatStyle: "sparse",
      ghostNoteAmount: 0.3,
      bpmRange: [118, 135],
    },
  },
  {
    id: "john-bonham",
    name: "John Bonham",
    description: "Thunderous power, heavy groove, iconic triplet fills",
    icon: "\u26A1",
    color: "#C0392B",
    genres: ["rock"],
    fingerprint: {
      density: 0.38,
      syncopation: 0.3,
      kickDensity: 0.3,
      snareDensity: 0.2,
      hihatDensity: 0.55,
      percDensity: 0.15,
      backbeatStrength: 0.8,
      downbeatStrength: 0.7,
      layering: 0.3,
      swingTendency: 0.25,
      complexity: 0.5,
      genreAffinity: { rock: 0.95, pop: 0.3, "hip-hop": 0.15, house: 0.05, electronic: 0.05, "lo-fi": 0.05, trap: 0.05 },
      instrumentWeights: { kick: 0.35, snare: 0.3, "hihat-closed": 0.5, "hihat-open": 0.15, clap: 0.05, "tom-high": 0.2, "tom-low": 0.2, ride: 0.15 },
    },
    transformHints: {
      kickBias: [0, 3, 8, 11],
      snareBias: [4, 12],
      hihatStyle: "straight",
      ghostNoteAmount: 0.35,
      bpmRange: [100, 170],
    },
  },
  {
    id: "kaytranada",
    name: "Kaytranada",
    description: "Bouncy house-hop fusion, funky syncopation, groovy",
    icon: "\uD83D\uDC83",
    color: "#E91E63",
    genres: ["house", "hip-hop", "electronic"],
    fingerprint: {
      density: 0.35,
      syncopation: 0.55,
      kickDensity: 0.25,
      snareDensity: 0.15,
      hihatDensity: 0.55,
      percDensity: 0.15,
      backbeatStrength: 0.55,
      downbeatStrength: 0.5,
      layering: 0.25,
      swingTendency: 0.45,
      complexity: 0.5,
      genreAffinity: { house: 0.8, "hip-hop": 0.75, electronic: 0.65, pop: 0.4, "lo-fi": 0.4, trap: 0.2, rock: 0.05 },
      instrumentWeights: { kick: 0.3, snare: 0.15, "hihat-closed": 0.5, "hihat-open": 0.2, clap: 0.2, "tom-high": 0.1, "tom-low": 0.05, ride: 0.1 },
    },
    transformHints: {
      kickBias: [0, 4, 7, 10, 12],
      snareBias: [4, 12],
      hihatStyle: "swing",
      ghostNoteAmount: 0.35,
      bpmRange: [105, 130],
    },
  },
];

/**
 * Get an artist DNA by ID.
 */
export function getArtistDNA(id: string): ArtistDNA | undefined {
  return ARTIST_DNA_LIBRARY.find((a) => a.id === id);
}
