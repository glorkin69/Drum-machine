/**
 * Virtual Band Engine for BeatForge 808
 *
 * AI-powered virtual musicians that generate complementary musical parts
 * (bass, melody, harmony, percussion) based on the current drum pattern.
 * Uses Web Audio API for real-time synthesis.
 */

import type { DrumPattern, PatternLength } from "./drum-patterns";
import type {
  VirtualBandMember,
  VirtualInstrument,
  MusicalKey,
  MusicalScale,
  AIIntelligenceLevel,
} from "./collab-types";

// ============================================================================
// MUSICAL THEORY CONSTANTS
// ============================================================================

/** MIDI note numbers for each key (octave 0) */
const KEY_BASE_NOTES: Record<MusicalKey, number> = {
  C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5,
  "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11,
};

/** Scale intervals (semitones from root) */
const SCALE_INTERVALS: Record<MusicalScale, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

/** Get MIDI notes for a given key, scale, and octave */
function getScaleNotes(key: MusicalKey, scale: MusicalScale, octave: number): number[] {
  const base = KEY_BASE_NOTES[key] + octave * 12;
  const intervals = SCALE_INTERVALS[scale];
  // Generate 2 octaves of scale notes for melodic range
  const notes: number[] = [];
  for (let oct = 0; oct < 2; oct++) {
    for (const interval of intervals) {
      notes.push(base + interval + oct * 12);
    }
  }
  return notes;
}

/** Convert MIDI note number to frequency (Hz) */
export function midiToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

// ============================================================================
// PATTERN ANALYSIS
// ============================================================================

/** Analyze drum pattern to extract rhythmic features */
function analyzePattern(pattern: DrumPattern, patternLength: PatternLength): PatternAnalysis {
  const kickHits = getActiveSteps(pattern["kick"], patternLength);
  const snareHits = getActiveSteps(pattern["snare"], patternLength);
  const hihatHits = getActiveSteps(pattern["hihat-closed"], patternLength);
  const allHits = new Set([...kickHits, ...snareHits, ...hihatHits]);

  // Detect beat positions (quarter notes)
  const beatPositions = [];
  for (let i = 0; i < patternLength; i += 4) {
    beatPositions.push(i);
  }

  // Calculate rhythmic density (0-1)
  const density = allHits.size / patternLength;

  // Detect if pattern is syncopated (hits on offbeats)
  const offbeatHits = [...allHits].filter((s) => s % 4 !== 0);
  const syncopation = offbeatHits.length / Math.max(allHits.size, 1);

  // Detect accent pattern from kick
  const accentSteps = kickHits;

  return {
    kickHits,
    snareHits,
    hihatHits,
    allHits: [...allHits],
    beatPositions,
    density,
    syncopation,
    accentSteps,
    patternLength,
  };
}

interface PatternAnalysis {
  kickHits: number[];
  snareHits: number[];
  hihatHits: number[];
  allHits: number[];
  beatPositions: number[];
  density: number;
  syncopation: number;
  accentSteps: number[];
  patternLength: PatternLength;
}

function getActiveSteps(steps: boolean[] | undefined, length: PatternLength): number[] {
  if (!steps) return [];
  const result: number[] = [];
  for (let i = 0; i < Math.min(steps.length, length); i++) {
    if (steps[i]) result.push(i);
  }
  return result;
}

// ============================================================================
// PATTERN GENERATION ALGORITHMS
// ============================================================================

