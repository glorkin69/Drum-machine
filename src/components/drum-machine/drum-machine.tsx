"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { PatternGrid } from "./pattern-grid";
import { TransportControls } from "./transport-controls";
import { GenreSelector } from "./genre-selector";
import { SongPartSelector } from "./song-part-selector";
import { EmotionSelector } from "./emotion-selector";
import { PatternVariationSelector } from "./pattern-variation-selector";
import { PatternEditorToolbar } from "./pattern-editor-toolbar";
import { VariationControls, type ActiveVariation } from "./variation-controls";
import { ComplexitySlider } from "./complexity-slider";
import { SwingHumanizeControls } from "./swing-humanize-controls";
import { XYPad } from "./xy-pad";
import { EffectsRackPanel } from "./effects-rack-panel";
import { DancingCharacter } from "./dancing-character";
import { type HumanizeSettings, DEFAULT_HUMANIZE, getSwingOffsetMs, getTimingHumanizeOffsetMs, humanizeVelocity } from "@/lib/humanize";
import {
  GENRES,
  EMOTIONS,
  PRESET_PATTERNS,
  EMOTION_PATTERNS,
  type Genre,
  type SongPart,
  type Emotion,
  type DrumPattern,
  type VelocityMap,
  type ProbabilityMap,
  type PatternLength,
  selectRandomPattern,
  selectRandomEmotionPattern,
  getPartPatternCount,
} from "@/lib/drum-patterns";
import type { PatternVariant } from "@/lib/pattern-library";
import {
  type FillIntensity,
  type FillCategory,
  getRandomFill,
  getRandomFillByCategory,
  generateSmartFill,
  generateVariation,
} from "@/lib/fill-patterns";
import { applyComplexity, getComplexityBpmAdjustment } from "@/lib/complexity-engine";
import { usePatternEditor } from "@/hooks/use-pattern-editor";
import { drumAudio, setInstrumentVariation } from "@/lib/audio-engine";
import { useAudioContext } from "@/hooks/use-audio-context";
import { AudioUnlockBanner } from "./audio-unlock-banner";
import {
  getDefaultVariations,
  getVariationParams,
  migrateVariations,
  type SelectedVariations,
} from "@/lib/drum-sound-variations";
import { getStepInterval } from "@/lib/sequencer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Disc3, Save, FolderOpen, LogOut, RotateCcw, User, Shuffle, Shield, Download, Music, ChevronDown, ChevronRight, Settings, Minimize2, Maximize2, Layers, Sparkles, Sliders, Radio, Mic, Piano, Gamepad2, GraduationCap, AudioLines } from "lucide-react";
import { toast } from "sonner";
import { GuestSignupBanner } from "@/components/guest-signup-banner";
import { ThemeSelector } from "@/components/theme-selector";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";
import { exportPatternAsMidi, exportSongAsMidi } from "@/lib/midi-export";
import { useSongMode } from "@/hooks/use-song-mode";
import { useStyleDNA } from "@/hooks/use-style-dna";
import { SongModePanel } from "./song-mode-panel";
import { StyleDNAPanel } from "./style-dna-panel";
import { VirtualBandPanel } from "./virtual-band-panel";
import { SessionRecordingPanel } from "./session-recording-panel";
import { EmotionImpactMeter } from "./emotion-impact-meter";
import { ArrangementSuggestionsPanel } from "./arrangement-suggestions-panel";
import { EmotionalArcTimeline } from "./emotional-arc-timeline";
import { useVirtualBand } from "@/hooks/use-virtual-band";
import { useSessionRecording } from "@/hooks/use-session-recording";
import { useEmotionIntelligence } from "@/hooks/use-emotion-intelligence";
import { useCollapsibleSections, type SectionId } from "@/hooks/use-collapsible-sections";
import { CollapsibleSection } from "./collapsible-section";
import type { SessionRecording } from "@/lib/collab-types";
import type { SongBlock, Song } from "@/lib/song-types";
import type { ArrangementSuggestion, PsychoacousticHint } from "@/lib/emotion-intelligence";

