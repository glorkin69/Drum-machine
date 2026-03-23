// Complexity Engine: transforms drum patterns based on a 1-10 complexity scale
// Level 5 = base pattern as-is, 1-4 = simplified, 6-10 = complexified

import {
  INSTRUMENTS,
  type DrumPattern,
  type VelocityMap,
  type ProbabilityMap,
  type PatternLength,
  type Genre,
  createDefaultVelocity,
  createDefaultProbability,
} from "./drum-patterns";

// Instrument layers ordered from most essential to least essential
// Lower layer = more fundamental to the groove
const INSTRUMENT_LAYERS: Record<string, number> = {
  kick: 1,
  snare: 2,
  "hihat-closed": 3,
  clap: 4,
  "hihat-open": 5,
  ride: 6,
  "tom-high": 7,
  "tom-low": 7,
};

// Genre-specific complexity behavior
const GENRE_COMPLEXITY_CONFIG: Record<
  string,
  {
    // How aggressive the simplification is (higher = strips more at low complexity)
    simplifyRate: number;
    // How aggressive complexification is (higher = adds more at high complexity)
    complexifyRate: number;
    // Instruments that should be preserved even at low complexity
    coreInstruments: string[];
    // Max syncopation amount (0-1) for complex patterns
    maxSyncopation: number;
    // Whether to add 16th note hi-hat rolls at high complexity
    allowHihatRolls: boolean;
    // BPM adjustment range [-offset, +offset] based on complexity
    bpmOffset: number;
  }
> = {
  house: {
    simplifyRate: 0.7,
    complexifyRate: 0.8,
    coreInstruments: ["kick", "hihat-closed"],
    maxSyncopation: 0.6,
    allowHihatRolls: false,
    bpmOffset: 4,
  },
  electronic: {
    simplifyRate: 0.8,
    complexifyRate: 1.0,
    coreInstruments: ["kick", "hihat-closed"],
    maxSyncopation: 0.8,
    allowHihatRolls: true,
    bpmOffset: 6,
  },
  "lo-fi": {
    simplifyRate: 0.5,
    complexifyRate: 0.5,
    coreInstruments: ["kick", "snare", "hihat-closed"],
    maxSyncopation: 0.3,
    allowHihatRolls: false,
    bpmOffset: 3,
  },
  pop: {
    simplifyRate: 0.6,
    complexifyRate: 0.7,
    coreInstruments: ["kick", "snare", "hihat-closed"],
    maxSyncopation: 0.4,
    allowHihatRolls: false,
    bpmOffset: 4,
  },
  rock: {
    simplifyRate: 0.6,
    complexifyRate: 0.8,
    coreInstruments: ["kick", "snare", "hihat-closed"],
    maxSyncopation: 0.5,
    allowHihatRolls: false,
    bpmOffset: 5,
  },
  "hip-hop": {
    simplifyRate: 0.6,
    complexifyRate: 0.7,
    coreInstruments: ["kick", "snare", "hihat-closed"],
    maxSyncopation: 0.6,
    allowHihatRolls: false,
    bpmOffset: 4,
  },
  trap: {
    simplifyRate: 0.7,
    complexifyRate: 1.0,
    coreInstruments: ["kick", "snare", "hihat-closed"],
    maxSyncopation: 0.7,
    allowHihatRolls: true,
    bpmOffset: 5,
  },
};

function getGenreConfig(genre: Genre) {
  return (
    GENRE_COMPLEXITY_CONFIG[genre] || {
      simplifyRate: 0.7,
      complexifyRate: 0.8,
      coreInstruments: ["kick", "snare", "hihat-closed"],
      maxSyncopation: 0.5,
      allowHihatRolls: false,
      bpmOffset: 4,
    }
  );
}

// Identify "strong" beat positions (downbeats in 4/4 time)
function getStrongBeats(patternLength: PatternLength): Set<number> {
  const strong = new Set<number>();
  // Quarter notes: 0, 4, 8, 12, (16, 20, 24, 28 for longer patterns)
  for (let i = 0; i < patternLength; i += 4) {
    strong.add(i);
  }
  return strong;
}

// Identify "medium" beat positions (8th notes that aren't quarter notes)
function getMediumBeats(patternLength: PatternLength): Set<number> {
  const medium = new Set<number>();
  for (let i = 2; i < patternLength; i += 4) {
    medium.add(i);
  }
  return medium;
}

// Count active steps in a pattern for an instrument
function countActiveSteps(steps: boolean[]): number {
  return steps.filter(Boolean).length;
}

