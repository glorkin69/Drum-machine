// Drum pattern data for the drum machine app
// Each pattern is 16 steps representing sixteenth notes in one bar of 4/4 time

export const INSTRUMENTS = [
  { id: 'kick', name: 'Kick', key: 'K' },
  { id: 'snare', name: 'Snare', key: 'S' },
  { id: 'hihat-closed', name: 'Hi-Hat (C)', key: 'H' },
  { id: 'hihat-open', name: 'Hi-Hat (O)', key: 'O' },
  { id: 'clap', name: 'Clap', key: 'C' },
  { id: 'tom-high', name: 'Tom Hi', key: 'T' },
  { id: 'tom-low', name: 'Tom Lo', key: 'L' },
  { id: 'ride', name: 'Ride', key: 'R' },
] as const;

export type InstrumentId = (typeof INSTRUMENTS)[number]['id'];

// --- Genres ---

export const GENRES = {
  house: { id: 'house', name: 'House', defaultBpm: 124, color: '#9b59b6' },
  electronic: { id: 'electronic', name: 'Electronic', defaultBpm: 130, color: '#3498db' },
  'lo-fi': { id: 'lo-fi', name: 'Lo-Fi', defaultBpm: 75, color: '#95a5a6' },
  pop: { id: 'pop', name: 'Pop', defaultBpm: 120, color: '#e91e63' },
  rock: { id: 'rock', name: 'Rock', defaultBpm: 120, color: '#e74c3c' },
  'hip-hop': { id: 'hip-hop', name: 'Hip-Hop', defaultBpm: 95, color: '#8E44AD' },
  trap: { id: 'trap', name: 'Trap', defaultBpm: 145, color: '#F39C12' },
} as const;

export type Genre = keyof typeof GENRES;

// --- Song Parts ---

export const SONG_PARTS = {
  intro: { id: 'intro', name: 'Intro', description: 'Opening section, minimal & DJ-friendly' },
  verse: { id: 'verse', name: 'Verse', description: 'Main groove, moderate energy' },
  chorus: { id: 'chorus', name: 'Chorus', description: 'Full energy, driving feel' },
  bridge: { id: 'bridge', name: 'Bridge', description: 'Contrast section, different texture' },
  outro: { id: 'outro', name: 'Outro', description: 'Closing section, fade-out style' },
} as const;

export type SongPart = keyof typeof SONG_PARTS;

// --- Drum Pattern Type ---

export type DrumPattern = Record<string, boolean[]>;

// Velocity map: per-instrument, per-step velocity values (1-127, default 100)
export type VelocityMap = Record<string, number[]>;

// Probability map: per-instrument, per-step probability values (0-100%, default 100)
export type ProbabilityMap = Record<string, number[]>;

// Multi-hit map: per-instrument, per-step hit count (1-4 hits per step, default 1)
export type MultiHitMap = Record<string, number[]>;

// Valid pattern lengths
export type PatternLength = 8 | 16 | 24 | 32;
export const PATTERN_LENGTHS: PatternLength[] = [8, 16, 24, 32];

// Extended pattern data includes velocity, probability, and multi-hit
export interface ExtendedPatternData {
  pattern: DrumPattern;
  velocity: VelocityMap;
  probability: ProbabilityMap;
  multiHit?: MultiHitMap;
  patternLength: PatternLength;
}

// Create default velocity map for a given length
export function createDefaultVelocity(length: PatternLength = 16): VelocityMap {
  const velocity: VelocityMap = {};
  for (const inst of INSTRUMENTS) {
    velocity[inst.id] = Array(length).fill(100) as number[];
  }
  return velocity;
}

// Create default probability map for a given length
export function createDefaultProbability(length: PatternLength = 16): ProbabilityMap {
  const probability: ProbabilityMap = {};
  for (const inst of INSTRUMENTS) {
    probability[inst.id] = Array(length).fill(100) as number[];
  }
  return probability;
}

// Create default multi-hit map for a given length (1 hit per step)
export function createDefaultMultiHit(length: PatternLength = 16): MultiHitMap {
  const multiHit: MultiHitMap = {};
  for (const inst of INSTRUMENTS) {
    multiHit[inst.id] = Array(length).fill(1) as number[];
  }
  return multiHit;
}

