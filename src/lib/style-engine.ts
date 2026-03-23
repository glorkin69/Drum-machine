/**
 * Style Engine - Pattern generation and evolution guided by Style DNA
 *
 * Takes a base pattern and transforms it according to a style fingerprint
 * (either from an artist DNA profile or the user's personal style).
 */

import { INSTRUMENTS, type DrumPattern, type Genre, type SongPart, PRESET_PATTERNS } from "./drum-patterns";
import type { StyleFingerprint, ArtistDNA } from "./style-dna";

// ============================================================================
// PATTERN EVOLUTION
// ============================================================================

/**
 * Evolve a pattern to match a given style DNA while preserving its core structure.
 * Returns a new DrumPattern (raw, to be fed through the complexity engine).
 */
export function evolvePattern(
  basePattern: DrumPattern,
  styleDNA: StyleFingerprint | ArtistDNA,
  genre: Genre,
  patternLength: number = 16
): DrumPattern {
  const fingerprint = "fingerprint" in styleDNA ? styleDNA.fingerprint : styleDNA;
  const transformHints = "transformHints" in styleDNA ? styleDNA.transformHints : null;
  const evolved: DrumPattern = {};

  // Deep copy the base pattern
  for (const inst of INSTRUMENTS) {
    evolved[inst.id] = [...(basePattern[inst.id] || Array(patternLength).fill(false))].slice(0, patternLength);
    // Pad if needed
    while (evolved[inst.id].length < patternLength) {
      evolved[inst.id].push(false);
    }
  }

  // Apply kick pattern transformation
  applyKickStyle(evolved, fingerprint, transformHints, patternLength);

  // Apply snare/clap pattern transformation
  applySnareStyle(evolved, fingerprint, transformHints, patternLength);

  // Apply hi-hat style
  applyHiHatStyle(evolved, fingerprint, transformHints, patternLength);

  // Apply percussion layer adjustments
  applyPercussionStyle(evolved, fingerprint, patternLength);

  // Apply ghost notes based on DNA
  if (transformHints && transformHints.ghostNoteAmount > 0.2) {
    applyGhostNotes(evolved, transformHints.ghostNoteAmount, patternLength);
  } else if (fingerprint.syncopation > 0.4) {
    applyGhostNotes(evolved, fingerprint.syncopation * 0.5, patternLength);
  }

  return evolved;
}

/**
 * Apply style transfer: transform a pattern from one style to another.
 */
export function applyStyleTransfer(
  pattern: DrumPattern,
  targetStyle: StyleFingerprint | ArtistDNA,
  genre: Genre,
  patternLength: number = 16
): DrumPattern {
  // Style transfer is essentially evolving toward the target style
  return evolvePattern(pattern, targetStyle, genre, patternLength);
}

/**
 * Generate a completely new pattern from a style DNA + genre/part combination.
 * Uses the preset pattern as a seed and heavily transforms it.
 */
export function generateFromDNA(
  styleDNA: StyleFingerprint | ArtistDNA,
  genre: Genre,
  songPart: SongPart,
  patternLength: number = 16
): DrumPattern {
  const fingerprint = "fingerprint" in styleDNA ? styleDNA.fingerprint : styleDNA;

  // Start from an empty canvas
  const pattern: DrumPattern = {};
  for (const inst of INSTRUMENTS) {
    pattern[inst.id] = Array(patternLength).fill(false) as boolean[];
  }

  const transformHints = "transformHints" in styleDNA ? styleDNA.transformHints : null;

  // Build kick pattern from DNA
  if (transformHints) {
    // Use artist-specific kick bias
    for (const pos of transformHints.kickBias) {
      if (pos < patternLength) {
        pattern["kick"][pos] = true;
      }
    }
    // Use artist snare bias
    for (const pos of transformHints.snareBias) {
      if (pos < patternLength) {
        pattern["snare"][pos] = true;
      }
    }
  } else {
    // Generate from fingerprint
    buildFromFingerprint(pattern, fingerprint, patternLength);
  }

  // Build hi-hat pattern based on style
  applyHiHatStyle(pattern, fingerprint, transformHints, patternLength);

  // Add percussion layers based on density
  applyPercussionStyle(pattern, fingerprint, patternLength);

  // Apply density scaling based on song part
  applyPartScaling(pattern, songPart, patternLength);

  // Ghost notes
  const ghostAmount = transformHints?.ghostNoteAmount ?? fingerprint.syncopation * 0.4;
  if (ghostAmount > 0.15) {
    applyGhostNotes(pattern, ghostAmount, patternLength);
  }

  return pattern;
}

// ============================================================================
// INTERNAL TRANSFORM FUNCTIONS
// ============================================================================