/**
 * Apply complexity transformation to a drum pattern.
 *
 * @param basePattern - The original preset pattern
 * @param complexity - 1-10 scale (5 = no change)
 * @param genre - Current genre for genre-aware scaling
 * @param patternLength - Current pattern length
 * @returns Transformed pattern, velocity, and probability maps
 */
export function applyComplexity(
  basePattern: DrumPattern,
  complexity: number,
  genre: Genre,
  patternLength: PatternLength = 16
): {
  pattern: DrumPattern;
  velocity: VelocityMap;
  probability: ProbabilityMap;
} {
  // Clamp complexity to 1-10
  const level = Math.max(1, Math.min(10, Math.round(complexity)));

  // Level 5 = return base pattern as-is
  if (level === 5) {
    return {
      pattern: JSON.parse(JSON.stringify(basePattern)),
      velocity: createDefaultVelocity(patternLength),
      probability: createDefaultProbability(patternLength),
    };
  }

  const config = getGenreConfig(genre);
  const strongBeats = getStrongBeats(patternLength);
  const mediumBeats = getMediumBeats(patternLength);

  const newPattern: DrumPattern = {};
  const newVelocity: VelocityMap = {};
  const newProbability: ProbabilityMap = {};

  // Initialize all instruments
  for (const inst of INSTRUMENTS) {
    newPattern[inst.id] = Array(patternLength).fill(false) as boolean[];
    newVelocity[inst.id] = Array(patternLength).fill(100) as number[];
    newProbability[inst.id] = Array(patternLength).fill(100) as number[];
  }

  if (level < 5) {
    // === SIMPLIFICATION (levels 1-4) ===
    applySimplification(
      basePattern,
      newPattern,
      newVelocity,
      newProbability,
      level,
      config,
      strongBeats,
      mediumBeats,
      patternLength
    );
  } else {
    // === COMPLEXIFICATION (levels 6-10) ===
    applyComplexification(
      basePattern,
      newPattern,
      newVelocity,
      newProbability,
      level,
      config,
      strongBeats,
      mediumBeats,
      patternLength,
      genre
    );
  }

  return { pattern: newPattern, velocity: newVelocity, probability: newProbability };
}

function applySimplification(
  basePattern: DrumPattern,
  newPattern: DrumPattern,
  newVelocity: VelocityMap,
  newProbability: ProbabilityMap,
  level: number,
  config: ReturnType<typeof getGenreConfig>,
  strongBeats: Set<number>,
  mediumBeats: Set<number>,
  patternLength: PatternLength
) {
  // simplifyFactor: 1.0 at level 1 (max simplification), 0.25 at level 4
  const simplifyFactor = ((5 - level) / 4) * config.simplifyRate;

  for (const inst of INSTRUMENTS) {
    const baseSteps = basePattern[inst.id] || Array(patternLength).fill(false);
    const instrumentLayer = INSTRUMENT_LAYERS[inst.id] || 5;
    const isCore = config.coreInstruments.includes(inst.id);

    // Determine instrument visibility threshold based on layer
    // Higher layers get removed at higher simplify levels
    const layerThreshold = instrumentLayer / 7; // 0.14 for kick, 1.0 for toms

    if (!isCore && simplifyFactor > 1 - layerThreshold) {
      // Remove this instrument entirely at this simplification level
      continue;
    }

    for (let step = 0; step < patternLength; step++) {
      if (!baseSteps[step]) continue;

      const isStrong = strongBeats.has(step);
      const isMedium = mediumBeats.has(step);

      // Strong beats are always kept for core instruments
      if (isStrong && isCore) {
        newPattern[inst.id][step] = true;
        newVelocity[inst.id][step] = 100;
        continue;
      }

      // Medium beats kept based on simplification level
      if (isMedium) {
        if (simplifyFactor < 0.7 || isCore) {
          newPattern[inst.id][step] = true;
          // Reduce velocity slightly at simpler levels
          newVelocity[inst.id][step] = Math.round(100 - simplifyFactor * 20);
        }
        continue;
      }

      // Weak beats (16th notes) - progressively removed
      if (isStrong) {
        newPattern[inst.id][step] = true;
        newVelocity[inst.id][step] = 100;
      } else if (simplifyFactor < 0.5) {
        // Keep weak beats only at moderate simplification
        newPattern[inst.id][step] = true;
        newVelocity[inst.id][step] = Math.round(80 - simplifyFactor * 30);
        // Add probability reduction for "ghost note" feel
        newProbability[inst.id][step] = Math.round(100 - simplifyFactor * 40);
      }
    }

    // Level 1-2: Even core instruments get stripped to bare minimum
    if (level <= 2 && inst.id === "kick") {
      // Keep only beat 1 and 3 (steps 0 and 8)
      for (let step = 0; step < patternLength; step++) {
        if (step !== 0 && step !== Math.floor(patternLength / 2)) {
          newPattern[inst.id][step] = false;
        }
      }
    }

    if (level <= 2 && inst.id === "snare") {
      // Keep only beat 2 and 4 (steps 4 and 12) or remove entirely at level 1
      if (level === 1) {
        for (let step = 0; step < patternLength; step++) {
          newPattern[inst.id][step] = false;
        }
      } else {
        for (let step = 0; step < patternLength; step++) {
          if (step !== 4 && step !== 12) {
            newPattern[inst.id][step] = false;
          }
        }
      }
    }

    if (level === 1 && inst.id === "hihat-closed") {
      // Quarter notes only
      for (let step = 0; step < patternLength; step++) {
        newPattern[inst.id][step] = step % 4 === 0;
      }
    }

    // Level 1: Remove everything except kick and basic hi-hat
    if (level === 1 && !["kick", "hihat-closed"].includes(inst.id)) {
      for (let step = 0; step < patternLength; step++) {
        newPattern[inst.id][step] = false;
      }
    }
  }
}

