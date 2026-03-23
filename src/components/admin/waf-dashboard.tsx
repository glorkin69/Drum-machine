"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Bug,
  Globe,
  Zap,
  AlertTriangle,
  Ban,
  Eye,
  Activity,
  Plus,
  Trash2,
  Search,
  Crosshair,
  Radar,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";

// ============================================================================
// TYPES
// ============================================================================

interface WafStats {
  totalBlocked: number;
  totalLogged: number;
  byCategory: Record<string, number>;
  topBlockedIps: Array<{ ip: string; count: number; lastBlocked: number }>;
  recentEvents: number;
}

interface WafConfigData {
  enabled: boolean;
  logOnly: boolean;
  botProtection: boolean;
  globalRateLimit: number;
  apiRateLimit: number;
}

interface IdsOverview {
  enabled: boolean;
  activeThreats: number;
  autoBlocked: number;
  honeypotHits: number;
}

interface WafEvent {
  timestamp: number;
  ip: string;
  method: string;
  path: string;
  category: string;
  action: string;
  detail: string;
  userAgent: string;
  country?: string;
}

interface IdsConfigData {
  enabled: boolean;
  autoBlockThreshold: number;
  autoBlockDurationMs: number;
  honeypotEnabled: boolean;
  behaviorAnalysisEnabled: boolean;
  requestRateThreshold: number;
  geoBlockEnabled: boolean;
  blockedCountries: string[];
}

interface ThreatScore {
  ip: string;
  score: number;
  level: string;
  factors: Array<{ type: string; description: string; points: number; timestamp: number }>;
  firstSeen: number;
  lastSeen: number;
  requestCount: number;
}

interface IdsStatsData {
  activeProfiles: number;
  threatsDetected: number;
  autoBlocked: number;
  honeypotHits: number;
  topThreats: ThreatScore[];
  threatsByLevel: Record<string, number>;
}

interface BlocklistEntry {
  ip: string;
  reason: string;
  blockedAt: number;
  expiresAt: number | null;
}

interface HoneypotEntry {
  ip: string;
  path: string;
  timestamp: number;
  userAgent: string;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  "rate-limit": { label: "Rate Limit", color: "#E8732A", icon: <Zap className="w-3 h-3" /> },
  sqli: { label: "SQL Injection", color: "#C0392B", icon: <Bug className="w-3 h-3" /> },
  xss: { label: "XSS", color: "#E74C3C", icon: <AlertTriangle className="w-3 h-3" /> },
  "path-traversal": { label: "Path Traversal", color: "#8E44AD", icon: <Globe className="w-3 h-3" /> },
  "command-injection": { label: "Cmd Injection", color: "#C0392B", icon: <Ban className="w-3 h-3" /> },
  "bot-detection": { label: "Bot/Scanner", color: "#2980B9", icon: <Eye className="w-3 h-3" /> },
  "payload-size": { label: "Payload Size", color: "#F39C12", icon: <Activity className="w-3 h-3" /> },
  "protocol-violation": { label: "Protocol", color: "#7F8C8D", icon: <ShieldAlert className="w-3 h-3" /> },
  "suspicious-pattern": { label: "Suspicious", color: "#D35400", icon: <AlertTriangle className="w-3 h-3" /> },
};

const THREAT_LEVEL_COLORS: Record<string, string> = {
  none: "#7F8C8D",
  low: "#27AE60",
  medium: "#F39C12",
  high: "#E8732A",
  critical: "#C0392B",
};

type ViewTab = "overview" | "events" | "ids" | "ip-lists";

// ============================================================================
// COMPONENT
// ============================================================================