/** Generate bass pattern based on drum pattern analysis */
function generateBassPattern(
  analysis: PatternAnalysis,
  member: VirtualBandMember,
  intelligence: AIIntelligenceLevel
): { notes: (number | null)[]; velocities: number[] } {
  const scaleNotes = getScaleNotes(member.key, member.scale, member.octave);
  const { patternLength } = analysis;
  const notes: (number | null)[] = new Array(patternLength).fill(null);
  const velocities: number[] = new Array(patternLength).fill(80);
  const root = scaleNotes[0];
  const fifth = scaleNotes[Math.min(4, scaleNotes.length - 1)];

  if (intelligence === "basic") {
    // Basic: play root on kick hits
    for (const step of analysis.kickHits) {
      notes[step] = root;
      velocities[step] = 90 + Math.floor(Math.random() * 20);
    }
  } else if (intelligence === "intermediate") {
    // Intermediate: root on kick, fifth on upbeats, passing tones
    for (const step of analysis.kickHits) {
      notes[step] = root;
      velocities[step] = 95 + Math.floor(Math.random() * 15);
    }
    // Add fifth on snare hits
    for (const step of analysis.snareHits) {
      if (!notes[step]) {
        notes[step] = fifth;
        velocities[step] = 75 + Math.floor(Math.random() * 20);
      }
    }
    // Fill gaps with walking bass if density is high enough
    if (analysis.density > 0.3) {
      for (let i = 0; i < patternLength; i++) {
        if (!notes[i] && Math.random() < member.followIntensity * 0.3) {
          const noteIdx = Math.floor(Math.random() * Math.min(5, scaleNotes.length));
          notes[i] = scaleNotes[noteIdx];
          velocities[i] = 60 + Math.floor(Math.random() * 20);
        }
      }
    }
  } else {
    // Advanced: walking bass with chromatic approaches
    let currentNoteIdx = 0;
    for (let i = 0; i < patternLength; i++) {
      const isKick = analysis.kickHits.includes(i);
      const isSnare = analysis.snareHits.includes(i);
      const isBeat = i % 4 === 0;

      if (isKick) {
        notes[i] = root;
        velocities[i] = 100;
        currentNoteIdx = 0;
      } else if (isSnare) {
        notes[i] = scaleNotes[Math.min(3, scaleNotes.length - 1)];
        velocities[i] = 85;
      } else if (isBeat && Math.random() < member.followIntensity) {
        currentNoteIdx = (currentNoteIdx + 1) % Math.min(7, scaleNotes.length);
        notes[i] = scaleNotes[currentNoteIdx];
        velocities[i] = 70 + Math.floor(Math.random() * 20);
      } else if (Math.random() < member.followIntensity * analysis.density * 0.5) {
        // Chromatic approach note
        const nextBeatNote = notes[Math.min(i + 1, patternLength - 1)];
        if (nextBeatNote) {
          notes[i] = nextBeatNote - 1; // half step below
          velocities[i] = 55 + Math.floor(Math.random() * 20);
        } else {
          currentNoteIdx = (currentNoteIdx + 1) % Math.min(7, scaleNotes.length);
          notes[i] = scaleNotes[currentNoteIdx];
          velocities[i] = 60;
        }
      }
    }
  }

  return { notes, velocities };
}

/** Generate melody pattern based on drum pattern analysis */
function generateMelodyPattern(
  analysis: PatternAnalysis,
  member: VirtualBandMember,
  intelligence: AIIntelligenceLevel
): { notes: (number | null)[]; velocities: number[] } {
  const scaleNotes = getScaleNotes(member.key, member.scale, member.octave);
  const { patternLength } = analysis;
  const notes: (number | null)[] = new Array(patternLength).fill(null);
  const velocities: number[] = new Array(patternLength).fill(70);

  if (intelligence === "basic") {
    // Simple melody on beat positions
    for (const beat of analysis.beatPositions) {
      const noteIdx = Math.floor(Math.random() * scaleNotes.length);
      notes[beat] = scaleNotes[noteIdx];
      velocities[beat] = 75 + Math.floor(Math.random() * 25);
    }
  } else if (intelligence === "intermediate") {
    // Melodic contour with direction changes
    let direction = 1; // 1 = up, -1 = down
    let currentIdx = Math.floor(scaleNotes.length / 2);

    for (let i = 0; i < patternLength; i++) {
      const shouldPlay =
        analysis.beatPositions.includes(i) ||
        (analysis.hihatHits.includes(i) && Math.random() < member.followIntensity * 0.4);

      if (shouldPlay) {
        notes[i] = scaleNotes[currentIdx];
        velocities[i] = 70 + Math.floor(Math.random() * 30);

        // Move through scale
        currentIdx += direction;
        if (currentIdx >= scaleNotes.length - 1) direction = -1;
        if (currentIdx <= 0) direction = 1;

        // Occasional leap
        if (Math.random() < 0.2) {
          currentIdx += direction * 2;
          currentIdx = Math.max(0, Math.min(scaleNotes.length - 1, currentIdx));
        }
      }
    }
  } else {
    // Advanced: phrase-based melody with motifs
    const phraseLength = 4;
    let currentIdx = Math.floor(scaleNotes.length / 2);

    // Generate a motif (short pattern that repeats/varies)
    const motif: number[] = [];
    for (let i = 0; i < phraseLength; i++) {
      const step = Math.random() < 0.6 ? 1 : Math.random() < 0.5 ? 2 : -1;
      currentIdx = Math.max(0, Math.min(scaleNotes.length - 1, currentIdx + step));
      motif.push(currentIdx);
    }

    // Apply motif with variations across the pattern
    for (let phrase = 0; phrase < patternLength / phraseLength; phrase++) {
      const offset = phrase * phraseLength;
      const variation = phrase % 2 === 0 ? 0 : (Math.random() < 0.5 ? 1 : -1);

      for (let i = 0; i < phraseLength && offset + i < patternLength; i++) {
        const step = offset + i;
        const shouldPlay = Math.random() < member.followIntensity * 0.7;

        if (shouldPlay) {
          let noteIdx = motif[i] + variation;
          noteIdx = Math.max(0, Math.min(scaleNotes.length - 1, noteIdx));
          notes[step] = scaleNotes[noteIdx];

          // Accent on beat positions
          const isAccent = analysis.kickHits.includes(step) || analysis.snareHits.includes(step);
          velocities[step] = isAccent ? 90 + Math.floor(Math.random() * 15) : 65 + Math.floor(Math.random() * 20);
        }
      }
    }
  }

  return { notes, velocities };
}

