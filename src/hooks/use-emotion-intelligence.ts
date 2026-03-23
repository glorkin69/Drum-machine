"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { DrumPattern, Genre, SongPart, Emotion, PatternLength } from "@/lib/drum-patterns";
import {
  type EmotionalProfile,
  type EmotionIntensity,
  type EmotionalImpactScore,
  type ArrangementSuggestion,
  type PsychoacousticHint,
  type BiometricData,
  type UseContext,
  type EmotionalArcPoint,
  type SuggestionHistoryEntry,
  analyzeEmotionalProfile,
  computeEmotionalImpact,
  getArrangementSuggestions,
  getPsychoacousticHints,
  generateEmotionPattern,
  getAdaptiveSettings,
  applySuggestion,
  generateEmotionalArc,
  getTransitionSuggestion,
  getContextRecommendations,
  USE_CONTEXTS,
} from "@/lib/emotion-intelligence";

interface UseEmotionIntelligenceOptions {
  isGuest?: boolean;
}

interface EmotionIntelligenceState {
  /** Current emotional profile of the active pattern */
  profile: EmotionalProfile | null;
  /** Emotional impact score */
  impactScore: EmotionalImpactScore | null;
  /** Arrangement suggestions */
  suggestions: ArrangementSuggestion[];
  /** Psychoacoustic optimization hints */
  psychoacousticHints: PsychoacousticHint[];
  /** Current emotion intensity (1-5) */
  intensity: EmotionIntensity;
  /** Selected use context */
  activeContext: UseContext | null;
  /** Emotional arc for song mode */
  emotionalArc: EmotionalArcPoint[];
  /** Biometric integration enabled */
  biometricEnabled: boolean;
  /** Latest biometric data */
  biometricData: BiometricData | null;
  /** Whether the panel is expanded */
  isExpanded: boolean;
  /** Last applied suggestion ID */
  lastAppliedSuggestion: string | null;
  /** History of applied suggestions */
  suggestionHistory: SuggestionHistoryEntry[];
  /** Total suggestions applied this session */
  suggestionsAppliedCount: number;
}

const MAX_HISTORY = 20;

const DEFAULT_STATE: EmotionIntelligenceState = {
  profile: null,
  impactScore: null,
  suggestions: [],
  psychoacousticHints: [],
  intensity: 3,
  activeContext: null,
  emotionalArc: [],
  biometricEnabled: false,
  biometricData: null,
  isExpanded: false,
  lastAppliedSuggestion: null,
  suggestionHistory: [],
  suggestionsAppliedCount: 0,
};

