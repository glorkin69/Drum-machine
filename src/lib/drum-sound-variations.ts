// Drum sound variation definitions with synthesis parameters per genre
// Each variation defines parameter overrides for the audio engine

import type { Genre } from "./drum-patterns";

export interface SynthParams {
  // Oscillator params
  oscType?: OscillatorType;
  freqStart?: number;
  freqEnd?: number;
  freqDecay?: number; // seconds for freq envelope

  // Amplitude envelope
  attack?: number;
  decay?: number;
  gainStart?: number;

  // Sub/body layer
  subFreqStart?: number;
  subFreqEnd?: number;
  subDecay?: number;
  subGain?: number;

  // Click/transient
  clickFreq?: number;
  clickGain?: number;
  clickDecay?: number;

  // Noise params (snare, hats, clap)
  noiseGain?: number;
  noiseDecay?: number;
  noiseBandpass?: number;
  noiseBandpassQ?: number;
  noiseHighpass?: number;

  // Tone body (snare)
  toneFreqStart?: number;
  toneFreqEnd?: number;
  toneDecay?: number;
  toneGain?: number;

  // Filter
  filterType?: BiquadFilterType;
  filterFreq?: number;
  filterQ?: number;

  // Clap-specific
  burstCount?: number;
  burstSpacing?: number;
  tailDecay?: number;

  // Ride-specific
  metallicFreqs?: number[];
  shimmerGain?: number;
  shimmerDecay?: number;

  // Saturation/distortion simulation
  saturation?: number; // 0-1, clips gain for lo-fi feel
}

export interface DrumSoundVariation {
  id: string;
  name: string;
  description: string;
  params: SynthParams;
}

export type SoundVariationMap = Record<string, DrumSoundVariation[]>;

// Default "standard" variation ID used when none selected
export const DEFAULT_VARIATION_ID = "default";

// Type for storing selected variations per instrument
export type SelectedVariations = Record<string, string>; // instrumentId -> variationId

// Get default variations (first/default for each instrument)
export function getDefaultVariations(): SelectedVariations {
  return {
    kick: DEFAULT_VARIATION_ID,
    snare: DEFAULT_VARIATION_ID,
    "hihat-closed": DEFAULT_VARIATION_ID,
    "hihat-open": DEFAULT_VARIATION_ID,
    clap: DEFAULT_VARIATION_ID,
    "tom-high": DEFAULT_VARIATION_ID,
    "tom-low": DEFAULT_VARIATION_ID,
    ride: DEFAULT_VARIATION_ID,
  };
}

// ============================================================
// GENRE-SPECIFIC SOUND VARIATIONS
// ============================================================