/** Generate harmony (chord) pattern based on drum pattern analysis */
function generateHarmonyPattern(
  analysis: PatternAnalysis,
  member: VirtualBandMember,
  intelligence: AIIntelligenceLevel
): { notes: (number | null)[]; velocities: number[] } {
  const scaleNotes = getScaleNotes(member.key, member.scale, member.octave);
  const { patternLength } = analysis;
  const notes: (number | null)[] = new Array(patternLength).fill(null);
  const velocities: number[] = new Array(patternLength).fill(60);

  // Chord tones (root, third, fifth of current scale)
  const chordRoot = scaleNotes[0];
  const chordThird = scaleNotes[Math.min(2, scaleNotes.length - 1)];
  const chordFifth = scaleNotes[Math.min(4, scaleNotes.length - 1)];

  if (intelligence === "basic") {
    // Play chord stabs on beat 1 of each bar
    for (let i = 0; i < patternLength; i += patternLength >= 16 ? 8 : 4) {
      notes[i] = chordRoot;
      velocities[i] = 65;
    }
  } else if (intelligence === "intermediate") {
    // Rhythmic chord stabs following snare/clap hits
    for (let i = 0; i < patternLength; i++) {
      const isAccent = analysis.snareHits.includes(i) || analysis.kickHits.includes(i);
      if (isAccent && Math.random() < member.followIntensity) {
        // Alternate chord tones
        const chordTones = [chordRoot, chordThird, chordFifth];
        notes[i] = chordTones[Math.floor(Math.random() * chordTones.length)];
        velocities[i] = 55 + Math.floor(Math.random() * 25);
      }
    }
  } else {
    // Advanced: chord progressions with voice leading
    const chordProgression = [
      [chordRoot, chordThird, chordFifth],
      [scaleNotes[Math.min(3, scaleNotes.length - 1)], scaleNotes[Math.min(5, scaleNotes.length - 1)], scaleNotes[Math.min(7, scaleNotes.length - 1)]],
      [scaleNotes[Math.min(4, scaleNotes.length - 1)], scaleNotes[Math.min(6, scaleNotes.length - 1)], scaleNotes[Math.min(8, scaleNotes.length - 1)]],
      [chordRoot, chordThird, chordFifth],
    ];

    const chordDuration = Math.floor(patternLength / chordProgression.length);
    for (let c = 0; c < chordProgression.length; c++) {
      const startStep = c * chordDuration;
      const chord = chordProgression[c];

      for (let i = startStep; i < startStep + chordDuration && i < patternLength; i++) {
        const shouldPlay = i === startStep || (Math.random() < member.followIntensity * 0.3 && analysis.allHits.includes(i));
        if (shouldPlay) {
          // Pick a chord tone
          notes[i] = chord[Math.floor(Math.random() * chord.length)];
          velocities[i] = i === startStep ? 70 : 50 + Math.floor(Math.random() * 20);
        }
      }
    }
  }

  return { notes, velocities };
}