export function useEmotionIntelligence({ isGuest = false }: UseEmotionIntelligenceOptions = {}) {
  const [state, setState] = useState<EmotionIntelligenceState>(DEFAULT_STATE);
  const analysisTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Analyze pattern and update all intelligence data.
   * Debounced to avoid excessive recomputation.
   */
  const analyzePattern = useCallback((
    pattern: DrumPattern,
    bpm: number,
    emotion: Emotion | null,
    songPart: SongPart,
    patternLength: number = 16,
    currentSwing: number = 0,
    genre?: string
  ) => {
    if (analysisTimerRef.current) {
      clearTimeout(analysisTimerRef.current);
    }

    analysisTimerRef.current = setTimeout(() => {
      const profile = analyzeEmotionalProfile(pattern, bpm, patternLength);
      const impactScore = computeEmotionalImpact(profile, emotion, state.intensity);
      const suggestions = getArrangementSuggestions(pattern, profile, emotion, songPart, patternLength, genre);
      const psychoacousticHints = getPsychoacousticHints(profile, emotion, bpm, currentSwing, state.intensity);

      setState(s => ({
        ...s,
        profile,
        impactScore,
        suggestions,
        psychoacousticHints,
      }));
    }, 150); // 150ms debounce
  }, [state.intensity]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (analysisTimerRef.current) {
        clearTimeout(analysisTimerRef.current);
      }
    };
  }, []);

  /** Set emotion intensity */
  const setIntensity = useCallback((intensity: EmotionIntensity) => {
    setState(s => ({ ...s, intensity }));
  }, []);

  /** Apply a suggestion to the current pattern, tracking history */
  const applyArrangementSuggestion = useCallback((
    pattern: DrumPattern,
    suggestion: ArrangementSuggestion,
    patternLength: number = 16,
    genre?: string,
    songPart?: string,
    emotion?: string | null,
  ): DrumPattern => {
    const historyEntry: SuggestionHistoryEntry = {
      suggestion,
      appliedAt: Date.now(),
      genre: genre || "unknown",
      songPart: songPart || "verse",
      emotion: emotion || null,
    };
    setState(s => ({
      ...s,
      lastAppliedSuggestion: suggestion.id,
      suggestionsAppliedCount: s.suggestionsAppliedCount + 1,
      suggestionHistory: [historyEntry, ...s.suggestionHistory].slice(0, MAX_HISTORY),
    }));
    return applySuggestion(pattern, suggestion, patternLength);
  }, []);

  /** Set use context and get recommendations */
  const setContext = useCallback((context: UseContext | null) => {
    setState(s => ({ ...s, activeContext: context }));
  }, []);

  /** Get recommendations for the active context */
  const getActiveContextRecommendations = useCallback(() => {
    if (!state.activeContext) return null;
    return getContextRecommendations(state.activeContext);
  }, [state.activeContext]);

  /** Generate emotion-optimized pattern */
  const generateOptimizedPattern = useCallback((
    emotion: Emotion,
    genre: Genre,
    patternLength: PatternLength = 16
  ): DrumPattern => {
    return generateEmotionPattern(emotion, state.intensity, genre, patternLength);
  }, [state.intensity]);

  /** Get adaptive settings for current emotion */
  const getAdaptive = useCallback((
    emotion: Emotion
  ) => {
    return getAdaptiveSettings(emotion, state.intensity, state.biometricData || undefined);
  }, [state.intensity, state.biometricData]);

  /** Update emotional arc for song mode */
  const updateEmotionalArc = useCallback((
    songParts: SongPart[],
    targetEmotion: Emotion | null
  ) => {
    const arc = generateEmotionalArc(songParts, targetEmotion);
    setState(s => ({ ...s, emotionalArc: arc }));
  }, []);

  /** Get transition suggestion between two profiles */
  const getTransition = useCallback((
    fromProfile: EmotionalProfile,
    toProfile: EmotionalProfile
  ): string => {
    return getTransitionSuggestion(fromProfile, toProfile);
  }, []);

  /** Toggle biometric integration */
  const toggleBiometric = useCallback(() => {
    setState(s => ({ ...s, biometricEnabled: !s.biometricEnabled, biometricData: null }));
  }, []);

  /** Update biometric data */
  const updateBiometricData = useCallback((data: BiometricData) => {
    if (!state.biometricEnabled) return;
    setState(s => ({ ...s, biometricData: data }));
  }, [state.biometricEnabled]);

  /** Toggle panel expanded */
  const toggleExpanded = useCallback(() => {
    setState(s => ({ ...s, isExpanded: !s.isExpanded }));
  }, []);

  /** Clear suggestion history */
  const clearSuggestionHistory = useCallback(() => {
    setState(s => ({ ...s, suggestionHistory: [], suggestionsAppliedCount: 0 }));
  }, []);

  return {
    // State
    profile: state.profile,
    impactScore: state.impactScore,
    suggestions: state.suggestions,
    psychoacousticHints: state.psychoacousticHints,
    intensity: state.intensity,
    activeContext: state.activeContext,
    emotionalArc: state.emotionalArc,
    biometricEnabled: state.biometricEnabled,
    biometricData: state.biometricData,
    isExpanded: state.isExpanded,
    lastAppliedSuggestion: state.lastAppliedSuggestion,
    suggestionHistory: state.suggestionHistory,
    suggestionsAppliedCount: state.suggestionsAppliedCount,
    contextLibrary: USE_CONTEXTS,

    // Actions
    analyzePattern,
    setIntensity,
    applyArrangementSuggestion,
    setContext,
    getActiveContextRecommendations,
    generateOptimizedPattern,
    getAdaptive,
    updateEmotionalArc,
    getTransition,
    toggleBiometric,
    updateBiometricData,
    toggleExpanded,
    clearSuggestionHistory,
  };
}