function applyComplexification(
  basePattern: DrumPattern,
  newPattern: DrumPattern,
  newVelocity: VelocityMap,
  newProbability: ProbabilityMap,
  level: number,
  config: ReturnType<typeof getGenreConfig>,
  strongBeats: Set<number>,
  mediumBeats: Set<number>,
  patternLength: PatternLength,
  genre: Genre
) {
  // complexifyFactor: 0.2 at level 6, 1.0 at level 10
  const complexifyFactor = ((level - 5) / 5) * config.complexifyRate;

  // First, copy the base pattern
  for (const inst of INSTRUMENTS) {
    const baseSteps = basePattern[inst.id] || Array(patternLength).fill(false);
    for (let step = 0; step < patternLength; step++) {
      newPattern[inst.id][step] = baseSteps[step] || false;
      newVelocity[inst.id][step] = 100;
      newProbability[inst.id][step] = 100;
    }
  }

  // === Add ghost notes to kick ===
  if (complexifyFactor > 0.2) {
    addGhostNotes(
      newPattern,
      newVelocity,
      newProbability,
      "kick",
      complexifyFactor * config.maxSyncopation,
      strongBeats,
      patternLength
    );
  }

  // === Add ghost notes to snare ===
  if (complexifyFactor > 0.4) {
    addGhostNotes(
      newPattern,
      newVelocity,
      newProbability,
      "snare",
      complexifyFactor * 0.4,
      strongBeats,
      patternLength
    );
  }

  // === Hi-hat complexity ===
  if (complexifyFactor > 0.1) {
    enhanceHiHats(
      newPattern,
      newVelocity,
      newProbability,
      complexifyFactor,
      config,
      patternLength,
      genre
    );
  }

  // === Add percussion layers (clap, toms, ride) ===
  if (complexifyFactor > 0.3) {
    addPercussionLayers(
      newPattern,
      newVelocity,
      newProbability,
      complexifyFactor,
      strongBeats,
      mediumBeats,
      patternLength,
      genre
    );
  }

  // === Open hi-hat syncopation ===
  if (complexifyFactor > 0.5) {
    addOpenHiHatSyncopation(
      newPattern,
      newVelocity,
      newProbability,
      complexifyFactor,
      patternLength
    );
  }

  // === Velocity humanization at high complexity ===
  if (complexifyFactor > 0.6) {
    humanizeVelocity(newPattern, newVelocity, complexifyFactor, patternLength);
  }

  // === Probability variation for groove feel ===
  if (complexifyFactor > 0.7) {
    addProbabilityVariation(newPattern, newProbability, complexifyFactor, patternLength);
  }
}

function addGhostNotes(
  pattern: DrumPattern,
  velocity: VelocityMap,
  probability: ProbabilityMap,
  instrumentId: string,
  amount: number,
  strongBeats: Set<number>,
  patternLength: PatternLength
) {
  const steps = pattern[instrumentId];
  if (!steps) return;

  // Possible ghost note positions: steps adjacent to existing hits
  for (let step = 0; step < patternLength; step++) {
    if (steps[step]) continue; // Skip already active steps
    if (strongBeats.has(step)) continue; // Don't add ghost notes on strong beats

    // Check if adjacent to an existing hit
    const prevStep = (step - 1 + patternLength) % patternLength;
    const nextStep = (step + 1) % patternLength;
    const hasNeighbor = steps[prevStep] || steps[nextStep];

    if (hasNeighbor && Math.random() < amount * 0.5) {
      steps[step] = true;
      // Ghost notes are quiet
      velocity[instrumentId][step] = Math.round(40 + Math.random() * 25);
      // And probabilistic
      probability[instrumentId][step] = Math.round(50 + amount * 30);
    }
  }
}

