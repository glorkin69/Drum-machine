/**
 * useCollabSession - Real-time collaboration session hook
 *
 * Manages joining/creating collaboration sessions, real-time sync
 * of pattern changes, participant tracking, and session chat.
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  CollabSession,
  SessionParticipant,
  ParticipantRole,
  SessionVisibility,
  SyncMessage,
  PatternUpdateData,
  CursorMoveData,
  ChatMessageData,
} from "@/lib/collab-types";
import { getParticipantColor, PARTICIPANT_COLORS } from "@/lib/collab-types";
import { collabSync } from "@/lib/collab-sync";
import type { DrumPattern, Genre, SongPart, Emotion, PatternLength } from "@/lib/drum-patterns";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  emoji?: string;
  timestamp: number;
}

export interface CollabSessionState {
  /** Current session (null if not in a session) */
  session: CollabSession | null;
  /** Current participants */
  participants: SessionParticipant[];
  /** Whether we're connected to the session */
  isConnected: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Chat messages */
  chatMessages: ChatMessage[];
  /** Remote cursors (other participants' cursor positions) */
  remoteCursors: Map<string, CursorMoveData & { color: string; name: string }>;
}

interface UseCollabSessionOptions {
  userId: string;
  userName: string;
  onPatternUpdate?: (data: PatternUpdateData) => void;
  onFullPatternSync?: (pattern: DrumPattern, patternLength: PatternLength) => void;
  onBpmChange?: (bpm: number) => void;
  onGenreChange?: (genre: Genre) => void;
  onPartChange?: (songPart: SongPart) => void;
  onEmotionChange?: (emotion: Emotion | null) => void;
}