const HOUSE_VARIATIONS: SoundVariationMap = {
  kick: [
    { id: "default", name: "Classic", description: "Standard four-on-the-floor house kick", params: {} },
    { id: "deep", name: "Deep", description: "Deep sub-heavy kick with extended low end", params: { freqStart: 120, freqEnd: 30, decay: 0.55, subFreqStart: 60, subFreqEnd: 22, subGain: 0.9, subDecay: 0.45, clickGain: 0.15 } },
    { id: "punchy", name: "Punchy", description: "Tight punchy kick with fast attack", params: { freqStart: 180, freqEnd: 50, freqDecay: 0.05, decay: 0.3, clickFreq: 1500, clickGain: 0.45, clickDecay: 0.008 } },
    { id: "sub", name: "Sub Kick", description: "Pure sub-bass kick for deep house", params: { freqStart: 80, freqEnd: 30, decay: 0.6, gainStart: 0.9, subFreqStart: 50, subFreqEnd: 20, subGain: 1.0, subDecay: 0.5, clickGain: 0.05 } },
  ],
  snare: [
    { id: "default", name: "Classic", description: "Standard house snare", params: {} },
    { id: "crisp", name: "Crisp", description: "Bright crisp snare with tight decay", params: { noiseBandpass: 6500, noiseBandpassQ: 1.0, noiseHighpass: 2000, noiseDecay: 0.15, toneGain: 0.4 } },
    { id: "clap-snare", name: "Clap Snare", description: "Hybrid clap-snare layered hit", params: { noiseBandpass: 3500, noiseDecay: 0.25, noiseGain: 0.9, toneFreqStart: 300, toneGain: 0.3 } },
    { id: "rimshot", name: "Rimshot", description: "Tight rimshot with metallic edge", params: { noiseBandpass: 8000, noiseBandpassQ: 1.5, noiseDecay: 0.08, noiseGain: 0.5, toneFreqStart: 400, toneFreqEnd: 200, toneDecay: 0.06, toneGain: 0.8 } },
  ],
  "hihat-closed": [
    { id: "default", name: "Classic", description: "Standard closed hi-hat", params: {} },
    { id: "tight", name: "Tight", description: "Very tight clicking hat", params: { noiseDecay: 0.025, noiseHighpass: 9000, noiseBandpass: 12000 } },
    { id: "sizzle", name: "Sizzle", description: "Sizzling bright hat with character", params: { noiseDecay: 0.08, noiseHighpass: 6000, noiseBandpassQ: 1.8, noiseGain: 0.6 } },
  ],
  "hihat-open": [
    { id: "default", name: "Classic", description: "Standard open hi-hat", params: {} },
    { id: "wash", name: "Wash", description: "Long washy open hat", params: { noiseDecay: 0.55, noiseHighpass: 5500, noiseGain: 0.55 } },
    { id: "bright", name: "Bright", description: "Short bright open hat", params: { noiseDecay: 0.2, noiseHighpass: 8000, noiseBandpass: 11000 } },
  ],
  clap: [
    { id: "default", name: "Classic", description: "Standard house clap", params: {} },
    { id: "wide", name: "Wide", description: "Wide stereo clap with long tail", params: { burstCount: 6, burstSpacing: 0.008, tailDecay: 0.45, noiseBandpass: 2000 } },
    { id: "tight", name: "Tight", description: "Short tight clap", params: { burstCount: 3, burstSpacing: 0.006, tailDecay: 0.15, noiseBandpass: 3500 } },
  ],
  "tom-high": [
    { id: "default", name: "Classic", description: "Standard high tom", params: {} },
    { id: "tuned", name: "Tuned", description: "Higher pitched tuned tom", params: { freqStart: 280, freqEnd: 140, decay: 0.2 } },
  ],
  "tom-low": [
    { id: "default", name: "Classic", description: "Standard low tom", params: {} },
    { id: "floor", name: "Floor Tom", description: "Deep floor tom with weight", params: { freqStart: 120, freqEnd: 45, decay: 0.45 } },
  ],
  ride: [
    { id: "default", name: "Classic", description: "Standard ride cymbal", params: {} },
    { id: "bell", name: "Bell", description: "Ride bell with more ring", params: { metallicFreqs: [500, 700, 900, 1100, 1300], shimmerGain: 0.06, filterFreq: 6000 } },
  ],
};