function enhanceHiHats(
  pattern: DrumPattern,
  velocity: VelocityMap,
  probability: ProbabilityMap,
  amount: number,
  config: ReturnType<typeof getGenreConfig>,
  patternLength: PatternLength,
  genre: Genre
) {
  const closedHH = pattern["hihat-closed"];
  if (!closedHH) return;

  const activeCount = countActiveSteps(closedHH);
  const maxSteps = patternLength;

  // Determine target density based on complexity
  // amount 0.2 → 50% density, amount 1.0 → 100% density
  const targetDensity = 0.4 + amount * 0.6;
  const targetCount = Math.round(maxSteps * targetDensity);

  if (activeCount < targetCount) {
    // Add hi-hat steps to reach target density
    // First fill 8th notes, then 16ths
    for (let step = 0; step < patternLength; step += 2) {
      if (!closedHH[step] && activeCount < targetCount) {
        closedHH[step] = true;
        velocity["hihat-closed"][step] = Math.round(70 + Math.random() * 20);
      }
    }

    // At high complexity + genres that allow it, fill 16th notes
    if (amount > 0.6 && (config.allowHihatRolls || amount > 0.9)) {
      for (let step = 0; step < patternLength; step++) {
        if (!closedHH[step]) {
          closedHH[step] = true;
          // 16th notes are softer
          velocity["hihat-closed"][step] = Math.round(45 + Math.random() * 25);
          // And more probabilistic for groove
          probability["hihat-closed"][step] = Math.round(60 + amount * 25);
        }
      }
    }
  }

  // Add accent pattern for hi-hats (louder on strong beats)
  if (amount > 0.3) {
    for (let step = 0; step < patternLength; step++) {
      if (!closedHH[step]) continue;
      if (step % 4 === 0) {
        velocity["hihat-closed"][step] = Math.min(
          127,
          Math.round(velocity["hihat-closed"][step] + 20)
        );
      } else if (step % 2 === 0) {
        // 8th note accents slightly louder
        velocity["hihat-closed"][step] = Math.min(
          127,
          Math.round(velocity["hihat-closed"][step] + 10)
        );
      }
    }
  }

  // Trap-specific: hi-hat rolls with triplet feel at high complexity
  if (genre === "trap" && amount > 0.7) {
    // Add rapid double-hits pattern
    for (let beat = 0; beat < patternLength; beat += 4) {
      // Every other beat, add 16th note flurry
      if (beat % 8 === 4) {
        for (let sub = 0; sub < 4; sub++) {
          const step = beat + sub;
          if (step < patternLength) {
            closedHH[step] = true;
            velocity["hihat-closed"][step] = Math.round(50 + (3 - sub) * 15);
          }
        }
      }
    }
  }
}

function addPercussionLayers(
  pattern: DrumPattern,
  velocity: VelocityMap,
  probability: ProbabilityMap,
  amount: number,
  strongBeats: Set<number>,
  mediumBeats: Set<number>,
  patternLength: PatternLength,
  genre: Genre
) {
  // Add clap layer
  if (amount > 0.3 && countActiveSteps(pattern["clap"]) === 0) {
    // Layer clap with snare
    const snareSteps = pattern["snare"];
    if (snareSteps) {
      for (let step = 0; step < patternLength; step++) {
        if (snareSteps[step]) {
          pattern["clap"][step] = true;
          velocity["clap"][step] = Math.round(70 + Math.random() * 20);
        }
      }
    }
  }

  // Add ride cymbal at medium-high complexity
  if (amount > 0.5 && countActiveSteps(pattern["ride"]) === 0) {
    for (let step = 0; step < patternLength; step += 4) {
      pattern["ride"][step] = true;
      velocity["ride"][step] = Math.round(60 + Math.random() * 20);
    }
    // Add offbeat ride at higher complexity
    if (amount > 0.7) {
      for (let step = 2; step < patternLength; step += 4) {
        pattern["ride"][step] = true;
        velocity["ride"][step] = Math.round(50 + Math.random() * 15);
        probability["ride"][step] = Math.round(70 + amount * 20);
      }
    }
  }

  // Add tom fills at high complexity
  if (amount > 0.6) {
    // Add tom accents near the end of the pattern (bar endings)
    const fillStart = patternLength - Math.round(2 + amount * 2);
    for (let step = fillStart; step < patternLength; step++) {
      const inst = step % 2 === 0 ? "tom-high" : "tom-low";
      if (!pattern[inst][step]) {
        pattern[inst][step] = true;
        velocity[inst][step] = Math.round(60 + (step - fillStart) * 10);
        probability[inst][step] = Math.round(40 + amount * 40);
      }
    }
  }

  // Genre-specific additions
  if (genre === "hip-hop" && amount > 0.5) {
    // Add syncopated kick ghost notes
    for (const step of [3, 11]) {
      if (step < patternLength && !pattern["kick"][step]) {
        pattern["kick"][step] = true;
        velocity["kick"][step] = Math.round(50 + Math.random() * 20);
        probability["kick"][step] = Math.round(60 + amount * 20);
      }
    }
  }

  if (genre === "house" && amount > 0.4) {
    // Reinforce four-on-the-floor with stronger accents
    for (let step = 0; step < patternLength; step += 4) {
      if (pattern["kick"][step]) {
        velocity["kick"][step] = Math.min(127, 110);
      }
    }
  }
}

