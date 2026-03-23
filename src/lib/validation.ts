/**
 * Comprehensive input validation and sanitization for pattern data storage
 * Prevents malformed data, XSS attacks, and DoS via size limits
 */

import { z } from "zod";
import { INSTRUMENTS, GENRES, SONG_PARTS, EMOTIONS, PATTERN_LENGTHS } from "./drum-patterns";

// ============================================================================
// CONSTANTS & LIMITS
// ============================================================================

const MAX_PATTERN_NAME_LENGTH = 100;
const MAX_SONG_NAME_LENGTH = 100;
const MAX_PATTERN_JSON_SIZE = 100_000; // 100KB max pattern JSON
const MAX_SONG_JSON_SIZE = 500_000; // 500KB max song JSON
const MAX_PATTERNS_PER_USER = 500; // Prevent unbounded storage
const MAX_SONGS_PER_USER = 100;
const MAX_SONG_BLOCKS = 100; // Max blocks in a song
const MIN_BPM = 40;
const MAX_BPM = 300;

// Valid instrument IDs
const VALID_INSTRUMENT_IDS = INSTRUMENTS.map((i) => i.id);

// Valid enum values
const VALID_GENRES = Object.keys(GENRES);
const VALID_SONG_PARTS = Object.keys(SONG_PARTS);
const VALID_EMOTIONS = Object.keys(EMOTIONS);
const VALID_PATTERN_LENGTHS = PATTERN_LENGTHS;

// ============================================================================
// SANITIZATION UTILITIES
// ============================================================================

/**
 * Sanitize text input: remove HTML/script tags, trim whitespace
 * Prevents XSS attacks via pattern/song names
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove script tags
    .replace(/<[^>]+>/g, "") // Remove all HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers (onclick=, etc.)
    .trim();
}

/**
 * Validate and sanitize pattern/song name
 */
export function sanitizeName(name: string, maxLength: number): string {
  const sanitized = sanitizeText(name);
  if (sanitized.length === 0) {
    throw new Error("Name cannot be empty after sanitization");
  }
  if (sanitized.length > maxLength) {
    return sanitized.substring(0, maxLength);
  }
  return sanitized;
}

/**
 * Check JSON size to prevent DoS attacks
 */