// Resize a pattern to a new length (truncate or extend)
export function resizePattern(pattern: DrumPattern, newLength: PatternLength): DrumPattern {
  const resized: DrumPattern = {};
  for (const key of Object.keys(pattern)) {
    const arr = pattern[key] || [];
    if (arr.length >= newLength) {
      resized[key] = arr.slice(0, newLength);
    } else {
      resized[key] = [...arr, ...Array(newLength - arr.length).fill(false)];
    }
  }
  return resized;
}

// Resize a number map (velocity/probability) to new length
export function resizeNumberMap(
  map: Record<string, number[]>,
  newLength: PatternLength,
  defaultValue: number
): Record<string, number[]> {
  const resized: Record<string, number[]> = {};
  for (const key of Object.keys(map)) {
    const arr = map[key] || [];
    if (arr.length >= newLength) {
      resized[key] = arr.slice(0, newLength);
    } else {
      resized[key] = [...arr, ...Array(newLength - arr.length).fill(defaultValue)];
    }
  }
  return resized;
}

// Helper: create a 16-step array from step indices
function s(...steps: number[]): boolean[] {
  const pattern = Array(16).fill(false) as boolean[];
  for (const step of steps) {
    pattern[step] = true;
  }
  return pattern;
}

// Empty 16-step row
const _ = (): boolean[] => Array(16).fill(false) as boolean[];

// --- Preset Patterns ---

