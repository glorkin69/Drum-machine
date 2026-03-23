// Swing and humanization engine for natural-feeling drum patterns

export interface HumanizeSettings {
  /** Swing percentage: 0 = straight, 50 = triplet swing, 100 = max swing. Delays off-beat (odd) 16th notes. */
  swing: number;
  /** Timing humanization amount in ms (0-20). Adds random ± offset to each step's timing. */
  timingHumanize: number;
  /** Velocity humanization percentage (0-30). Adds random ± variation to step velocities. */
  velocityHumanize: number;
}

export const DEFAULT_HUMANIZE: HumanizeSettings = {
  swing: 0,
  timingHumanize: 0,
  velocityHumanize: 0,
};

/**
 * Calculate swing timing offset for a given step.
 * Swing delays every other 16th note (odd steps: 1, 3, 5, 7, ...).
 * At swing=50, the off-beat lands exactly on a triplet grid.
 *
 * @param step - The current step index (0-based)
 * @param stepIntervalMs - Duration of one 16th note in ms
 * @param swingPercent - Swing amount (0-100)
 * @returns Timing offset in ms (always >= 0 for odd steps, 0 for even steps)
 */
export function getSwingOffsetMs(
  step: number,
  stepIntervalMs: number,
  swingPercent: number
): number {
  if (swingPercent <= 0) return 0;
  // Only delay odd-numbered steps (the "e" and "a" of 16th note subdivisions)
  if (step % 2 === 0) return 0;

  // At swing=50, the off-beat is delayed by 1/3 of a pair duration (triplet feel)
  // At swing=100, the off-beat is delayed by 2/3 of a pair (extreme shuffle)
  // Max delay is stepInterval * (2/3), which pushes the off-beat to a triplet position at 50%
  const maxDelayFraction = 2 / 3;
  const delayFraction = (swingPercent / 100) * maxDelayFraction;
  return stepIntervalMs * delayFraction;
}

/**
 * Calculate timing humanization offset.
 * Returns a random value between -amount and +amount in ms.
 *
 * @param timingHumanizeMs - Maximum humanization amount (0-20)
 * @returns Random offset in ms
 */
export function getTimingHumanizeOffsetMs(timingHumanizeMs: number): number {
  if (timingHumanizeMs <= 0) return 0;
  return (Math.random() * 2 - 1) * timingHumanizeMs;
}

/**
 * Apply velocity humanization to a velocity value.
 * Adds random variation while keeping within valid range (1-127).
 *
 * @param velocity - Base velocity (1-127)
 * @param velocityHumanizePercent - Humanization amount (0-30%)
 * @returns Adjusted velocity value
 */
export function humanizeVelocity(
  velocity: number,
  velocityHumanizePercent: number
): number {
  if (velocityHumanizePercent <= 0) return velocity;
  const variation = (velocityHumanizePercent / 100) * velocity;
  const offset = (Math.random() * 2 - 1) * variation;
  return Math.round(Math.max(1, Math.min(127, velocity + offset)));
}

/**
 * Calculate the total timing offset for a step (swing + humanize combined).
 * Returned in seconds for Web Audio API scheduling.
 *
 * @param step - Current step index
 * @param stepIntervalMs - Duration of one 16th note in ms
 * @param settings - Humanization settings
 * @returns Timing offset in seconds
 */
export function getStepTimingOffsetSec(
  step: number,
  stepIntervalMs: number,
  settings: HumanizeSettings
): number {
  const swingMs = getSwingOffsetMs(step, stepIntervalMs, settings.swing);
  const humanizeMs = getTimingHumanizeOffsetMs(settings.timingHumanize);
  return (swingMs + humanizeMs) / 1000;
}

// ────────────────────────────────────────────────────────────────────────────
// Auto Humanize: Intelligent one-click humanization for drum patterns
// ────────────────────────────────────────────────────────────────────────────

import type { DrumPattern, VelocityMap, ProbabilityMap, Genre, PatternLength } from "./drum-patterns";

