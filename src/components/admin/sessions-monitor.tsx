"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Monitor,
  Smartphone,
  RefreshCw,
  Trash2,
  Clock,
  Users,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";

interface SessionsByUser {
  userId: string;
  email: string;
  name: string | null;
  activeSessions: number;
}

interface RecentSession {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  lastActiveAt: string;
  createdAt: string;
}

interface SessionStats {
  totalActiveSessions: number;
  uniqueUsers: number;
  sessionsByUser: SessionsByUser[];
  recentSessions: RecentSession[];
}

function getDeviceIcon(ua: string | null) {
  if (!ua) return Monitor;
  return /mobile|android|iphone|ipad/i.test(ua) ? Smartphone : Monitor;
}

function getBrowserName(ua: string | null): string {
  if (!ua) return "Unknown";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Other";
}

export default function SessionsMonitor() {
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/sessions");
      if (!res.ok) throw new Error("Failed to fetch session stats");
      const data = await res.json();
      setStats(data);
    } catch {
      toast.error("Failed to load session statistics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCleanup = async () => {
    setCleanupLoading(true);
    try {
      const res = await fetch("/api/admin/sessions", { method: "POST" });
      if (!res.ok) throw new Error("Failed to cleanup");
      const data = await res.json();
      toast.success(data.message);
      fetchStats();
    } catch {
      toast.error("Failed to cleanup sessions");
    } finally {
      setCleanupLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#E8732A]" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-[#A08060] font-mono text-sm">
          Failed to load session data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="vintage-panel rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#27AE60]/20 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-[#27AE60]" />
            </div>
            <div>
              <p className="text-[#A08060] font-mono text-[0.65rem] uppercase tracking-[0.15em]">
                Active Sessions
              </p>
              <p className="text-[#F5E6D3] font-mono text-2xl">
                {stats.totalActiveSessions}
              </p>
            </div>
          </div>
        </div>
        <div className="vintage-panel rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2980B9]/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#2980B9]" />
            </div>
            <div>
              <p className="text-[#A08060] font-mono text-[0.65rem] uppercase tracking-[0.15em]">
                Users Online
              </p>
              <p className="text-[#F5E6D3] font-mono text-2xl">
                {stats.uniqueUsers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase">
          Session Monitor
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={fetchStats}
            disabled={isLoading}
            className="vintage-button text-[#F5E6D3] font-mono text-[0.65rem] uppercase h-7 px-3"
          >
            <RefreshCw className="w-3 h-3 mr-1.5" />
            Refresh
          </Button>
          <Button
            onClick={handleCleanup}
            disabled={cleanupLoading}
            className="bg-[#C0392B]/20 hover:bg-[#C0392B]/30 text-[#C0392B] border border-[#C0392B]/30 font-mono text-[0.65rem] uppercase h-7 px-3"
          >
            {cleanupLoading ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
            ) : (
              <Trash2 className="w-3 h-3 mr-1.5" />
            )}
            Cleanup Expired
          </Button>
        </div>
      </div>

      {/* Sessions by User */}
      {stats.sessionsByUser.length > 0 && (
        <div className="vintage-panel rounded-xl p-4">
          <h4 className="font-mono text-[#A08060] text-[0.65rem] uppercase tracking-[0.15em] mb-3">
            Sessions Per User
          </h4>
          <div className="space-y-2">
            {stats.sessionsByUser
              .sort((a, b) => b.activeSessions - a.activeSessions)
              .map((u) => (
                <div
                  key={u.userId}
                  className="flex items-center justify-between bg-[#0A0A0A] rounded-lg border border-[#4A3728]/50 px-3 py-2"
                >
                  <div>
                    <p className="text-[#F5E6D3] font-mono text-sm">
                      {u.name || u.email}
                    </p>
                    {u.name && (
                      <p className="text-[#A08060] text-xs">{u.email}</p>
                    )}
                  </div>
                  <span
                    className={`font-mono text-sm px-2 py-0.5 rounded ${
                      u.activeSessions >= 3
                        ? "bg-[#C0392B]/20 text-[#C0392B]"
                        : u.activeSessions >= 2
                        ? "bg-[#E8732A]/20 text-[#E8732A]"
                        : "bg-[#27AE60]/20 text-[#27AE60]"
                    }`}
                  >
                    {u.activeSessions} session{u.activeSessions !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Sessions Table */}
      <div className="vintage-panel rounded-xl p-4">
        <h4 className="font-mono text-[#A08060] text-[0.65rem] uppercase tracking-[0.15em] mb-3">
          Recent Active Sessions
        </h4>
        {stats.recentSessions.length === 0 ? (
          <p className="text-[#A08060] font-mono text-sm text-center py-4">
            No active sessions.
          </p>
        ) : (
          <div className="space-y-2">
            {stats.recentSessions.map((s) => {
              const DeviceIcon = getDeviceIcon(s.userAgent);
              const browser = getBrowserName(s.userAgent);
              const isRecent =
                Date.now() - new Date(s.lastActiveAt).getTime() <
                5 * 60 * 1000;

              return (
                <div
                  key={s.id}
                  className="bg-[#0A0A0A] rounded-lg border border-[#4A3728]/50 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <DeviceIcon className="w-4 h-4 text-[#D4A574] flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[#F5E6D3] font-mono text-xs">
                          {s.name || s.email}
                        </span>
                        <span className="text-[#A08060] font-mono text-[0.6rem]">
                          {browser}
                        </span>
                        {s.ipAddress && (
                          <span className="text-[#A08060]/60 font-mono text-[0.6rem]">
                            {s.ipAddress}
                          </span>
                        )}
                        {isRecent && (
                          <span className="inline-flex items-center gap-1 px-1 py-0.5 rounded bg-[#27AE60]/20 text-[#27AE60] font-mono text-[0.55rem]">
                            <div className="w-1 h-1 rounded-full bg-[#27AE60] animate-pulse" />
                            NOW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[#A08060]/60 font-mono text-[0.55rem]">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(s.lastActiveAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