export const PRESET_PATTERNS: Record<Genre, Record<SongPart, DrumPattern>> = {
  // =========================================================================
  // HOUSE (124 BPM) - Four-on-the-floor with syncopated hi-hats
  // =========================================================================
  house: {
    // Minimal intro - establish the groove
    intro: {
      'kick':         s(0, 4, 8, 12),                      // four on the floor foundation
      'snare':        _(),
      'hihat-closed': s(2, 10),                             // sparse offbeat hats
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         _(),
    },
    // Classic house verse with groove
    verse: {
      'kick':         s(0, 4, 8, 12),                      // four on the floor
      'snare':        _(),
      'hihat-closed': s(2, 6, 10, 14),                     // offbeat 8th hats
      'hihat-open':   s(3, 7, 11, 15),                     // syncopated open hats for swing
      'clap':         s(4, 12),                             // clap on 2 and 4
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         _(),
    },
    // Full energy house chorus
    chorus: {
      'kick':         s(0, 4, 8, 12),                      // four on the floor
      'snare':        s(4, 12),                             // snare layered
      'hihat-closed': s(0, 2, 4, 6, 8, 10, 12, 14),       // steady 8th hats
      'hihat-open':   s(3, 7, 11, 15),                     // swing open hats
      'clap':         s(4, 12),                             // claps on 2 and 4
      'tom-high':     s(14, 15),                            // tom roll accent
      'tom-low':      _(),
      'ride':         s(2, 6, 10, 14),                      // ride for texture
    },
    // Minimal breakdown bridge
    bridge: {
      'kick':         s(0, 4, 8, 12),                      // keep the four-on-the-floor
      'snare':        _(),
      'hihat-closed': s(2, 10),                             // sparse hats
      'hihat-open':   s(6, 14),                             // minimal open hats
      'clap':         s(12),                                // single clap for tension
      'tom-high':     _(),
      'tom-low':      s(8),                                 // low tom accent
      'ride':         _(),
    },
    // Fade-out outro - DJ-friendly ending
    outro: {
      'kick':         s(0, 8),                              // reduced kick (half of intro)
      'snare':        _(),
      'hihat-closed': s(4, 12),                             // minimal hats for closure
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         _(),
    },
  },

  // =========================================================================
  // ELECTRONIC (130 BPM) - Enhanced modern EDM with builds and drops
  // =========================================================================
  electronic: {
    // Minimal intro - set the tempo
    intro: {
      'kick':         s(0, 4, 8, 12),                      // four on the floor foundation
      'snare':        _(),
      'hihat-closed': s(2, 6, 10, 14),                     // offbeat hats only
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         _(),
    },
    // Build-up verse with energy
    verse: {
      'kick':         s(0, 4, 8, 12),                      // four on the floor
      'snare':        _(),
      'hihat-closed': s(2, 6, 10, 14),                     // offbeat 8th hats
      'hihat-open':   s(7, 15),                             // occasional open hat
      'clap':         s(4, 12),                             // clap on 2 and 4
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         _(),
    },
    // Drop/chorus - full energy with 16th hat rolls
    chorus: {
      'kick':         s(0, 4, 8, 12),                      // four on the floor
      'snare':        s(4, 12),                             // snare layered
      'hihat-closed': s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), // 16th hat roll
      'hihat-open':   s(2, 6, 10, 14),                     // open hats on offbeats
      'clap':         s(4, 12),                             // claps on 2 and 4
      'tom-high':     s(13, 14, 15),                        // tom roll
      'tom-low':      _(),
      'ride':         s(0, 4, 8, 12),                       // ride for emphasis
    },
    // Breakdown bridge: minimal, atmospheric tension
    bridge: {
      'kick':         s(0, 12),                             // sparse kick
      'snare':        _(),
      'hihat-closed': s(2, 6, 10, 14),                     // offbeat hats only
      'hihat-open':   s(14),                                // single open hat for tension
      'clap':         s(12),                                // single clap
      'tom-high':     s(8),                                 // single tom hit
      'tom-low':      _(),
      'ride':         _(),
    },
    // Fade-out outro - atmospheric ending
    outro: {
      'kick':         s(0),                                 // single kick for closure
      'snare':        _(),
      'hihat-closed': s(2, 10),                             // very sparse hats
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         _(),
    },
  },

  // =========================================================================
  // LO-FI (75 BPM) - Hip-hop influenced with jazz elements and swing
  // =========================================================================
  'lo-fi': {
    // Minimal intro - jazzy foundation
    intro: {
      'kick':         s(0, 10),                             // simple boom-bap foundation
      'snare':        _(),
      'hihat-closed': s(0, 4, 8, 12),                      // quarter note hats
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         s(0, 4, 8, 12),                       // jazz ride for atmosphere
    },
    // Mellow boom-bap verse with swing
    verse: {
      'kick':         s(0, 3, 10),                          // relaxed boom-bap kick with swing
      'snare':        s(4, 12),                             // snare on 2 and 4
      'hihat-closed': s(0, 3, 4, 6, 8, 11, 12, 14),       // swing 8th hats (dusty)
      'hihat-open':   s(7, 15),                             // occasional open hat
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         s(0, 3, 4, 6, 8, 11, 12, 14),        // jazz-influenced ride
    },
    // Slightly busier chorus while keeping the vibe
    chorus: {
      'kick':         s(0, 3, 7, 10),                      // syncopated kick
      'snare':        s(4, 12),                             // backbeat snare
      'hihat-closed': s(0, 3, 4, 6, 8, 11, 12, 14),       // swing hats
      'hihat-open':   s(3, 7, 11, 15),                     // open hat swing
      'clap':         s(4),                                 // light clap layer
      'tom-high':     s(15),                                // subtle tom accent
      'tom-low':      _(),
      'ride':         s(0, 3, 4, 6, 8, 11, 12, 14),        // continuous ride
    },
    // Stripped minimal bridge - atmospheric
    bridge: {
      'kick':         s(0, 10),                             // very sparse kick
      'snare':        s(12),                                // minimal snare
      'hihat-closed': s(0, 4, 8, 12),                      // quarter note hats
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      s(8),                                 // single low tom
      'ride':         s(0, 4, 8, 12),                       // sparse ride
    },
    // Fade-out outro - dusty ending
    outro: {
      'kick':         s(0),                                 // single kick
      'snare':        _(),
      'hihat-closed': s(0, 8),                              // very minimal hats
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         s(0, 12),                             // sparse ride for texture
    },
  },

  // =========================================================================
  // POP (120 BPM) - Clean polished drums with dynamic builds
  // =========================================================================
  pop: {
    // Clean intro - establish the groove
    intro: {
      'kick':         s(0, 8),                              // kick on 1 and 3
      'snare':        _(),
      'hihat-closed': s(0, 2, 4, 6, 8, 10, 12, 14),       // steady 8th hats
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         _(),
    },
    // Verse with foundation groove
    verse: {
      'kick':         s(0, 8),                              // kick on 1 and 3
      'snare':        s(4, 12),                             // snare on 2 and 4
      'hihat-closed': s(0, 2, 4, 6, 8, 10, 12, 14),       // steady 8th hats
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         _(),
    },
    // Big pop chorus with four-on-the-floor
    chorus: {
      'kick':         s(0, 4, 8, 12),                      // four on the floor for drive
      'snare':        s(4, 12),                             // snare on 2 and 4
      'hihat-closed': s(0, 2, 4, 6, 8, 10, 12, 14),       // 8th note hats
      'hihat-open':   s(6, 14),                             // open hats for accent
      'clap':         s(4, 12),                             // claps layered
      'tom-high':     s(15),                                // tom accent
      'tom-low':      _(),
      'ride':         s(0, 4, 8, 12),                       // ride for fullness
    },
    // Pre-chorus/bridge build with dynamics
    bridge: {
      'kick':         s(0, 6, 8, 14),                      // syncopated kick pattern
      'snare':        s(4, 12),                             // keep backbeat
      'hihat-closed': s(0, 4, 8, 12),                      // quarter note hats
      'hihat-open':   s(14),                                // open hat for build
      'clap':         s(12),                                // single clap
      'tom-high':     s(13, 14, 15),                        // tom roll for build
      'tom-low':      _(),
      'ride':         _(),
    },
    // Fade-out outro - polished ending
    outro: {
      'kick':         s(0),                                 // single kick
      'snare':        _(),
      'hihat-closed': s(0, 4, 8, 12),                      // quarter note hats
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         _(),
    },
  },

  // =========================================================================
  // HIP-HOP (95 BPM) - Punchy kicks, crisp snares, creative hi-hats
  // =========================================================================
  'hip-hop': {
    // Minimal intro - boom bap foundation
    intro: {
      'kick':         s(0, 8),                              // simple kick on 1 and 3
      'snare':        _(),
      'hihat-closed': s(0, 2, 4, 6, 8, 10, 12, 14),       // steady 8th hats
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         _(),
    },
    // Classic boom bap verse with swing
    verse: {
      'kick':         s(0, 3, 8, 12),                     // punchy kicks on 1, swing 3, 3, 4
      'snare':        s(4, 12),                            // crisp snares on 2 and 4
      'hihat-closed': s(0, 2, 4, 6, 8, 10, 12, 14),      // steady 8th hats
      'hihat-open':   s(7, 15),                            // offbeat open hats
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         _(),
    },
    // Full energy chorus with layered hits
    chorus: {
      'kick':         s(0, 3, 6, 8, 12, 14),              // busier kick pattern
      'snare':        s(4, 12),                            // snare on 2 and 4
      'hihat-closed': s(0, 2, 4, 6, 8, 10, 12, 14),      // 8th note hats
      'hihat-open':   s(3, 7, 11, 15),                    // open hats on offbeats
      'clap':         s(4, 12),                            // clap layered with snare
      'tom-high':     s(14),                               // accent tom
      'tom-low':      _(),
      'ride':         s(0, 4, 8, 12),                      // ride for texture
    },
    // Stripped bridge with contrast
    bridge: {
      'kick':         s(0, 10),                            // sparse kick
      'snare':        s(8),                                // half-time snare
      'hihat-closed': s(0, 4, 8, 12),                     // quarter note hats
      'hihat-open':   s(14),                               // single open hat
      'clap':         s(12),                               // single clap
      'tom-high':     _(),
      'tom-low':      s(6),                                // low tom accent
      'ride':         s(0, 2, 4, 6, 8, 10, 12, 14),       // ride 8ths
    },
    // Fade-out outro - hip-hop ending
    outro: {
      'kick':         s(0),                                // single kick
      'snare':        _(),
      'hihat-closed': s(0, 8),                             // very sparse hats
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         s(0, 4, 8, 12),                      // ride for texture
    },
  },

  // =========================================================================
  // TRAP (145 BPM) - Heavy 808 kicks, rapid hi-hats, snappy snares
  // =========================================================================
  trap: {
    // Minimal intro - trap foundation
    intro: {
      'kick':         s(0, 10),                             // sparse deep kicks
      'snare':        _(),
      'hihat-closed': s(0, 2, 4, 6, 8, 10, 12, 14),       // 8th note hats (not full rolls yet)
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         _(),
    },
    // Half-time verse with rolling hats
    verse: {
      'kick':         s(0, 7, 10),                         // sparse deep kicks at half-time
      'snare':        s(4, 12),                            // snare on 3rd and 7th beat
      'hihat-closed': s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), // rapid 16th hats
      'hihat-open':   s(6, 14),                            // open hat accents
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         _(),
    },
    // Full energy chorus with heavy 808s
    chorus: {
      'kick':         s(0, 3, 7, 8, 10, 14),              // heavy 808 pattern
      'snare':        s(4, 12),                            // snappy snares
      'hihat-closed': s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), // 16th hat rolls
      'hihat-open':   s(3, 7, 11, 15),                    // open hat accents
      'clap':         s(4, 12),                            // clap layered
      'tom-high':     s(14, 15),                           // tom accent
      'tom-low':      _(),
      'ride':         _(),
    },
    // Minimal bridge with atmospheric tension
    bridge: {
      'kick':         s(0, 14),                            // very sparse kick
      'snare':        s(8),                                // single snare hit
      'hihat-closed': s(0, 2, 4, 6, 8, 10, 12, 14),      // 8th note hats (stripped back)
      'hihat-open':   s(6, 14),                            // open hats for atmosphere
      'clap':         s(12),                               // single clap
      'tom-high':     _(),
      'tom-low':      s(10),                               // low tom accent
      'ride':         _(),
    },
    // Fade-out outro - trap ending
    outro: {
      'kick':         s(0),                                // single kick
      'snare':        _(),
      'hihat-closed': s(0, 4, 12),                         // very sparse hats
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         _(),
    },
  },

  // =========================================================================
  // ROCK (120 BPM) - Classic backbeat with driving energy
  // =========================================================================
  rock: {
    // Simple intro - establish the rock groove
    intro: {
      'kick':         s(0, 8),                              // beats 1 and 3
      'snare':        _(),
      'hihat-closed': s(0, 2, 4, 6, 8, 10, 12, 14),       // every 8th note
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         _(),
    },
    // Standard 4/4 rock beat
    verse: {
      'kick':         s(0, 8),                              // beats 1 and 3
      'snare':        s(4, 12),                             // beats 2 and 4
      'hihat-closed': s(0, 2, 4, 6, 8, 10, 12, 14),       // every 8th note
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         _(),
    },
    // Bigger chorus: more kick, open hats, ride cymbal
    chorus: {
      'kick':         s(0, 3, 6, 8, 11),                   // busier kick pattern
      'snare':        s(4, 12),                             // snare stays on 2 and 4
      'hihat-closed': s(0, 2, 4, 6, 8, 10, 12, 14),       // 8th note hi-hats
      'hihat-open':   s(6, 14),                             // open hat before beats 3 and 1
      'clap':         s(4, 12),                             // clap layered with snare
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         s(0, 4, 8, 12),                       // crash/ride on quarter notes
    },
    // Bridge: half-time feel with toms
    bridge: {
      'kick':         s(0, 10),                             // sparse kick
      'snare':        s(8),                                 // half-time snare on beat 3
      'hihat-closed': s(0, 4, 8, 12),                      // quarter note hats
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     s(12, 13),                            // tom fill
      'tom-low':      s(14, 15),                            // low tom fill into next bar
      'ride':         s(0, 2, 4, 6, 8, 10, 12, 14),        // ride 8ths for texture
    },
    // Fade-out outro - rock ending
    outro: {
      'kick':         s(0),                                 // single kick
      'snare':        _(),
      'hihat-closed': s(0, 4, 8, 12),                      // quarter note hats
      'hihat-open':   _(),
      'clap':         _(),
      'tom-high':     _(),
      'tom-low':      _(),
      'ride':         s(0, 2, 4, 6, 8, 10, 12, 14),        // ride 8ths for texture
    },
  },
};