const ELECTRONIC_VARIATIONS: SoundVariationMap = {
  kick: [
    { id: "default", name: "808", description: "Classic 808-style electronic kick", params: { freqStart: 160, freqEnd: 35, decay: 0.45, subFreqStart: 70, subFreqEnd: 25, subGain: 0.8 } },
    { id: "synth", name: "Synth", description: "Synthetic kick with tonal body", params: { freqStart: 200, freqEnd: 50, freqDecay: 0.06, decay: 0.35, clickFreq: 2000, clickGain: 0.35 } },
    { id: "distorted", name: "Distorted", description: "Heavily driven distorted kick", params: { freqStart: 180, freqEnd: 40, decay: 0.5, gainStart: 1.3, subGain: 1.0, clickFreq: 1200, clickGain: 0.5, saturation: 0.7 } },
    { id: "gabber", name: "Gabber", description: "Hard-hitting gabber kick", params: { freqStart: 250, freqEnd: 35, freqDecay: 0.04, decay: 0.4, gainStart: 1.4, clickFreq: 3000, clickGain: 0.6, saturation: 0.8 } },
  ],
  snare: [
    { id: "default", name: "Digital", description: "Clean digital snare", params: {} },
    { id: "gated", name: "Gated", description: "Gated reverb snare with short tail", params: { noiseDecay: 0.12, noiseGain: 1.0, toneFreqStart: 300, toneGain: 0.7, noiseBandpass: 4000 } },
    { id: "reverse", name: "Reverse", description: "Reverse attack snare feel", params: { noiseGain: 0.3, noiseDecay: 0.3, toneFreqStart: 180, toneFreqEnd: 280, toneDecay: 0.15, toneGain: 0.6 } },
    { id: "noise", name: "Noise Burst", description: "Pure filtered noise burst", params: { noiseGain: 1.0, noiseDecay: 0.18, noiseBandpass: 3000, noiseBandpassQ: 0.5, toneGain: 0.1 } },
  ],
  "hihat-closed": [
    { id: "default", name: "Digital", description: "Clean digital hat", params: {} },
    { id: "bit", name: "Bit-Crush", description: "Gritty reduced bit-depth hat", params: { noiseDecay: 0.04, noiseHighpass: 5000, noiseBandpass: 8000, noiseBandpassQ: 2.0, noiseGain: 0.65 } },
    { id: "click", name: "Click", description: "Short percussive click", params: { noiseDecay: 0.015, noiseHighpass: 10000, noiseGain: 0.7 } },
  ],
  "hihat-open": [
    { id: "default", name: "Digital", description: "Standard digital open hat", params: {} },
    { id: "crash", name: "Crash", description: "Crash-like open hat", params: { noiseDecay: 0.6, noiseHighpass: 4000, noiseGain: 0.5 } },
    { id: "filtered", name: "Filtered", description: "Band-pass filtered open hat", params: { noiseDecay: 0.3, noiseBandpass: 7000, noiseBandpassQ: 2.0 } },
  ],
  clap: [
    { id: "default", name: "Digital", description: "Clean electronic clap", params: {} },
    { id: "glitch", name: "Glitch", description: "Glitchy rapid-fire clap", params: { burstCount: 8, burstSpacing: 0.004, tailDecay: 0.1, noiseBandpass: 4000 } },
    { id: "big", name: "Big Room", description: "Big room reverb-drenched clap", params: { burstCount: 5, burstSpacing: 0.012, tailDecay: 0.5, noiseBandpass: 2000, noiseBandpassQ: 0.4 } },
  ],
  "tom-high": [
    { id: "default", name: "Synth", description: "Synthetic high tom", params: {} },
    { id: "zap", name: "Zap", description: "Laser zap tom sound", params: { freqStart: 600, freqEnd: 80, freqDecay: 0.04, decay: 0.15 } },
  ],
  "tom-low": [
    { id: "default", name: "Synth", description: "Synthetic low tom", params: {} },
    { id: "boom", name: "Boom", description: "Deep booming low tom", params: { freqStart: 120, freqEnd: 35, decay: 0.5, clickGain: 0.1 } },
  ],
  ride: [
    { id: "default", name: "Cyber", description: "Cyber metallic ride", params: {} },
    { id: "glass", name: "Glass", description: "Glassy bright ride", params: { metallicFreqs: [600, 900, 1200, 1500, 1800], filterFreq: 8000, shimmerGain: 0.15 } },
  ],
};

