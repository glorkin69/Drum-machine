"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Eye,
  Users,
  Globe,
  TrendingUp,
  Music,
  UserPlus,
  BarChart3,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface AnalyticsData {
  overview: {
    totalPageviews: number;
    uniqueVisitors: number;
    todayPageviews: number;
    todayUniqueVisitors: number;
  };
  dailyTrend: Array<{
    date: string;
    pageviews: number;
    uniqueVisitors: number;
  }>;
  topPages: Array<{
    path: string;
    views: number;
  }>;
  topCountries: Array<{
    country: string;
    visitors: number;
  }>;
  registrations: Array<{
    date: string;
    count: number;
  }>;
  patternStats: {
    totalPatterns: number;
    totalSongs: number;
    patternsToday: number;
    topGenres: Array<{ genre: string; count: number }>;
  };
}

const PERIOD_OPTIONS = [
  { label: "7D", value: 7 },
  { label: "14D", value: 14 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
];

// Mini bar chart (pure CSS, no dependencies)
function MiniBarChart({
  data,
  maxVal,
  color = "#E8732A",
  height = 80,
}: {
  data: number[];
  maxVal: number;
  color?: string;
  height?: number;
}) {
  const safeMax = maxVal || 1;
  // Show last 14 bars max for readability
  const displayData = data.slice(-14);

  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {displayData.map((val, i) => {
        const barHeight = Math.max(2, (val / safeMax) * height);
        return (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-all duration-200 min-w-[4px]"
            style={{
              height: barHeight,
              backgroundColor: color,
              opacity: val > 0 ? 0.6 + (val / safeMax) * 0.4 : 0.15,
            }}
            title={`${val}`}
          />
        );
      })}
    </div>
  );
}

