"use client";

import { useState, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Users,
  Plus,
  LogIn,
  LogOut,
  Copy,
  Check,
  Crown,
  Eye,
  Wifi,
  WifiOff,
  Send,
  ChevronDown,
  ChevronRight,
  X,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import type { CollabSession, SessionParticipant, SessionVisibility } from "@/lib/collab-types";
import type { ChatMessage } from "@/hooks/use-collab-session";
import type { CursorMoveData } from "@/lib/collab-types";

interface CollabPanelProps {
  session: CollabSession | null;
  participants: SessionParticipant[];
  isConnected: boolean;
  isLoading: boolean;
  chatMessages: ChatMessage[];
  remoteCursors: Map<string, CursorMoveData & { color: string; name: string }>;
  isGuest: boolean;
  onCreateSession: (name: string, visibility: SessionVisibility) => Promise<CollabSession | null>;
  onJoinSession: (inviteCode: string) => Promise<CollabSession | null>;
  onLeaveSession: () => Promise<void>;
  onCloseSession: () => Promise<void>;
  onSendChat: (text: string, emoji?: string) => void;
  userId: string;
}

export function CollabPanel({
  session,
  participants,
  isConnected,
  isLoading,
  chatMessages,
  isGuest,
  onCreateSession,
  onJoinSession,
  onLeaveSession,
  onCloseSession,
  onSendChat,
  userId,
}: CollabPanelProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);

  const [expanded, setExpanded] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatExpanded, setChatExpanded] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!sessionName.trim()) return;
    const result = await onCreateSession(sessionName.trim(), "private");
    if (result) {
      setShowCreateDialog(false);
      setSessionName("");
      setExpanded(true);
      toast.success("Jam session created!");
    }
  }, [sessionName, onCreateSession]);

  const handleJoin = useCallback(async () => {
    if (!inviteCode.trim()) return;
    const result = await onJoinSession(inviteCode.trim().toUpperCase());
    if (result) {
      setShowJoinDialog(false);
      setInviteCode("");
      setExpanded(true);
      toast.success("Joined jam session!");
    }
  }, [inviteCode, onJoinSession]);

  const copyInviteCode = useCallback(() => {
    if (session?.inviteCode) {
      navigator.clipboard.writeText(session.inviteCode);
      setCodeCopied(true);
      toast.success("Invite code copied!");
      setTimeout(() => setCodeCopied(false), 2000);
    }
  }, [session?.inviteCode]);

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    onSendChat(chatInput.trim());
    setChatInput("");
  }, [chatInput, onSendChat]);

  const isHost = session?.hostId === userId;

  if (isGuest) {
    return null; // Guests can't collaborate
  }

  return (
    <div className="vintage-panel" style={{ borderColor: tc.panelBorder }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3"
        style={{ color: tc.textPrimary }}
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" style={{ color: tc.accentBlue }} />
          <span className="vintage-label" style={{ color: tc.textPrimary, fontSize: "0.75rem" }}>
            LIVE JAM
          </span>
          {session && (
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: isConnected ? tc.accentGreen : tc.accentRed }}
              />
              <span className="text-xs" style={{ color: tc.textMuted }}>
                {participants.length}/4
              </span>
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
          {!session ? (
            /* No active session - show create/join buttons */
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 vintage-button text-xs"
                style={{
                  backgroundColor: tc.accentBlue,
                  color: "#fff",
                  border: `1px solid ${tc.accentBlue}`,
                }}
                onClick={() => setShowCreateDialog(true)}
                disabled={isLoading}
              >
                <Plus className="w-3 h-3 mr-1" />
                Create
              </Button>
              <Button
                size="sm"
                className="flex-1 vintage-button text-xs"
                style={{
                  backgroundColor: tc.panelBg,
                  color: tc.textPrimary,
                  border: `1px solid ${tc.panelBorder}`,
                }}
                onClick={() => setShowJoinDialog(true)}
                disabled={isLoading}
              >
                <LogIn className="w-3 h-3 mr-1" />
                Join
              </Button>
            </div>
          ) : (
            /* Active session */
            <>
              {/* Session info */}
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: tc.displayBg, border: `1px solid ${tc.displayBorder}` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs truncate" style={{ color: tc.displayText }}>
                    {session.name}
                  </span>
                  <span className="flex items-center gap-1">
                    {isConnected ? (
                      <Wifi className="w-3 h-3" style={{ color: tc.accentGreen }} />
                    ) : (
                      <WifiOff className="w-3 h-3" style={{ color: tc.accentRed }} />
                    )}
                  </span>
                </div>

                {/* Invite code */}
                {session.inviteCode && isHost && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
                      Code:
                    </span>
                    <span className="font-mono text-xs tracking-widest" style={{ color: tc.accentOrange }}>
                      {session.inviteCode}
                    </span>
                    <button
                      onClick={copyInviteCode}
                      className="p-0.5 rounded hover:opacity-80"
                      title="Copy invite code"
                    >
                      {codeCopied ? (
                        <Check className="w-3 h-3" style={{ color: tc.accentGreen }} />
                      ) : (
                        <Copy className="w-3 h-3" style={{ color: tc.textMuted }} />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Participants */}
              <div className="space-y-1">
                <span className="vintage-label text-[10px]" style={{ color: tc.textMuted }}>
                  PARTICIPANTS
                </span>
                {participants.map((p) => (
                  <div
                    key={p.userId}
                    className="flex items-center gap-2 px-2 py-1 rounded"
                    style={{ backgroundColor: `${p.color}15` }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-xs truncate flex-1" style={{ color: tc.textPrimary }}>
                      {p.userName}
                      {p.userId === userId && (
                        <span style={{ color: tc.textMuted }}> (you)</span>
                      )}
                    </span>
                    {p.role === "host" && (
                      <Crown className="w-3 h-3 flex-shrink-0" style={{ color: tc.accentAmber }} />
                    )}
                    {p.role === "viewer" && (
                      <Eye className="w-3 h-3 flex-shrink-0" style={{ color: tc.textMuted }} />
                    )}
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: p.status === "connected" ? tc.accentGreen : tc.accentRed,
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Chat */}
              <div>
                <button
                  onClick={() => setChatExpanded(!chatExpanded)}
                  className="flex items-center gap-1 w-full"
                >
                  <span className="vintage-label text-[10px]" style={{ color: tc.textMuted }}>
                    CHAT
                  </span>
                  {chatExpanded ? (
                    <ChevronDown className="w-3 h-3" style={{ color: tc.textMuted }} />
                  ) : (
                    <ChevronRight className="w-3 h-3" style={{ color: tc.textMuted }} />
                  )}
                </button>

                {chatExpanded && (
                  <div className="mt-1 space-y-1">
                    <div
                      className="h-24 overflow-y-auto rounded p-1.5 space-y-0.5"
                      style={{
                        backgroundColor: tc.displayBg,
                        border: `1px solid ${tc.displayBorder}`,
                      }}
                    >
                      {chatMessages.length === 0 ? (
                        <p className="text-[10px] italic" style={{ color: tc.textMuted }}>
                          No messages yet...
                        </p>
                      ) : (
                        chatMessages.map((msg) => (
                          <div key={msg.id} className="text-[10px]">
                            <span style={{ color: msg.senderColor }} className="font-bold">
                              {msg.senderName}:
                            </span>{" "}
                            <span style={{ color: tc.textPrimary }}>{msg.text}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                        placeholder="Message..."
                        className="h-7 text-xs"
                        style={{
                          backgroundColor: tc.inputBg,
                          color: tc.textPrimary,
                          borderColor: tc.panelBorder,
                        }}
                      />
                      <Button
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={handleSendChat}
                        style={{ backgroundColor: tc.accentBlue }}
                      >
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Leave/Close */}
              <div className="pt-1">
                {isHost ? (
                  <Button
                    size="sm"
                    className="w-full text-xs vintage-button"
                    style={{
                      backgroundColor: tc.accentRed,
                      color: "#fff",
                      border: `1px solid ${tc.accentRed}`,
                    }}
                    onClick={onCloseSession}
                  >
                    <X className="w-3 h-3 mr-1" />
                    End Session
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full text-xs vintage-button"
                    style={{
                      backgroundColor: tc.panelBg,
                      color: tc.textPrimary,
                      border: `1px solid ${tc.panelBorder}`,
                    }}
                    onClick={onLeaveSession}
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Leave Session
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Create Session Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent style={{ backgroundColor: tc.panelBg, borderColor: tc.panelBorder }}>
          <DialogHeader>
            <DialogTitle style={{ color: tc.textPrimary }} className="font-mono">
              <Radio className="w-4 h-4 inline-block mr-2" style={{ color: tc.accentBlue }} />
              CREATE JAM SESSION
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="vintage-label text-xs" style={{ color: tc.textMuted }}>
                SESSION NAME
              </label>
              <Input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="My Jam Session"
                maxLength={100}
                className="mt-1"
                style={{
                  backgroundColor: tc.inputBg,
                  color: tc.textPrimary,
                  borderColor: tc.panelBorder,
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <p className="text-xs" style={{ color: tc.textMuted }}>
              Up to 4 people can jam together in real-time. Share the invite code with friends to collaborate.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowCreateDialog(false)}
              variant="outline"
              size="sm"
              style={{ color: tc.textMuted, borderColor: tc.panelBorder }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              size="sm"
              disabled={!sessionName.trim() || isLoading}
              style={{ backgroundColor: tc.accentBlue, color: "#fff" }}
            >
              <Plus className="w-3 h-3 mr-1" />
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Session Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent style={{ backgroundColor: tc.panelBg, borderColor: tc.panelBorder }}>
          <DialogHeader>
            <DialogTitle style={{ color: tc.textPrimary }} className="font-mono">
              <LogIn className="w-4 h-4 inline-block mr-2" style={{ color: tc.accentBlue }} />
              JOIN JAM SESSION
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="vintage-label text-xs" style={{ color: tc.textMuted }}>
                INVITE CODE
              </label>
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABCDEF"
                maxLength={6}
                className="mt-1 font-mono tracking-widest text-center text-lg"
                style={{
                  backgroundColor: tc.inputBg,
                  color: tc.accentOrange,
                  borderColor: tc.panelBorder,
                }}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
            </div>
            <p className="text-xs" style={{ color: tc.textMuted }}>
              Enter the 6-character invite code from the session host.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowJoinDialog(false)}
              variant="outline"
              size="sm"
              style={{ color: tc.textMuted, borderColor: tc.panelBorder }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              size="sm"
              disabled={inviteCode.trim().length < 6 || isLoading}
              style={{ backgroundColor: tc.accentBlue, color: "#fff" }}
            >
              <LogIn className="w-3 h-3 mr-1" />
              Join
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