export function DrumMachine({ isGuest = false, guestSessionStart = null }: { isGuest?: boolean; guestSessionStart?: number | null }) {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const tc = getThemeColors(theme);
  const audioCtx = useAudioContext();
  const sectionState = useCollapsibleSections();
  const [genre, setGenre] = useState<Genre>("rock");
  const [songPart, setSongPart] = useState<SongPart>("verse");
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [bpm, setBpm] = useState<number>(GENRES.rock.defaultBpm);

  // Pattern editor hook
  const editor = usePatternEditor(
    JSON.parse(JSON.stringify(PRESET_PATTERNS.rock.verse))
  );

  const [patternVariantName, setPatternVariantName] = useState<string | null>(null);
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [savedPatterns, setSavedPatterns] = useState<Array<{
    id: string; name: string; genre: string; songPart: string; emotion?: string | null; bpm: number;
  }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [guestSessionTime, setGuestSessionTime] = useState<number>(0);

  // ---- Song Mode state ----
  const [showSaveSongDialog, setShowSaveSongDialog] = useState(false);
  const [showLoadSongDialog, setShowLoadSongDialog] = useState(false);
  const [savedSongs, setSavedSongs] = useState<Array<{
    id: string; name: string; blockCount: number; loop: boolean;
  }>>([]);
  const [isSavingSong, setIsSavingSong] = useState(false);

  // ---- Fill & Variation state ----
  const [activeVariation, setActiveVariation] = useState<ActiveVariation>("A");
  const [fillIntensity, setFillIntensity] = useState<FillIntensity>("moderate");
  const [fillCategory, setFillCategory] = useState<FillCategory>("transition");
  const [fillQueued, setFillQueued] = useState(false);
  const [stepsUntilFill, setStepsUntilFill] = useState<number | null>(null);
  const [autoSwitchBars, setAutoSwitchBars] = useState(0);
  const [fillPreviewActive, setFillPreviewActive] = useState(false);

  // ---- Complexity state ----
  const [complexity, setComplexity] = useState<number>(5);
  // Store the "raw" base pattern before complexity is applied
  const basePatternRef = useRef<DrumPattern>(JSON.parse(JSON.stringify(PRESET_PATTERNS.rock.verse)));

  // ---- Swing & Humanize state ----
  const [humanizeSettings, setHumanizeSettings] = useState<HumanizeSettings>(DEFAULT_HUMANIZE);
  const humanizeRef = useRef<HumanizeSettings>(DEFAULT_HUMANIZE);

  // ---- Sound Variation state ----
  const [soundVariations, setSoundVariations] = useState<SelectedVariations>(getDefaultVariations());

  // Stored patterns for A/B variations
  const patternARef = useRef<DrumPattern>(editor.pattern);
  const patternBRef = useRef<DrumPattern | null>(null);
  const velocityARef = useRef<VelocityMap>(editor.velocity);
  const velocityBRef = useRef<VelocityMap | null>(null);
  const probabilityARef = useRef<ProbabilityMap>(editor.probability);
  const probabilityBRef = useRef<ProbabilityMap | null>(null);

  // Fill state refs
  const fillQueuedRef = useRef(false);
  const fillActiveRef = useRef(false);
  const previewingFillRef = useRef(false);
  const preFillPatternRef = useRef<DrumPattern | null>(null);
  const preFillVelocityRef = useRef<VelocityMap | null>(null);
  const preFillProbabilityRef = useRef<ProbabilityMap | null>(null);
  const fillPreviewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const preFillPreviewPatternRef = useRef<DrumPattern | null>(null);
  const preFillPreviewVelocityRef = useRef<VelocityMap | null>(null);
  const preFillPreviewProbabilityRef = useRef<ProbabilityMap | null>(null);
  const barCountRef = useRef(0);
  const autoSwitchBarsRef = useRef(0);
  const activeVariationRef = useRef<ActiveVariation>("A");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioInitRef = useRef(false);
  const stepRef = useRef(-1);
  const bpmRef = useRef(bpm);
  const patternRef = useRef(editor.pattern);
  const velocityRef = useRef(editor.velocity);
  const probabilityRef = useRef(editor.probability);
  const multiHitRef = useRef(editor.multiHit);
  const patternLengthRef = useRef(editor.patternLength);

  // Refs for virtual band and session recording (set after hooks init, used in callbacks)
  const virtualBandScheduleRef = useRef<((step: number, time: number) => void) | null>(null);
  const sessionRecordingRef = useRef<((step: number, bpmForStep: number) => void) | null>(null);

  // Keep refs in sync
  useEffect(() => {
    patternRef.current = editor.pattern;
    // Keep A pattern in sync when editing and variation A is active
    if (activeVariation === "A" && !fillActiveRef.current) {
      patternARef.current = editor.pattern;
    }
  }, [editor.pattern, activeVariation]);

  useEffect(() => {
    velocityRef.current = editor.velocity;
    if (activeVariation === "A" && !fillActiveRef.current) {
      velocityARef.current = editor.velocity;
    }
  }, [editor.velocity, activeVariation]);

  useEffect(() => {
    probabilityRef.current = editor.probability;
    if (activeVariation === "A" && !fillActiveRef.current) {
      probabilityARef.current = editor.probability;
    }
  }, [editor.probability, activeVariation]);

  useEffect(() => {
    multiHitRef.current = editor.multiHit;
  }, [editor.multiHit]);

  useEffect(() => {
    patternLengthRef.current = editor.patternLength;
  }, [editor.patternLength]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    humanizeRef.current = humanizeSettings;
  }, [humanizeSettings]);

  // Sync sound variations to audio engine
  useEffect(() => {
    for (const [instrumentId, variationId] of Object.entries(soundVariations)) {
      const params = getVariationParams(genre, instrumentId, variationId);
      setInstrumentVariation(instrumentId, params);
    }
  }, [soundVariations, genre]);

  useEffect(() => {
    fillQueuedRef.current = fillQueued;
  }, [fillQueued]);

  useEffect(() => {
    autoSwitchBarsRef.current = autoSwitchBars;
  }, [autoSwitchBars]);

  useEffect(() => {
    activeVariationRef.current = activeVariation;
  }, [activeVariation]);

  // Initialize history on mount
  useEffect(() => {
    editor.initHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track guest session time
  useEffect(() => {
    if (!isGuest || !guestSessionStart) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - guestSessionStart) / 1000);
      setGuestSessionTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isGuest, guestSessionStart]);

  // Keyboard shortcuts for undo/redo + fill trigger (spacebar handler added later after hooks)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        editor.undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        editor.redo();
      }
      // F key to trigger fill
      if (e.key === "f" || e.key === "F") {
        // Don't trigger when typing in inputs
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
        e.preventDefault();
        handleFillToggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, fillQueued, isPlaying]);

  // Initialize audio on first interaction
  const ensureAudio = useCallback(() => {
    if (!audioInitRef.current) {
      drumAudio.init();
      audioInitRef.current = true;

      // Initialize virtual band audio with the shared AudioContext
      if (!virtualBand.isInitialized) {
        const ctx = drumAudio.getAudioContext();
        if (ctx) {
          virtualBand.initAudio(ctx, ctx.destination);
        }
      }
    }

    // Always try to resume/unlock on user interaction (needed for iOS)
    drumAudio.resumeContext().catch(() => {
      // Silent catch - audioContextManager will handle state updates
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle audio unlock from the banner
  const handleAudioUnlock = useCallback(async (): Promise<boolean> => {
    ensureAudio();
    return audioCtx.unlock();
  }, [ensureAudio, audioCtx]);

  // ---- Fill Logic ----

  // Clear fill preview
  const clearFillPreview = useCallback(() => {
    if (fillPreviewTimeoutRef.current) {
      clearTimeout(fillPreviewTimeoutRef.current);
      fillPreviewTimeoutRef.current = null;
    }
    if (preFillPreviewPatternRef.current) {
      // Restore original pattern using loadPattern to update all state
      editor.loadPattern(
        preFillPreviewPatternRef.current,
        preFillPreviewVelocityRef.current || undefined,
        preFillPreviewProbabilityRef.current || undefined,
        editor.patternLength
      );
      preFillPreviewPatternRef.current = null;
      preFillPreviewVelocityRef.current = null;
      preFillPreviewProbabilityRef.current = null;
    }
    setFillPreviewActive(false);
  }, [editor]);

  const handleFillToggle = useCallback(() => {
    // If preview is active, cancel it
    if (fillPreviewActive) {
      clearFillPreview();
      toast.success("Fill preview turned off");
      return;
    }

    if (fillQueued) {
      // Cancel queued fill
      setFillQueued(false);
      fillQueuedRef.current = false;
      setStepsUntilFill(null);
      toast.success("Fill cancelled");
    } else {
      // If playing: queue fill for next bar boundary
      if (isPlaying) {
        setFillQueued(true);
        fillQueuedRef.current = true;
        const remaining = patternLengthRef.current - (stepRef.current + 1);
        setStepsUntilFill(remaining);
        toast.success("Fill queued for next bar");
      } else {
        // If stopped: show fill preview (persistent toggle)
        // Save current pattern
        preFillPreviewPatternRef.current = JSON.parse(JSON.stringify(editor.pattern));
        preFillPreviewVelocityRef.current = JSON.parse(JSON.stringify(editor.velocity));
        preFillPreviewProbabilityRef.current = JSON.parse(JSON.stringify(editor.probability));

        // Get fill pattern (category-aware)
        const useSmartFill = Math.random() > 0.5;
        let fillPattern: DrumPattern;

        if (useSmartFill) {
          fillPattern = generateSmartFill(editor.pattern, fillIntensity, editor.patternLength, fillCategory);
        } else {
          const fill = getRandomFillByCategory(genre, fillIntensity, fillCategory);
          fillPattern = JSON.parse(JSON.stringify(fill.pattern));
        }

        // Apply fill to visual display
        editor.setPattern(fillPattern);
        setFillPreviewActive(true);
        toast.success("Fill preview turned on (press F to toggle off)");
      }
    }
  }, [fillQueued, isPlaying, fillPreviewActive, fillIntensity, fillCategory, genre, editor, clearFillPreview]);

  // Trigger fill: swap to fill pattern
  const triggerFill = useCallback(() => {
    // Save current pattern to restore after fill
    preFillPatternRef.current = patternRef.current;
    preFillVelocityRef.current = velocityRef.current;
    preFillProbabilityRef.current = probabilityRef.current;

    // Get fill pattern (category-aware)
    const useSmartFill = Math.random() > 0.5;
    let fillPattern: DrumPattern;

    if (useSmartFill) {
      fillPattern = generateSmartFill(patternRef.current, fillIntensity, patternLengthRef.current, fillCategory);
    } else {
      const fill = getRandomFillByCategory(genre, fillIntensity, fillCategory);
      fillPattern = JSON.parse(JSON.stringify(fill.pattern));
    }

    // Apply fill to both playback ref AND visual editor (for visual feedback)
    patternRef.current = fillPattern;
    editor.setPattern(fillPattern); // Update visual display
    fillActiveRef.current = true;
    fillQueuedRef.current = false;
    setFillQueued(false);
    setStepsUntilFill(null);
    setActiveVariation("fill");
  }, [fillIntensity, fillCategory, genre, editor]);

  // End fill: restore previous pattern
  const endFill = useCallback(() => {
    if (preFillPatternRef.current) {
      patternRef.current = preFillPatternRef.current;
      velocityRef.current = preFillVelocityRef.current || velocityRef.current;
      probabilityRef.current = preFillProbabilityRef.current || probabilityRef.current;
      // Restore visual display too
      editor.setPattern(preFillPatternRef.current);
    }
    fillActiveRef.current = false;
    preFillPatternRef.current = null;
    preFillVelocityRef.current = null;
    preFillProbabilityRef.current = null;
    setActiveVariation(activeVariationRef.current === "fill" ? "A" : activeVariationRef.current);
  }, [editor]);

  // ---- Variation Logic ----

  const handleVariationChange = useCallback((variation: ActiveVariation) => {
    if (variation === "fill") {
      handleFillToggle();
      return;
    }

    // Switching between A and B
    if (variation === "A") {
      // Restore A pattern
      const patA = patternARef.current;
      editor.loadPattern(patA, velocityARef.current || undefined, probabilityARef.current || undefined);
      patternRef.current = patA;
      velocityRef.current = velocityARef.current || velocityRef.current;
      probabilityRef.current = probabilityARef.current || probabilityRef.current;
    } else if (variation === "B") {
      // Save current to A if coming from A
      if (activeVariation === "A") {
        patternARef.current = JSON.parse(JSON.stringify(editor.pattern));
        velocityARef.current = JSON.parse(JSON.stringify(editor.velocity));
        probabilityARef.current = JSON.parse(JSON.stringify(editor.probability));
      }

      // Generate B if it doesn't exist
      if (!patternBRef.current) {
        patternBRef.current = generateVariation(patternARef.current, editor.patternLength);
        velocityBRef.current = JSON.parse(JSON.stringify(velocityARef.current || editor.velocity));
        probabilityBRef.current = JSON.parse(JSON.stringify(probabilityARef.current || editor.probability));
      }

      editor.loadPattern(patternBRef.current, velocityBRef.current || undefined, probabilityBRef.current || undefined);
      patternRef.current = patternBRef.current;
      velocityRef.current = velocityBRef.current || velocityRef.current;
      probabilityRef.current = probabilityBRef.current || probabilityRef.current;
    }

    setActiveVariation(variation);
    activeVariationRef.current = variation;
  }, [activeVariation, editor, handleFillToggle]);

  // ---- Helper: apply complexity to a base pattern and load it ----
  const loadPatternWithComplexity = useCallback((rawPattern: DrumPattern, genreForComplexity: Genre, complexityLevel: number) => {
    if (complexityLevel === 5) {
      const p = JSON.parse(JSON.stringify(rawPattern));
      editor.loadPattern(p);
      patternRef.current = p;
      patternARef.current = p;
      return;
    }
    const { pattern: transformed, velocity, probability } = applyComplexity(
      rawPattern, complexityLevel, genreForComplexity, editor.patternLength
    );
    editor.loadPattern(transformed, velocity, probability, editor.patternLength);
    patternRef.current = transformed;
    patternARef.current = transformed;
  }, [editor]);

  // ---- Pattern Variation Dropdown ----
  const handleVariationSelect = useCallback((variant: PatternVariant) => {
    ensureAudio();
    const rawPattern = variant.pattern;
    basePatternRef.current = JSON.parse(JSON.stringify(rawPattern));
    loadPatternWithComplexity(rawPattern, genre, complexity);
    patternBRef.current = null;
    velocityBRef.current = null;
    probabilityBRef.current = null;
    setActiveVariation("A");
    activeVariationRef.current = "A";
    setSelectedVariationId(variant.id);
    setPatternVariantName(variant.name);
    editor.setIsEdited(false);
  }, [editor, ensureAudio, genre, complexity, loadPatternWithComplexity]);

  // ---- Genre change ----
  const handleGenreChange = useCallback((newGenre: Genre) => {
    // Cancel fill preview if active
    if (fillPreviewActive) {
      clearFillPreview();
    }

    setGenre(newGenre);
    setEmotion(null);
    setPatternVariantName(null);
    setSelectedVariationId(null);
    // Migrate sound variations to new genre (reset to defaults for missing IDs)
    setSoundVariations((prev) => migrateVariations(prev, newGenre));
    const baseBpm = GENRES[newGenre].defaultBpm;
    const bpmAdj = getComplexityBpmAdjustment(baseBpm, complexity, newGenre);
    setBpm(baseBpm + bpmAdj);
    const rawPattern = PRESET_PATTERNS[newGenre][songPart];
    basePatternRef.current = JSON.parse(JSON.stringify(rawPattern));
    loadPatternWithComplexity(rawPattern, newGenre, complexity);
    patternBRef.current = null; // Reset B variation
    velocityBRef.current = null;
    probabilityBRef.current = null;
    setActiveVariation("A");
    activeVariationRef.current = "A";
  }, [songPart, editor, fillPreviewActive, clearFillPreview, complexity, loadPatternWithComplexity]);

  // Song part change
  const handleSongPartChange = useCallback((newPart: SongPart) => {
    // Cancel fill preview if active
    if (fillPreviewActive) {
      clearFillPreview();
    }

    setSongPart(newPart);
    setEmotion(null);
    setPatternVariantName(null);
    setSelectedVariationId(null);
    const rawPattern = PRESET_PATTERNS[genre][newPart];
    basePatternRef.current = JSON.parse(JSON.stringify(rawPattern));
    loadPatternWithComplexity(rawPattern, genre, complexity);
    patternBRef.current = null;
    velocityBRef.current = null;
    probabilityBRef.current = null;
    setActiveVariation("A");
    activeVariationRef.current = "A";
  }, [genre, editor, fillPreviewActive, clearFillPreview, complexity, loadPatternWithComplexity]);

  // Emotion change
  const handleEmotionChange = useCallback((newEmotion: Emotion | null) => {
    // Cancel fill preview if active
    if (fillPreviewActive) {
      clearFillPreview();
    }

    setEmotion(newEmotion);
    setPatternVariantName(null);
    setSelectedVariationId(null);
    let rawPattern: DrumPattern;
    if (newEmotion) {
      const baseBpm = EMOTIONS[newEmotion].defaultBpm;
      const bpmAdj = getComplexityBpmAdjustment(baseBpm, complexity, genre);
      setBpm(baseBpm + bpmAdj);
      rawPattern = EMOTION_PATTERNS[newEmotion];
    } else {
      const baseBpm = GENRES[genre].defaultBpm;
      const bpmAdj = getComplexityBpmAdjustment(baseBpm, complexity, genre);
      setBpm(baseBpm + bpmAdj);
      rawPattern = PRESET_PATTERNS[genre][songPart];
    }
    basePatternRef.current = JSON.parse(JSON.stringify(rawPattern));
    loadPatternWithComplexity(rawPattern, genre, complexity);
    patternBRef.current = null;
    velocityBRef.current = null;
    probabilityBRef.current = null;
    setActiveVariation("A");
    activeVariationRef.current = "A";
  }, [genre, songPart, editor, fillPreviewActive, clearFillPreview, complexity, loadPatternWithComplexity]);

  // ---- Complexity change ----
  const handleComplexityChange = useCallback((newComplexity: number) => {
    // Cancel fill preview if active
    if (fillPreviewActive) {
      clearFillPreview();
    }

    setComplexity(newComplexity);

    // Re-apply complexity to the stored base pattern
    const rawPattern = basePatternRef.current;
    if (rawPattern) {
      if (newComplexity === 5) {
        const p = JSON.parse(JSON.stringify(rawPattern));
        editor.loadPattern(p);
        patternRef.current = p;
        patternARef.current = p;
      } else {
        const { pattern: transformed, velocity, probability } = applyComplexity(
          rawPattern, newComplexity, genre, editor.patternLength
        );
        editor.loadPattern(transformed, velocity, probability, editor.patternLength);
        patternRef.current = transformed;
        patternARef.current = transformed;
      }
      patternBRef.current = null;
      velocityBRef.current = null;
      probabilityBRef.current = null;
      setActiveVariation("A");
      activeVariationRef.current = "A";
    }

    // Adjust BPM based on complexity
    const baseBpm = emotion ? EMOTIONS[emotion].defaultBpm : GENRES[genre].defaultBpm;
    const bpmAdj = getComplexityBpmAdjustment(baseBpm, newComplexity, genre);
    setBpm(baseBpm + bpmAdj);
  }, [genre, emotion, editor, fillPreviewActive, clearFillPreview]);

  // Toggle a pad
  const handlePadClick = useCallback((instrumentId: string, step: number) => {
    // Cancel fill preview if active
    if (fillPreviewActive) {
      clearFillPreview();
    }

    ensureAudio();
    editor.pushHistory();
    editor.setPattern((prev: DrumPattern) => {
      const next = { ...prev };
      const steps = [...(next[instrumentId] || Array(editor.patternLength).fill(false))];
      steps[step] = !steps[step];
      next[instrumentId] = steps;
      patternRef.current = next;
      if (steps[step]) {
        drumAudio.playSound(instrumentId);
      }
      return next;
    });
    editor.setIsEdited(true);
    // Update the active variation's stored pattern
    if (activeVariation === "B") {
      patternBRef.current = patternRef.current;
    }
  }, [ensureAudio, editor, activeVariation, fillPreviewActive, clearFillPreview]);

  // Preview instrument sound
  const handleInstrumentPlay = useCallback((instrumentId: string) => {
    ensureAudio();
    drumAudio.playSound(instrumentId);
  }, [ensureAudio]);

  // Sound variation change handler
  const handleSoundVariationChange = useCallback((instrumentId: string, variationId: string) => {
    setSoundVariations((prev) => ({ ...prev, [instrumentId]: variationId }));
    // Immediately update the audio engine for this instrument
    const params = getVariationParams(genre, instrumentId, variationId);
    setInstrumentVariation(instrumentId, params);
    // Play preview of the new sound
    ensureAudio();
    drumAudio.playSound(instrumentId);
  }, [genre, ensureAudio]);

  // Preview a sound variation without changing the selection
  const handlePreviewSoundVariation = useCallback((instrumentId: string, variationId: string) => {
    ensureAudio();
    const params = getVariationParams(genre, instrumentId, variationId);
    drumAudio.playSoundWithVariation(instrumentId, params);
  }, [genre, ensureAudio]);

  // Play sounds for a step with velocity, probability, swing, humanization, and multi-hit
  const playSoundsForStep = useCallback((step: number, bpmForStep: number) => {
    const pat = patternRef.current;
    const vel = velocityRef.current;
    const prob = probabilityRef.current;
    const mh = multiHitRef.current;
    const h = humanizeRef.current;
    const stepIntervalMs = (60000 / bpmForStep) / 4;

    // Calculate swing offset (applies uniformly to all instruments on this step)
    const swingMs = getSwingOffsetMs(step, stepIntervalMs, h.swing);

    Object.keys(pat).forEach((instrumentId) => {
      if (pat[instrumentId]?.[step]) {
        const stepProb = prob[instrumentId]?.[step] ?? 100;
        if (stepProb < 100 && Math.random() * 100 > stepProb) {
          return;
        }
        let stepVel = vel[instrumentId]?.[step] ?? 100;

        // Apply velocity humanization
        stepVel = humanizeVelocity(stepVel, h.velocityHumanize);

        // Calculate per-instrument timing humanization (unique per hit)
        const timingMs = getTimingHumanizeOffsetMs(h.timingHumanize);

        // Multi-hit: schedule rapid-fire hits within the step
        const hits = mh[instrumentId]?.[step] ?? 1;
        const subStepMs = stepIntervalMs / hits;

        for (let hitIdx = 0; hitIdx < hits; hitIdx++) {
          const hitOffsetMs = hitIdx * subStepMs;
          const totalOffsetMs = swingMs + timingMs + hitOffsetMs;

          if (totalOffsetMs > 1) {
            // Schedule the sound slightly in the future
            const offsetSec = totalOffsetMs / 1000;
            const scheduleTime = drumAudio.getCurrentTime() + offsetSec;
            drumAudio.scheduleSound(instrumentId, scheduleTime, stepVel);
          } else {
            // No meaningful offset, play immediately
            drumAudio.playSound(instrumentId, stepVel);
          }
        }
      }
    });

    // Schedule virtual band notes for this step
    if (virtualBandScheduleRef.current) {
      virtualBandScheduleRef.current(step, drumAudio.getCurrentTime());
    }

    // Record event if recording is active
    if (sessionRecordingRef.current) {
      sessionRecordingRef.current(step, bpmForStep);
    }
  }, []);

  // ---- Step callback with fill/variation bar-boundary logic ----
  const advanceStep = useCallback(() => {
    const curLen = patternLengthRef.current;
    stepRef.current = (stepRef.current + 1) % curLen;
    const step = stepRef.current;
    setCurrentStep(step);

    // Bar boundary detection (step 0 = start of new bar)
    if (step === 0) {
      barCountRef.current += 1;

      // End fill if fill was active (fill lasts exactly one bar)
      if (fillActiveRef.current) {
        endFill();
      }

      // Check if fill is queued
      if (fillQueuedRef.current && !fillActiveRef.current) {
        triggerFill();
      }

      // Auto-switch A/B variation
      if (autoSwitchBarsRef.current > 0 && !fillActiveRef.current && !fillQueuedRef.current) {
        if (barCountRef.current % autoSwitchBarsRef.current === 0) {
          const nextVar = activeVariationRef.current === "A" ? "B" : "A";
          // Generate B on the fly if needed
          if (nextVar === "B" && !patternBRef.current) {
            patternBRef.current = generateVariation(patternARef.current, curLen);
            velocityBRef.current = JSON.parse(JSON.stringify(velocityARef.current));
            probabilityBRef.current = JSON.parse(JSON.stringify(probabilityARef.current));
          }
          if (nextVar === "A") {
            patternRef.current = patternARef.current;
            velocityRef.current = velocityARef.current;
            probabilityRef.current = probabilityARef.current;
          } else {
            patternRef.current = patternBRef.current!;
            velocityRef.current = velocityBRef.current || velocityRef.current;
            probabilityRef.current = probabilityBRef.current || probabilityRef.current;
          }
          activeVariationRef.current = nextVar;
          setActiveVariation(nextVar);
        }
      }
    }

    // Update steps until fill countdown
    if (fillQueuedRef.current && !fillActiveRef.current) {
      const remaining = curLen - step - 1;
      setStepsUntilFill(remaining <= 0 ? curLen : remaining);
    }

    playSoundsForStep(step, bpmRef.current);
  }, [playSoundsForStep, endFill, triggerFill]);

  // Play/Pause
  const handlePlay = useCallback(() => {
    ensureAudio();
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      barCountRef.current = 0;
      const interval = getStepInterval(bpm);
      const len = patternLengthRef.current;

      const nextStep = stepRef.current < 0 ? 0 : (stepRef.current + 1) % len;
      stepRef.current = nextStep;
      setCurrentStep(nextStep);

      // Check bar boundary on first step
      if (nextStep === 0) {
        if (fillQueuedRef.current && !fillActiveRef.current) {
          triggerFill();
        }
      }

      playSoundsForStep(nextStep, bpm);

      intervalRef.current = setInterval(() => {
        advanceStep();
      }, interval);
    }
  }, [isPlaying, bpm, ensureAudio, playSoundsForStep, advanceStep, triggerFill]);

  // Stop
  const handleStop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsPlaying(false);
    setCurrentStep(-1);
    stepRef.current = -1;

    // If fill was active, restore original pattern
    if (fillActiveRef.current) {
      endFill();
    }
    // Cancel queued fill
    setFillQueued(false);
    fillQueuedRef.current = false;
    setStepsUntilFill(null);
  }, [endFill]);

  // BPM change - restart if playing
  const handleBpmChange = useCallback((newBpm: number) => {
    setBpm(newBpm);
    if (isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current);
      const interval = getStepInterval(newBpm);
      intervalRef.current = setInterval(() => {
        advanceStep();
      }, interval);
    }
  }, [isPlaying, advanceStep]);

  // Reset pattern to preset
  const handleReset = useCallback(() => {
    let rawPattern: DrumPattern;
    if (emotion) {
      rawPattern = EMOTION_PATTERNS[emotion];
    } else {
      rawPattern = PRESET_PATTERNS[genre][songPart];
    }
    basePatternRef.current = JSON.parse(JSON.stringify(rawPattern));
    loadPatternWithComplexity(rawPattern, genre, complexity);
    patternBRef.current = null;
    velocityBRef.current = null;
    probabilityBRef.current = null;
    setPatternVariantName(null);
    setSelectedVariationId(null);
    setActiveVariation("A");
    activeVariationRef.current = "A";
    toast.success("Pattern reset to preset");
  }, [genre, songPart, emotion, editor, complexity, loadPatternWithComplexity]);

  // Shuffle: pick a random pattern from the expanded library
  const handleShuffle = useCallback(() => {
    ensureAudio();
    let rawPattern: DrumPattern;
    if (emotion) {
      const { pattern: p, bpm: newBpm, variant } = selectRandomEmotionPattern(emotion);
      const bpmAdj = getComplexityBpmAdjustment(newBpm, complexity, genre);
      setBpm(newBpm + bpmAdj);
      rawPattern = p;
      setPatternVariantName(variant.name);
      setSelectedVariationId(null);
      toast.success(`🎲 ${variant.name}`);
    } else {
      const { pattern: p, variant } = selectRandomPattern(genre, songPart);
      rawPattern = p;
      setPatternVariantName(variant.name);
      setSelectedVariationId(variant.id);
      toast.success(`🎲 ${variant.name}`);
    }
    basePatternRef.current = JSON.parse(JSON.stringify(rawPattern));
    loadPatternWithComplexity(rawPattern, genre, complexity);
    patternBRef.current = null;
    velocityBRef.current = null;
    probabilityBRef.current = null;
    setActiveVariation("A");
    activeVariationRef.current = "A";
  }, [genre, songPart, emotion, editor, ensureAudio, complexity, loadPatternWithComplexity]);

  // Handle pattern length change
  const handlePatternLengthChange = useCallback((newLength: PatternLength) => {
    editor.changePatternLength(newLength);
    if (stepRef.current >= newLength) {
      stepRef.current = 0;
      setCurrentStep(0);
    }
  }, [editor]);

  // Copy all steps
  const handleCopySection = useCallback(() => {
    editor.copySteps(0, editor.patternLength - 1);
    toast.success("Pattern copied to clipboard");
  }, [editor]);

  // Paste at step 0
  const handlePasteSection = useCallback(() => {
    editor.pasteSteps(0);
    toast.success("Pattern pasted");
  }, [editor]);

  // Auto Humanize handler
  const handleAutoHumanize = useCallback(() => {
    const result = editor.applyAutoHumanize(genre, bpm);
    if (result) {
      // Also apply recommended real-time humanize settings
      const newSettings: HumanizeSettings = {
        swing: Math.max(humanizeSettings.swing, result.recommendedSwing),
        timingHumanize: Math.max(humanizeSettings.timingHumanize, result.recommendedTimingHumanize),
        velocityHumanize: Math.max(humanizeSettings.velocityHumanize, result.recommendedVelocityHumanize),
      };
      setHumanizeSettings(newSettings);
      humanizeRef.current = newSettings;
      toast.success("Pattern humanized for " + genre.charAt(0).toUpperCase() + genre.slice(1));
    }
  }, [editor, genre, bpm, humanizeSettings]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (fillPreviewTimeoutRef.current) clearTimeout(fillPreviewTimeoutRef.current);
    };
  }, []);

  // ---- Song Mode ----
  const handleSongBlockChange = useCallback((block: SongBlock) => {
    // Load the block's pattern into the visual sequencer
    setGenre(block.genre);
    setSongPart(block.songPart);
    setEmotion(block.emotion);
    setBpm(block.bpm);
    setComplexity(block.complexity);
    editor.loadPattern(block.pattern, block.velocity, block.probability, block.patternLength);
    patternRef.current = block.pattern;
    patternARef.current = block.pattern;
  }, [editor]);

  const handleSongEnd = useCallback(() => {
    setCurrentStep(-1);
    stepRef.current = -1;
  }, []);

  const songMode = useSongMode({
    onBlockChange: handleSongBlockChange,
    onSongEnd: handleSongEnd,
  });

  // Style DNA hook
  const styleDNA = useStyleDNA({ isGuest });

  // Virtual band hook
  const virtualBand = useVirtualBand();

  // Session recording hook
  const sessionRecording = useSessionRecording();

  // Emotion intelligence hook
  const emotionIntel = useEmotionIntelligence({ isGuest });

  // Keep refs in sync for use in playSoundsForStep callback
  useEffect(() => {
    virtualBandScheduleRef.current = virtualBand.scheduleStep;
  }, [virtualBand.scheduleStep]);

  useEffect(() => {
    sessionRecordingRef.current = sessionRecording.recordingState === "recording"
      ? (step: number, bpmForStep: number) => {
          sessionRecording.addEvent({ type: "note_trigger", data: { step, bpm: bpmForStep } });
        }
      : null;
  }, [sessionRecording.recordingState, sessionRecording.addEvent]);

  // Regenerate virtual band patterns when drum pattern changes
  const virtualBandRegenerateRef = useRef(virtualBand.generatePatterns);
  useEffect(() => {
    virtualBandRegenerateRef.current = virtualBand.generatePatterns;
  }, [virtualBand.generatePatterns]);

  useEffect(() => {
    if (virtualBand.enabledCount > 0) {
      virtualBandRegenerateRef.current(editor.pattern, editor.patternLength);
    }
  }, [editor.pattern, editor.patternLength, virtualBand.enabledCount]);

  // ---- Style DNA: Evolve Pattern ----
  const handleStyleEvolve = useCallback(() => {
    ensureAudio();
    const currentRaw = basePatternRef.current;
    const evolved = styleDNA.evolveCurrentPattern(currentRaw, genre, editor.patternLength);
    basePatternRef.current = JSON.parse(JSON.stringify(evolved));
    loadPatternWithComplexity(evolved, genre, complexity);
    patternBRef.current = null;
    velocityBRef.current = null;
    probabilityBRef.current = null;
    setActiveVariation("A");
    activeVariationRef.current = "A";
    setPatternVariantName(null);
    setSelectedVariationId(null);
    editor.setIsEdited(false);
    toast.success(`Pattern evolved with ${styleDNA.activeStyleName}`);
  }, [genre, editor, ensureAudio, complexity, loadPatternWithComplexity, styleDNA]);

  // ---- Style DNA: Generate New Pattern ----
  const handleStyleGenerate = useCallback(() => {
    ensureAudio();
    const generated = styleDNA.generatePattern(genre, songPart, editor.patternLength);
    basePatternRef.current = JSON.parse(JSON.stringify(generated));
    loadPatternWithComplexity(generated, genre, complexity);
    patternBRef.current = null;
    velocityBRef.current = null;
    probabilityBRef.current = null;
    setActiveVariation("A");
    activeVariationRef.current = "A";
    setPatternVariantName(null);
    setSelectedVariationId(null);
    editor.setIsEdited(false);
    toast.success(`New pattern generated from ${styleDNA.activeStyleName}`);
  }, [genre, songPart, editor, ensureAudio, complexity, loadPatternWithComplexity, styleDNA]);

  // ---- Style DNA: Pattern Feedback ----
  const handleStyleFeedback = useCallback((liked: boolean) => {
    styleDNA.submitFeedback(editor.pattern, liked, genre, songPart, editor.patternLength);
    toast.success(liked ? "Pattern liked! Style DNA updated." : "Noted! Style DNA adjusted.");
  }, [styleDNA, editor.pattern, genre, songPart, editor.patternLength]);

  // ---- Emotion Intelligence: Update emotional arc for song mode ----
  useEffect(() => {
    if (sectionState.isOpen("songBuilder") && songMode.blocks.length > 0) {
      const parts = songMode.blocks.map((b: SongBlock) => b.songPart);
      emotionIntel.updateEmotionalArc(parts, emotion);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionState.isOpen, songMode.blocks, emotion, emotionIntel.updateEmotionalArc]);

  // ---- Emotion Intelligence: Analyze pattern when it changes ----
  useEffect(() => {
    emotionIntel.analyzePattern(
      editor.pattern,
      bpm,
      emotion,
      songPart,
      editor.patternLength,
      humanizeSettings.swing,
      genre
    );
  }, [editor.pattern, bpm, emotion, songPart, editor.patternLength, humanizeSettings.swing, genre, emotionIntel.analyzePattern]);

  // ---- Emotion Intelligence: Undo state for suggestions ----
  const suggestionUndoRef = useRef<{
    pattern: DrumPattern;
    label: string;
  } | null>(null);

  // ---- Emotion Intelligence: Apply arrangement suggestion ----
  const handleApplyArrangementSuggestion = useCallback((suggestion: ArrangementSuggestion) => {
    ensureAudio();
    // Save current state for undo
    suggestionUndoRef.current = {
      pattern: JSON.parse(JSON.stringify(editor.pattern)),
      label: suggestion.label,
    };
    const modified = emotionIntel.applyArrangementSuggestion(
      editor.pattern, suggestion, editor.patternLength,
      genre, songPart, emotion,
    );
    basePatternRef.current = JSON.parse(JSON.stringify(modified));
    loadPatternWithComplexity(modified, genre, complexity);
    patternBRef.current = null;
    velocityBRef.current = null;
    probabilityBRef.current = null;
    setActiveVariation("A");
    activeVariationRef.current = "A";
    setPatternVariantName(null);
    setSelectedVariationId(null);
    toast.success(`Applied: ${suggestion.label}`, {
      action: {
        label: "Undo",
        onClick: () => handleUndoArrangementSuggestion(),
      },
      duration: 5000,
    });
  }, [editor, ensureAudio, complexity, genre, songPart, emotion, loadPatternWithComplexity, emotionIntel]);

  // ---- Emotion Intelligence: Undo arrangement suggestion ----
  const handleUndoArrangementSuggestion = useCallback(() => {
    const undo = suggestionUndoRef.current;
    if (!undo) {
      toast.info("Nothing to undo");
      return;
    }
    basePatternRef.current = JSON.parse(JSON.stringify(undo.pattern));
    loadPatternWithComplexity(undo.pattern, genre, complexity);
    patternBRef.current = null;
    velocityBRef.current = null;
    probabilityBRef.current = null;
    setActiveVariation("A");
    activeVariationRef.current = "A";
    suggestionUndoRef.current = null;
    toast.success(`Undid: ${undo.label}`);
  }, [genre, complexity, loadPatternWithComplexity]);

  // ---- Emotion Intelligence: Refresh suggestions ----
  const handleRefreshSuggestions = useCallback(() => {
    emotionIntel.analyzePattern(
      editor.pattern,
      bpm,
      emotion,
      songPart,
      editor.patternLength,
      humanizeSettings.swing,
      genre
    );
    toast.success("Suggestions refreshed");
  }, [editor.pattern, bpm, emotion, songPart, editor.patternLength, humanizeSettings.swing, genre, emotionIntel]);

  // ---- Emotion Intelligence: Apply psychoacoustic hint ----
  const handleApplyPsychoacousticHint = useCallback((hint: PsychoacousticHint) => {
    if (hint.parameter === "bpm") {
      setBpm(hint.suggestedValue);
      bpmRef.current = hint.suggestedValue;
      toast.success(`BPM adjusted to ${hint.suggestedValue}`);
    } else if (hint.parameter === "swing") {
      setHumanizeSettings(prev => ({ ...prev, swing: hint.suggestedValue }));
      toast.success(`Swing set to ${hint.suggestedValue}%`);
    }
  }, []);

  // ---- Emotion Intelligence: Apply context recommendation ----
  const handleApplyContextRecommendation = useCallback(() => {
    const rec = emotionIntel.getActiveContextRecommendations();
    if (!rec) return;
    ensureAudio();
    // Apply recommended emotion
    handleEmotionChange(rec.emotion);
    // Override BPM with context recommendation
    setBpm(rec.bpm);
    bpmRef.current = rec.bpm;
    // Apply swing
    setHumanizeSettings(prev => ({ ...prev, swing: rec.swing }));
    // Apply complexity
    setComplexity(rec.complexity);
    toast.success(`Applied ${emotionIntel.activeContext} preset`);
  }, [emotionIntel, ensureAudio, handleEmotionChange]);

  const handleAddBlockToSong = useCallback(() => {
    songMode.addBlock(
      editor.pattern,
      editor.velocity,
      editor.probability,
      editor.patternLength,
      genre,
      songPart,
      emotion,
      bpm,
      complexity,
    );
    toast.success("Pattern added to song");
  }, [songMode, editor, genre, songPart, emotion, bpm, complexity]);

  const handleLoadBlockToSequencer = useCallback((block: SongBlock) => {
    handleStop();
    handleSongBlockChange(block);
    toast.success(`Loaded "${block.name}" into sequencer`);
  }, [handleStop, handleSongBlockChange]);

  const handlePlaySong = useCallback(() => {
    // Stop pattern mode playback first
    if (isPlaying) handleStop();
    ensureAudio();
    songMode.playSong();
  }, [isPlaying, handleStop, ensureAudio, songMode]);

  const handleStopSong = useCallback(() => {
    songMode.stopSong();
    setCurrentStep(-1);
    stepRef.current = -1;
  }, [songMode]);

  // ---- Spacebar keyboard shortcut for play/stop ----
  useEffect(() => {
    const handleSpacebarKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const isInputField = e.target instanceof HTMLInputElement ||
                          e.target instanceof HTMLTextAreaElement ||
                          e.target instanceof HTMLSelectElement;

      if (e.code === "Space" && !isInputField) {
        e.preventDefault();

        // Determine what's currently playing
        const songIsPlaying = songMode.songPlaying;
        const patternIsPlaying = isPlaying;

        // Stop whatever is playing, or start pattern if nothing is playing
        if (songIsPlaying) {
          handleStopSong();
        } else if (patternIsPlaying) {
          handleStop();
        } else {
          // Nothing playing - start pattern mode playback
          handlePlay();
        }
      }
    };
    window.addEventListener("keydown", handleSpacebarKeyDown);
    return () => window.removeEventListener("keydown", handleSpacebarKeyDown);
  }, [isPlaying, songMode.songPlaying, handlePlay, handleStop, handleStopSong]);

  const handleSaveSong = useCallback(async () => {
    if (songMode.blocks.length === 0) { toast.error("Add pattern blocks first"); return; }
    setShowSaveSongDialog(true);
  }, [songMode.blocks.length]);

  const handleSaveSongConfirm = async () => {
    if (!songMode.songName.trim()) { toast.error("Enter a song name"); return; }
    setIsSavingSong(true);
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: songMode.songName,
          blocks: songMode.blocks,
          loop: songMode.songLoop,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Song saved!");
      setShowSaveSongDialog(false);
    } catch {
      toast.error("Failed to save song");
    } finally {
      setIsSavingSong(false);
    }
  };

  const handleOpenLoadSong = async () => {
    try {
      const res = await fetch("/api/songs");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSavedSongs(data);
      setShowLoadSongDialog(true);
    } catch {
      toast.error("Failed to load songs list");
    }
  };

  const handleLoadSong = async (id: string) => {
    try {
      const res = await fetch(`/api/songs/${id}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      songMode.loadSong({
        name: data.name,
        blocks: data.blocks || [],
        loop: data.loop ?? false,
      });
      setShowLoadSongDialog(false);
      toast.success(`Loaded song "${data.name}"`);
    } catch {
      toast.error("Failed to load song");
    }
  };

  const handleDeleteSong = async (id: string) => {
    try {
      const res = await fetch(`/api/songs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setSavedSongs(prev => prev.filter(s => s.id !== id));
      toast.success("Song deleted");
    } catch {
      toast.error("Failed to delete song");
    }
  };

  const handleExportSongMidi = useCallback(() => {
    try {
      exportSongAsMidi(songMode.songName, songMode.blocks);
      toast.success("Song MIDI exported!");
    } catch (error) {
      console.error("Song MIDI export error:", error);
      toast.error("Failed to export song MIDI");
    }
  }, [songMode.songName, songMode.blocks]);

  // Save pattern (includes velocity, probability, length, and variations)
  const handleSave = async () => {
    if (!saveName.trim()) { toast.error("Please enter a name"); return; }
    setIsSaving(true);
    try {
      const extendedData = {
        steps: editor.pattern,
        velocity: editor.velocity,
        probability: editor.probability,
        multiHit: editor.multiHit,
        patternLength: editor.patternLength,
        complexity,
        humanize: humanizeSettings,
        variationB: patternBRef.current || undefined,
        variationBVelocity: velocityBRef.current || undefined,
        variationBProbability: probabilityBRef.current || undefined,
      };
      const res = await fetch("/api/patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: saveName,
          genre,
          songPart,
          emotion: emotion || undefined,
          bpm,
          pattern: extendedData,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Pattern saved!");
      setShowSaveDialog(false);
      setSaveName("");
      editor.setIsEdited(false);
    } catch {
      toast.error("Failed to save pattern");
    } finally {
      setIsSaving(false);
    }
  };

  // MIDI Export
  const [midiMultiTrack, setMidiMultiTrack] = useState(false);

  const handleMidiExport = useCallback(() => {
    try {
      exportPatternAsMidi({
        pattern: editor.pattern,
        velocity: editor.velocity,
        probability: editor.probability,
        patternLength: editor.patternLength,
        bpm,
        genre,
        songPart,
        emotion,
        multiTrack: midiMultiTrack,
      });
      toast.success("MIDI file exported!");
    } catch (error) {
      console.error("MIDI export error:", error);
      toast.error("Failed to export MIDI file");
    }
  }, [editor.pattern, editor.velocity, editor.probability, editor.patternLength, bpm, genre, songPart, emotion, midiMultiTrack]);

  // Load patterns list
  const handleOpenLoad = async () => {
    try {
      const res = await fetch("/api/patterns");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSavedPatterns(data);
      setShowLoadDialog(true);
    } catch {
      toast.error("Failed to load patterns");
    }
  };

  // Load a specific pattern
  const handleLoadPattern = async (id: string) => {
    try {
      const res = await fetch(`/api/patterns/${id}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      handleStop();
      setGenre(data.genre as Genre);
      setSongPart(data.songPart as SongPart);
      setEmotion((data.emotion as Emotion) || null);
      setBpm(data.bpm);

      const patternData = data.pattern;
      // Restore complexity if saved
      if (patternData && typeof patternData.complexity === "number") {
        setComplexity(patternData.complexity);
      }
      // Restore humanize settings if saved
      if (patternData && patternData.humanize) {
        setHumanizeSettings(patternData.humanize);
      } else {
        setHumanizeSettings(DEFAULT_HUMANIZE);
      }
      if (patternData && patternData.steps) {
        editor.loadPattern(
          patternData.steps,
          patternData.velocity,
          patternData.probability,
          patternData.patternLength,
          patternData.multiHit
        );
        patternRef.current = patternData.steps;
        patternARef.current = patternData.steps;
        basePatternRef.current = JSON.parse(JSON.stringify(patternData.steps));

        // Restore B variation if saved
        if (patternData.variationB) {
          patternBRef.current = patternData.variationB;
          velocityBRef.current = patternData.variationBVelocity || null;
          probabilityBRef.current = patternData.variationBProbability || null;
        } else {
          patternBRef.current = null;
          velocityBRef.current = null;
          probabilityBRef.current = null;
        }
      } else {
        const loadedPattern = patternData as DrumPattern;
        editor.loadPattern(loadedPattern);
        patternRef.current = loadedPattern;
        patternARef.current = loadedPattern;
        patternBRef.current = null;
        velocityBRef.current = null;
        probabilityBRef.current = null;
      }

      setActiveVariation("A");
      activeVariationRef.current = "A";
      setShowLoadDialog(false);
      toast.success(`Loaded "${data.name}"`);
    } catch {
      toast.error("Failed to load pattern");
    }
  };

  // Delete a saved pattern
  const handleDeletePattern = async (id: string) => {
    try {
      const res = await fetch(`/api/patterns/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setSavedPatterns((prev) => prev.filter((p) => p.id !== id));
      toast.success("Pattern deleted");
    } catch {
      toast.error("Failed to delete pattern");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: tc.bodyBg }}>
      {/* Top bar */}
      <div className="max-w-6xl mx-auto mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${tc.accentOrange}, ${tc.stepBorder})` }}>
            <Disc3 className="w-5 h-5" style={{ color: tc.bodyBg }} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider" style={{ fontFamily: "'Courier New', monospace", color: tc.textPrimary }}>
              BEATFORGE 808
            </h1>
            <p className="text-[0.5rem] tracking-[0.2em] uppercase" style={{ color: tc.textMuted }}>Rhythm Computer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSelector />
          <div className="flex items-center gap-2 mr-2 text-xs" style={{ color: tc.textMuted }}>
            <User className="w-3.5 h-3.5" />
            <span className="font-mono hidden sm:inline">{session?.user?.name || session?.user?.email}</span>
          </div>
          {session?.user?.isAdmin && (
            <Link href="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-mono"
                style={{ color: tc.accentOrange }}
              >
                <Shield className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">ADMIN</span>
              </Button>
            </Link>
          )}
          <Link href="/settings">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-mono"
              style={{ color: tc.textMuted }}
            >
              <Settings className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">SESSIONS</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs font-mono"
            style={{ color: tc.textMuted }}
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">LOGOUT</span>
          </Button>
        </div>
      </div>

      {/* Guest Mode Banner */}
      {isGuest && (
        <div className="max-w-6xl mx-auto mb-4 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ backgroundColor: tc.guestBannerBg, border: `1px solid ${tc.guestBannerBorder}` }}>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: tc.accentOrange }} />
            <div className="text-sm font-mono">
              <p className="font-bold" style={{ color: tc.accentOrange }}>GUEST MODE</p>
              <p className="text-xs" style={{ color: tc.textMuted }}>Session time: {Math.floor(guestSessionTime / 60)}m {guestSessionTime % 60}s</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-mono" style={{ color: tc.textMuted }}>Save & load disabled in guest mode</p>
            <Link href="/login">
              <Button size="sm" className="text-white font-mono text-xs tracking-wider" style={{ backgroundColor: tc.accentOrange }}>
                SIGN IN
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Guest Signup Prompt (appears after 5 minutes) */}
      {isGuest && <GuestSignupBanner guestSessionStart={guestSessionStart ?? null} />}

      {/* Audio Unlock Banner (iOS silent mode / suspended context) */}
      {audioCtx.needsAttention && (
        <div className="max-w-6xl mx-auto mb-4">
          <AudioUnlockBanner
            state={audioCtx.state}
            issue={audioCtx.issue}
            isIOS={audioCtx.isIOS}
            needsAttention={audioCtx.needsAttention}
            onUnlock={handleAudioUnlock}
            onDismiss={audioCtx.dismiss}
          />
        </div>
      )}

      {/* Main Machine Panel */}
      <div className="max-w-6xl mx-auto vintage-panel rounded-2xl p-3 md:p-5 space-y-3" data-tour="drum-machine">
        {/* Machine Header - compact */}
        <div className="flex items-center justify-between pb-2" style={{ borderBottom: `1px solid ${tc.panelBorder}` }}>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="vintage-display inline-block px-3 py-1 rounded">
              <span className="text-xs font-mono font-bold tracking-wider">
                {emotion
                  ? `${EMOTIONS[emotion].icon} ${EMOTIONS[emotion].name.toUpperCase()} MOOD`
                  : `${GENRES[genre].name.toUpperCase()} — ${songPart.toUpperCase()}`
                }
              </span>
            </div>
            {patternVariantName && !editor.isEdited && (
              <span className="text-[0.55rem] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: `${tc.accentBlue}15`, color: tc.accentBlue, border: `1px solid ${tc.accentBlue}30` }}>
                {patternVariantName.toUpperCase()}
              </span>
            )}
            {editor.isEdited && (
              <span className="text-[0.55rem] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: `${tc.accentOrange}15`, color: tc.accentOrange, border: `1px solid ${tc.accentOrange}30` }}>
                EDITED
              </span>
            )}
            <span className={`text-[0.55rem] font-mono px-1.5 py-0.5 rounded border ${
              activeVariation === "fill" ? "animate-pulse" : ""
            }`} style={{
              backgroundColor: activeVariation === "fill" ? `${tc.accentOrange}20` : activeVariation === "B" ? `${tc.accentBlue}15` : `${tc.accentGreen}15`,
              color: activeVariation === "fill" ? tc.accentOrange : activeVariation === "B" ? tc.accentBlue : tc.accentGreen,
              borderColor: activeVariation === "fill" ? `${tc.accentOrange}66` : activeVariation === "B" ? `${tc.accentBlue}4D` : `${tc.accentGreen}4D`,
            }}>
              {activeVariation === "fill" ? "FILL" : `VAR ${activeVariation}`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleShuffle} className="text-xs font-mono h-7 px-2" style={{ color: tc.accentBlue }}
              title={`Shuffle pattern (${emotion ? '5' : getPartPatternCount(genre, songPart)} variations)`}>
              <Shuffle className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">SHUFFLE</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs font-mono h-7 px-2" style={{ color: tc.textMuted }} title="Reset to preset">
              <RotateCcw className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">RESET</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setSaveName(emotion ? `${EMOTIONS[emotion].name} ${GENRES[genre].name} ${songPart}` : `${GENRES[genre].name} ${songPart}`); setShowSaveDialog(true); }}
              disabled={isGuest} className="text-xs font-mono h-7 px-2" style={{ color: isGuest ? tc.mutedBorder : tc.textMuted }}
              data-tour="save-button" title={isGuest ? "Save disabled in guest mode" : "Save pattern"}>
              <Save className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">SAVE</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleOpenLoad} disabled={isGuest} className="text-xs font-mono h-7 px-2"
              style={{ color: isGuest ? tc.mutedBorder : tc.textMuted }} data-tour="load-button" title={isGuest ? "Load disabled in guest mode" : "Load pattern"}>
              <FolderOpen className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">LOAD</span>
            </Button>
            <div className="relative group">
              <Button variant="ghost" size="sm" onClick={handleMidiExport} className="text-xs font-mono h-7 px-2" style={{ color: tc.textMuted }} title="Export pattern as MIDI file">
                <Download className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">MIDI</span>
              </Button>
              <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover:block">
                <div className="rounded-md p-2 shadow-lg min-w-[160px]" style={{ backgroundColor: tc.panelBg, border: `1px solid ${tc.panelBorder}` }}>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono" style={{ color: tc.textMuted }}>
                    <input type="checkbox" checked={midiMultiTrack} onChange={(e) => setMidiMultiTrack(e.target.checked)} className="w-3 h-3" style={{ accentColor: tc.accentOrange }} />
                    Multi-track
                  </label>
                  <p className="text-[10px] mt-1 font-mono" style={{ color: tc.mutedBorder }}>
                    {midiMultiTrack ? "One track per instrument" : "All instruments on one track"}
                  </p>
                </div>
              </div>
            </div>
            {/* Collapse/Expand all sections + Tutorial */}
            <div className="ml-1 flex items-center border-l pl-1" style={{ borderColor: tc.panelBorder }}>
              <Button variant="ghost" size="sm" onClick={sectionState.collapseAll} className="h-7 w-7 p-0" style={{ color: tc.textMuted }} title="Collapse all sections">
                <Minimize2 className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={sectionState.expandAll} className="h-7 w-7 p-0" style={{ color: tc.textMuted }} title="Expand all sections">
                <Maximize2 className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { if (typeof window !== "undefined") window.dispatchEvent(new Event("tour-open-selector")); }}
                className="h-7 px-2 text-xs font-mono" style={{ color: tc.accentOrange }} title="Open tutorial guide">
                <GraduationCap className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">TUTORIAL</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Genre + Song Part Selectors - always visible */}
        <div className="grid md:grid-cols-2 gap-3">
          <GenreSelector selectedGenre={genre} onGenreChange={handleGenreChange} />
          <SongPartSelector selectedPart={songPart} onPartChange={handleSongPartChange} />
        </div>

        {/* Pattern Variation Dropdown - always visible */}
        {!emotion && (
          <PatternVariationSelector
            genre={genre}
            songPart={songPart}
            selectedVariationId={selectedVariationId}
            onVariationSelect={handleVariationSelect}
          />
        )}

        {/* === SONG BUILDER SECTION === */}
        <CollapsibleSection
          title="Song Builder"
          icon={<Layers className="w-3.5 h-3.5" />}
          isOpen={sectionState.isOpen("songBuilder")}
          onToggle={() => sectionState.toggle("songBuilder")}
          tc={tc}
          badge={
            <>
              {songMode.blocks.length > 0 && (
                <span className="text-[0.55rem] font-mono px-1.5 py-0.5 rounded ml-1" style={{ backgroundColor: `${tc.accentOrange}15`, color: tc.accentOrange, border: `1px solid ${tc.accentOrange}4D` }}>
                  {songMode.blocks.length} block{songMode.blocks.length !== 1 ? "s" : ""}
                </span>
              )}
              {songMode.songPlaying && (
                <span className="text-[0.55rem] font-mono px-1.5 py-0.5 rounded ml-1 animate-pulse" style={{ backgroundColor: `${tc.accentGreen}15`, color: tc.accentGreen, border: `1px solid ${tc.accentGreen}4D` }}>
                  PLAYING
                </span>
              )}
            </>
          }
        >
          <SongModePanel
            blocks={songMode.blocks}
            songName={songMode.songName}
            onSongNameChange={songMode.setSongName}
            songLoop={songMode.songLoop}
            onSongLoopChange={songMode.setSongLoop}
            songPlaying={songMode.songPlaying}
            currentBlockIndex={songMode.currentBlockIndex}
            currentRepeat={songMode.currentRepeat}
            songStep={songMode.songStep}
            fillActiveForBlock={songMode.fillActiveForBlock}
            onAddBlock={handleAddBlockToSong}
            onRemoveBlock={songMode.removeBlock}
            onMoveBlock={songMode.moveBlock}
            onDuplicateBlock={songMode.duplicateBlock}
            onSetBlockRepeats={songMode.setBlockRepeats}
            onSetBlockFillSettings={songMode.setBlockFillSettings}
            onClearSong={songMode.clearSong}
            onPlaySong={handlePlaySong}
            onStopSong={handleStopSong}
            onLoadBlockToSequencer={handleLoadBlockToSequencer}
            onSaveSong={handleSaveSong}
            onLoadSong={handleOpenLoadSong}
            onExportSongMidi={handleExportSongMidi}
            getTotalDuration={songMode.getTotalDuration}
            isGuest={isGuest}
          />
          {/* Emotional Arc Timeline (visible when song mode has blocks) */}
          {emotionIntel.emotionalArc.length > 0 && (
            <div className="mt-2">
              <EmotionalArcTimeline arcPoints={emotionIntel.emotionalArc} />
            </div>
          )}
        </CollapsibleSection>

        {/* === EMOTION & MOOD SECTION === */}
        <CollapsibleSection
          title="Emotion & Mood"
          icon={<Sparkles className="w-3.5 h-3.5" />}
          isOpen={sectionState.isOpen("emotionControls")}
          onToggle={() => sectionState.toggle("emotionControls")}
          tc={tc}
          badge={emotion ? (
            <span className="text-[0.55rem] font-mono px-1.5 py-0.5 rounded ml-1" style={{ backgroundColor: `${tc.accentOrange}15`, color: tc.accentOrange, border: `1px solid ${tc.accentOrange}4D` }}>
              {EMOTIONS[emotion].icon} {EMOTIONS[emotion].name.toUpperCase()}
            </span>
          ) : undefined}
        >
          <EmotionSelector
            selectedEmotion={emotion}
            onEmotionChange={handleEmotionChange}
            intensity={emotionIntel.intensity}
            onIntensityChange={emotionIntel.setIntensity}
          />
          {emotion && (
            <div className="mt-2">
              <EmotionImpactMeter
                profile={emotionIntel.profile}
                impactScore={emotionIntel.impactScore}
                psychoacousticHints={emotionIntel.psychoacousticHints}
                onApplyHint={handleApplyPsychoacousticHint}
              />
            </div>
          )}
          <div className="mt-2">
            <ArrangementSuggestionsPanel
              suggestions={emotionIntel.suggestions}
              activeContext={emotionIntel.activeContext}
              lastAppliedSuggestion={emotionIntel.lastAppliedSuggestion}
              profile={emotionIntel.profile}
              genre={genre}
              songPart={songPart}
              suggestionHistory={emotionIntel.suggestionHistory}
              suggestionsAppliedCount={emotionIntel.suggestionsAppliedCount}
              onApplySuggestion={handleApplyArrangementSuggestion}
              onUndoSuggestion={handleUndoArrangementSuggestion}
              onSetContext={emotionIntel.setContext}
              onApplyContext={handleApplyContextRecommendation}
              onRefreshSuggestions={handleRefreshSuggestions}
            />
          </div>
        </CollapsibleSection>

        {/* === STYLE DNA SECTION === */}
        <CollapsibleSection
          title="Style DNA"
          icon={<Radio className="w-3.5 h-3.5" />}
          isOpen={sectionState.isOpen("styleDna")}
          onToggle={() => sectionState.toggle("styleDna")}
          tc={tc}
          badge={styleDNA.selectedArtist ? (
            <span className="text-[0.55rem] font-mono px-1.5 py-0.5 rounded ml-1" style={{ backgroundColor: `${tc.accentBlue}15`, color: tc.accentBlue, border: `1px solid ${tc.accentBlue}4D` }}>
              {styleDNA.selectedArtist.name.toUpperCase()}
            </span>
          ) : undefined}
        >
          <StyleDNAPanel
            selectedArtist={styleDNA.selectedArtist}
            onSelectArtist={styleDNA.selectArtist}
            activeFingerprint={styleDNA.activeFingerprint}
            feedbackCount={styleDNA.feedbackCount}
            lastFeedback={styleDNA.lastFeedback}
            isFeedbackLoading={styleDNA.isFeedbackLoading}
            onEvolvePattern={handleStyleEvolve}
            onGeneratePattern={handleStyleGenerate}
            onFeedback={handleStyleFeedback}
            isGuest={isGuest}
          />
        </CollapsibleSection>

        {/* === SOUND SHAPING (Complexity + Swing/Humanize) === */}
        <CollapsibleSection
          title="Sound Shaping"
          icon={<Sliders className="w-3.5 h-3.5" />}
          isOpen={sectionState.isOpen("soundShaping")}
          onToggle={() => sectionState.toggle("soundShaping")}
          tc={tc}
          compact
          badge={
            <span className="text-[0.55rem] font-mono px-1.5 py-0.5 rounded ml-1" style={{ color: tc.textMuted }}>
              C:{complexity} S:{humanizeSettings.swing}%
            </span>
          }
        >
          <div className="space-y-2">
            <ComplexitySlider complexity={complexity} onComplexityChange={handleComplexityChange} />
            <SwingHumanizeControls settings={humanizeSettings} onSettingsChange={setHumanizeSettings} />
          </div>
        </CollapsibleSection>

        {/* === VIRTUAL BAND === */}
        <CollapsibleSection
          title="Virtual Band"
          icon={<Piano className="w-3.5 h-3.5" />}
          isOpen={sectionState.isOpen("virtualBand")}
          onToggle={() => sectionState.toggle("virtualBand")}
          tc={tc}
          badge={virtualBand.enabledCount > 0 ? (
            <span className="text-[0.55rem] font-mono px-1.5 py-0.5 rounded ml-1" style={{ backgroundColor: `${tc.accentGreen}15`, color: tc.accentGreen, border: `1px solid ${tc.accentGreen}4D` }}>
              {virtualBand.enabledCount} ACTIVE
            </span>
          ) : undefined}
        >
          <VirtualBandPanel
            members={virtualBand.members}
            enabledCount={virtualBand.enabledCount}
            onToggle={virtualBand.toggleMember}
            onVolumeChange={virtualBand.setMemberVolume}
            onKeyChange={virtualBand.setMemberKey}
            onScaleChange={virtualBand.setMemberScale}
            onIntelligenceChange={virtualBand.setMemberIntelligence}
            onOctaveChange={virtualBand.setMemberOctave}
            onFollowIntensityChange={virtualBand.setFollowIntensity}
            onRegenerateAll={() => virtualBand.generatePatterns(editor.pattern, editor.patternLength)}
          />
        </CollapsibleSection>

        {/* === SESSION RECORDING === */}
        {!isGuest && (
          <CollapsibleSection
            title="Session Recording"
            icon={<Mic className="w-3.5 h-3.5" />}
            isOpen={sectionState.isOpen("sessionRecording")}
            onToggle={() => sectionState.toggle("sessionRecording")}
            tc={tc}
            badge={sessionRecording.recordingState !== "idle" ? (
              <span className="text-[0.55rem] font-mono px-1.5 py-0.5 rounded ml-1 animate-pulse" style={{ backgroundColor: `${tc.accentRed}15`, color: tc.accentRed, border: `1px solid ${tc.accentRed}4D` }}>
                REC
              </span>
            ) : undefined}
          >
            <SessionRecordingPanel
              recordingState={sessionRecording.recordingState}
              duration={sessionRecording.duration}
              eventCount={sessionRecording.eventCount}
              playbackState={sessionRecording.playbackState}
              savedRecordings={sessionRecording.savedRecordings}
              formatDuration={sessionRecording.formatDuration}
              onStartRecording={sessionRecording.startRecording}
              onPauseRecording={sessionRecording.pauseRecording}
              onResumeRecording={sessionRecording.resumeRecording}
              onStopRecording={sessionRecording.stopRecording}
              onResetRecording={sessionRecording.resetRecording}
              onSaveRecording={(name: string) => {
                const recording = sessionRecording.exportRecording(
                  "local",
                  name,
                  bpm,
                  genre,
                  songPart,
                  editor.pattern,
                  []
                );
                sessionRecording.saveRecording(recording);
                toast.success("Recording saved!");
              }}
              onLoadRecording={(recording: SessionRecording) => {
                sessionRecording.loadForPlayback(recording);
                toast.success("Recording loaded for playback");
              }}
              onStartPlayback={sessionRecording.startPlayback}
              onPausePlayback={sessionRecording.pausePlayback}
              onStopPlayback={sessionRecording.stopPlayback}
            />
          </CollapsibleSection>
        )}

        {/* Transport + Dancing Character - always visible */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <TransportControls
              isPlaying={isPlaying}
              bpm={bpm}
              onPlay={handlePlay}
              onStop={handleStop}
              onBpmChange={handleBpmChange}
              fillQueued={fillQueued}
              fillActive={activeVariation === "fill"}
              fillCategory={fillCategory}
              onFillTrigger={handleFillToggle}
              stepsUntilFill={stepsUntilFill}
              audioIssue={audioCtx.issue}
              onAudioUnlock={handleAudioUnlock}
            />
          </div>
          <DancingCharacter
            isPlaying={isPlaying}
            bpm={bpm}
            currentStep={currentStep}
            genre={genre}
          />
        </div>

        {/* Fill & Variation Controls */}
        <CollapsibleSection
          title="Fill & Variation"
          icon={<Shuffle className="w-3.5 h-3.5" />}
          isOpen={sectionState.isOpen("fillVariation")}
          onToggle={() => sectionState.toggle("fillVariation")}
          tc={tc}
          compact
        >
          <VariationControls
            activeVariation={activeVariation}
            onVariationChange={handleVariationChange}
            fillIntensity={fillIntensity}
            onFillIntensityChange={setFillIntensity}
            fillCategory={fillCategory}
            onFillCategoryChange={setFillCategory}
            fillQueued={fillQueued}
            onQueueFill={() => { setFillQueued(true); fillQueuedRef.current = true; toast.success("Fill queued"); }}
            onCancelFill={() => { setFillQueued(false); fillQueuedRef.current = false; setStepsUntilFill(null); toast.success("Fill cancelled"); }}
            stepsUntilFill={stepsUntilFill}
            autoSwitchBars={autoSwitchBars}
            onAutoSwitchBarsChange={setAutoSwitchBars}
            isPlaying={isPlaying}
          />
        </CollapsibleSection>

        {/* Pattern Editor Toolbar - always visible */}
        <PatternEditorToolbar
          editorMode={editor.editorMode}
          onEditorModeChange={editor.setEditorMode}
          patternLength={editor.patternLength}
          onPatternLengthChange={handlePatternLengthChange}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          onUndo={editor.undo}
          onRedo={editor.redo}
          onCopySection={handleCopySection}
          onPasteSection={handlePasteSection}
          hasClipboard={editor.clipboard !== null}
          onClearAll={editor.clearAll}
          isEdited={editor.isEdited}
          isHumanized={editor.isHumanized}
          onAutoHumanize={handleAutoHumanize}
        />

        {/* Pattern Grid - always visible */}
        <div className="overflow-x-auto">
          <div style={{ minWidth: editor.patternLength > 16 ? `${editor.patternLength * 40}px` : "600px" }}>
            <PatternGrid
              pattern={editor.pattern}
              velocity={editor.velocity}
              probability={editor.probability}
              multiHit={editor.multiHit}
              patternLength={editor.patternLength}
              currentStep={currentStep}
              isPlaying={isPlaying}
              editorMode={editor.editorMode}
              onPadClick={handlePadClick}
              onInstrumentPlay={handleInstrumentPlay}
              onVelocityChange={editor.setStepVelocity}
              onProbabilityChange={editor.setStepProbability}
              onMultiHitChange={editor.setStepMultiHit}
              onClearTrack={editor.clearTrack}
              fillPreviewActive={fillPreviewActive}
              genre={genre}
              soundVariations={soundVariations}
              onSoundVariationChange={handleSoundVariationChange}
              onPreviewSoundVariation={handlePreviewSoundVariation}
            />
          </div>
        </div>

        {/* XY Kaoss Pad - collapsible */}
        <CollapsibleSection
          title="XY Kaoss Pad"
          icon={<Gamepad2 className="w-3.5 h-3.5" />}
          isOpen={sectionState.isOpen("xyPad")}
          onToggle={() => sectionState.toggle("xyPad")}
          tc={tc}
          compact
        >
          <XYPad bpm={bpm} />
        </CollapsibleSection>

        {/* Effects Rack - 3-slot effects chain */}
        <CollapsibleSection
          title="Effects Rack"
          icon={<AudioLines className="w-3.5 h-3.5" />}
          isOpen={sectionState.isOpen("effectsRack")}
          onToggle={() => sectionState.toggle("effectsRack")}
          tc={tc}
          compact
        >
          <EffectsRackPanel tc={tc} />
        </CollapsibleSection>

        {/* Machine Footer - compact */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${tc.panelBorder}` }}>
          <div className="flex items-center gap-2">
            <div className="vintage-led green" />
            <span className="vintage-label">POWER ON</span>
          </div>
          <span className="vintage-label">{editor.patternLength}-STEP SEQUENCER</span>
          <span className="vintage-label">&copy; BEATFORGE</span>
        </div>
      </div>

      {/* Save Song Dialog */}
      <Dialog open={showSaveSongDialog} onOpenChange={setShowSaveSongDialog}>
        <DialogContent style={{ backgroundColor: tc.panelBg, borderColor: tc.panelBorder, color: tc.textPrimary }}>
          <DialogHeader>
            <DialogTitle className="font-mono tracking-wider" style={{ color: tc.stepBorder }}>SAVE SONG</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="font-mono text-xs" style={{ color: tc.stepBorder }}>SONG NAME</Label>
              <Input
                value={songMode.songName}
                onChange={(e) => songMode.setSongName(e.target.value)}
                placeholder="My song"
                style={{ backgroundColor: tc.bodyBg, borderColor: tc.panelBorder, color: tc.textPrimary }}
              />
            </div>
            <div className="flex gap-4 text-xs font-mono flex-wrap" style={{ color: tc.textMuted }}>
              <span>{songMode.blocks.length} pattern block{songMode.blocks.length !== 1 ? "s" : ""}</span>
              <span>Loop: {songMode.songLoop ? "ON" : "OFF"}</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowSaveSongDialog(false)}
              style={{ color: tc.textMuted }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSongConfirm}
              disabled={isSavingSong || !songMode.songName.trim()}
              className="text-white font-mono"
              style={{ backgroundColor: tc.accentOrange }}
            >
              {isSavingSong ? "Saving..." : "Save Song"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Song Dialog */}
      <Dialog open={showLoadSongDialog} onOpenChange={setShowLoadSongDialog}>
        <DialogContent className="max-h-[70vh] overflow-y-auto" style={{ backgroundColor: tc.panelBg, borderColor: tc.panelBorder, color: tc.textPrimary }}>
          <DialogHeader>
            <DialogTitle className="font-mono tracking-wider" style={{ color: tc.stepBorder }}>LOAD SONG</DialogTitle>
          </DialogHeader>
          {savedSongs.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: tc.textMuted }}>No saved songs yet</p>
          ) : (
            <div className="space-y-2">
              {savedSongs.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-lg transition-colors"
                  style={{ backgroundColor: tc.bodyBg, border: `1px solid ${tc.panelBorder}` }}
                >
                  <div className="flex-1 cursor-pointer" onClick={() => handleLoadSong(s.id)}>
                    <div className="text-sm font-mono" style={{ color: tc.stepBorder }}>{s.name}</div>
                    <div className="text-[0.65rem] font-mono" style={{ color: tc.textMuted }}>
                      {s.blockCount} block{s.blockCount !== 1 ? "s" : ""} &middot; {s.loop ? "Loop ON" : "Loop OFF"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleDeleteSong(s.id); }}
                    className="text-xs"
                    style={{ color: tc.accentRed }}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent style={{ backgroundColor: tc.panelBg, borderColor: tc.panelBorder, color: tc.textPrimary }}>
          <DialogHeader>
            <DialogTitle className="font-mono tracking-wider" style={{ color: tc.stepBorder }}>SAVE PATTERN</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="font-mono text-xs" style={{ color: tc.stepBorder }}>NAME</Label>
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="My pattern"
                style={{ backgroundColor: tc.bodyBg, borderColor: tc.panelBorder, color: tc.textPrimary }}
              />
            </div>
            <div className="flex gap-4 text-xs font-mono flex-wrap" style={{ color: tc.textMuted }}>
              <span>Genre: {GENRES[genre].name}</span>
              <span>Part: {songPart}</span>
              {emotion && <span>Mood: {EMOTIONS[emotion].icon} {EMOTIONS[emotion].name}</span>}
              <span>BPM: {bpm}</span>
              <span>Complexity: {complexity}/10</span>
              <span>Length: {editor.patternLength} steps</span>
              {(humanizeSettings.swing > 0 || humanizeSettings.timingHumanize > 0 || humanizeSettings.velocityHumanize > 0) && (
                <span>Swing: {humanizeSettings.swing}%</span>
              )}
              {patternBRef.current && <span>Includes B variation</span>}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowSaveDialog(false)}
              style={{ color: tc.textMuted }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !saveName.trim()}
              className="text-white font-mono"
              style={{ backgroundColor: tc.accentOrange }}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-h-[70vh] overflow-y-auto" style={{ backgroundColor: tc.panelBg, borderColor: tc.panelBorder, color: tc.textPrimary }}>
          <DialogHeader>
            <DialogTitle className="font-mono tracking-wider" style={{ color: tc.stepBorder }}>LOAD PATTERN</DialogTitle>
          </DialogHeader>
          {savedPatterns.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: tc.textMuted }}>No saved patterns yet</p>
          ) : (
            <div className="space-y-2">
              {savedPatterns.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg transition-colors"
                  style={{ backgroundColor: tc.bodyBg, border: `1px solid ${tc.panelBorder}` }}
                >
                  <div className="flex-1 cursor-pointer" onClick={() => handleLoadPattern(p.id)}>
                    <div className="text-sm font-mono" style={{ color: tc.stepBorder }}>{p.name}</div>
                    <div className="text-[0.65rem] font-mono" style={{ color: tc.textMuted }}>
                      {p.genre} &middot; {p.songPart}{p.emotion ? ` · ${EMOTIONS[p.emotion as Emotion]?.icon || ''} ${p.emotion}` : ''} &middot; {p.bpm} BPM
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleDeletePattern(p.id); }}
                    className="text-xs"
                    style={{ color: tc.accentRed }}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
