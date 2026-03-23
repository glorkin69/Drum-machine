"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";
import { Button } from "@/components/ui/button";
import {
  Radio,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Eye,
  Tv,
} from "lucide-react";

interface StreamControlsProps {
  isCollabActive: boolean;
}

type StreamPlatform = "twitch" | "youtube";

export function StreamControls({ isCollabActive }: StreamControlsProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);

  const [expanded, setExpanded] = useState(false);
  const [platform, setPlatform] = useState<StreamPlatform>("twitch");
  const [isLive, setIsLive] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(false);
  const [streamDuration, setStreamDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stream duration timer
  useEffect(() => {
    if (isLive) {
      setStreamDuration(0);
      timerRef.current = setInterval(() => {
        setStreamDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setStreamDuration(0);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLive]);

  const formatDuration = (totalSeconds: number): string => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (!isCollabActive) return null;

  return (
    <div className="vintage-panel" style={{ borderColor: tc.panelBorder }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3"
        style={{ color: tc.textPrimary }}
      >
        <div className="flex items-center gap-2">
          <Radio
            className="w-4 h-4"
            style={{ color: isLive ? tc.accentRed : tc.textMuted }}
          />
          <span className="vintage-label" style={{ color: tc.textPrimary, fontSize: "0.75rem" }}>
            LIVE STREAM
          </span>
          {isLive && (
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: tc.accentRed }}
            />
          )}
          {isLive && (
            <span className="font-mono text-xs" style={{ color: tc.displayText }}>
              {formatDuration(streamDuration)}
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
          {/* Platform selector */}
          <div>
            <span className="vintage-label text-[10px]" style={{ color: tc.textMuted }}>
              PLATFORM
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <Button
                size="sm"
                className="flex-1 text-xs vintage-button"
                onClick={() => setPlatform("twitch")}
                style={{
                  backgroundColor: platform === "twitch" ? "#9146FF" : tc.panelBg,
                  color: platform === "twitch" ? "#fff" : tc.textPrimary,
                  border: `1px solid ${platform === "twitch" ? "#9146FF" : tc.panelBorder}`,
                }}
              >
                <Tv className="w-3 h-3 mr-1" />
                Twitch
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs vintage-button"
                onClick={() => setPlatform("youtube")}
                style={{
                  backgroundColor: platform === "youtube" ? "#FF0000" : tc.panelBg,
                  color: platform === "youtube" ? "#fff" : tc.textPrimary,
                  border: `1px solid ${platform === "youtube" ? "#FF0000" : tc.panelBorder}`,
                }}
              >
                <Tv className="w-3 h-3 mr-1" />
                YouTube
              </Button>
            </div>
          </div>

          {/* Go Live button */}
          <Button
            size="sm"
            className="w-full text-xs vintage-button"
            onClick={() => setIsLive(!isLive)}
            style={{
              backgroundColor: isLive ? tc.accentRed : tc.accentGreen,
              color: "#fff",
              border: `1px solid ${isLive ? tc.accentRed : tc.accentGreen}`,
            }}
          >
            <Radio className="w-3 h-3 mr-1" />
            {isLive ? "End Stream" : "Go Live"}
          </Button>

          {/* Live status display */}
          {isLive && (
            <div
              className="rounded-lg p-2 space-y-2"
              style={{
                backgroundColor: tc.displayBg,
                border: `1px solid ${tc.accentRed}`,
                boxShadow: `0 0 6px ${tc.accentRed}40`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: tc.accentRed }}
                  />
                  <span className="font-mono text-xs font-bold" style={{ color: tc.accentRed }}>
                    LIVE
                  </span>
                </div>
                <span className="font-mono text-xs" style={{ color: tc.displayText }}>
                  {formatDuration(streamDuration)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" style={{ color: tc.textMuted }} />
                  <span className="font-mono text-[10px]" style={{ color: tc.textMuted }}>
                    0 viewers
                  </span>
                </div>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                  style={{
                    backgroundColor: platform === "twitch" ? "#9146FF" : "#FF0000",
                    color: "#fff",
                  }}
                >
                  {platform === "twitch" ? "TWITCH" : "YOUTUBE"}
                </span>
              </div>
            </div>
          )}

          {/* Audience chat toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3" style={{ color: tc.textMuted }} />
              <span className="vintage-label text-[10px]" style={{ color: tc.textMuted }}>
                AUDIENCE CHAT
              </span>
            </div>
            <Button
              size="sm"
              className="text-[10px] px-2 py-0.5 h-auto vintage-button"
              onClick={() => setChatEnabled(!chatEnabled)}
              style={{
                backgroundColor: chatEnabled ? tc.accentGreen : tc.panelBg,
                color: chatEnabled ? "#fff" : tc.textMuted,
                border: `1px solid ${chatEnabled ? tc.accentGreen : tc.panelBorder}`,
              }}
            >
              {chatEnabled ? "ON" : "OFF"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
