/**
 * Real-Time Collaboration Types for BeatForge 808
 *
 * Types for multi-user jam sessions, virtual band members,
 * session recording, and real-time synchronization.
 */

import type {
  Genre,
  SongPart,
  Emotion,
  DrumPattern,
  VelocityMap,
  ProbabilityMap,
  PatternLength,
} from "./drum-patterns";

// ============================================================================
// COLLABORATION SESSION TYPES
// ============================================================================

/** Maximum number of participants per session */
export const MAX_SESSION_PARTICIPANTS = 4;

/** Session visibility */
export type SessionVisibility = "private" | "public" | "friends";

/** Participant role in a session */
export type ParticipantRole = "host" | "collaborator" | "viewer";

/** Connection status for a participant */
export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

/** Collaboration session state */
export interface CollabSession {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  genre: Genre;
  songPart: SongPart;
  emotion: Emotion | null;
  bpm: number;
  patternLength: PatternLength;
  visibility: SessionVisibility;
  inviteCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  participants: SessionParticipant[];
  /** Current shared pattern state */
  currentPattern: DrumPattern;
  currentVelocity: VelocityMap;
  currentProbability: ProbabilityMap;
}

/** A participant in a collaboration session */
export interface SessionParticipant {
  userId: string;
  userName: string;
  role: ParticipantRole;
  status: ConnectionStatus;
  /** Color for visual identification */
  color: string;
  /** Instruments assigned to this participant */
  assignedInstruments: string[];
  /** Last activity timestamp */
  lastActiveAt: string;
  /** Whether this participant has cursor focus on the grid */
  cursorPosition: { instrument: string; step: number } | null;
}

/** Participant colors for visual identification */
export const PARTICIPANT_COLORS = [
  "#FF6B6B", // coral red
  "#4ECDC4", // teal
  "#FFE66D", // yellow
  "#A8E6CF", // mint green
] as const;

// ============================================================================
// REAL-TIME SYNC MESSAGE TYPES
// ============================================================================

/** Types of real-time sync messages */
export type SyncMessageType =
  | "pattern_update"
  | "cursor_move"
  | "bpm_change"
  | "genre_change"
  | "part_change"
  | "emotion_change"
  | "participant_join"
  | "participant_leave"
  | "participant_status"
  | "chat_message"
  | "virtual_band_update"
  | "recording_state"
  | "session_closed"
  | "heartbeat";

/** Base sync message structure */
export interface SyncMessage {
  type: SyncMessageType;
  sessionId: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  data: Record<string, unknown>;
}

/** Pattern update payload */
export interface PatternUpdateData {
  instrument: string;
  step: number;
  value: boolean;
  velocity?: number;
  probability?: number;
}

/** Cursor move payload */
export interface CursorMoveData {
  instrument: string;
  step: number;
}

/** Chat message payload */
export interface ChatMessageData {
  text: string;
  emoji?: string;
}

// ============================================================================
// VIRTUAL BAND MEMBER TYPES
// ============================================================================

/** Virtual instrument types */
export type VirtualInstrument = "bass" | "melody" | "harmony" | "percussion";

/** Intelligence level for AI musicians */
export type AIIntelligenceLevel = "basic" | "intermediate" | "advanced";

/** Musical scale types */
export type MusicalScale =
  | "major"
  | "minor"
  | "pentatonic"
  | "blues"
  | "dorian"
  | "mixolydian";

/** Key options */
export type MusicalKey =
  | "C" | "C#" | "D" | "D#" | "E" | "F"
  | "F#" | "G" | "G#" | "A" | "A#" | "B";

/** Virtual band member configuration */
export interface VirtualBandMember {
  id: string;
  instrument: VirtualInstrument;
  name: string;
  enabled: boolean;
  volume: number; // 0-1
  intelligence: AIIntelligenceLevel;
  /** Musical key for pitched instruments */
  key: MusicalKey;
  /** Musical scale for pattern generation */
  scale: MusicalScale;
  /** Octave range */
  octave: number;
  /** How closely the AI follows the drum pattern */
  followIntensity: number; // 0-1
  /** Swing amount (matches drum machine swing) */
  swing: number; // 0-1
  /** Whether to auto-generate on pattern changes */
  autoGenerate: boolean;
  /** Current generated pattern (MIDI note numbers per step) */
  generatedPattern: (number | null)[];
  /** Velocity per step */
  generatedVelocity: number[];
}

/** Default virtual band member presets */
export const VIRTUAL_BAND_PRESETS: Record<VirtualInstrument, Omit<VirtualBandMember, "id" | "generatedPattern" | "generatedVelocity">> = {
  bass: {
    instrument: "bass",
    name: "Bass Bot",
    enabled: false,
    volume: 0.7,
    intelligence: "intermediate",
    key: "C",
    scale: "minor",
    octave: 2,
    followIntensity: 0.8,
    swing: 0,
    autoGenerate: true,
  },
  melody: {
    instrument: "melody",
    name: "Melody Bot",
    enabled: false,
    volume: 0.5,
    intelligence: "intermediate",
    key: "C",
    scale: "pentatonic",
    octave: 4,
    followIntensity: 0.5,
    swing: 0,
    autoGenerate: true,
  },
  harmony: {
    instrument: "harmony",
    name: "Harmony Bot",
    enabled: false,
    volume: 0.4,
    intelligence: "intermediate",
    key: "C",
    scale: "major",
    octave: 3,
    followIntensity: 0.6,
    swing: 0,
    autoGenerate: true,
  },
  percussion: {
    instrument: "percussion",
    name: "Perc Bot",
    enabled: false,
    volume: 0.5,
    intelligence: "basic",
    key: "C",
    scale: "pentatonic",
    octave: 3,
    followIntensity: 0.9,
    swing: 0,
    autoGenerate: true,
  },
};

// ============================================================================
// SESSION RECORDING TYPES
// ============================================================================

/** Recording state */
export type RecordingState = "idle" | "recording" | "paused" | "stopped";

/** A single event in the recording timeline */
export interface RecordingEvent {
  timestamp: number; // ms from recording start
  type: "pattern_change" | "bpm_change" | "genre_change" | "part_change" |
    "participant_action" | "virtual_band_change" | "note_trigger";
  data: Record<string, unknown>;
  userId?: string;
  userName?: string;
}

/** Session recording metadata */
export interface SessionRecording {
  id: string;
  sessionId: string;
  name: string;
  duration: number; // ms
  events: RecordingEvent[];
  startBpm: number;
  startGenre: Genre;
  startPart: SongPart;
  startPattern: DrumPattern;
  participants: string[];
  createdAt: string;
}

/** Recording playback state */
export interface RecordingPlaybackState {
  isPlaying: boolean;
  currentTime: number; // ms
  duration: number;
  speed: number; // 0.5x, 1x, 2x
}

// ============================================================================
// STREAMING TYPES (Stub for future integration)
// ============================================================================

/** Stream platform options */
export type StreamPlatform = "twitch" | "youtube" | "none";

/** Stream status */
export interface StreamStatus {
  platform: StreamPlatform;
  isLive: boolean;
  viewerCount: number;
  chatEnabled: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique invite code with higher entropy.
 * Uses 8 characters from a 31-char alphabet = ~31^8 = ~8.5 billion combinations.
 * Uses crypto.getRandomValues for cryptographic randomness.
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const length = 8; // Increased from 6 for better entropy
  let code = "";

  // Use crypto for secure randomness if available
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      code += chars[values[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return code;
}

/** Generate a unique ID */
export function generateCollabId(): string {
  return `collab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Get participant color by index */
export function getParticipantColor(index: number): string {
  return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
}