// Sparkline component (pure CSS)
function Sparkline({
  data,
  color = "#E8732A",
  height = 40,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Country flag emoji from country code
function countryFlag(code: string): string {
  if (!code || code === "Unknown" || code.length !== 2) return "🌍";
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

// Page name display
function pageName(path: string): string {
  if (path === "/") return "Landing Page";
  if (path === "/dashboard") return "Drum Machine";
  if (path === "/login") return "Login";
  if (path === "/register") return "Register";
  if (path === "/admin") return "Admin Console";
  if (path === "/forgot-password") return "Forgot Password";
  if (path === "/reset-password") return "Reset Password";
  return path;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = useCallback(
    async (showRefreshToast = false) => {
      if (showRefreshToast) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const res = await fetch(`/api/admin/analytics?days=${days}`);
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const result: AnalyticsData = await res.json();
        setData(result);
        if (showRefreshToast) toast.success("Analytics refreshed");
      } catch {
        toast.error("Failed to load analytics data");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [days]
  );

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#E8732A] mx-auto mb-3" />
          <p className="text-[#A08060] font-mono text-xs tracking-wider">
            LOADING ANALYTICS...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-[#A08060] font-mono text-sm">
          Failed to load analytics data.
        </p>
        <Button
          onClick={() => fetchAnalytics()}
          className="vintage-button text-[#F5E6D3] font-mono text-xs mt-4"
        >
          RETRY
        </Button>
      </div>
    );
  }

  const maxDailyPageviews = Math.max(...data.dailyTrend.map((d) => d.pageviews), 1);
  const totalRecentRegistrations = data.registrations.reduce(
    (sum, r) => sum + r.count,
    0
  );

  return (
    <div className="space-y-4">
      {/* Period Selector + Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-[#A08060] mr-1" />
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-2.5 py-1 rounded font-mono text-[0.65rem] tracking-wider transition-colors ${
                days === opt.value
                  ? "bg-[#E8732A]/20 text-[#E8732A] border border-[#E8732A]/30"
                  : "text-[#A08060] hover:bg-[#3D2B1F] border border-transparent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Button
          onClick={() => fetchAnalytics(true)}
          disabled={isRefreshing}
          className="vintage-button text-[#F5E6D3] font-mono text-[0.6rem] tracking-wider h-7 px-3"
        >
          {isRefreshing ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <RefreshCw className="w-3 h-3 mr-1" />
          )}
          REFRESH
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <OverviewCard
          icon={<Eye className="w-4 h-4 text-[#E8732A]" />}
          label="Total Views"
          value={data.overview.totalPageviews}
          sublabel={`${data.overview.todayPageviews} today`}
          accentColor="#E8732A"
        />
        <OverviewCard
          icon={<Users className="w-4 h-4 text-[#2980B9]" />}
          label="Unique Visitors"
          value={data.overview.uniqueVisitors}
          sublabel={`${data.overview.todayUniqueVisitors} today`}
          accentColor="#2980B9"
        />
        <OverviewCard
          icon={<Music className="w-4 h-4 text-[#27AE60]" />}
          label="Total Patterns"
          value={data.patternStats.totalPatterns}
          sublabel={`${data.patternStats.patternsToday} today`}
          accentColor="#27AE60"
        />
        <OverviewCard
          icon={<UserPlus className="w-4 h-4 text-[#F39C12]" />}
          label="New Users"
          value={totalRecentRegistrations}
          sublabel={`Last ${days} days`}
          accentColor="#F39C12"
        />
      </div>

      {/* Visitor Trend Chart */}
      <div className="vintage-panel rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#E8732A]" />
          <h3 className="font-mono text-[#D4A574] text-xs tracking-wider uppercase">
            Visitor Trend ({days}D)
          </h3>
        </div>
        <div className="space-y-2">
          <MiniBarChart
            data={data.dailyTrend.map((d) => d.pageviews)}
            maxVal={maxDailyPageviews}
            color="#E8732A"
            height={100}
          />
          <div className="flex items-center justify-between text-[0.6rem] font-mono text-[#A08060]">
            <span>
              {data.dailyTrend.length > 0
                ? formatDate(data.dailyTrend[0].date)
                : ""}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span
                  className="inline-block w-2 h-2 rounded-sm"
                  style={{ backgroundColor: "#E8732A" }}
                />
                Pageviews
              </span>
            </div>
            <span>
              {data.dailyTrend.length > 0
                ? formatDate(data.dailyTrend[data.dailyTrend.length - 1].date)
                : ""}
            </span>
          </div>
        </div>

        {/* Unique Visitors Sparkline */}
        <div className="mt-4 pt-3 border-t border-[#4A3728]/50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[0.6rem] text-[#A08060] tracking-wider uppercase">
              Unique Visitors
            </span>
            <span className="font-mono text-xs text-[#2980B9]">
              {data.overview.uniqueVisitors} total
            </span>
          </div>
          <Sparkline
            data={data.dailyTrend.map((d) => d.uniqueVisitors)}
            color="#2980B9"
            height={40}
          />
        </div>
      </div>

      {/* Two Column Layout: Top Pages + Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Pages */}
        <div className="vintage-panel rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-[#D4A574]" />
            <h3 className="font-mono text-[#D4A574] text-xs tracking-wider uppercase">
              Top Pages
            </h3>
          </div>
          {data.topPages.length === 0 ? (
            <p className="text-[#A08060] font-mono text-xs text-center py-4">
              No page data yet
            </p>
          ) : (
            <div className="space-y-2">
              {data.topPages.map((page, i) => {
                const maxViews = data.topPages[0]?.views || 1;
                const pct = (page.views / maxViews) * 100;
                return (
                  <div key={page.path} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#F5E6D3] truncate max-w-[60%]">
                        <span className="text-[#A08060] mr-1.5">
                          {i + 1}.
                        </span>
                        {pageName(page.path)}
                      </span>
                      <span className="font-mono text-xs text-[#D4A574]">
                        {page.views.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#0A0A0A] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: "#E8732A",
                          opacity: 0.5 + (pct / 100) * 0.5,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Countries */}
        <div className="vintage-panel rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-[#27AE60]" />
            <h3 className="font-mono text-[#D4A574] text-xs tracking-wider uppercase">
              Top Countries
            </h3>
          </div>
          {data.topCountries.length === 0 ? (
            <p className="text-[#A08060] font-mono text-xs text-center py-4">
              No country data yet.
              <br />
              <span className="text-[0.6rem]">
                Country detection requires hosting with geo-IP headers.
              </span>
            </p>
          ) : (
            <div className="space-y-3">
              {data.topCountries.map((country, i) => {
                const maxVisitors = data.topCountries[0]?.visitors || 1;
                const pct = (country.visitors / maxVisitors) * 100;
                return (
                  <div key={country.country} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#F5E6D3] flex items-center gap-2">
                        <span className="text-base">
                          {countryFlag(country.country)}
                        </span>
                        {country.country}
                      </span>
                      <span className="font-mono text-xs text-[#D4A574]">
                        {country.visitors.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#0A0A0A] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: "#27AE60",
                          opacity: 0.5 + (pct / 100) * 0.5,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* User Registrations + Pattern Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Registrations Trend */}
        <div className="vintage-panel rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="w-4 h-4 text-[#F39C12]" />
            <h3 className="font-mono text-[#D4A574] text-xs tracking-wider uppercase">
              User Registrations ({days}D)
            </h3>
          </div>
          <div className="mb-2">
            <span className="font-mono text-2xl text-[#F5E6D3]">
              {totalRecentRegistrations}
            </span>
            <span className="font-mono text-xs text-[#A08060] ml-2">
              new users
            </span>
          </div>
          <Sparkline
            data={data.registrations.map((r) => r.count)}
            color="#F39C12"
            height={50}
          />
        </div>

        {/* Pattern Creation Stats */}
        <div className="vintage-panel rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Music className="w-4 h-4 text-[#27AE60]" />
            <h3 className="font-mono text-[#D4A574] text-xs tracking-wider uppercase">
              Content Stats
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <p className="font-mono text-lg text-[#F5E6D3]">
                {data.patternStats.totalPatterns}
              </p>
              <p className="font-mono text-[0.6rem] text-[#A08060] uppercase tracking-wider">
                Patterns
              </p>
            </div>
            <div>
              <p className="font-mono text-lg text-[#F5E6D3]">
                {data.patternStats.totalSongs}
              </p>
              <p className="font-mono text-[0.6rem] text-[#A08060] uppercase tracking-wider">
                Songs
              </p>
            </div>
            <div>
              <p className="font-mono text-lg text-[#F5E6D3]">
                {data.patternStats.patternsToday}
              </p>
              <p className="font-mono text-[0.6rem] text-[#A08060] uppercase tracking-wider">
                Today
              </p>
            </div>
          </div>
          {data.patternStats.topGenres.length > 0 && (
            <div className="pt-3 border-t border-[#4A3728]/50">
              <p className="font-mono text-[0.6rem] text-[#A08060] uppercase tracking-wider mb-2">
                Top Genres
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.patternStats.topGenres.map((g) => (
                  <span
                    key={g.genre}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3D2B1F] border border-[#4A3728]/50 font-mono text-[0.6rem] text-[#D4A574]"
                  >
                    {g.genre}
                    <span className="text-[#A08060]">{g.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewCard({
  icon,
  label,
  value,
  sublabel,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sublabel: string;
  accentColor: string;
}) {
  return (
    <div className="vintage-panel rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          {icon}
        </div>
      </div>
      <p className="font-mono text-xl text-[#F5E6D3]">
        {value.toLocaleString()}
      </p>
      <p className="text-[#A08060] font-mono text-[0.6rem] uppercase tracking-[0.15em]">
        {label}
      </p>
      <p className="text-[#A08060] font-mono text-[0.55rem] mt-0.5 opacity-70">
        {sublabel}
      </p>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