function applyKickStyle(
  pattern: DrumPattern,
  fp: StyleFingerprint,
  hints: ArtistDNA["transformHints"] | null,
  patternLength: number
) {
  const kick = pattern["kick"];
  if (!kick) return;

  if (hints) {
    // Blend existing pattern with artist kick bias
    const newKick = Array(patternLength).fill(false) as boolean[];

    // Keep some existing kick hits (50% chance)
    for (let i = 0; i < patternLength; i++) {
      if (kick[i] && Math.random() < 0.5) {
        newKick[i] = true;
      }
    }

    // Add artist bias kicks
    for (const pos of hints.kickBias) {
      if (pos < patternLength) {
        newKick[pos] = true;
      }
    }

    // Ensure at least beat 1 has a kick
    newKick[0] = true;

    pattern["kick"] = newKick;
  } else {
    // Adjust kick density based on fingerprint
    const targetHits = Math.max(1, Math.round(fp.kickDensity * patternLength));
    adjustDensity(kick, targetHits, patternLength, [0, 8]); // preserve downbeats
  }
}

function applySnareStyle(
  pattern: DrumPattern,
  fp: StyleFingerprint,
  hints: ArtistDNA["transformHints"] | null,
  patternLength: number
) {
  const snare = pattern["snare"];
  if (!snare) return;

  if (hints) {
    // Use artist snare bias
    const newSnare = Array(patternLength).fill(false) as boolean[];
    for (const pos of hints.snareBias) {
      if (pos < patternLength) {
        newSnare[pos] = true;
      }
    }
    // Add occasional ghost snare based on DNA
    if (fp.syncopation > 0.3) {
      for (let i = 0; i < patternLength; i++) {
        if (!newSnare[i] && Math.random() < fp.syncopation * 0.15) {
          newSnare[i] = true;
        }
      }
    }
    pattern["snare"] = newSnare;
  } else {
    // Standard backbeat if strong backbeat fingerprint
    if (fp.backbeatStrength > 0.5) {
      const newSnare = Array(patternLength).fill(false) as boolean[];
      for (const pos of [4, 12]) {
        if (pos < patternLength) newSnare[pos] = true;
      }
      pattern["snare"] = newSnare;
    }
  }

  // Clap layering based on fingerprint
  if (fp.percDensity > 0.15 && fp.backbeatStrength > 0.4) {
    const clap = pattern["clap"];
    const snareSteps = pattern["snare"];
    if (clap && snareSteps) {
      for (let i = 0; i < patternLength; i++) {
        if (snareSteps[i] && Math.random() < fp.percDensity * 2) {
          clap[i] = true;
        }
      }
    }
  }
}

function applyHiHatStyle(
  pattern: DrumPattern,
  fp: StyleFingerprint,
  hints: ArtistDNA["transformHints"] | null,
  patternLength: number
) {
  const hihatStyle = hints?.hihatStyle ?? (
    fp.swingTendency > 0.5 ? "swing" :
    fp.hihatDensity > 0.7 ? "rolls" :
    fp.hihatDensity < 0.2 ? "sparse" : "straight"
  );

  const closed = pattern["hihat-closed"];
  const open = pattern["hihat-open"];
  if (!closed || !open) return;

  // Reset hi-hats
  const newClosed = Array(patternLength).fill(false) as boolean[];
  const newOpen = Array(patternLength).fill(false) as boolean[];

  switch (hihatStyle) {
    case "straight": {
      // Steady 8th notes
      for (let i = 0; i < patternLength; i += 2) {
        newClosed[i] = true;
      }
      // Occasional open hat on offbeats
      if (fp.hihatDensity > 0.3) {
        for (const pos of [6, 14]) {
          if (pos < patternLength && Math.random() < 0.6) {
            newOpen[pos] = true;
            newClosed[pos] = false;
          }
        }
      }
      break;
    }
    case "swing": {
      // Swing pattern with emphasis on 3rd 16th note of each beat
      for (let beat = 0; beat < patternLength; beat += 4) {
        newClosed[beat] = true;
        if (beat + 3 < patternLength) newClosed[beat + 3] = true;
        if (beat + 2 < patternLength && Math.random() < 0.5) newClosed[beat + 2] = true;
      }
      // Open hat on select swing positions
      for (const pos of [7, 15]) {
        if (pos < patternLength && Math.random() < 0.4) {
          newOpen[pos] = true;
        }
      }
      break;
    }
    case "rolls": {
      // 16th note rolls (trap style)
      for (let i = 0; i < patternLength; i++) {
        newClosed[i] = true;
      }
      // Open hat accents
      for (const pos of [3, 7, 11, 15]) {
        if (pos < patternLength && Math.random() < 0.5) {
          newOpen[pos] = true;
        }
      }
      break;
    }
    case "sparse": {
      // Minimal hi-hat
      for (let i = 0; i < patternLength; i += 4) {
        newClosed[i] = true;
      }
      break;
    }
  }

  pattern["hihat-closed"] = newClosed;
  pattern["hihat-open"] = newOpen;
}

