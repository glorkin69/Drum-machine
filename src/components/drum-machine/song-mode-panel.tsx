"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { SongBlock, BlockFillSettings, FillTiming } from "@/lib/song-types";
import {
  GENRE_COLORS,
  SONG_PART_LABELS,
  FILL_TIMING_OPTIONS,
  DEFAULT_FILL_SETTINGS,
  getFillStartStep,
} from "@/lib/song-types";
import { FILL_CATEGORIES, type FillCategory } from "@/lib/fill-patterns";
import type { Genre, Emotion } from "@/lib/drum-patterns";
import { GENRES, EMOTIONS } from "@/lib/drum-patterns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Play,
  Square,
  Plus,
  Trash2,
  GripVertical,
  Copy,
  Repeat,
  ChevronUp,
  ChevronDown,
  Music,
  Download,
  Save,
  FolderOpen,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface SongModePanelProps {
  blocks: SongBlock[];
  songName: string;
  onSongNameChange: (name: string) => void;
  songLoop: boolean;
  onSongLoopChange: (loop: boolean) => void;
  songPlaying: boolean;
  currentBlockIndex: number;
  currentRepeat: number;
  songStep: number;
  fillActiveForBlock: boolean;
  onAddBlock: () => void;
  onRemoveBlock: (blockId: string) => void;
  onMoveBlock: (fromIndex: number, toIndex: number) => void;
  onDuplicateBlock: (blockId: string) => void;
  onSetBlockRepeats: (blockId: string, repeats: number) => void;
  onSetBlockFillSettings: (blockId: string, settings: Partial<BlockFillSettings>) => void;
  onClearSong: () => void;
  onPlaySong: () => void;
  onStopSong: () => void;
  onLoadBlockToSequencer: (block: SongBlock) => void;
  onSaveSong: () => void;
  onLoadSong: () => void;
  onExportSongMidi: () => void;
  getTotalDuration: () => number;
  isGuest: boolean;
}