/** Generate auxiliary percussion pattern */
function generatePercussionPattern(
  analysis: PatternAnalysis,
  member: VirtualBandMember,
  intelligence: AIIntelligenceLevel
): { notes: (number | null)[]; velocities: number[] } {
  const { patternLength } = analysis;
  const notes: (number | null)[] = new Array(patternLength).fill(null);
  const velocities: number[] = new Array(patternLength).fill(70);

  // Percussion uses fixed MIDI notes for different sounds
  const CONGA_HIGH = 62;
  const CONGA_LOW = 60;
  const SHAKER = 70;
  const COWBELL = 56;
  const TAMBOURINE = 54;

  if (intelligence === "basic") {
    // Simple shaker on eighth notes
    for (let i = 0; i < patternLength; i += 2) {
      notes[i] = SHAKER;
      velocities[i] = 50 + Math.floor(Math.random() * 30);
    }
  } else if (intelligence === "intermediate") {
    // Conga pattern complementing kicks/snares
    for (let i = 0; i < patternLength; i++) {
      if (analysis.kickHits.includes(i)) {
        notes[i] = CONGA_LOW;
        velocities[i] = 80;
      } else if (!analysis.allHits.includes(i) && Math.random() < member.followIntensity * 0.5) {
        notes[i] = CONGA_HIGH;
        velocities[i] = 55 + Math.floor(Math.random() * 25);
      }
    }
    // Add cowbell on specific beats
    for (let i = 0; i < patternLength; i += 4) {
      if (!notes[i]) {
        notes[i] = COWBELL;
        velocities[i] = 45;
      }
    }
  } else {
    // Advanced: layered percussion with multiple sounds
    for (let i = 0; i < patternLength; i++) {
      const rand = Math.random();
      if (analysis.kickHits.includes(i) && rand < member.followIntensity) {
        notes[i] = CONGA_LOW;
        velocities[i] = 80 + Math.floor(Math.random() * 15);
      } else if (analysis.snareHits.includes(i) && rand < member.followIntensity * 0.7) {
        notes[i] = TAMBOURINE;
        velocities[i] = 60 + Math.floor(Math.random() * 20);
      } else if (i % 2 === 0 && rand < member.followIntensity * 0.4) {
        notes[i] = Math.random() < 0.5 ? SHAKER : CONGA_HIGH;
        velocities[i] = 40 + Math.floor(Math.random() * 30);
      } else if (i % 4 === 0 && rand < 0.3) {
        notes[i] = COWBELL;
        velocities[i] = 50;
      }
    }
  }

  return { notes, velocities };
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Generate a pattern for a virtual band member based on the current drum pattern.
 * Returns an array of MIDI note numbers (or null for rests) and velocities.
 */
export function generateVirtualBandPattern(
  drumPattern: DrumPattern,
  patternLength: PatternLength,
  member: VirtualBandMember
): { notes: (number | null)[]; velocities: number[] } {
  const analysis = analyzePattern(drumPattern, patternLength);

  switch (member.instrument) {
    case "bass":
      return generateBassPattern(analysis, member, member.intelligence);
    case "melody":
      return generateMelodyPattern(analysis, member, member.intelligence);
    case "harmony":
      return generateHarmonyPattern(analysis, member, member.intelligence);
    case "percussion":
      return generatePercussionPattern(analysis, member, member.intelligence);
    default:
      return {
        notes: new Array(patternLength).fill(null),
        velocities: new Array(patternLength).fill(0),
      };
  }
}

// ============================================================================
// VIRTUAL BAND AUDIO SYNTHESIS
// ============================================================================

/**
 * Virtual Band Audio Synthesizer
 *
 * Synthesizes bass, melody, harmony, and percussion sounds
 * using Web Audio API oscillators and filters.
 */
export class VirtualBandAudio {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private instrumentGains: Map<string, GainNode> = new Map();
  private noiseBuffer: AudioBuffer | null = null;

  init(audioContext: AudioContext, destination: AudioNode): void {
    this.audioContext = audioContext;
    this.masterGain = audioContext.createGain();
    this.masterGain.gain.setValueAtTime(0.6, audioContext.currentTime);
    this.masterGain.connect(destination);
    this.createNoiseBuffer();
  }

  private createNoiseBuffer(): void {
    if (!this.audioContext) return;
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * 2;
    this.noiseBuffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  setVolume(instrumentId: string, volume: number): void {
    const gain = this.instrumentGains.get(instrumentId);
    if (gain && this.audioContext) {
      gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    }
  }

  private getOrCreateInstrumentGain(instrumentId: string, volume: number): GainNode {
    const ctx = this.audioContext!;
    let gain = this.instrumentGains.get(instrumentId);
    if (!gain) {
      gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.connect(this.masterGain!);
      this.instrumentGains.set(instrumentId, gain);
    }
    return gain;
  }

  /**
   * Schedule a note for a virtual instrument at a specific time.
   */
  scheduleNote(
    instrument: VirtualInstrument,
    memberId: string,
    midiNote: number,
    velocity: number,
    time: number,
    volume: number
  ): void {
    if (!this.audioContext || !this.masterGain) return;
    const ctx = this.audioContext;
    const instGain = this.getOrCreateInstrumentGain(memberId, volume);
    const velGain = Math.max(0, Math.min(1, velocity / 127));
    const freq = midiToFrequency(midiNote);

    switch (instrument) {
      case "bass":
        this.playBassNote(ctx, instGain, freq, velGain, time);
        break;
      case "melody":
        this.playMelodyNote(ctx, instGain, freq, velGain, time);
        break;
      case "harmony":
        this.playHarmonyNote(ctx, instGain, freq, velGain, time);
        break;
      case "percussion":
        this.playPercussionNote(ctx, instGain, midiNote, velGain, time);
        break;
    }
  }

  private playBassNote(ctx: AudioContext, output: GainNode, freq: number, vel: number, time: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, time);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq * 3, time);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, time + 0.1);
    filter.Q.setValueAtTime(2, time);

    gain.gain.setValueAtTime(vel * 0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

    osc.connect(filter).connect(gain).connect(output);
    osc.start(time);
    osc.stop(time + 0.35);

    setTimeout(() => {
      try { osc.disconnect(); gain.disconnect(); filter.disconnect(); } catch {}
    }, (time - ctx.currentTime) * 1000 + 500);
  }

  private playMelodyNote(ctx: AudioContext, output: GainNode, freq: number, vel: number, time: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(vel * 0.4, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain).connect(output);
    osc.start(time);
    osc.stop(time + 0.3);

    setTimeout(() => {
      try { osc.disconnect(); gain.disconnect(); } catch {}
    }, (time - ctx.currentTime) * 1000 + 400);
  }

  private playHarmonyNote(ctx: AudioContext, output: GainNode, freq: number, vel: number, time: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    // Pad-like envelope
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(vel * 0.25, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

    osc.connect(gain).connect(output);
    osc.start(time);
    osc.stop(time + 0.45);

    setTimeout(() => {
      try { osc.disconnect(); gain.disconnect(); } catch {}
    }, (time - ctx.currentTime) * 1000 + 550);
  }

  private playPercussionNote(ctx: AudioContext, output: GainNode, midiNote: number, vel: number, time: number): void {
    if (!this.noiseBuffer) return;

    // Different percussion based on MIDI note
    if (midiNote >= 68) {
      // Shaker-like: short noise burst
      const source = ctx.createBufferSource();
      source.buffer = this.noiseBuffer;
      const gain = ctx.createGain();
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.setValueAtTime(8000, time);

      gain.gain.setValueAtTime(vel * 0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      source.connect(hp).connect(gain).connect(output);
      source.start(time);
      source.stop(time + 0.05);

      setTimeout(() => {
        try { source.disconnect(); gain.disconnect(); hp.disconnect(); } catch {}
      }, (time - ctx.currentTime) * 1000 + 100);
    } else if (midiNote >= 58) {
      // Conga-like: pitched tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = midiToFrequency(midiNote);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq * 1.5, time);
      osc.frequency.exponentialRampToValueAtTime(freq, time + 0.02);

      gain.gain.setValueAtTime(vel * 0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      osc.connect(gain).connect(output);
      osc.start(time);
      osc.stop(time + 0.2);

      setTimeout(() => {
        try { osc.disconnect(); gain.disconnect(); } catch {}
      }, (time - ctx.currentTime) * 1000 + 250);
    } else {
      // Cowbell/tambourine: metallic
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(800, time);
      bp.Q.setValueAtTime(3, time);

      osc1.type = "square";
      osc1.frequency.setValueAtTime(540, time);
      osc2.type = "square";
      osc2.frequency.setValueAtTime(800, time);

      gain.gain.setValueAtTime(vel * 0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      osc1.connect(bp);
      osc2.connect(bp);
      bp.connect(gain).connect(output);

      osc1.start(time);
      osc1.stop(time + 0.12);
      osc2.start(time);
      osc2.stop(time + 0.12);

      setTimeout(() => {
        try {
          osc1.disconnect(); osc2.disconnect();
          gain.disconnect(); bp.disconnect();
        } catch {}
      }, (time - ctx.currentTime) * 1000 + 200);
    }
  }

  dispose(): void {
    this.instrumentGains.forEach((gain) => {
      try { gain.disconnect(); } catch {}
    });
    this.instrumentGains.clear();
    if (this.masterGain) {
      try { this.masterGain.disconnect(); } catch {}
      this.masterGain = null;
    }
    this.audioContext = null;
    this.noiseBuffer = null;
  }
}

/** Singleton instance */
export const virtualBandAudio = new VirtualBandAudio();