function addOpenHiHatSyncopation(
  pattern: DrumPattern,
  velocity: VelocityMap,
  probability: ProbabilityMap,
  amount: number,
  patternLength: PatternLength
) {
  const openHH = pattern["hihat-open"];
  if (!openHH) return;

  // Add open hi-hat on offbeats for syncopation
  const offbeats = [3, 7, 11, 15].filter((s) => s < patternLength);
  for (const step of offbeats) {
    if (!openHH[step] && Math.random() < amount * 0.4) {
      openHH[step] = true;
      velocity["hihat-open"][step] = Math.round(60 + Math.random() * 25);
      probability["hihat-open"][step] = Math.round(50 + amount * 30);

      // Open hi-hat cancels closed hi-hat on the same step
      if (pattern["hihat-closed"][step]) {
        pattern["hihat-closed"][step] = false;
      }
    }
  }
}

function humanizeVelocity(
  pattern: DrumPattern,
  velocity: VelocityMap,
  amount: number,
  patternLength: PatternLength
) {
  // Add subtle velocity variations for humanization
  const variation = Math.round(amount * 15); // max +-15 velocity variation

  for (const inst of INSTRUMENTS) {
    const steps = pattern[inst.id];
    if (!steps) continue;

    for (let step = 0; step < patternLength; step++) {
      if (!steps[step]) continue;

      const currentVel = velocity[inst.id][step];
      const offset = Math.round((Math.random() - 0.5) * variation * 2);
      velocity[inst.id][step] = Math.max(1, Math.min(127, currentVel + offset));
    }
  }
}

function addProbabilityVariation(
  pattern: DrumPattern,
  probability: ProbabilityMap,
  amount: number,
  patternLength: PatternLength
) {
  // Add subtle probability variations for non-essential hits
  for (const inst of INSTRUMENTS) {
    const steps = pattern[inst.id];
    if (!steps) continue;
    const layer = INSTRUMENT_LAYERS[inst.id] || 5;

    // Only add probability variation to non-core instruments
    if (layer <= 2) continue;

    for (let step = 0; step < patternLength; step++) {
      if (!steps[step]) continue;

      // Weaker beat positions get more probability variation
      const isStrong = step % 4 === 0;
      if (!isStrong && probability[inst.id][step] === 100) {
        probability[inst.id][step] = Math.round(75 + Math.random() * 25);
      }
    }
  }
}

/**
 * Get a BPM adjustment suggestion based on complexity.
 * Complex patterns may benefit from slightly slower tempos for clarity.
 */
export function getComplexityBpmAdjustment(
  baseBpm: number,
  complexity: number,
  genre: Genre
): number {
  const config = getGenreConfig(genre);
  const level = Math.max(1, Math.min(10, Math.round(complexity)));

  if (level === 5) return 0;

  // Level 1-4: slightly faster (simpler patterns can handle faster BPM)
  // Level 6-10: slightly slower (complex patterns need breathing room)
  const factor = (level - 5) / 5; // -1 to +1
  return Math.round(-factor * config.bpmOffset);
}

/**
 * Get a human-readable description of the current complexity level.
 */
export function getComplexityLabel(complexity: number): string {
  const level = Math.max(1, Math.min(10, Math.round(complexity)));
  if (level <= 2) return "Minimal";
  if (level <= 4) return "Simple";
  if (level === 5) return "Standard";
  if (level <= 7) return "Detailed";
  if (level <= 9) return "Complex";
  return "Maximal";
}
