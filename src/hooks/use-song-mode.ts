"use client";

import { useState, useCallback, useRef } from "react";
import type {
  SongBlock,
  Song,
  BlockFillSettings,
} from "@/lib/song-types";
import {
  generateBlockId,
  DEFAULT_FILL_SETTINGS,
  getFillStartStep,
  mapFillIntensity,
} from "@/lib/song-types";
import type {
  Genre,
  SongPart,
  Emotion,
  DrumPattern,
  VelocityMap,
  ProbabilityMap,
  PatternLength,
} from "@/lib/drum-patterns";
import {
  generateSmartFill,
  getRandomFillByCategory,
  getContextualCategory,
} from "@/lib/fill-patterns";
import { drumAudio } from "@/lib/audio-engine";
import { getStepInterval } from "@/lib/sequencer";

interface UseSongModeOptions {
  /** Called when song playback loads a new block into the main sequencer */
  onBlockChange: (block: SongBlock) => void;
  /** Called when song playback finishes */
  onSongEnd: () => void;
}

export function useSongMode({ onBlockChange, onSongEnd }: UseSongModeOptions) {
  // Song state
  const [blocks, setBlocks] = useState<SongBlock[]>([]);
  const [songName, setSongName] = useState("Untitled Song");
  const [songLoop, setSongLoop] = useState(false);

  // Playback state
  const [songPlaying, setSongPlaying] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(-1);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [songStep, setSongStep] = useState(-1);
  const [fillActiveForBlock, setFillActiveForBlock] = useState(false);

  // Refs for playback loop
  const blocksRef = useRef<SongBlock[]>([]);
  const playingRef = useRef(false);
  const blockIndexRef = useRef(-1);
  const repeatRef = useRef(0);
  const stepRef = useRef(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loopRef = useRef(false);

  // Fill playback refs
  const fillActiveRef = useRef(false);
  const fillPatternRef = useRef<DrumPattern | null>(null);
  const fillVelocityRef = useRef<VelocityMap | null>(null);

  // Keep refs in sync
  blocksRef.current = blocks;
  loopRef.current = songLoop;

  /**
   * Generate a fill pattern for a block based on its fill settings.
   * Uses the block's genre/songPart/emotion context for smart generation.
   */
  const generateBlockFill = useCallback((block: SongBlock): DrumPattern => {
    const fs = block.fillSettings;

    // If manual pattern is set and autoGenerate is off, use it
    if (!fs.autoGenerate && fs.manualPattern) {
      return JSON.parse(JSON.stringify(fs.manualPattern));
    }

    // Determine category: use block setting, or derive from context
    const category = fs.category || getContextualCategory(block.songPart, block.emotion);
    const intensity = mapFillIntensity(fs.intensity);

    // 50/50 chance of smart vs library fill
    const useSmartFill = Math.random() > 0.5;
    if (useSmartFill) {
      return generateSmartFill(block.pattern, intensity, block.patternLength, category);
    } else {
      const fill = getRandomFillByCategory(block.genre, intensity, category);
      return JSON.parse(JSON.stringify(fill.pattern));
    }
  }, []);

  /**
   * Check if the current playback position should be playing a fill.
   * Fills only play on the LAST repeat of a block.
   */
  const shouldPlayFill = useCallback((block: SongBlock, step: number, repeat: number): boolean => {
    if (block.fillSettings.timing === "none") return false;
    // Only on last repeat
    if (repeat !== block.repeats - 1) return false;
    const fillStart = getFillStartStep(block.fillSettings.timing, block.patternLength);
    return fillStart >= 0 && step >= fillStart;
  }, []);

  // Add the current pattern as a new block
  const addBlock = useCallback((
    pattern: DrumPattern,
    velocity: VelocityMap,
    probability: ProbabilityMap,
    patternLength: PatternLength,
    genre: Genre,
    songPart: SongPart,
    emotion: Emotion | null,
    bpm: number,
    complexity: number,
    name?: string,
  ) => {
    const block: SongBlock = {
      id: generateBlockId(),
      name: name || `${genre.charAt(0).toUpperCase() + genre.slice(1)} ${songPart.charAt(0).toUpperCase() + songPart.slice(1)}`,
      pattern: JSON.parse(JSON.stringify(pattern)),
      velocity: JSON.parse(JSON.stringify(velocity)),
      probability: JSON.parse(JSON.stringify(probability)),
      patternLength,
      genre,
      songPart,
      emotion,
      bpm,
      complexity,
      repeats: 1,
      fillSettings: { ...DEFAULT_FILL_SETTINGS },
    };
    setBlocks(prev => [...prev, block]);
    return block;
  }, []);

  // Remove a block by id
  const removeBlock = useCallback((blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  }, []);

  // Reorder blocks via drag and drop
  const moveBlock = useCallback((fromIndex: number, toIndex: number) => {
    setBlocks(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  // Duplicate a block
  const duplicateBlock = useCallback((blockId: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === blockId);
      if (idx < 0) return prev;
      const original = prev[idx];
      const copy: SongBlock = {
        ...JSON.parse(JSON.stringify(original)),
        id: generateBlockId(),
        name: `${original.name} (copy)`,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }, []);

  // Update repeat count for a block
  const setBlockRepeats = useCallback((blockId: string, repeats: number) => {
    setBlocks(prev => prev.map(b =>
      b.id === blockId ? { ...b, repeats: Math.max(1, Math.min(16, repeats)) } : b
    ));
  }, []);

  // Update fill settings for a block
  const setBlockFillSettings = useCallback((blockId: string, fillSettings: Partial<BlockFillSettings>) => {
    setBlocks(prev => prev.map(b =>
      b.id === blockId ? { ...b, fillSettings: { ...b.fillSettings, ...fillSettings } } : b
    ));
  }, []);

  // Clear all blocks
  const clearSong = useCallback(() => {
    if (playingRef.current) {
      stopSong();
    }
    setBlocks([]);
    setSongName("Untitled Song");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load a complete song
  const loadSong = useCallback((song: Song) => {
    if (playingRef.current) {
      stopSong();
    }
    // Ensure fillSettings exists on loaded blocks (backward compatibility)
    const migratedBlocks = song.blocks.map(b => ({
      ...b,
      fillSettings: b.fillSettings || { ...DEFAULT_FILL_SETTINGS },
    }));
    setBlocks(migratedBlocks);
    setSongName(song.name);
    setSongLoop(song.loop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get current song data
  const getSongData = useCallback((): Song => ({
    blocks,
    name: songName,
    loop: songLoop,
  }), [blocks, songName, songLoop]);

  // --- Playback Engine ---

  const playSoundsForStep = useCallback((block: SongBlock, step: number, useFillPattern: boolean) => {
    const pat = useFillPattern && fillPatternRef.current ? fillPatternRef.current : block.pattern;
    const vel = useFillPattern && fillVelocityRef.current ? fillVelocityRef.current : block.velocity;
    const prob = block.probability;

    Object.keys(pat).forEach((instrumentId) => {
      if (pat[instrumentId]?.[step]) {
        const stepProb = prob[instrumentId]?.[step] ?? 100;
        if (stepProb < 100 && Math.random() * 100 > stepProb) {
          return;
        }
        const stepVel = vel[instrumentId]?.[step] ?? 100;
        drumAudio.playSound(instrumentId, stepVel);
      }
    });
  }, []);

  const stopSong = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    playingRef.current = false;
    blockIndexRef.current = -1;
    repeatRef.current = 0;
    stepRef.current = -1;
    fillActiveRef.current = false;
    fillPatternRef.current = null;
    fillVelocityRef.current = null;
    setSongPlaying(false);
    setCurrentBlockIndex(-1);
    setCurrentRepeat(0);
    setSongStep(-1);
    setFillActiveForBlock(false);
    onSongEnd();
  }, [onSongEnd]);

  const advanceSongStep = useCallback(() => {
    const allBlocks = blocksRef.current;
    if (allBlocks.length === 0) {
      stopSong();
      return;
    }

    const block = allBlocks[blockIndexRef.current];
    if (!block) {
      stopSong();
      return;
    }

    stepRef.current += 1;

    // Check if we've finished all steps in the current pattern
    if (stepRef.current >= block.patternLength) {
      stepRef.current = 0;
      repeatRef.current += 1;

      // Reset fill state at repeat boundary
      fillActiveRef.current = false;
      fillPatternRef.current = null;
      fillVelocityRef.current = null;
      setFillActiveForBlock(false);

      // Check if we've done all repeats for this block
      if (repeatRef.current >= block.repeats) {
        repeatRef.current = 0;
        blockIndexRef.current += 1;

        // Check if we've finished all blocks
        if (blockIndexRef.current >= allBlocks.length) {
          if (loopRef.current) {
            blockIndexRef.current = 0;
          } else {
            stopSong();
            return;
          }
        }

        // Move to next block — may have different BPM
        const nextBlock = allBlocks[blockIndexRef.current];
        if (!nextBlock) {
          stopSong();
          return;
        }

        setCurrentBlockIndex(blockIndexRef.current);
        setCurrentRepeat(0);
        onBlockChange(nextBlock);

        // Restart interval with new BPM
        if (intervalRef.current) clearInterval(intervalRef.current);
        const newInterval = getStepInterval(nextBlock.bpm);
        intervalRef.current = setInterval(() => {
          advanceSongStep();
        }, newInterval);
      } else {
        setCurrentRepeat(repeatRef.current);
      }
    }

    // Check if we need to activate fill for this step
    const currentBlock = allBlocks[blockIndexRef.current];
    if (currentBlock) {
      const isFillStep = shouldPlayFill(currentBlock, stepRef.current, repeatRef.current);

      // Generate fill pattern when fill region starts
      if (isFillStep && !fillActiveRef.current) {
        fillActiveRef.current = true;
        setFillActiveForBlock(true);
        fillPatternRef.current = generateBlockFill(currentBlock);
        // No special velocity for fills — use the fill pattern's inherent density
        fillVelocityRef.current = null;
      } else if (!isFillStep && fillActiveRef.current) {
        // We've left the fill region (new repeat started)
        fillActiveRef.current = false;
        fillPatternRef.current = null;
        fillVelocityRef.current = null;
        setFillActiveForBlock(false);
      }

      setSongStep(stepRef.current);
      playSoundsForStep(currentBlock, stepRef.current, fillActiveRef.current);
    }
  }, [stopSong, onBlockChange, playSoundsForStep, shouldPlayFill, generateBlockFill]);

  const playSong = useCallback(() => {
    const allBlocks = blocksRef.current;
    if (allBlocks.length === 0) return;

    drumAudio.init();

    blockIndexRef.current = 0;
    repeatRef.current = 0;
    stepRef.current = 0;
    playingRef.current = true;
    fillActiveRef.current = false;
    fillPatternRef.current = null;
    fillVelocityRef.current = null;

    const firstBlock = allBlocks[0];
    setCurrentBlockIndex(0);
    setCurrentRepeat(0);
    setSongStep(0);
    setSongPlaying(true);
    setFillActiveForBlock(false);
    onBlockChange(firstBlock);

    // Check if very first step is a fill step (unlikely but handle it)
    const isFillStep = shouldPlayFill(firstBlock, 0, 0);
    if (isFillStep) {
      fillActiveRef.current = true;
      setFillActiveForBlock(true);
      fillPatternRef.current = generateBlockFill(firstBlock);
    }

    // Play first step immediately
    playSoundsForStep(firstBlock, 0, fillActiveRef.current);

    const interval = getStepInterval(firstBlock.bpm);
    intervalRef.current = setInterval(() => {
      advanceSongStep();
    }, interval);
  }, [onBlockChange, playSoundsForStep, advanceSongStep, shouldPlayFill, generateBlockFill]);

  // Calculate total song duration in seconds
  const getTotalDuration = useCallback(() => {
    return blocks.reduce((total, block) => {
      const stepMs = getStepInterval(block.bpm);
      const blockMs = stepMs * block.patternLength * block.repeats;
      return total + blockMs;
    }, 0) / 1000;
  }, [blocks]);

  return {
    // Song data
    blocks,
    songName,
    setSongName,
    songLoop,
    setSongLoop,

    // Block management
    addBlock,
    removeBlock,
    moveBlock,
    duplicateBlock,
    setBlockRepeats,
    setBlockFillSettings,
    clearSong,
    loadSong,
    getSongData,

    // Playback
    songPlaying,
    currentBlockIndex,
    currentRepeat,
    songStep,
    fillActiveForBlock,
    playSong,
    stopSong,

    // Computed
    getTotalDuration,
  };
}