const LOFI_VARIATIONS: SoundVariationMap = {
  kick: [
    { id: "default", name: "Vinyl", description: "Warm vinyl-textured kick", params: { freqStart: 130, freqEnd: 38, decay: 0.45, subGain: 0.6, clickGain: 0.15, saturation: 0.3 } },
    { id: "dusty", name: "Dusty", description: "Dusty degraded kick with character", params: { freqStart: 120, freqEnd: 35, decay: 0.5, gainStart: 0.85, subGain: 0.5, clickGain: 0.1, saturation: 0.5 } },
    { id: "warm", name: "Warm", description: "Warm rounded kick with soft attack", params: { freqStart: 100, freqEnd: 35, decay: 0.4, gainStart: 0.8, subFreqStart: 60, subGain: 0.7, clickGain: 0.05 } },
    { id: "tape", name: "Tape", description: "Tape-saturated kick", params: { freqStart: 140, freqEnd: 40, decay: 0.48, saturation: 0.6, clickGain: 0.2, subGain: 0.65 } },
  ],
  snare: [
    { id: "default", name: "Crackling", description: "Vinyl crackle-textured snare", params: { noiseDecay: 0.25, noiseBandpass: 3500, noiseGain: 0.7, toneGain: 0.5, saturation: 0.3 } },
    { id: "tape", name: "Tape", description: "Tape-saturated warm snare", params: { noiseDecay: 0.22, noiseBandpass: 3000, noiseBandpassQ: 0.6, noiseGain: 0.65, toneGain: 0.55, saturation: 0.5 } },
    { id: "filtered", name: "Filtered", description: "Low-pass filtered muffled snare", params: { noiseDecay: 0.2, noiseBandpass: 2500, noiseBandpassQ: 0.5, noiseHighpass: 800, noiseGain: 0.6, toneGain: 0.6 } },
    { id: "brush", name: "Brush", description: "Soft brush snare texture", params: { noiseDecay: 0.3, noiseBandpass: 4000, noiseGain: 0.4, toneFreqStart: 200, toneGain: 0.3, saturation: 0.2 } },
  ],
  "hihat-closed": [
    { id: "default", name: "Dusty", description: "Dusty lo-fi closed hat", params: { noiseDecay: 0.04, noiseHighpass: 5000, noiseGain: 0.4, saturation: 0.3 } },
    { id: "soft", name: "Soft", description: "Soft muted hat", params: { noiseDecay: 0.035, noiseHighpass: 4000, noiseBandpass: 7000, noiseGain: 0.3 } },
    { id: "vinyl", name: "Vinyl", description: "Vinyl-crackle hat texture", params: { noiseDecay: 0.06, noiseHighpass: 4500, noiseGain: 0.45, saturation: 0.4 } },
  ],
  "hihat-open": [
    { id: "default", name: "Warm", description: "Warm open hat", params: { noiseDecay: 0.3, noiseHighpass: 5000, noiseGain: 0.4 } },
    { id: "hazy", name: "Hazy", description: "Hazy filtered open hat", params: { noiseDecay: 0.4, noiseHighpass: 4000, noiseBandpass: 7000, noiseGain: 0.35 } },
  ],
  clap: [
    { id: "default", name: "Vintage", description: "Vintage lo-fi clap", params: { tailDecay: 0.35, noiseBandpass: 2000, saturation: 0.3 } },
    { id: "tape", name: "Tape Clap", description: "Tape-degraded clap sound", params: { burstCount: 3, tailDecay: 0.25, noiseBandpass: 2200, saturation: 0.5 } },
  ],
  "tom-high": [
    { id: "default", name: "Warm", description: "Warm lo-fi high tom", params: { decay: 0.3, saturation: 0.3 } },
    { id: "muted", name: "Muted", description: "Muted dampened tom", params: { freqStart: 180, freqEnd: 90, decay: 0.15, clickGain: 0.1 } },
  ],
  "tom-low": [
    { id: "default", name: "Warm", description: "Warm lo-fi low tom", params: { decay: 0.4, saturation: 0.3 } },
    { id: "deep", name: "Deep", description: "Deep muted low tom", params: { freqStart: 130, freqEnd: 45, decay: 0.35, clickGain: 0.1 } },
  ],
  ride: [
    { id: "default", name: "Jazz", description: "Jazz-influenced ride", params: {} },
    { id: "muted", name: "Muted", description: "Muted dampened ride", params: { shimmerGain: 0.05, filterFreq: 3500, filterQ: 0.3 } },
  ],
};

