"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX, X, Smartphone } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";
import type { AudioContextState, AudioIssue } from "@/lib/audio-context-manager";

interface AudioUnlockBannerProps {
  state: AudioContextState;
  issue: AudioIssue;
  isIOS: boolean;
  needsAttention: boolean;
  onUnlock: () => Promise<boolean>;
  onDismiss: () => void;
}

export function AudioUnlockBanner({
  state,
  issue,
  isIOS,
  needsAttention,
  onUnlock,
  onDismiss,
}: AudioUnlockBannerProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  // Flashing indicator when audio can't play
  useEffect(() => {
    if (!needsAttention) return;
    const interval = setInterval(() => {
      setFlashActive((prev) => !prev);
    }, 800);
    return () => clearInterval(interval);
  }, [needsAttention]);

  if (!needsAttention) return null;

  const handleUnlock = async () => {
    setIsUnlocking(true);
    try {
      await onUnlock();
    } finally {
      setIsUnlocking(false);
    }
  };

  const isSilentMode = issue === "silent-mode";
  const isSuspended = issue === "suspended" || state === "suspended";

  return (
    <div
      className="rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 transition-all"
      style={{
        backgroundColor: isSilentMode ? `${tc.accentOrange}15` : `${tc.accentBlue}15`,
        border: `1px solid ${isSilentMode ? tc.accentOrange : tc.accentBlue}40`,
        boxShadow: flashActive
          ? `0 0 16px ${isSilentMode ? tc.accentOrange : tc.accentBlue}30`
          : "none",
      }}
    >
      {/* Icon & Message */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            backgroundColor: isSilentMode
              ? `${tc.accentOrange}25`
              : `${tc.accentBlue}25`,
            boxShadow: flashActive
              ? `0 0 12px ${isSilentMode ? tc.accentOrange : tc.accentBlue}50`
              : "none",
          }}
        >
          {isSilentMode ? (
            <VolumeX
              className="w-5 h-5"
              style={{ color: tc.accentOrange }}
            />
          ) : (
            <Volume2
              className="w-5 h-5"
              style={{ color: tc.accentBlue }}
            />
          )}
        </div>

        <div className="min-w-0">
          <p
            className="text-sm font-mono font-bold tracking-wide"
            style={{
              color: isSilentMode ? tc.accentOrange : tc.accentBlue,
            }}
          >
            {isSilentMode ? "SILENT MODE DETECTED" : "AUDIO SUSPENDED"}
          </p>
          <p
            className="text-xs font-mono mt-0.5 truncate"
            style={{ color: tc.textMuted }}
          >
            {isSilentMode ? (
              isIOS ? (
                <>
                  <Smartphone
                    className="w-3 h-3 inline mr-1"
                    style={{ verticalAlign: "text-bottom" }}
                  />
                  Flip the silent switch on the side of your device to enable sound
                </>
              ) : (
                "Your device is muted. Check your volume settings."
              )
            ) : (
              "Tap the button to enable audio playback"
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isSilentMode && (
          <button
            onClick={handleUnlock}
            disabled={isUnlocking}
            className="rounded-lg px-4 py-2 text-xs font-mono font-bold tracking-wider text-white transition-all active:scale-95"
            style={{
              backgroundColor: tc.accentBlue,
              boxShadow: `0 0 12px ${tc.accentBlue}40`,
              opacity: isUnlocking ? 0.7 : 1,
            }}
          >
            {isUnlocking ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ENABLING...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                ENABLE AUDIO
              </span>
            )}
          </button>
        )}

        {isSilentMode && isIOS && (
          <div
            className="rounded-lg px-3 py-2 text-[10px] font-mono leading-relaxed"
            style={{
              backgroundColor: `${tc.accentOrange}10`,
              border: `1px solid ${tc.accentOrange}25`,
              color: tc.textMuted,
            }}
          >
            <p className="font-bold" style={{ color: tc.accentOrange }}>
              HOW TO FIX:
            </p>
            <p>1. Find the switch on the left side of your device</p>
            <p>2. Flip it so no orange is showing</p>
            <p>3. Turn up the volume</p>
          </div>
        )}

        <button
          onClick={onDismiss}
          className="rounded-lg p-1.5 transition-colors hover:opacity-80"
          style={{ color: tc.textMuted }}
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
