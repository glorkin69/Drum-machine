// Pattern selection engine with weighted randomization and anti-repeat logic

import type { Genre, SongPart, Emotion, DrumPattern } from "./drum-patterns";
import {
  PATTERN_LIBRARY,
  EMOTION_PATTERN_LIBRARY,
  getPatternVariants,
  getEmotionVariants,
  type PatternVariant,
  type EmotionVariant,
} from "./pattern-library";

// Track recently used patterns to avoid immediate repeats
const recentGenrePatterns: Map<string, string[]> = new Map();
const recentEmotionPatterns: Map<string, string[]> = new Map();

// How many recent patterns to remember (won't repeat these)
const HISTORY_SIZE = 5;

function getRecentKey(genre: Genre, songPart: SongPart): string {
  return `${genre}:${songPart}`;
}

function addToHistory(map: Map<string, string[]>, key: string, id: string): void {
  const history = map.get(key) || [];
  history.push(id);
  if (history.length > HISTORY_SIZE) history.shift();
  map.set(key, history);
}

/**
 * Select a random pattern for a genre + song part, avoiding recent repeats.
 * Returns a deep copy of the pattern.
 */
export function selectRandomPattern(
  genre: Genre,
  songPart: SongPart
): { pattern: DrumPattern; variant: PatternVariant } {
  const variants = getPatternVariants(genre, songPart);
  if (variants.length === 0) {
    // Fallback: shouldn't happen, but return first available for genre
    const allForGenre = PATTERN_LIBRARY[genre];
    const fallback = allForGenre[0];
    return { pattern: JSON.parse(JSON.stringify(fallback.pattern)), variant: fallback };
  }

  const key = getRecentKey(genre, songPart);
  const recent = recentGenrePatterns.get(key) || [];

  // Filter out recently used patterns
  let candidates = variants.filter((v) => !recent.includes(v.id));
  // If all have been used recently, allow all (reset effective history)
  if (candidates.length === 0) candidates = variants;

  // Weighted random: favor less-used complexity levels for variety
  const idx = Math.floor(Math.random() * candidates.length);
  const selected = candidates[idx];

  addToHistory(recentGenrePatterns, key, selected.id);

  return {
    pattern: JSON.parse(JSON.stringify(selected.pattern)),
    variant: selected,
  };
}

/**
 * Select a random emotion pattern, avoiding recent repeats.
 */
export function selectRandomEmotionPattern(
  emotion: Emotion
): { pattern: DrumPattern; bpm: number; variant: EmotionVariant } {
  const variants = getEmotionVariants(emotion);
  if (variants.length === 0) {
    // Shouldn't happen
    const fallback = EMOTION_PATTERN_LIBRARY[0];
    return {
      pattern: JSON.parse(JSON.stringify(fallback.pattern)),
      bpm: fallback.bpm,
      variant: fallback,
    };
  }

  const recent = recentEmotionPatterns.get(emotion) || [];
  let candidates = variants.filter((v) => !recent.includes(v.id));
  if (candidates.length === 0) candidates = variants;

  const idx = Math.floor(Math.random() * candidates.length);
  const selected = candidates[idx];

  addToHistory(recentEmotionPatterns, emotion, selected.id);

  return {
    pattern: JSON.parse(JSON.stringify(selected.pattern)),
    bpm: selected.bpm,
    variant: selected,
  };
}

/**
 * Get total count of patterns for a genre (all song parts).
 */
export function getPatternCount(genre: Genre): number {
  return PATTERN_LIBRARY[genre].length;
}

/**
 * Get total count of patterns for a genre + song part.
 */
export function getPartPatternCount(genre: Genre, songPart: SongPart): number {
  return getPatternVariants(genre, songPart).length;
}

/**
 * Get total patterns across all genres.
 */
export function getTotalPatternCount(): number {
  let count = 0;
  for (const genre of Object.keys(PATTERN_LIBRARY) as Genre[]) {
    count += PATTERN_LIBRARY[genre].length;
  }
  count += EMOTION_PATTERN_LIBRARY.length;
  return count;
}