const POP_VARIATIONS: SoundVariationMap = {
  kick: [
    { id: "default", name: "Modern", description: "Modern clean pop kick", params: {} },
    { id: "radio", name: "Radio", description: "Radio-ready compressed kick", params: { freqStart: 160, freqEnd: 45, decay: 0.35, clickFreq: 1200, clickGain: 0.35, subGain: 0.75 } },
    { id: "clean", name: "Clean", description: "Ultra-clean minimal kick", params: { freqStart: 140, freqEnd: 42, decay: 0.3, clickGain: 0.2, subGain: 0.6 } },
    { id: "big", name: "Big", description: "Big stadium pop kick", params: { freqStart: 170, freqEnd: 38, decay: 0.5, gainStart: 1.1, subGain: 0.85, clickGain: 0.3 } },
  ],
  snare: [
    { id: "default", name: "Pop", description: "Standard pop snare", params: {} },
    { id: "big", name: "Big", description: "Big reverb-tail snare", params: { noiseDecay: 0.3, noiseGain: 0.9, toneFreqStart: 280, toneGain: 0.65 } },
    { id: "compressed", name: "Compressed", description: "Tightly compressed snare", params: { noiseDecay: 0.15, noiseGain: 0.85, noiseBandpass: 5500, toneGain: 0.55 } },
    { id: "snap", name: "Snap", description: "Finger snap-style snare", params: { noiseDecay: 0.08, noiseBandpass: 7000, noiseBandpassQ: 1.2, noiseGain: 0.5, toneGain: 0.3 } },
  ],
  "hihat-closed": [
    { id: "default", name: "Clean", description: "Clean pop hat", params: {} },
    { id: "tight", name: "Tight", description: "Very tight controlled hat", params: { noiseDecay: 0.025, noiseHighpass: 8000 } },
    { id: "shaker", name: "Shaker", description: "Shaker-like textured hat", params: { noiseDecay: 0.06, noiseHighpass: 5000, noiseBandpassQ: 0.8, noiseGain: 0.45 } },
  ],
  "hihat-open": [
    { id: "default", name: "Standard", description: "Standard pop open hat", params: {} },
    { id: "splash", name: "Splash", description: "Quick splash open hat", params: { noiseDecay: 0.2, noiseHighpass: 6500 } },
  ],
  clap: [
    { id: "default", name: "Pop", description: "Clean pop clap", params: {} },
    { id: "crowd", name: "Crowd", description: "Crowd clap texture", params: { burstCount: 6, burstSpacing: 0.01, tailDecay: 0.4, noiseBandpass: 2200 } },
    { id: "snap", name: "Finger Snap", description: "Clean finger snap", params: { burstCount: 2, burstSpacing: 0.003, tailDecay: 0.08, noiseBandpass: 4000, noiseBandpassQ: 1.2 } },
  ],
  "tom-high": [
    { id: "default", name: "Standard", description: "Standard high tom", params: {} },
    { id: "melodic", name: "Melodic", description: "Melodic tuned tom", params: { freqStart: 300, freqEnd: 180, decay: 0.2 } },
  ],
  "tom-low": [
    { id: "default", name: "Standard", description: "Standard low tom", params: {} },
    { id: "power", name: "Power", description: "Power floor tom", params: { freqStart: 130, freqEnd: 50, decay: 0.4 } },
  ],
  ride: [
    { id: "default", name: "Bright", description: "Bright pop ride", params: {} },
    { id: "crash", name: "Crash", description: "Crash cymbal feel", params: { shimmerGain: 0.18, filterFreq: 4000 } },
  ],
};

