"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Clock,
  Activity,
  Lock,
  Zap,
  Ban,
  Eye,
  FileText,
  TrendingUp,
  UserX,
  KeyRound,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

// ============================================================================
// TYPES
// ============================================================================

interface MonitorStats {
  totalAlerts: number;
  unacknowledged: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  failedLoginsLast15m: number;
  apiErrorsLast15m: number;
  rateLimitsLast15m: number;
  wafBlocksLast15m: number;
  activeThreats: number;
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  timestamp: string;
  ip?: string;
  userId?: string;
  acknowledged: boolean;
  metadata?: Record<string, unknown>;
}

interface AuditLogEntry {
  id: string;
  type: string;
  severity: string;
  detail: string;
  ip: string | null;
  userId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface AuditStats {
  total: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  since: string;
}

interface ThreatTimelineEntry {
  timestamp: string;
  events: number;
  alerts: number;
  blocked: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SEVERITY_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; label: string }
> = {
  critical: {
    color: "#C0392B",
    bg: "bg-[#C0392B]/10",
    border: "border-[#C0392B]/30",
    label: "CRITICAL",
  },
  high: {
    color: "#E74C3C",
    bg: "bg-[#E74C3C]/10",
    border: "border-[#E74C3C]/30",
    label: "HIGH",
  },
  medium: {
    color: "#F39C12",
    bg: "bg-[#F39C12]/10",
    border: "border-[#F39C12]/30",
    label: "MEDIUM",
  },
  low: {
    color: "#2980B9",
    bg: "bg-[#2980B9]/10",
    border: "border-[#2980B9]/30",
    label: "LOW",
  },
  warning: {
    color: "#F39C12",
    bg: "bg-[#F39C12]/10",
    border: "border-[#F39C12]/30",
    label: "WARNING",
  },
  info: {
    color: "#2980B9",
    bg: "bg-[#2980B9]/10",
    border: "border-[#2980B9]/30",
    label: "INFO",
  },
};

const ALERT_TYPE_ICONS: Record<string, React.ReactNode> = {
  brute_force: <UserX className="w-4 h-4" />,
  admin_new_ip: <Shield className="w-4 h-4" />,
  error_spike: <TrendingUp className="w-4 h-4" />,
  rate_limit_abuse: <Zap className="w-4 h-4" />,
  privilege_escalation: <KeyRound className="w-4 h-4" />,
  suspicious_pattern: <AlertTriangle className="w-4 h-4" />,
  account_lockout_surge: <Lock className="w-4 h-4" />,
  waf_attack_burst: <Ban className="w-4 h-4" />,
};

const AUDIT_TYPE_LABELS: Record<string, string> = {
  auth_failure: "Auth Failure",
  auth_success: "Auth Success",
  rate_limit: "Rate Limit",
  admin_action: "Admin Action",
  suspicious_activity: "Suspicious",
  account_lockout: "Account Lockout",
  password_change: "Password Change",
  password_reset: "Password Reset",
  session_revoked: "Session Revoked",
  registration: "Registration",
  waf_block: "WAF Block",
  api_error: "API Error",
  privilege_change: "Privilege Change",
  data_access: "Data Access",
  session_timeout: "Session Timeout",
  admin_access: "Admin Access",
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function SecurityDashboard() {
  const [monitorStats, setMonitorStats] = useState<MonitorStats | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditStats, setAuditStats] = useState<AuditStats | null>(null);
  const [timeline, setTimeline] = useState<ThreatTimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<
    "overview" | "alerts" | "audit-logs" | "timeline"
  >("overview");
  const [auditTypeFilter, setAuditTypeFilter] = useState<string>("");
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<string>("");
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>("");
  const [showAcknowledged, setShowAcknowledged] = useState(true);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [overviewRes, alertsRes, auditRes, timelineRes] =
        await Promise.all([
          fetch("/api/admin/security?view=overview"),
          fetch(
            `/api/admin/security?view=alerts&limit=100${alertSeverityFilter ? `&severity=${alertSeverityFilter}` : ""}${!showAcknowledged ? "&unacknowledged=true" : ""}`
          ),
          fetch(
            `/api/admin/security?view=audit-logs&limit=100&hours=24${auditTypeFilter ? `&type=${auditTypeFilter}` : ""}${auditSeverityFilter ? `&severity=${auditSeverityFilter}` : ""}`
          ),
          fetch("/api/admin/security?view=timeline&hours=24"),
        ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setMonitorStats(data.monitorStats);
      }

      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts || []);
      }

      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditLogs(data.logs || []);
        setAuditStats(data.stats || null);
      }

      if (timelineRes.ok) {
        const data = await timelineRes.json();
        setTimeline(data.timeline || []);
      }
    } catch {
      toast.error("Failed to load security data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    alertSeverityFilter,
    showAcknowledged,
    auditTypeFilter,
    auditSeverityFilter,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      const res = await fetch("/api/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acknowledge", alertId }),
      });
      if (!res.ok) throw new Error("Failed to acknowledge");
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
      );
      toast.success("Alert acknowledged");
    } catch {
      toast.error("Failed to acknowledge alert");
    }
  };

  const handleAcknowledgeAll = async () => {
    try {
      const res = await fetch("/api/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acknowledge_all" }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
      toast.success(`${data.count} alerts acknowledged`);
    } catch {
      toast.error("Failed to acknowledge alerts");
    }
  };

  if (isLoading) {
    return (
      <div className="vintage-panel rounded-xl p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#E8732A]" />
          <p className="text-[#A08060] font-mono text-sm">
            Loading security data...
          </p>
        </div>
      </div>
    );
  }

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="vintage-panel rounded-xl p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                monitorStats && monitorStats.activeThreats > 0
                  ? "bg-[#C0392B] shadow-[0_0_8px_rgba(192,57,43,0.6)] animate-pulse"
                  : "bg-[#27AE60] shadow-[0_0_8px_rgba(39,174,96,0.6)]"
              }`}
            />
            <h2 className="font-mono text-[#F5E6D3] text-lg tracking-wider uppercase">
              Security Monitor
            </h2>
            {unacknowledgedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#C0392B]/20 text-[#C0392B] font-mono text-[0.6rem] uppercase tracking-wider animate-pulse">
                {unacknowledgedCount} alert{unacknowledgedCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#A08060] font-mono text-[0.6rem]">
              Auto-refresh: 30s
            </span>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="vintage-button text-[#F5E6D3] font-mono text-xs tracking-wider"
            >
              {isRefreshing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              )}
              REFRESH
            </Button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#4A3728]/50 flex-wrap">
          {(
            [
              { key: "overview", icon: <Shield className="w-3.5 h-3.5" />, label: "Overview" },
              {
                key: "alerts",
                icon: <Bell className="w-3.5 h-3.5" />,
                label: `Alerts${unacknowledgedCount > 0 ? ` (${unacknowledgedCount})` : ""}`,
              },
              { key: "audit-logs", icon: <FileText className="w-3.5 h-3.5" />, label: "Audit Logs" },
              { key: "timeline", icon: <Activity className="w-3.5 h-3.5" />, label: "Timeline" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs tracking-wider uppercase transition-colors ${
                activeView === tab.key
                  ? "bg-[#E8732A]/20 text-[#E8732A] border border-[#E8732A]/30"
                  : "text-[#A08060] hover:bg-[#3D2B1F] border border-transparent"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/* OVERVIEW VIEW */}
      {/* ================================================================ */}
      {activeView === "overview" && monitorStats && (
        <>
          {/* Real-time Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={<UserX className="w-5 h-5 text-[#C0392B]" />}
              iconBg="bg-[#C0392B]/20"
              label="Failed Logins (15m)"
              value={monitorStats.failedLoginsLast15m}
              alert={monitorStats.failedLoginsLast15m >= 5}
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5 text-[#E74C3C]" />}
              iconBg="bg-[#E74C3C]/20"
              label="API Errors (15m)"
              value={monitorStats.apiErrorsLast15m}
              alert={monitorStats.apiErrorsLast15m >= 10}
            />
            <StatCard
              icon={<Zap className="w-5 h-5 text-[#F39C12]" />}
              iconBg="bg-[#F39C12]/20"
              label="Rate Limits (15m)"
              value={monitorStats.rateLimitsLast15m}
              alert={monitorStats.rateLimitsLast15m >= 5}
            />
            <StatCard
              icon={<Ban className="w-5 h-5 text-[#8E44AD]" />}
              iconBg="bg-[#8E44AD]/20"
              label="WAF Blocks (15m)"
              value={monitorStats.wafBlocksLast15m}
              alert={monitorStats.wafBlocksLast15m >= 5}
            />
          </div>

          {/* Alert Summary + Audit Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Alert Severity Distribution */}
            <div className="vintage-panel rounded-xl p-4 md:p-6">
              <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase mb-4">
                Alert Summary
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {(["critical", "high", "medium", "low"] as const).map(
                  (sev) => {
                    const config = SEVERITY_CONFIG[sev];
                    const count = monitorStats.bySeverity[sev] || 0;
                    return (
                      <div
                        key={sev}
                        className={`p-3 rounded-lg border ${config.bg} ${config.border}`}
                      >
                        <p
                          className="font-mono text-[0.65rem] uppercase tracking-wider"
                          style={{ color: config.color }}
                        >
                          {config.label}
                        </p>
                        <p
                          className="font-mono text-2xl mt-1"
                          style={{ color: config.color }}
                        >
                          {count}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-[#4A3728]/50 flex items-center justify-between">
                <div>
                  <p className="text-[#A08060] font-mono text-[0.6rem] uppercase tracking-wider">
                    Total Alerts
                  </p>
                  <p className="text-[#F5E6D3] font-mono text-lg">
                    {monitorStats.totalAlerts}
                  </p>
                </div>
                <div>
                  <p className="text-[#A08060] font-mono text-[0.6rem] uppercase tracking-wider">
                    Unacknowledged
                  </p>
                  <p className="text-[#E8732A] font-mono text-lg">
                    {monitorStats.unacknowledged}
                  </p>
                </div>
                <div>
                  <p className="text-[#A08060] font-mono text-[0.6rem] uppercase tracking-wider">
                    Active Threats
                  </p>
                  <p
                    className={`font-mono text-lg ${
                      monitorStats.activeThreats > 0
                        ? "text-[#C0392B]"
                        : "text-[#27AE60]"
                    }`}
                  >
                    {monitorStats.activeThreats}
                  </p>
                </div>
              </div>
            </div>

            {/* Audit Event Types */}
            <div className="vintage-panel rounded-xl p-4 md:p-6">
              <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase mb-4">
                Audit Events (24h)
              </h3>
              {auditStats && Object.keys(auditStats.byType).length > 0 ? (
                <div className="space-y-2.5">
                  {Object.entries(auditStats.byType)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 8)
                    .map(([type, count]) => {
                      const maxCount = Math.max(
                        ...Object.values(auditStats.byType)
                      );
                      const pct = (count / maxCount) * 100;
                      const isWarning =
                        type.includes("failure") ||
                        type.includes("block") ||
                        type.includes("lockout");

                      return (
                        <div key={type} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[#F5E6D3] text-xs">
                              {AUDIT_TYPE_LABELS[type] || type}
                            </span>
                            <span className="font-mono text-[#A08060] text-xs">
                              {count}
                            </span>
                          </div>
                          <div className="h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: isWarning
                                  ? "#C0392B"
                                  : "#E8732A",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-[#A08060] font-mono text-xs text-center py-4">
                  No audit events in the last 24 hours
                </p>
              )}
              {auditStats && (
                <div className="mt-4 pt-3 border-t border-[#4A3728]/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[#A08060] font-mono text-[0.6rem] uppercase tracking-wider">
                      Total Events (24h)
                    </span>
                    <span className="text-[#F5E6D3] font-mono text-sm">
                      {auditStats.total}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Alerts Preview */}
          {alerts.length > 0 && (
            <div className="vintage-panel rounded-xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase">
                  Recent Alerts
                </h3>
                <button
                  onClick={() => setActiveView("alerts")}
                  className="text-[#E8732A] font-mono text-xs hover:underline"
                >
                  View all →
                </button>
              </div>
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert) => (
                  <AlertRow
                    key={alert.id}
                    alert={alert}
                    expanded={expandedAlert === alert.id}
                    onToggle={() =>
                      setExpandedAlert(
                        expandedAlert === alert.id ? null : alert.id
                      )
                    }
                    onAcknowledge={() => handleAcknowledge(alert.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ================================================================ */}
      {/* ALERTS VIEW */}
      {/* ================================================================ */}
      {activeView === "alerts" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="vintage-panel rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[#A08060] font-mono text-[0.6rem] uppercase tracking-wider">
                  Severity:
                </span>
                <select
                  value={alertSeverityFilter}
                  onChange={(e) => setAlertSeverityFilter(e.target.value)}
                  className="bg-[#0A0A0A] border border-[#4A3728] text-[#F5E6D3] font-mono text-xs rounded px-2 py-1"
                >
                  <option value="">All</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAcknowledged}
                  onChange={(e) => setShowAcknowledged(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[#4A3728] bg-[#0A0A0A] accent-[#E8732A]"
                />
                <span className="text-[#A08060] font-mono text-[0.6rem] uppercase tracking-wider">
                  Show acknowledged
                </span>
              </label>
              {unacknowledgedCount > 0 && (
                <Button
                  onClick={handleAcknowledgeAll}
                  className="ml-auto bg-[#3D2B1F] hover:bg-[#4A3728] text-[#D4A574] border border-[#4A3728] font-mono text-[0.65rem] uppercase tracking-wider h-7 px-3"
                >
                  <CheckCheck className="w-3 h-3 mr-1.5" />
                  Ack All ({unacknowledgedCount})
                </Button>
              )}
            </div>
          </div>

          {/* Alerts List */}
          <div className="vintage-panel rounded-xl p-4 md:p-6">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <ShieldCheck className="w-8 h-8 text-[#27AE60] mx-auto mb-3" />
                <p className="text-[#A08060] font-mono text-sm">
                  No security alerts
                </p>
                <p className="text-[#A08060]/60 font-mono text-xs mt-1">
                  Alerts appear when suspicious patterns are detected
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[700px] overflow-y-auto">
                {alerts.map((alert) => (
                  <AlertRow
                    key={alert.id}
                    alert={alert}
                    expanded={expandedAlert === alert.id}
                    onToggle={() =>
                      setExpandedAlert(
                        expandedAlert === alert.id ? null : alert.id
                      )
                    }
                    onAcknowledge={() => handleAcknowledge(alert.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* AUDIT LOGS VIEW */}
      {/* ================================================================ */}
      {activeView === "audit-logs" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="vintage-panel rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[#A08060] font-mono text-[0.6rem] uppercase tracking-wider">
                  Type:
                </span>
                <select
                  value={auditTypeFilter}
                  onChange={(e) => setAuditTypeFilter(e.target.value)}
                  className="bg-[#0A0A0A] border border-[#4A3728] text-[#F5E6D3] font-mono text-xs rounded px-2 py-1"
                >
                  <option value="">All Types</option>
                  {Object.entries(AUDIT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#A08060] font-mono text-[0.6rem] uppercase tracking-wider">
                  Severity:
                </span>
                <select
                  value={auditSeverityFilter}
                  onChange={(e) => setAuditSeverityFilter(e.target.value)}
                  className="bg-[#0A0A0A] border border-[#4A3728] text-[#F5E6D3] font-mono text-xs rounded px-2 py-1"
                >
                  <option value="">All</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>
              {auditStats && (
                <span className="ml-auto text-[#A08060] font-mono text-[0.6rem]">
                  {auditStats.total} events in last 24h
                </span>
              )}
            </div>
          </div>

          {/* Log Entries */}
          <div className="vintage-panel rounded-xl p-4 md:p-6">
            <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase mb-4">
              Audit Log Entries
            </h3>
            {auditLogs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-[#A08060] mx-auto mb-3" />
                <p className="text-[#A08060] font-mono text-sm">
                  No audit log entries found
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[700px] overflow-y-auto">
                {auditLogs.map((log) => {
                  const sevConfig =
                    SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.info;

                  return (
                    <div
                      key={log.id}
                      className={`p-3 rounded-lg border ${sevConfig.bg} ${sevConfig.border}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="font-mono text-[0.65rem] uppercase tracking-wider px-1.5 py-0 rounded"
                              style={{
                                color: sevConfig.color,
                                backgroundColor: `${sevConfig.color}20`,
                              }}
                            >
                              {AUDIT_TYPE_LABELS[log.type] || log.type}
                            </span>
                            <span
                              className="font-mono text-[0.55rem] uppercase"
                              style={{ color: sevConfig.color }}
                            >
                              {log.severity}
                            </span>
                          </div>
                          <p className="text-[#F5E6D3] font-mono text-xs mt-1 break-words">
                            {log.detail}
                          </p>
                          {log.metadata && (
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {"method" in log.metadata && log.metadata.method != null && (
                                <span className="text-[#A08060] font-mono text-[0.55rem] bg-[#0A0A0A] px-1.5 py-0.5 rounded">
                                  {String(log.metadata.method)}
                                </span>
                              )}
                              {"path" in log.metadata && log.metadata.path != null && (
                                <span className="text-[#A08060] font-mono text-[0.55rem] bg-[#0A0A0A] px-1.5 py-0.5 rounded truncate max-w-[200px]">
                                  {String(log.metadata.path)}
                                </span>
                              )}
                              {"statusCode" in log.metadata && log.metadata.statusCode != null && (
                                <span
                                  className={`font-mono text-[0.55rem] px-1.5 py-0.5 rounded ${
                                    Number(log.metadata.statusCode) >= 500
                                      ? "bg-[#C0392B]/20 text-[#C0392B]"
                                      : Number(log.metadata.statusCode) >= 400
                                        ? "bg-[#F39C12]/20 text-[#F39C12]"
                                        : "bg-[#27AE60]/20 text-[#27AE60]"
                                  }`}
                                >
                                  {String(log.metadata.statusCode)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          {log.ip && (
                            <p className="text-[#A08060] font-mono text-[0.6rem]">
                              {log.ip}
                            </p>
                          )}
                          <p className="text-[#A08060]/60 font-mono text-[0.55rem]">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </p>
                          {log.userId && (
                            <p className="text-[#A08060]/60 font-mono text-[0.5rem] truncate max-w-[100px]">
                              {log.userId}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TIMELINE VIEW */}
      {/* ================================================================ */}
      {activeView === "timeline" && (
        <div className="space-y-4">
          {/* Timeline Chart */}
          <div className="vintage-panel rounded-xl p-4 md:p-6">
            <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase mb-4">
              Threat Activity Timeline (24h)
            </h3>
            {timeline.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-[#A08060] mx-auto mb-3" />
                <p className="text-[#A08060] font-mono text-sm">
                  No timeline data yet
                </p>
                <p className="text-[#A08060]/60 font-mono text-xs mt-1">
                  Data is collected as security events occur
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Legend */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-[#E8732A]" />
                    <span className="text-[#A08060] font-mono text-[0.6rem]">
                      Events
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-[#C0392B]" />
                    <span className="text-[#A08060] font-mono text-[0.6rem]">
                      Alerts
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-[#8E44AD]" />
                    <span className="text-[#A08060] font-mono text-[0.6rem]">
                      Blocked
                    </span>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="flex items-end gap-1 h-32 overflow-x-auto pb-6 relative">
                  {timeline.map((entry, i) => {
                    const maxVal = Math.max(
                      ...timeline.map((t) =>
                        Math.max(t.events, t.alerts, t.blocked, 1)
                      )
                    );
                    const evtHeight = (entry.events / maxVal) * 100;
                    const alertHeight = (entry.alerts / maxVal) * 100;
                    const blockHeight = (entry.blocked / maxVal) * 100;
                    const hour = new Date(entry.timestamp).getHours();

                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-0.5 min-w-[20px] flex-1 relative group"
                      >
                        <div className="flex items-end gap-px h-24 w-full justify-center">
                          <div
                            className="w-1/3 bg-[#E8732A] rounded-t-sm transition-all"
                            style={{ height: `${Math.max(evtHeight, 2)}%` }}
                          />
                          <div
                            className="w-1/3 bg-[#C0392B] rounded-t-sm transition-all"
                            style={{ height: `${Math.max(alertHeight, 0)}%` }}
                          />
                          <div
                            className="w-1/3 bg-[#8E44AD] rounded-t-sm transition-all"
                            style={{ height: `${Math.max(blockHeight, 0)}%` }}
                          />
                        </div>
                        <span className="text-[#A08060]/60 font-mono text-[0.5rem] absolute -bottom-5">
                          {hour}h
                        </span>
                        {/* Tooltip */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#2C1E14] border border-[#4A3728] rounded px-2 py-1 hidden group-hover:block z-10 whitespace-nowrap">
                          <p className="text-[#F5E6D3] font-mono text-[0.55rem]">
                            {entry.events}evt / {entry.alerts}alert /{" "}
                            {entry.blocked}block
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Threat Summary Cards */}
          {monitorStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Alert Types Distribution */}
              <div className="vintage-panel rounded-xl p-4 md:p-6">
                <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase mb-4">
                  Alert Types
                </h3>
                {Object.keys(monitorStats.byType).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(monitorStats.byType)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count]) => {
                        const icon = ALERT_TYPE_ICONS[type] || (
                          <AlertTriangle className="w-4 h-4" />
                        );
                        const label = type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase());

                        return (
                          <div
                            key={type}
                            className="flex items-center justify-between p-2 bg-[#0A0A0A] rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[#E8732A]">{icon}</span>
                              <span className="text-[#F5E6D3] font-mono text-xs">
                                {label}
                              </span>
                            </div>
                            <span className="text-[#D4A574] font-mono text-sm font-bold">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-[#A08060] font-mono text-xs text-center py-4">
                    No alert types recorded
                  </p>
                )}
              </div>

              {/* Quick Health Check */}
              <div className="vintage-panel rounded-xl p-4 md:p-6">
                <h3 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase mb-4">
                  Security Health
                </h3>
                <div className="space-y-3">
                  <HealthIndicator
                    label="Brute Force Protection"
                    status={
                      monitorStats.failedLoginsLast15m < 5 ? "good" : "warning"
                    }
                    detail={`${monitorStats.failedLoginsLast15m} failed logins`}
                  />
                  <HealthIndicator
                    label="API Stability"
                    status={
                      monitorStats.apiErrorsLast15m < 10 ? "good" : "warning"
                    }
                    detail={`${monitorStats.apiErrorsLast15m} errors`}
                  />
                  <HealthIndicator
                    label="Rate Limiting"
                    status={
                      monitorStats.rateLimitsLast15m < 5 ? "good" : "warning"
                    }
                    detail={`${monitorStats.rateLimitsLast15m} hits`}
                  />
                  <HealthIndicator
                    label="WAF Protection"
                    status={
                      monitorStats.wafBlocksLast15m < 10 ? "good" : "warning"
                    }
                    detail={`${monitorStats.wafBlocksLast15m} blocks`}
                  />
                  <HealthIndicator
                    label="Active Threats"
                    status={
                      monitorStats.activeThreats === 0 ? "good" : "critical"
                    }
                    detail={`${monitorStats.activeThreats} threats`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatCard({
  icon,
  iconBg,
  label,
  value,
  alert,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div
      className={`vintage-panel rounded-xl p-4 ${alert ? "ring-1 ring-[#C0392B]/30" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}
        >
          {icon}
        </div>
        <div>
          <p className="text-[#A08060] font-mono text-[0.6rem] uppercase tracking-[0.15em] leading-tight">
            {label}
          </p>
          <p
            className={`font-mono text-2xl ${
              alert ? "text-[#C0392B]" : "text-[#F5E6D3]"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function AlertRow({
  alert,
  expanded,
  onToggle,
  onAcknowledge,
}: {
  alert: SecurityAlert;
  expanded: boolean;
  onToggle: () => void;
  onAcknowledge: () => void;
}) {
  const sevConfig =
    SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.low;
  const icon = ALERT_TYPE_ICONS[alert.type] || (
    <AlertTriangle className="w-4 h-4" />
  );

  return (
    <div
      className={`rounded-lg border transition-colors ${
        alert.acknowledged
          ? "bg-[#0A0A0A]/50 border-[#4A3728]/30 opacity-60"
          : `${sevConfig.bg} ${sevConfig.border}`
      }`}
    >
      <div
        className="p-3 flex items-start justify-between gap-3 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <span
            className="mt-0.5 flex-shrink-0"
            style={{ color: sevConfig.color }}
          >
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="font-mono text-[0.65rem] uppercase tracking-wider px-1.5 py-0 rounded"
                style={{
                  color: sevConfig.color,
                  backgroundColor: `${sevConfig.color}15`,
                }}
              >
                {alert.severity}
              </span>
              {alert.acknowledged && (
                <span className="text-[#27AE60] font-mono text-[0.55rem] flex items-center gap-0.5">
                  <Check className="w-3 h-3" />
                  ACK
                </span>
              )}
            </div>
            <p className="text-[#F5E6D3] font-mono text-xs mt-1">
              {alert.title}
            </p>
            <p className="text-[#A08060] font-mono text-[0.6rem] mt-0.5 truncate">
              {alert.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            {alert.ip && (
              <p className="text-[#A08060] font-mono text-[0.6rem]">
                {alert.ip}
              </p>
            )}
            <p className="text-[#A08060]/60 font-mono text-[0.55rem]">
              <Clock className="w-3 h-3 inline mr-0.5" />
              {new Date(alert.timestamp).toLocaleTimeString()}
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#A08060]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#A08060]" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-[#4A3728]/30 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[0.6rem] font-mono">
            <div>
              <span className="text-[#A08060]">Alert ID:</span>{" "}
              <span className="text-[#F5E6D3]">{alert.id}</span>
            </div>
            <div>
              <span className="text-[#A08060]">Type:</span>{" "}
              <span className="text-[#F5E6D3]">
                {alert.type.replace(/_/g, " ")}
              </span>
            </div>
            <div>
              <span className="text-[#A08060]">Time:</span>{" "}
              <span className="text-[#F5E6D3]">
                {new Date(alert.timestamp).toLocaleString()}
              </span>
            </div>
            {alert.userId && (
              <div>
                <span className="text-[#A08060]">User:</span>{" "}
                <span className="text-[#F5E6D3]">{alert.userId}</span>
              </div>
            )}
          </div>
          {alert.metadata && Object.keys(alert.metadata).length > 0 && (
            <div className="bg-[#0A0A0A] rounded p-2">
              <p className="text-[#A08060] font-mono text-[0.55rem] uppercase tracking-wider mb-1">
                Metadata
              </p>
              <pre className="text-[#D4A574] font-mono text-[0.55rem] overflow-x-auto">
                {JSON.stringify(alert.metadata, null, 2)}
              </pre>
            </div>
          )}
          {!alert.acknowledged && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAcknowledge();
              }}
              className="bg-[#27AE60]/20 hover:bg-[#27AE60]/30 text-[#27AE60] border border-[#27AE60]/30 font-mono text-[0.65rem] uppercase tracking-wider h-7 px-3"
            >
              <Check className="w-3 h-3 mr-1.5" />
              Acknowledge
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function HealthIndicator({
  label,
  status,
  detail,
}: {
  label: string;
  status: "good" | "warning" | "critical";
  detail: string;
}) {
  const colors = {
    good: { dot: "bg-[#27AE60]", text: "text-[#27AE60]", glow: "shadow-[0_0_6px_rgba(39,174,96,0.5)]" },
    warning: { dot: "bg-[#F39C12]", text: "text-[#F39C12]", glow: "shadow-[0_0_6px_rgba(243,156,18,0.5)]" },
    critical: { dot: "bg-[#C0392B] animate-pulse", text: "text-[#C0392B]", glow: "shadow-[0_0_6px_rgba(192,57,43,0.5)]" },
  };

  const c = colors[status];

  return (
    <div className="flex items-center justify-between p-2.5 bg-[#0A0A0A] rounded-lg border border-[#4A3728]/50">
      <div className="flex items-center gap-2.5">
        <div className={`w-2.5 h-2.5 rounded-full ${c.dot} ${c.glow}`} />
        <span className="text-[#F5E6D3] font-mono text-xs">{label}</span>
      </div>
      <span className={`font-mono text-[0.6rem] ${c.text}`}>{detail}</span>
    </div>
  );
}
