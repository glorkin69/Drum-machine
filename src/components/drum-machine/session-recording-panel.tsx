"use client";

import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  CircleDot,
  Square,
  Pause,
  Play,
  SkipBack,
  Save,
  Trash2,
  ChevronDown,
  ChevronRight,
  Clock,
  Activity,
} from "lucide-react";
import type { RecordingState, RecordingPlaybackState, SessionRecording } from "@/lib/collab-types";

interface SessionRecordingPanelProps {
  recordingState: RecordingState;
  duration: number;
  eventCount: number;
  playbackState: RecordingPlaybackState;
  savedRecordings: SessionRecording[];
  formatDuration: (ms: number) => string;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onStopRecording: () => void;
  onResetRecording: () => void;
  onSaveRecording: (name: string) => void;
  onLoadRecording: (recording: SessionRecording) => void;
  onStartPlayback: () => void;
  onPausePlayback: () => void;
  onStopPlayback: () => void;
  onDeleteRecording?: (id: string) => void;
}

export function SessionRecordingPanel({
  recordingState,
  duration,
  eventCount,
  playbackState,
  savedRecordings,
  formatDuration,
  onStartRecording,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
  onResetRecording,
  onSaveRecording,
  onLoadRecording,
  onStartPlayback,
  onPausePlayback,
  onStopPlayback,
}: SessionRecordingPanelProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);

  const [expanded, setExpanded] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [recordingName, setRecordingName] = useState("");
  const [showRecordingsList, setShowRecordingsList] = useState(false);

  const handleSave = () => {
    if (recordingName.trim()) {
      onSaveRecording(recordingName.trim());
      setRecordingName("");
      setShowSaveDialog(false);
    }
  };

  const isRecording = recordingState === "recording";
  const isPaused = recordingState === "paused";
  const isStopped = recordingState === "stopped";

  return (
    <div className="vintage-panel" style={{ borderColor: tc.panelBorder }} data-tour="session-recording">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3"
        style={{ color: tc.textPrimary }}
      >
        <div className="flex items-center gap-2">
          <CircleDot
            className="w-4 h-4"
            style={{ color: isRecording ? tc.accentRed : tc.textMuted }}
          />
          <span className="vintage-label" style={{ color: tc.textPrimary, fontSize: "0.75rem" }}>
            SESSION REC
          </span>
          {isRecording && (
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: tc.accentRed }}
            />
          )}
          {(isRecording || isPaused) && (
            <span className="font-mono text-xs" style={{ color: tc.displayText }}>
              {formatDuration(duration)}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4" style={{ color: tc.textMuted }} />
        ) : (
          <ChevronRight className="w-4 h-4" style={{ color: tc.textMuted }} />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Recording display */}
          <div
            className="rounded-lg p-2 flex items-center justify-between"
            style={{
              backgroundColor: tc.displayBg,
              border: `1px solid ${isRecording ? tc.accentRed : tc.displayBorder}`,
              boxShadow: isRecording ? `0 0 6px ${tc.accentRed}40` : "none",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: isRecording
                    ? tc.accentRed
                    : isPaused
                    ? tc.accentAmber
                    : isStopped
                    ? tc.textMuted
                    : "transparent",
                  boxShadow: isRecording ? `0 0 6px ${tc.accentRed}` : "none",
                }}
              />
              <span className="font-mono text-sm" style={{ color: tc.displayText }}>
                {formatDuration(duration)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3" style={{ color: tc.textMuted }} />
              <span className="font-mono text-[10px]" style={{ color: tc.textMuted }}>
                {eventCount} events
              </span>
            </div>
          </div>

          {/* Recording controls */}
          <div className="flex items-center gap-1.5">
            {recordingState === "idle" ? (
              <Button
                size="sm"
                className="flex-1 text-xs vintage-button"
                onClick={onStartRecording}
                style={{
                  backgroundColor: tc.accentRed,
                  color: "#fff",
                  border: `1px solid ${tc.accentRed}`,
                }}
              >
                <CircleDot className="w-3 h-3 mr-1" />
                Record
              </Button>
            ) : isRecording ? (
              <>
                <Button
                  size="sm"
                  className="flex-1 text-xs vintage-button"
                  onClick={onPauseRecording}
                  style={{
                    backgroundColor: tc.accentAmber,
                    color: "#000",
                    border: `1px solid ${tc.accentAmber}`,
                  }}
                >
                  <Pause className="w-3 h-3 mr-1" />
                  Pause
                </Button>
                <Button
                  size="sm"
                  className="flex-1 text-xs vintage-button"
                  onClick={onStopRecording}
                  style={{
                    backgroundColor: tc.panelBg,
                    color: tc.textPrimary,
                    border: `1px solid ${tc.panelBorder}`,
                  }}
                >
                  <Square className="w-3 h-3 mr-1" />
                  Stop
                </Button>
              </>
            ) : isPaused ? (
              <>
                <Button
                  size="sm"
                  className="flex-1 text-xs vintage-button"
                  onClick={onResumeRecording}
                  style={{
                    backgroundColor: tc.accentRed,
                    color: "#fff",
                    border: `1px solid ${tc.accentRed}`,
                  }}
                >
                  <CircleDot className="w-3 h-3 mr-1" />
                  Resume
                </Button>
                <Button
                  size="sm"
                  className="flex-1 text-xs vintage-button"
                  onClick={onStopRecording}
                  style={{
                    backgroundColor: tc.panelBg,
                    color: tc.textPrimary,
                    border: `1px solid ${tc.panelBorder}`,
                  }}
                >
                  <Square className="w-3 h-3 mr-1" />
                  Stop
                </Button>
              </>
            ) : (
              /* Stopped */
              <>
                <Button
                  size="sm"
                  className="flex-1 text-xs vintage-button"
                  onClick={() => setShowSaveDialog(true)}
                  disabled={eventCount === 0}
                  style={{
                    backgroundColor: tc.accentGreen,
                    color: "#fff",
                    border: `1px solid ${tc.accentGreen}`,
                  }}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  className="flex-1 text-xs vintage-button"
                  onClick={onResetRecording}
                  style={{
                    backgroundColor: tc.panelBg,
                    color: tc.textPrimary,
                    border: `1px solid ${tc.panelBorder}`,
                  }}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Discard
                </Button>
              </>
            )}
          </div>

          {/* Saved recordings */}
          {savedRecordings.length > 0 && (
            <div>
              <button
                onClick={() => setShowRecordingsList(!showRecordingsList)}
                className="flex items-center gap-1 w-full"
              >
                <span className="vintage-label text-[10px]" style={{ color: tc.textMuted }}>
                  SAVED ({savedRecordings.length})
                </span>
                {showRecordingsList ? (
                  <ChevronDown className="w-3 h-3" style={{ color: tc.textMuted }} />
                ) : (
                  <ChevronRight className="w-3 h-3" style={{ color: tc.textMuted }} />
                )}
              </button>

              {showRecordingsList && (
                <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                  {savedRecordings.map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => onLoadRecording(rec)}
                      className="w-full flex items-center justify-between p-1.5 rounded text-left hover:opacity-80"
                      style={{
                        backgroundColor: tc.inputBg,
                        border: `1px solid ${tc.panelBorder}`,
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs truncate block" style={{ color: tc.textPrimary }}>
                          {rec.name}
                        </span>
                        <span className="text-[9px]" style={{ color: tc.textMuted }}>
                          {formatDuration(rec.duration)} · {rec.participants?.length || 0} players
                        </span>
                      </div>
                      <Play className="w-3 h-3 flex-shrink-0 ml-1" style={{ color: tc.accentGreen }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Playback controls */}
          {playbackState.duration > 0 && (
            <div className="space-y-1">
              <span className="vintage-label text-[10px]" style={{ color: tc.textMuted }}>
                PLAYBACK
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  className="w-7 h-7 p-0"
                  onClick={onStopPlayback}
                  style={{ backgroundColor: tc.panelBg, border: `1px solid ${tc.panelBorder}` }}
                >
                  <SkipBack className="w-3 h-3" style={{ color: tc.textPrimary }} />
                </Button>
                {playbackState.isPlaying ? (
                  <Button
                    size="sm"
                    className="w-7 h-7 p-0"
                    onClick={onPausePlayback}
                    style={{ backgroundColor: tc.accentAmber, border: `1px solid ${tc.accentAmber}` }}
                  >
                    <Pause className="w-3 h-3" style={{ color: "#000" }} />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-7 h-7 p-0"
                    onClick={onStartPlayback}
                    style={{ backgroundColor: tc.accentGreen, border: `1px solid ${tc.accentGreen}` }}
                  >
                    <Play className="w-3 h-3" style={{ color: "#fff" }} />
                  </Button>
                )}
                <div className="flex-1 flex items-center gap-1">
                  <span className="text-[9px] font-mono" style={{ color: tc.displayText }}>
                    {formatDuration(playbackState.currentTime)}
                  </span>
                  <div
                    className="flex-1 h-1 rounded-full overflow-hidden"
                    style={{ backgroundColor: tc.panelBorder }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: tc.accentGreen,
                        width: `${(playbackState.currentTime / playbackState.duration) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-mono" style={{ color: tc.textMuted }}>
                    {formatDuration(playbackState.duration)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent style={{ backgroundColor: tc.panelBg, borderColor: tc.panelBorder }}>
          <DialogHeader>
            <DialogTitle style={{ color: tc.textPrimary }} className="font-mono">
              <Save className="w-4 h-4 inline-block mr-2" style={{ color: tc.accentGreen }} />
              SAVE RECORDING
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="vintage-label text-xs" style={{ color: tc.textMuted }}>
                RECORDING NAME
              </label>
              <Input
                value={recordingName}
                onChange={(e) => setRecordingName(e.target.value)}
                placeholder="My Jam Recording"
                maxLength={100}
                className="mt-1"
                style={{
                  backgroundColor: tc.inputBg,
                  color: tc.textPrimary,
                  borderColor: tc.panelBorder,
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: tc.textMuted }}>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(duration)}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {eventCount} events
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowSaveDialog(false)}
              variant="outline"
              size="sm"
              style={{ color: tc.textMuted, borderColor: tc.panelBorder }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              disabled={!recordingName.trim()}
              style={{ backgroundColor: tc.accentGreen, color: "#fff" }}
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