const ROCK_VARIATIONS: SoundVariationMap = {
  kick: [
    { id: "default", name: "Power", description: "Powerful rock kick with attack", params: { freqStart: 170, freqEnd: 45, clickFreq: 1200, clickGain: 0.4 } },
    { id: "live", name: "Live", description: "Live room-mic drum feel", params: { freqStart: 160, freqEnd: 50, decay: 0.4, subGain: 0.6, clickGain: 0.3 } },
    { id: "dry", name: "Dry", description: "Dry tight studio kick", params: { freqStart: 150, freqEnd: 45, decay: 0.25, subGain: 0.5, clickFreq: 1500, clickGain: 0.35, clickDecay: 0.006 } },
    { id: "double", name: "Double", description: "Heavy double-kick feel", params: { freqStart: 180, freqEnd: 40, freqDecay: 0.05, decay: 0.3, clickFreq: 1800, clickGain: 0.5, subGain: 0.7 } },
  ],
  snare: [
    { id: "default", name: "Rock", description: "Classic rock snare with crack", params: {} },
    { id: "backbeat", name: "Backbeat", description: "Heavy backbeat snare", params: { noiseDecay: 0.25, noiseGain: 0.9, toneFreqStart: 280, toneGain: 0.7 } },
    { id: "fat", name: "Fat", description: "Fat wide snare sound", params: { noiseDecay: 0.28, noiseGain: 0.95, noiseBandpass: 4000, toneFreqStart: 220, toneGain: 0.6 } },
    { id: "tight", name: "Tight", description: "Tight controlled snare", params: { noiseDecay: 0.12, noiseGain: 0.75, noiseBandpass: 6000, toneDecay: 0.05, toneGain: 0.5 } },
  ],
  "hihat-closed": [
    { id: "default", name: "Standard", description: "Standard rock closed hat", params: {} },
    { id: "tight", name: "Tight", description: "Tight staccato hat", params: { noiseDecay: 0.03, noiseHighpass: 8000 } },
    { id: "heavy", name: "Heavy", description: "Heavy-handed hat", params: { noiseDecay: 0.07, noiseGain: 0.6, noiseHighpass: 6000 } },
  ],
  "hihat-open": [
    { id: "default", name: "Standard", description: "Standard rock open hat", params: {} },
    { id: "crash", name: "Crash", description: "Crash-like open hat", params: { noiseDecay: 0.5, noiseHighpass: 5000, noiseGain: 0.55 } },
  ],
  clap: [
    { id: "default", name: "Standard", description: "Standard rock clap", params: {} },
    { id: "stadium", name: "Stadium", description: "Stadium crowd clap", params: { burstCount: 5, burstSpacing: 0.012, tailDecay: 0.5 } },
  ],
  "tom-high": [
    { id: "default", name: "Rock", description: "Standard rock high tom", params: {} },
    { id: "power", name: "Power", description: "Power tom with attack", params: { freqStart: 250, freqEnd: 120, clickFreq: 800, clickGain: 0.3 } },
  ],
  "tom-low": [
    { id: "default", name: "Rock", description: "Standard rock floor tom", params: {} },
    { id: "thunder", name: "Thunder", description: "Thunderous floor tom", params: { freqStart: 130, freqEnd: 45, decay: 0.5, clickGain: 0.25 } },
  ],
  ride: [
    { id: "default", name: "Crash/Ride", description: "Crash/ride cymbal", params: {} },
    { id: "bell", name: "Bell", description: "Ride bell accent", params: { metallicFreqs: [480, 680, 880, 1080, 1280], shimmerGain: 0.08, filterFreq: 6500 } },
  ],
};

const HIPHOP_VARIATIONS: SoundVariationMap = {
  kick: [
    { id: "default", name: "Boom", description: "Classic boom-bap kick", params: { freqStart: 140, freqEnd: 35, decay: 0.45, subGain: 0.8, clickGain: 0.25 } },
    { id: "trap", name: "Trap", description: "808-style trap kick", params: { freqStart: 120, freqEnd: 28, decay: 0.6, subFreqStart: 55, subFreqEnd: 20, subGain: 1.0, subDecay: 0.5, clickGain: 0.15 } },
    { id: "classic", name: "Classic", description: "90s hip-hop classic kick", params: { freqStart: 150, freqEnd: 40, decay: 0.4, subGain: 0.7, clickFreq: 900, clickGain: 0.3 } },
    { id: "vinyl", name: "Vinyl", description: "Vinyl-sampled style kick", params: { freqStart: 135, freqEnd: 38, decay: 0.42, saturation: 0.3, subGain: 0.65, clickGain: 0.2 } },
  ],
  snare: [
    { id: "default", name: "Boom Bap", description: "Classic boom-bap snare", params: { noiseDecay: 0.22, noiseBandpass: 4500, toneFreqStart: 260, toneGain: 0.6 } },
    { id: "crispy", name: "Crispy", description: "Crispy high-freq snare", params: { noiseDecay: 0.18, noiseBandpass: 6000, noiseBandpassQ: 1.0, noiseHighpass: 1800, noiseGain: 0.85, toneGain: 0.45 } },
    { id: "layered", name: "Layered", description: "Layered snare with body", params: { noiseDecay: 0.25, noiseGain: 0.9, noiseBandpass: 4000, toneFreqStart: 240, toneFreqEnd: 110, toneDecay: 0.12, toneGain: 0.7 } },
    { id: "rim", name: "Rim Shot", description: "Tight rim shot", params: { noiseDecay: 0.1, noiseBandpass: 7000, noiseGain: 0.5, toneFreqStart: 350, toneFreqEnd: 180, toneDecay: 0.06, toneGain: 0.8 } },
  ],
  "hihat-closed": [
    { id: "default", name: "Classic", description: "Classic hip-hop hat", params: {} },
    { id: "chopped", name: "Chopped", description: "Chopped sample-style hat", params: { noiseDecay: 0.03, noiseHighpass: 8000, noiseGain: 0.55 } },
    { id: "swing", name: "Swing", description: "Swinging textured hat", params: { noiseDecay: 0.055, noiseHighpass: 6000, noiseBandpassQ: 1.0 } },
  ],
  "hihat-open": [
    { id: "default", name: "Classic", description: "Standard hip-hop open hat", params: {} },
    { id: "loose", name: "Loose", description: "Loose jangly open hat", params: { noiseDecay: 0.45, noiseHighpass: 5500, noiseGain: 0.5 } },
  ],
  clap: [
    { id: "default", name: "Boom Bap", description: "Classic boom-bap clap", params: {} },
    { id: "layered", name: "Layered", description: "Multi-layered clap hit", params: { burstCount: 5, burstSpacing: 0.01, tailDecay: 0.35 } },
  ],
  "tom-high": [
    { id: "default", name: "Standard", description: "Standard high tom", params: {} },
    { id: "pitched", name: "Pitched", description: "Pitched percussion tom", params: { freqStart: 250, freqEnd: 150, decay: 0.18 } },
  ],
  "tom-low": [
    { id: "default", name: "Standard", description: "Standard low tom", params: {} },
    { id: "808", name: "808 Tom", description: "808-style low tom", params: { freqStart: 130, freqEnd: 40, decay: 0.5 } },
  ],
  ride: [
    { id: "default", name: "Standard", description: "Standard ride cymbal", params: {} },
    { id: "ping", name: "Ping", description: "Ping ride with definition", params: { metallicFreqs: [400, 600, 800, 1000, 1200], filterFreq: 5500 } },
  ],
};