/** Genre-specific auto-humanize presets */
interface GenreHumanizePreset {
  /** Base velocity variation range for non-core hits (±) */
  velocityRange: number;
  /** Velocity variation for core hits (kick on downbeats, snare on backbeats) — kept smaller */
  coreVelocityRange: number;
  /** Probability reduction range for ghost notes / decorative hits (subtracted from 100) */
  probabilityReduction: number;
  /** Swing amount to recommend (0-100) */
  swingAmount: number;
  /** How much to accent downbeats (velocity boost 0-20) */
  downbeatAccent: number;
  /** How much to accent backbeats (velocity boost 0-20) */
  backbeatAccent: number;
}

const GENRE_HUMANIZE_PRESETS: Record<string, GenreHumanizePreset> = {
  house: {
    velocityRange: 18,
    coreVelocityRange: 6,
    probabilityReduction: 12,
    swingAmount: 15,
    downbeatAccent: 10,
    backbeatAccent: 5,
  },
  electronic: {
    velocityRange: 12,
    coreVelocityRange: 4,
    probabilityReduction: 8,
    swingAmount: 5,
    downbeatAccent: 8,
    backbeatAccent: 4,
  },
  "lo-fi": {
    velocityRange: 25,
    coreVelocityRange: 10,
    probabilityReduction: 18,
    swingAmount: 30,
    downbeatAccent: 6,
    backbeatAccent: 8,
  },
  pop: {
    velocityRange: 15,
    coreVelocityRange: 5,
    probabilityReduction: 10,
    swingAmount: 8,
    downbeatAccent: 12,
    backbeatAccent: 8,
  },
  rock: {
    velocityRange: 20,
    coreVelocityRange: 8,
    probabilityReduction: 10,
    swingAmount: 5,
    downbeatAccent: 15,
    backbeatAccent: 12,
  },
  "hip-hop": {
    velocityRange: 22,
    coreVelocityRange: 8,
    probabilityReduction: 15,
    swingAmount: 25,
    downbeatAccent: 8,
    backbeatAccent: 10,
  },
  trap: {
    velocityRange: 20,
    coreVelocityRange: 6,
    probabilityReduction: 12,
    swingAmount: 10,
    downbeatAccent: 10,
    backbeatAccent: 6,
  },
};

const DEFAULT_HUMANIZE_PRESET: GenreHumanizePreset = {
  velocityRange: 18,
  coreVelocityRange: 6,
  probabilityReduction: 12,
  swingAmount: 10,
  downbeatAccent: 10,
  backbeatAccent: 8,
};

/** Core instruments that should receive gentler humanization */
const CORE_INSTRUMENTS = new Set(["kick", "snare"]);

/** Decorative/auxiliary instruments that can receive stronger humanization */
const DECORATIVE_INSTRUMENTS = new Set(["ride", "tom-high", "tom-low", "clap"]);

/**
 * Checks if a step is a downbeat (beat 1, 2, 3, 4 in a 16th-note grid).
 * Steps 0, 4, 8, 12 are downbeats in a 16-step pattern.
 */
function isDownbeat(step: number): boolean {
  return step % 4 === 0;
}

/**
 * Checks if a step is a backbeat (beats 2 and 4).
 * Steps 4 and 12 in a 16-step pattern.
 */
function isBackbeat(step: number): boolean {
  return step % 8 === 4;
}

/**
 * Scale humanization intensity based on BPM.
 * Faster tempos get smaller variations (tight timing matters more).
 * Slower tempos can tolerate larger variations.
 */
function getBpmScaleFactor(bpm: number): number {
  // At 120 BPM → factor 1.0, at 180 BPM → ~0.7, at 70 BPM → ~1.3
  return Math.max(0.5, Math.min(1.5, 120 / bpm));
}

/**
 * Estimate pattern complexity (0-1) based on how many steps are active.
 * More complex patterns get slightly less humanization to avoid muddiness.
 */
function estimateComplexity(pattern: DrumPattern, patternLength: PatternLength): number {
  let activeSteps = 0;
  let totalSteps = 0;
  for (const instrumentId of Object.keys(pattern)) {
    const steps = pattern[instrumentId];
    if (!steps) continue;
    for (let i = 0; i < patternLength; i++) {
      totalSteps++;
      if (steps[i]) activeSteps++;
    }
  }
  return totalSteps > 0 ? activeSteps / totalSteps : 0;
}

export interface AutoHumanizeResult {
  velocity: VelocityMap;
  probability: ProbabilityMap;
  /** Recommended swing setting */
  recommendedSwing: number;
  /** Recommended timing humanize setting */
  recommendedTimingHumanize: number;
  /** Recommended velocity humanize setting */
  recommendedVelocityHumanize: number;
}