export default function WafDashboard() {
  const [stats, setStats] = useState<WafStats | null>(null);
  const [wafConfig, setWafConfig] = useState<WafConfigData | null>(null);
  const [idsOverview, setIdsOverview] = useState<IdsOverview | null>(null);
  const [events, setEvents] = useState<WafEvent[]>([]);
  const [idsStats, setIdsStats] = useState<IdsStatsData | null>(null);
  const [idsConfig, setIdsConfig] = useState<IdsConfigData | null>(null);
  const [honeypotLog, setHoneypotLog] = useState<HoneypotEntry[]>([]);
  const [allowlist, setAllowlist] = useState<string[]>([]);
  const [blocklist, setBlocklist] = useState<BlocklistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [activeView, setActiveView] = useState<ViewTab>("overview");
  const [newIp, setNewIp] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [ipLookup, setIpLookup] = useState("");
  const [lookupResult, setLookupResult] = useState<ThreatScore | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        fetch("/api/admin/waf?view=stats"),
        fetch("/api/admin/waf?view=events&limit=50"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
        setWafConfig(data.config);
        if (data.ids) setIdsOverview(data.ids);
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events || []);
      }
    } catch {
      toast.error("Failed to load WAF data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchIdsData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/waf?view=ids");
      if (res.ok) {
        const data = await res.json();
        setIdsStats(data.stats);
        setIdsConfig(data.config);
        setHoneypotLog(data.honeypotLog || []);
      }
    } catch {
      toast.error("Failed to load IDS data");
    }
  }, []);

  const fetchIpLists = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/waf?view=ip-lists");
      if (res.ok) {
        const data = await res.json();
        setAllowlist(data.allowlist || []);
        setBlocklist(data.blocklist || []);
      }
    } catch {
      toast.error("Failed to load IP lists");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (activeView === "ids") fetchIdsData();
    if (activeView === "ip-lists") fetchIpLists();
  }, [activeView, fetchIdsData, fetchIpLists]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
    if (activeView === "ids") fetchIdsData();
    if (activeView === "ip-lists") fetchIpLists();
  };

  const toggleWafSetting = async (field: string, value: boolean | number) => {
    setConfigSaving(true);
    try {
      const res = await fetch("/api/admin/waf", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) throw new Error("Failed to update");
      const data = await res.json();
      setWafConfig(data.config);
      toast.success(`WAF ${field} updated`);
    } catch {
      toast.error("Failed to update WAF config");
    } finally {
      setConfigSaving(false);
    }
  };

  const toggleIdsSetting = async (field: string, value: boolean | number) => {
    setConfigSaving(true);
    try {
      const res = await fetch("/api/admin/waf", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _target: "ids", [field]: value }),
      });

      if (!res.ok) throw new Error("Failed to update");
      const data = await res.json();
      setIdsConfig(data.config);
      toast.success(`IDS ${field} updated`);
    } catch {
      toast.error("Failed to update IDS config");
    } finally {
      setConfigSaving(false);
    }
  };

  const manageIpList = async (action: string, ip: string, reason?: string) => {
    try {
      const res = await fetch("/api/admin/waf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ip, reason }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }

      const data = await res.json();
      if (data.allowlist) setAllowlist(data.allowlist);
      if (data.blocklist) setBlocklist(data.blocklist);

      toast.success(data.message);
      setNewIp("");
      setBlockReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update IP list");
    }
  };

  const lookupThreat = async () => {
    if (!ipLookup.trim()) return;
    try {
      const res = await fetch(`/api/admin/waf?view=threat&ip=${encodeURIComponent(ipLookup.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setLookupResult(data.threat);
      }
    } catch {
      toast.error("Failed to lookup threat");
    }
  };

  if (isLoading) {
    return (
      <div className="vintage-panel rounded-xl p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#E8732A]" />
          <p className="text-[#A08060] font-mono text-sm">Loading WAF & IDS data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="vintage-panel rounded-xl p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${wafConfig?.enabled ? "bg-[#27AE60] shadow-[0_0_8px_rgba(39,174,96,0.6)]" : "bg-[#C0392B] shadow-[0_0_8px_rgba(192,57,43,0.6)]"}`} />
            <h2 className="font-mono text-[#F5E6D3] text-lg tracking-wider uppercase">
              WAF & Intrusion Detection
            </h2>
            {wafConfig?.logOnly && (
              <span className="px-2 py-0.5 rounded-full bg-[#F39C12]/20 text-[#F39C12] font-mono text-[0.6rem] uppercase tracking-wider">
                Log Only
              </span>
            )}
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="vintage-button text-[#F5E6D3] font-mono text-xs tracking-wider"
          >
            {isRefreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
            REFRESH
          </Button>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#4A3728]/50 flex-wrap">
          {([
            { id: "overview" as ViewTab, label: "Overview", icon: Shield },
            { id: "events" as ViewTab, label: `Events (${events.length})`, icon: Activity },
            { id: "ids" as ViewTab, label: "IDS", icon: Radar },
            { id: "ip-lists" as ViewTab, label: "IP Lists", icon: Lock },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs tracking-wider uppercase transition-colors ${
                activeView === id
                  ? "bg-[#E8732A]/20 text-[#E8732A] border border-[#E8732A]/30"
                  : "text-[#A08060] hover:bg-[#3D2B1F] border border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/* OVERVIEW TAB */}
      {/* ================================================================ */}
      {activeView === "overview" && (
        <>
          {/* Stats Cards (WAF + IDS) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard icon={ShieldAlert} color="#C0392B" label="WAF Blocked" value={stats?.totalBlocked || 0} />
            <StatCard icon={Eye} color="#F39C12" label="WAF Logged" value={stats?.totalLogged || 0} />
            <StatCard icon={Activity} color="#27AE60" label="Total Events" value={stats?.recentEvents || 0} />
            <StatCard icon={Ban} color="#8E44AD" label="Auto-Blocked" value={(stats?.topBlockedIps?.length || 0) + (idsOverview?.autoBlocked || 0)} />
            <StatCard icon={Radar} color="#2980B9" label="IDS Threats" value={idsOverview?.activeThreats || 0} />
            <StatCard icon={Crosshair} color="#D35400" label="Honeypot Hits" value={idsOverview?.honeypotHits || 0} />
          </div>

          {/* Threats by Category + WAF Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Threats by Category */}
            <div className="vintage-panel rounded-xl p-4 md:p-6">
              <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase mb-4">
                Threats by Category (24h)
              </h3>
              {stats && Object.keys(stats.byCategory).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(stats.byCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, count]) => {
                      const info = CATEGORY_LABELS[cat] || { label: cat, color: "#A08060", icon: <Shield className="w-3 h-3" /> };
                      const maxCount = Math.max(...Object.values(stats.byCategory));
                      const percentage = (count / maxCount) * 100;
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span style={{ color: info.color }}>{info.icon}</span>
                              <span className="font-mono text-[#F5E6D3] text-xs">{info.label}</span>
                            </div>
                            <span className="font-mono text-[#A08060] text-xs">{count}</span>
                          </div>
                          <div className="h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: info.color }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-[#A08060] font-mono text-xs text-center py-4">No threats detected in the last 24 hours</p>
              )}
            </div>

            {/* WAF Configuration */}
            <div className="vintage-panel rounded-xl p-4 md:p-6">
              <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase mb-4">WAF Configuration</h3>
              {wafConfig && (
                <div className="space-y-3">
                  <ConfigToggle icon={ShieldCheck} color="#27AE60" label="WAF Protection" desc="Block malicious requests" enabled={wafConfig.enabled} saving={configSaving} onToggle={() => toggleWafSetting("enabled", !wafConfig.enabled)} />
                  <ConfigToggle icon={Eye} color="#F39C12" label="Log Only Mode" desc="Monitor without blocking" enabled={wafConfig.logOnly} saving={configSaving} onToggle={() => toggleWafSetting("logOnly", !wafConfig.logOnly)} />
                  <ConfigToggle icon={Bug} color="#2980B9" label="Bot Protection" desc="Block known scanners" enabled={wafConfig.botProtection} saving={configSaving} onToggle={() => toggleWafSetting("botProtection", !wafConfig.botProtection)} />
                  <div className="p-3 bg-[#0A0A0A] rounded-lg border border-[#4A3728]/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#E8732A]" />
                      <p className="text-[#F5E6D3] font-mono text-xs">Rate Limits</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[#A08060] font-mono text-[0.6rem] uppercase tracking-wider">Global</p>
                        <p className="text-[#D4A574] font-mono text-sm">{wafConfig.globalRateLimit}/min</p>
                      </div>
                      <div>
                        <p className="text-[#A08060] font-mono text-[0.6rem] uppercase tracking-wider">API</p>
                        <p className="text-[#D4A574] font-mono text-sm">{wafConfig.apiRateLimit}/min</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Blocked IPs */}
          {stats && stats.topBlockedIps.length > 0 && (
            <div className="vintage-panel rounded-xl p-4 md:p-6">
              <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase mb-4">Top Blocked IPs (24h)</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#4A3728]">
                      <th className="text-left py-2 px-3 text-[#A08060] font-mono text-[0.65rem] uppercase tracking-[0.15em]">IP Address</th>
                      <th className="text-left py-2 px-3 text-[#A08060] font-mono text-[0.65rem] uppercase tracking-[0.15em]">Block Count</th>
                      <th className="text-left py-2 px-3 text-[#A08060] font-mono text-[0.65rem] uppercase tracking-[0.15em]">Last Blocked</th>
                      <th className="text-right py-2 px-3 text-[#A08060] font-mono text-[0.65rem] uppercase tracking-[0.15em]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topBlockedIps.map((entry) => (
                      <tr key={entry.ip} className="border-b border-[#4A3728]/50 hover:bg-[#3D2B1F]/30">
                        <td className="py-2 px-3 text-[#F5E6D3] font-mono text-xs">{entry.ip}</td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C0392B]/20 text-[#C0392B] font-mono text-[0.65rem]">{entry.count}</span>
                        </td>
                        <td className="py-2 px-3 text-[#A08060] font-mono text-xs">{new Date(entry.lastBlocked).toLocaleString()}</td>
                        <td className="py-2 px-3 text-right">
                          <Button
                            size="sm"
                            onClick={() => manageIpList("add_blocklist", entry.ip, "Added from WAF blocked list")}
                            className="font-mono text-[0.6rem] uppercase h-6 px-2 bg-[#C0392B]/20 hover:bg-[#C0392B]/30 text-[#C0392B] border border-[#C0392B]/30"
                          >
                            <Ban className="w-3 h-3 mr-1" /> Block
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================================================================ */}
      {/* EVENTS TAB */}
      {/* ================================================================ */}
      {activeView === "events" && (
        <div className="vintage-panel rounded-xl p-4 md:p-6">
          <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase mb-4">Recent WAF Events</h3>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <ShieldCheck className="w-8 h-8 text-[#27AE60] mx-auto mb-3" />
              <p className="text-[#A08060] font-mono text-sm">No WAF events recorded yet</p>
              <p className="text-[#A08060]/60 font-mono text-xs mt-1">Events will appear here when threats are detected</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {events.map((event, i) => {
                const catInfo = CATEGORY_LABELS[event.category] || { label: event.category, color: "#A08060", icon: <Shield className="w-3 h-3" /> };
                return (
                  <div key={`${event.timestamp}-${i}`} className={`p-3 rounded-lg border ${event.action === "block" ? "bg-[#C0392B]/5 border-[#C0392B]/20" : "bg-[#0A0A0A] border-[#4A3728]/50"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <span className="mt-0.5 flex-shrink-0" style={{ color: catInfo.color }}>{catInfo.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[0.65rem] uppercase tracking-wider" style={{ color: catInfo.color }}>{catInfo.label}</span>
                            <span className={`px-1.5 py-0 rounded text-[0.6rem] font-mono uppercase ${event.action === "block" ? "bg-[#C0392B]/20 text-[#C0392B]" : "bg-[#F39C12]/20 text-[#F39C12]"}`}>{event.action}</span>
                          </div>
                          <p className="text-[#F5E6D3] font-mono text-xs mt-1 truncate">{event.method} {event.path}</p>
                          <p className="text-[#A08060] font-mono text-[0.6rem] mt-0.5 truncate">{event.detail}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[#A08060] font-mono text-[0.6rem]">{event.ip}</p>
                        <p className="text-[#A08060]/60 font-mono text-[0.55rem]">{new Date(event.timestamp).toLocaleTimeString()}</p>
                        {event.country && <p className="text-[#A08060]/60 font-mono text-[0.55rem]">{event.country}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* IDS TAB */}
      {/* ================================================================ */}
      {activeView === "ids" && (
        <>
          {/* IDS Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard icon={Radar} color="#2980B9" label="Active Profiles" value={idsStats?.activeProfiles || 0} />
            <StatCard icon={AlertTriangle} color="#E8732A" label="Threats Found" value={idsStats?.threatsDetected || 0} />
            <StatCard icon={Ban} color="#C0392B" label="Auto-Blocked" value={idsStats?.autoBlocked || 0} />
            <StatCard icon={Crosshair} color="#D35400" label="Honeypot Hits" value={idsStats?.honeypotHits || 0} />
            <StatCard icon={Shield} color="#27AE60" label="Critical" value={idsStats?.threatsByLevel?.critical || 0} />
          </div>

          {/* IDS Configuration + Threat Lookup */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* IDS Config */}
            <div className="vintage-panel rounded-xl p-4 md:p-6">
              <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase mb-4">IDS Configuration</h3>
              {idsConfig && (
                <div className="space-y-3">
                  <ConfigToggle icon={Radar} color="#2980B9" label="IDS Engine" desc="Behavioral analysis & threat detection" enabled={idsConfig.enabled} saving={configSaving} onToggle={() => toggleIdsSetting("enabled", !idsConfig.enabled)} />
                  <ConfigToggle icon={Crosshair} color="#D35400" label="Honeypot Traps" desc="Decoy endpoints to catch attackers" enabled={idsConfig.honeypotEnabled} saving={configSaving} onToggle={() => toggleIdsSetting("honeypotEnabled", !idsConfig.honeypotEnabled)} />
                  <ConfigToggle icon={Activity} color="#8E44AD" label="Behavior Analysis" desc="Track request patterns" enabled={idsConfig.behaviorAnalysisEnabled} saving={configSaving} onToggle={() => toggleIdsSetting("behaviorAnalysisEnabled", !idsConfig.behaviorAnalysisEnabled)} />
                  <ConfigToggle icon={Globe} color="#E74C3C" label="Geo-Blocking" desc="Block by country code" enabled={idsConfig.geoBlockEnabled} saving={configSaving} onToggle={() => toggleIdsSetting("geoBlockEnabled", !idsConfig.geoBlockEnabled)} />
                  <div className="p-3 bg-[#0A0A0A] rounded-lg border border-[#4A3728]/50 space-y-2">
                    <p className="text-[#F5E6D3] font-mono text-xs">Thresholds</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[#A08060] font-mono text-[0.6rem] uppercase tracking-wider">Auto-Block Score</p>
                        <p className="text-[#D4A574] font-mono text-sm">{idsConfig.autoBlockThreshold}/100</p>
                      </div>
                      <div>
                        <p className="text-[#A08060] font-mono text-[0.6rem] uppercase tracking-wider">Rate Threshold</p>
                        <p className="text-[#D4A574] font-mono text-sm">{idsConfig.requestRateThreshold}/min</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Threat IP Lookup */}
            <div className="vintage-panel rounded-xl p-4 md:p-6">
              <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase mb-4">Threat IP Lookup</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={ipLookup}
                  onChange={(e) => setIpLookup(e.target.value)}
                  placeholder="Enter IP address..."
                  className="flex-1 bg-[#0A0A0A] border border-[#4A3728]/50 rounded-lg px-3 py-2 text-[#F5E6D3] font-mono text-xs placeholder-[#A08060]/50 focus:outline-none focus:border-[#E8732A]/50"
                  onKeyDown={(e) => e.key === "Enter" && lookupThreat()}
                />
                <Button onClick={lookupThreat} className="vintage-button text-[#F5E6D3] font-mono text-xs">
                  <Search className="w-3.5 h-3.5 mr-1" /> Lookup
                </Button>
              </div>

              {lookupResult && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg border border-[#4A3728]/50">
                    <div>
                      <p className="text-[#F5E6D3] font-mono text-xs">{lookupResult.ip}</p>
                      <p className="text-[#A08060] font-mono text-[0.6rem]">{lookupResult.requestCount} requests tracked</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg" style={{ color: THREAT_LEVEL_COLORS[lookupResult.level] || "#A08060" }}>
                        {lookupResult.score}
                      </p>
                      <p className="font-mono text-[0.6rem] uppercase tracking-wider" style={{ color: THREAT_LEVEL_COLORS[lookupResult.level] || "#A08060" }}>
                        {lookupResult.level}
                      </p>
                    </div>
                  </div>

                  {lookupResult.factors.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[#A08060] font-mono text-[0.65rem] uppercase tracking-wider">Threat Factors</p>
                      {lookupResult.factors.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-[#0A0A0A] rounded border border-[#4A3728]/30">
                          <div className="min-w-0 flex-1">
                            <p className="text-[#F5E6D3] font-mono text-[0.65rem] truncate">{f.description}</p>
                          </div>
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-[#C0392B]/20 text-[#C0392B] font-mono text-[0.6rem] flex-shrink-0">
                            +{f.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => manageIpList("add_blocklist", lookupResult.ip, `Blocked after threat lookup (score: ${lookupResult.score})`)}
                      className="font-mono text-[0.6rem] uppercase h-7 px-3 bg-[#C0392B]/20 hover:bg-[#C0392B]/30 text-[#C0392B] border border-[#C0392B]/30"
                    >
                      <Ban className="w-3 h-3 mr-1" /> Block IP
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => manageIpList("add_allowlist", lookupResult.ip)}
                      className="font-mono text-[0.6rem] uppercase h-7 px-3 bg-[#27AE60]/20 hover:bg-[#27AE60]/30 text-[#27AE60] border border-[#27AE60]/30"
                    >
                      <Unlock className="w-3 h-3 mr-1" /> Allow IP
                    </Button>
                  </div>
                </div>
              )}

              {lookupResult === null && ipLookup === "" && (
                <p className="text-[#A08060] font-mono text-xs text-center py-4">Enter an IP address to view its threat score and behavioral profile</p>
              )}
            </div>
          </div>

          {/* Top Threats + Honeypot Log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Threats */}
            <div className="vintage-panel rounded-xl p-4 md:p-6">
              <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase mb-4">Top Threats</h3>
              {idsStats && idsStats.topThreats.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {idsStats.topThreats.map((threat) => (
                    <div key={threat.ip} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg border border-[#4A3728]/50">
                      <div className="min-w-0">
                        <p className="text-[#F5E6D3] font-mono text-xs">{threat.ip}</p>
                        <p className="text-[#A08060] font-mono text-[0.6rem]">
                          {threat.factors.length} factor(s) | {threat.requestCount} req
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-mono text-sm font-bold" style={{ color: THREAT_LEVEL_COLORS[threat.level] }}>
                            {threat.score}
                          </p>
                          <p className="font-mono text-[0.55rem] uppercase" style={{ color: THREAT_LEVEL_COLORS[threat.level] }}>
                            {threat.level}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setIpLookup(threat.ip);
                            lookupThreat();
                          }}
                          className="font-mono text-[0.55rem] h-6 px-2 bg-[#3D2B1F] hover:bg-[#4A3728] text-[#A08060] border border-[#4A3728]"
                        >
                          <Search className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#A08060] font-mono text-xs text-center py-4">No active threats detected</p>
              )}
            </div>

            {/* Honeypot Log */}
            <div className="vintage-panel rounded-xl p-4 md:p-6">
              <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase mb-4">
                <Crosshair className="w-4 h-4 inline mr-2" />
                Honeypot Trap Log
              </h3>
              {honeypotLog.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {honeypotLog.map((entry, i) => (
                    <div key={`${entry.timestamp}-${i}`} className="p-2 bg-[#0A0A0A] rounded-lg border border-[#D35400]/20">
                      <div className="flex items-center justify-between">
                        <p className="text-[#F5E6D3] font-mono text-xs">{entry.ip}</p>
                        <p className="text-[#A08060]/60 font-mono text-[0.55rem]">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <p className="text-[#D35400] font-mono text-[0.65rem] mt-0.5 truncate">{entry.path}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#A08060] font-mono text-xs text-center py-4">No honeypot traps triggered yet</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ================================================================ */}
      {/* IP LISTS TAB */}
      {/* ================================================================ */}
      {activeView === "ip-lists" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Allowlist */}
          <div className="vintage-panel rounded-xl p-4 md:p-6">
            <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase mb-4">
              <Unlock className="w-4 h-4 inline mr-2 text-[#27AE60]" />
              IP Allowlist ({allowlist.length})
            </h3>
            <p className="text-[#A08060] font-mono text-[0.6rem] mb-4">Allowlisted IPs bypass all WAF/IDS checks</p>

            {/* Add IP */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                placeholder="IP address..."
                className="flex-1 bg-[#0A0A0A] border border-[#4A3728]/50 rounded-lg px-3 py-2 text-[#F5E6D3] font-mono text-xs placeholder-[#A08060]/50 focus:outline-none focus:border-[#27AE60]/50"
              />
              <Button
                size="sm"
                onClick={() => newIp.trim() && manageIpList("add_allowlist", newIp.trim())}
                disabled={!newIp.trim()}
                className="font-mono text-[0.65rem] uppercase h-9 px-3 bg-[#27AE60]/20 hover:bg-[#27AE60]/30 text-[#27AE60] border border-[#27AE60]/30"
              >
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>

            {/* List */}
            {allowlist.length > 0 ? (
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {allowlist.map((ip) => (
                  <div key={ip} className="flex items-center justify-between p-2 bg-[#0A0A0A] rounded-lg border border-[#4A3728]/30">
                    <p className="text-[#F5E6D3] font-mono text-xs">{ip}</p>
                    <Button
                      size="sm"
                      onClick={() => manageIpList("remove_allowlist", ip)}
                      className="h-6 w-6 p-0 bg-transparent hover:bg-[#C0392B]/20 text-[#A08060] hover:text-[#C0392B]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#A08060] font-mono text-xs text-center py-4">No IPs in allowlist</p>
            )}
          </div>

          {/* Blocklist */}
          <div className="vintage-panel rounded-xl p-4 md:p-6">
            <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase mb-4">
              <Ban className="w-4 h-4 inline mr-2 text-[#C0392B]" />
              IP Blocklist ({blocklist.length})
            </h3>
            <p className="text-[#A08060] font-mono text-[0.6rem] mb-4">Blocklisted IPs are denied all access</p>

            {/* Add to blocklist */}
            <div className="space-y-2 mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="IP address..."
                  className="flex-1 bg-[#0A0A0A] border border-[#4A3728]/50 rounded-lg px-3 py-2 text-[#F5E6D3] font-mono text-xs placeholder-[#A08060]/50 focus:outline-none focus:border-[#C0392B]/50"
                />
                <Button
                  size="sm"
                  onClick={() => newIp.trim() && manageIpList("add_blocklist", newIp.trim(), blockReason || "Manually blocked by admin")}
                  disabled={!newIp.trim()}
                  className="font-mono text-[0.65rem] uppercase h-9 px-3 bg-[#C0392B]/20 hover:bg-[#C0392B]/30 text-[#C0392B] border border-[#C0392B]/30"
                >
                  <Ban className="w-3 h-3 mr-1" /> Block
                </Button>
              </div>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Reason (optional)..."
                className="w-full bg-[#0A0A0A] border border-[#4A3728]/50 rounded-lg px-3 py-2 text-[#F5E6D3] font-mono text-xs placeholder-[#A08060]/50 focus:outline-none focus:border-[#4A3728]"
              />
            </div>

            {/* List */}
            {blocklist.length > 0 ? (
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {blocklist.map((entry) => (
                  <div key={entry.ip} className="flex items-center justify-between p-2 bg-[#0A0A0A] rounded-lg border border-[#C0392B]/20">
                    <div className="min-w-0 flex-1">
                      <p className="text-[#F5E6D3] font-mono text-xs">{entry.ip}</p>
                      <p className="text-[#A08060] font-mono text-[0.55rem] truncate">{entry.reason}</p>
                      {entry.expiresAt && (
                        <p className="text-[#A08060]/60 font-mono text-[0.5rem]">
                          Expires: {new Date(entry.expiresAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => manageIpList("remove_blocklist", entry.ip)}
                      className="h-6 w-6 p-0 bg-transparent hover:bg-[#27AE60]/20 text-[#A08060] hover:text-[#27AE60] flex-shrink-0 ml-2"
                    >
                      <Unlock className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#A08060] font-mono text-xs text-center py-4">No IPs in blocklist</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatCard({ icon: Icon, color, label, value }: { icon: React.ComponentType<{ className?: string }>; color: string; label: string; value: number }) {
  return (
    <div className="vintage-panel rounded-xl p-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <span style={{ color }}><Icon className="w-4 h-4" /></span>
        </div>
        <div>
          <p className="text-[#A08060] font-mono text-[0.6rem] uppercase tracking-[0.1em]">{label}</p>
          <p className="text-[#F5E6D3] font-mono text-xl leading-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ConfigToggle({
  icon: Icon,
  color,
  label,
  desc,
  enabled,
  saving,
  onToggle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
  desc: string;
  enabled: boolean;
  saving: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg border border-[#4A3728]/50">
      <div className="flex items-center gap-3">
        <span style={{ color }}><Icon className="w-4 h-4" /></span>
        <div>
          <p className="text-[#F5E6D3] font-mono text-xs">{label}</p>
          <p className="text-[#A08060] font-mono text-[0.6rem]">{desc}</p>
        </div>
      </div>
      <Button
        size="sm"
        onClick={onToggle}
        disabled={saving}
        className={`font-mono text-[0.65rem] uppercase tracking-wider h-7 px-3 ${
          enabled
            ? `bg-[${color}]/20 hover:bg-[${color}]/30 border`
            : "bg-[#3D2B1F] hover:bg-[#4A3728] text-[#A08060] border border-[#4A3728]"
        }`}
        style={enabled ? { backgroundColor: `${color}20`, color, borderColor: `${color}50` } : {}}
      >
        {enabled ? "ON" : "OFF"}
      </Button>
    </div>
  );
}