const TRAP_VARIATIONS: SoundVariationMap = {
  kick: [
    { id: "default", name: "808 Sub", description: "Deep 808 sub-bass kick", params: { freqStart: 100, freqEnd: 25, decay: 0.7, subFreqStart: 50, subFreqEnd: 18, subGain: 1.0, subDecay: 0.6, clickGain: 0.2 } },
    { id: "hard", name: "Hard", description: "Hard-hitting punchy kick", params: { freqStart: 200, freqEnd: 35, freqDecay: 0.04, decay: 0.35, clickFreq: 2000, clickGain: 0.5, subGain: 0.8, saturation: 0.4 } },
    { id: "punchy", name: "Punchy", description: "Punchy mid-range kick", params: { freqStart: 180, freqEnd: 45, freqDecay: 0.05, decay: 0.3, clickFreq: 1500, clickGain: 0.4, subGain: 0.7 } },
    { id: "distorted", name: "Distorted", description: "Distorted 808 kick", params: { freqStart: 110, freqEnd: 25, decay: 0.65, gainStart: 1.3, subGain: 1.1, saturation: 0.7, clickGain: 0.25 } },
  ],
  snare: [
    { id: "default", name: "Trap", description: "Snappy trap snare", params: { noiseDecay: 0.15, noiseBandpass: 5500, noiseBandpassQ: 0.9, noiseGain: 0.85, toneFreqStart: 280, toneGain: 0.55 } },
    { id: "clap", name: "Clap", description: "Clap-snare hybrid", params: { noiseDecay: 0.2, noiseBandpass: 3000, noiseGain: 0.9, toneGain: 0.3 } },
    { id: "layered", name: "Layered Hit", description: "Multi-layered snare hit", params: { noiseDecay: 0.22, noiseGain: 0.95, noiseBandpass: 4500, toneFreqStart: 300, toneGain: 0.7 } },
    { id: "rimshot", name: "Rimshot", description: "Tight trap rimshot", params: { noiseDecay: 0.08, noiseBandpass: 8000, noiseBandpassQ: 1.5, noiseGain: 0.5, toneFreqStart: 400, toneGain: 0.8 } },
  ],
  "hihat-closed": [
    { id: "default", name: "Rapid", description: "Rapid 16th-note trap hat", params: { noiseDecay: 0.03, noiseHighpass: 8000, noiseBandpass: 11000 } },
    { id: "soft", name: "Soft", description: "Softer trap hat", params: { noiseDecay: 0.04, noiseHighpass: 7000, noiseGain: 0.35 } },
    { id: "metallic", name: "Metallic", description: "Metallic bright hat", params: { noiseDecay: 0.035, noiseHighpass: 9000, noiseBandpass: 13000, noiseBandpassQ: 1.5 } },
  ],
  "hihat-open": [
    { id: "default", name: "Trap", description: "Standard trap open hat", params: {} },
    { id: "long", name: "Long", description: "Long sustained open hat", params: { noiseDecay: 0.5, noiseHighpass: 6000, noiseGain: 0.5 } },
    { id: "sharp", name: "Sharp", description: "Sharp short open hat", params: { noiseDecay: 0.15, noiseHighpass: 9000, noiseBandpass: 12000 } },
  ],
  clap: [
    { id: "default", name: "Trap", description: "Standard trap clap", params: {} },
    { id: "stack", name: "Stack", description: "Stacked multi-clap", params: { burstCount: 6, burstSpacing: 0.005, tailDecay: 0.2, noiseBandpass: 3500 } },
    { id: "snap", name: "Snap", description: "Finger snap", params: { burstCount: 2, burstSpacing: 0.003, tailDecay: 0.06, noiseBandpass: 5000, noiseBandpassQ: 1.5 } },
  ],
  "tom-high": [
    { id: "default", name: "808 Tom", description: "808-style high tom", params: { freqStart: 250, freqEnd: 130, decay: 0.2 } },
    { id: "pitched", name: "Pitched", description: "Pitched melodic tom", params: { freqStart: 320, freqEnd: 180, decay: 0.25 } },
  ],
  "tom-low": [
    { id: "default", name: "808 Tom", description: "808-style low tom", params: { freqStart: 130, freqEnd: 50, decay: 0.35 } },
    { id: "sub", name: "Sub Tom", description: "Sub-bass tom hit", params: { freqStart: 100, freqEnd: 35, decay: 0.5, clickGain: 0.1 } },
  ],
  ride: [
    { id: "default", name: "Dark", description: "Dark trap ride", params: { filterFreq: 4000 } },
    { id: "bell", name: "Bell", description: "Bell ride accent", params: { metallicFreqs: [500, 700, 900, 1100, 1300], shimmerGain: 0.06, filterFreq: 5500 } },
  ],
};