// --- Emotions ---

export const EMOTIONS = {
  happy: {
    id: 'happy',
    name: 'Happy',
    description: 'Bright & uplifting',
    icon: '☀',
    color: '#F1C40F',
    defaultBpm: 120,
  },
  sad: {
    id: 'sad',
    name: 'Sad',
    description: 'Slow & melancholic',
    icon: '🌧',
    color: '#5B7DB1',
    defaultBpm: 72,
  },
  aggressive: {
    id: 'aggressive',
    name: 'Aggressive',
    description: 'Heavy & driving',
    icon: '⚡',
    color: '#E74C3C',
    defaultBpm: 140,
  },
  calm: {
    id: 'calm',
    name: 'Calm',
    description: 'Gentle & relaxed',
    icon: '🍃',
    color: '#2ECC71',
    defaultBpm: 85,
  },
  anxious: {
    id: 'anxious',
    name: 'Anxious',
    description: 'Irregular & tense',
    icon: '⏳',
    color: '#9B59B6',
    defaultBpm: 135,
  },
  romantic: {
    id: 'romantic',
    name: 'Romantic',
    description: 'Flowing & smooth',
    icon: '♥',
    color: '#E8729A',
    defaultBpm: 95,
  },
} as const;

export type Emotion = keyof typeof EMOTIONS;

