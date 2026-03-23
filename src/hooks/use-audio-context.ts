"use client";

import { useState, useEffect, useCallback } from "react";
import {
  audioContextManager,
  type AudioContextState,
  type AudioIssue,
} from "@/lib/audio-context-manager";

export interface AudioContextInfo {
  /** Current AudioContext state */
  state: AudioContextState;
  /** Current audio issue (suspended, silent-mode, etc.) */
  issue: AudioIssue;
  /** Whether audio is ready to play */
  isReady: boolean;
  /** Whether the device is iOS */
  isIOS: boolean;
  /** Whether there is an audio issue that needs user attention */
  needsAttention: boolean;
  /** Attempt to unlock/resume the audio context (call from user gesture) */
  unlock: () => Promise<boolean>;
  /** Whether the banner has been dismissed by the user */
  isDismissed: boolean;
  /** Dismiss the audio banner */
  dismiss: () => void;
}

export function useAudioContext(): AudioContextInfo {
  const [state, setState] = useState<AudioContextState>("uninitialized");
  const [issue, setIssue] = useState<AudioIssue>("none");
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = audioContextManager.subscribe((newState, newIssue) => {
      setState(newState);
      setIssue(newIssue);

      // Auto-dismiss when issue is resolved
      if (newIssue === "none" && newState === "running") {
        // Keep dismissed if user manually dismissed
      }
    });

    return unsubscribe;
  }, []);

  const unlock = useCallback(async () => {
    const success = await audioContextManager.unlock();
    if (success) {
      setIsDismissed(true);
    }
    return success;
  }, []);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
  }, []);

  const isReady = state === "running" && issue === "none";
  const isIOS = audioContextManager.getIsIOS();
  const needsAttention = !isDismissed && (
    issue === "suspended" ||
    issue === "silent-mode" ||
    (state === "suspended" && audioContextManager.wasUnlockAttempted())
  );

  return {
    state,
    issue,
    isReady,
    isIOS,
    needsAttention,
    unlock,
    isDismissed,
    dismiss,
  };
}
