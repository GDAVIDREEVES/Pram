import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { scrapeWriggleClasses } from "./scraper";
import { queryFreshEvents, upsertEvents, type EventRow } from "./db";

interface ClassCache {
  classes: unknown[];
  lastFetchedAt: number;
}

let classCache: ClassCache | null = null;
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

function toEventId(name: string): string {
  return 'wriggle_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function locationToEventRow(loc: any): EventRow {
  return {
    id: toEventId(loc.name),
    name: loc.name,
    provider: loc.classInfo.provider,
    venue: loc.classInfo.venue,
    address: loc.address,
    latitude: loc.latitude,
    longitude: loc.longitude,
    rating: loc.rating,
    checkins: loc.checkins,
    categories: loc.amenities ?? [],
    days_of_week: loc.classInfo.daysOfWeek,
    age_range: loc.classInfo.ageRange,
    age_min_months: loc.classInfo.ageMinMonths,
    age_max_months: loc.classInfo.ageMaxMonths,
    description: loc.classInfo.description,
    source_url: loc.classInfo.sourceUrl,
    source_page: loc.classInfo.sourcePage ?? '',
    last_synced_at: loc.classInfo.lastSyncedAt,
  };
}

function eventRowToLocation(row: EventRow): unknown {
  return {
    id: row.id,
    name: row.name,
    type: 'class',
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    rating: row.rating,
    checkins: row.checkins,
    kidFriendly: true,
    amenities: row.categories,
    classInfo: {
      provider: row.provider,
      venue: row.venue,
      category: row.categories[0] ?? 'other',
      ageRange: row.age_range,
      ageMinMonths: row.age_min_months,
      ageMaxMonths: row.age_max_months,
      daysOfWeek: row.days_of_week,
      description: row.description,
      sourceUrl: row.source_url,
      lastSyncedAt: row.last_synced_at,
    },
  };
}

async function getClasses(): Promise<unknown[]> {
  const now = Date.now();

  // 1. In-memory cache (fast path within the same process)
  if (classCache && now - classCache.lastFetchedAt < SIX_HOURS_MS) {
    return classCache.classes;
  }

  // 2. Database — return if a fresh batch exists
  const dbRows = await queryFreshEvents(SIX_HOURS_MS);
  if (dbRows && dbRows.length > 0) {
    console.log(`[classes] Serving ${dbRows.length} events from DB`);
    const classes = dbRows.map(eventRowToLocation);
    classCache = { classes, lastFetchedAt: now };
    return classes;
  }

  // 3. Cold cache: scrape, persist, return
  console.log('[classes] Cache cold — scraping...');
  try {
    const scraped = await scrapeWriggleClasses();
    await upsertEvents(scraped.map(locationToEventRow));
    classCache = { classes: scraped, lastFetchedAt: now };
    return scraped;
  } catch (err) {
    console.error('[classes] Scrape failed:', err);
    return classCache?.classes ?? [];
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/gifs/search", async (req, res) => {
    const apiKey = process.env.GIPHY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GIPHY API key not configured" });
    }
    const q = req.query.q as string;
    const offset = req.query.offset || "0";
    const limit = req.query.limit || "20";
    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }
    try {
      const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}&rating=g&lang=en`;
      const response = await fetch(url);
      const data = await response.json();
      const gifs = (data.data || []).map((g: any) => ({
        id: g.id,
        title: g.title,
        previewUrl: g.images?.fixed_height_small?.url || g.images?.fixed_height?.url,
        url: g.images?.fixed_height?.url,
        width: parseInt(g.images?.fixed_height?.width || "200"),
        height: parseInt(g.images?.fixed_height?.height || "200"),
      }));
      res.json({ gifs });
    } catch (err) {
      console.error("GIPHY search error:", err);
      res.status(500).json({ error: "Failed to search GIFs" });
    }
  });

  app.get("/api/gifs/trending", async (req, res) => {
    const apiKey = process.env.GIPHY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GIPHY API key not configured" });
    }
    const limit = req.query.limit || "20";
    try {
      const url = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=${limit}&rating=g`;
      const response = await fetch(url);
      const data = await response.json();
      const gifs = (data.data || []).map((g: any) => ({
        id: g.id,
        title: g.title,
        previewUrl: g.images?.fixed_height_small?.url || g.images?.fixed_height?.url,
        url: g.images?.fixed_height?.url,
        width: parseInt(g.images?.fixed_height?.width || "200"),
        height: parseInt(g.images?.fixed_height?.height || "200"),
      }));
      res.json({ gifs });
    } catch (err) {
      console.error("GIPHY trending error:", err);
      res.status(500).json({ error: "Failed to get trending GIFs" });
    }
  });

  // Classes endpoints
  app.get("/api/classes", async (_req, res) => {
    try {
      const classes = await getClasses();
      res.json({ classes, count: classes.length, cachedAt: classCache?.lastFetchedAt });
    } catch (err) {
      console.error("Classes fetch error:", err);
      res.status(500).json({ error: "Failed to fetch classes" });
    }
  });

  app.post("/api/classes/sync", async (_req, res) => {
    try {
      classCache = null; // Force re-scrape + re-persist
      const classes = await getClasses();
      res.json({ classes, count: classes.length, syncedAt: classCache?.lastFetchedAt });
    } catch (err) {
      console.error("Classes sync error:", err);
      res.status(500).json({ error: "Failed to sync classes" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