export function useCollabSession(options: UseCollabSessionOptions) {
  const {
    userId,
    userName,
    onPatternUpdate,
    onFullPatternSync,
    onBpmChange,
    onGenreChange,
    onPartChange,
    onEmotionChange,
  } = options;

  const [state, setState] = useState<CollabSessionState>({
    session: null,
    participants: [],
    isConnected: false,
    isLoading: false,
    error: null,
    chatMessages: [],
    remoteCursors: new Map(),
  });

  const callbackRefs = useRef({
    onPatternUpdate,
    onFullPatternSync,
    onBpmChange,
    onGenreChange,
    onPartChange,
    onEmotionChange,
  });

  useEffect(() => {
    callbackRefs.current = {
      onPatternUpdate,
      onFullPatternSync,
      onBpmChange,
      onGenreChange,
      onPartChange,
      onEmotionChange,
    };
  }, [onPatternUpdate, onFullPatternSync, onBpmChange, onGenreChange, onPartChange, onEmotionChange]);

  // Set up SSE message handlers
  useEffect(() => {
    const handlePatternUpdate = (msg: SyncMessage) => {
      const data = msg.data as Record<string, unknown>;
      if (data.fullSync) {
        callbackRefs.current.onFullPatternSync?.(
          data.pattern as DrumPattern,
          data.patternLength as PatternLength
        );
      } else {
        callbackRefs.current.onPatternUpdate?.(data as unknown as PatternUpdateData);
      }
    };

    const handleCursorMove = (msg: SyncMessage) => {
      const data = msg.data as unknown as CursorMoveData;
      setState((prev) => {
        const cursors = new Map(prev.remoteCursors);
        const participant = prev.participants.find((p) => p.userId === msg.senderId);
        cursors.set(msg.senderId, {
          ...data,
          color: participant?.color || PARTICIPANT_COLORS[0],
          name: msg.senderName,
        });
        return { ...prev, remoteCursors: cursors };
      });
    };

    const handleBpmChange = (msg: SyncMessage) => {
      callbackRefs.current.onBpmChange?.(msg.data.bpm as number);
    };

    const handleGenreChange = (msg: SyncMessage) => {
      callbackRefs.current.onGenreChange?.(msg.data.genre as Genre);
    };

    const handlePartChange = (msg: SyncMessage) => {
      callbackRefs.current.onPartChange?.(msg.data.songPart as SongPart);
    };

    const handleEmotionChange = (msg: SyncMessage) => {
      callbackRefs.current.onEmotionChange?.(msg.data.emotion as Emotion | null);
    };

    const handleParticipantJoin = (msg: SyncMessage) => {
      const participant = msg.data as unknown as SessionParticipant;
      setState((prev) => ({
        ...prev,
        participants: [...prev.participants.filter((p) => p.userId !== participant.userId), participant],
      }));
    };

    const handleParticipantLeave = (msg: SyncMessage) => {
      setState((prev) => ({
        ...prev,
        participants: prev.participants.filter((p) => p.userId !== msg.senderId),
        remoteCursors: (() => {
          const c = new Map(prev.remoteCursors);
          c.delete(msg.senderId);
          return c;
        })(),
      }));
    };

    const handleChat = (msg: SyncMessage) => {
      const data = msg.data as unknown as ChatMessageData;
      const participant = state.participants.find((p) => p.userId === msg.senderId);
      const chatMsg: ChatMessage = {
        id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderColor: participant?.color || PARTICIPANT_COLORS[0],
        text: data.text,
        emoji: data.emoji,
        timestamp: msg.timestamp,
      };
      setState((prev) => ({
        ...prev,
        chatMessages: [...prev.chatMessages.slice(-99), chatMsg],
      }));
    };

    const handleSessionClosed = () => {
      collabSync.disconnect();
      setState((prev) => ({
        ...prev,
        session: null,
        participants: [],
        isConnected: false,
        error: "Session was closed by the host",
      }));
    };

    collabSync.on("pattern_update", handlePatternUpdate);
    collabSync.on("cursor_move", handleCursorMove);
    collabSync.on("bpm_change", handleBpmChange);
    collabSync.on("genre_change", handleGenreChange);
    collabSync.on("part_change", handlePartChange);
    collabSync.on("emotion_change", handleEmotionChange);
    collabSync.on("participant_join", handleParticipantJoin);
    collabSync.on("participant_leave", handleParticipantLeave);
    collabSync.on("chat_message", handleChat);
    collabSync.on("session_closed", handleSessionClosed);

    return () => {
      collabSync.off("pattern_update", handlePatternUpdate);
      collabSync.off("cursor_move", handleCursorMove);
      collabSync.off("bpm_change", handleBpmChange);
      collabSync.off("genre_change", handleGenreChange);
      collabSync.off("part_change", handlePartChange);
      collabSync.off("emotion_change", handleEmotionChange);
      collabSync.off("participant_join", handleParticipantJoin);
      collabSync.off("participant_leave", handleParticipantLeave);
      collabSync.off("chat_message", handleChat);
      collabSync.off("session_closed", handleSessionClosed);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.participants]);

  /** Create a new session */
  const createSession = useCallback(
    async (name: string, visibility: SessionVisibility = "private") => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch("/api/collab/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, visibility }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create session");
        }

        const session: CollabSession = await response.json();
        collabSync.connect(session.id, userId, userName);

        setState((prev) => ({
          ...prev,
          session,
          participants: session.participants,
          isConnected: true,
          isLoading: false,
        }));

        return session;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to create session";
        setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }));
        return null;
      }
    },
    [userId, userName]
  );

  /** Join an existing session by invite code */
  const joinSession = useCallback(
    async (inviteCode: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(`/api/collab/sessions/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteCode }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to join session");
        }

        const session: CollabSession = await response.json();
        collabSync.connect(session.id, userId, userName);

        setState((prev) => ({
          ...prev,
          session,
          participants: session.participants,
          isConnected: true,
          isLoading: false,
        }));

        return session;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to join session";
        setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }));
        return null;
      }
    },
    [userId, userName]
  );

  /** Leave the current session */
  const leaveSession = useCallback(async () => {
    if (!state.session) return;

    try {
      await fetch(`/api/collab/sessions/${state.session.id}/leave`, {
        method: "POST",
      });
    } catch {
      // Best effort
    }

    collabSync.disconnect();
    setState({
      session: null,
      participants: [],
      isConnected: false,
      isLoading: false,
      error: null,
      chatMessages: [],
      remoteCursors: new Map(),
    });
  }, [state.session]);

  /** Close the session (host only) */
  const closeSession = useCallback(async () => {
    if (!state.session) return;

    try {
      await fetch(`/api/collab/sessions/${state.session.id}`, {
        method: "DELETE",
      });
    } catch {
      // Best effort
    }

    collabSync.disconnect();
    setState({
      session: null,
      participants: [],
      isConnected: false,
      isLoading: false,
      error: null,
      chatMessages: [],
      remoteCursors: new Map(),
    });
  }, [state.session]);

  // Sync outbound methods
  const sendPatternUpdate = useCallback(
    (data: PatternUpdateData) => {
      if (state.isConnected) {
        collabSync.sendPatternUpdate(data);
      }
    },
    [state.isConnected]
  );

  const sendCursorMove = useCallback(
    (data: CursorMoveData) => {
      if (state.isConnected) {
        collabSync.sendCursorMove(data);
      }
    },
    [state.isConnected]
  );

  const sendBpmChange = useCallback(
    (bpm: number) => {
      if (state.isConnected) {
        collabSync.sendBpmChange(bpm);
      }
    },
    [state.isConnected]
  );

  const sendGenreChange = useCallback(
    (genre: Genre) => {
      if (state.isConnected) {
        collabSync.sendGenreChange(genre);
      }
    },
    [state.isConnected]
  );

  const sendPartChange = useCallback(
    (songPart: SongPart) => {
      if (state.isConnected) {
        collabSync.sendPartChange(songPart);
      }
    },
    [state.isConnected]
  );

  const sendEmotionChange = useCallback(
    (emotion: Emotion | null) => {
      if (state.isConnected) {
        collabSync.sendEmotionChange(emotion);
      }
    },
    [state.isConnected]
  );

  const sendFullPatternSync = useCallback(
    (pattern: DrumPattern, patternLength: PatternLength) => {
      if (state.isConnected) {
        collabSync.sendFullPatternSync(pattern, patternLength);
      }
    },
    [state.isConnected]
  );

  const sendChatMessage = useCallback(
    (text: string, emoji?: string) => {
      if (state.isConnected) {
        collabSync.sendChatMessage(text, emoji);
        // Add own message to local chat
        const chatMsg: ChatMessage = {
          id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          senderId: userId,
          senderName: userName,
          senderColor: state.participants.find((p) => p.userId === userId)?.color || PARTICIPANT_COLORS[0],
          text,
          emoji,
          timestamp: Date.now(),
        };
        setState((prev) => ({
          ...prev,
          chatMessages: [...prev.chatMessages.slice(-99), chatMsg],
        }));
      }
    },
    [state.isConnected, state.participants, userId, userName]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      collabSync.disconnect();
    };
  }, []);

  return {
    ...state,
    createSession,
    joinSession,
    leaveSession,
    closeSession,
    sendPatternUpdate,
    sendCursorMove,
    sendBpmChange,
    sendGenreChange,
    sendPartChange,
    sendEmotionChange,
    sendFullPatternSync,
    sendChatMessage,
  };
}
