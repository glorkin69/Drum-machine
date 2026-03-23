/**
 * WAF & IDS Admin API - View WAF/IDS stats, events, manage IP lists, update configuration
 * Admin-only access
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  getWafEvents,
  getWafStats,
  getWafConfig,
  updateWafConfig,
  type WafRuleCategory,
} from "@/lib/waf";
import {
  getIdsConfig,
  updateIdsConfig,
  getIdsStats,
  getTopThreats,
  getThreatScore,
  getHoneypotLog,
  getIpAllowlist,
  getIpBlocklist,
  addToAllowlist,
  removeFromAllowlist,
  addToBlocklist,
  removeFromBlocklist,
} from "@/lib/ids";

/**
 * GET /api/admin/waf - Get WAF/IDS statistics, events, and configuration
 *
 * Views:
 *   ?view=stats (default)  - WAF stats + config
 *   ?view=events           - WAF events
 *   ?view=config           - WAF + IDS config
 *   ?view=ids              - IDS stats, threats, honeypot log
 *   ?view=ip-lists         - IP allowlist/blocklist
 *   ?view=threat&ip=x.x.x  - Threat score for specific IP
 */
export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const view = searchParams.get("view") || "stats";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const category = searchParams.get("category") as WafRuleCategory | null;

  if (view === "events") {
    const events = getWafEvents(limit, category || undefined);
    return NextResponse.json({ events });
  }

  if (view === "config") {
    const wafConfig = getWafConfig();
    const idsConfigData = getIdsConfig();
    return NextResponse.json({ wafConfig, idsConfig: idsConfigData });
  }

  if (view === "ids") {
    const idsStats = getIdsStats();
    const topThreats = getTopThreats(limit);
    const honeypotLogs = getHoneypotLog(limit);
    const idsConfigData = getIdsConfig();

    return NextResponse.json({
      stats: idsStats,
      topThreats,
      honeypotLog: honeypotLogs,
      config: idsConfigData,
      timestamp: new Date().toISOString(),
    });
  }

  if (view === "ip-lists") {
    const allowlist = getIpAllowlist();
    const blocklist = getIpBlocklist();

    return NextResponse.json({
      allowlist,
      blocklist,
      timestamp: new Date().toISOString(),
    });
  }

  if (view === "threat") {
    const ip = searchParams.get("ip");
    if (!ip) {
      return NextResponse.json(
        { error: "IP address is required" },
        { status: 400 }
      );
    }
    const threat = getThreatScore(ip);
    return NextResponse.json({
      ip,
      threat: threat || { ip, score: 0, level: "none", factors: [], firstSeen: 0, lastSeen: 0, requestCount: 0 },
      timestamp: new Date().toISOString(),
    });
  }

  // Default: stats overview (includes IDS summary)
  const stats = getWafStats();
  const wafConfig = getWafConfig();
  const idsStats = getIdsStats();

  return NextResponse.json({
    stats,
    config: {
      enabled: wafConfig.enabled,
      logOnly: wafConfig.logOnly,
      botProtection: wafConfig.botProtection,
      globalRateLimit: wafConfig.globalRateLimit,
      apiRateLimit: wafConfig.apiRateLimit,
    },
    ids: {
      enabled: getIdsConfig().enabled,
      activeThreats: idsStats.threatsDetected,
      autoBlocked: idsStats.autoBlocked,
      honeypotHits: idsStats.honeypotHits,
    },
  });
}

/**
 * PATCH /api/admin/waf - Update WAF or IDS configuration
 */
