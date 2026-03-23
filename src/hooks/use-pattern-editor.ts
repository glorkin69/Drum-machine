"use client";

import { useState, useCallback, useRef } from "react";
import {
  type DrumPattern,
  type VelocityMap,
  type ProbabilityMap,
  type MultiHitMap,
  type PatternLength,
  type Genre,
  INSTRUMENTS,
  createDefaultVelocity,
  createDefaultProbability,
  createDefaultMultiHit,
  resizePattern,
  resizeNumberMap,
} from "@/lib/drum-patterns";
import { autoHumanize, type AutoHumanizeResult } from "@/lib/humanize";

export type EditorMode = "toggle" | "velocity" | "probability";

interface PatternSnapshot {
  pattern: DrumPattern;
  velocity: VelocityMap;
  probability: ProbabilityMap;
  multiHit: MultiHitMap;
  patternLength: PatternLength;
}

interface ClipboardData {
  pattern: DrumPattern;
  velocity: VelocityMap;
  probability: ProbabilityMap;
  multiHit: MultiHitMap;
  startStep: number;
  endStep: number;
}

const MAX_HISTORY = 50;

export function usePatternEditor(initialPattern: DrumPattern) {
  const [pattern, setPattern] = useState<DrumPattern>(initialPattern);
  const [velocity, setVelocity] = useState<VelocityMap>(() => createDefaultVelocity(16));
  const [probability, setProbability] = useState<ProbabilityMap>(() => createDefaultProbability(16));
  const [multiHit, setMultiHit] = useState<MultiHitMap>(() => createDefaultMultiHit(16));
  const [patternLength, setPatternLength] = useState<PatternLength>(16);
  const [editorMode, setEditorMode] = useState<EditorMode>("toggle");
  const [isEdited, setIsEdited] = useState(false);
  const [isHumanized, setIsHumanized] = useState(false);

  // Undo/Redo history
  const historyRef = useRef<PatternSnapshot[]>([]);
  const historyIndexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Clipboard
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

  // Push current state to history
  const pushHistory = useCallback(() => {
    const snapshot: PatternSnapshot = {
      pattern: JSON.parse(JSON.stringify(pattern)),
      velocity: JSON.parse(JSON.stringify(velocity)),
      probability: JSON.parse(JSON.stringify(probability)),
      multiHit: JSON.parse(JSON.stringify(multiHit)),
      patternLength,
    };

    // Truncate any redo history
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(snapshot);

    // Limit history size
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }

    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, [pattern, velocity, probability, multiHit, patternLength]);

  // Apply a snapshot
  const applySnapshot = useCallback((snapshot: PatternSnapshot) => {
    setPattern(JSON.parse(JSON.stringify(snapshot.pattern)));
    setVelocity(JSON.parse(JSON.stringify(snapshot.velocity)));
    setProbability(JSON.parse(JSON.stringify(snapshot.probability)));
    setMultiHit(snapshot.multiHit ? JSON.parse(JSON.stringify(snapshot.multiHit)) : createDefaultMultiHit(snapshot.patternLength));
    setPatternLength(snapshot.patternLength);
  }, []);

  // Undo
  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;

    // Save current state if at the end
    if (historyIndexRef.current === historyRef.current.length - 1) {
      const current: PatternSnapshot = {
        pattern: JSON.parse(JSON.stringify(pattern)),
        velocity: JSON.parse(JSON.stringify(velocity)),
        probability: JSON.parse(JSON.stringify(probability)),
        multiHit: JSON.parse(JSON.stringify(multiHit)),
        patternLength,
      };
      // Replace top of history with current
      historyRef.current[historyIndexRef.current] = current;
    }

    historyIndexRef.current -= 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    applySnapshot(snapshot);
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(true);
    setIsEdited(true);
  }, [pattern, velocity, probability, multiHit, patternLength, applySnapshot]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    applySnapshot(snapshot);
    setCanUndo(true);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    setIsEdited(true);
  }, [applySnapshot]);

  // Update pattern with history tracking
  const updatePattern = useCallback(
    (newPattern: DrumPattern) => {
      pushHistory();
      setPattern(newPattern);
      setIsEdited(true);
    },
    [pushHistory]
  );

  // Set velocity for a specific step
  const setStepVelocity = useCallback(
    (instrumentId: string, step: number, value: number) => {
      pushHistory();
      setVelocity((prev) => {
        const next = { ...prev };
        const steps = [...(next[instrumentId] || Array(patternLength).fill(100))];
        steps[step] = Math.max(1, Math.min(127, value));
        next[instrumentId] = steps;
        return next;
      });
      setIsEdited(true);
    },
    [pushHistory, patternLength]
  );

  // Set probability for a specific step
  const setStepProbability = useCallback(
    (instrumentId: string, step: number, value: number) => {
      pushHistory();
      setProbability((prev) => {
        const next = { ...prev };
        const steps = [...(next[instrumentId] || Array(patternLength).fill(100))];
        steps[step] = Math.max(0, Math.min(100, value));
        next[instrumentId] = steps;
        return next;
      });
      setIsEdited(true);
    },
    [pushHistory, patternLength]
  );

  // Set multi-hit count for a specific step (1-4)
  const setStepMultiHit = useCallback(
    (instrumentId: string, step: number, hits: number) => {
      pushHistory();
      setMultiHit((prev) => {
        const next = { ...prev };
        const steps = [...(next[instrumentId] || Array(patternLength).fill(1))];
        steps[step] = Math.max(1, Math.min(4, hits));
        next[instrumentId] = steps;
        return next;
      });
      setIsEdited(true);
    },
    [pushHistory, patternLength]
  );

  // Change pattern length
  const changePatternLength = useCallback(
    (newLength: PatternLength) => {
      pushHistory();
      setPattern((prev) => resizePattern(prev, newLength));
      setVelocity((prev) => resizeNumberMap(prev, newLength, 100) as VelocityMap);
      setProbability((prev) => resizeNumberMap(prev, newLength, 100) as ProbabilityMap);
      setMultiHit((prev) => resizeNumberMap(prev, newLength, 1) as MultiHitMap);
      setPatternLength(newLength);
      setIsEdited(true);
    },
    [pushHistory]
  );

  // Copy a range of steps
  const copySteps = useCallback(
    (startStep: number, endStep: number) => {
      const clipPattern: DrumPattern = {};
      const clipVelocity: VelocityMap = {};
      const clipProbability: ProbabilityMap = {};
      const clipMultiHit: MultiHitMap = {};

      for (const inst of INSTRUMENTS) {
        clipPattern[inst.id] = (pattern[inst.id] || []).slice(startStep, endStep + 1);
        clipVelocity[inst.id] = (velocity[inst.id] || []).slice(startStep, endStep + 1);
        clipProbability[inst.id] = (probability[inst.id] || []).slice(startStep, endStep + 1);
        clipMultiHit[inst.id] = (multiHit[inst.id] || []).slice(startStep, endStep + 1);
      }

      setClipboard({
        pattern: clipPattern,
        velocity: clipVelocity,
        probability: clipProbability,
        multiHit: clipMultiHit,
        startStep,
        endStep,
      });
    },
    [pattern, velocity, probability, multiHit]
  );

  // Paste at a position
  const pasteSteps = useCallback(
    (atStep: number) => {
      if (!clipboard) return;
      pushHistory();

      const clipLength = clipboard.endStep - clipboard.startStep + 1;

      setPattern((prev) => {
        const next = { ...prev };
        for (const inst of INSTRUMENTS) {
          const steps = [...(next[inst.id] || Array(patternLength).fill(false))];
          for (let i = 0; i < clipLength && atStep + i < patternLength; i++) {
            steps[atStep + i] = clipboard.pattern[inst.id]?.[i] ?? false;
          }
          next[inst.id] = steps;
        }
        return next;
      });

      setVelocity((prev) => {
        const next = { ...prev };
        for (const inst of INSTRUMENTS) {
          const steps = [...(next[inst.id] || Array(patternLength).fill(100))];
          for (let i = 0; i < clipLength && atStep + i < patternLength; i++) {
            steps[atStep + i] = clipboard.velocity[inst.id]?.[i] ?? 100;
          }
          next[inst.id] = steps;
        }
        return next;
      });

      setProbability((prev) => {
        const next = { ...prev };
        for (const inst of INSTRUMENTS) {
          const steps = [...(next[inst.id] || Array(patternLength).fill(100))];
          for (let i = 0; i < clipLength && atStep + i < patternLength; i++) {
            steps[atStep + i] = clipboard.probability[inst.id]?.[i] ?? 100;
          }
          next[inst.id] = steps;
        }
        return next;
      });

      setMultiHit((prev) => {
        const next = { ...prev };
        for (const inst of INSTRUMENTS) {
          const steps = [...(next[inst.id] || Array(patternLength).fill(1))];
          for (let i = 0; i < clipLength && atStep + i < patternLength; i++) {
            steps[atStep + i] = clipboard.multiHit?.[inst.id]?.[i] ?? 1;
          }
          next[inst.id] = steps;
        }
        return next;
      });

      setIsEdited(true);
    },
    [clipboard, pushHistory, patternLength]
  );

  // Clear all tracks
  const clearAll = useCallback(() => {
    pushHistory();
    const cleared: DrumPattern = {};
    for (const inst of INSTRUMENTS) {
      cleared[inst.id] = Array(patternLength).fill(false);
    }
    setPattern(cleared);
    setVelocity(createDefaultVelocity(patternLength));
    setProbability(createDefaultProbability(patternLength));
    setMultiHit(createDefaultMultiHit(patternLength));
    setIsEdited(true);
  }, [pushHistory, patternLength]);

  // Clear a single track
  const clearTrack = useCallback(
    (instrumentId: string) => {
      pushHistory();
      setPattern((prev) => ({
        ...prev,
        [instrumentId]: Array(patternLength).fill(false),
      }));
      setVelocity((prev) => ({
        ...prev,
        [instrumentId]: Array(patternLength).fill(100),
      }));
      setProbability((prev) => ({
        ...prev,
        [instrumentId]: Array(patternLength).fill(100),
      }));
      setMultiHit((prev) => ({
        ...prev,
        [instrumentId]: Array(patternLength).fill(1),
      }));
      setIsEdited(true);
    },
    [pushHistory, patternLength]
  );

  // Load a new pattern (e.g., preset or saved)
  const loadPattern = useCallback(
    (
      newPattern: DrumPattern,
      newVelocity?: VelocityMap,
      newProbability?: ProbabilityMap,
      newLength?: PatternLength,
      newMultiHit?: MultiHitMap
    ) => {
      const len = newLength || 16;
      setPattern(JSON.parse(JSON.stringify(newPattern)));
      setVelocity(newVelocity ? JSON.parse(JSON.stringify(newVelocity)) : createDefaultVelocity(len));
      setProbability(newProbability ? JSON.parse(JSON.stringify(newProbability)) : createDefaultProbability(len));
      setMultiHit(newMultiHit ? JSON.parse(JSON.stringify(newMultiHit)) : createDefaultMultiHit(len));
      setPatternLength(len);
      setIsEdited(false);
      setIsHumanized(false);
      // Reset history
      historyRef.current = [];
      historyIndexRef.current = -1;
      setCanUndo(false);
      setCanRedo(false);
    },
    []
  );

  // Apply intelligent auto-humanization to the current pattern
  const applyAutoHumanize = useCallback(
    (genre: Genre, bpm: number): AutoHumanizeResult | null => {
      pushHistory();
      const result = autoHumanize(pattern, velocity, probability, genre, bpm, patternLength);
      setVelocity(result.velocity);
      setProbability(result.probability);
      setIsEdited(true);
      setIsHumanized(true);
      return result;
    },
    [pushHistory, pattern, velocity, probability, patternLength]
  );

  // Initialize history with initial state
  const initHistory = useCallback(() => {
    const snapshot: PatternSnapshot = {
      pattern: JSON.parse(JSON.stringify(pattern)),
      velocity: JSON.parse(JSON.stringify(velocity)),
      probability: JSON.parse(JSON.stringify(probability)),
      multiHit: JSON.parse(JSON.stringify(multiHit)),
      patternLength,
    };
    historyRef.current = [snapshot];
    historyIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
  }, [pattern, velocity, probability, multiHit, patternLength]);

  return {
    // State
    pattern,
    velocity,
    probability,
    multiHit,
    patternLength,
    editorMode,
    isEdited,
    isHumanized,
    canUndo,
    canRedo,
    clipboard,

    // Setters
    setPattern,
    setEditorMode,
    setIsEdited,

    // Actions
    updatePattern,
    setStepVelocity,
    setStepProbability,
    setStepMultiHit,
    changePatternLength,
    copySteps,
    pasteSteps,
    clearAll,
    clearTrack,
    loadPattern,
    applyAutoHumanize,
    undo,
    redo,
    pushHistory,
    initHistory,
  };
}
