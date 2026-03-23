"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Loader2,
  ArrowLeft,
  Monitor,
  Smartphone,
  Globe,
  LogOut,
  Shield,
  Clock,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface SessionInfo {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  lastActiveAt: string;
  createdAt: string;
  tokenPrefix: string;
}

function parseUserAgent(ua: string | null): {
  device: string;
  browser: string;
  icon: typeof Monitor;
} {
  if (!ua)
    return { device: "Unknown Device", browser: "Unknown", icon: Monitor };

  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  const icon = isMobile ? Smartphone : Monitor;

  let browser = "Unknown Browser";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  let os = "";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return {
    device: os || (isMobile ? "Mobile" : "Desktop"),
    browser,
    icon,
  };
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sessions");
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      setSessions(data.sessions);
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSessions();
    }
  }, [status, fetchSessions]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleRevokeSession = async (sessionId: string) => {
    setActionLoading(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to revoke session");
      toast.success("Session revoked successfully");
      fetchSessions();
    } catch {
      toast.error("Failed to revoke session");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogoutAll = async () => {
    setActionLoading("all");
    try {
      const res = await fetch("/api/sessions", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to log out");
      const data = await res.json();
      toast.success(data.message);
      setShowLogoutAllDialog(false);
      fetchSessions();
    } catch {
      toast.error("Failed to log out other devices");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogoutEverywhere = async () => {
    setActionLoading("everywhere");
    try {
      await fetch("/api/sessions", { method: "DELETE" });
      // Also sign out current session
      await signOut({ callbackUrl: "/login" });
    } catch {
      toast.error("Failed to log out");
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-[#1A1410] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#E8732A] mx-auto mb-4" />
          <p className="text-[#A08060] font-mono text-sm tracking-wider">
            LOADING SETTINGS...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1410] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="vintage-panel rounded-xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#E8732A] shadow-[0_0_8px_rgba(232,115,42,0.6)]" />
              <h1 className="font-mono text-[#F5E6D3] text-xl md:text-2xl tracking-wider uppercase">
                Session Security
              </h1>
            </div>
            <Button
              onClick={() => router.push("/dashboard")}
              className="vintage-button text-[#F5E6D3] font-mono text-xs tracking-wider"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK TO MACHINE
            </Button>
          </div>
        </div>

        {/* Session Info */}
        <div className="vintage-panel rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-[#E8732A]" />
            <h2 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase">
              Account Info
            </h2>
          </div>
          <div className="bg-[#0A0A0A] rounded-lg border border-[#4A3728] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#A08060] font-mono text-xs uppercase tracking-wider">
                Email
              </span>
              <span className="text-[#F5E6D3] font-mono text-sm">
                {session.user.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A08060] font-mono text-xs uppercase tracking-wider">
                Role
              </span>
              <span className="text-[#E8732A] font-mono text-sm">
                {session.user.isAdmin ? "Administrator" : "User"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A08060] font-mono text-xs uppercase tracking-wider">
                Active Sessions
              </span>
              <span className="text-[#F5E6D3] font-mono text-sm">
                {sessions.length} / 3
              </span>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="vintage-panel rounded-xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-[#E8732A]" />
              <h2 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase">
                Active Sessions
              </h2>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowLogoutAllDialog(true)}
                disabled={sessions.length <= 1}
                className="bg-[#C0392B]/20 hover:bg-[#C0392B]/30 text-[#C0392B] border border-[#C0392B]/30 font-mono text-[0.65rem] uppercase tracking-wider h-8 px-3"
              >
                <LogOut className="w-3 h-3 mr-1.5" />
                Log Out Other Devices
              </Button>
            </div>
          </div>

          <p className="text-[#A08060] font-mono text-xs mb-4">
            Sessions auto-expire after 24 hours of inactivity. Maximum 3
            concurrent sessions allowed.
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#E8732A]" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#A08060] font-mono text-sm">
                No active sessions found.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => {
                const parsed = parseUserAgent(s.userAgent);
                const DeviceIcon = parsed.icon;
                const isRecent =
                  Date.now() - new Date(s.lastActiveAt).getTime() <
                  5 * 60 * 1000;

                return (
                  <div
                    key={s.id}
                    className="bg-[#0A0A0A] rounded-lg border border-[#4A3728] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-[#3D2B1F] flex items-center justify-center flex-shrink-0">
                          <DeviceIcon className="w-5 h-5 text-[#D4A574]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[#F5E6D3] font-mono text-sm">
                              {parsed.browser} on {parsed.device}
                            </p>
                            {isRecent && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#27AE60]/20 text-[#27AE60] font-mono text-[0.6rem] uppercase">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#27AE60] animate-pulse" />
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            {s.ipAddress && (
                              <span className="text-[#A08060] font-mono text-xs">
                                IP: {s.ipAddress}
                              </span>
                            )}
                            <span className="text-[#A08060] font-mono text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Last active:{" "}
                              {new Date(s.lastActiveAt).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[#A08060]/60 font-mono text-[0.6rem]">
                            Created:{" "}
                            {new Date(s.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleRevokeSession(s.id)}
                        disabled={actionLoading === s.id}
                        className="bg-[#C0392B]/20 hover:bg-[#C0392B]/30 text-[#C0392B] border border-[#C0392B]/30 font-mono text-[0.6rem] uppercase h-7 px-2 flex-shrink-0"
                        title="Revoke this session"
                      >
                        {actionLoading === s.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="vintage-panel rounded-xl p-4 md:p-6 border border-[#C0392B]/30">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-[#C0392B]" />
            <h2 className="font-mono text-[#C0392B] text-sm tracking-wider uppercase">
              Danger Zone
            </h2>
          </div>
          <p className="text-[#A08060] font-mono text-xs mb-4">
            This will log you out from ALL devices including this one. You will
            need to sign in again.
          </p>
          <Button
            onClick={handleLogoutEverywhere}
            disabled={actionLoading === "everywhere"}
            className="bg-[#C0392B] hover:bg-[#C0392B]/80 text-white font-mono text-xs tracking-wider"
          >
            {actionLoading === "everywhere" ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            LOG OUT ALL DEVICES (INCLUDING THIS ONE)
          </Button>
        </div>
      </div>

      {/* Log Out Other Devices Dialog */}
      <Dialog
        open={showLogoutAllDialog}
        onOpenChange={(open) => !open && setShowLogoutAllDialog(false)}
      >
        <DialogContent className="bg-[#2C1E14] border-[#4A3728] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#F5E6D3] font-mono tracking-wider flex items-center gap-2">
              <LogOut className="w-4 h-4 text-[#C0392B]" />
              LOG OUT OTHER DEVICES
            </DialogTitle>
            <DialogDescription className="text-[#A08060]">
              This will revoke all other active sessions except your current one.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-[#D4A574] font-mono text-xs">
              {sessions.length - 1} other session(s) will be logged out.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowLogoutAllDialog(false)}
              className="bg-[#3D2B1F] hover:bg-[#4A3728] text-[#D4A574] border border-[#4A3728] font-mono text-xs"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleLogoutAll}
              disabled={actionLoading === "all"}
              className="bg-[#C0392B] hover:bg-[#C0392B]/80 text-white font-mono text-xs"
            >
              {actionLoading === "all" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              LOG OUT OTHER DEVICES
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
