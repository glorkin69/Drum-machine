/**
 * Session Recording Utilities for BeatForge 808
 *
 * Captures and replays collaborative session events including
 * pattern changes, BPM changes, participant actions, and more.
 */

import type { DrumPattern, Genre, SongPart, PatternLength } from "./drum-patterns";
import type {
  RecordingEvent,
  RecordingState,
  SessionRecording,
  RecordingPlaybackState,
} from "./collab-types";

// ============================================================================
// SESSION RECORDER
// ============================================================================

export class SessionRecorder {
  private events: RecordingEvent[] = [];
  private state: RecordingState = "idle";
  private startTime: number = 0;
  private pausedAt: number = 0;
  private totalPausedDuration: number = 0;

  /** Get current recording state */
  getState(): RecordingState {
    return this.state;
  }

  /** Get current duration in ms */
  getDuration(): number {
    if (this.state === "idle") return 0;
    if (this.state === "paused") return this.pausedAt - this.startTime - this.totalPausedDuration;
    if (this.state === "stopped") {
      const lastEvent = this.events[this.events.length - 1];
      return lastEvent ? lastEvent.timestamp : 0;
    }
    return Date.now() - this.startTime - this.totalPausedDuration;
  }

  /** Get event count */
  getEventCount(): number {
    return this.events.length;
  }

  /** Start recording */
  start(): void {
    if (this.state === "recording") return;

    if (this.state === "paused") {
      // Resume from pause
      this.totalPausedDuration += Date.now() - this.pausedAt;
      this.state = "recording";
      return;
    }

    // Fresh start
    this.events = [];
    this.startTime = Date.now();
    this.pausedAt = 0;
    this.totalPausedDuration = 0;
    this.state = "recording";
  }

  /** Pause recording */
  pause(): void {
    if (this.state !== "recording") return;
    this.pausedAt = Date.now();
    this.state = "paused";
  }

  /** Stop recording */
  stop(): void {
    if (this.state === "idle") return;
    this.state = "stopped";
  }

  /** Reset recording */
  reset(): void {
    this.events = [];
    this.state = "idle";
    this.startTime = 0;
    this.pausedAt = 0;
    this.totalPausedDuration = 0;
  }

  /** Add an event to the recording */
  addEvent(event: Omit<RecordingEvent, "timestamp">): void {
    if (this.state !== "recording") return;

    const timestamp = Date.now() - this.startTime - this.totalPausedDuration;
    this.events.push({
      ...event,
      timestamp,
    });
  }

  /** Get all recorded events */
  getEvents(): RecordingEvent[] {
    return [...this.events];
  }

  /** Export recording as a SessionRecording object */
  exportRecording(
    sessionId: string,
    name: string,
    startBpm: number,
    startGenre: Genre,
    startPart: SongPart,
    startPattern: DrumPattern,
    participants: string[]
  ): SessionRecording {
    return {
      id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      sessionId,
      name,
      duration: this.getDuration(),
      events: this.getEvents(),
      startBpm,
      startGenre,
      startPart,
      startPattern,
      participants,
      createdAt: new Date().toISOString(),
    };
  }
}

// ============================================================================
// RECORDING PLAYER
// ============================================================================

export type RecordingPlayerCallback = (event: RecordingEvent) => void;

export class RecordingPlayer {
  private recording: SessionRecording | null = null;
  private state: RecordingPlaybackState = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    speed: 1,
  };
  private eventIndex: number = 0;
  private animFrameId: number | null = null;
  private startTimestamp: number = 0;
  private callback: RecordingPlayerCallback | null = null;

  /** Load a recording for playback */
  load(recording: SessionRecording): void {
    this.recording = recording;
    this.state = {
      isPlaying: false,
      currentTime: 0,
      duration: recording.duration,
      speed: 1,
    };
    this.eventIndex = 0;
  }

  /** Set callback for events during playback */
  onEvent(callback: RecordingPlayerCallback): void {
    this.callback = callback;
  }

  /** Start playback */
  play(): void {
    if (!this.recording || this.state.isPlaying) return;

    this.state.isPlaying = true;
    this.startTimestamp = performance.now() - this.state.currentTime / this.state.speed;
    this.tick();
  }

  /** Pause playback */
  pause(): void {
    this.state.isPlaying = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /** Stop playback and reset */
  stop(): void {
    this.pause();
    this.state.currentTime = 0;
    this.eventIndex = 0;
  }

  /** Seek to a specific time (ms) */
  seek(timeMs: number): void {
    this.state.currentTime = Math.max(0, Math.min(timeMs, this.state.duration));
    // Find the correct event index
    if (this.recording) {
      this.eventIndex = 0;
      for (let i = 0; i < this.recording.events.length; i++) {
        if (this.recording.events[i].timestamp > this.state.currentTime) break;
        this.eventIndex = i + 1;
      }
    }
    if (this.state.isPlaying) {
      this.startTimestamp = performance.now() - this.state.currentTime / this.state.speed;
    }
  }

  /** Set playback speed */
  setSpeed(speed: number): void {
    if (this.state.isPlaying) {
      this.startTimestamp = performance.now() - this.state.currentTime / speed;
    }
    this.state.speed = speed;
  }

  /** Get current playback state */
  getState(): RecordingPlaybackState {
    return { ...this.state };
  }

  /** Animation frame tick for playback */
  private tick = (): void => {
    if (!this.state.isPlaying || !this.recording) return;

    const elapsed = (performance.now() - this.startTimestamp) * this.state.speed;
    this.state.currentTime = elapsed;

    // Fire events that have been reached
    while (
      this.eventIndex < this.recording.events.length &&
      this.recording.events[this.eventIndex].timestamp <= elapsed
    ) {
      if (this.callback) {
        this.callback(this.recording.events[this.eventIndex]);
      }
      this.eventIndex++;
    }

    // Check if playback is complete
    if (elapsed >= this.state.duration) {
      this.stop();
      return;
    }

    this.animFrameId = requestAnimationFrame(this.tick);
  };

  dispose(): void {
    this.stop();
    this.recording = null;
    this.callback = null;
  }
}
