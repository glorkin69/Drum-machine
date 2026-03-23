"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { DrumPattern, Genre, SongPart } from "@/lib/drum-patterns";
import {
  type StyleFingerprint,
  type ArtistDNA,
  ARTIST_DNA_LIBRARY,
  getArtistDNA,
  analyzePattern,
  createDefaultFingerprint,
} from "@/lib/style-dna";
import { evolvePattern, generateFromDNA, applyStyleTransfer } from "@/lib/style-engine";

interface UseStyleDNAOptions {
  isGuest?: boolean;
}

interface StyleDNAState {
  /** Currently selected artist DNA (null = personal style or none) */
  selectedArtist: ArtistDNA | null;
  /** User's personal style fingerprint */
  personalDNA: StyleFingerprint;
  /** Whether the personal profile has been loaded from server */
  profileLoaded: boolean;
  /** Total feedback count (how trained the profile is) */
  feedbackCount: number;
  /** Loading states */
  isLoading: boolean;
  isFeedbackLoading: boolean;
  /** Last feedback given on the current pattern */
  lastFeedback: "liked" | "disliked" | null;
}

export function useStyleDNA({ isGuest = false }: UseStyleDNAOptions = {}) {
  const [state, setState] = useState<StyleDNAState>({
    selectedArtist: null,
    personalDNA: createDefaultFingerprint(),
    profileLoaded: false,
    feedbackCount: 0,
    isLoading: false,
    isFeedbackLoading: false,
    lastFeedback: null,
  });

  const fetchedRef = useRef(false);

  // Load profile on mount (if authenticated)
  useEffect(() => {
    if (isGuest || fetchedRef.current) return;
    fetchedRef.current = true;

    const loadProfile = async () => {
      setState((s) => ({ ...s, isLoading: true }));
      try {
        const res = await fetch("/api/style-profile");
        if (res.ok) {
          const data = await res.json();
          setState((s) => ({
            ...s,
            personalDNA: data.dna as StyleFingerprint,
            feedbackCount: data.feedbackCount,
            profileLoaded: true,
            isLoading: false,
          }));
        } else {
          setState((s) => ({ ...s, isLoading: false, profileLoaded: true }));
        }
      } catch {
        setState((s) => ({ ...s, isLoading: false, profileLoaded: true }));
      }
    };

    loadProfile();
  }, [isGuest]);

  // Select an artist DNA preset
  const selectArtist = useCallback((artistId: string | null) => {
    if (!artistId) {
      setState((s) => ({ ...s, selectedArtist: null, lastFeedback: null }));
      return;
    }
    const artist = getArtistDNA(artistId);
    if (artist) {
      setState((s) => ({ ...s, selectedArtist: artist, lastFeedback: null }));
    }
  }, []);

  // Evolve the current pattern using the active style DNA
  const evolveCurrentPattern = useCallback(
    (basePattern: DrumPattern, genre: Genre, patternLength: number = 16): DrumPattern => {
      const activeDNA = state.selectedArtist || state.personalDNA;
      setState((s) => ({ ...s, lastFeedback: null }));
      return evolvePattern(basePattern, activeDNA, genre, patternLength);
    },
    [state.selectedArtist, state.personalDNA]
  );

  // Generate a new pattern entirely from DNA
  const generatePattern = useCallback(
    (genre: Genre, songPart: SongPart, patternLength: number = 16): DrumPattern => {
      const activeDNA = state.selectedArtist || state.personalDNA;
      setState((s) => ({ ...s, lastFeedback: null }));
      return generateFromDNA(activeDNA, genre, songPart, patternLength);
    },
    [state.selectedArtist, state.personalDNA]
  );

  // Transfer style to a pattern
  const transferStyle = useCallback(
    (pattern: DrumPattern, genre: Genre, patternLength: number = 16): DrumPattern => {
      const activeDNA = state.selectedArtist || state.personalDNA;
      return applyStyleTransfer(pattern, activeDNA, genre, patternLength);
    },
    [state.selectedArtist, state.personalDNA]
  );

  // Submit feedback (like/dislike a pattern)
  const submitFeedback = useCallback(
    async (
      pattern: DrumPattern,
      liked: boolean,
      genre: Genre,
      songPart: SongPart,
      patternLength: number = 16
    ) => {
      setState((s) => ({ ...s, isFeedbackLoading: true, lastFeedback: liked ? "liked" : "disliked" }));

      if (isGuest) {
        // For guests, just update local state with the pattern analysis
        const fp = analyzePattern(pattern, patternLength);
        if (liked) {
          setState((s) => ({
            ...s,
            personalDNA: {
              ...s.personalDNA,
              density: s.personalDNA.density * 0.85 + fp.density * 0.15,
              syncopation: s.personalDNA.syncopation * 0.85 + fp.syncopation * 0.15,
              kickDensity: s.personalDNA.kickDensity * 0.85 + fp.kickDensity * 0.15,
              hihatDensity: s.personalDNA.hihatDensity * 0.85 + fp.hihatDensity * 0.15,
              complexity: s.personalDNA.complexity * 0.85 + fp.complexity * 0.15,
            },
            feedbackCount: s.feedbackCount + 1,
            isFeedbackLoading: false,
          }));
        } else {
          setState((s) => ({ ...s, feedbackCount: s.feedbackCount + 1, isFeedbackLoading: false }));
        }
        return;
      }

      try {
        const res = await fetch("/api/style-profile/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pattern,
            liked,
            genre,
            songPart,
            artistDna: state.selectedArtist?.id || null,
            patternLength,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setState((s) => ({
            ...s,
            personalDNA: data.dna as StyleFingerprint,
            feedbackCount: data.feedbackCount,
            isFeedbackLoading: false,
          }));
        } else {
          setState((s) => ({ ...s, isFeedbackLoading: false }));
        }
      } catch {
        setState((s) => ({ ...s, isFeedbackLoading: false }));
      }
    },
    [isGuest, state.selectedArtist]
  );

  // Get the active style name for display
  const activeStyleName = state.selectedArtist?.name || (state.feedbackCount > 0 ? "Personal Style" : "Default");

  // Get the active fingerprint
  const activeFingerprint = state.selectedArtist?.fingerprint || state.personalDNA;

  return {
    // State
    selectedArtist: state.selectedArtist,
    personalDNA: state.personalDNA,
    profileLoaded: state.profileLoaded,
    feedbackCount: state.feedbackCount,
    isLoading: state.isLoading,
    isFeedbackLoading: state.isFeedbackLoading,
    lastFeedback: state.lastFeedback,
    activeStyleName,
    activeFingerprint,
    artistLibrary: ARTIST_DNA_LIBRARY,

    // Actions
    selectArtist,
    evolveCurrentPattern,
    generatePattern,
    transferStyle,
    submitFeedback,
  };
}