// ============================================================
// MASTER VARIATION MAP
// ============================================================

export const GENRE_SOUND_VARIATIONS: Record<Genre, SoundVariationMap> = {
  house: HOUSE_VARIATIONS,
  electronic: ELECTRONIC_VARIATIONS,
  "lo-fi": LOFI_VARIATIONS,
  pop: POP_VARIATIONS,
  rock: ROCK_VARIATIONS,
  "hip-hop": HIPHOP_VARIATIONS,
  trap: TRAP_VARIATIONS,
};

/**
 * Get available sound variations for an instrument in a given genre
 */
export function getVariationsForInstrument(genre: Genre, instrumentId: string): DrumSoundVariation[] {
  return GENRE_SOUND_VARIATIONS[genre]?.[instrumentId] ?? [];
}

/**
 * Get the synthesis params for a specific variation
 */
export function getVariationParams(genre: Genre, instrumentId: string, variationId: string): SynthParams {
  const variations = getVariationsForInstrument(genre, instrumentId);
  const variation = variations.find((v) => v.id === variationId);
  return variation?.params ?? {};
}

/**
 * When switching genres, try to preserve variation selections where possible.
 * If a variation ID doesn't exist in the new genre, reset to default.
 */
export function migrateVariations(
  currentSelections: SelectedVariations,
  newGenre: Genre
): SelectedVariations {
  const migrated: SelectedVariations = {};
  for (const [instrumentId, variationId] of Object.entries(currentSelections)) {
    const newVariations = getVariationsForInstrument(newGenre, instrumentId);
    const exists = newVariations.some((v) => v.id === variationId);
    migrated[instrumentId] = exists ? variationId : DEFAULT_VARIATION_ID;
  }
  return migrated;
}