export function validateJsonSize(data: unknown, maxSize: number): void {
  const jsonString = JSON.stringify(data);
  const sizeInBytes = new TextEncoder().encode(jsonString).length;
  if (sizeInBytes > maxSize) {
    throw new Error(`Data exceeds maximum size of ${maxSize} bytes (got ${sizeInBytes} bytes)`);
  }
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

/**
 * Schema for a single drum pattern step array (boolean array)
 */
const drumStepArraySchema = z
  .array(z.boolean())
  .min(1)
  .max(32, "Pattern cannot exceed 32 steps");

/**
 * Schema for velocity/probability value arrays (numbers 0-1 or 0-127)
 */
const velocityArraySchema = z
  .array(z.number().min(0).max(127))
  .min(1)
  .max(32, "Velocity array cannot exceed 32 steps");

const probabilityArraySchema = z
  .array(z.number().min(0).max(100))
  .min(1)
  .max(32, "Probability array cannot exceed 32 steps");

/**
 * Schema for DrumPattern: Record<instrumentId, boolean[]>
 * Validates that all keys are valid instrument IDs
 */
const drumPatternSchema = z.record(
  z.enum(VALID_INSTRUMENT_IDS as [string, ...string[]]),
  drumStepArraySchema
);

/**
 * Schema for VelocityMap: Record<instrumentId, number[]>
 */
const velocityMapSchema = z.record(
  z.enum(VALID_INSTRUMENT_IDS as [string, ...string[]]),
  velocityArraySchema
);

/**
 * Schema for ProbabilityMap: Record<instrumentId, number[]>
 */
const probabilityMapSchema = z.record(
  z.enum(VALID_INSTRUMENT_IDS as [string, ...string[]]),
  probabilityArraySchema
);

/**
 * Schema for PatternLength
 */
const patternLengthSchema = z.enum(
  VALID_PATTERN_LENGTHS.map(String) as [string, ...string[]]
).transform(Number) as z.ZodType<8 | 16 | 24 | 32>;

/**
 * Schema for Genre
 */
const genreSchema = z.enum(VALID_GENRES as [string, ...string[]]);

/**
 * Schema for SongPart
 */
const songPartSchema = z.enum(VALID_SONG_PARTS as [string, ...string[]]);

/**
 * Schema for Emotion (optional)
 */
const emotionSchema = z.enum(VALID_EMOTIONS as [string, ...string[]]).optional().nullable();

/**
 * Schema for BPM
 */
const bpmSchema = z.number().int().min(MIN_BPM).max(MAX_BPM);

/**
 * Schema for full pattern data (ExtendedPatternData)
 */
const extendedPatternDataSchema = z.object({
  pattern: drumPatternSchema,
  velocity: velocityMapSchema.optional(),
  probability: probabilityMapSchema.optional(),
  patternLength: patternLengthSchema.optional(),
});

/**
 * Schema for pattern save request
 */
export const savePatternSchema = z.object({
  name: z
    .string()
    .min(1, "Pattern name is required")
    .max(MAX_PATTERN_NAME_LENGTH, `Pattern name cannot exceed ${MAX_PATTERN_NAME_LENGTH} characters`)
    .transform((val) => sanitizeName(val, MAX_PATTERN_NAME_LENGTH)),
  genre: genreSchema,
  songPart: songPartSchema,
  emotion: emotionSchema,
  bpm: bpmSchema,
  pattern: z.any().refine(
    (data) => {
      // Validate JSON size first
      validateJsonSize(data, MAX_PATTERN_JSON_SIZE);
      return true;
    },
    { message: `Pattern data exceeds maximum size of ${MAX_PATTERN_JSON_SIZE} bytes` }
  ),
});

/**
 * Schema for a single song block
 */
const songBlockSchema = z.object({
  id: z.string(),
  genre: genreSchema,
  songPart: songPartSchema,
  pattern: z.any(), // Can be preset or custom pattern
  bpm: bpmSchema,
  repeat: z.number().int().min(1).max(16).optional().default(1),
  fillConfig: z
    .object({
      enabled: z.boolean().optional(),
      timing: z.enum(["last-bar", "last-2-bars", "every-repeat"]).optional(),
      intensity: z.enum(["subtle", "moderate", "heavy"]).optional(),
      category: z.string().optional(),
    })
    .optional(),
});

/**
 * Schema for song save request
 */
export const saveSongSchema = z.object({
  name: z
    .string()
    .min(1, "Song name is required")
    .max(MAX_SONG_NAME_LENGTH, `Song name cannot exceed ${MAX_SONG_NAME_LENGTH} characters`)
    .transform((val) => sanitizeName(val, MAX_SONG_NAME_LENGTH)),
  blocks: z
    .array(songBlockSchema)
    .min(1, "Song must have at least one block")
    .max(MAX_SONG_BLOCKS, `Song cannot exceed ${MAX_SONG_BLOCKS} blocks`)
    .refine(
      (blocks) => {
        // Validate total JSON size
        validateJsonSize(blocks, MAX_SONG_JSON_SIZE);
        return true;
      },
      { message: `Song data exceeds maximum size of ${MAX_SONG_JSON_SIZE} bytes` }
    ),
  loop: z.boolean().optional().default(false),
});

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate pattern save data
 * @throws ZodError if validation fails
 */
export function validatePatternData(data: unknown) {
  return savePatternSchema.parse(data);
}

/**
 * Validate song save data
 * @throws ZodError if validation fails
 */
export function validateSongData(data: unknown) {
  return saveSongSchema.parse(data);
}

/**
 * Safely validate pattern data and return typed result
 */
export function safeValidatePattern(data: unknown) {
  return savePatternSchema.safeParse(data);
}

/**
 * Safely validate song data and return typed result
 */
export function safeValidateSong(data: unknown) {
  return saveSongSchema.safeParse(data);
}

// ============================================================================
// RATE LIMITING HELPERS
// ============================================================================

/**
 * Check if user has exceeded pattern storage limit
 */
export async function checkPatternLimit(
  userId: string,
  prisma: any
): Promise<{ allowed: boolean; count: number; limit: number }> {
  const count = await prisma.savedPattern.count({
    where: { userId },
  });

  return {
    allowed: count < MAX_PATTERNS_PER_USER,
    count,
    limit: MAX_PATTERNS_PER_USER,
  };
}

/**
 * Check if user has exceeded song storage limit
 */
export async function checkSongLimit(
  userId: string,
  prisma: any
): Promise<{ allowed: boolean; count: number; limit: number }> {
  const count = await prisma.savedSong.count({
    where: { userId },
  });

  return {
    allowed: count < MAX_SONGS_PER_USER,
    count,
    limit: MAX_SONGS_PER_USER,
  };
}

// ============================================================================
// EXPORT CONSTANTS FOR REFERENCE
// ============================================================================

export const VALIDATION_LIMITS = {
  MAX_PATTERN_NAME_LENGTH,
  MAX_SONG_NAME_LENGTH,
  MAX_PATTERN_JSON_SIZE,
  MAX_SONG_JSON_SIZE,
  MAX_PATTERNS_PER_USER,
  MAX_SONGS_PER_USER,
  MAX_SONG_BLOCKS,
  MIN_BPM,
  MAX_BPM,
};
