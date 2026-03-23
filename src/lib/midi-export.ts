/**
 * MIDI Export Utility for BeatForge 808
 *
 * Converts drum patterns to Standard MIDI Files using General MIDI drum mapping.
 * Uses MIDI Channel 10 (index 9) which is the standard percussion channel.
 */

import Midi from "jsmidgen";
import type {
  DrumPattern,
  VelocityMap,
  ProbabilityMap,
  PatternLength,
  Genre,
  SongPart,
  Emotion,
} from "./drum-patterns";
import { INSTRUMENTS } from "./drum-patterns";
import type { SongBlock } from "./song-types";

// General MIDI Drum Map (Channel 10)
// Maps our instrument IDs to standard GM drum note numbers
const MIDI_DRUM_MAP: Record<string, number> = {
  kick: 36, // Bass Drum 1 (C1)
  snare: 38, // Acoustic Snare (D1)
  "hihat-closed": 42, // Closed Hi-Hat (F#1)
  "hihat-open": 46, // Open Hi-Hat (A#1)
  clap: 39, // Hand Clap (D#1)
  "tom-high": 48, // Hi-Mid Tom (C2)
  "tom-low": 45, // Low Tom (A1)
  ride: 51, // Ride Cymbal 1 (D#2)
};

// Ticks per beat in jsmidgen (128 is the hardcoded default)
const TICKS_PER_BEAT = 128;
// 16th note = 1/4 of a beat
const TICKS_PER_STEP = TICKS_PER_BEAT / 4; // 32 ticks
// Note duration for drum hits (short, percussive)
const DRUM_NOTE_DURATION = TICKS_PER_STEP / 2; // 16 ticks

export interface MidiExportOptions {
  pattern: DrumPattern;
  velocity: VelocityMap;
  probability: ProbabilityMap;
  patternLength: PatternLength;
  bpm: number;
  genre: Genre;
  songPart: SongPart;
  emotion: Emotion | null;
  /** If true, export each instrument on a separate MIDI track */
  multiTrack?: boolean;
}

/**
 * Generate a descriptive filename for the MIDI export
 */
export function generateMidiFilename(options: MidiExportOptions): string {
  const genreLabel = options.genre.charAt(0).toUpperCase() + options.genre.slice(1);
  const partLabel = options.songPart.charAt(0).toUpperCase() + options.songPart.slice(1);
  const emotionLabel = options.emotion
    ? `_${options.emotion.charAt(0).toUpperCase() + options.emotion.slice(1)}`
    : "";

  return `BeatForge_${genreLabel}_${partLabel}${emotionLabel}_${options.bpm}BPM.mid`;
}

/**
 * Generate a single-track MIDI file with all drums on one track (Channel 10)
 */
function generateSingleTrackMidi(options: MidiExportOptions): Midi.File {
  const { pattern, velocity, patternLength, bpm } = options;
  const file = new Midi.File();
  const track = file.addTrack();

  // Set tempo
  track.setTempo(bpm);

  // For each step, collect all instruments that play and add them
  for (let step = 0; step < patternLength; step++) {
    const activeNotes: Array<{ pitch: number; vel: number }> = [];

    for (const inst of INSTRUMENTS) {
      const instPattern = pattern[inst.id];
      if (instPattern && instPattern[step]) {
        const midiNote = MIDI_DRUM_MAP[inst.id];
        if (midiNote !== undefined) {
          const vel = velocity[inst.id]?.[step] ?? 100;
          activeNotes.push({ pitch: midiNote, vel });
        }
      }
    }

    if (activeNotes.length === 0) {
      // No notes on this step - we still need to advance time
      // We'll handle timing by using the time parameter on the next note
      continue;
    }

    // Calculate the time offset from the last event
    // For the first note on this step, set time = gap from last event
    // For subsequent notes on same step, set time = 0 (simultaneous)
    // We need to track accumulated rest time
    // jsmidgen's time parameter is delay BEFORE the note

    // Simple approach: add all notes for each step with proper timing
    // Use addNote which handles noteOn + noteOff
    for (let i = 0; i < activeNotes.length; i++) {
      const note = activeNotes[i];
      // Channel 9 = MIDI Channel 10 (0-indexed)
      // time parameter: delay before this event
      const delay = i === 0 ? calculateDelay(step, pattern, velocity, patternLength) : 0;
      track.addNote(9, note.pitch, DRUM_NOTE_DURATION, delay, note.vel);
    }
  }

  return file;
}

/**
 * Calculate the delay (in ticks) from the previous event to the given step
 */
