/**
 * Collaboration Sync Manager for BeatForge 808
 *
 * Manages real-time synchronization between collaboration session
 * participants using Server-Sent Events (SSE) for server-to-client
 * and POST requests for client-to-server communication.
 */

import type { SyncMessage, SyncMessageType, PatternUpdateData, CursorMoveData } from "./collab-types";
import type { DrumPattern, Genre, SongPart, Emotion, PatternLength } from "./drum-patterns";

export type SyncEventHandler = (message: SyncMessage) => void;

export class CollabSyncManager {
  private sessionId: string | null = null;
  private userId: string | null = null;
  private userName: string | null = null;
  private eventSource: EventSource | null = null;
  private handlers: Map<SyncMessageType, SyncEventHandler[]> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  /** Connect to a collaboration session */
  connect(sessionId: string, userId: string, userName: string): void {
    this.sessionId = sessionId;
    this.userId = userId;
    this.userName = userName;
    this.reconnectAttempts = 0;
    this.startSSE();
    this.startHeartbeat();
  }

  /** Disconnect from the session */
  disconnect(): void {
    this.stopSSE();
    this.stopHeartbeat();
    this.sessionId = null;
    this.userId = null;
    this.userName = null;
    this.connected = false;
    this.reconnectAttempts = 0;
  }

  /** Register a handler for a specific message type */
  on(type: SyncMessageType, handler: SyncEventHandler): void {
    const existing = this.handlers.get(type) || [];
    existing.push(handler);
    this.handlers.set(type, existing);
  }

  /** Remove a handler */
  off(type: SyncMessageType, handler: SyncEventHandler): void {
    const existing = this.handlers.get(type) || [];
    this.handlers.set(
      type,
      existing.filter((h) => h !== handler)
    );
  }

  /** Send a pattern update */
  async sendPatternUpdate(data: PatternUpdateData): Promise<void> {
    await this.sendMessage("pattern_update", data as unknown as Record<string, unknown>);
  }

  /** Send cursor position */
  async sendCursorMove(data: CursorMoveData): Promise<void> {
    await this.sendMessage("cursor_move", data as unknown as Record<string, unknown>);
  }

  /** Send BPM change */
  async sendBpmChange(bpm: number): Promise<void> {
    await this.sendMessage("bpm_change", { bpm });
  }

  /** Send genre change */
  async sendGenreChange(genre: Genre): Promise<void> {
    await this.sendMessage("genre_change", { genre });
  }

  /** Send song part change */
  async sendPartChange(songPart: SongPart): Promise<void> {
    await this.sendMessage("part_change", { songPart });
  }

  /** Send emotion change */
  async sendEmotionChange(emotion: Emotion | null): Promise<void> {
    await this.sendMessage("emotion_change", { emotion });
  }

  /** Send a full pattern sync (for initial sync or conflict resolution) */
  async sendFullPatternSync(
    pattern: DrumPattern,
    patternLength: PatternLength
  ): Promise<void> {
    await this.sendMessage("pattern_update", {
      fullSync: true,
      pattern,
      patternLength,
    });
  }

  /** Send a chat message */
  async sendChatMessage(text: string, emoji?: string): Promise<void> {
    await this.sendMessage("chat_message", { text, emoji });
  }

  /** Check if connected */
  isConnected(): boolean {
    return this.connected;
  }

  // ---- Private methods ----

  private startSSE(): void {
    if (!this.sessionId || !this.userId) return;
    this.stopSSE();

    const url = `/api/collab/sessions/${this.sessionId}/sync?userId=${encodeURIComponent(this.userId)}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      this.connected = true;
      this.reconnectAttempts = 0;
    };

    this.eventSource.onmessage = (event) => {
      try {
        const message: SyncMessage = JSON.parse(event.data);
        // Don't process our own messages
        if (message.senderId === this.userId) return;
        this.dispatchMessage(message);
      } catch {
        // Ignore parse errors
      }
    };

    this.eventSource.onerror = () => {
      this.connected = false;
      this.stopSSE();
      this.attemptReconnect();
    };
  }

  private stopSSE(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.startSSE();
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.connected) {
        this.sendMessage("heartbeat", {}).catch(() => {});
      }
    }, 15000); // Every 15 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private async sendMessage(type: SyncMessageType, data: Record<string, unknown>): Promise<void> {
    if (!this.sessionId || !this.userId || !this.userName) return;

    const message: SyncMessage = {
      type,
      sessionId: this.sessionId,
      senderId: this.userId,
      senderName: this.userName,
      timestamp: Date.now(),
      data,
    };

    try {
      await fetch(`/api/collab/sessions/${this.sessionId}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
    } catch {
      // Silently fail - SSE will handle reconnection
    }
  }

  private dispatchMessage(message: SyncMessage): void {
    const handlers = this.handlers.get(message.type) || [];
    for (const handler of handlers) {
      try {
        handler(message);
      } catch {
        // Don't let one bad handler break others
      }
    }
  }
}

/** Singleton sync manager */
export const collabSync = new CollabSyncManager();
