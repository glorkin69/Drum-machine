/**
 * useSessionRecording - Session recording management hook
 *
 * Manages recording and playback of collaborative session events.
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { SessionRecorder, RecordingPlayer, type RecordingPlayerCallback } from "@/lib/session-recording";
import type {
  RecordingState,
  RecordingEvent,
  SessionRecording,
  RecordingPlaybackState,
} from "@/lib/collab-types";
import type { DrumPattern, Genre, SongPart } from "@/lib/drum-patterns";

export function useSessionRecording() {
  const recorderRef = useRef(new SessionRecorder());
  const playerRef = useRef(new RecordingPlayer());

  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [duration, setDuration] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [playbackState, setPlaybackState] = useState<RecordingPlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    speed: 1,
  });
  const [savedRecordings, setSavedRecordings] = useState<SessionRecording[]>([]);

  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Update duration periodically while recording */
  const startDurationTimer = useCallback(() => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    durationTimerRef.current = setInterval(() => {
      setDuration(recorderRef.current.getDuration());
      setEventCount(recorderRef.current.getEventCount());
    }, 100);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  /** Start recording */
  const startRecording = useCallback(() => {
    recorderRef.current.start();
    setRecordingState("recording");
    startDurationTimer();
  }, [startDurationTimer]);

  /** Pause recording */
  const pauseRecording = useCallback(() => {
    recorderRef.current.pause();
    setRecordingState("paused");
    stopDurationTimer();
    setDuration(recorderRef.current.getDuration());
  }, [stopDurationTimer]);

  /** Resume recording */
  const resumeRecording = useCallback(() => {
    recorderRef.current.start(); // start() handles resume when paused
    setRecordingState("recording");
    startDurationTimer();
  }, [startDurationTimer]);

  /** Stop recording */
  const stopRecording = useCallback(() => {
    recorderRef.current.stop();
    setRecordingState("stopped");
    stopDurationTimer();
    setDuration(recorderRef.current.getDuration());
    setEventCount(recorderRef.current.getEventCount());
  }, [stopDurationTimer]);

  /** Reset recording */
  const resetRecording = useCallback(() => {
    recorderRef.current.reset();
    setRecordingState("idle");
    setDuration(0);
    setEventCount(0);
    stopDurationTimer();
  }, [stopDurationTimer]);

  /** Add an event to the current recording */
  const addEvent = useCallback(
    (event: Omit<RecordingEvent, "timestamp">) => {
      recorderRef.current.addEvent(event);
    },
    []
  );

  /** Export the current recording */
  const exportRecording = useCallback(
    (
      sessionId: string,
      name: string,
      startBpm: number,
      startGenre: Genre,
      startPart: SongPart,
      startPattern: DrumPattern,
      participants: string[]
    ): SessionRecording => {
      return recorderRef.current.exportRecording(
        sessionId,
        name,
        startBpm,
        startGenre,
        startPart,
        startPattern,
        participants
      );
    },
    []
  );

  /** Save recording to server */
  const saveRecording = useCallback(
    async (recording: SessionRecording): Promise<boolean> => {
      try {
        const response = await fetch("/api/collab/recordings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recording),
        });

        if (!response.ok) return false;

        const saved = await response.json();
        setSavedRecordings((prev) => [saved, ...prev]);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  /** Load saved recordings list */
  const loadRecordings = useCallback(async (sessionId?: string): Promise<void> => {
    try {
      const url = sessionId
        ? `/api/collab/recordings?sessionId=${sessionId}`
        : "/api/collab/recordings";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSavedRecordings(data);
      }
    } catch {
      // Silently fail
    }
  }, []);

  /** Load a recording for playback */
  const loadForPlayback = useCallback((recording: SessionRecording) => {
    playerRef.current.load(recording);
    setPlaybackState(playerRef.current.getState());
  }, []);

  /** Set playback event callback */
  const onPlaybackEvent = useCallback((callback: RecordingPlayerCallback) => {
    playerRef.current.onEvent(callback);
  }, []);

  /** Start playback */
  const startPlayback = useCallback(() => {
    playerRef.current.play();
    // Update playback state periodically
    const updateState = () => {
      const state = playerRef.current.getState();
      setPlaybackState(state);
      if (state.isPlaying) {
        requestAnimationFrame(updateState);
      }
    };
    requestAnimationFrame(updateState);
  }, []);

  /** Pause playback */
  const pausePlayback = useCallback(() => {
    playerRef.current.pause();
    setPlaybackState(playerRef.current.getState());
  }, []);

  /** Stop playback */
  const stopPlayback = useCallback(() => {
    playerRef.current.stop();
    setPlaybackState(playerRef.current.getState());
  }, []);

  /** Seek playback */
  const seekPlayback = useCallback((timeMs: number) => {
    playerRef.current.seek(timeMs);
    setPlaybackState(playerRef.current.getState());
  }, []);

  /** Set playback speed */
  const setPlaybackSpeed = useCallback((speed: number) => {
    playerRef.current.setSpeed(speed);
    setPlaybackState(playerRef.current.getState());
  }, []);

  /** Format duration in mm:ss */
  const formatDuration = useCallback((ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    // Recording
    recordingState,
    duration,
    eventCount,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
    addEvent,
    exportRecording,
    saveRecording,
    loadRecordings,

    // Playback
    playbackState,
    savedRecordings,
    loadForPlayback,
    onPlaybackEvent,
    startPlayback,
    pausePlayback,
    stopPlayback,
    seekPlayback,
    setPlaybackSpeed,

    // Utils
    formatDuration,
  };
}