// ---- Fill Configuration Context Menu ----
function FillConfigMenu({
  block,
  position,
  onClose,
  onUpdateFillSettings,
}: {
  block: SongBlock;
  position: { x: number; y: number };
  onClose: () => void;
  onUpdateFillSettings: (settings: Partial<BlockFillSettings>) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const fs = block.fillSettings;

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Position menu within viewport
  const adjustedStyle: React.CSSProperties = {
    position: "fixed",
    left: Math.min(position.x, window.innerWidth - 280),
    top: Math.min(position.y, window.innerHeight - 360),
    zIndex: 9999,
  };

  const fillStart = getFillStartStep(fs.timing, block.patternLength);

  return (
    <div
      ref={menuRef}
      style={adjustedStyle}
      className="w-[260px] bg-[#1A1410] border-2 border-[#4A3728] rounded-lg shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#2C1E14] border-b border-[#4A3728]">
        <span className="text-[0.65rem] font-mono font-bold tracking-wider text-[#E8732A]">
          FILL CONFIG
        </span>
        <button onClick={onClose} className="text-[#6B5040] hover:text-[#D4A574] p-0.5">
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Fill Timing */}
        <div>
          <label className="text-[0.6rem] font-mono text-[#A08060] block mb-1.5">TIMING</label>
          <div className="grid grid-cols-4 gap-1">
            {FILL_TIMING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onUpdateFillSettings({ timing: opt.value })}
                className={`text-[0.55rem] font-mono py-1.5 px-1 rounded transition-colors ${
                  fs.timing === opt.value
                    ? "bg-[#E8732A]/20 text-[#E8732A] border border-[#E8732A]/50"
                    : "bg-[#2C1E14] text-[#6B5040] border border-[#4A3728] hover:text-[#A08060] hover:border-[#6B5040]"
                }`}
                title={opt.label}
              >
                {opt.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Only show rest if timing is not "none" */}
        {fs.timing !== "none" && (
          <>
            {/* Fill Intensity Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[0.6rem] font-mono text-[#A08060]">INTENSITY</label>
                <span className="text-[0.6rem] font-mono text-[#E8732A] font-bold">{fs.intensity}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={fs.intensity}
                onChange={(e) => onUpdateFillSettings({ intensity: parseInt(e.target.value) })}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #27AE60 0%, #F39C12 50%, #e74c3c 100%)`,
                }}
              />
              <div className="flex justify-between mt-0.5">
                <span className="text-[0.5rem] font-mono text-[#6B5040]">Subtle</span>
                <span className="text-[0.5rem] font-mono text-[#6B5040]">Heavy</span>
              </div>
            </div>

            {/* Fill Category */}
            <div>
              <label className="text-[0.6rem] font-mono text-[#A08060] block mb-1.5">CATEGORY</label>
              <div className="grid grid-cols-3 gap-1">
                {(["transition", "rising-energy", "signature"] as FillCategory[]).map((cat) => {
                  const catInfo = FILL_CATEGORIES[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => onUpdateFillSettings({ category: cat })}
                      className={`text-[0.55rem] font-mono py-1.5 px-1 rounded transition-colors ${
                        fs.category === cat
                          ? "border"
                          : "bg-[#2C1E14] text-[#6B5040] border border-[#4A3728] hover:text-[#A08060]"
                      }`}
                      style={
                        fs.category === cat
                          ? {
                              backgroundColor: `${catInfo.color}20`,
                              color: catInfo.color,
                              borderColor: `${catInfo.color}80`,
                            }
                          : undefined
                      }
                      title={catInfo.description}
                    >
                      {catInfo.shortName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auto-generate toggle */}
            <div className="flex items-center justify-between">
              <label className="text-[0.6rem] font-mono text-[#A08060]">AUTO-GENERATE</label>
              <button
                onClick={() => onUpdateFillSettings({ autoGenerate: !fs.autoGenerate })}
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  fs.autoGenerate ? "bg-[#27AE60]" : "bg-[#4A3728]"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                    fs.autoGenerate ? "translate-x-4.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Fill preview indicator */}
            {fillStart >= 0 && (
              <div className="bg-[#2C1E14] rounded p-2">
                <div className="text-[0.55rem] font-mono text-[#6B5040] mb-1.5">
                  FILL REGION (last repeat)
                </div>
                <div className="flex gap-px">
                  {Array.from({ length: block.patternLength }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-2 rounded-sm"
                      style={{
                        backgroundColor:
                          i >= fillStart
                            ? FILL_CATEGORIES[fs.category].color + "80"
                            : "#4A372840",
                      }}
                    />
                  ))}
                </div>
                <div className="text-[0.5rem] font-mono text-[#6B5040] mt-1">
                  Steps {fillStart + 1}-{block.patternLength} &middot; {block.patternLength - fillStart} steps
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---- Song Block Item ----
function SongBlockItem({
  block,
  index,
  isActive,
  currentRepeat,
  songStep,
  fillActive,
  onRemove,
  onDuplicate,
  onSetRepeats,
  onLoadToSequencer,
  onUpdateFillSettings,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: {
  block: SongBlock;
  index: number;
  isActive: boolean;
  currentRepeat: number;
  songStep: number;
  fillActive: boolean;
  onRemove: () => void;
  onDuplicate: () => void;
  onSetRepeats: (repeats: number) => void;
  onLoadToSequencer: () => void;
  onUpdateFillSettings: (settings: Partial<BlockFillSettings>) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const [showFillMenu, setShowFillMenu] = useState(false);
  const [fillMenuPos, setFillMenuPos] = useState({ x: 0, y: 0 });
  const genreColor = GENRE_COLORS[block.genre];
  const partLabel = SONG_PART_LABELS[block.songPart];
  const progress = isActive ? ((songStep + 1) / block.patternLength) * 100 : 0;
  const hasFill = block.fillSettings.timing !== "none";
  const fillStart = getFillStartStep(block.fillSettings.timing, block.patternLength);
  const fillProgress = isActive && fillStart >= 0
    ? Math.max(0, Math.min(100, ((fillStart) / block.patternLength) * 100))
    : 0;

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setFillMenuPos({ x: e.clientX, y: e.clientY });
    setShowFillMenu(true);
  }, []);

  return (
    <>
      <div
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
        onContextMenu={handleContextMenu}
        className={`song-block relative flex items-stretch gap-0 rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing ${
          isActive
            ? fillActive
              ? "border-[#e74c3c] bg-[#2C1414] shadow-[0_0_16px_rgba(231,76,60,0.3)]"
              : "border-[#E8732A] bg-[#2C1E14] shadow-[0_0_16px_rgba(232,115,42,0.3)]"
            : "border-[#4A3728] bg-[#1A1410] hover:border-[#6B5040]"
        }`}
      >
        {/* Progress bar overlay */}
        {isActive && (
          <div
            className={`absolute bottom-0 left-0 h-1 rounded-b-lg transition-all ${
              fillActive ? "bg-[#e74c3c]" : "bg-[#E8732A]"
            }`}
            style={{ width: `${progress}%` }}
          />
        )}

        {/* Fill region indicator on the progress bar */}
        {isActive && hasFill && fillProgress > 0 && (
          <div
            className="absolute bottom-0 h-1 rounded-b-lg opacity-30"
            style={{
              left: `${fillProgress}%`,
              width: `${100 - fillProgress}%`,
              backgroundColor: FILL_CATEGORIES[block.fillSettings.category].color,
            }}
          />
        )}

        {/* Drag handle */}
        <div className="flex items-center px-1.5 text-[#6B5040] hover:text-[#A08060]">
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Genre color bar */}
        <div
          className="w-1.5 rounded-l-sm my-1"
          style={{ backgroundColor: genreColor }}
        />

        {/* Block info */}
        <div
          className="flex-1 py-2 px-3 cursor-pointer hover:bg-[#2C1E14]/50"
          onClick={onLoadToSequencer}
          title="Click to load into sequencer · Right-click for fill settings"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#D4A574] truncate max-w-[120px]">
              {block.name}
            </span>
            <span
              className="text-[0.55rem] font-mono px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${genreColor}20`,
                color: genreColor,
                border: `1px solid ${genreColor}40`,
              }}
            >
              {partLabel}
            </span>
            {block.emotion && (
              <span className="text-[0.55rem]">
                {EMOTIONS[block.emotion]?.icon}
              </span>
            )}
            {/* Fill indicator badge */}
            {hasFill && (
              <span
                className="text-[0.5rem] font-mono font-bold px-1 py-0.5 rounded cursor-pointer"
                style={{
                  backgroundColor: `${FILL_CATEGORIES[block.fillSettings.category].color}20`,
                  color: FILL_CATEGORIES[block.fillSettings.category].color,
                  border: `1px solid ${FILL_CATEGORIES[block.fillSettings.category].color}40`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setFillMenuPos({ x: e.clientX, y: e.clientY });
                  setShowFillMenu(true);
                }}
                title={`Fill: ${FILL_TIMING_OPTIONS.find(o => o.value === block.fillSettings.timing)?.label} · ${FILL_CATEGORIES[block.fillSettings.category].name} · Intensity ${block.fillSettings.intensity}`}
              >
                F
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[0.55rem] font-mono text-[#A08060]">
              {GENRES[block.genre].name}
            </span>
            <span className="text-[0.55rem] font-mono text-[#6B5040]">&middot;</span>
            <span className="text-[0.55rem] font-mono text-[#A08060]">
              {block.bpm} BPM
            </span>
            <span className="text-[0.55rem] font-mono text-[#6B5040]">&middot;</span>
            <span className="text-[0.55rem] font-mono text-[#A08060]">
              {block.patternLength} steps
            </span>
            {isActive && (
              <>
                <span className="text-[0.55rem] font-mono text-[#6B5040]">&middot;</span>
                <span className={`text-[0.55rem] font-mono animate-pulse ${
                  fillActive ? "text-[#e74c3c]" : "text-[#E8732A]"
                }`}>
                  {fillActive ? "FILL" : `Rep ${currentRepeat + 1}/${block.repeats}`}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Repeat controls */}
        <div className="flex items-center gap-0.5 px-1 border-l border-[#4A3728]/50">
          <div className="flex flex-col items-center">
            <button
              onClick={() => onSetRepeats(block.repeats + 1)}
              className="text-[#6B5040] hover:text-[#D4A574] p-0.5"
              title="Increase repeats"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <span className="text-[0.6rem] font-mono text-[#D4A574] w-5 text-center">
              {block.repeats}x
            </span>
            <button
              onClick={() => onSetRepeats(block.repeats - 1)}
              className="text-[#6B5040] hover:text-[#D4A574] p-0.5"
              title="Decrease repeats"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 px-1.5 border-l border-[#4A3728]/50">
          {/* Fill toggle button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFillMenuPos({ x: e.clientX, y: e.clientY });
              setShowFillMenu(true);
            }}
            className={`p-1 transition-colors text-[0.55rem] font-mono font-bold ${
              hasFill
                ? "text-[#E8732A] hover:text-[#F39C12]"
                : "text-[#6B5040] hover:text-[#A08060]"
            }`}
            title="Configure fill"
          >
            F
          </button>
          <button
            onClick={onDuplicate}
            className="p-1 text-[#6B5040] hover:text-[#3498db] transition-colors"
            title="Duplicate block"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-[#6B5040] hover:text-[#C0392B] transition-colors"
            title="Remove block"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Fill config context menu */}
      {showFillMenu && (
        <FillConfigMenu
          block={block}
          position={fillMenuPos}
          onClose={() => setShowFillMenu(false)}
          onUpdateFillSettings={onUpdateFillSettings}
        />
      )}
    </>
  );
}

// ---- Main Song Mode Panel ----
export function SongModePanel({
  blocks,
  songName,
  onSongNameChange,
  songLoop,
  onSongLoopChange,
  songPlaying,
  currentBlockIndex,
  currentRepeat,
  songStep,
  fillActiveForBlock,
  onAddBlock,
  onRemoveBlock,
  onMoveBlock,
  onDuplicateBlock,
  onSetBlockRepeats,
  onSetBlockFillSettings,
  onClearSong,
  onPlaySong,
  onStopSong,
  onLoadBlockToSequencer,
  onSaveSong,
  onLoadSong,
  onExportSongMidi,
  getTotalDuration,
  isGuest,
}: SongModePanelProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => (e: React.DragEvent) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }, []);

  const handleDragOver = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (!isNaN(fromIndex) && fromIndex !== toIndex) {
      onMoveBlock(fromIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }, [onMoveBlock]);

  const handleClear = useCallback(() => {
    if (blocks.length === 0) return;
    setShowClearConfirm(true);
  }, [blocks.length]);

  const confirmClear = useCallback(() => {
    onClearSong();
    setShowClearConfirm(false);
    toast.success("Song cleared");
  }, [onClearSong]);

  const totalDuration = getTotalDuration();
  const totalMinutes = Math.floor(totalDuration / 60);
  const totalSeconds = Math.floor(totalDuration % 60);
  const blocksWithFills = blocks.filter(b => b.fillSettings.timing !== "none").length;

  return (
    <div className="vintage-panel rounded-xl p-4 space-y-3" data-tour="song-mode">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-[#E8732A]" />
          <span className="text-xs font-mono font-bold tracking-wider text-[#D4A574]">
            SONG MODE
          </span>
          <span className="text-[0.55rem] font-mono text-[#6B5040] ml-1">
            {blocks.length} block{blocks.length !== 1 ? "s" : ""}
            {blocks.length > 0 && ` \u00B7 ${totalMinutes}:${String(totalSeconds).padStart(2, "0")}`}
            {blocksWithFills > 0 && (
              <span className="text-[#E8732A]"> \u00B7 {blocksWithFills} fill{blocksWithFills !== 1 ? "s" : ""}</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSaveSong}
            disabled={isGuest || blocks.length === 0}
            className={`text-xs font-mono h-7 px-2 ${
              isGuest || blocks.length === 0
                ? "text-[#6B5B47] cursor-not-allowed"
                : "text-[#A08060] hover:text-[#D4A574] hover:bg-[#3D2B1F]"
            }`}
            title={isGuest ? "Save disabled in guest mode" : "Save song"}
          >
            <Save className="w-3 h-3 mr-1" />
            SAVE
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadSong}
            disabled={isGuest}
            className={`text-xs font-mono h-7 px-2 ${
              isGuest
                ? "text-[#6B5B47] cursor-not-allowed"
                : "text-[#A08060] hover:text-[#D4A574] hover:bg-[#3D2B1F]"
            }`}
            title={isGuest ? "Load disabled in guest mode" : "Load song"}
          >
            <FolderOpen className="w-3 h-3 mr-1" />
            LOAD
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExportSongMidi}
            disabled={blocks.length === 0}
            className="text-[#A08060] hover:text-[#D4A574] hover:bg-[#3D2B1F] text-xs font-mono h-7 px-2 disabled:text-[#6B5B47] disabled:cursor-not-allowed"
            title="Export song as MIDI"
          >
            <Download className="w-3 h-3 mr-1" />
            MIDI
          </Button>
        </div>
      </div>

      {/* Song name input */}
      <div className="flex items-center gap-2">
        <Input
          value={songName}
          onChange={(e) => onSongNameChange(e.target.value)}
          placeholder="Song name..."
          className="bg-[#0A0A0A] border-[#333] text-[#E8732A] font-mono text-xs h-7 flex-1"
        />
      </div>

      {/* Transport */}
      <div className="flex items-center gap-2">
        {songPlaying ? (
          <Button
            onClick={onStopSong}
            size="sm"
            className="bg-[#C0392B] hover:bg-[#A93226] text-white font-mono text-xs h-8 px-4"
          >
            <Square className="w-3.5 h-3.5 mr-1.5" />
            STOP SONG
          </Button>
        ) : (
          <Button
            onClick={onPlaySong}
            size="sm"
            disabled={blocks.length === 0}
            className="bg-[#27AE60] hover:bg-[#219A52] text-white font-mono text-xs h-8 px-4 disabled:bg-[#3D2B1F] disabled:text-[#6B5B47]"
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            PLAY SONG
          </Button>
        )}
        <button
          onClick={() => onSongLoopChange(!songLoop)}
          className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs font-mono transition-colors ${
            songLoop
              ? "bg-[#E8732A]/20 text-[#E8732A] border border-[#E8732A]/40"
              : "bg-[#3D2B1F] text-[#6B5040] border border-[#4A3728] hover:text-[#A08060]"
          }`}
          title="Toggle song loop"
        >
          <Repeat className="w-3 h-3" />
          LOOP
        </button>
        <Button
          onClick={onAddBlock}
          size="sm"
          className="bg-[#3498db] hover:bg-[#2E86C1] text-white font-mono text-xs h-8 px-3 ml-auto"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          ADD PATTERN
        </Button>
        <Button
          onClick={handleClear}
          variant="ghost"
          size="sm"
          disabled={blocks.length === 0}
          className="text-[#6B5040] hover:text-[#C0392B] hover:bg-[#C0392B]/10 font-mono text-xs h-8 disabled:text-[#4A3728]"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          CLEAR
        </Button>
      </div>

      {/* Timeline */}
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto song-timeline-scroll">
        {blocks.length === 0 ? (
          <div className="text-center py-8">
            <Music className="w-8 h-8 text-[#4A3728] mx-auto mb-2" />
            <p className="text-[#6B5040] text-xs font-mono">No pattern blocks yet</p>
            <p className="text-[#4A3728] text-[0.6rem] font-mono mt-1">
              Click &quot;ADD PATTERN&quot; to add the current pattern
            </p>
            <p className="text-[#4A3728] text-[0.5rem] font-mono mt-1">
              Right-click blocks to configure fills
            </p>
          </div>
        ) : (
          blocks.map((block, index) => (
            <div
              key={block.id}
              className={`transition-transform ${
                dragIndex !== null && dragOverIndex === index
                  ? "song-block-drag-over"
                  : ""
              } ${dragIndex === index ? "opacity-50" : ""}`}
            >
              <SongBlockItem
                block={block}
                index={index}
                isActive={currentBlockIndex === index && songPlaying}
                currentRepeat={currentBlockIndex === index ? currentRepeat : 0}
                songStep={currentBlockIndex === index ? songStep : -1}
                fillActive={currentBlockIndex === index && fillActiveForBlock}
                onRemove={() => onRemoveBlock(block.id)}
                onDuplicate={() => onDuplicateBlock(block.id)}
                onSetRepeats={(repeats) => onSetBlockRepeats(block.id, repeats)}
                onLoadToSequencer={() => onLoadBlockToSequencer(block)}
                onUpdateFillSettings={(settings) => onSetBlockFillSettings(block.id, settings)}
                onDragStart={handleDragStart(index)}
                onDragOver={handleDragOver(index)}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop(index)}
              />
            </div>
          ))
        )}
      </div>

      {/* Clear confirmation dialog */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="bg-[#2C1E14] border-[#4A3728] text-[#F5E6D3] max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono tracking-wider text-[#D4A574] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F39C12]" />
              CLEAR SONG
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#A08060] text-sm font-mono">
            Remove all {blocks.length} pattern block{blocks.length !== 1 ? "s" : ""} from the song?
            This cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowClearConfirm(false)}
              className="text-[#A08060] hover:text-[#D4A574] hover:bg-[#3D2B1F]"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmClear}
              className="bg-[#C0392B] hover:bg-[#A93226] text-white font-mono"
            >
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