function calculateDelay(
  currentStep: number,
  pattern: DrumPattern,
  velocity: VelocityMap,
  patternLength: PatternLength
): number {
  // Find the previous step that had any notes
  let prevStepWithNotes = -1;
  for (let s = currentStep - 1; s >= 0; s--) {
    for (const inst of INSTRUMENTS) {
      if (pattern[inst.id]?.[s]) {
        prevStepWithNotes = s;
        break;
      }
    }
    if (prevStepWithNotes >= 0) break;
  }

  if (prevStepWithNotes < 0) {
    // No previous notes - delay from start
    return currentStep * TICKS_PER_STEP;
  }

  return (currentStep - prevStepWithNotes) * TICKS_PER_STEP;
}

/**
 * Generate a multi-track MIDI file with each instrument on its own track
 */
function generateMultiTrackMidi(options: MidiExportOptions): Midi.File {
  const { pattern, velocity, patternLength, bpm } = options;
  const file = new Midi.File();

  // Tempo track
  const tempoTrack = file.addTrack();
  tempoTrack.setTempo(bpm);

  for (const inst of INSTRUMENTS) {
    const instPattern = pattern[inst.id];
    if (!instPattern) continue;

    // Check if this instrument has any active steps
    const hasNotes = instPattern.some((step: boolean) => step);
    if (!hasNotes) continue;

    const track = file.addTrack();
    const midiNote = MIDI_DRUM_MAP[inst.id];
    if (midiNote === undefined) continue;

    let lastNoteStep = -1;

    for (let step = 0; step < patternLength; step++) {
      if (instPattern[step]) {
        const vel = velocity[inst.id]?.[step] ?? 100;
        const delay =
          lastNoteStep < 0
            ? step * TICKS_PER_STEP
            : (step - lastNoteStep) * TICKS_PER_STEP;

        // Channel 9 = MIDI Channel 10 (percussion)
        track.addNote(9, midiNote, DRUM_NOTE_DURATION, delay, vel);
        lastNoteStep = step;
      }
    }
  }

  return file;
}

/**
 * Convert a jsmidgen File to a Uint8Array for download
 */
function midiFileToUint8Array(file: Midi.File): Uint8Array {
  const bytes = file.toBytes();
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    buffer[i] = bytes.charCodeAt(i);
  }
  return buffer;
}

/**
 * Export the current pattern as a MIDI file and trigger download
 */
export function exportPatternAsMidi(options: MidiExportOptions): void {
  const file = options.multiTrack
    ? generateMultiTrackMidi(options)
    : generateSingleTrackMidi(options);

  const uint8Array = midiFileToUint8Array(file);
  const blob = new Blob([uint8Array.buffer as ArrayBuffer], { type: "audio/midi" });

  const filename = generateMidiFilename(options);

  // Create download link and trigger
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Export a full song (multiple pattern blocks) as a single MIDI file.
 * Each block is written sequentially, with BPM changes inserted via tempo events.
 */
export function exportSongAsMidi(songName: string, blocks: SongBlock[]): void {
  if (blocks.length === 0) return;

  const file = new Midi.File();
  const track = file.addTrack();

  // Set initial tempo from first block
  track.setTempo(blocks[0].bpm);

  let currentBpm = blocks[0].bpm;

  for (const block of blocks) {
    for (let rep = 0; rep < block.repeats; rep++) {
      // Insert tempo change if BPM differs
      if (block.bpm !== currentBpm) {
        track.setTempo(block.bpm);
        currentBpm = block.bpm;
      }

      // Write all steps for this block repetition
      for (let step = 0; step < block.patternLength; step++) {
        const activeNotes: Array<{ pitch: number; vel: number }> = [];

        for (const inst of INSTRUMENTS) {
          const instPattern = block.pattern[inst.id];
          if (instPattern && instPattern[step]) {
            const midiNote = MIDI_DRUM_MAP[inst.id];
            if (midiNote !== undefined) {
              const vel = block.velocity[inst.id]?.[step] ?? 100;
              activeNotes.push({ pitch: midiNote, vel });
            }
          }
        }

        if (activeNotes.length === 0) {
          continue;
        }

        for (let i = 0; i < activeNotes.length; i++) {
          const note = activeNotes[i];
          const delay =
            i === 0
              ? calculateDelay(step, block.pattern, block.velocity, block.patternLength)
              : 0;
          track.addNote(9, note.pitch, DRUM_NOTE_DURATION, delay, note.vel);
        }
      }
    }
  }

  const uint8Array = midiFileToUint8Array(file);
  const blob = new Blob([uint8Array.buffer as ArrayBuffer], { type: "audio/midi" });

  const safeName = songName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `BeatForge_Song_${safeName}.mid`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
