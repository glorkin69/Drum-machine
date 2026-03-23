// Audio Context Manager for iOS silent mode detection and audio unlocking
// Only import from client components

export type AudioContextState = "uninitialized" | "suspended" | "running" | "closed";

export type AudioIssue = "none" | "suspended" | "silent-mode" | "unavailable";

type AudioStateListener = (state: AudioContextState, issue: AudioIssue) => void;

class AudioContextManager {
  private audioContext: AudioContext | null = null;
  private listeners: Set<AudioStateListener> = new Set();
  private state: AudioContextState = "uninitialized";
  private issue: AudioIssue = "none";
  private silentModeCheckInterval: ReturnType<typeof setInterval> | null = null;
  private stateCheckInterval: ReturnType<typeof setInterval> | null = null;
  private isIOS: boolean = false;
  private unlockAttempted: boolean = false;

  constructor() {
    if (typeof navigator !== "undefined") {
      this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    }
  }

  /** Register the AudioContext created by the audio engine */
  registerContext(ctx: AudioContext): void {
    this.audioContext = ctx;
    this.updateState();

    // Listen for state changes
    ctx.onstatechange = () => {
      this.updateState();
    };

    // Start periodic state monitoring (iOS doesn't always fire onstatechange)
    this.startStateMonitoring();

    // On iOS, check for silent mode
    if (this.isIOS) {
      this.checkSilentMode();
    }
  }

  /** Attempt to unlock/resume audio context - must be called from user gesture */
  async unlock(): Promise<boolean> {
    if (!this.audioContext) return false;
    this.unlockAttempted = true;

    try {
      // Resume the audio context
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Play a silent buffer to fully unlock on iOS
      await this.playSilentBuffer();

      this.updateState();
      return this.audioContext.state === "running";
    } catch (err) {
      console.warn("Audio unlock failed:", err);
      this.updateState();
      return false;
    }
  }

  /** Check if audio context is in a usable state */
  isReady(): boolean {
    return this.audioContext?.state === "running";
  }

  /** Get current audio state */
  getState(): AudioContextState {
    return this.state;
  }

  /** Get current audio issue */
  getIssue(): AudioIssue {
    return this.issue;
  }

  /** Check if device is iOS */
  getIsIOS(): boolean {
    return this.isIOS;
  }

  /** Subscribe to state changes */
  subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.state, this.issue);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Detect iOS silent mode using oscillator timing analysis */
  async checkSilentMode(): Promise<boolean> {
    if (!this.audioContext || this.audioContext.state !== "running") {
      return false;
    }

    try {
      // Create a short oscillator and measure if it plays within expected time
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Set gain to 0 so user doesn't hear it
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      const startTime = this.audioContext.currentTime;
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.001);

      // Wait and check if the audio context is still running
      await new Promise(resolve => setTimeout(resolve, 50));

      // On iOS with silent mode, the AudioContext can sometimes report
      // "running" but audio output is muted at the hardware level.
      // We detect this by checking if the context's currentTime advances.
      const timeBefore = this.audioContext.currentTime;
      await new Promise(resolve => setTimeout(resolve, 100));
      const timeAfter = this.audioContext.currentTime;

      const timeAdvanced = (timeAfter - timeBefore) > 0.05;

      // Clean up
      try {
        oscillator.disconnect();
        gainNode.disconnect();
      } catch {
        // already disconnected
      }

      if (!timeAdvanced && this.audioContext.state === "running") {
        // Context is "running" but time isn't advancing - possible silent mode
        this.issue = "silent-mode";
        this.notifyListeners();
        return true;
      }

      // If we were previously in silent mode but time is now advancing, clear it
      if (this.issue === "silent-mode" && timeAdvanced) {
        this.issue = "none";
        this.notifyListeners();
      }

      return false;
    } catch {
      return false;
    }
  }

  /** Play a silent buffer - needed to unlock iOS audio */
  private async playSilentBuffer(): Promise<void> {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, 1, this.audioContext.sampleRate);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);

    // Wait for it to finish
    return new Promise((resolve) => {
      source.onended = () => {
        try { source.disconnect(); } catch { /* ignore */ }
        resolve();
      };
      // Fallback timeout
      setTimeout(resolve, 100);
    });
  }

  private updateState(): void {
    if (!this.audioContext) {
      this.state = "uninitialized";
      this.issue = "none";
    } else {
      this.state = this.audioContext.state as AudioContextState;

      if (this.state === "suspended") {
        this.issue = "suspended";
      } else if (this.state === "running" && this.issue === "suspended") {
        this.issue = "none";
      } else if (this.state === "closed") {
        this.issue = "unavailable";
      }
    }
    this.notifyListeners();
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.state, this.issue);
      } catch (err) {
        console.error("Audio state listener error:", err);
      }
    }
  }

  private startStateMonitoring(): void {
    // Clear existing
    if (this.stateCheckInterval) {
      clearInterval(this.stateCheckInterval);
    }

    // Check state every 2 seconds
    this.stateCheckInterval = setInterval(() => {
      if (!this.audioContext) return;

      const currentState = this.audioContext.state as AudioContextState;
      if (currentState !== this.state) {
        this.updateState();
      }

      // Periodically re-check silent mode on iOS
      if (this.isIOS && currentState === "running") {
        this.checkSilentMode();
      }
    }, 2000);
  }

  /** Whether unlock has been attempted at least once */
  wasUnlockAttempted(): boolean {
    return this.unlockAttempted;
  }

  dispose(): void {
    if (this.silentModeCheckInterval) {
      clearInterval(this.silentModeCheckInterval);
      this.silentModeCheckInterval = null;
    }
    if (this.stateCheckInterval) {
      clearInterval(this.stateCheckInterval);
      this.stateCheckInterval = null;
    }
    this.audioContext = null;
    this.state = "uninitialized";
    this.issue = "none";
    this.listeners.clear();
  }
}

export const audioContextManager = new AudioContextManager();
