import { prisma } from "@/lib/prisma";

export interface AnalyticsData {
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

export async function getAnalyticsData(days: number = 30): Promise<AnalyticsData> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Run all queries in parallel
  const [
    totalPageviews,
    uniqueVisitorsResult,
    todayPageviews,
    todayUniqueResult,
    dailyPageviews,
    dailyUnique,
    topPages,
    topCountries,
    registrations,
    totalPatterns,
    totalSongs,
    patternsToday,
    topGenres,
  ] = await Promise.all([
    // Total pageviews in period
    prisma.pageView.count({
      where: { createdAt: { gte: startDate } },
    }),

    // Unique visitors (by sessionId) in period
    prisma.pageView.groupBy({
      by: ["sessionId"],
      where: {
        createdAt: { gte: startDate },
        sessionId: { not: null },
      },
    }),

    // Today's pageviews
    prisma.pageView.count({
      where: { createdAt: { gte: todayStart } },
    }),

    // Today's unique visitors
    prisma.pageView.groupBy({
      by: ["sessionId"],
      where: {
        createdAt: { gte: todayStart },
        sessionId: { not: null },
      },
    }),

    // Daily pageview counts (raw query for date grouping)
    prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE(\"createdAt\") as date, COUNT(*)::bigint as count
      FROM "PageView"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,

    // Daily unique visitors
    prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(DISTINCT "sessionId")::bigint as count
      FROM "PageView"
      WHERE "createdAt" >= ${startDate} AND "sessionId" IS NOT NULL
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,

    // Top pages
    prisma.$queryRaw<Array<{ path: string; count: bigint }>>`
      SELECT "path", COUNT(*)::bigint as count
      FROM "PageView"
      WHERE "createdAt" >= ${startDate}
      GROUP BY "path"
      ORDER BY count DESC
      LIMIT 10
    `,

    // Top countries
    prisma.$queryRaw<Array<{ country: string; count: bigint }>>`
      SELECT COALESCE("country", 'Unknown') as country, COUNT(DISTINCT "sessionId")::bigint as count
      FROM "PageView"
      WHERE "createdAt" >= ${startDate} AND "sessionId" IS NOT NULL
      GROUP BY "country"
      ORDER BY count DESC
      LIMIT 5
    `,

    // User registrations over time
    prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
      FROM "User"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,

    // Total patterns
    prisma.savedPattern.count(),

    // Total songs
    prisma.savedSong.count(),

    // Patterns created today
    prisma.savedPattern.count({
      where: { createdAt: { gte: todayStart } },
    }),

    // Top genres
    prisma.$queryRaw<Array<{ genre: string; count: bigint }>>`
      SELECT "genre", COUNT(*)::bigint as count
      FROM "SavedPattern"
      GROUP BY "genre"
      ORDER BY count DESC
      LIMIT 7
    `,
  ]);

  // Merge daily pageviews and unique visitors into a single trend array
  const dailyMap = new Map<string, { pageviews: number; uniqueVisitors: number }>();

  // Fill all dates in range
  for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split("T")[0];
    dailyMap.set(key, { pageviews: 0, uniqueVisitors: 0 });
  }

  for (const row of dailyPageviews) {
    const key = new Date(row.date).toISOString().split("T")[0];
    const entry = dailyMap.get(key);
    if (entry) entry.pageviews = Number(row.count);
  }

  for (const row of dailyUnique) {
    const key = new Date(row.date).toISOString().split("T")[0];
    const entry = dailyMap.get(key);
    if (entry) entry.uniqueVisitors = Number(row.count);
  }

  const dailyTrend = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    ...data,
  }));

  // Fill registration dates
  const regMap = new Map<string, number>();
  for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
    regMap.set(d.toISOString().split("T")[0], 0);
  }
  for (const row of registrations) {
    const key = new Date(row.date).toISOString().split("T")[0];
    regMap.set(key, Number(row.count));
  }

  return {
    overview: {
      totalPageviews,
      uniqueVisitors: uniqueVisitorsResult.length,
      todayPageviews,
      todayUniqueVisitors: todayUniqueResult.length,
    },
    dailyTrend,
    topPages: topPages.map((r) => ({ path: r.path, views: Number(r.count) })),
    topCountries: topCountries.map((r) => ({
      country: r.country,
      visitors: Number(r.count),
    })),
    registrations: Array.from(regMap.entries()).map(([date, count]) => ({
      date,
      count,
    })),
    patternStats: {
      totalPatterns,
      totalSongs,
      patternsToday,
      topGenres: topGenres.map((r) => ({
        genre: r.genre,
        count: Number(r.count),
      })),
    },
  };
}