export async function PATCH(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const target = body._target || "waf"; // "waf" or "ids"

    if (target === "ids") {
      // Update IDS configuration
      const allowedIdsFields = [
        "enabled",
        "autoBlockThreshold",
        "autoBlockDurationMs",
        "honeypotEnabled",
        "behaviorAnalysisEnabled",
        "requestRateThreshold",
        "geoBlockEnabled",
        "blockedCountries",
      ];

      const idsUpdates: Record<string, unknown> = {};
      for (const field of allowedIdsFields) {
        if (field in body) {
          idsUpdates[field] = body[field];
        }
      }

      if (Object.keys(idsUpdates).length === 0) {
        return NextResponse.json(
          { error: "No valid IDS configuration fields provided" },
          { status: 400 }
        );
      }

      // Validate IDS values
      if ("autoBlockThreshold" in idsUpdates) {
        const val = Number(idsUpdates.autoBlockThreshold);
        if (isNaN(val) || val < 10 || val > 100) {
          return NextResponse.json(
            { error: "autoBlockThreshold must be between 10 and 100" },
            { status: 400 }
          );
        }
        idsUpdates.autoBlockThreshold = val;
      }

      if ("requestRateThreshold" in idsUpdates) {
        const val = Number(idsUpdates.requestRateThreshold);
        if (isNaN(val) || val < 10 || val > 10000) {
          return NextResponse.json(
            { error: "requestRateThreshold must be between 10 and 10000" },
            { status: 400 }
          );
        }
        idsUpdates.requestRateThreshold = val;
      }

      if ("blockedCountries" in idsUpdates) {
        if (!Array.isArray(idsUpdates.blockedCountries)) {
          return NextResponse.json(
            { error: "blockedCountries must be an array" },
            { status: 400 }
          );
        }
        idsUpdates.blockedCountries = (idsUpdates.blockedCountries as string[])
          .map((c: string) => String(c).toUpperCase().substring(0, 2))
          .filter((c: string) => /^[A-Z]{2}$/.test(c));
      }

      updateIdsConfig(idsUpdates as Parameters<typeof updateIdsConfig>[0]);

      console.log(
        `[IDS] Configuration updated by admin ${session.user?.email}:`,
        JSON.stringify(idsUpdates)
      );

      return NextResponse.json({
        message: "IDS configuration updated",
        config: getIdsConfig(),
      });
    }

    // Default: update WAF configuration
    const allowedFields = [
      "enabled",
      "logOnly",
      "botProtection",
      "globalRateLimit",
      "apiRateLimit",
      "globalRateLimitWindowMs",
      "apiRateLimitWindowMs",
      "maxBodySize",
      "maxUrlLength",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid configuration fields provided" },
        { status: 400 }
      );
    }

    // Validate values
    if ("globalRateLimit" in updates) {
      const val = Number(updates.globalRateLimit);
      if (isNaN(val) || val < 10 || val > 10000) {
        return NextResponse.json(
          { error: "globalRateLimit must be between 10 and 10000" },
          { status: 400 }
        );
      }
      updates.globalRateLimit = val;
    }

    if ("apiRateLimit" in updates) {
      const val = Number(updates.apiRateLimit);
      if (isNaN(val) || val < 10 || val > 5000) {
        return NextResponse.json(
          { error: "apiRateLimit must be between 10 and 5000" },
          { status: 400 }
        );
      }
      updates.apiRateLimit = val;
    }

    updateWafConfig(updates as Parameters<typeof updateWafConfig>[0]);

    const newConfig = getWafConfig();

    console.log(
      `[WAF] Configuration updated by admin ${session.user?.email}:`,
      JSON.stringify(updates)
    );

    return NextResponse.json({
      message: "WAF configuration updated",
      config: newConfig,
    });
  } catch (error) {
    console.error("[WAF] Config update error:", error);
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/waf - Manage IP allowlist/blocklist
 *
 * Actions:
 *   { action: "add_allowlist", ip: "x.x.x.x" }
 *   { action: "remove_allowlist", ip: "x.x.x.x" }
 *   { action: "add_blocklist", ip: "x.x.x.x", reason: "...", durationMs?: number }
 *   { action: "remove_blocklist", ip: "x.x.x.x" }
 */
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, ip, reason, durationMs } = body;

    if (!action || typeof action !== "string") {
      return NextResponse.json(
        { error: "action is required" },
        { status: 400 }
      );
    }

    // Validate IP format (basic)
    if (["add_allowlist", "remove_allowlist", "add_blocklist", "remove_blocklist"].includes(action)) {
      if (!ip || typeof ip !== "string" || ip.length > 45) {
        return NextResponse.json(
          { error: "Valid IP address is required" },
          { status: 400 }
        );
      }

      // Basic IP format validation
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      const ipv6Regex = /^[0-9a-fA-F:]+$/;
      if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
        return NextResponse.json(
          { error: "Invalid IP address format" },
          { status: 400 }
        );
      }
    }

    switch (action) {
      case "add_allowlist": {
        addToAllowlist(ip);
        console.log(`[WAF] IP ${ip} added to allowlist by admin ${session.user?.email}`);
        return NextResponse.json({
          message: `IP ${ip} added to allowlist`,
          allowlist: getIpAllowlist(),
        });
      }

      case "remove_allowlist": {
        removeFromAllowlist(ip);
        console.log(`[WAF] IP ${ip} removed from allowlist by admin ${session.user?.email}`);
        return NextResponse.json({
          message: `IP ${ip} removed from allowlist`,
          allowlist: getIpAllowlist(),
        });
      }

      case "add_blocklist": {
        const blockReason = typeof reason === "string" ? reason.substring(0, 200) : "Manually blocked by admin";
        const blockDuration = typeof durationMs === "number" && durationMs > 0 ? durationMs : null;
        addToBlocklist(ip, blockReason, blockDuration);
        console.log(`[WAF] IP ${ip} added to blocklist by admin ${session.user?.email}: ${blockReason}`);
        return NextResponse.json({
          message: `IP ${ip} added to blocklist`,
          blocklist: getIpBlocklist(),
        });
      }

      case "remove_blocklist": {
        removeFromBlocklist(ip);
        console.log(`[WAF] IP ${ip} removed from blocklist by admin ${session.user?.email}`);
        return NextResponse.json({
          message: `IP ${ip} removed from blocklist`,
          blocklist: getIpBlocklist(),
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: add_allowlist, remove_allowlist, add_blocklist, remove_blocklist" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[WAF] IP list management error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