/**
 * Apply intelligent auto-humanization to a drum pattern.
 * Modifies velocity and probability maps to create more natural-feeling patterns.
 *
 * Key behaviors:
 * - Kick on downbeats and snare on backbeats stay strong and consistent
 * - Hi-hats and decorative instruments get more variation
 * - Genre-appropriate swing and velocity ranges
 * - BPM-aware (faster = tighter, slower = looser)
 * - Complexity-aware (busier patterns = subtler changes)
 */
export function autoHumanize(
  pattern: DrumPattern,
  velocity: VelocityMap,
  probability: ProbabilityMap,
  genre: Genre,
  bpm: number,
  patternLength: PatternLength
): AutoHumanizeResult {
  const preset = GENRE_HUMANIZE_PRESETS[genre] || DEFAULT_HUMANIZE_PRESET;
  const bpmScale = getBpmScaleFactor(bpm);
  const complexity = estimateComplexity(pattern, patternLength);
  // Busier patterns get less humanization to stay clean
  const complexityScale = Math.max(0.6, 1.0 - complexity * 0.4);
  const overallScale = bpmScale * complexityScale;

  const newVelocity: VelocityMap = {};
  const newProbability: ProbabilityMap = {};

  for (const instrumentId of Object.keys(pattern)) {
    const steps = pattern[instrumentId];
    if (!steps) continue;

    const baseVel = velocity[instrumentId] || Array(patternLength).fill(100);
    const baseProb = probability[instrumentId] || Array(patternLength).fill(100);
    const newVelSteps = [...baseVel];
    const newProbSteps = [...baseProb];

    const isCore = CORE_INSTRUMENTS.has(instrumentId);
    const isDecorative = DECORATIVE_INSTRUMENTS.has(instrumentId);
    const velRange = isCore
      ? preset.coreVelocityRange * overallScale
      : preset.velocityRange * overallScale * (isDecorative ? 1.2 : 1.0);

    for (let step = 0; step < patternLength; step++) {
      if (!steps[step]) continue; // Skip inactive steps

      // ── Velocity humanization ──
      let velOffset = (Math.random() * 2 - 1) * velRange;

      // Accent downbeats (especially for kick)
      if (isDownbeat(step) && (instrumentId === "kick" || instrumentId === "hihat-closed")) {
        velOffset += preset.downbeatAccent * overallScale;
      }

      // Accent backbeats (especially for snare/clap)
      if (isBackbeat(step) && (instrumentId === "snare" || instrumentId === "clap")) {
        velOffset += preset.backbeatAccent * overallScale;
      }

      // Soften offbeat hi-hats slightly for groove
      if ((instrumentId === "hihat-closed" || instrumentId === "hihat-open") && step % 2 !== 0) {
        velOffset -= 5 * overallScale;
      }

      newVelSteps[step] = Math.round(Math.max(1, Math.min(127, baseVel[step] + velOffset)));

      // ── Probability humanization ──
      // Only reduce probability on non-core, non-downbeat steps
      if (!isCore || !isDownbeat(step)) {
        const probReduction = isDecorative
          ? preset.probabilityReduction * overallScale * 1.3
          : isCore
            ? preset.probabilityReduction * overallScale * 0.3
            : preset.probabilityReduction * overallScale;

        // Random application — not all steps get probability changes
        if (Math.random() < 0.4) {
          const reduction = Math.random() * probReduction;
          newProbSteps[step] = Math.round(Math.max(50, baseProb[step] - reduction));
        }
      }
    }

    newVelocity[instrumentId] = newVelSteps;
    newProbability[instrumentId] = newProbSteps;
  }

  // Calculate recommended real-time humanize settings
  const recommendedSwing = Math.round(preset.swingAmount * overallScale);
  const recommendedTimingHumanize = Math.round(
    Math.min(15, (preset.velocityRange / 3) * overallScale)
  );
  const recommendedVelocityHumanize = Math.round(
    Math.min(20, (preset.velocityRange / 2) * overallScale)
  );

  return {
    velocity: newVelocity,
    probability: newProbability,
    recommendedSwing,
    recommendedTimingHumanize,
    recommendedVelocityHumanize,
  };
}
