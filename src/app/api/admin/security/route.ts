/**
 * GET /api/admin/security - Comprehensive security monitoring endpoint
 * POST /api/admin/security - Acknowledge alerts
 *
 * Views:
 *   ?view=overview        (default) - Stats + recent alerts + recent logs + IDS summary
 *   ?view=alerts          - All alerts with optional filters
 *   ?view=audit-logs      - Persistent audit logs from DB
 *   ?view=timeline        - Threat timeline data for charting
 *   ?view=monitor         - Real-time monitor stats
 *   ?view=structured-logs - Security-logger entries
 *   ?view=ids-overview    - IDS stats, top threats, and honeypot log
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getSecurityEvents } from "@/lib/security";
import { queryAuditLogs, getAuditStats } from "@/lib/audit-log";
import type { AuditEventType, AuditSeverity } from "@/lib/audit-log";
import { getRecentLogs } from "@/lib/security-logger";
import type { SecurityCategory } from "@/lib/security-logger";
import {
  getAlerts,
  getMonitorStats,
  getThreatTimeline,
  acknowledgeAlert,
  acknowledgeAllAlerts,
} from "@/lib/security-monitor";
import type { AlertSeverity, AlertType } from "@/lib/security-monitor";
import { getIdsStats, getTopThreats, getHoneypotLog, getIdsConfig } from "@/lib/ids";

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const view = searchParams.get("view") || "overview";
  const limit = Math.min(
    Math.max(1, parseInt(searchParams.get("limit") || "50", 10) || 50),
    500
  );

  try {
    switch (view) {
      case "overview": {
        // Combined overview: monitor stats + recent alerts + recent in-memory events + IDS summary
        const [monitorStats, recentAlerts, inMemoryEvents, auditStats, idsStats] =
          await Promise.all([
            Promise.resolve(getMonitorStats()),
            Promise.resolve(getAlerts({ limit: 10 })),
            Promise.resolve(getSecurityEvents(20)),
            getAuditStats(24),
            Promise.resolve(getIdsStats()),
          ]);

        return NextResponse.json({
          monitorStats,
          recentAlerts,
          inMemoryEvents,
          auditStats,
          idsStats: {
            activeProfiles: idsStats.activeProfiles,
            threatsDetected: idsStats.threatsDetected,
            autoBlocked: idsStats.autoBlocked,
            honeypotHits: idsStats.honeypotHits,
            threatsByLevel: idsStats.threatsByLevel,
          },
          timestamp: new Date().toISOString(),
        });
      }

      case "alerts": {
        const severity = searchParams.get("severity") as AlertSeverity | null;
        const type = searchParams.get("type") as AlertType | null;
        const unacknowledgedOnly =
          searchParams.get("unacknowledged") === "true";

        const alertsList = getAlerts({
          limit,
          severity: severity || undefined,
          type: type || undefined,
          unacknowledgedOnly,
        });

        const stats = getMonitorStats();

        return NextResponse.json({
          alerts: alertsList,
          total: alertsList.length,
          stats: {
            totalAlerts: stats.totalAlerts,
            unacknowledged: stats.unacknowledged,
            bySeverity: stats.bySeverity,
          },
          timestamp: new Date().toISOString(),
        });
      }

      case "audit-logs": {
        const type = searchParams.get("type") as AuditEventType | null;
        const severity = searchParams.get("severity") as AuditSeverity | null;
        const userId = searchParams.get("userId");
        const hours = Math.min(
          parseInt(searchParams.get("hours") || "24", 10) || 24,
          720 // max 30 days
        );
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        const logs = await queryAuditLogs({
          limit,
          type: type || undefined,
          severity: severity || undefined,
          userId: userId || undefined,
          since,
        });

        const stats = await getAuditStats(hours);

        return NextResponse.json({
          logs,
          total: logs.length,
          stats,
          timestamp: new Date().toISOString(),
        });
      }

      case "timeline": {
        const hours = Math.min(
          parseInt(searchParams.get("hours") || "24", 10) || 24,
          72
        );

        const timeline = getThreatTimeline(hours);

        return NextResponse.json({
          timeline,
          hours,
          timestamp: new Date().toISOString(),
        });
      }

      case "monitor": {
        const stats = getMonitorStats();
        return NextResponse.json({
          stats,
          timestamp: new Date().toISOString(),
        });
      }

      case "structured-logs": {
        const category = searchParams.get("category") as SecurityCategory | null;
        const level = searchParams.get("level") as AuditSeverity | null;

        const logs = getRecentLogs({
          limit,
          category: category || undefined,
          level: level || undefined,
        });

        return NextResponse.json({
          logs,
          total: logs.length,
          timestamp: new Date().toISOString(),
        });
      }

      case "ids-overview": {
        const idsStats = getIdsStats();
        const topThreats = getTopThreats(limit);
        const honeypotLogs = getHoneypotLog(Math.min(limit, 100));
        const idsConf = getIdsConfig();

        return NextResponse.json({
          stats: idsStats,
          topThreats,
          honeypotLog: honeypotLogs,
          config: idsConf,
          timestamp: new Date().toISOString(),
        });
      }

      default: {
        // Fallback: legacy in-memory events
        const events = getSecurityEvents(limit);
        return NextResponse.json({
          events,
          total: events.length,
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error("[Security API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch security data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/security - Manage security alerts
 *
 * Actions:
 *   { action: "acknowledge", alertId: "..." } - Acknowledge single alert
 *   { action: "acknowledge_all" }             - Acknowledge all alerts
 */
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, alertId } = body;

    switch (action) {
      case "acknowledge": {
        if (!alertId || typeof alertId !== "string") {
          return NextResponse.json(
            { error: "alertId is required" },
            { status: 400 }
          );
        }

        const success = acknowledgeAlert(alertId);
        if (!success) {
          return NextResponse.json(
            { error: "Alert not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({ message: "Alert acknowledged", alertId });
      }

      case "acknowledge_all": {
        const count = acknowledgeAllAlerts();
        return NextResponse.json({
          message: `${count} alerts acknowledged`,
          count,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'acknowledge' or 'acknowledge_all'" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Security API] POST error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