// --- Emotion Patterns ---
// Each emotion has its own unique pattern designed to evoke the feeling

export const EMOTION_PATTERNS: Record<Emotion, DrumPattern> = {
  // Happy: Bright, bouncy, syncopated energy
  happy: {
    'kick':         s(0, 4, 8, 10, 12),
    'snare':        s(4, 12),
    'hihat-closed': s(0, 2, 4, 6, 8, 10, 12, 14),
    'hihat-open':   s(6, 14),
    'clap':         s(4, 12),
    'tom-high':     s(3, 11),
    'tom-low':      _(),
    'ride':         s(0, 4, 8, 12),
  },
  // Sad: Sparse, slow, empty spaces convey longing
  sad: {
    'kick':         s(0, 10),
    'snare':        s(8),
    'hihat-closed': s(0, 4, 8, 12),
    'hihat-open':   _(),
    'clap':         _(),
    'tom-high':     _(),
    'tom-low':      s(14),
    'ride':         s(0, 6, 12),
  },
  // Aggressive: Relentless kick, fast hats, strong accents
  aggressive: {
    'kick':         s(0, 2, 4, 6, 8, 10, 12, 14),
    'snare':        s(4, 12),
    'hihat-closed': s(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
    'hihat-open':   s(3, 7, 11, 15),
    'clap':         s(4, 8, 12),
    'tom-high':     s(13, 14),
    'tom-low':      s(15),
    'ride':         _(),
  },
  // Calm: Minimal, breathing room, gentle pulse
  calm: {
    'kick':         s(0, 8),
    'snare':        _(),
    'hihat-closed': s(4, 12),
    'hihat-open':   _(),
    'clap':         s(8),
    'tom-high':     _(),
    'tom-low':      _(),
    'ride':         s(0, 4, 8, 12),
  },
  // Anxious: Irregular, off-grid accents, busy but unpredictable
  anxious: {
    'kick':         s(0, 3, 5, 9, 11, 14),
    'snare':        s(2, 7, 13),
    'hihat-closed': s(0, 1, 3, 4, 6, 8, 9, 11, 12, 14),
    'hihat-open':   s(5, 10, 15),
    'clap':         s(1, 7, 11),
    'tom-high':     s(3, 9),
    'tom-low':      s(6, 14),
    'ride':         _(),
  },
  // Romantic: Smooth, flowing, gentle accents like a heartbeat
  romantic: {
    'kick':         s(0, 6, 10),
    'snare':        s(4, 12),
    'hihat-closed': s(0, 2, 4, 6, 8, 10, 12, 14),
    'hihat-open':   s(6, 14),
    'clap':         _(),
    'tom-high':     _(),
    'tom-low':      _(),
    'ride':         s(0, 3, 4, 6, 8, 11, 12, 14),
  },
};

// --- Helper ---

export function getPattern(genre: Genre, songPart: SongPart): DrumPattern {
  return PRESET_PATTERNS[genre][songPart];
}

export function getEmotionPattern(emotion: Emotion): DrumPattern {
  return EMOTION_PATTERNS[emotion];
}

// --- Re-export expanded library and selector ---

export { PATTERN_LIBRARY, EMOTION_PATTERN_LIBRARY, getPatternVariants, getEmotionVariants } from "./pattern-library";
export type { PatternVariant, EmotionVariant } from "./pattern-library";
export {
  selectRandomPattern,
  selectRandomEmotionPattern,
  getPatternCount,
  getPartPatternCount,
  getTotalPatternCount,
} from "./pattern-selector";

// --- Re-export fill patterns ---

export {
  FILL_LIBRARY,
  FILL_CATEGORIES,
  getGenreFills,
  getFillsByIntensity,
  getFillsByCategory,
  getRandomFill,
  getRandomFillByCategory,
  getContextualCategory,
  generateSmartFill,
  generateVariation,
  getFillCount,
  getCategoryFillCount,
} from "./fill-patterns";
export type { FillIntensity, FillType, FillCategory, FillPattern } from "./fill-patterns";