function applyPercussionStyle(
  pattern: DrumPattern,
  fp: StyleFingerprint,
  patternLength: number
) {
  // Ride cymbal
  if (fp.instrumentWeights["ride"] > 0.15) {
    const ride = pattern["ride"];
    if (ride) {
      for (let i = 0; i < patternLength; i += 4) {
        if (Math.random() < fp.instrumentWeights["ride"] * 2) {
          ride[i] = true;
        }
      }
    }
  }

  // Toms (mainly for fills/accents near end of bar)
  if (fp.percDensity > 0.1) {
    const tomHigh = pattern["tom-high"];
    const tomLow = pattern["tom-low"];
    if (tomHigh && tomLow) {
      const fillStart = patternLength - 3;
      for (let i = fillStart; i < patternLength; i++) {
        if (Math.random() < fp.percDensity * 1.5) {
          if (i % 2 === 0) tomHigh[i] = true;
          else tomLow[i] = true;
        }
      }
    }
  }
}

function applyGhostNotes(
  pattern: DrumPattern,
  amount: number,
  patternLength: number
) {
  // Add ghost kick notes
  const kick = pattern["kick"];
  if (kick) {
    for (let i = 0; i < patternLength; i++) {
      if (!kick[i]) {
        const prevHit = i > 0 && kick[i - 1];
        const nextHit = i < patternLength - 1 && kick[i + 1];
        if ((prevHit || nextHit) && Math.random() < amount * 0.3) {
          kick[i] = true;
        }
      }
    }
  }

  // Add ghost snare notes
  const snare = pattern["snare"];
  if (snare) {
    for (let i = 0; i < patternLength; i++) {
      if (!snare[i] && i % 4 !== 0) {
        if (Math.random() < amount * 0.15) {
          snare[i] = true;
        }
      }
    }
  }
}

function buildFromFingerprint(
  pattern: DrumPattern,
  fp: StyleFingerprint,
  patternLength: number
) {
  // Kick
  const kickHits = Math.max(1, Math.round(fp.kickDensity * patternLength));
  pattern["kick"][0] = true; // Always kick on beat 1
  if (fp.downbeatStrength > 0.4 && patternLength > 8) {
    pattern["kick"][8] = true; // Beat 3
  }
  // Add syncopated kicks
  const kickPositions = [4, 6, 10, 12, 14, 3, 7];
  let kickCount = countHits(pattern["kick"]);
  for (const pos of kickPositions) {
    if (kickCount >= kickHits) break;
    if (pos < patternLength && !pattern["kick"][pos] && Math.random() < fp.syncopation + 0.2) {
      pattern["kick"][pos] = true;
      kickCount++;
    }
  }

  // Snare
  if (fp.backbeatStrength > 0.3) {
    if (4 < patternLength) pattern["snare"][4] = true;
    if (12 < patternLength) pattern["snare"][12] = true;
  }
}

function adjustDensity(
  steps: boolean[],
  targetHits: number,
  patternLength: number,
  preservePositions: number[]
) {
  let currentHits = steps.filter(Boolean).length;

  if (currentHits < targetHits) {
    // Add hits
    const candidates = [];
    for (let i = 0; i < patternLength; i++) {
      if (!steps[i]) candidates.push(i);
    }
    // Shuffle candidates
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    for (const pos of candidates) {
      if (currentHits >= targetHits) break;
      steps[pos] = true;
      currentHits++;
    }
  } else if (currentHits > targetHits) {
    // Remove hits (preserving essential positions)
    const removable = [];
    for (let i = 0; i < patternLength; i++) {
      if (steps[i] && !preservePositions.includes(i)) {
        removable.push(i);
      }
    }
    // Shuffle
    for (let i = removable.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [removable[i], removable[j]] = [removable[j], removable[i]];
    }
    for (const pos of removable) {
      if (currentHits <= targetHits) break;
      steps[pos] = false;
      currentHits--;
    }
  }
}

function applyPartScaling(
  pattern: DrumPattern,
  songPart: SongPart,
  patternLength: number
) {
  // Scale pattern density based on song part
  const partDensityScale: Record<SongPart, number> = {
    intro: 0.4,
    verse: 0.7,
    chorus: 1.0,
    bridge: 0.5,
    outro: 0.3,
  };

  const scale = partDensityScale[songPart];
  if (scale >= 0.9) return; // Full density, no scaling needed

  // Remove hits from non-essential instruments based on scale
  const nonEssential = ["clap", "tom-high", "tom-low", "ride", "hihat-open"];
  for (const instId of nonEssential) {
    const steps = pattern[instId];
    if (!steps) continue;
    for (let i = 0; i < patternLength; i++) {
      if (steps[i] && Math.random() > scale) {
        steps[i] = false;
      }
    }
  }

  // For very sparse parts, thin out hi-hats
  if (scale < 0.5) {
    const closed = pattern["hihat-closed"];
    if (closed) {
      for (let i = 0; i < patternLength; i++) {
        if (closed[i] && i % 4 !== 0 && Math.random() > scale * 1.5) {
          closed[i] = false;
        }
      }
    }
  }
}

function countHits(steps: boolean[]): number {
  return steps.filter(Boolean).length;
}
